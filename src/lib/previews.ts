// "Featured in <app>": the previews LG Home shows for apps (Prime Video, YouTube, iPlayer, …). webOS keeps them in its
// own database (db8 kind com.webos.service.contentminer.contents:1, filled by the TV's content miner from each app's
// feed). Only the content miner may read that kind, so the read runs as root through the Homebrew Channel, asking as
// that service. Read-only: nothing on the TV is changed.

import {exec, shellQuote} from './apps';
import {launchApp} from './launch';
import type {ContinueItem} from './plex';

const CACHE_KEY = 'customlauncher-previews-v1';
const KIND = 'com.webos.service.contentminer.contents:1';
/** LG's own app recommendations (adverts for apps, not something to watch) */
const SKIP_APPS = ['com.webos.app.discovery'];
const MAX_ITEMS = 16;

export interface PreviewItem extends ContinueItem {
	appId: string;
	params: Record<string, unknown>;
}

export interface PreviewRow {
	appId: string;
	label: string;
	items: PreviewItem[];
}

interface MinerContent {
	_id?: string;
	type?: string;
	titleText?: string;
	image?: {url?: string};
	onClick?: {contentId?: string; launchParam?: Record<string, unknown> | null; targetAppId?: string};
}

/** The rows in a db8 find reply, one per installed app that has something to show, in the given order of apps.
 *  installed: app id → title (the home row's app list). */
export function previewRows (reply: unknown, installed: Record<string, string>): PreviewRow[] {
	const results = reply && typeof reply === 'object' && Array.isArray((reply as {results?: unknown}).results) ? (reply as {results: unknown[]}).results : [];
	const rows: PreviewRow[] = [];
	results.forEach((doc) => {
		const d = doc as {appId?: unknown; contents?: unknown};
		const appId = typeof d.appId === 'string' ? d.appId : '';
		if (!appId || SKIP_APPS.indexOf(appId) !== -1 || !installed[appId] || !Array.isArray(d.contents)) return;
		const items: PreviewItem[] = [];
		(d.contents as MinerContent[]).forEach((c, i) => {
			if (!c || c.type !== 'content' || items.length >= MAX_ITEMS) return;
			const title = typeof c.titleText === 'string' ? c.titleText.trim() : '';
			const imageUrl = c.image && typeof c.image.url === 'string' ? c.image.url : '';
			const click = c.onClick || {};
			const target = typeof click.targetAppId === 'string' && click.targetAppId ? click.targetAppId : appId;
			if (!title || !imageUrl || !/^https:\/\//.test(imageUrl)) return;
			// an app's own launch parameters win (they already hold its deep link); otherwise the content id is the target
			const params = click.launchParam && typeof click.launchParam === 'object'
				? click.launchParam
				: click.contentId ? {contentTarget: click.contentId} : {};
			items.push({key: `${appId}:${c._id || i}`, guid: '', title: title.slice(0, 120), detail: '', imageUrl, progress: 0, appId: target, params});
		});
		if (items.length) rows.push({appId, label: `Featured in ${installed[appId]}`, items});
	});
	return rows;
}

/** Reads the previews from the TV (root). Rejects when the read fails, so the saved rows can stay on screen. */
export function readPreviews (installed: Record<string, string>): Promise<PreviewRow[]> {
	const query = JSON.stringify({query: {from: KIND}});
	return exec(`luna-send -n 1 -a com.webos.service.contentminer luna://com.webos.service.db/find ${shellQuote(query)}`, 12000).then((out) => {
		let reply: unknown;
		try { reply = JSON.parse(out); } catch { throw new Error('The TV gave no previews'); }
		if (!reply || (reply as {returnValue?: boolean}).returnValue === false) throw new Error('The TV gave no previews');
		const rows = previewRows(reply, installed);
		try { localStorage.setItem(CACHE_KEY, JSON.stringify({at: Date.now(), rows})); } catch { /* ignore */ }
		return rows;
	});
}

/** The rows from the last read, and when that was (0: never). */
export function cachedPreviews (): {at: number; rows: PreviewRow[]} {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		const saved = raw ? JSON.parse(raw) as {at?: number; rows?: PreviewRow[]} : null;
		if (saved && Array.isArray(saved.rows)) return {at: typeof saved.at === 'number' ? saved.at : 0, rows: saved.rows};
	} catch { /* fall through */ }
	return {at: 0, rows: []};
}

export function forgetPreviews (): void {
	try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

/** Opens a preview in its app (at the item, when the app understands the deep link). */
export function openPreview (item: PreviewItem): Promise<void> {
	return launchApp(item.appId, item.params);
}
