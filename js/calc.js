// PackFlow Simple - costing, GST, dates, formatting. Plain JavaScript (no modules, no build).
(function () {
// Box costing & helpers. Pure functions (no browser needed) so they can be tested.
const TAKEUP = { B: 1.32, C: 1.43, E: 1.25 };

// Ready-made paper recipes so the user never has to know GSM numbers. "Advanced" lets them change it.
const QUALITIES = {
  std3: { label: 'Standard (3 layers) - light goods', layers: 3, recipe: [
    { kind: 'Liner', gsm: 150, take: 1 }, { kind: 'Fluting', gsm: 120, take: TAKEUP.B, flute: 'B' }, { kind: 'Liner', gsm: 150, take: 1 }] },
  strong5: { label: 'Strong (5 layers) - heavy goods', layers: 5, recipe: [
    { kind: 'Liner', gsm: 180, take: 1 }, { kind: 'Fluting', gsm: 120, take: TAKEUP.B, flute: 'B' }, { kind: 'Liner', gsm: 120, take: 1 },
    { kind: 'Fluting', gsm: 120, take: TAKEUP.C, flute: 'C' }, { kind: 'Liner', gsm: 150, take: 1 }] }
};

const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;

function sheetSize(L, W, H, glue = 45, trim = 20) {
  return { sheetL: 2 * (num(L) + num(W)) + num(glue), sheetW: num(W) + num(H) + num(trim) };
}

// Which paper-roll width wastes the least? Sheets are cut side by side across the roll.
function bestDeckle(sheetW, deckles) {
  let best = null;
  for (const d of deckles.map(num).filter(x => x > 0)) {
    const ups = Math.floor(d / sheetW);
    if (ups < 1) continue;
    const trimMm = d - ups * sheetW;
    const trimPct = (trimMm / d) * 100;
    if (!best || trimPct < best.trimPct) best = { deckle: d, ups, trimMm, trimPct: round2(trimPct) };
  }
  return best; // null = sheet wider than every available roll
}

function paperPerBox(recipe, areaSqM) {
  return recipe.map(r => ({ ...r, kgPerBox: (areaSqM * r.gsm * r.take) / 1000 }));
}

function costBox(i) {
  const { sheetL, sheetW } = sheetSize(i.length, i.width, i.height, i.glue, i.trim);
  const areaSqM = (sheetL * sheetW) / 1e6;
  const layers = paperPerBox(i.recipe, areaSqM);
  const rawKg = layers.reduce((s, l) => s + l.kgPerBox, 0);
  const deckle = bestDeckle(sheetW, i.deckles || []);
  const trimLoss = deckle ? deckle.trimPct / 100 : 0;
  const kgWithWaste = (rawKg / (1 - trimLoss)) * (1 + num(i.wastagePct) / 100);
  const paperCost = kgWithWaste * num(i.paperRate);
  const printCost = num(i.colours) * num(i.printRatePerColour);
  const oneTime = num(i.oneTimeCost);
  const qty = Math.max(1, num(i.quantity));
  const cost = paperCost + num(i.conversionCost) + printCost + num(i.transportPerBox) + oneTime / qty;
  const margin = Math.min(90, Math.max(0, num(i.marginPct)));
  const unitPrice = round2(cost / (1 - margin / 100));
  const taxable = round2(unitPrice * qty);
  const realMargin = unitPrice > 0 ? round2(((unitPrice - cost) / unitPrice) * 100) : 0;
  return {
    sheetL, sheetW, areaSqM: round2(areaSqM * 1000) / 1000, layers, rawKg, kgPerBox: kgWithWaste,
    deckle, paperCost: round2(paperCost), cost: round2(cost), unitPrice, taxable,
    profit: round2((unitPrice - cost) * qty), realMargin, totalPaperKg: kgWithWaste * qty,
    tooWide: !deckle && (i.deckles || []).length > 0
  };
}

function gstSplit(taxable, ratePct, interState) {
  const tax = round2((taxable * num(ratePct)) / 100);
  if (interState) return { cgst: 0, sgst: 0, igst: tax, tax, total: round2(taxable + tax) };
  const half = round2(tax / 2);
  return { cgst: half, sgst: round2(tax - half), igst: 0, tax, total: round2(taxable + tax) };
}

// Indian financial year starts 1 April: 2026-10-31 -> "2026-27"
function financialYear(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear(), start = d.getMonth() >= 3 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addDays = (dateStr, n) => { const d = new Date(dateStr + 'T00:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = n => '₹' + inr.format(Math.round(num(n)));
const money2 = n => '₹' + inr2.format(num(n));
const qtyFmt = n => inr.format(Math.round(num(n)));
const dateFmt = s => { if (!s) return '-'; const d = new Date(s + (s.length === 10 ? 'T00:00:00' : '')); return isNaN(d) ? s : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// First two digits of a GSTIN = state code. Different state = IGST.
const stateOfGstin = g => (g && /^\d{2}/.test(g) ? g.slice(0, 2) : '');
const validGstin = g => !g || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g.toUpperCase());

// Number to words (Indian system) for invoices
function rupeesInWords(n) {
  n = Math.round(num(n));
  if (n === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = x => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''));
  const three = x => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '') : two(x));
  const parts = []; const cr = Math.floor(n / 1e7); n %= 1e7; const la = Math.floor(n / 1e5); n %= 1e5; const th = Math.floor(n / 1e3); n %= 1e3;
  if (cr) parts.push(three(cr) + ' Crore'); if (la) parts.push(two(la) + ' Lakh'); if (th) parts.push(two(th) + ' Thousand'); if (n) parts.push(three(n));
  return parts.join(' ') + ' Rupees Only';
}

window.Calc = { TAKEUP, QUALITIES, num, round2, sheetSize, bestDeckle, paperPerBox, costBox, gstSplit, financialYear, todayStr, addDays, daysBetween, money, money2, qtyFmt, dateFmt, esc, stateOfGstin, validGstin, rupeesInWords };
})();
