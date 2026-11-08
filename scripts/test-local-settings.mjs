// local build: settings tests for this fork's own rows (src/lib/storage.ts, src/lib/prefs.ts).   Run: npm run test:local
import {build} from 'esbuild';
import {writeFileSync} from 'fs';

const out = new URL('../node_modules/.cache-local-settings-test.mjs', import.meta.url).pathname;
const stubApps = {name: 'stub-apps', setup (b) {
	b.onResolve({filter: /\.\/apps$/}, () => ({path: 'apps-stub', namespace: 'stub'}));
	b.onLoad({filter: /.*/, namespace: 'stub'}, () => ({contents: 'export const exec = () => Promise.resolve(""); export const shellQuote = (v) => v;', loader: 'js'}));
}};
await build({entryPoints: [new URL('../src/lib/prefs.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error', plugins: [stubApps]});
const storage = await build({entryPoints: [new URL('../src/lib/storage.ts', import.meta.url).pathname], bundle: true, format: 'esm', write: false, platform: 'node', logLevel: 'error'});
const storageOut = new URL('../node_modules/.cache-local-storage-test.mjs', import.meta.url).pathname;
writeFileSync(storageOut, storage.outputFiles[0].text);
const store = {};
globalThis.localStorage = {getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }};
const p = await import(out);
const s = await import(storageOut);
let fail = 0;
const eq = (a, b, m) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) { fail++; console.log('FAIL', m, JSON.stringify(a), '!=', JSON.stringify(b)); } else console.log('ok  ', m); };
const KEY = 'customlauncher-config-v1';
const c0 = s.DEFAULT_CONFIG;

// ---- Check for updates is hidden (local build) ----
eq([p.essentialIds(c0).includes('updates'), p.essentialChoices().includes('updates')], [false, false], 'Edit Essentials neither lists nor offers the hidden update check');

// ---- Continue Watching (Plex) ----
eq([c0.continueWatching, s.loadConfig().continueWatching], [false, false], 'Continue Watching is off on a fresh install');
store[KEY] = JSON.stringify({defaultsV: s.DEFAULTS_VERSION, continueWatching: true});
eq(s.loadConfig().continueWatching, true, 'a saved On is read back');
store[KEY] = JSON.stringify({defaultsV: s.DEFAULTS_VERSION, continueWatching: 'yes'});
eq(s.loadConfig().continueWatching, false, 'anything but true reads as Off');
store[KEY] = JSON.stringify({continueWatching: true, theme: 'forest'});        // no defaultsV: the one-time look reset runs
eq([s.loadConfig().continueWatching, s.loadConfig().theme], [true, 'black'], 'the one-time look reset keeps Continue Watching');
eq(p.resetLook({...c0, continueWatching: true}).continueWatching, true, 'Reset look leaves it alone');
for (const k of Object.keys(store)) delete store[k];
eq(p.applyPref(c0, 'continueWatching', 'ok').continueWatching, true, 'OK switches it on');
const plexRow = (info) => p.optionsFor('system', c0, info).find((o) => o.id === 'plexAccount');
eq([plexRow({homeHook: null}).valueText, plexRow({homeHook: null, plexServer: 'Home'}).valueText], ['Not signed in', 'Signed in · Home'], 'the Plex account row says whether Hearth is signed in, and to which server');
eq(p.optionsFor('system', c0, {homeHook: null, root: 'no'}).filter((o) => o.id === 'continueWatching' || o.id === 'plexAccount').map((o) => !!o.disabled), [false, false], 'neither Plex row needs root');
eq(p.optionsFor('system', c0, {homeHook: null}, 'Plex').filter((o) => o.grouped).map((o) => o.id), ['continueWatching', 'plexAccount'], 'both rows are in the System tab\'s Plex group');

console.log(fail ? `${fail} FAILED` : 'all ok');
process.exit(fail ? 1 : 0);
