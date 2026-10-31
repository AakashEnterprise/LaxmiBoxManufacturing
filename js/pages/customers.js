(function () {
  const { money, money2, dateFmt } = Calc; const h = UI.h; let q = '';
  const P = App.pages;
  P.customers = arg => { if (arg === 'new') setTimeout(() => Forms.customer()); const rows = App.core.listCustomers().filter(r => UI.matches(r, q));
    return UI.head('Customers', 'People and companies who buy boxes from you. Click a customer to see their orders, bills and payments.', `${UI.search(q, 'cust.q')}<button class="btn primary" data-act="cust.add">+ Add customer</button>`) +
      UI.table([{ h: 'Name', f: r => `<b>${h(r.name)}</b>` }, { h: 'Contact', f: r => h([r.contact, r.phone].filter(Boolean).join(' · ') || '-') }, { h: 'City', f: r => h(r.city || '-') },
        { h: 'Owes you', r: 1, f: r => r.balance > 0 ? `<b>${money(r.balance)}</b>` : r.balance < 0 ? `<span class="small">advance ${money(-r.balance)}</span>` : '-' },
        { h: '', f: r => `<button class="btn sm" data-act="cust.edit" data-id="${r.id}">Edit</button> <button class="btn sm ghost" data-act="cust.del" data-id="${r.id}">Remove</button>` }], rows,
        { rowAct: 'cust.view', empty: UI.empty('👥', 'No customers yet. Add your first customer to start.', '<button class="btn primary" data-act="cust.add">+ Add customer</button>') }); };
  UI.onIn('cust.q', el => { q = el.value; const pos = el.selectionStart; App.render(); const n = UI.$('[data-in="cust.q"]'); n.focus(); n.setSelectionRange(pos, pos); });
  UI.on('cust.add', () => Forms.customer());
  UI.on('cust.edit', (d, el, e) => { e.stopPropagation(); Forms.customer(App.core.listCustomers().find(c => c.id === Number(d.id))); });
  UI.on('cust.del', async (d, el, e) => { e.stopPropagation(); const c = App.core.listCustomers().find(x => x.id === Number(d.id)); if (await UI.confirm(`Remove ${c.name} from the list? Old bills and orders are kept.`, { danger: true, yes: 'Yes, remove' })) App.act(() => App.core.archiveCustomer(c.id), 'Customer removed'); });
  UI.on('cust.view', d => { const id = Number(d.id);
    UI.modal({ title: App.core.listCustomers().find(c => c.id === id).name, wide: true, render: () => { const c = App.core.listCustomers().find(x => x.id === id); if (!c) return '';
      const inv = App.core.listInvoices().filter(i => i.customer_id === id && !i.cancelled), ord = App.core.listOrders().filter(o => o.customer_id === id && !o.cancelled), pays = App.core.listPayments().filter(p => p.customer_id === id && !p.cancelled);
      return `<div class="cols3">${UI.tile(money(Math.max(0, c.balance)), c.balance < 0 ? 'Advance paid' : 'They owe you')}${UI.tile(ord.filter(o => o.status !== 'Delivered').length, 'Open orders')}${UI.tile(c.credit_limit > 0 ? money(c.credit_limit) : 'No limit', 'Credit limit')}${UI.tile(c.pay_days + ' days', 'Payment time')}</div>
      <p class="small">${h([c.contact, c.phone, c.city, c.gstin && 'GSTIN ' + c.gstin].filter(Boolean).join(' · '))}</p><div class="actions" style="margin:8px 0"><button class="btn primary" data-act="cust.pay" data-id="${id}">💰 Receive payment</button></div>
      <h3>Bills</h3>${UI.table([{ h: 'Bill', f: r => h(r.no) }, { h: 'Date', f: r => dateFmt(r.date) }, { h: 'Total', r: 1, f: r => money2(r.total) }, { h: 'Due', r: 1, f: r => money2(r.due) }, { h: 'Status', f: r => UI.badge(r.status, UI.tone(r.status)) }], inv, { empty: '<p class="small">No bills yet.</p>' })}
      <h3>Payments received</h3>${UI.table([{ h: 'Receipt', f: r => h(r.no) }, { h: 'Date', f: r => dateFmt(r.date) }, { h: 'Mode', f: r => h(r.mode) }, { h: 'Amount', r: 1, f: r => money2(r.amount) }], pays, { empty: '<p class="small">No payments yet.</p>' })}`; } }); });
  UI.on('cust.pay', d => Forms.payment(Number(d.id)));
})();
