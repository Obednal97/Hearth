import {WALLPAPER} from '../config/constants';
import {useCallback, useEffect, useRef, useState} from 'preact/hooks';
import {PickerIcon} from '../components/Glyph';
import {failureText, whySuffix} from '../lib/failure';
import {useKeys, clamp, type NavKey} from '../hooks/useKeys';
import {
	baseName, INTERNAL_ROOT, joinPath, listDir, listRoots, parentPath,
	type DirEntry, type StorageRoot
} from '../lib/wallpaper';

/** What the user picked. */
export type WallpaperChoice =
	| {mode: 'gradient'}
	| {mode: 'image'; path: string}
	| {mode: 'folder'; path: string}
	| {mode: 'nature'};

interface Props {
	/** choosing one picture for a source's icon: no default-background or slideshow rows */
	forIcon?: boolean;
	onChoose: (choice: WallpaperChoice) => void;
	onClose: () => void;
}

type RowKind = 'gradient' | 'nature' | 'root' | 'folder' | 'picture' | 'slideshow' | 'info' | 'retry';

interface PickerRow {
	key: string;
	kind: RowKind;
	label: string;
	detail?: string;
	path?: string;
}

const VISIBLE_ROWS = 9;

const HINTS = {
	roots: 'Pick where your pictures are · Back returns to settings',
	folder: 'OK opens a folder or sets a picture · Back goes up'
} as const;

/** Advice shown at the top level of the wallpaper picker (not in the icon picker): a warning, then how to copy files. */
const MB = 1048576;
const WALLPAPER_WARNING: readonly string[] = [
	'Big pictures slow down the launcher when it loads them: the smaller the file, the faster it starts.',
	`Hard limit: ${Math.round(WALLPAPER.maxBytes / MB)} MB and ${WALLPAPER.maxPixels / 1000000} megapixels per picture (a 4K picture is about 8 megapixels). Pictures over the limit are skipped in a slideshow, and refused as a single wallpaper.`
];
const WALLPAPER_HOWTO: readonly string[] = [
	'To use your own pictures, put them in /media/developer (shown below as Internal storage), or plug in a USB drive.',
	'Over SSH, from a computer:  scp photo.jpg root@<TV address>:/media/developer/   (if scp fails, try scp -O)',
	'With webOS Dev Manager: connect to the TV and use its file or terminal option to copy into /media/developer.',
	'<TV address> is the "IP:" number at the bottom right of Settings, or in the TV\'s network settings.'
];

/** Long paths keep their end (the current folder) and lose the start. */
function shortPath (path: string): string {
	return path.length > 90 ? `…${path.slice(path.length - 89)}` : path;
}

function pictureCount (entries: DirEntry[]): number {
	return entries.filter((e) => !e.isDir).length;
}

function buildRows (path: string | null, roots: StorageRoot[], entries: DirEntry[], failed: boolean): PickerRow[] {
	if (failed) {
		const rows: PickerRow[] = [{key: 'retry', kind: 'retry', label: 'Try again', detail: 'Read the storage again'}];
		if (path === null) rows.unshift({key: 'gradient', kind: 'gradient', label: 'Built-in background', detail: 'No picture. Change which one with ← → on the Wallpaper row'}, {key: 'nature', kind: 'nature', label: 'Nature photos slideshow', detail: 'The 11 photos that come with Hearth, one after another. No root or USB needed'});
		return rows;
	}
	if (path === null) {
		const rows: PickerRow[] = [{key: 'gradient', kind: 'gradient', label: 'Built-in background', detail: 'No picture. Change which one with ← → on the Wallpaper row'}, {key: 'nature', kind: 'nature', label: 'Nature photos slideshow', detail: 'The 11 photos that come with Hearth, one after another. No root or USB needed'}];
		roots.forEach((r) => rows.push({key: `root:${r.path}`, kind: 'root', label: r.label, detail: r.path, path: r.path}));
		if (!roots.some((r) => r.path !== INTERNAL_ROOT.path)) {
			rows.push({key: 'no-usb', kind: 'info', label: 'No USB drive found', detail: 'Plug one in, then open this screen again'});
		}
		return rows;
	}
	const rows: PickerRow[] = [];
	const count = pictureCount(entries);
	if (count > 0) {
		rows.push({
			key: 'slideshow', kind: 'slideshow', label: 'Play this folder as a slideshow',
			detail: `${count} ${count === 1 ? 'picture' : 'pictures'} in ${baseName(path)}`
		});
	}
	entries.forEach((e) => rows.push({
		key: `${e.isDir ? 'dir' : 'pic'}:${e.name}`,
		kind: e.isDir ? 'folder' : 'picture',
		label: e.name,
		path: joinPath(path, e.name)
	}));
	if (!rows.length) rows.push({key: 'empty', kind: 'info', label: 'Nothing here', detail: 'This folder has no pictures or folders'});
	return rows;
}

/** Folder browser for choosing a wallpaper picture or a slideshow folder.
 *  Top level: the default gradient, USB drives, internal storage. Inside a folder: sub-folders,
 *  pictures, and (when it has pictures) a row that plays the whole folder as a slideshow. */
export function Picker ({forIcon, onChoose, onClose}: Props) {
	const [roots, setRoots] = useState<StorageRoot[]>([]);
	const [path, setPath] = useState<string | null>(null);
	const [entries, setEntries] = useState<DirEntry[]>([]);
	const [index, setIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [attempt, setAttempt] = useState(0);
	const remembered = useRef<Record<string, number>>({});

	const rows = buildRows(path, roots, entries, !loading && error !== '').filter((r) => !forIcon || (r.kind !== 'gradient' && r.kind !== 'nature' && r.kind !== 'slideshow'));
	const pathKey = path === null ? '' : path;

	// Roots load once; a folder's contents load whenever the path changes.
	useEffect(() => {
		let cancelled = false;
		if (path === null) {
			setLoading(true);
			setError('');
			listRoots().then(
				(r) => { if (!cancelled) { setRoots(r); setLoading(false); } },
				(e) => { if (!cancelled) { setRoots([]); setError(failureText(e, 'read the storage')); setLoading(false); } }
			);
		} else {
			setLoading(true);
			setError('');
			listDir(path).then(
				(list) => { if (!cancelled) { setEntries(list); setLoading(false); } },
				() => { if (!cancelled) { setEntries([]); setError(`Couldn't read this folder${whySuffix() || ''}`); setLoading(false); } }
			);
		}
		return () => { cancelled = true; };
	}, [path, attempt]);

	const goTo = (next: string | null, restoreIndex: number) => {
		remembered.current[pathKey] = index;
		setEntries([]);
		setIndex(restoreIndex);
		setPath(next);
	};

	const goUp = () => {
		if (path === null) { onClose(); return; }
		const atRoot = roots.some((r) => r.path === path);
		const target = atRoot ? null : parentPath(path);
		const restore = remembered.current[target === null ? '' : target] || 0;
		remembered.current[pathKey] = 0;
		setEntries([]);
		setIndex(restore);
		setPath(target);
	};

	const activate = (i: number) => {
		const row = rows[i];
		if (!row || loading) return;
		switch (row.kind) {
			case 'gradient': onChoose({mode: 'gradient'}); break;
			case 'nature': onChoose({mode: 'nature'}); break;
			case 'retry': setIndex(0); setAttempt((n) => n + 1); break;
			case 'root':
			case 'folder': if (row.path) goTo(row.path, 0); break;
			case 'picture': if (row.path) onChoose({mode: 'image', path: row.path}); break;
			case 'slideshow': if (path) onChoose({mode: 'folder', path}); break;
			default: break;
		}
	};

	const handleKey = useCallback((key: NavKey): boolean => {
		switch (key) {
			case 'up': setIndex((i) => clamp(i - 1, 0, Math.max(0, rows.length - 1))); break;
			case 'down': setIndex((i) => clamp(i + 1, 0, Math.max(0, rows.length - 1))); break;
			case 'enter': activate(index); break;
			case 'back': goUp(); break;
			default: break;
		}
		return true;
	}, [rows.length, index, path, roots, loading, entries]);

	useKeys(handleKey, true);

	const start = clamp(index - Math.floor(VISIBLE_ROWS / 2), 0, Math.max(0, rows.length - VISIBLE_ROWS));
	const visible = rows.slice(start, start + VISIBLE_ROWS);
	const iconFor = (row: PickerRow) => row.kind === 'gradient' ? 'default' : row.kind === 'nature' ? 'slideshow' : row.kind === 'retry' ? 'info' : row.kind === 'root' ? (row.path === INTERNAL_ROOT.path ? 'folder' : 'drive') : row.kind;

	return (
		<div class="screen screen--picker">
			<div class="settings">
				<h1 class="settings__title">{forIcon ? 'Choose a picture for the icon' : 'Choose wallpaper'}</h1>
				<p class="settings__hint">{path === null ? HINTS.roots : HINTS.folder}</p>
				{path === null && !forIcon && (
					<div class="picker__note">
						<div class="picker__note-title">Before you choose</div>
						<div class="picker__note-para">{WALLPAPER_WARNING.map((line) => <div key={line} class="picker__note-line">{line}</div>)}</div>
						<div class="picker__note-para">{WALLPAPER_HOWTO.map((line) => <div key={line} class="picker__note-line">{line}</div>)}</div>
					</div>
				)}
				<div class="picker__path">{path === null ? 'Locations' : shortPath(path)}</div>
				<div class="picker">
					{loading && <div class="picker__status">Loading…</div>}
					{!loading && error && <div class="picker__status picker__status--error">{error}</div>}
					{!loading && visible.map((row, n) => {
						const i = start + n;
						return (
							<div
								key={row.key}
								class={`picker__row${i === index ? ' picker__row--focused' : ''}${row.kind === 'info' ? ' picker__row--info' : ''}`}
								onMouseEnter={() => setIndex(i)}
								onClick={() => { setIndex(i); activate(i); }}
							>
								<PickerIcon kind={iconFor(row)} />
								<div class="picker__text">
									<div class="picker__label">{row.label}</div>
									{row.detail && <div class="picker__detail">{row.detail}</div>}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
