import {useEffect, useRef} from 'preact/hooks';
import {varScope} from '../lib/cssvars';
import {WALLPAPER} from '../config/constants';
import {NATURE_IDS, natureUrl, nextNature} from '../lib/backgrounds';
import type {WallpaperConfig} from '../lib/storage';
import {
	clearWallpaperCache, listImages, loadPicture, readWallpaperCache, releasePicture, createShuffleOrder,
	wallpaperCacheId, writeWallpaperCache
} from '../lib/wallpaper';

interface Props {
	config: WallpaperConfig;
	/** how solid the picture is, % (100 = fully) */
	opacity?: number;
	/** called (at most once per wallpaper choice) when pictures can't be shown; says why */
	onProblem: (text: string) => void;
}

/** Full-screen background: the default (black, or the calm gradient) with a picture or
 *  slideshow on top. Two layers cross-fade; the layer that faded out is emptied and its
 *  picture released, so only the picture on screen stays in memory.
 *
 *  Fast start: the picture last on screen is kept as a screen-sized copy in localStorage and
 *  shown at once when the launcher opens. A single picture then needs no further work; a
 *  slideshow lists its folder only when it is time for the next picture. The copy is brought
 *  up to date when the launcher goes to the background or this component is removed.
 *
 *  The slideshow pauses while the launcher is in the background. The picture from the copy appears at once
 *  (no fade); only a change from one slideshow picture to the next cross-fades. */
export function Wallpaper ({config, opacity = 100, onProblem}: Props) {
	const layerA = useRef<HTMLDivElement>(null);
	const layerB = useRef<HTMLDivElement>(null);
	const wrap = useRef<HTMLDivElement>(null);
	const report = useRef(onProblem);
	report.current = onProblem;

	useEffect(() => {
		const layers = [layerA.current as HTMLDivElement, layerB.current as HTMLDivElement];
		const root = wrap.current as HTMLDivElement;
		const held: (string | null)[] = [null, null];     // the picture URL each layer holds
		const cacheId = wallpaperCacheId(config.mode, config.path);
		let front = -1;              // layer currently showing, -1 when none
		let disposed = false;
		let failed = false;
		let told = false;
		let busy = false;
		let timer = 0;
		let files: string[] = [];
		let position = -1;
		let order: ReturnType<typeof createShuffleOrder> | null = null;
		let lastError = '';
		let snapshot: string | null = null;    // screen-sized copy of the picture on screen
		let unsaved = false;                   // the copy isn't in the cache yet
		let cacheKnown = false;                // the cache already holds a picture for this choice
		let shownAt = Date.now();              // when the picture on screen appeared

		const stopTimer = () => { window.clearTimeout(timer); timer = 0; };

		const saveCache = () => {
			if (unsaved && snapshot && writeWallpaperCache(cacheId, snapshot)) unsaved = false;
		};

		const release = (i: number) => {
			const url = held[i];
			held[i] = null;
			layers[i].style.backgroundImage = '';
			if (url) releasePicture(url);
		};

		const hide = (i: number) => {
			layers[i].classList.remove('wallpaper__layer--on');
			window.setTimeout(() => {
				if (!layers[i].classList.contains('wallpaper__layer--on')) release(i);
			}, WALLPAPER.fadeMs + 250);
		};

		const hideAll = () => {
			hide(0);
			hide(1);
			front = -1;
			root.classList.add('wallpaper--bare');       // no picture: the shade may be skipped (see the stylesheet)
		};

		/** Takes a layer off at once (no fade) once the new picture covers it. */
		const drop = (i: number) => {
			const layer = layers[i];
			layer.style.transition = 'none';
			layer.classList.remove('wallpaper__layer--on');
			void layer.offsetWidth;
			layer.style.transition = '';
			release(i);
		};

		/** `instant`: no fade (the picture is already known, e.g. when the launcher comes back to the front) */
		const show = (url: string, instant?: boolean) => {
			const back = front === 0 ? 1 : 0;
			const old = front;
			if (held[back]) release(back);
			held[back] = url;
			const layer = layers[back];
			layer.style.backgroundImage = `url("${url}")`;
			layer.style.zIndex = '2';                     // the new picture goes over the old one
			if (old >= 0) layers[old].style.zIndex = '1';
			root.classList.remove('wallpaper--bare');
			if (instant) {
				layer.style.transition = 'none';
				layer.classList.add('wallpaper__layer--on');
				void layer.offsetWidth;                // apply it now, before the transition is switched back on
				layer.style.transition = '';
			} else {
				window.requestAnimationFrame(() => layer.classList.add('wallpaper__layer--on'));
			}
			// Cross-fade: only the new picture changes (fades in over the old one), then the old one is taken off. Fading
			// both at once blended two full-screen layers and let the background show through half-way.
			if (old >= 0) {
				if (instant) hide(old);
				else window.setTimeout(() => { if (!disposed && front !== old) drop(old); }, WALLPAPER.fadeMs + 150);
			}
			front = back;
			shownAt = Date.now();
		};

		// A failure keeps whatever picture is already showing (say, the USB drive was unplugged).
		const fail = (text: string) => {
			failed = true;
			busy = false;
			if (!told) { told = true; report.current(text); }
		};

		const advance = () => {
			if (disposed) return;
			if (files.length) { next(0); return; }
			listImages(config.path).then(
				(list) => {
					if (disposed) return;
					if (!list.length) { fail('No pictures found in that folder'); return; }
					files = list;
					order = config.shuffle ? createShuffleOrder(files, cacheId) : null;
					if (files.length === 1) return;          // a one-picture folder: nothing to rotate
					next(0);
				},
				() => { if (!disposed) fail("Couldn't read the wallpaper folder. Is the USB drive still plugged in?"); }
			);
		};

		const schedule = () => {
			stopTimer();
			const rotates = config.mode === 'folder' && (files.length === 0 || files.length > 1);
			if (rotates && !document.hidden) timer = window.setTimeout(advance, config.intervalSec * 1000);
		};

		const next = (attempt: number) => {
			if (disposed || busy) return;
			if (attempt >= files.length) { fail(lastError || "Couldn't show any picture from that location"); return; }
			busy = true;
			position = (position + 1) % files.length;
			const path = order ? order.take() : files[position];
			if (!path) { fail('No pictures found in that folder'); return; }
			loadPicture(path).then(
				(loaded) => {
					busy = false;
					if (disposed) { releasePicture(loaded.url); return; }
					failed = false;
					if (order) order.shown(path);
					show(loaded.url);
					snapshot = loaded.snapshot;
					unsaved = !!loaded.snapshot;
					if (!cacheKnown) { saveCache(); cacheKnown = !unsaved; }    // the first picture is cached at once
					schedule();
				},
				(error: Error) => {
					busy = false;
					if (disposed) return;
					lastError = error && error.message ? error.message : "Couldn't show that picture";
					if (files.length === 1) fail(lastError);
					else next(attempt + 1);
				}
			);
		};

		const start = () => {
			stopTimer();
			failed = false;
			position = -1;
			lastError = '';
			files = [];
			order = null;
			if (config.mode === 'gradient' || !config.path) { clearWallpaperCache(); hideAll(); return; }

			const cached = readWallpaperCache(cacheId);
			if (cached) {                                          // instant: no shell work at all
				show(cached, true);                                // already known: no fade-in
				snapshot = cached;
				unsaved = false;
				cacheKnown = true;
				// the saved shuffle order picks the next picture after one interval: nothing is loaded at start-up
				if (config.mode === 'folder') schedule();
				return;
			}
			if (config.mode === 'image') { files = [config.path]; next(0); return; }
			listImages(config.path).then(
				(list) => {
					if (disposed) return;
					if (!list.length) { fail('No pictures found in that folder'); return; }
					files = list;
					order = config.shuffle ? createShuffleOrder(files, cacheId) : null;
					next(0);
				},
				() => { if (!disposed) fail("Couldn't read the wallpaper folder. Is the USB drive still plugged in?"); }
			);
		};

		const onVisibility = () => {
			if (config.mode === 'gradient') return;
			if (document.hidden) { stopTimer(); saveCache(); return; }
			if (failed) start();                                   // the USB drive may be back
			else if (config.mode === 'folder') {
				// carry on where the interval left off: coming back to the front must not start a fade of its own
				stopTimer();
				timer = window.setTimeout(advance, Math.max(1500, config.intervalSec * 1000 - (Date.now() - shownAt)));
			}
		};

		start();
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			disposed = true;
			stopTimer();
			saveCache();
			document.removeEventListener('visibilitychange', onVisibility);
			layers.forEach((layer) => layer.classList.remove('wallpaper__layer--on'));
			release(0);
			release(1);
			root.classList.add('wallpaper--bare');
		};
	}, [config.mode, config.path, config.intervalSec, config.shuffle]);

	const vars = varScope('wallpaper', {'--wallpaper-opacity': opacity < 100 ? String(opacity / 100) : undefined});

	return (
		<div class={`wallpaper wallpaper--bare${vars.cls ? ' ' + vars.cls : ''}`} aria-hidden="true" ref={wrap} style={vars.css || undefined}>
			<div class="wallpaper__layer" ref={layerA} />
			<div class="wallpaper__layer" ref={layerB} />
			<div class="wallpaper__scrim" />
			<div class="wallpaper__fade" />
		</div>
	);
}

/** The bundled-photo slideshow. Own component and own state, so a change of picture re-renders nothing else.
 *  The first photo appears at once; each next one is loaded and drawn invisibly for a moment (so the picture is
 *  already decoded), then fades in over the old one. Pauses while `paused` (launcher in the background). */
export function PhotoShow ({intervalSec, shuffle, paused}: {intervalSec: number; shuffle: boolean; paused: boolean}) {
	const layerA = useRef<HTMLDivElement>(null);
	const layerB = useRef<HTMLDivElement>(null);
	const wrap = useRef<HTMLDivElement>(null);
	const state = useRef({front: -1, index: Math.floor(Math.random() * NATURE_IDS.length), busy: false});

	useEffect(() => { clearWallpaperCache(); }, []);

	useEffect(() => {
		const layers = [layerA.current as HTMLDivElement, layerB.current as HTMLDivElement];
		const root = wrap.current as HTMLDivElement;
		const st = state.current;
		let disposed = false;
		let timer = 0;
		let warm = 0;
		let img: HTMLImageElement | null = null;

		const show = (url: string) => {
			const back = st.front === 0 ? 1 : 0;
			const old = st.front;
			const layer = layers[back];
			layer.style.transition = 'none';
			layer.classList.remove('wallpaper__layer--on');
			layer.style.opacity = old < 0 ? '' : '0.01';          // barely visible: the picture is decoded before it fades in
			layer.style.backgroundImage = `url("${url}")`;
			layer.style.zIndex = '2';
			if (old >= 0) layers[old].style.zIndex = '1';
			root.classList.remove('wallpaper--bare');
			st.front = back;
			const fadeIn = () => {
				layer.style.transition = '';
				void layer.offsetWidth;
				layer.style.opacity = '';
				layer.classList.add('wallpaper__layer--on');
				if (old >= 0) {
					warm = window.setTimeout(() => {
						if (disposed) return;
						const l = layers[old];
						l.style.transition = 'none';
						l.classList.remove('wallpaper__layer--on');
						l.style.backgroundImage = '';
					}, WALLPAPER.fadeMs + 150);
				}
			};
			if (old < 0) { void layer.offsetWidth; fadeIn(); }
			else warm = window.setTimeout(() => { if (!disposed) fadeIn(); }, 200);
		};

		const load = (then: () => void) => {
			st.busy = true;
			const url = natureUrl(st.index);
			img = new Image();
			img.onload = () => { st.busy = false; if (!disposed) { show(url); then(); } };
			img.onerror = () => { st.busy = false; if (!disposed) then(); };
			img.src = url;
		};

		const tick = () => {
			if (disposed) return;
			st.index = nextNature(st.index, shuffle);
			load(schedule);
		};
		const schedule = () => { window.clearTimeout(timer); if (!paused) timer = window.setTimeout(tick, intervalSec * 1000); };

		if (st.front < 0) load(schedule); else schedule();
		return () => {
			disposed = true;
			window.clearTimeout(timer);
			window.clearTimeout(warm);
			if (img) { img.onload = null; img.onerror = null; }
		};
	}, [intervalSec, shuffle, paused]);

	return (
		<div class="wallpaper wallpaper--bare" aria-hidden="true" ref={wrap}>
			<div class="wallpaper__layer" ref={layerA} />
			<div class="wallpaper__layer" ref={layerB} />
			<div class="wallpaper__scrim" />
			<div class="wallpaper__fade" />
		</div>
	);
}
