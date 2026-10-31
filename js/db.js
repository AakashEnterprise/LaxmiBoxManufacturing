// Saves the database inside the browser (IndexedDB) and, optionally, into a real file on the PC (Chrome/Edge).
(function () {
  const NAME = 'packflow', STORE = 'kv'; let dbp = null; const mem = {};
  const open = () => dbp || (dbp = new Promise(res => {
    if (!window.indexedDB) return res(null);
    try { const r = indexedDB.open(NAME, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch { res(null); } }));
  const get = async k => { const d = await open(); if (!d) return mem[k] ?? null; return new Promise(res => { const q = d.transaction(STORE).objectStore(STORE).get(k); q.onsuccess = () => res(q.result ?? null); q.onerror = () => res(null); }); };
  const put = async (k, v) => { const d = await open(); if (!d) { mem[k] = v; return true; } return new Promise((res, rej) => { const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(v, k); t.oncomplete = () => res(true); t.onerror = () => rej(t.error); }); };
  let handle = null;
  const writeFile = async bytes => { if (!handle) return; try { if ((await handle.queryPermission({ mode: 'readwrite' })) !== 'granted') return; const w = await handle.createWritable(); await w.write(bytes); await w.close(); } catch (e) { console.warn('file backup failed', e); } };
  window.Store = {
    load: () => get('db'),
    async save(bytes) { await put('db', bytes); await writeFile(bytes); },
    async initFile() { try { handle = await get('handle'); } catch { handle = null; } return !!handle; },
    async askFilePermission() { try { if (handle && (await handle.queryPermission({ mode: 'readwrite' })) === 'prompt') await handle.requestPermission({ mode: 'readwrite' }); } catch {} },
    async chooseFile(bytes) { if (!window.showSaveFilePicker) throw new Error('Your browser cannot do this. Please use Google Chrome or Microsoft Edge, or use "Save a backup now".');
      handle = await window.showSaveFilePicker({ suggestedName: 'packflow-live-backup.sqlite', types: [{ description: 'PackFlow data', accept: { 'application/octet-stream': ['.sqlite'] } }] }); await put('handle', handle); await writeFile(bytes); return true; },
    hasFile: () => !!handle, async clearFile() { handle = null; await put('handle', null); },
    async persist() { try { return await navigator.storage?.persist?.(); } catch { return false; } }
  };
  window.openCore = async function () {
    const bin = Uint8Array.from(atob(window.SQL_WASM_B64), c => c.charCodeAt(0));
    const SQL = await initSqlJs({ wasmBinary: bin }); const saved = await Store.load(); await Store.initFile();
    return { core: PF.createCore(SQL, saved ? new Uint8Array(saved) : null, b => Store.save(b)), SQL };
  };
})();
