// Tests for the moving-background helpers in src/lib/videowall.ts (local build).   Run: npm test
import {build} from 'esbuild';
// lib/apps.ts pulls in Vite-only code, so it is swapped for a stub: the shell is passed in by the tests.
const out = new URL('../node_modules/.cache-videowall-test.mjs', import.meta.url).pathname;
await build({
  entryPoints: [new URL('../src/lib/videowall.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error',
  plugins: [{name: 'stub-apps', setup(b) {
    b.onResolve({filter: /\.\/apps$/}, () => ({path: 'apps-stub', namespace: 'stub'}));
    b.onLoad({filter: /.*/, namespace: 'stub'}, () => ({contents: "export const exec = () => Promise.reject(new Error('no shell in tests')); export const shellQuote = (v) => \"'\" + v.replace(/'/g, \"'\\\\''\") + \"'\";", loader: 'js'}));
  }}]
});
const store = {};
globalThis.localStorage = {getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }};
const v = await import(out);
let fail = 0;
const eq = (a, b, m) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) { fail++; console.log('FAIL', m, JSON.stringify(a), '!=', JSON.stringify(b)); } else console.log('ok  ', m); };

// ---- names ----
eq(v.videoTitle('abstract-dusk.mp4'), 'Abstract dusk', 'name: abstract-dusk.mp4 → Abstract dusk');
eq(v.videoTitle('/media/developer/hearth-videos/sea_waves.at.night.MOV'), 'Sea waves at night', 'name: path, underscores, dots and upper-case extension');
eq(v.videoTitle('Northern  Lights--4K.webm'), 'Northern Lights 4K', 'name: capitals kept, runs of separators become one space');
eq(v.videoTitle('-.mp4'), '-.mp4', 'name: nothing left but separators keeps the file name');
eq([v.isVideo('a.mp4'), v.isVideo('a.WEBM'), v.isVideo('a.mov'), v.isVideo('a.mkv'), v.isVideo('._a.mp4'), v.isVideo('a.jpg')], [true, true, true, false, false, false], 'video files: .mp4 .webm .mov only, no hidden files');
eq([v.isVideoFile('/x/clip.mp4'), v.isVideoFile('/x/hearth-videos'), v.isVideoFile('/x/videos/')], [true, false, false], 'a path is a file when it ends like a video, else a folder');

// ---- folder listing ----
const listing = 'zebra.mp4\nAbstract-Dusk.mp4\nabstract-dusk.jpg\nabstract-dusk.png\nsea.webm\nsea.PNG\nold/\n._zebra.mp4\n.hidden.mp4\nnotes.txt\nclip.mkv\ncity.mov\ncity.jpeg\ncity.jpg\r\n\n';
eq(v.parseVideoListing(listing, '/v'), [
  {path: '/v/Abstract-Dusk.mp4', poster: '/v/abstract-dusk.jpg'},
  {path: '/v/city.mov', poster: '/v/city.jpg'},
  {path: '/v/sea.webm', poster: '/v/sea.PNG'},
  {path: '/v/zebra.mp4', poster: ''}
], 'listing: videos A to Z with same-name posters (.jpg before .jpeg before .png), folders, hidden files and other types left out');
eq(v.parseVideoListing('', '/v'), [], 'empty folder: no videos');

const shell = (text) => { const calls = []; const run = (c) => { calls.push(c); return Promise.resolve(text); }; return {run, calls}; };
let sh = shell(listing);
eq(await v.listVideosWith('/media/developer/hearth-videos/', sh.run), v.parseVideoListing(listing, '/media/developer/hearth-videos'), 'folder choice lists the folder');
eq(sh.calls, ["ls -1p -- '/media/developer/hearth-videos' 2>/dev/null"], 'one quoted ls call');
sh = shell(listing);
eq(await v.listVideosWith('/v/city.mov', sh.run), [{path: '/v/city.mov', poster: '/v/city.jpg'}], 'file choice: its folder is listed for the poster');
eq(sh.calls, ["ls -1p -- '/v' 2>/dev/null"], 'file choice lists its parent folder');
eq(await v.listVideosWith('/v/gone.mp4', shell(listing).run), [], 'file choice that is not there: none (reported as missing)');
eq(await v.listVideosWith('/v/it\'s.mp4', () => Promise.reject(new Error('no root'))), [{path: '/v/it\'s.mp4', poster: ''}], 'file choice without a shell still plays (no poster)');
let rejected = false;
try { await v.listVideosWith('/v/folder', () => Promise.reject(new Error('no root'))); } catch { rejected = true; }
eq(rejected, true, 'folder choice without a shell fails (the problem is reported)');
rejected = false;
try { await v.listVideosWith('relative/x.mp4', shell('').run); } catch { rejected = true; }
eq(rejected, true, 'unsafe path refused before any shell call');

// ---- "Change video" decision ----
const at = (o) => ({visible: true, returning: false, awayMs: 0, shownMs: 0, ...o});
const MIN = 60000;
eq(v.VIDEO_CHANGE_VALUES, [0, -1, 600, 1800, 3600], 'choices: Never, each time you come Home, every 10, 30, 60 minutes');
eq(v.videoChangeDue(0, at({returning: true, awayMs: 60 * MIN, shownMs: 999 * MIN})), false, 'Never: never changes');
eq(v.videoChangeDue(-1, at({returning: true, awayMs: 5 * MIN})), true, 'Home: back after 5 minutes away changes');
eq(v.videoChangeDue(-1, at({returning: true, awayMs: 5 * MIN - 1})), false, 'Home: back after less than 5 minutes keeps the video');
eq(v.videoChangeDue(-1, at({returning: false, awayMs: 60 * MIN, shownMs: 60 * MIN})), false, 'Home: no change while staying on Home');
eq(v.videoChangeDue(-1, at({visible: false, returning: true, awayMs: 60 * MIN})), false, 'Home: no change while hidden');
eq(v.videoChangeDue(600, at({shownMs: 10 * MIN})), true, 'every 10 min: changes after 10 minutes on screen');
eq(v.videoChangeDue(600, at({shownMs: 10 * MIN - 1})), false, 'every 10 min: not before');
eq(v.videoChangeDue(1800, at({visible: false, shownMs: 45 * MIN})), false, 'every 30 min: never while hidden');
eq(v.videoChangeDue(3600, at({returning: true, awayMs: 120 * MIN, shownMs: 10 * MIN})), false, 'every hour: time away does not count');
eq([v.nextInOrder(['/a', '/b', '/c'], '/b'), v.nextInOrder(['/a', '/b', '/c'], '/c'), v.nextInOrder(['/a', '/b'], '/gone'), v.nextInOrder([], '/a')], ['/c', '/a', '/a', ''], 'next in A–Z order wraps round, starts at the first');

// ---- remembered video ----
v.rememberVideo('/v', {path: '/v/sea.webm', poster: '/v/sea.PNG'});
eq(v.recallVideo('/v'), {path: '/v/sea.webm', poster: '/v/sea.PNG'}, 'the video on screen is remembered for its folder');
eq(v.recallVideo('/v/'), null, 'not for another choice');
v.rememberVideo('/v/city.mov', {path: '/v/city.mov', poster: ''});
eq(v.recallVideo('/v/city.mov'), {path: '/v/city.mov', poster: ''}, 'a single video is remembered');
store['hearth-video-now-v1'] = JSON.stringify({choice: '/v', path: '/elsewhere/x.mp4', poster: ''});
eq(v.recallVideo('/v'), null, 'a remembered video outside the chosen folder is ignored');
store['hearth-video-now-v1'] = '{broken';
eq(v.recallVideo('/v'), null, 'corrupt storage: nothing remembered');

// ---- the shade's glow follows the clock ----
const clock = {show: true, top: 20, left: 50, size: 140, align: 'center'};
eq(v.glowCentre(clock), '50% 40%', 'default widget: glow at 50% 40% (the approved look)');
eq(v.glowCentre({...clock, top: 50, size: 210}), '50% 80%', 'lower and bigger widget: glow moves down');
eq(v.glowCentre({...clock, left: 10, align: 'left'}), '22% 40%', 'left-aligned widget: glow to the right of its left edge');
eq(v.glowCentre({...clock, left: 98, align: 'right'}), '86% 40%', 'right-aligned widget: glow to the left of its right edge');
eq(v.glowCentre({...clock, top: 70, size: 220}), '50% 95%', 'kept on screen');
eq(v.glowBackground({...clock, show: false}), 'none', 'widget off: no glow');
eq(v.glowBackground(clock), 'radial-gradient(ellipse 34% 30% at 50% 40%, rgba(0,0,0,.5) 0%, rgba(0,0,0,.28) 55%, rgba(0,0,0,0) 100%)', 'glow gradient as approved');

console.log(fail ? `${fail} FAILED` : 'all ok');
process.exit(fail ? 1 : 0);
