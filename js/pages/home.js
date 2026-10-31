(function () {
  const { money } = Calc; const h = UI.h;
  const P = App.pages;
  P.home = () => { const s = App.core.getSettings(); const d = App.core.home(); const hr = new Date().getHours(); const hello = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const quick = [['🧮', 'Make a price quote', 'Tell a customer the price of a box', 'home.quote'], ['📦', 'Add a new order', 'Customer confirmed? Start here', 'home.order'], ['🏭', "Add today's work", 'How many boxes were made', 'home.work'], ['🚚', 'Send boxes', 'Make a delivery challan', 'home.del'], ['🧾', 'Make a bill', 'GST invoice for delivered boxes', 'home.inv'], ['💰', 'Money received', 'Customer paid you', 'home.pay']];
    const flow = [['Quote', 'quotes'], ['Order', 'orders'], ['Make boxes', 'work'], ['Send', 'deliveries'], ['Bill', 'bills'], ['Get paid', 'bills']];
    const lb = s.last_backup; const stale = !lb || Calc.daysBetween(lb, Calc.todayStr()) > 7; if (stale && (App.core.listCustomers().length || App.core.listOrders().length)) d.attention.push({ level: 'amber', text: lb ? 'Your last backup is more than 7 days old. Save a backup now.' : 'You have not saved a backup yet. Save one now.', go: 'settings' });
    const att = d.attention.slice(0, 12);
    return UI.head(hello + '!', `${s.company_name} - here is what needs you today.`) +
      `<div class="cols3">${UI.tile(d.running, 'Orders being made')}${UI.tile(money(d.toCollect), 'Money to collect')}${UI.tile(money(d.overdue), 'Late payments', d.overdue > 0 ? 'red' : '')}${UI.tile(money(d.salesMonth), 'Sales this month')}</div>
      <div class="card"><h2>What do you want to do?</h2><div class="quick">${quick.map(([e, t, x, a]) => `<button class="qbtn" data-act="${a}"><span class="e">${e}</span><div><b>${t}</b><span>${x}</span></div></button>`).join('')}</div></div>
      <div class="card"><h2>How the work flows</h2><div class="flow">${flow.map(([t, p], i) => `<button class="s" data-act="nav.go" data-id="${p}">${i + 1}. ${t}</button>${i < flow.length - 1 ? '<span class="a">→</span>' : ''}`).join('')}</div><p class="small">Click any step to open it. The app keeps all numbers matched for you.</p></div>
      <div class="card"><h2>Needs your attention ${att.length ? '(' + d.attention.length + ')' : ''}</h2>${att.length ? att.map(a => `<div class="attn ${a.level}" data-act="nav.go" data-id="${a.go}" role="button" tabindex="0"><span>${a.level === 'red' ? '🔴' : '🟡'}</span><span>${h(a.text)}</span></div>`).join('') : '<div class="note green">All good. Nothing is late, low or waiting.</div>'}</div>`; };
  UI.on('home.quote', () => App.go('quotes')); UI.on('home.order', () => App.go('orders', 'new')); UI.on('home.work', () => Forms.work()); UI.on('home.del', () => Forms.delivery()); UI.on('home.inv', () => Forms.invoice()); UI.on('home.pay', () => Forms.payment());
})();
