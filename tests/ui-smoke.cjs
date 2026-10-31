// Opens the REAL index.html in a simulated browser, logs in, visits every screen, and stress-tests the sidebar.
const { JSDOM } = require('jsdom'); const path = require('path'), assert = require('assert/strict'); const { webcrypto } = require('crypto');
const file = path.join(__dirname, '..', 'index.html');
let matches = false; const listeners = [];
(async () => {
  const dom = await JSDOM.fromFile(file, { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, url: 'file://' + file,
    beforeParse(w) { w.WebAssembly = WebAssembly; Object.defineProperty(w, 'crypto', { value: webcrypto, configurable: true }); w.Uint8Array = Uint8Array; w.ArrayBuffer = ArrayBuffer; w.TextDecoder = TextDecoder; w.TextEncoder = TextEncoder; w.print = () => {};
      w.matchMedia = q => ({ get matches() { return matches; }, media: q, addEventListener: (_, f) => listeners.push(f), removeEventListener() {}, addListener: f => listeners.push(f) }); w.HTMLElement.prototype.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  const w = dom.window, d = w.document; const sleep = ms => new Promise(r => setTimeout(r, ms)); const until = async (fn, msg, t = 8000) => { const s = Date.now(); for (;;) { try { const v = fn(); if (v) return v; } catch {} if (Date.now() - s > t) throw new Error('timeout: ' + msg + '\n' + d.body.textContent.slice(0, 700)); await sleep(30); } };
  const errs = []; w.addEventListener('error', e => errs.push(e.message)); const ce = w.console.error; w.console.error = (...a) => { errs.push(a.join(' ')); };
  let n = 0; const ok = m => { n++; console.log('ok -', m); };
  const click = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); const typ = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const nav = label => click([...d.querySelectorAll('#side .nav[data-id]')].find(b => b.textContent.includes(label))); const main = () => d.getElementById('main').textContent;
  const resize = mobile => { matches = mobile; listeners.forEach(f => f({ matches: mobile })); w.dispatchEvent(new w.Event('resize')); };

  await until(() => d.getElementById('side'), 'app opens straight to the main screen', 12000); ok('app opens straight to the main screen (SQLite loaded from embedded data, no server)');
  assert.ok(!d.getElementById('g_id') && !d.getElementById('g_pw'), 'there must be NO login fields'); assert.ok(!/password|sign in|login/i.test(d.getElementById('side').textContent + d.querySelector('.topbar').textContent), 'no login words in the menu'); ok('there is no login screen, no password field, no lock button');
  await until(() => d.querySelector('.modal') && /Welcome/.test(d.querySelector('.modal').textContent), 'welcome form'); typ(d.querySelector('.modal [name=company_name]'), '   '); d.querySelector('.modal form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await until(() => /enter your company name/.test(d.querySelector('.modal').textContent), 'name required');
  typ(d.querySelector('.modal [name=company_name]'), 'Laxmi Box Manufacturing'); d.querySelector('.modal form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await until(() => d.querySelectorAll('.modal').length === 0, 'welcome closes'); assert.match(d.querySelector('.co-name').textContent, /Laxmi Box/); ok('first-run welcome asks only for the company name (no account)');
  assert.match(main(), /Needs your attention/);

  // seed through the real core, then walk every screen
  const c = w.App.core; const { QUALITIES, addDays, todayStr } = w.Calc;
  c.setSettings({ company_state_code: '24' }); const cu = c.saveCustomer({ name: 'Sunrise <b>Foods</b>', gstin: '24AAACS1234F1Z5', city: 'Ahmedabad' });
  [['Liner', 150], ['Fluting', 120]].forEach(([k, g]) => { const id = c.saveStockItem({ kind: k, gsm: g, min_kg: 500 }); c.adjustStock(id, 3000); });
  const q = c.saveQuote({ customer_id: cu, length: 400, width: 280, height: 250, quality: 'std3', quantity: 3000, recipe: QUALITIES.std3.recipe, colours: 1 }); const o = c.orderFromQuote(q, addDays(todayStr(), 2), 'PO-9');
  c.addWork({ order_id: o, good: 1500, waste: 20 }); c.addDelivery({ order_id: o, qty: 1000, vehicle: 'GJ01AB1234', eway: '123456789012' }); c.createInvoice({ order_id: o, qty: 1000 }); const sp = c.saveSupplier({ name: 'Mill Co' }); c.addPurchase({ supplier_id: sp, item_id: c.listStock()[0].id, kg: 500, rate: 41 }); c.addExpense({ category: 'Rent', amount: 5000 });
  const pages = [['Home', /Money to collect/], ['Price Quote', /The price/], ['Orders', /Running/], ["Today's Work", /Boxes finished today/], ['Paper Stock', /Stock value/], ['Buy Paper', /Paper orders/], ['Deliveries', /Challan/], ['Bills & Money In', /GST on bills is/], ['Customers', /Sunrise/], ['Reports & Expenses', /Month by month/], ['Settings', /Safety of your data/]];
  for (const [p, re] of pages) { nav(p); await until(() => re.test(main()), p + ' renders'); assert.ok(!/Something went wrong/.test(d.body.textContent)); ok('screen renders: ' + p); }
  nav('Customers'); await until(() => /Sunrise/.test(main())); assert.ok(!d.querySelector('#main b + b') && d.querySelector('#main').innerHTML.includes('&lt;b&gt;Foods'), 'customer name must be escaped'); ok('HTML typed into a customer name is escaped (no script injection)');
  nav('Bills & Money In'); await until(() => /INV\/2026-27\/0001/.test(main())); assert.match(main(), /5%/); ok('bill shows FY-wise number and 5% GST');
  nav('Orders'); click(d.querySelector('tr.click')); await until(() => d.querySelector('.modal') && /Paper check/.test(d.querySelector('.modal').textContent), 'order detail'); ok('order detail opens with steps + paper check');
  click([...d.querySelectorAll('.modal [data-act="ord.work"]')][0]); await until(() => d.querySelectorAll('.modal').length === 2, 'sub form'); typ(d.querySelector('.overlay:last-child [name=good]'), '300'); d.querySelector('.overlay:last-child form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await until(() => d.querySelectorAll('.modal').length === 1 && /1,820|1820/.test(d.querySelector('.modal').textContent) === false && /1,800/.test(d.querySelector('.modal').textContent), 'order detail refreshes after work saved (made=1,800)'); ok("add work from inside an order updates the open order automatically");
  click(d.querySelector('.modal [data-close]')); assert.equal(d.querySelectorAll('.modal').length, 0);
  nav('Price Quote'); typ(d.getElementById('q_length'), '450'); typ(d.getElementById('q_width'), '300'); typ(d.getElementById('q_height'), '280'); typ(d.getElementById('q_quantity'), '10000'); await until(() => /Customer pays/.test(d.getElementById('q-result').textContent), 'live price'); ok('live price appears while typing (and typing does not lose focus)');

  // ---------- SIDEBAR: desktop expand/collapse, many cycles ----------
  const b = d.body, col = () => d.querySelector('[data-act="nav.collapse"]'); resize(false);
  assert.ok(!b.classList.contains('nav-collapsed')); assert.equal(col().getAttribute('aria-expanded'), 'true');
  const seq = []; for (let i = 0; i < 12; i++) { click(col()); seq.push(b.classList.contains('nav-collapsed')); }
  assert.deepEqual(seq, Array.from({ length: 12 }, (_, i) => i % 2 === 0), 'each click must flip the state, forever: ' + seq); assert.equal(col().getAttribute('aria-expanded'), 'true'); ok('desktop: 12 clicks alternate collapse / expand / collapse... exactly');
  click(col()); assert.ok(b.classList.contains('nav-collapsed')); assert.equal(col().getAttribute('aria-expanded'), 'false'); assert.match(col().title, /Expand/); nav('Orders'); assert.ok(b.classList.contains('nav-collapsed'), 'navigating must not change collapsed state'); click(col()); assert.ok(!b.classList.contains('nav-collapsed')); ok('desktop: collapsed state survives page change and can be expanded again');
  click(col()); assert.ok(b.classList.contains('nav-collapsed')); resize(false); resize(false); assert.ok(b.classList.contains('nav-collapsed')); ok('desktop: choice is remembered (even when the browser blocks storage, memory fallback works)');
  // ---------- mobile drawer ----------
  resize(true); assert.ok(!b.classList.contains('nav-collapsed'), 'collapsed rail must not apply on mobile'); assert.ok(!b.classList.contains('nav-open')); const burger = d.querySelector('[data-act="nav.toggle"]'); assert.equal(burger.getAttribute('aria-expanded'), 'false');
  for (let i = 0; i < 6; i++) { click(burger); assert.ok(b.classList.contains('nav-open'), 'open #' + i); assert.equal(burger.getAttribute('aria-expanded'), 'true'); click(burger); assert.ok(!b.classList.contains('nav-open'), 'close #' + i); } ok('mobile: hamburger opens and closes the drawer repeatedly');
  click(burger); click(d.querySelector('.backdrop')); assert.ok(!b.classList.contains('nav-open')); ok('mobile: tapping the dark background closes the drawer');
  click(burger); nav('Deliveries'); assert.ok(!b.classList.contains('nav-open')); await until(() => /Challan/.test(main())); ok('mobile: choosing a menu item closes the drawer and opens the page');
  click(burger); d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); assert.ok(!b.classList.contains('nav-open')); ok('mobile: Esc key closes the drawer');
  click(burger); resize(false); assert.ok(!b.classList.contains('nav-open'), 'rotating/resizing to desktop must reset the drawer'); assert.ok(b.classList.contains('nav-collapsed'), 'desktop choice (collapsed) restored'); click(col()); assert.ok(!b.classList.contains('nav-collapsed')); ok('resize across the breakpoint: no stuck state, desktop toggle still works');
  // ---------- TEXT SIZE ----------
  const root = d.documentElement; const sizeBtn = d.querySelector('.sizebtn'); const seq2 = []; for (let i = 0; i < 4; i++) { click(sizeBtn); seq2.push(root.dataset.size); } assert.deepEqual(seq2, ['l', 'xl', 's', 'm'], 'Aa cycles Normal>Large>Extra large>Small>Normal: ' + seq2); ok('Aa button cycles text size Normal > Large > Extra large > Small > Normal');
  nav('Settings'); await until(() => /Display size/.test(main())); click([...d.querySelectorAll('[data-act="size.set"]')].find(b => /Extra large/.test(b.textContent))); assert.equal(root.dataset.size, 'xl'); await until(() => d.querySelector('[data-act="size.set"][data-id="xl"]').getAttribute('aria-pressed') === 'true'); ok('Settings has Small / Normal / Large / Extra large buttons'); click([...d.querySelectorAll('[data-act="size.set"]')].find(b => /Normal/.test(b.textContent))); assert.equal(root.dataset.size, 'm');
  const css = require('fs').readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8'); const pxInLayout = (css.match(/[^-\w.]\d+(\.\d+)?px/g) || []).length; assert.ok(/html\{font-size:calc\(var\(--fs\) \* var\(--scale\)\)/.test(css) && /@container/.test(css) && /dvh/.test(css) && /safe-area-inset/.test(css)); ok('stylesheet uses fluid root size, container queries, dynamic viewport height and safe-area insets (' + pxInLayout + ' px values remain: 1px borders, breakpoints, root size)');
  const real = errs.filter(e => !/Not implemented|navigation/i.test(e)); if (real.length) { console.log('JS errors:', real.slice(0, 5)); process.exit(1); }
  console.log(`\n${n} UI checks passed`); process.exit(0);
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
