// Moving backgrounds (local build): a looping video behind the home screen (Settings → Wallpaper).
//
// The TV plays web video on its hardware plane, which lies UNDER the page: the page's own backgrounds go see-through while the
// video plays (global.css, `html.hearth-video-playing`), and the video element sits first in <body>, behind #root. There is
// never more than one video element: a second one pauses the first on this TV. WAM pauses the video when Hearth goes to the
// background (and lets go of the decoder) and resumes it about half a second after Hearth comes back, so nothing here calls
// play() while the page is hidden.
//
// The choice is one video file or a folder of videos (.mp4, .webm, .mov). A folder is listed through the Homebrew shell with
// `ls -1p`, like the picture folders. A picture with the same name next to a video (abstract-dusk.jpg beside abstract-dusk.mp4)
// is its poster: shown as the still wallpaper until the video plays, and again whenever it can't. Posters load the way own
// pictures do (through the shell; the web view can't open file:// pictures), so they also get the start-up cache.

import {exec, shellQuote} from './apps';
import {isWebOS} from './luna';
import {baseName, isSafePath, joinPath, parentPath, type StorageRoot} from './wallpaper';
import {VIDEO_CHANGE_VALUES} from './storage';
import {t as tt} from '../i18n';

export interface VideoItem {
	/** absolute path of the video file */
	path: string;
	/** absolute path of its poster picture ('' when there is none) */
	poster: string;
}

/** The folder Hearth suggests for moving backgrounds. */
export const VIDEO_FOLDER: StorageRoot = {get label () { return tt('video.folder'); }, path: '/media/developer/hearth-videos'};

const VIDEO_NAME = /\.(mp4|webm|mov)$/i;
const POSTER_NAME = /\.(jpe?g|png)$/i;
/** What the wallpaper picker lists in a folder: pictures and videos. */
export const WALLPAPER_PICK = /\.(jpe?g|png|webp|bmp|mp4|webm|mov)$/i;

export function isVideo (name: string): boolean {
	return name.charAt(0) !== '.' && VIDEO_NAME.test(name);
}

/** A chosen path is one video when its name ends like a video; otherwise it is a folder of videos. */
export function isVideoFile (path: string): boolean {
	return isVideo(baseName(path));
}

/** The name shown for a video: `abstract-dusk.mp4` → "Abstract dusk". */
export function videoTitle (name: string): string {
	const file = baseName(name);
	const stem = file.replace(/\.[A-Za-z0-9]{1,5}$/, '');
	const words = stem.replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim();
	if (!words) return file;
	return words.charAt(0).toUpperCase() + words.slice(1);
}

const stemOf = (name: string): string => name.replace(/\.[A-Za-z0-9]{1,5}$/, '').toLowerCase();
const POSTER_RANK = (name: string): number => (/\.jpg$/i.test(name) ? 0 : /\.jpeg$/i.test(name) ? 1 : 2);

/** The videos in the output of `ls -1p <dir>`, A to Z, each with its poster when a picture of the same name is there
 *  (.jpg first, then .jpeg, then .png). Folders, hidden files (and the "._" files macOS leaves) and other files are left out. */
export function parseVideoListing (output: string, dir: string): VideoItem[] {
	const videos: string[] = [];
	const posters: Record<string, string> = {};
	for (const line of output.split('\n')) {
		const name = line.replace(/\r$/, '');
		if (!name || name.charAt(0) === '.' || name.charAt(name.length - 1) === '/') continue;
		if (isVideo(name)) videos.push(name);
		else if (POSTER_NAME.test(name)) {
			const stem = stemOf(name);
			if (!posters[stem] || POSTER_RANK(name) < POSTER_RANK(posters[stem])) posters[stem] = name;
		}
	}
	videos.sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0));
	return videos.map((name) => ({path: joinPath(dir, name), poster: posters[stemOf(name)] ? joinPath(dir, posters[stemOf(name)]) : ''}));
}

type Run = (command: string, timeoutMs?: number) => Promise<string>;

/** The videos of a choice (a folder, or the one file), with their posters; `run` is the shell (injectable for tests).
 *  A single file is still played when its folder can't be listed (playing needs no root); it then has no poster. */
export function listVideosWith (choice: string, run: Run): Promise<VideoItem[]> {
	if (!isSafePath(choice)) return Promise.reject(new Error('Unsafe path'));
	const single = isVideoFile(choice);
	const dir = single ? parentPath(choice) : choice.replace(/\/+$/, '') || '/';
	return run(`ls -1p -- ${shellQuote(dir)} 2>/dev/null`).then(
		(out) => {
			const list = parseVideoListing(out, dir);
			return single ? list.filter((v) => v.path === choice) : list;
		},
		(error) => { if (single) return [{path: choice, poster: ''}]; throw error; }
	);
}

export function listVideos (choice: string): Promise<VideoItem[]> {
	if (!isWebOS()) return Promise.resolve(mockVideos(choice));
	return listVideosWith(choice, exec);
}

function mockVideos (choice: string): VideoItem[] {
	if (isVideoFile(choice)) return [{path: choice, poster: ''}];
	return ['abstract-dusk', 'sea-waves'].map((n) => ({path: joinPath(choice, n + '.mp4'), poster: ''}));
}

// ---------- when to change the video (a folder) ----------

/** "Change video": 0 = never, -1 = each time you come Home (after at least HOME_AWAY_MS away), else seconds of being on screen. */
export const CHANGE_NEVER = 0;
export const CHANGE_ON_HOME = -1;
export {VIDEO_CHANGE_VALUES};
export const HOME_AWAY_MS = 5 * 60 * 1000;

export interface ChangeMoment {
	/** Hearth is on screen now */
	visible: boolean;
	/** this moment is Hearth coming back to the front */
	returning: boolean;
	/** how long Hearth was away (only read when returning) */
	awayMs: number;
	/** how long the current video has been on screen (time away not counted) */
	shownMs: number;
}

/** Should the next video start now? Never while Hearth is hidden (WAM has paused the video; a change waits until Hearth is back). */
export function videoChangeDue (change: number, m: ChangeMoment): boolean {
	if (!m.visible || change === CHANGE_NEVER) return false;
	if (change === CHANGE_ON_HOME) return m.returning && m.awayMs >= HOME_AWAY_MS;
	return change > 0 && m.shownMs >= change * 1000;
}

/** The next video in A–Z order after `current` (the first when `current` isn't in the list). */
export function nextInOrder (paths: string[], current: string): string {
	if (!paths.length) return '';
	const i = paths.indexOf(current);
	return paths[(i + 1) % paths.length];
}

// ---------- the video on screen, remembered so the next start shows the same one (and its saved poster) at once ----------

const NOW_KEY = 'hearth-video-now-v1';

export function rememberVideo (choice: string, item: VideoItem): void {
	try { localStorage.setItem(NOW_KEY, JSON.stringify({choice, path: item.path, poster: item.poster})); } catch { /* not kept: the next start lists the folder */ }
}

/** The video last on screen for this choice, or null. */
export function recallVideo (choice: string): VideoItem | null {
	try {
		const saved: unknown = JSON.parse(localStorage.getItem(NOW_KEY) || 'null');
		if (!saved || typeof saved !== 'object') return null;
		const s = saved as {choice?: unknown; path?: unknown; poster?: unknown};
		if (s.choice !== choice || typeof s.path !== 'string' || !isSafePath(s.path) || !isVideo(baseName(s.path))) return null;
		if (isVideoFile(choice) ? s.path !== choice : parentPath(s.path) !== choice.replace(/\/+$/, '')) return null;
		const poster = typeof s.poster === 'string' && isSafePath(s.poster) ? s.poster : '';
		return {path: s.path, poster};
	} catch { return null; }
}

// ---------- the poster on screen (Wallpaper tells; the video waits for the next poster before it changes) ----------

let stillShown = '';
let stillWaiter: ((path: string) => void) | null = null;

/** Called by the Wallpaper when a picture is on screen. */
export function noteStill (path: string): void {
	stillShown = path;
	if (stillWaiter) stillWaiter(path);
}

/** Runs `then` once the poster `path` is on screen, or after `ms` (whichever comes first); returns a cancel function. */
export function whenStill (path: string, ms: number, then: () => void): () => void {
	let done = false;
	const finish = () => { if (done) return; done = true; window.clearTimeout(timer); if (stillWaiter === waiter) stillWaiter = null; then(); };
	const waiter = (p: string) => { if (p === path) finish(); };
	const timer = window.setTimeout(finish, ms);
	if (stillShown === path) { finish(); return () => undefined; }
	stillWaiter = waiter;
	return () => { done = true; window.clearTimeout(timer); if (stillWaiter === waiter) stillWaiter = null; };
}

// ---------- the shade for moving backgrounds ----------

export interface GlowClock {
	show: boolean;
	/** % from the top of the screen (the widget's top edge) */
	top: number;
	/** % across the screen (the widget's centre, or its left / right edge with that alignment) */
	left: number;
	/** height of the digits, px */
	size: number;
	align: 'left' | 'center' | 'right';
}

const clampPct = (v: number): number => Math.max(5, Math.min(95, Math.round(v)));

/** Where the soft dark glow behind the clock, date and weather sits ("x% y%"): about the middle of the widget. With the
 *  default widget (top 20%, 140 px digits, centred at 50%) this is 50% 40%. */
export function glowCentre (c: GlowClock): string {
	const y = clampPct(c.top + 20 * (c.size / 140));
	const x = clampPct(c.align === 'left' ? c.left + 12 : c.align === 'right' ? c.left - 12 : c.left);
	return `${x}% ${y}%`;
}

/** The glow as a CSS background ('none' with the widget off). */
export function glowBackground (c: GlowClock): string {
	if (!c.show) return 'none';
	return `radial-gradient(ellipse 34% 30% at ${glowCentre(c)}, rgba(0,0,0,.5) 0%, rgba(0,0,0,.28) 55%, rgba(0,0,0,0) 100%)`;
}
