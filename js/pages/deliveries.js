(function () {
  const { qtyFmt, dateFmt } = Calc; const h = UI.h; const P = App.pages; let q = '';
  P.deliveries = () => { const rows = App.core.listDeliveries().filter(d => UI.matches(d, q));
    return UI.head('Deliveries', 'Every truck that leaves with boxes. Make a challan, print it, and give a copy to the driver.', `${UI.search(q, 'del.q')}<button class="btn primary" data-act="del.new">+ Send boxes</button>`) +
      UI.table([{ h: 'Challan', f: r => `<b>${h(r.no)}</b>` }, { h: 'Date', f: r => dateFmt(r.date) }, { h: 'Customer', f: r => h(r.customer) }, { h: 'Order', f: r => h(r.order_no) }, { h: 'Boxes', r: 1, f: r => qtyFmt(r.qty) }, { h: 'Vehicle', f: r => h(r.vehicle) }, { h: 'E-way', f: r => h(r.eway || '-') }, { h: 'Status', f: r => r.cancelled ? UI.badge('Cancelled') : UI.badge('Sent', 'green') },
        { h: '', f: r => r.cancelled ? '' : `<button class="btn sm" data-act="del.print" data-id="${r.id}">🖨 Print</button> <button class="btn sm ghost" data-act="del.cancel" data-id="${r.id}">Cancel</button>` }], rows, { empty: UI.empty('🚚', 'No deliveries yet.', '<button class="btn primary" data-act="del.new">+ Send boxes</button>') }); };
  UI.onIn('del.q', el => { q = el.value; const p = el.selectionStart; App.render(); const n = UI.$('[data-in="del.q"]'); n.focus(); n.setSelectionRange(p, p); });
  UI.on('del.new', () => Forms.delivery());
  UI.on('del.print', d => Print.challan(App.core.listDeliveries().find(x => x.id === Number(d.id)), App.core.getSettings()));
  UI.on('del.cancel', async d => { const x = App.core.listDeliveries().find(r => r.id === Number(d.id)); if (await UI.confirm(`Cancel challan ${x.no}? The boxes will be counted as not sent.`, { danger: true, yes: 'Yes, cancel' })) App.act(() => App.core.cancelDelivery(x.id), 'Challan cancelled'); });
})();
