// EXPERIMENTAL: the app list without root, through the TV's own remote-control service (SSAP, the protocol LG's phone
// remote uses). The page opens a WebSocket to the TV itself, pairs once (the TV shows an "allow" message; press OK), keeps
// the key in this app's web storage, and asks for the list of launch points. Written from the public protocol; no code
// from other projects. It may not work on every TV or firmware (ports and certificates differ): any failure just means
// the built-in list stays in use. Needs "LG Connect Apps" switched on in the TV's own settings.

import {lunaCall} from './luna';

type Json = Record<string, unknown>;

export interface TvLaunchPoint {id: string; title: string; icon?: string; removable?: boolean}

const STORE = 'hearth-ssap';
const PERMISSIONS = ['LAUNCH', 'READ_INSTALLED_APPS', 'READ_RUNNING_APPS'];
const PAIR_WAIT_MS = 65000;

interface Saved {url: string; key: string}

const msg = (e: unknown): string => String(e && (e as Error).message ? (e as Error).message : e || 'unknown');

function loadSaved (): Saved | null {
	try { const s = JSON.parse(window.localStorage.getItem(STORE) || 'null') as Saved | null; return s && s.url && s.key ? s : null; } catch { return null; }
}

function saveKey (s: Saved | null): void {
	try { if (s) window.localStorage.setItem(STORE, JSON.stringify(s)); else window.localStorage.removeItem(STORE); } catch { /* ignore */ }
}

/** Has this TV been paired (a key is saved)? */
export function tvPaired (): boolean { return loadSaved() !== null; }

/** Forget the saved pairing. */
export function forgetTv (): void { saveKey(null); }

function findIp (): Promise<string> {
	return lunaCall<Json>('luna://com.webos.service.connectionmanager/getStatus', {}, 5000).then((r) => {
		const wired = (r.wired || {}) as Json;
		const wifi = (r.wifi || {}) as Json;
		const pick = wired.state === 'connected' && wired.ipAddress ? wired.ipAddress : wifi.ipAddress || wired.ipAddress;
		return pick ? String(pick) : '';
	}).catch(() => '');
}

/** Addresses to try, best first: plain port 3000, then the encrypted port 3001 (newer firmware), on the TV itself. */
export function endpoints (ip: string): string[] {
	const list = ['ws://127.0.0.1:3000'];
	if (ip) list.push('ws://' + ip + ':3000');
	list.push('wss://127.0.0.1:3001');
	if (ip) list.push('wss://' + ip + ':3001');
	return list;
}

/** Opens a socket; rejects when it cannot open within `ms`. */
function openSocket (url: string, ms = 4000): Promise<WebSocket> {
	return new Promise<WebSocket>((resolve, reject) => {
		let done = false;
		let ws: WebSocket;
		const finish = (fn: () => void) => { if (done) return; done = true; window.clearTimeout(timer); fn(); };
		const timer = window.setTimeout(() => finish(() => { try { ws.close(); } catch { /* ignore */ } reject(new Error('no answer')); }), ms);
		try { ws = new WebSocket(url); } catch (e) { finish(() => reject(e)); return; }
		ws.onopen = () => finish(() => resolve(ws));
		ws.onerror = () => finish(() => reject(new Error('refused')));
		ws.onclose = () => finish(() => reject(new Error('closed')));
	});
}

function parse (data: unknown): Json | null {
	try { return JSON.parse(String(data)) as Json; } catch { return null; }
}

/** Registers with the TV. With a saved key the TV accepts silently; without one it shows the prompt and waits for OK. */
function register (ws: WebSocket, key: string, ms: number): Promise<{key: string; prompted: boolean}> {
	return new Promise((resolve, reject) => {
		let prompted = false;
		const timer = window.setTimeout(() => reject(new Error(prompted ? 'nobody pressed OK on the TV in time' : 'the TV did not answer')), ms);
		ws.onmessage = (ev) => {
			const m = parse(ev.data);
			if (!m) return;
			const p = (m.payload || {}) as Json;
			if (m.type === 'response' && p.pairingType) prompted = true;
			if (m.type === 'registered') { window.clearTimeout(timer); resolve({key: String(p['client-key'] || ''), prompted}); }
			if (m.type === 'error') { window.clearTimeout(timer); reject(new Error(String(m.error || 'the TV refused'))); }
		};
		ws.onclose = () => { window.clearTimeout(timer); reject(new Error('the TV closed the connection')); };
		const payload: Json = {pairingType: 'PROMPT', forcePairing: false, manifest: {manifestVersion: 1, appVersion: '1.0', permissions: PERMISSIONS}};
		if (key) payload['client-key'] = key;
		ws.send(JSON.stringify({id: 'register_0', type: 'register', payload}));
	});
}

let counter = 0;

function request (ws: WebSocket, uri: string, ms = 8000): Promise<Json> {
	const id = 'hearth_' + (++counter);
	return new Promise((resolve, reject) => {
		const timer = window.setTimeout(() => reject(new Error('the TV did not answer')), ms);
		ws.onmessage = (ev) => {
			const m = parse(ev.data);
			if (!m || m.id !== id) return;
			window.clearTimeout(timer);
			if (m.type === 'error') reject(new Error(String(m.error || 'error')));
			else resolve((m.payload || {}) as Json);
		};
		ws.send(JSON.stringify({id, type: 'request', uri, payload: {}}));
	});
}

/** Pairs with this TV: tries each address; the TV shows an "allow" message and the person presses OK. Saves the key. */
export function pairWithTv (): Promise<void> {
	return findIp().then((ip) => {
		const known = loadSaved();
		const urls = endpoints(ip);
		if (known && urls.indexOf(known.url) > 0) urls.splice(urls.indexOf(known.url), 1);
		if (known) urls.unshift(known.url);
		const tryNext = (i: number, last: string): Promise<void> => {
			if (i >= urls.length) return Promise.reject(new Error(last || 'no remote-control port could be opened. Is "LG Connect Apps" on in the TV settings?'));
			const url = urls[i];
			return openSocket(url).then((ws) => register(ws, known && known.url === url ? known.key : '', PAIR_WAIT_MS).then((r) => {
				ws.close();
				if (!r.key) throw new Error('the TV gave no key');
				saveKey({url, key: r.key});
			}, (e) => { try { ws.close(); } catch { /* ignore */ } throw e; })).catch((e) => {
				// a refusal or timeout at the prompt is final; a closed port means try the next address
				const text = msg(e);
				if (text === 'refused' || text === 'closed' || text === 'no answer') return tryNext(i + 1, '');
				return Promise.reject(e);
			});
		};
		return tryNext(0, '');
	});
}

/** The TV's launch points, read with the saved key (no prompt). Rejects when not paired or the TV does not answer. */
export function listTvApps (): Promise<TvLaunchPoint[]> {
	const saved = loadSaved();
	if (!saved) return Promise.reject(new Error('not paired'));
	return openSocket(saved.url).then((ws) => register(ws, saved.key, 8000).then((r) => {
		if (r.prompted) { forgetTv(); throw new Error('the TV asked to pair again: use the Options row once more'); }
		return request(ws, 'ssap://com.webos.applicationManager/listLaunchPoints');
	}).then((payload) => {
		ws.close();
		const raw = payload.launchPoints;
		if (!Array.isArray(raw)) throw new Error('the TV gave no list');
		return (raw as Json[]).map((p) => ({
			id: String(p.id || ''),
			title: String(p.title || ''),
			icon: String(p.largeIcon || p.icon || '') || undefined,
			removable: typeof p.removable === 'boolean' ? p.removable : undefined
		}));
	}, (e) => { try { ws.close(); } catch { /* ignore */ } throw e; }));
}

/** A launch point's icon path as an address the page can load (file paths become file:// addresses). */
export function iconAddress (path: string): string | undefined {
	if (/^(https?|file|data):/.test(path)) return path;
	if (path.charAt(0) === '/') return 'file://' + encodeURI(path);
	return undefined;
}

/** Resolves true when the page can show this picture. */
export function iconLoads (src: string, ms = 3000): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		const img = new Image();
		const timer = window.setTimeout(() => resolve(false), ms);
		img.onload = () => { window.clearTimeout(timer); resolve(img.naturalWidth > 0); };
		img.onerror = () => { window.clearTimeout(timer); resolve(false); };
		img.src = src;
	});
}
