// Small UI toolkit: modals, forms, tables, toasts, printing. No framework.
(function () {
  const { esc: h, money, money2 } = Calc; const acts = {}, ins = {}; const stack = [];
  const UI = { h, on: (n, f) => { acts[n] = f; }, onIn: (n, f) => { ins[n] = f; }, $: (s, r = document) => r.querySelector(s), $$: (s, r = document) => [...r.querySelectorAll(s)] };

  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el || el.disabled) return; const f = acts[el.dataset.act]; if (f) f(el.dataset, el, e); });
  ['input', 'change'].forEach(t => document.addEventListener(t, e => { const el = e.target.closest('[data-in]'); if (el && ins[el.dataset.in]) ins[el.dataset.in](el, e); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && stack.length) stack[stack.length - 1].close(); });

  UI.modal = function ({ title, render, body, wide, onClose }) {
    const el = document.createElement('div'); el.className = 'overlay';
    const m = { el, render, close() { el.remove(); const i = stack.indexOf(m); if (i >= 0) stack.splice(i, 1); onClose && onClose(); },
      draw() { el.innerHTML = `<div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-label="${h(title)}"><div class="modal-head"><h2>${h(title)}</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="modal-body">${render ? render() : body}</div></div>`; } };
    el.addEventListener('mousedown', e => { if (e.target === el) m.close(); }); el.addEventListener('click', e => { if (e.target.closest('[data-close]')) m.close(); });
    m.draw(); document.getElementById('modals').appendChild(el); stack.push(m); const f = el.querySelector('[autofocus]'); if (f) f.focus(); return m;
  };
  UI.redrawModals = () => stack.filter(m => m.render).forEach(m => m.draw());
  UI.closeAll = () => [...stack].forEach(m => m.close());

  UI.toast = (text, tone = 'ok') => { const box = document.getElementById('toasts'); if (!box) return; const t = document.createElement('div'); t.className = 'toast ' + tone; t.textContent = (tone === 'err' ? '⚠ ' : '✓ ') + text; box.appendChild(t); setTimeout(() => t.remove(), tone === 'err' ? 7000 : 3500); };

  UI.confirm = (text, { yes = 'Yes, continue', no = 'No, go back', danger = false } = {}) => new Promise(res => {
    let done = false;
    const m = UI.modal({ title: 'Please confirm', body: `<p class="confirm-text">${h(text)}</p><div class="modal-foot"><button class="btn ghost" data-no>${h(no)}</button><button class="btn ${danger ? 'danger' : 'primary'}" data-yes autofocus>${h(yes)}</button></div>`, onClose: () => { if (!done) { done = true; res(false); } } });
    m.el.querySelector('[data-yes]').onclick = () => { done = true; res(true); m.close(); }; m.el.querySelector('[data-no]').onclick = () => m.close(); });

  const opt = (o, v) => `<option value="${h(o.v)}"${String(o.v) === String(v) ? ' selected' : ''}>${h(o.l)}</option>`;
  UI.field = (f, v) => { const id = 'f_' + f.name; let input;
    if (f.type === 'select') input = `<select id="${id}" name="${f.name}"${f.in ? ` data-in="${f.in}"` : ''}><option value="">${h(f.placeholder || '-- choose --')}</option>${(f.options || []).map(o => opt(o, v)).join('')}</select>`;
    else if (f.type === 'textarea') input = `<textarea id="${id}" name="${f.name}" rows="2">${h(v)}</textarea>`;
    else input = `<input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${h(v)}"${f.step ? ` step="${f.step}"` : ''}${f.min !== undefined ? ` min="${f.min}"` : ''}${f.placeholder ? ` placeholder="${h(f.placeholder)}"` : ''}${f.autoFocus ? ' autofocus' : ''}${f.type === 'number' ? ' inputmode="decimal"' : ''}${f.in ? ` data-in="${f.in}"` : ''}>`;
    return `<div class="field${f.half ? ' half' : ''}"><label for="${id}">${h(f.label)}${f.required ? '<span class="req"> *</span>' : ''}</label>${input}${f.help ? `<div class="help">${h(f.help)}</div>` : ''}</div>`; };

  // Opens a form. onSave(values) may throw an Error - the message is shown in red inside the form.
  UI.form = function ({ title, fields, initial = {}, onSave, submitLabel = 'Save', wide, extra }) {
    const vals = {}; fields.forEach(f => { vals[f.name] = initial[f.name] ?? f.default ?? ''; });
    const m = UI.modal({ title, wide, body: `<form novalidate><div class="grid">${fields.map(f => UI.field(f, vals[f.name])).join('')}</div><div data-extra></div><div class="err" role="alert" hidden></div><div class="modal-foot"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary" type="submit">${h(submitLabel)}</button></div></form>` });
    const form = m.el.querySelector('form'), ex = m.el.querySelector('[data-extra]'), err = m.el.querySelector('.err');
    const read = () => { const o = {}; new FormData(form).forEach((v, k) => { o[k] = v; }); return o; };
    const paint = () => { if (extra) ex.innerHTML = extra(read()) || ''; }; form.addEventListener('input', paint); form.addEventListener('change', paint); paint();
    form.addEventListener('submit', async e => { e.preventDefault(); err.hidden = true; const btn = form.querySelector('[type=submit]'); btn.disabled = true;
      try { await onSave(read()); m.close(); App.refresh(); } catch (x) { err.textContent = '⚠ ' + (x.message || x); err.hidden = false; btn.disabled = false; } });
    return m;
  };

  UI.badge = (t, tone = 'grey') => `<span class="badge ${tone}">${h(t)}</span>`;
  const TONES = { New: 'blue', Making: 'amber', Ready: 'green', Delivered: 'green', Cancelled: 'grey', Paid: 'green', 'Part paid': 'amber', Unpaid: 'red', Open: 'blue', Converted: 'green', Ordered: 'amber', Received: 'green', Low: 'amber', Empty: 'red', OK: 'green' };
  UI.tone = s => TONES[s] || 'grey';
  UI.bar = (v, max, tone = '') => `<div class="bar"><div class="fill ${tone}" style="width:${max > 0 ? Math.min(100, (v / max) * 100) : 0}%"></div></div>`;
  UI.empty = (icon, text, btn = '') => `<div class="empty"><div class="big">${icon}</div><p>${h(text)}</p>${btn}</div>`;
  UI.head = (title, tip, actions = '') => `<div class="pagehead"><div><h1>${h(title)}</h1>${tip ? `<p class="tip">${h(tip)}</p>` : ''}</div><div class="actions">${actions}</div></div>`;
  UI.tabs = (items, cur, act) => `<div class="tabs" role="tablist">${items.map(([k, l]) => `<button class="tab${cur === k ? ' on' : ''}" role="tab" aria-selected="${cur === k}" data-act="${act}" data-id="${k}">${h(l)}</button>`).join('')}</div>`;
  UI.tile = (n, l, cls = '') => `<div class="tile ${cls}"><div class="n">${n}</div><div class="l">${h(l)}</div></div>`;
  UI.search = (val, act) => `<input class="search" type="search" placeholder="Search..." value="${h(val)}" data-in="${act}" aria-label="Search">`;
  UI.matches = (row, q) => !q || JSON.stringify(Object.values(row)).toLowerCase().includes(q.toLowerCase());
  // cols: [{h:'Name', r:true(right aligned), f:row=>html}]  - f must return safe HTML (use UI.h() on user text)
  UI.table = (cols, rows, { empty, rowAct } = {}) => rows.length ? `<div class="tablewrap"><table><thead><tr>${cols.map(c => `<th class="${c.r ? 'r' : ''}">${h(c.h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr${rowAct ? ` class="click" tabindex="0" data-act="${rowAct}" data-id="${r.id}"` : ''}>${cols.map(c => `<td data-label="${h(c.h)}" class="${c.r ? 'r' : ''}">${c.f(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : (empty || UI.empty('📭', 'Nothing here yet.'));
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches && e.target.matches('tr.click')) e.target.click(); });

  UI.print = (bodyHtml, title = 'Document') => {
    const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(f); const d = f.contentWindow.document; d.open();
    d.write(`<!doctype html><html><head><meta charset="utf-8"><title>${h(title)}</title><style>body{font:13px/1.45 Arial,sans-serif;color:#111;margin:24px}h1{font-size:20px;margin:0}h2{font-size:15px;margin:14px 0 4px}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #444;padding:5px 7px;text-align:left}th{background:#eee}.r{text-align:right}.head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:8px}.box{border:1px solid #444;padding:8px;margin:8px 0}.sign{display:flex;justify-content:space-between;margin-top:60px}.sign div{border-top:1px solid #111;padding-top:4px;width:30%;text-align:center}.small{font-size:11px;color:#444}.tot td{font-weight:bold}</style></head><body>${bodyHtml}</body></html>`); d.close();
    setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch {} setTimeout(() => f.remove(), 2000); }, 250); };
  UI.download = (name, data, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); };
  UI.csv = (name, headers, rows) => { const q = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }; UI.download(name, '\ufeff' + [headers, ...rows].map(r => r.map(q).join(',')).join('\r\n'), 'text/csv'); };
  window.UI = UI;
})();
