// Tests for src/lib/previews.ts ("Featured in <app>" rows from LG Home's previews).   Run: npm test
import {build} from 'esbuild';

const launched = [];
globalThis.__launched = launched;
const out = new URL('../node_modules/.cache-previews-test.mjs', import.meta.url).pathname;
await build({
	entryPoints: [new URL('../src/lib/previews.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error',
	plugins: [{name: 'stubs', setup (b) {
		b.onResolve({filter: /^\.\/(apps|launch)$/}, (a) => ({path: a.path, namespace: 'stub'}));
		b.onLoad({filter: /.*/, namespace: 'stub'}, () => ({
			contents: 'export const exec = () => Promise.resolve(""); export const shellQuote = (v) => v; export const launchApp = (id, params) => { globalThis.__launched.push([id, params]); return Promise.resolve(); };',
			loader: 'js'
		}));
	}}]
});
const t = await import(out);
let fail = 0;
const eq = (a, b, m) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) { fail++; console.log('FAIL', m, JSON.stringify(a), '!=', JSON.stringify(b)); } else console.log('ok  ', m); };

// the shape of a db8 find on com.webos.service.contentminer.contents:1 (webOS 4.5), with sample titles
const item = (id, title, url, click) => ({_id: id, type: 'content', titleText: title, image: {url, width: 444, height: 250}, onClick: click});
const reply = {returnValue: true, results: [
	{appId: 'amazon', contents: [
		{_id: 'h', type: 'title', titleText: '', image: {url: ''}, onClick: {targetAppId: 'amazon'}},
		item('a1', 'Sample Film', 'https://img.example/a1.jpg', {contentId: 'amzn1.dv.gti.sample', launchParam: null, targetAppId: 'amazon'}),
		item('a2', '', 'https://img.example/a2.jpg', {contentId: 'x', targetAppId: 'amazon'}),
		item('a3', 'No picture', '', {contentId: 'y', targetAppId: 'amazon'}),
		item('a4', 'Plain http picture', 'http://img.example/a4.jpg', {contentId: 'z', targetAppId: 'amazon'})
	]},
	{appId: 'com.webos.app.discovery', contents: [{_id: 'd1', type: 'app', titleText: 'Some App', image: {url: 'https://img.example/d.jpg'}, onClick: {targetAppId: 'some.app'}}]},
	{appId: 'bbc.iplayer.3.0', contents: [
		item('b1', 'Sample Series, Episode 1', 'https://img.example/b1.jpg', {contentId: 'https://example/launch?deeplink=1', launchParam: {IPChannelCode: '', contentTarget: 'https://example/launch?deeplink=1'}, targetAppId: 'bbc.iplayer.3.0'})
	]},
	{appId: 'not.installed', contents: [item('n1', 'Elsewhere', 'https://img.example/n1.jpg', {contentId: 'n', targetAppId: 'not.installed'})]},
	{appId: 'youtube.leanback.v4', contents: Array.from({length: 20}, (_, i) => item('y' + i, 'Video ' + i, 'https://img.example/y.jpg', {contentId: 'v=abc' + i, targetAppId: 'youtube.leanback.v4'}))}
]};
const installed = {amazon: 'Prime Video', 'bbc.iplayer.3.0': 'BBC iPlayer', 'youtube.leanback.v4': 'YouTube', 'com.webos.app.discovery': 'LG Content Store'};
const rows = t.previewRows(reply, installed);
eq(rows.map((r) => r.label), ['Featured in Prime Video', 'Featured in BBC iPlayer', 'Featured in YouTube'], 'one row per installed app, labelled with the app\'s own name; LG\'s app adverts and apps not on the TV are left out');
eq(rows[0].items.map((i) => i.title), ['Sample Film'], 'headers, items without a title or a secure picture are skipped');
eq(rows[0].items[0].params, {contentTarget: 'amzn1.dv.gti.sample'}, 'without launch parameters, the content id is the deep link');
eq(rows[1].items[0].params, {IPChannelCode: '', contentTarget: 'https://example/launch?deeplink=1'}, 'an app\'s own launch parameters are passed as they are');
eq(rows[2].items.length, 16, 'at most 16 items per app');
eq(t.previewRows({returnValue: false}, installed), [], 'a failed read gives no rows');
eq(t.previewRows(null, installed), [], 'no reply gives no rows');

await t.openPreview(rows[2].items[3]);
eq(launched.pop(), ['youtube.leanback.v4', {contentTarget: 'v=abc3'}], 'OK launches the app at the item');

if (fail) { console.log(`${fail} failed`); process.exit(1); }
