// Tests for src/lib/plex.ts (local build: Continue Watching addresses, cards, re-finding the server, opening).   Run: npm run test:local
import {build} from 'esbuild';

const launched = [];
globalThis.__launched = launched;
const store = {};
globalThis.localStorage = {getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }};
const out = new URL('../node_modules/.cache-plex-test.mjs', import.meta.url).pathname;
await build({
	entryPoints: [new URL('../src/lib/plex.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error',
	plugins: [{name: 'stub-launch', setup (b) {
		b.onResolve({filter: /^\.\/launch$/}, () => ({path: 'launch-stub', namespace: 'stub'}));
		b.onLoad({filter: /.*/, namespace: 'stub'}, () => ({
			contents: 'export const launchApp = (id, params) => { globalThis.__launched.push([id, params]); return Promise.resolve(); }; export const appExists = (id) => Promise.resolve(globalThis.__installed === id);',
			loader: 'js'
		}));
	}}]
});
const t = await import(out);
let fail = 0;
const eq = (a, b, m) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) { fail++; console.log('FAIL', m, JSON.stringify(a), '!=', JSON.stringify(b)); } else console.log('ok  ', m); };

// ---- server addresses ----
const res = {name: 'Home', httpsRequired: false, connections: [
	{protocol: 'https', address: '192.0.2.10', port: 32400, uri: 'https://192-0-2-10.x.plex.direct:32400', local: true, relay: false},
	{protocol: 'https', address: '203.0.113.9', port: 14348, uri: 'https://203-0-113-9.x.plex.direct:14348', local: false, relay: false},
	{protocol: 'https', address: '198.51.100.2', port: 8443, uri: 'https://198-51-100-2.x.plex.direct:8443', local: false, relay: true}
]};
eq(t.candidates(res), ['http://192.0.2.10:32400', 'https://192-0-2-10.x.plex.direct:32400', 'https://203-0-113-9.x.plex.direct:14348'], 'plain http on the home network first, then secure local, then remote; never the relay');
eq(t.candidates({...res, httpsRequired: true})[0], 'https://192-0-2-10.x.plex.direct:32400', 'no plain http when the server requires secure connections');

// ---- cards ----
const server = {name: 'Home', uri: 'http://192.0.2.10:32400', token: 'TKN'};
const ep = t.toContinueItem({ratingKey: '101', guid: 'plex://episode/abc', type: 'episode', title: 'The Pilot', grandparentTitle: 'Example Show', parentIndex: 2, index: 5, thumb: '/library/metadata/101/thumb/1', viewOffset: 2340000, duration: 3600000}, server, 320, 180);
eq([ep.key, ep.title, ep.detail], ['101', 'Example Show', 'S2 · E5 · 21m left'], 'an episode card shows the show, the episode and the time left');
eq(Math.round(ep.progress * 100), 65, 'progress is the part watched');
eq(ep.imageUrl.indexOf('http://192.0.2.10:32400/photo/:/transcode?width=320&height=180&minSize=1&upscale=1&url=%2Flibrary%2Fmetadata%2F101%2Fthumb%2F1'), 0, 'pictures come small, through the server\'s resizer');
const sp = t.toContinueItem({ratingKey: '9', type: 'episode', title: 'Xmas', grandparentTitle: 'Show', parentIndex: 0, index: 2}, server, 320, 180);
eq(sp.detail, 'Special 2', 'specials are not "S0"');
const mv = t.toContinueItem({ratingKey: '202', guid: 'plex://movie/def', type: 'movie', title: 'Night of the Living Dead', art: '/a', thumb: '/t', viewOffset: 2040000, duration: 5760000}, server, 320, 180);
eq([mv.title, mv.detail], ['Night of the Living Dead', '1h 2m left'], 'a movie card shows its title and the time left');
eq(mv.imageUrl.indexOf('url=%2Fa') !== -1, true, 'movies use their wide artwork');

// ---- sign-in state ----
eq(t.plexSignedIn(), false, 'not signed in at first');
eq(typeof JSON.parse(store['customlauncher-plex-v1']).clientId, 'string', 'a client id is kept for this TV');
store['customlauncher-plex-v1'] = JSON.stringify({clientId: 'c', token: 'tok', server});
eq([t.plexSignedIn(), t.plexServerName()], [true, 'Home'], 'signed in with a server');
store['customlauncher-plex-continue-v1'] = JSON.stringify([mv]);
eq(t.cachedContinue().length, 1, 'the last list is kept for the next start');
t.plexSignOut();
eq([t.plexSignedIn(), t.cachedContinue().length, JSON.parse(store['customlauncher-plex-v1']).clientId], [false, 0, 'c'], 'signing out forgets the token and the list, keeps the client id');

// ---- reading the list: a moved server is found again (at most hourly), a 401 signs out ----
const net = {};          // address prefix -> {status, body}; anything else fails like an unreachable host
const asked = [];
globalThis.XMLHttpRequest = class {
	open (m, u) { this.u = u; }
	setRequestHeader () {}
	send () {
		asked.push(this.u);
		const hit = Object.keys(net).find((k) => this.u.indexOf(k) === 0);
		if (hit && net[hit].before) net[hit].before();
		setTimeout(() => { if (!hit) { this.onerror(); return; } this.status = net[hit].status || 200; this.responseText = JSON.stringify(net[hit].body || {}); this.onload(); }, 0);
	}
};
const moved = 'http://192.0.2.20:32400';
net['https://plex.tv/api/v2/resources'] = {body: [{name: 'Home', provides: 'server', owned: true, connections: [{protocol: 'https', address: '192.0.2.20', port: 32400, uri: 'https://192-0-2-20.x.plex.direct:32400', local: true, relay: false}]}]};
net[moved] = {body: {MediaContainer: {Metadata: [{ratingKey: '202', type: 'movie', title: 'Sample Film'}]}}};
const signIn = (uri) => { store['customlauncher-plex-v1'] = JSON.stringify({clientId: 'c', token: 'tok', server: {name: 'Home', uri, token: 'tok'}}); };
const settle = (p) => p.then((v) => ['ok', v], (e) => ['failed', e.message]);
signIn('http://192.0.2.10:32400');
const r1 = await settle(t.fetchContinue(12, 320, 180));
eq([r1[0], r1[1].length, JSON.parse(store['customlauncher-plex-v1']).server.uri], ['ok', 1, moved], 'the old address fails: the server is found again at its new address and read');
signIn('http://192.0.2.10:32400');
asked.length = 0;
const r2 = await settle(t.fetchContinue(12, 320, 180));
eq([r2[0], asked.some((u) => u.indexOf('plex.tv') !== -1)], ['failed', false], 'within the hour a failed read does not ask plex.tv again');
signIn(moved);
store['customlauncher-plex-continue-v1'] = '[]';
net[moved] = {status: 401};
const r3 = await settle(t.fetchContinue(12, 320, 180));
eq([r3, t.plexServerName(), 'customlauncher-plex-continue-v1' in store], [['failed', 'Plex sign-in expired'], null, false], 'a 401 signs out and forgets the saved list');
const realNow = Date.now;
Date.now = () => realNow() + 2 * 3600e3;          // an hour on: re-finding is allowed again
signIn('http://192.0.2.10:32400');
net[moved] = {body: {MediaContainer: {Metadata: []}}};
net['https://plex.tv/api/v2/resources'].before = () => t.plexSignOut();
const r4 = await settle(t.fetchContinue(12, 320, 180));
delete net['https://plex.tv/api/v2/resources'].before;
Date.now = realNow;
eq([r4[0], t.plexSignedIn()], ['failed', false], 'signing out while the server is being found again does not sign back in');

// ---- opening ----
await t.openContinue(mv);
eq(launched.pop(), ['cdp-30', {contentTarget: 'plex://movie/def'}], 'without Plex Lite the official Plex app opens at the item');
await t.openContinue({...mv, guid: ''});
eq(launched.pop(), ['cdp-30', {}], 'an item without a Plex guid just opens the Plex app');
globalThis.__installed = 'com.bednal.plexlite';
await t.openContinue(mv, true);
eq(launched.pop(), ['com.bednal.plexlite', {ratingKey: '202', action: 'details'}], 'Plex Lite, when installed, gets the item and what to do with it');

if (fail) { console.log(`${fail} failed`); process.exit(1); }
