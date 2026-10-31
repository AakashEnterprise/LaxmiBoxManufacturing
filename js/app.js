// App shell (NO login): navigation (expand/collapse sidebar + mobile drawer), text size, page routing.
(function () {
  const h = UI.h;
  const NAV = [['home', '🏠', 'Home'], ['quotes', '🧮', 'Price Quote'], ['orders', '📦', 'Orders'], ['work', '🏭', "Today's Work"], ['stock', '📜', 'Paper Stock'], ['buy', '🛒', 'Buy Paper'], ['deliveries', '🚚', 'Deliveries'], ['bills', '🧾', 'Bills & Money In'], ['customers', '👥', 'Customers'], ['money', '📊', 'Reports & Expenses'], ['settings', '⚙️', 'Settings']];
  const MOBILE_Q = '(max-width: 1023px)';
  const SIZES = [['s', 'Small'], ['m', 'Normal'], ['l', 'Large'], ['xl', 'Extra large']];
  const App = window.App = { pages: {}, core: null, cur: 'home', arg: null };

  // ---- tiny storage helper: works even if the browser blocks localStorage ----
  const mem = {}; const sget = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? (mem[k] ?? d) : v; } catch { return mem[k] ?? d; } };
  const sset = (k, v) => { mem[k] = v; try { localStorage.setItem(k, v); } catch {} };
  const isMobile = () => (window.matchMedia ? window.matchMedia(MOBILE_Q).matches : window.innerWidth < 1024);

  // ---- TEXT SIZE (whole app scales because every size is in rem) ----
  App.size = {
    get: () => (SIZES.some(s => s[0] === sget('pf_size', 'm')) ? sget('pf_size', 'm') : 'm'),
    set(k) { sset('pf_size', k); document.documentElement.dataset.size = k; const l = SIZES.find(s => s[0] === k)[1]; UI.$$('.size-lbl').forEach(e => { e.textContent = l; }); },
    cycle() { const i = SIZES.findIndex(s => s[0] === App.size.get()); App.size.set(SIZES[(i + 1) % SIZES.length][0]); },
    list: SIZES
  };
  document.documentElement.dataset.size = App.size.get();

  // ---- NAVIGATION: ONE source of truth. Desktop = 'pf_nav_collapsed'. Mobile = body.nav-open. Every change goes through applyNav(). ----
  function applyNav() {
    const b = document.body, mobile = isMobile(), collapsed = !mobile && sget('pf_nav_collapsed', '0') === '1';
    b.classList.toggle('nav-collapsed', collapsed); if (!mobile) b.classList.remove('nav-open');
    const open = b.classList.contains('nav-open');
    const burger = UI.$('[data-act="nav.toggle"]'); if (burger) { burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    const col = UI.$('[data-act="nav.collapse"]'); if (col) { col.setAttribute('aria-expanded', String(!collapsed)); col.title = collapsed ? 'Expand menu' : 'Collapse menu'; col.querySelector('.ic').textContent = collapsed ? '»' : '«'; }
    const side = UI.$('#side'); if (side) side.setAttribute('aria-hidden', String(mobile && !open));
  }
  App.nav = {
    toggleDrawer(force) { const b = document.body; const want = force === undefined ? !b.classList.contains('nav-open') : force; b.classList.toggle('nav-open', want && isMobile()); applyNav(); if (b.classList.contains('nav-open')) { const f = UI.$('#side .nav.on') || UI.$('#side .nav'); f && f.focus(); } },
    toggleCollapse() { sset('pf_nav_collapsed', sget('pf_nav_collapsed', '0') === '1' ? '0' : '1'); applyNav(); }
  };
  UI.on('nav.toggle', () => App.nav.toggleDrawer()); UI.on('nav.close', () => App.nav.toggleDrawer(false)); UI.on('nav.collapse', () => App.nav.toggleCollapse()); UI.on('nav.go', d => App.go(d.id)); UI.on('size.cycle', () => App.size.cycle());
  UI.on('size.set', d => { App.size.set(d.id); App.render(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('nav-open') && !UI.$('.overlay')) App.nav.toggleDrawer(false); });
  if (window.matchMedia) { const mq = window.matchMedia(MOBILE_Q); (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(applyNav); }
  window.addEventListener('resize', applyNav); window.addEventListener('orientationchange', applyNav);

  // ---- page handling ----
  App.render = function () { const m = UI.$('#main'); if (!m) return; const top = m.scrollTop; const fn = App.pages[App.cur] || App.pages.home; m.innerHTML = '<div class="page">' + fn(App.arg) + '</div>'; App.arg = null; m.scrollTop = top; setActive(); };
  App.go = function (name, arg) { App.cur = name; App.arg = arg || null; UI.closeAll(); document.body.classList.remove('nav-open'); App.render(); const m = UI.$('#main'); if (m) m.scrollTop = 0; applyNav(); };
  App.refresh = function () { UI.redrawModals(); App.render(); };
  App.act = function (fn, ok) { try { const r = fn(); App.refresh(); if (ok) UI.toast(ok); return r === undefined ? true : r; } catch (e) { UI.toast(e instanceof PF.CoreError ? e.message : 'Something went wrong: ' + e.message, 'err'); return false; } };
  function setActive() { UI.$$('#side .nav[data-id]').forEach(b => { const on = b.dataset.id === App.cur; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    const red = App.core.home().attention.filter(a => a.level === 'red').length; const d = UI.$('#side .nav[data-id="home"] .dot'); if (d) { d.textContent = red; d.hidden = !red; }
    const s = App.core.getSettings(); UI.$$('.co-name').forEach(e => { e.textContent = s.company_name; }); document.title = s.company_name + ' - PackFlow'; }
  window.addEventListener('error', e => { if (App.core) UI.toast('Something went wrong: ' + e.message, 'err'); });

  function shell() {
    const lbl = SIZES.find(s => s[0] === App.size.get())[1];
    document.getElementById('app').innerHTML = `<div class="shell"><header class="topbar"><button class="iconbtn" data-act="nav.toggle" aria-controls="side" aria-expanded="false" aria-label="Open menu">☰</button><span class="tbrand">📦 <span class="co-name"></span></span><button class="iconbtn sizebtn" data-act="size.cycle" aria-label="Change text size" title="Text size">Aa</button></header>
      <div class="backdrop" data-act="nav.close"></div>
      <aside class="side" id="side" aria-label="Main menu"><div class="brand"><span class="logo">📦</span><span class="lbl co-name"></span><button class="x close-nav" data-act="nav.close" aria-label="Close menu">✕</button></div>
        <nav>${NAV.map(([k, ic, l]) => `<button class="nav" data-act="nav.go" data-id="${k}" title="${l}"><span class="ic">${ic}</span><span class="lbl">${l}</span>${k === 'home' ? '<span class="dot" hidden>0</span>' : ''}</button>`).join('')}</nav>
        <button class="nav foot" data-act="size.cycle" title="Change text size"><span class="ic">Aa</span><span class="lbl">Text size: <b class="size-lbl">${lbl}</b></span></button>
        <button class="nav foot collapse-btn" data-act="nav.collapse" aria-expanded="true"><span class="ic">«</span><span class="lbl">Collapse menu</span></button></aside>
      <main id="main" tabindex="-1"></main></div>`;
    applyNav(); App.render();
  }
  function welcome() {
    const s = App.core.getSettings(); if (s.setup_done) return; App.core.setSettings({ setup_done: '1' });
    UI.form({ title: 'Welcome to PackFlow 👋', submitLabel: 'Save and start', fields: [{ name: 'company_name', label: 'Your factory / company name', required: true, autoFocus: true, default: s.company_name === 'My Box Factory' ? '' : s.company_name, help: 'Printed on your bills. You can change it later in Settings.' }, { name: 'company_phone', label: 'Phone (optional)', half: true, type: 'tel' }, { name: 'company_gstin', label: 'Your GSTIN (optional)', half: true }],
      onSave: v => { if (!(v.company_name || '').trim()) throw new Error('Please enter your company name.'); App.core.setSettings({ company_name: v.company_name.trim(), company_phone: v.company_phone, company_gstin: (v.company_gstin || '').toUpperCase() }); UI.toast('All set! Start with Customers or Price Quote.'); } });
  }
  window.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('app');
    try { const b = await openCore(); App.core = b.core; App.boot = b; shell(); welcome(); document.addEventListener('click', () => Store.askFilePermission(), { once: true }); Store.persist(); }
    catch (e) { app.innerHTML = `<div class="gate"><div class="gatebox"><h1>Could not open the data</h1><p class="err">${h(e.message || e)}</p><p>Please close this page and open it again. If it keeps happening, restore your latest backup file from Settings.</p></div></div>`; }
  });
})();
