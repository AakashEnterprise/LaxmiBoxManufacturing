// Forms used from several screens (customer, work, delivery, bill, payment).
(function () {
  const { money2, qtyFmt, gstSplit, stateOfGstin, todayStr, num } = Calc; const h = UI.h; const ok = (m, ...w) => { UI.toast(m); w.forEach(x => UI.toast(x, 'err')); };
  window.Forms = {
    customer(initial, onSaved) {
      const f = [{ name: 'name', label: 'Customer / company name', required: true, autoFocus: true }, { name: 'contact', label: 'Contact person', half: true }, { name: 'phone', label: 'Phone', half: true, type: 'tel' }, { name: 'city', label: 'City', half: true },
        { name: 'gstin', label: 'GST number (GSTIN)', half: true, help: 'Optional. 15 letters/numbers. The first 2 digits decide CGST+SGST or IGST on bills.' }, { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'credit_limit', label: 'Credit limit (₹)', type: 'number', half: true, help: 'Warn me if they owe more than this. 0 = no limit.' }, { name: 'pay_days', label: 'Payment days', type: 'number', half: true, default: 30, help: 'Bill is due after this many days.' }];
      UI.form({ title: initial && initial.id ? 'Edit customer' : 'Add customer', fields: f, initial: initial || {}, onSave: v => { const id = App.core.saveCustomer({ ...v, id: initial && initial.id }); ok('Customer saved'); onSaved && onSaved(id); } }); },
    work(orderId) {
      const open = App.core.listOrders().filter(o => ['New', 'Making'].includes(o.status));
      UI.form({ title: "Add today's work", submitLabel: 'Save work', fields: [{ name: 'order_id', label: 'Which order?', type: 'select', required: true, default: orderId || '', options: open.map(o => ({ v: o.id, l: `${o.no} - ${o.customer} (${qtyFmt(o.produced)}/${qtyFmt(o.qty)} made)` })) },
        { name: 'good', label: 'Good boxes finished today', type: 'number', half: true, min: 0, required: true }, { name: 'waste', label: 'Spoiled / wasted boxes', type: 'number', half: true, min: 0, default: 0 },
        { name: 'stage', label: 'Which step is the order at now?', type: 'select', options: PF.STAGES.filter(s => s !== 'Waiting').map(s => ({ v: s, l: s })) }, { name: 'note', label: 'Note (optional)' }],
        onSave: v => { const r = App.core.addWork({ ...v, order_id: Number(v.order_id) }); ok('Work saved. Paper stock updated.', ...r.warnings); } }); },
    delivery(orderId) {
      const ready = App.core.listOrders().filter(o => o.produced - o.delivered > 0 && !o.cancelled);
      UI.form({ title: 'Send boxes (delivery challan)', submitLabel: 'Make challan', fields: [{ name: 'order_id', label: 'Which order?', type: 'select', required: true, default: orderId || '', options: ready.map(o => ({ v: o.id, l: `${o.no} - ${o.customer} (${qtyFmt(o.produced - o.delivered)} ready)` })) },
        { name: 'qty', label: 'Boxes going out', type: 'number', required: true, half: true }, { name: 'vehicle', label: 'Vehicle number', required: true, half: true, placeholder: 'GJ01AB1234' }, { name: 'driver', label: 'Driver name / phone', half: true }, { name: 'transporter', label: 'Transporter', half: true },
        { name: 'eway', label: 'E-way bill number', help: 'Needed when goods are worth more than ₹50,000. Get it from the government e-way bill website - this app does not make one.' }, { name: 'note', label: 'Note' }],
        onSave: async v => { const p = { ...v, order_id: Number(v.order_id) };
          try { App.core.addDelivery(p); } catch (e) { if (String(e.message).startsWith('EWAY:')) { if (!(await UI.confirm(e.message.slice(5) + ' Continue without it?', { yes: 'Yes, not needed' }))) throw new Error('Please enter the e-way bill number.'); App.core.addDelivery({ ...p, skip_eway: true }); } else throw e; }
          ok('Challan created'); } }); },
    invoice(orderId) {
      const s = App.core.getSettings(); const list = App.core.listOrders().filter(o => o.delivered - o.billed > 0 && !o.cancelled);
      UI.form({ title: 'Make a bill (tax invoice)', submitLabel: 'Make bill', fields: [{ name: 'order_id', label: 'Which order?', type: 'select', required: true, default: orderId || '', options: list.map(o => ({ v: o.id, l: `${o.no} - ${o.customer} (${qtyFmt(o.delivered - o.billed)} delivered, not billed)` })) },
        { name: 'qty', label: 'Boxes to bill', type: 'number', required: true, help: 'Only delivered boxes can be billed.' }, { name: 'note', label: 'Note on bill (optional)' }],
        extra: v => { const o = list.find(x => x.id === Number(v.order_id)); if (!o || !num(v.qty)) return ''; const inter = stateOfGstin(o.customer_gstin) && stateOfGstin(o.customer_gstin) !== String(s.company_state_code).padStart(2, '0'); const g = gstSplit(num(v.qty) * o.unit_price, o.gst_rate, inter);
          return `<div class="note green"><div class="kv"><span>Amount</span><b>${money2(num(v.qty) * o.unit_price)}</b></div><div class="kv"><span>${inter ? 'IGST' : 'CGST + SGST'} ${o.gst_rate}%</span><b>${money2(g.tax)}</b></div><div class="kv"><span>Bill total</span><b>${money2(g.total)}</b></div></div>`; },
        onSave: v => { App.core.createInvoice({ ...v, order_id: Number(v.order_id) }); ok('Bill created'); } }); },
    payment(customerId, invoiceId) {
      const custs = App.core.listCustomers(); const invs = App.core.listInvoices().filter(i => !i.cancelled && i.due > 0);
      UI.form({ title: 'Receive payment', submitLabel: 'Save payment', fields: [{ name: 'customer_id', label: 'Who paid?', type: 'select', required: true, default: customerId || '', options: custs.map(c => ({ v: c.id, l: c.name + (c.balance > 0 ? ' (owes ' + money2(c.balance) + ')' : '') })) },
        { name: 'amount', label: 'Amount received (₹)', type: 'number', step: '0.01', required: true, half: true }, { name: 'mode', label: 'How was it paid?', type: 'select', half: true, default: 'Cash', options: ['Cash', 'UPI', 'Bank transfer', 'Cheque'].map(x => ({ v: x, l: x })) },
        { name: 'invoice_id', label: 'For which bill? (optional)', type: 'select', default: invoiceId || '', placeholder: 'Oldest bills first (automatic)', options: invs.map(i => ({ v: i.id, l: `${i.no} - ${i.customer} (due ${money2(i.due)})` })) },
        { name: 'ref', label: 'Reference (cheque / UPI no.)', half: true }, { name: 'date', label: 'Date received', type: 'date', half: true, default: todayStr() }],
        onSave: v => { App.core.addPayment({ ...v, customer_id: Number(v.customer_id), invoice_id: v.invoice_id ? Number(v.invoice_id) : null }); ok('Payment saved'); } }); }
  };
})();
