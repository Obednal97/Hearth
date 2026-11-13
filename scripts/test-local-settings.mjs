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

// ---- moving backgrounds (video wallpaper) ----
{
	const V = '/media/developer/hearth-videos';
	eq([s.DEFAULT_WALLPAPER.videoChange, s.DEFAULT_WALLPAPER.videoShade, s.loadConfig().wallpaper.videoChange, s.loadConfig().wallpaper.videoShade], [-1, true, -1, true], 'defaults: change each time you come Home, shade On');
	store[KEY] = JSON.stringify({defaultsV: s.DEFAULTS_VERSION, wallpaper: {mode: 'folder', path: '/x'}});
	eq([s.loadConfig().wallpaper.videoChange, s.loadConfig().wallpaper.videoShade], [-1, true], 'saved settings without the fields read as the defaults');
	store[KEY] = JSON.stringify({defaultsV: s.DEFAULTS_VERSION, wallpaper: {mode: 'video', path: V, videoChange: 1800, videoShade: false, shuffle: false}});
	const vc = s.loadConfig().wallpaper;
	eq([vc.mode, vc.path, vc.videoChange, vc.videoShade, vc.shuffle, vc.recursive], ['video', V, 1800, false, false, false], 'a saved video folder, its Change video, Shade Off and shuffle are read back');
	store[KEY] = JSON.stringify({defaultsV: s.DEFAULTS_VERSION, wallpaper: {mode: 'video', path: V + '/abstract-dusk.mp4', videoChange: 999, videoShade: 'no'}});
	const vf = s.loadConfig().wallpaper;
	eq([vf.mode, vf.path, vf.videoChange, vf.videoShade], ['video', V + '/abstract-dusk.mp4', -1, true], 'a single video is read back; an unknown Change video and a non-false shade fall back to the defaults');
	for (const bad of ['', 'relative/x.mp4', '/bad\npath.mp4', '/' + 'a'.repeat(500)]) {
		store[KEY] = JSON.stringify({defaultsV: s.DEFAULTS_VERSION, wallpaper: {mode: 'video', path: bad}});
		eq(s.loadConfig().wallpaper.mode, 'gradient', `video mode with an unusable path (${JSON.stringify(bad).slice(0, 24)}) becomes the built-in background`);
	}
	for (const k of Object.keys(store)) delete store[k];
	const vFolder = {...c0, wallpaper: {...c0.wallpaper, mode: 'video', path: V}};
	const vFile = {...c0, wallpaper: {...c0.wallpaper, mode: 'video', path: V + '/abstract-dusk.mp4'}};
	eq(p.optionsFor('wallpaper', vFolder).map((o) => o.id).join(','), 'wallpaper,videoChange,shuffle,videoShade,wallpaperOpacity,fadeStrength', 'a video folder shows Change video, Shuffle and the shade switch (no picture timer)');
	eq(p.optionsFor('wallpaper', vFile).map((o) => o.id).join(','), 'wallpaper,videoShade,wallpaperOpacity,fadeStrength', 'one video: only the shade switch');
	eq(p.optionsFor('wallpaper', c0).some((o) => o.id === 'videoShade' || o.id === 'videoChange'), false, 'no video rows without a moving background');
	eq([p.optionsFor('wallpaper', vFile)[0].valueText, p.optionsFor('wallpaper', vFolder)[0].valueText], ['Moving: Abstract dusk', 'Moving: every video in hearth-videos'], 'the wallpaper row names the video nicely, or the folder');
	eq([p.applyPref(vFolder, 'videoShade', 'ok').wallpaper.videoShade, p.applyPref(vFolder, 'videoShade', 'left').wallpaper.videoShade], [false, true], 'OK switches the shade off; arrows leave it alone');
	const steps = [];
	let cc = {...vFolder, wallpaper: {...vFolder.wallpaper, videoChange: 0}};
	for (let i = 0; i < 5; i++) { steps.push(p.optionsFor('wallpaper', cc).find((o) => o.id === 'videoChange').valueText); cc = p.applyPref(cc, 'videoChange', 'ok'); }
	eq([steps, cc.wallpaper.videoChange], [['Never', 'Each time you come Home', 'Every 10 minutes', 'Every 30 minutes', 'Every 1 hour'], 0], 'Change video steps through its choices and wraps round to Never');
	const back = p.applyPref({...vFolder, wallpaper: {...vFolder.wallpaper, videoChange: 600, videoShade: false}}, 'wallpaper', 'right');
	eq([back.wallpaper.mode, back.wallpaper.path, back.wallpaper.videoChange, back.wallpaper.videoShade], ['gradient', '', 600, false], 'an arrow on a moving background goes back to the built-in background, keeping the video settings');
	eq(p.resetLook(vFolder).wallpaper.mode, 'gradient', 'Reset look ends a moving background');
}

// ---- quiet mode: dim style "Fade the widgets" ----
{
	eq([c0.quietFade, s.loadConfig().quietFade], [false, false], 'dim style is Darken on a fresh install');
	store[KEY] = JSON.stringify({defaultsV: s.DEFAULTS_VERSION, quietFade: true, quietSec: 120, quietDimSec: 120, standbyMin: 2});
	const q = s.loadConfig();
	eq([q.quietFade, q.quietSec, q.quietDimSec, 'standbyMin' in q], [true, 120, 120, false], 'Fade and up to 120 s are read back; the old standby setting is dropped');
	for (const k of Object.keys(store)) delete store[k];
	const ids = (c) => p.optionsFor('look', c).map((o) => o.id).filter((id) => id.indexOf('quiet') === 0).join(',');
	const fade = p.applyPref(c0, 'quietFade', 'ok');
	eq([p.optionsFor('look', c0).find((o) => o.id === 'quietFade').valueText, fade.quietFade, p.optionsFor('look', fade).find((o) => o.id === 'quietFade').valueText], ['Darken', true, 'Fade the widgets'], 'OK switches Darken to Fade the widgets');
	eq([ids(c0), ids(fade), ids({...c0, quietDimSec: 0})], ['quietSec,quietDimSec,quietFade,quietDimLevel,quietPowerOff', 'quietSec,quietDimSec,quietFade,quietPowerOff', 'quietSec,quietDimSec,quietPowerOff'], 'the style shows with a dim stage; the strength only for Darken');
	eq(p.resetLook(fade).quietFade, false, 'Reset look goes back to Darken');
}

// ---- The old key filter stays (local build: upstream 2.2 retires it) ----
{
	const gone = new URL('../node_modules/.cache-local-remapgone-test.mjs', import.meta.url).pathname;
	await build({entryPoints: [new URL('../src/lib/remapgone.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: gone, platform: 'node', logLevel: 'error', plugins: [stubApps]});
	const r = await import(gone);
	const mapped = {...c0, remap: {on: true, keys: {Key_webOS_Netflix: {t: 'app', id: 'com.example.app'}}}, remapKept: true};
	eq(r.keyFilterRetired(mapped), true, 'a TV with mapped buttons keeps its key filter: nothing is taken out');
}

console.log(fail ? `${fail} FAILED` : 'all ok');
process.exit(fail ? 1 : 0);
