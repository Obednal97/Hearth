// "Reassign remote buttons", the picture view: simple line drawings of LG's remotes, made for Hearth (not traced from
// LG's artwork), as data. Each button has a place, a shape and, when it can be given a new job, the TV's key name.
// Also: moving between buttons with the arrows, placing the labels beside the drawing, and guessing the remote.
// Pure (no imports from the app), so it can be tested on its own.

export type RemoteModel = 'magic-2019' | 'magic-2020' | 'ir';

export type ButtonShape = 'circle' | 'pill' | 'rocker' | 'ring' | 'key';

export interface RemoteButton {
	id: string;
	/** written on the drawing (short) */
	text: string;
	/** said in the side panel */
	label: string;
	shape: ButtonShape;
	/** centre, in the drawing's units */
	x: number;
	y: number;
	w: number;
	h: number;
	/** the TV's key name: this button can be given a new job */
	key?: string;
	/** a colour key's colour */
	color?: string;
	/** the Linux key code the remote sends (how LG Input Hook names buttons) */
	linux?: number;
}

export interface RemoteLayout {
	model: RemoteModel;
	name: string;
	/** the outline of the remote */
	body: {x: number; y: number; w: number; h: number; r: number};
	/** the drawing's size (the labels go to the right of the body) */
	width: number;
	height: number;
	buttons: RemoteButton[];
}

const c = (id: string, text: string, label: string, x: number, y: number, r: number, key?: string): RemoteButton =>
	({id, text, label, shape: 'circle', x, y, w: r * 2, h: r * 2, key});
const pill = (id: string, text: string, label: string, x: number, y: number, w: number, h: number, key?: string): RemoteButton =>
	({id, text, label, shape: 'pill', x, y, w, h, key});

/** 1-9, then the bottom row of the pad. Never reassigned (holding a number is LG's Quick Access). */
function numberPad (xs: number[], ys: number[], r: number, bottom: RemoteButton[]): RemoteButton[] {
	const out: RemoteButton[] = [];
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			const n = String(row * 3 + col + 1);
			out.push(c('n' + n, n, n, xs[col], ys[row], r));
		}
	}
	return out.concat(bottom);
}

const MAGIC_BODY = {x: 60, y: 20, w: 200, h: 880, r: 90};

function magicTop (): RemoteButton[] {
	return [
		c('power', 'POWER', 'Power', 110, 82, 17),
		c('input', 'INPUT', 'Input', 210, 82, 17, 'Key_webOS_InputSource'),
		...numberPad([110, 160, 210], [145, 192, 239], 18, [
			c('list', 'LIST', 'List', 110, 286, 18),
			c('n0', '0', '0', 160, 286, 18),
			c('more', '•••', '••• (more actions)', 210, 286, 18, 'Key_webOS_ScreenRemote')
		]),
		{id: 'vol', text: 'VOL', label: 'Volume', shape: 'rocker', x: 100, y: 375, w: 40, h: 100},
		{id: 'ch', text: 'CH', label: 'Channels', shape: 'rocker', x: 220, y: 375, w: 40, h: 100},
		c('mute', 'MUTE', 'Mute', 160, 345, 16),
		c('mic', 'MIC', 'Microphone', 160, 405, 16, 'Key_webOS_Voice'),
		{id: 'ok', text: 'OK', label: 'OK and the arrows', shape: 'ring', x: 160, y: 520, w: 130, h: 130},
		c('back', 'BACK', 'Back', 105, 628, 17),
		c('home', 'HOME', 'Home', 160, 628, 17),
		c('settings', 'SET', 'Settings', 215, 628, 17, 'Key_webOS_Settings')
	];
}

export const REMOTES: RemoteLayout[] = [
	{
		model: 'magic-2019', name: 'Magic Remote (2019, MR19)', body: MAGIC_BODY, width: 560, height: 920,
		buttons: [
			...magicTop(),
			pill('netflix', 'NETFLIX', 'Netflix', 160, 700, 120, 32, 'Key_webOS_Netflix'),
			pill('prime', 'prime video', 'Prime Video', 160, 748, 120, 32, 'Key_webOS_Amazon'),
			pill('movies', 'MOVIES', 'Movies (Rakuten TV)', 160, 796, 120, 32, 'Key_webOS_RakutenTV')
		]
	},
	{
		model: 'magic-2020', name: 'Magic Remote (2020 and later)', body: MAGIC_BODY, width: 560, height: 920,
		buttons: [
			...magicTop(),
			pill('netflix', 'NETFLIX', 'Netflix', 125, 700, 64, 32, 'Key_webOS_Netflix'),
			pill('prime', 'prime', 'Prime Video', 195, 700, 64, 32, 'Key_webOS_Amazon'),
			pill('disney', 'Disney+', 'Disney+', 125, 748, 64, 32, 'Key_webOS_Disneyplus'),
			pill('rakuten', 'Rakuten', 'Rakuten TV', 195, 748, 64, 32, 'Key_webOS_RakutenTV'),
			pill('channels', 'LG CHANNELS', 'LG Channels', 160, 796, 144, 32, 'Key_webOS_LGChannels')
		]
	},
	{
		model: 'ir', name: 'Standard remote (IR)', body: {x: 75, y: 20, w: 170, h: 730, r: 34}, width: 560, height: 920,
		buttons: [
			c('power', 'POWER', 'Power', 110, 65, 16),
			c('input', 'INPUT', 'Input', 210, 65, 16, 'Key_webOS_InputSource'),
			...numberPad([115, 160, 205], [115, 152, 189], 15, [
				c('list', 'LIST', 'List', 115, 226, 15),
				c('n0', '0', '0', 160, 226, 15),
				c('qview', 'Q.V', 'Q.View', 205, 226, 15)
			]),
			{id: 'vol', text: 'VOL', label: 'Volume', shape: 'rocker', x: 108, y: 300, w: 34, h: 84},
			{id: 'ch', text: 'CH', label: 'Channels', shape: 'rocker', x: 212, y: 300, w: 34, h: 84},
			c('mute', 'MUTE', 'Mute', 160, 272, 13),
			c('guide', 'GUIDE', 'Guide', 160, 330, 15, 'Key_webOS_TVGuide'),
			c('home', 'HOME', 'Home', 110, 378, 16),
			c('settings', 'SET', 'Settings', 210, 378, 16, 'Key_webOS_Settings'),
			{id: 'ok', text: 'OK', label: 'OK and the arrows', shape: 'ring', x: 160, y: 455, w: 112, h: 112},
			c('back', 'BACK', 'Back', 110, 535, 16),
			c('livetv', 'LIVE', 'Live TV', 160, 535, 16, 'Key_webOS_InputTV'),
			c('exit', 'EXIT', 'Exit', 210, 535, 16),
			pill('netflix', 'NETFLIX', 'Netflix', 125, 585, 64, 26, 'Key_webOS_Netflix'),
			pill('prime', 'prime', 'Prime Video', 195, 585, 64, 26, 'Key_webOS_Amazon'),
			{id: 'red', text: '', label: 'Red', shape: 'key', x: 106, y: 630, w: 30, h: 16, key: 'Key_webOS_Red', color: '#e5484d'},
			{id: 'green', text: '', label: 'Green', shape: 'key', x: 142, y: 630, w: 30, h: 16, key: 'Key_webOS_Green', color: '#30a46c'},
			{id: 'yellow', text: '', label: 'Yellow', shape: 'key', x: 178, y: 630, w: 30, h: 16, key: 'Key_webOS_Yellow', color: '#f5d90a'},
			{id: 'blue', text: '', label: 'Blue', shape: 'key', x: 214, y: 630, w: 30, h: 16, key: 'Key_webOS_Blue', color: '#3e63dd'},
			{id: 'text', text: 'TEXT', label: 'Text', shape: 'key', x: 115, y: 672, w: 38, h: 18},
			{id: 'topt', text: 'T.OPT', label: 'Text options', shape: 'key', x: 160, y: 672, w: 38, h: 18},
			{id: 'sub', text: 'SUB', label: 'Subtitles', shape: 'key', x: 205, y: 672, w: 38, h: 18},
			{id: 'rew', text: '◀◀', label: 'Rewind', shape: 'key', x: 115, y: 708, w: 38, h: 18},
			{id: 'play', text: '▶', label: 'Play', shape: 'key', x: 160, y: 708, w: 38, h: 18},
			{id: 'ff', text: '▶▶', label: 'Fast forward', shape: 'key', x: 205, y: 708, w: 38, h: 18}
		]
	}
];

/** Linux key codes of the drawn buttons (the TV's own key table; the same numbers LG Input Hook shows). */
export const LINUX_CODES: Record<string, number> = {
	home: 773, back: 412, mute: 113, input: 241, settings: 139, mic: 428, list: 787, more: 994, guide: 362,
	netflix: 1037, prime: 1038, disney: 1042, rakuten: 1044, movies: 1083, red: 398, green: 399, yellow: 400, blue: 401
};
REMOTES.forEach((r) => r.buttons.forEach((b) => { if (LINUX_CODES[b.id] !== undefined) b.linux = LINUX_CODES[b.id]; }));

/** Where LG Input Hook (a separate Homebrew app) keeps its own button bindings. Hearth only reads it. */
export const INPUT_HOOK_FILE = '/home/root/.config/lginputhook/keybinds.json';
export const INPUT_HOOK_COMMAND = `cat '${INPUT_HOOK_FILE}' 2>/dev/null; true`;

/** The Linux key codes Input Hook has a binding for, from its keybinds.json ({"<code>": {"action": …}}). Anything
 *  unreadable counts as no bindings. */
export function inputHookCodes (text: string): number[] {
	try {
		const parsed = JSON.parse(text) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];
		return Object.keys(parsed as object).filter((k) => /^[0-9]{1,5}$/.test(k) && (parsed as Record<string, unknown>)[k] !== null)
			.map(Number).sort((a, b) => a - b);
	} catch {
		return [];
	}
}

/** The drawn buttons Input Hook also acts on. */
export function boundByInputHook (layout: RemoteLayout, codes: number[]): string[] {
	return layout.buttons.filter((b) => b.linux !== undefined && codes.indexOf(b.linux) !== -1).map((b) => b.id);
}

export function remoteLayout (model: RemoteModel): RemoteLayout {
	return REMOTES.filter((r) => r.model === model)[0] || REMOTES[0];
}

/** The buttons that can be given a new job, top to bottom, left to right. */
export function reassignable (layout: RemoteLayout): RemoteButton[] {
	return layout.buttons.filter((b) => !!b.key).sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

/** The button on this drawing for a key name (null: it is not drawn, e.g. a button this remote doesn't have). */
export function buttonForKey (layout: RemoteLayout, key: string): RemoteButton | null {
	return layout.buttons.filter((b) => b.key === key)[0] || null;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

/** The nearest reassignable button in a direction from `from` (null: none that way). Only buttons within a wide cone
 *  that way count (no more than twice as far across as along), and distance across counts double, so ↓ prefers the
 *  button below over one far to the side, and → at the edge finds nothing (the screen then moves to the side panel). */
export function nextButton (layout: RemoteLayout, from: RemoteButton, dir: Direction): RemoteButton | null {
	let best: RemoteButton | null = null;
	let bestScore = Infinity;
	reassignable(layout).forEach((b) => {
		if (b.id === from.id) return;
		const dx = b.x - from.x;
		const dy = b.y - from.y;
		const along = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'left' ? -dx : dx;
		const across = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
		if (along <= 4 || across > along * 2) return;
		const score = along + across * 2;
		if (score < bestScore) { bestScore = score; best = b; }
	});
	return best;
}

/** Where the labels beside the drawing go: as close to their button's height as possible, in the same order, never
 *  closer than `gap` to each other, and within [top, bottom] (pushed up from the bottom if needed). */
export function placeLabels (ys: number[], gap: number, top: number, bottom: number): number[] {
	const order = ys.map((y, i) => ({y, i})).sort((a, b) => a.y - b.y || a.i - b.i);
	const placed: number[] = [];
	order.forEach((o, n) => { placed[n] = Math.max(o.y, top, n > 0 ? placed[n - 1] + gap : top); });
	for (let n = placed.length - 1; n >= 0; n--) {
		const limit = n === placed.length - 1 ? bottom : placed[n + 1] - gap;
		if (placed[n] > limit) placed[n] = limit;
	}
	const out: number[] = [];
	order.forEach((o, n) => { out[o.i] = placed[n]; });
	return out;
}

/** Which remote the TV's log says was used last ("remote_type":"LGE MR19"), or null when it can't tell. Only the
 *  Magic Remotes say which model they are; older Magic Remotes (MR14-MR18) had no partner buttons. */
export function remoteFromLog (log: string): RemoteModel | null {
	const all = log.match(/"remote_type"\s*:\s*"[^"]*"/g);
	if (!all || !all.length) return null;
	const last = /MR(\d\d)/.exec(all[all.length - 1]);
	if (!last) return null;
	const year = Number(last[1]);
	if (year === 19) return 'magic-2019';
	if (year >= 20) return 'magic-2020';
	return null;
}

/** The TV command that reads the last remote the TV's own log names (one line, or nothing). */
export const REMOTE_LOG_COMMAND = `grep -o '"remote_type":"[^"]*"' /var/log/messages 2>/dev/null | tail -1; true`;
