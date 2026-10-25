// Phase 10g: bundled app icons, softer light themes, icon opacity, Debug row limit.   Run: npm test
import {build} from 'esbuild';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url)) + '/';
const src = path.resolve(dir, '../src') + '/';
const out = path.resolve(dir, '../node_modules/.cache-p10g-test.mjs');
await build({stdin: {contents: `export * from './config/appicons'; export * from './lib/sourceicons'; export {appTile} from './lib/tiles'; export * from './lib/backgrounds'; export {THEMES, LIGHT_THEMES} from './theme/tokens'; export {DEFAULT_CONFIG, loadConfig, RANGES} from './lib/storage'; export {DENSE_ROWS, debugPages} from './lib/debuginfo'; export {PREFS, applyPref} from './lib/prefs';`, resolveDir: src, loader: 'ts'},
	bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'silent', define: {'import.meta.glob': '__glob'}, banner: {js: 'const __glob = () => ({});'}});
const a = await import(out);
let fail = 0;
const eq = (got, want, name) => { const ok = JSON.stringify(got) === JSON.stringify(want); console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : `\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`)); if (!ok) fail++; };

// the list and public/icons/apps match
const files = readdirSync(dir + '../public/icons/apps').sort();
eq(a.APP_ICONS.map((i) => i.file).sort(), files, 'every shipped app icon is offered, and nothing else');
eq(new Set(a.APP_ICONS.map((i) => i.file)).size, a.APP_ICONS.length, 'no icon listed twice');

// an app edit with a bundled icon
const app = {id: 'x.app', title: 'X', iconUrl: 'data:own'};
const t = a.appTile(app, {'x.app': {icon: 'app:amazon.png'}});
eq([t.imageUrl, t.sourceIcon], ['icons/apps/amazon.png', undefined], 'bundled icon shows as the tile image');
eq(a.appTile(app, {'x.app': {icon: 'hdmi'}}).sourceIcon, 'hdmi', 'a drawn icon still works');
eq(a.appTile(app, {'x.app': {icon: 'app:amazon.png', iconData: 'data:image/png;base64,AA=='}}).imageUrl, 'data:image/png;base64,AA==', 'own picture wins over a bundled icon');
eq(a.cleanEdits({k: {icon: 'app:amazon.png'}, j: {icon: 'app:nope.png'}, l: {icon: 'app:../x.png'}}), {k: {icon: 'app:amazon.png'}}, 'unknown bundled icons are dropped when loading');

// light themes: nothing close to white
const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
for (const n of a.LIGHT_THEMES) {
	const c = a.THEMES[n];
	const worst = Math.max(...[c.bg, c.wallpaperStart, c.wallpaperMid, c.wallpaperEnd, c.tileBg].map(lum));
	eq([worst < 0.88, lum(c.tileBgFocus) < 0.95, lum(c.badgeText) < 0.92], [true, true, true], `${n}: backgrounds and tiles below 88%, focused tile below 95%, badge text below 92% (${worst.toFixed(2)})`);
}
const ids = a.BACKGROUNDS.map((b) => b.id);
eq([ids.indexOf('paper'), ids.indexOf('sandplain')], [-1, -1], 'plain light backgrounds are gone');
eq(a.BACKGROUNDS.filter((b) => /light/.test(b.label)).every((b) => lum(b.colors[0]) < 0.88), true, 'light gradients start below 88% brightness');

// icon opacity
eq([a.DEFAULT_CONFIG.iconOpacity, a.RANGES.iconOpacity.min, a.RANGES.iconOpacity.max], [100, 30, 100], 'icon opacity: default 100, 30 to 100');
const p = a.PREFS.filter((x) => x.id === 'iconOpacity')[0];
eq([p.tab, p.label], ['wallpaper', 'Icon opacity'], 'icon opacity row is in the Wallpaper tab');
eq([a.applyPref(a.DEFAULT_CONFIG, 'iconOpacity', 'left').iconOpacity, a.applyPref({...a.DEFAULT_CONFIG, iconOpacity: 30}, 'iconOpacity', 'left').iconOpacity], [90, 30], 'icon opacity steps down in tens and stops at 30');

// Debug page 2 never lists more event rows than fit
const events = Array.from({length: 40}, (_, i) => `12:00:${String(i).padStart(2, '0')} Root check: the Homebrew Channel answered`);
const pages = a.debugPages({about: '', rootDetail: '', appList: null, weather: 'off', config: a.DEFAULT_CONFIG, events, userAgent: 'Chrome/87.0', stats: null});
eq([a.DENSE_ROWS, pages[1].right.lines.length], [22, 22], 'Debug page 2 shows 22 event rows at most');
console.log(fail ? `${fail} FAILED` : 'all ok');
process.exit(fail ? 1 : 0);
