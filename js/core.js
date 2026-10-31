// PackFlow Simple - database schema and ALL business rules. Plain JavaScript + SQLite (sql.js).
(function () {
// PackFlow Simple core: database schema + all business rules. No UI code here.
const { costBox, gstSplit, financialYear, todayStr, addDays, daysBetween, stateOfGstin, num, round2, validGstin } = window.Calc;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS counters(key TEXT PRIMARY KEY, value INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, contact TEXT, phone TEXT, city TEXT, address TEXT, gstin TEXT,
  credit_limit REAL DEFAULT 0, pay_days INTEGER DEFAULT 30, active INTEGER DEFAULT 1, created TEXT);
CREATE TABLE IF NOT EXISTS suppliers(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, phone TEXT, city TEXT, gstin TEXT, active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS quotes(id INTEGER PRIMARY KEY, no TEXT UNIQUE, customer_id INTEGER NOT NULL, date TEXT, valid_till TEXT, box_name TEXT,
  length REAL, width REAL, height REAL, quality TEXT, qty INTEGER, unit_price REAL, gst_rate REAL, inputs TEXT, result TEXT, status TEXT DEFAULT 'Open', order_id INTEGER);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, no TEXT UNIQUE, customer_id INTEGER NOT NULL, quote_id INTEGER, date TEXT, due_date TEXT, customer_po TEXT,
  box_name TEXT, length REAL, width REAL, height REAL, quality TEXT, qty INTEGER NOT NULL, unit_price REAL NOT NULL, gst_rate REAL NOT NULL, est_cost REAL DEFAULT 0,
  recipe TEXT, stage TEXT DEFAULT 'Waiting', cancelled INTEGER DEFAULT 0, note TEXT, advance REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS production(id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL, date TEXT, good_qty INTEGER DEFAULT 0, waste_qty INTEGER DEFAULT 0, stage TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS deliveries(id INTEGER PRIMARY KEY, no TEXT UNIQUE, order_id INTEGER NOT NULL, date TEXT, qty INTEGER NOT NULL, vehicle TEXT, driver TEXT,
  transporter TEXT, eway TEXT, note TEXT, cancelled INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS invoices(id INTEGER PRIMARY KEY, no TEXT UNIQUE, order_id INTEGER, customer_id INTEGER NOT NULL, date TEXT, due_date TEXT, qty INTEGER, rate REAL,
  taxable REAL, gst_rate REAL, cgst REAL, sgst REAL, igst REAL, total REAL, cancelled INTEGER DEFAULT 0, note TEXT);
CREATE TABLE IF NOT EXISTS payments(id INTEGER PRIMARY KEY, no TEXT UNIQUE, customer_id INTEGER NOT NULL, date TEXT, amount REAL NOT NULL, mode TEXT, ref TEXT, note TEXT, cancelled INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS allocations(id INTEGER PRIMARY KEY, payment_id INTEGER NOT NULL, invoice_id INTEGER NOT NULL, amount REAL NOT NULL);
CREATE TABLE IF NOT EXISTS stock_items(id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, gsm INTEGER NOT NULL, min_kg REAL DEFAULT 0, rate REAL DEFAULT 0, active INTEGER DEFAULT 1, UNIQUE(kind, gsm, name));
CREATE TABLE IF NOT EXISTS stock_moves(id INTEGER PRIMARY KEY, item_id INTEGER NOT NULL, date TEXT, kg REAL NOT NULL, reason TEXT, ref TEXT);
CREATE TABLE IF NOT EXISTS purchases(id INTEGER PRIMARY KEY, no TEXT UNIQUE, supplier_id INTEGER NOT NULL, item_id INTEGER NOT NULL, date TEXT, kg REAL, rate REAL, total REAL,
  status TEXT DEFAULT 'Ordered', received_date TEXT, paid REAL DEFAULT 0, cancelled INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS expenses(id INTEGER PRIMARY KEY, date TEXT, category TEXT, amount REAL, note TEXT);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, ts TEXT, text TEXT);
CREATE INDEX IF NOT EXISTS ix_orders_c ON orders(customer_id); CREATE INDEX IF NOT EXISTS ix_prod_o ON production(order_id);
CREATE INDEX IF NOT EXISTS ix_del_o ON deliveries(order_id); CREATE INDEX IF NOT EXISTS ix_inv_c ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS ix_alloc_i ON allocations(invoice_id); CREATE INDEX IF NOT EXISTS ix_moves_i ON stock_moves(item_id);
`;

const STAGES = ['Waiting', 'Sheet Making', 'Printing', 'Cutting & Creasing', 'Pasting / Stitching', 'Checking', 'Ready'];
const DEFAULTS = {
  company_name: 'My Box Factory', company_address: '', company_phone: '', company_gstin: '', company_state_code: '24', bank_details: '',
  gst_rate: '5', paper_rate: '42', conversion_cost: '4.5', print_rate: '0.35', wastage_pct: '4', margin_pct: '15', glue_mm: '45', trim_mm: '20',
  deckles: '1000,1200,1400,1600,1800,2000', quote_valid_days: '15', default_pay_days: '30', low_stock_note: ''
};

class CoreError extends Error {}
const fail = m => { throw new CoreError(m); };

function createCore(SQL, bytes, save) {
  const db = bytes ? new SQL.Database(bytes) : new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;'); db.exec(SCHEMA);
  let timer = null;

  const rows = (sql, p = []) => { const st = db.prepare(sql); try { st.bind(p); const out = []; while (st.step()) out.push(st.getAsObject()); return out; } finally { st.free(); } };
  const one = (sql, p = []) => rows(sql, p)[0] || null;
  const val = (sql, p = []) => { const r = one(sql, p); return r ? Object.values(r)[0] : null; };
  const lastId = () => val('SELECT last_insert_rowid()');
  const touch = () => { clearTimeout(timer); timer = setTimeout(() => flush(), 250); };
  const flush = async () => { clearTimeout(timer); if (save) await save(db.export()); };
  const run = (sql, p = []) => { db.run(sql, p); };
  let depth = 0;
  const tx = fn => { if (depth > 0) return fn(); depth++; db.run('BEGIN'); try { const r = fn(); db.run('COMMIT'); touch(); return r; } catch (e) { try { db.run('ROLLBACK'); } catch {} throw e; } finally { depth--; } };
  const log = text => run('INSERT INTO audit(ts,text) VALUES(?,?)', [new Date().toISOString(), text]);

  // ---------- settings ----------
  const getSettings = () => { const s = { ...DEFAULTS }; rows('SELECT key,value FROM settings').forEach(r => { s[r.key] = r.value; }); return s; };
  const setSettings = obj => tx(() => { for (const [k, v] of Object.entries(obj)) {
    if (k === 'gst_rate' && !(num(v) >= 0 && num(v) <= 40)) fail('GST rate must be between 0 and 40.');
    if (k === 'company_gstin' && !validGstin(v)) fail('Your GSTIN does not look right (15 letters/numbers).');
    run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [k, String(v ?? '')]); } log('Settings changed'); });

  // ---------- numbering (never reuses a number, even after cancel) ----------
  const nextNo = (prefix, date, perFY = true) => {
    const key = perFY ? `${prefix}/${financialYear(date)}` : prefix;
    run('INSERT INTO counters(key,value) VALUES(?,0) ON CONFLICT(key) DO NOTHING', [key]);
    run('UPDATE counters SET value=value+1 WHERE key=?', [key]);
    return `${key}/${String(val('SELECT value FROM counters WHERE key=?', [key])).padStart(4, '0')}`;
  };

  // ---------- customers & suppliers ----------
  const customerBalanceSql = `(SELECT COALESCE(SUM(total),0) FROM invoices WHERE customer_id=c.id AND cancelled=0) - (SELECT COALESCE(SUM(amount),0) FROM payments WHERE customer_id=c.id AND cancelled=0)`;
  const listCustomers = () => rows(`SELECT c.*, ${customerBalanceSql} AS balance FROM customers c WHERE active=1 ORDER BY name`);
  const saveCustomer = c => tx(() => {
    const name = (c.name || '').trim(); if (!name) fail('Please enter the customer name.');
    if (c.gstin && !validGstin(c.gstin)) fail('GSTIN looks wrong. It should be 15 letters/numbers, e.g. 24ABCDE1234F1Z5. Leave blank if the customer has none.');
    const dup = one('SELECT id FROM customers WHERE lower(name)=lower(?) AND id<>?', [name, c.id || 0]); if (dup) fail('A customer with this name already exists.');
    const v = [name, c.contact || '', c.phone || '', c.city || '', c.address || '', (c.gstin || '').toUpperCase(), num(c.credit_limit), Math.round(num(c.pay_days)) || 30];
    if (c.id) { run('UPDATE customers SET name=?,contact=?,phone=?,city=?,address=?,gstin=?,credit_limit=?,pay_days=? WHERE id=?', [...v, c.id]); log(`Customer updated: ${name}`); return c.id; }
    run('INSERT INTO customers(name,contact,phone,city,address,gstin,credit_limit,pay_days,created) VALUES(?,?,?,?,?,?,?,?,?)', [...v, todayStr()]); const nid = lastId(); log(`Customer added: ${name}`); return nid;
  });
  const archiveCustomer = id => tx(() => {
    if (num(one(`SELECT ${customerBalanceSql} AS b FROM customers c WHERE id=?`, [id]).b) !== 0) fail('This customer still has pending money. Settle the account first.');
    run('UPDATE customers SET active=0 WHERE id=?', [id]); log(`Customer archived #${id}`); });
  const listSuppliers = () => rows('SELECT * FROM suppliers WHERE active=1 ORDER BY name');
  const saveSupplier = s => tx(() => {
    const name = (s.name || '').trim(); if (!name) fail('Please enter the supplier name.');
    if (s.gstin && !validGstin(s.gstin)) fail('GSTIN looks wrong.');
    if (s.id) { run('UPDATE suppliers SET name=?,phone=?,city=?,gstin=? WHERE id=?', [name, s.phone || '', s.city || '', (s.gstin || '').toUpperCase(), s.id]); return s.id; }
    if (one('SELECT id FROM suppliers WHERE lower(name)=lower(?)', [name])) fail('A supplier with this name already exists.');
    run('INSERT INTO suppliers(name,phone,city,gstin) VALUES(?,?,?,?)', [name, s.phone || '', s.city || '', (s.gstin || '').toUpperCase()]); return lastId();
  });

  // ---------- quotes ----------
  const priceInputs = (q, s = getSettings()) => ({
    length: num(q.length), width: num(q.width), height: num(q.height), recipe: q.recipe, quantity: num(q.quantity),
    paperRate: q.paperRate ?? num(s.paper_rate), conversionCost: q.conversionCost ?? num(s.conversion_cost), colours: num(q.colours),
    printRatePerColour: num(s.print_rate), wastagePct: q.wastagePct ?? num(s.wastage_pct), marginPct: q.marginPct ?? num(s.margin_pct),
    oneTimeCost: num(q.oneTimeCost), transportPerBox: num(q.transportPerBox), glue: num(s.glue_mm), trim: num(s.trim_mm),
    deckles: String(s.deckles).split(',').map(Number).filter(Boolean)
  });
  const checkBox = q => {
    if (!(num(q.length) > 0 && num(q.width) > 0 && num(q.height) > 0)) fail('Please enter box Length, Width and Height (in mm).');
    if (num(q.length) > 2000 || num(q.width) > 2000 || num(q.height) > 2000) fail('Box size looks too big. Sizes are in millimetres (mm). Example: 450 x 300 x 280.');
    if (!(num(q.quantity) >= 1)) fail('Please enter how many boxes.');
  };
  const saveQuote = q => tx(() => {
    checkBox(q); if (!q.customer_id) fail('Please choose a customer.');
    const s = getSettings(); const inp = priceInputs(q, s); const res = costBox(inp);
    if (res.tooWide) fail('This box sheet is wider than all available paper rolls. Reduce the size or add a wider roll in Settings.');
    const date = todayStr();
    const no = nextNo('QT', date);
    run(`INSERT INTO quotes(no,customer_id,date,valid_till,box_name,length,width,height,quality,qty,unit_price,gst_rate,inputs,result) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [no, q.customer_id, date, addDays(date, Math.round(num(s.quote_valid_days)) || 15), q.box_name || 'Corrugated Box', inp.length, inp.width, inp.height, q.quality, inp.quantity,
        res.unitPrice, num(s.gst_rate), JSON.stringify(inp), JSON.stringify(res)]);
    const qid = lastId(); log(`Quote ${no} saved`); return qid;
  });
  const listQuotes = () => rows(`SELECT q.*, c.name AS customer FROM quotes q JOIN customers c ON c.id=q.customer_id ORDER BY q.id DESC`);

  // ---------- orders ----------
  const orderSql = `SELECT o.*, c.name AS customer, c.gstin AS customer_gstin,
    (SELECT COALESCE(SUM(good_qty),0) FROM production WHERE order_id=o.id) AS produced,
    (SELECT COALESCE(SUM(waste_qty),0) FROM production WHERE order_id=o.id) AS wasted,
    (SELECT COALESCE(SUM(qty),0) FROM deliveries WHERE order_id=o.id AND cancelled=0) AS delivered,
    (SELECT COALESCE(SUM(qty),0) FROM invoices WHERE order_id=o.id AND cancelled=0) AS billed
    FROM orders o JOIN customers c ON c.id=o.customer_id`;
  const withStatus = o => { let status = 'New'; if (o.cancelled) status = 'Cancelled'; else if (o.delivered >= o.qty) status = 'Delivered';
    else if (o.produced >= o.qty) status = 'Ready'; else if (o.produced > 0 || o.stage !== 'Waiting') status = 'Making'; return { ...o, status }; };
  const listOrders = () => rows(orderSql + ' ORDER BY o.id DESC').map(withStatus);
  const getOrder = id => { const o = one(orderSql + ' WHERE o.id=?', [id]); return o ? withStatus(o) : null; };
  const customerExposure = id => num(val(`SELECT ${customerBalanceSql} FROM customers c WHERE id=?`, [id]));

  const createOrder = o => tx(() => {
    checkBox(o); if (!o.customer_id) fail('Please choose a customer.');
    if (!(num(o.unit_price) > 0)) fail('Please enter the price per box.');
    if (!o.due_date) fail('Please choose the delivery date.');
    if (o.due_date < todayStr()) fail('Delivery date cannot be in the past.');
    const s = getSettings(); const cust = one('SELECT * FROM customers WHERE id=?', [o.customer_id]);
    const value = num(o.unit_price) * num(o.quantity) * (1 + num(s.gst_rate) / 100);
    if (cust.credit_limit > 0 && customerExposure(cust.id) + value > cust.credit_limit && !o.confirm_credit)
      fail(`CREDIT_LIMIT: ${cust.name} already owes ${Math.round(customerExposure(cust.id))} and this order adds ${Math.round(value)}, which crosses their limit of ${Math.round(cust.credit_limit)}.`);
    if (!o.recipe_layers || !o.recipe_layers.length) fail('Paper recipe is missing. Please choose the box strength.');
    const res = costBox(priceInputs({ ...o, recipe: o.recipe_layers }, s));
    const trimLoss = res.deckle ? res.deckle.trimPct / 100 : 0;
    const recipe = JSON.stringify(res.layers.map(l => ({ kind: l.kind, gsm: l.gsm, kg: l.kgPerBox / (1 - trimLoss) })));
    const est = res.cost;
    const date = todayStr(); const no = nextNo('SO', date);
    run(`INSERT INTO orders(no,customer_id,quote_id,date,due_date,customer_po,box_name,length,width,height,quality,qty,unit_price,gst_rate,est_cost,recipe,note,advance) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [no, o.customer_id, o.quote_id || null, date, o.due_date, o.customer_po || '', o.box_name || 'Corrugated Box', num(o.length), num(o.width), num(o.height), o.quality,
        Math.round(num(o.quantity)), num(o.unit_price), num(s.gst_rate), est, recipe, o.note || '', 0]);
    const id = lastId(); if (o.quote_id) run("UPDATE quotes SET status='Converted', order_id=? WHERE id=?", [id, o.quote_id]);
    log(`Order ${no} created`); return id;
  });
  const orderFromQuote = (quoteId, dueDate, po, confirmCredit = false) => {
    const q = one('SELECT * FROM quotes WHERE id=?', [quoteId]); if (!q) fail('Quote not found.');
    if (q.status === 'Converted') fail('This quote already became an order.');
    const inp = JSON.parse(q.inputs);
    return createOrder({ customer_id: q.customer_id, quote_id: q.id, due_date: dueDate, customer_po: po, box_name: q.box_name, length: q.length, width: q.width, height: q.height, quality: q.quality,
      quantity: q.qty, unit_price: q.unit_price, recipe_layers: inp.recipe, colours: inp.colours, paperRate: inp.paperRate, conversionCost: inp.conversionCost, wastagePct: inp.wastagePct,
      marginPct: inp.marginPct, oneTimeCost: inp.oneTimeCost, transportPerBox: inp.transportPerBox, confirm_credit: confirmCredit });
  };
  const cancelOrder = id => tx(() => {
    const o = getOrder(id); if (!o) fail('Order not found.');
    if (o.delivered > 0) fail('Boxes were already delivered, so this order cannot be cancelled.');
    if (o.billed > 0) fail('A bill was already made for this order. Cancel the bill first.');
    run('UPDATE orders SET cancelled=1 WHERE id=?', [id]); log(`Order ${o.no} cancelled`); });
  const setStage = (id, stage) => tx(() => { if (!STAGES.includes(stage)) fail('Unknown step.'); run('UPDATE orders SET stage=? WHERE id=?', [stage, id]); });

  // ---------- paper stock ----------
  const stockSql = `SELECT i.*, COALESCE((SELECT SUM(kg) FROM stock_moves WHERE item_id=i.id),0) AS kg FROM stock_items i WHERE active=1 ORDER BY kind, gsm`;
  const listStock = () => rows(stockSql);
  const saveStockItem = it => tx(() => {
    if (!(num(it.gsm) >= 60 && num(it.gsm) <= 600)) fail('GSM (paper thickness) should be between 60 and 600.');
    const name = (it.name || '').trim() || `${it.kind} ${it.gsm} GSM`;
    if (it.id) { run('UPDATE stock_items SET name=?,kind=?,gsm=?,min_kg=?,rate=? WHERE id=?', [name, it.kind, num(it.gsm), num(it.min_kg), num(it.rate), it.id]); return it.id; }
    if (one('SELECT id FROM stock_items WHERE kind=? AND gsm=? AND name=?', [it.kind, num(it.gsm), name])) fail('This paper is already in the list.');
    run('INSERT INTO stock_items(name,kind,gsm,min_kg,rate) VALUES(?,?,?,?,?)', [name, it.kind, num(it.gsm), num(it.min_kg), num(it.rate)]); return lastId();
  });
  const moveStock = (itemId, kg, reason, ref = '') => { run('INSERT INTO stock_moves(item_id,date,kg,reason,ref) VALUES(?,?,?,?,?)', [itemId, todayStr(), kg, reason, ref]); };
  const adjustStock = (itemId, kg, reason) => tx(() => { if (!num(kg)) fail('Enter the kg to add or remove.'); moveStock(itemId, num(kg), reason || (kg > 0 ? 'Stock added' : 'Stock removed')); log(`Stock ${kg > 0 ? '+' : ''}${kg} kg on item #${itemId}`); });
  const stockMoves = itemId => rows('SELECT * FROM stock_moves WHERE item_id=? ORDER BY id DESC LIMIT 100', [itemId]);

  // paper needed for the boxes still to be made vs paper in hand
  const paperCheck = orderId => {
    const o = getOrder(orderId); if (!o) return [];
    const remaining = Math.max(0, o.qty - o.produced); const need = {};
    JSON.parse(o.recipe || '[]').forEach(l => { const k = `${l.kind}|${l.gsm}`; need[k] = (need[k] || 0) + l.kg * remaining; });
    const stock = listStock();
    return Object.entries(need).map(([k, kg]) => { const [kind, gsm] = k.split('|'); const have = stock.filter(s => s.kind === kind && s.gsm === Number(gsm)).reduce((a, s) => a + s.kg, 0);
      return { kind, gsm: Number(gsm), need: kg, have, short: Math.max(0, kg - have) }; });
  };

  // ---------- production ----------
  const addWork = w => tx(() => {
    const o = getOrder(w.order_id); if (!o) fail('Please choose an order.');
    if (o.cancelled) fail('This order is cancelled.');
    const good = Math.round(num(w.good)), waste = Math.round(num(w.waste));
    if (good < 0 || waste < 0) fail('Numbers cannot be negative.'); if (good + waste === 0) fail('Enter how many boxes were finished or spoiled today.');
    if (o.produced + good > o.qty * 1.1) fail(`This would make ${o.produced + good} boxes but the order is only for ${o.qty}. Allowed extra is 10%. Please check the number.`);
    run('INSERT INTO production(order_id,date,good_qty,waste_qty,stage,note) VALUES(?,?,?,?,?,?)', [o.id, w.date || todayStr(), good, waste, w.stage || o.stage, w.note || '']);
    const newStage = good + o.produced >= o.qty ? 'Ready' : (w.stage || o.stage === 'Waiting' ? (w.stage || 'Sheet Making') : o.stage);
    run('UPDATE orders SET stage=? WHERE id=?', [newStage, o.id]);
    const warnings = []; const stock = listStock();
    JSON.parse(o.recipe || '[]').forEach(l => {
      const kg = l.kg * (good + waste); const cand = stock.filter(s => s.kind === l.kind && s.gsm === l.gsm).sort((a, b) => b.kg - a.kg)[0];
      if (!cand) { warnings.push(`No ${l.kind} ${l.gsm} GSM paper in your stock list - paper use was not recorded.`); return; }
      moveStock(cand.id, -kg, `Used for ${o.no}`, o.no); cand.kg -= kg;
      if (cand.kg < 0) warnings.push(`${cand.name} stock is now below zero. Please check your stock.`);
    });
    log(`Work added for ${o.no}: ${good} good, ${waste} spoiled`); return { warnings };
  });
  const listWork = () => rows(`SELECT p.*, o.no AS order_no, o.box_name, c.name AS customer FROM production p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id ORDER BY p.id DESC LIMIT 300`);

  // ---------- delivery ----------
  const addDelivery = d => tx(() => {
    const o = getOrder(d.order_id); if (!o) fail('Please choose an order.'); if (o.cancelled) fail('This order is cancelled.');
    const qty = Math.round(num(d.qty)); if (qty <= 0) fail('Enter how many boxes are going.');
    const canSend = o.produced - o.delivered; if (qty > canSend) fail(`Only ${canSend} boxes are ready to send for this order. Add today's work first.`);
    if (!(d.vehicle || '').trim()) fail('Please enter the vehicle number.');
    const value = qty * o.unit_price * (1 + o.gst_rate / 100);
    if (value > 50000 && !(d.eway || '').trim() && !d.skip_eway) fail('EWAY: This load is worth more than ₹50,000, so an e-way bill is normally needed. Enter the e-way bill number, or confirm that it is not required.');
    const date = d.date || todayStr(); const no = nextNo('CH', date);
    run('INSERT INTO deliveries(no,order_id,date,qty,vehicle,driver,transporter,eway,note) VALUES(?,?,?,?,?,?,?,?,?)', [no, o.id, date, qty, d.vehicle.trim().toUpperCase(), d.driver || '', d.transporter || '', d.eway || '', d.note || '']);
    const did = lastId(); log(`Delivery ${no}: ${qty} boxes`); return did;
  });
  const cancelDelivery = id => tx(() => { const d = one('SELECT * FROM deliveries WHERE id=?', [id]); if (!d) fail('Not found.');
    const o = getOrder(d.order_id); if (o.billed > o.delivered - d.qty) fail('These boxes are already billed. Cancel the bill first.');
    run('UPDATE deliveries SET cancelled=1 WHERE id=?', [id]); log(`Delivery ${d.no} cancelled`); });
  const listDeliveries = () => rows(`SELECT d.*, o.no AS order_no, o.box_name, o.length, o.width, o.height, c.name AS customer, c.address, c.city FROM deliveries d JOIN orders o ON o.id=d.order_id JOIN customers c ON c.id=o.customer_id ORDER BY d.id DESC`);

  // ---------- bills ----------
  const paidSql = '(SELECT COALESCE(SUM(amount),0) FROM allocations WHERE invoice_id=i.id)';
  const listInvoices = () => rows(`SELECT i.*, c.name AS customer, c.gstin AS customer_gstin, c.address, c.city, o.no AS order_no, o.box_name, ${paidSql} AS paid FROM invoices i JOIN customers c ON c.id=i.customer_id LEFT JOIN orders o ON o.id=i.order_id ORDER BY i.id DESC`)
    .map(i => ({ ...i, due: round2(i.total - i.paid), status: i.cancelled ? 'Cancelled' : round2(i.total - i.paid) <= 0 ? 'Paid' : i.paid > 0 ? 'Part paid' : 'Unpaid' }));
  const createInvoice = b => tx(() => {
    const o = getOrder(b.order_id); if (!o) fail('Please choose an order.');
    const qty = Math.round(num(b.qty)); const billable = o.delivered - o.billed;
    if (qty <= 0) fail('Enter how many boxes to bill.'); if (qty > billable) fail(`You can bill only ${billable} boxes. Boxes must be delivered before billing.`);
    const s = getSettings(); const cust = one('SELECT * FROM customers WHERE id=?', [o.customer_id]);
    const inter = !!(stateOfGstin(cust.gstin) && s.company_state_code && stateOfGstin(cust.gstin) !== String(s.company_state_code).padStart(2, '0'));
    const taxable = round2(qty * o.unit_price); const g = gstSplit(taxable, o.gst_rate, inter);
    const date = b.date || todayStr(); const no = nextNo('INV', date);
    run('INSERT INTO invoices(no,order_id,customer_id,date,due_date,qty,rate,taxable,gst_rate,cgst,sgst,igst,total,note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [no, o.id, o.customer_id, date, addDays(date, cust.pay_days || 30), qty, o.unit_price, taxable, o.gst_rate, g.cgst, g.sgst, g.igst, g.total, b.note || '']);
    const id = lastId(); autoAllocate(o.customer_id); log(`Bill ${no} made: ${g.total}`); return id;
  });
  const cancelInvoice = id => tx(() => { const i = listInvoices().find(x => x.id === id); if (!i) fail('Not found.');
    if (i.paid > 0) fail('Payment was already received against this bill. Cancel or re-assign the payment first.');
    run('UPDATE invoices SET cancelled=1 WHERE id=?', [id]); log(`Bill ${i.no} cancelled`); });

  // ---------- payments ----------
  const autoAllocate = customerId => {
    const pays = rows(`SELECT p.id, p.amount - COALESCE((SELECT SUM(amount) FROM allocations WHERE payment_id=p.id),0) AS left FROM payments p WHERE customer_id=? AND cancelled=0 ORDER BY date, id`, [customerId]).filter(p => p.left > 0.004);
    for (const p of pays) { let left = p.left;
      const invs = rows(`SELECT i.id, i.total - ${paidSql} AS due FROM invoices i WHERE customer_id=? AND cancelled=0 ORDER BY due_date, id`, [customerId]).filter(i => i.due > 0.004);
      for (const i of invs) { if (left <= 0.004) break; const a = round2(Math.min(left, i.due)); run('INSERT INTO allocations(payment_id,invoice_id,amount) VALUES(?,?,?)', [p.id, i.id, a]); left = round2(left - a); } }
  };
  const addPayment = p => tx(() => {
    const amt = round2(num(p.amount)); if (!(amt > 0)) fail('Enter the amount received.'); if (!p.customer_id) fail('Please choose a customer.');
    const date = p.date || todayStr(); if (date > todayStr()) fail('Payment date cannot be in the future.');
    const no = nextNo('RC', date); run('INSERT INTO payments(no,customer_id,date,amount,mode,ref,note) VALUES(?,?,?,?,?,?,?)', [no, p.customer_id, date, amt, p.mode || 'Cash', p.ref || '', p.note || '']);
    const pid = lastId();
    if (p.invoice_id) { const inv = listInvoices().find(i => i.id === Number(p.invoice_id)); if (inv && inv.customer_id === Number(p.customer_id) && inv.due > 0) run('INSERT INTO allocations(payment_id,invoice_id,amount) VALUES(?,?,?)', [pid, inv.id, round2(Math.min(amt, inv.due))]); }
    autoAllocate(p.customer_id); log(`Payment ${no}: ${amt}`); return pid;
  });
  const listPayments = () => rows(`SELECT p.*, c.name AS customer, p.amount - COALESCE((SELECT SUM(amount) FROM allocations WHERE payment_id=p.id),0) AS advance FROM payments p JOIN customers c ON c.id=p.customer_id ORDER BY p.id DESC`);
  const cancelPayment = id => tx(() => { run('DELETE FROM allocations WHERE payment_id=?', [id]); run('UPDATE payments SET cancelled=1 WHERE id=?', [id]);
    const p = one('SELECT customer_id FROM payments WHERE id=?', [id]); autoAllocate(p.customer_id); log(`Payment #${id} cancelled`); });

  // ---------- buying paper ----------
  const listPurchases = () => rows(`SELECT p.*, s.name AS supplier, i.name AS item FROM purchases p JOIN suppliers s ON s.id=p.supplier_id JOIN stock_items i ON i.id=p.item_id ORDER BY p.id DESC`);
  const addPurchase = p => tx(() => {
    if (!p.supplier_id) fail('Please choose a supplier.'); if (!p.item_id) fail('Please choose the paper.'); if (!(num(p.kg) > 0)) fail('Enter the kg.'); if (!(num(p.rate) > 0)) fail('Enter the rate per kg.');
    const date = todayStr(); const no = nextNo('PO', date);
    run('INSERT INTO purchases(no,supplier_id,item_id,date,kg,rate,total) VALUES(?,?,?,?,?,?,?)', [no, p.supplier_id, p.item_id, date, num(p.kg), num(p.rate), round2(num(p.kg) * num(p.rate))]); const pid = lastId(); log(`Purchase ${no}`); return pid;
  });
  const receivePurchase = (id, kgReceived) => tx(() => { const p = one('SELECT * FROM purchases WHERE id=?', [id]); if (!p || p.status !== 'Ordered' || p.cancelled) fail('This purchase cannot be received.');
    const kg = num(kgReceived) || p.kg; if (kg <= 0) fail('Enter the kg received.');
    run("UPDATE purchases SET status='Received', received_date=?, kg=?, total=? WHERE id=?", [todayStr(), kg, round2(kg * p.rate), id]); moveStock(p.item_id, kg, `Received ${p.no}`, p.no);
    run('UPDATE stock_items SET rate=? WHERE id=?', [p.rate, p.item_id]); log(`Purchase ${p.no} received ${kg} kg`); });
  const payPurchase = (id, amount) => tx(() => { const p = one('SELECT * FROM purchases WHERE id=?', [id]); const a = round2(num(amount)); if (!(a > 0)) fail('Enter the amount paid.');
    if (p.paid + a > p.total + 0.01) fail('This is more than the purchase value.'); run('UPDATE purchases SET paid=paid+? WHERE id=?', [a, id]); log(`Paid ${a} on ${p.no}`); });
  const cancelPurchase = id => tx(() => { const p = one('SELECT * FROM purchases WHERE id=?', [id]); if (p.status === 'Received') fail('Already received. Use "Stock adjust" if the paper was returned.'); run('UPDATE purchases SET cancelled=1 WHERE id=?', [id]); });

  // ---------- expenses ----------
  const addExpense = e => tx(() => { if (!(num(e.amount) > 0)) fail('Enter the amount.'); if (!(e.category || '').trim()) fail('Choose a category.');
    run('INSERT INTO expenses(date,category,amount,note) VALUES(?,?,?,?)', [e.date || todayStr(), e.category, round2(num(e.amount)), e.note || '']); });
  const listExpenses = () => rows('SELECT * FROM expenses ORDER BY date DESC, id DESC LIMIT 500');
  const deleteExpense = id => tx(() => { run('DELETE FROM expenses WHERE id=?', [id]); log(`Expense #${id} deleted`); });

  // ---------- home screen numbers + attention list ----------
  const home = () => {
    const t = todayStr(); const month = t.slice(0, 7);
    const orders = listOrders(); const invs = listInvoices().filter(i => !i.cancelled); const stock = listStock(); const attention = [];
    const open = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
    open.forEach(o => { const d = daysBetween(t, o.due_date);
      if (d < 0) attention.push({ level: 'red', text: `${o.no} (${o.customer}) is ${-d} day(s) late`, go: 'orders' });
      else if (d <= 3) attention.push({ level: 'amber', text: `${o.no} (${o.customer}) must go in ${d} day(s) - ${o.produced}/${o.qty} made`, go: 'orders' }); });
    invs.filter(i => i.due > 0 && i.due_date < t).forEach(i => attention.push({ level: 'red', text: `Bill ${i.no} - ${i.customer} owes ₹${Math.round(i.due)} since ${-daysBetween(t, i.due_date)} day(s)`, go: 'bills' }));
    stock.filter(s => s.kg <= s.min_kg && s.min_kg > 0).forEach(s => attention.push({ level: s.kg <= 0 ? 'red' : 'amber', text: `${s.name} is low: ${Math.round(s.kg)} kg left`, go: 'stock' }));
    orders.filter(o => !o.cancelled && o.delivered > o.billed).forEach(o => attention.push({ level: 'amber', text: `${o.no} (${o.customer}): ${o.delivered - o.billed} delivered boxes not billed yet`, go: 'bills' }));
    listQuotes().filter(q => q.status === 'Open' && q.valid_till < t).slice(0, 3).forEach(q => attention.push({ level: 'amber', text: `Quote ${q.no} (${q.customer}) has expired`, go: 'quotes' }));
    return {
      running: open.length, toCollect: round2(invs.reduce((a, i) => a + Math.max(0, i.due), 0)),
      overdue: round2(invs.filter(i => i.due_date < t).reduce((a, i) => a + Math.max(0, i.due), 0)),
      salesMonth: round2(invs.filter(i => i.date.startsWith(month)).reduce((a, i) => a + i.taxable, 0)),
      lowPaper: stock.filter(s => s.kg <= s.min_kg && s.min_kg > 0).length,
      attention: attention.sort((a, b) => (a.level === 'red' ? 0 : 1) - (b.level === 'red' ? 0 : 1))
    };
  };

  const reports = () => {
    const invs = listInvoices().filter(i => !i.cancelled); const months = {}; const add = (m, k, v) => { months[m] = months[m] || { month: m, sales: 0, received: 0, spent: 0, paper: 0 }; months[m][k] += v; };
    invs.forEach(i => add(i.date.slice(0, 7), 'sales', i.taxable));
    rows('SELECT date, amount FROM payments WHERE cancelled=0').forEach(p => add(p.date.slice(0, 7), 'received', p.amount));
    rows('SELECT date, amount FROM expenses').forEach(e => add(e.date.slice(0, 7), 'spent', e.amount));
    rows('SELECT date, paid FROM purchases WHERE cancelled=0 AND paid>0').forEach(p => add(p.date.slice(0, 7), 'paper', p.paid));
    const ageing = { current: 0, d1_30: 0, d31_60: 0, d60: 0 }; const t = todayStr();
    invs.filter(i => i.due > 0).forEach(i => { const late = daysBetween(i.due_date, t); if (late <= 0) ageing.current += i.due; else if (late <= 30) ageing.d1_30 += i.due; else if (late <= 60) ageing.d31_60 += i.due; else ageing.d60 += i.due; });
    const top = rows(`SELECT c.name, COALESCE(SUM(i.taxable),0) AS sales FROM customers c LEFT JOIN invoices i ON i.customer_id=c.id AND i.cancelled=0 GROUP BY c.id HAVING sales>0 ORDER BY sales DESC LIMIT 5`);
    const waste = one('SELECT COALESCE(SUM(good_qty),0) AS good, COALESCE(SUM(waste_qty),0) AS bad FROM production');
    return { months: Object.values(months).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 12), ageing, top, waste };
  };

  // ---------- backup / restore ----------
  const exportBytes = () => db.export();
  const audit = () => rows('SELECT * FROM audit ORDER BY id DESC LIMIT 80');

  return { rows, one, run, tx, flush, getSettings, setSettings, listCustomers, saveCustomer, archiveCustomer, listSuppliers, saveSupplier,
    saveQuote, listQuotes, createOrder, orderFromQuote, listOrders, getOrder, cancelOrder, setStage, listStock, saveStockItem, adjustStock, stockMoves, paperCheck, addWork, listWork,
    addDelivery, cancelDelivery, listDeliveries, listInvoices, createInvoice, cancelInvoice, addPayment, listPayments, cancelPayment, listPurchases, addPurchase, receivePurchase, payPurchase,
    cancelPurchase, addExpense, listExpenses, deleteExpense, home, reports, exportBytes, audit, priceInputs, customerExposure };
}

window.PF = { STAGES, DEFAULTS, CoreError, createCore };
})();
