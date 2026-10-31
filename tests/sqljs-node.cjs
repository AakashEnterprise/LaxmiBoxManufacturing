// test helper only: loads the SAME sql-wasm.js file the browser uses
const fs = require('fs'), vm = require('vm'), path = require('path');
const sandbox = { module: { exports: {} }, exports: {}, require, process, console, Buffer, __dirname: path.join(__dirname, '..', 'js', 'vendor'), __filename: 'x', WebAssembly, TextDecoder, TextEncoder, setTimeout, clearTimeout, URL };
vm.createContext(sandbox); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'vendor', 'sql-wasm.js'), 'utf8'), sandbox);
const init = sandbox.module.exports; const wasm = Buffer.from(fs.readFileSync(path.join(__dirname, '..', 'js', 'vendor', 'sql-wasm-data.js'), 'utf8').match(/"([A-Za-z0-9+/=]+)"/)[1], 'base64');
module.exports = () => init({ wasmBinary: wasm });
