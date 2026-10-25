// The single report file: old tail kept, new events appended, Debug tab overwrite. Run: npm test
import {build} from 'esbuild';
import {execFileSync} from 'child_process';
import {readFileSync, writeFileSync, existsSync, rmSync} from 'fs';
const out = new URL('../node_modules/.cache-logfile-test.mjs', import.meta.url).pathname;
await build({stdin: {contents: `export * from './lib/logfile'; export {log} from './lib/log';`, resolveDir: new URL('../src', import.meta.url).pathname, loader: 'ts'}, bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error',
  plugins: [{name: 'stub', setup (b) {
    b.onResolve({filter: /^\.\/apps$/}, (a) => ({path: a.path, namespace: 'stub'}));
    b.onResolve({filter: /^\.\/failure$/}, (a) => ({path: a.path, namespace: 'stub2'}));
    b.onLoad({filter: /.*/, namespace: 'stub'}, () => ({contents: `import {execFileSync} from 'child_process'; export const exec = (c) => Promise.resolve(execFileSync('sh', ['-c', c]).toString()); export const shellQuote = (v) => "'" + String(v).replace(/'/g, "'\\\\''") + "'";`, loader: 'js'}));
    b.onLoad({filter: /.*/, namespace: 'stub2'}, () => ({contents: `export const rootState = () => 'yes';`, loader: 'js'}));
  }}]});
globalThis.window = globalThis;
const m = await import(out);
const F = '/tmp/hearth-debug.txt';
let fail = 0;
const eq = (a, b, msg) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) fail++; console.log(ok ? 'ok  ' : 'FAIL', msg, ok ? '' : `(${JSON.stringify(a)} != ${JSON.stringify(b)})`); };
const old = Array.from({length: 150}, (_, i) => `old line ${i}`).join('\n') + '\n';
writeFileSync(F, old);
const stop = m.startLogFile(10);
await new Promise((r) => setTimeout(r, 300));
eq([m.previousRunLines().length, m.previousRunLines()[99]], [100, 'old line 149'], 'the last 100 lines of the old file are read');
eq(readFileSync(F, 'utf8').trim().split('\n').length, 100, 'and the file is trimmed to them');
m.log("it's a test; $HOME `x`");
await new Promise((r) => setTimeout(r, 4400));
const txt = readFileSync(F, 'utf8');
eq(txt.indexOf("it's a test; $HOME `x`") > 0 && txt.endsWith('\n'), true, 'a new event is appended, special characters intact');
await m.writeReport('REPORT\nline2\n');
eq(readFileSync(F, 'utf8'), 'REPORT\nline2\n', 'the Debug tab overwrites the one file');
stop();
rmSync(F);
process.exit(fail ? 1 : 0);
