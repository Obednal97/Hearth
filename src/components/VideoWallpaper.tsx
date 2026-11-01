import {useEffect, useRef, useState} from 'preact/hooks';
import {log} from '../lib/log';
import {baseName, createShuffleOrder, fileUrl} from '../lib/wallpaper';
import {isVideoFile, listVideos, nextInOrder, rememberVideo, videoChangeDue, videoTitle, whenStill, type VideoItem} from '../lib/videowall';
import {t as tt} from '../i18n';

interface Props {
	/** the chosen video file or folder of videos */
	choice: string;
	/** "Change video" (see videowall.ts) */
	change: number;
	shuffle: boolean;
	/** the video to play; null: one is picked from the choice */
	current: VideoItem | null;
	/** a new video was picked (its poster becomes the still wallpaper underneath) */
	onCurrent: (item: VideoItem | null) => void;
	/** when the user chose this background (Date.now(); 0 = not just now): a problem soon after is shown in a toast, else only logged */
	chosenAt: number;
	onProblem: (text: string) => void;
}

const STALL_MS = 3000;            // waiting or stalled longer than this: the still is shown again
const RESUME_CHECK_MS = 4000;     // after Hearth comes back, WAM resumes the video in about 0.5 s; if it hasn't by then, play() once
const POSTER_WAIT_MS = 6000;      // a timed change waits (at most this long) until the next video's poster is on screen
const TOLD_MS = 30000;            // a problem this soon after choosing is told in a toast

const html = (): DOMTokenList => document.documentElement.classList;

/** The moving background: ONE <video> element, first in <body>, behind the page (the TV can run only one; a second pauses the
 *  first). Created only while this component is mounted (video wallpaper chosen, after the first frame) and only while Hearth
 *  is visible; removed (and its decoder released) when the wallpaper changes to something else.
 *
 *  `html.hearth-video` makes the page's own backgrounds see-through and lifts #root over the video; `html.hearth-video-playing`
 *  (set only while frames are coming) hides the still wallpaper (poster, picture layers, theme background), so the video shows.
 *  An error, or waiting for more than 3 s, takes that class off again: the poster (or the theme background) shows instead. */
export function VideoWallpaper (props: Props) {
	const p = useRef(props);
	p.current = props;
	const el = useRef<HTMLVideoElement | null>(null);
	const [ready, setReady] = useState(false);
	const playing = useRef(false);
	const playingPath = useRef('');
	const waitPoster = useRef(false);                     // the next change is a timed one: wait for its poster first
	const failedRef = useRef<(path: string) => void>(() => undefined);

	const setPlaying = (on: boolean) => {
		if (playing.current === on) return;
		playing.current = on;
		html().toggle('hearth-video-playing', on);
	};

	// The element: made once Hearth is visible, removed when the component goes.
	useEffect(() => {
		let stall = 0;
		let resume = 0;
		let lastProgress = 0;
		let firstFrameLogged = '';
		let v: HTMLVideoElement | null = null;

		const clearStall = () => { window.clearTimeout(stall); stall = 0; };
		const onPlaying = () => {
			clearStall();
			lastProgress = Date.now();
			setPlaying(true);
			if (v && firstFrameLogged !== playingPath.current) { firstFrameLogged = playingPath.current; log(`video: playing ${baseName(playingPath.current)} at page +${Math.round(performance.now())} ms`); }
		};
		const onProgress = () => {
			lastProgress = Date.now();
			clearStall();
			if (!playing.current && v && !v.paused && !document.hidden) setPlaying(true);         // resumed without a 'playing' event
		};
		const onWaiting = () => {
			if (document.hidden || stall) return;
			stall = window.setTimeout(() => {
				stall = 0;
				if (document.hidden || !playing.current) return;
				setPlaying(false);
				log(`video: no frames for ${STALL_MS / 1000} s, the still wallpaper is shown`);
			}, STALL_MS);
		};
		const onError = () => {
			clearStall();
			setPlaying(false);
			const path = playingPath.current;
			const code = v && v.error ? v.error.code : 0;
			if (!path || !v || !v.getAttribute('src')) return;          // the src was just taken off
			log(`video: can't play ${baseName(path)} (error ${code})`);
			failedRef.current(path);
		};
		const onVisibility = () => {
			window.clearTimeout(resume);
			if (document.hidden) { clearStall(); return; }
			if (!v) { make(); return; }
			// WAM resumes the video by itself; only if it hasn't after a few seconds is play() asked for (Hearth is visible then)
			resume = window.setTimeout(() => {
				if (!v || document.hidden || !playingPath.current || v.error) return;          // a video that failed is not tried again here
				if (!v.paused && Date.now() - lastProgress < STALL_MS) return;
				setPlaying(false);
				log('video: not resumed after coming back, play() asked');
				const r = v.play() as Promise<void> | undefined;
				if (r && r.catch) r.catch(() => undefined);
			}, RESUME_CHECK_MS);
		};
		const make = () => {
			if (v || document.hidden) return;
			const old = document.querySelector('video.hearth-video-el');          // never two
			if (old && old.parentNode) old.parentNode.removeChild(old);
			v = document.createElement('video');
			v.className = 'hearth-video-el';
			v.muted = true;
			v.loop = true;
			v.autoplay = true;
			v.preload = 'auto';
			['muted', 'loop', 'autoplay', 'playsinline', 'webkit-playsinline'].forEach((a) => v!.setAttribute(a, ''));
			v.addEventListener('playing', onPlaying);
			v.addEventListener('timeupdate', onProgress);
			v.addEventListener('waiting', onWaiting);
			v.addEventListener('stalled', onWaiting);
			v.addEventListener('error', onError);
			document.body.insertBefore(v, document.body.firstChild);
			html().add('hearth-video');
			el.current = v;
			setReady(true);
		};

		make();
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			clearStall();
			window.clearTimeout(resume);
			html().remove('hearth-video');
			html().remove('hearth-video-playing');
			playing.current = false;
			playingPath.current = '';
			el.current = null;
			if (!v) return;
			v.removeEventListener('playing', onPlaying);
			v.removeEventListener('timeupdate', onProgress);
			v.removeEventListener('waiting', onWaiting);
			v.removeEventListener('stalled', onWaiting);
			v.removeEventListener('error', onError);
			v.pause();
			v.removeAttribute('src');
			try { v.load(); } catch { /* releases the decoder where it can */ }
			if (v.parentNode) v.parentNode.removeChild(v);
			v = null;
		};
	}, []);

	// The video on screen follows `current`. A timed change waits until the next poster is on screen, so the switch goes video →
	// its poster → the next video (never the old poster in between). Nothing starts while Hearth is hidden.
	const currentPath = props.current ? props.current.path : '';
	useEffect(() => {
		const v = el.current;
		if (!ready || !v) return undefined;
		const item = p.current.current;
		if (!item) {
			if (playingPath.current) { playingPath.current = ''; v.pause(); v.removeAttribute('src'); try { v.load(); } catch { /* ignore */ } }
			setPlaying(false);
			return undefined;
		}
		if (playingPath.current === item.path) return undefined;
		let cancelWait: (() => void) | null = null;
		let waitVisible = false;
		const go = () => {
			cancelWait = null;
			if (document.hidden) { waitVisible = true; document.addEventListener('visibilitychange', go); return; }
			if (waitVisible) { waitVisible = false; document.removeEventListener('visibilitychange', go); }
			setPlaying(false);              // the poster shows until the new video's first frame
			playingPath.current = item.path;
			rememberVideo(p.current.choice, item);
			v.src = fileUrl(item.path);
			const r = v.play() as Promise<void> | undefined;
			if (r && r.catch) r.catch(() => undefined);          // autoplay is on as well; an error comes as the 'error' event
			log(`video: loading ${baseName(item.path)}${item.poster ? ' (with poster)' : ''}`);
		};
		const wait = waitPoster.current && playing.current && !!item.poster;
		waitPoster.current = false;
		if (wait) cancelWait = whenStill(item.poster, POSTER_WAIT_MS, go);
		else go();
		return () => {
			if (cancelWait) cancelWait();
			if (waitVisible) document.removeEventListener('visibilitychange', go);
		};
	}, [ready, currentPath]);

	// Which video: the remembered one at start (no shell work), a pick from the folder when none is known, and the next one when
	// "Change video" says so: each time Hearth comes back after 5 minutes away, or after 10, 30 or 60 minutes on screen.
	useEffect(() => {
		const choice = props.choice;
		const single = isVideoFile(choice);
		let disposed = false;
		let timer = 0;
		let shownMs = 0;                                          // on screen time of this video before the current stretch
		let since = document.hidden ? 0 : Date.now();            // start of the current stretch on screen
		let hiddenAt = document.hidden ? Date.now() : 0;
		let told = false;
		let order: ReturnType<typeof createShuffleOrder> | null = null;
		let orderFor = '';
		const failed: Record<string, boolean> = {};

		const shown = () => shownMs + (since ? Date.now() - since : 0);
		const stopTimer = () => { window.clearTimeout(timer); timer = 0; };
		const problem = (text: string) => {
			log(`video: ${text}`);
			if (!told && p.current.chosenAt && Date.now() - p.current.chosenAt < TOLD_MS) { told = true; p.current.onProblem(text); }
		};
		const schedule = () => {
			stopTimer();
			const change = p.current.change;
			if (single || change <= 0 || document.hidden) return;
			timer = window.setTimeout(() => {
				timer = 0;
				if (videoChangeDue(p.current.change, {visible: !document.hidden, returning: false, awayMs: 0, shownMs: shown()})) pick('interval');
				else schedule();
			}, Math.max(1000, change * 1000 - shown()));
		};
		const pick = (why: 'start' | 'interval' | 'home' | 'error') => {
			stopTimer();
			listVideos(choice).then((list) => {
				if (disposed) return;
				const usable = list.filter((x) => !failed[x.path]);
				if (!usable.length) {
					problem(list.length ? tt('video.noneCanPlay') : single ? tt('video.missing', {name: videoTitle(choice)}) : tt('video.noneInFolder'));
					p.current.onCurrent(null);
					return;
				}
				const cur = p.current.current ? p.current.current.path : '';
				const paths = usable.map((x) => x.path);
				let path = paths[0];
				if (!single && paths.length > 1) {
					if (p.current.shuffle) {
						const key = paths.join('\n');
						if (!order || orderFor !== key) { order = createShuffleOrder(paths, `video|${choice}`); orderFor = key; }
						path = order.take() || paths[0];
						if (path === cur) path = order.take() || path;
						order.shown(path);
					} else path = nextInOrder(paths, cur);
				}
				const next = usable.filter((x) => x.path === path)[0];
				shownMs = 0;
				since = document.hidden ? 0 : Date.now();
				log(`video: ${why}: ${baseName(next.path)} (${usable.length} usable)`);
				if (next.path !== cur || (p.current.current && p.current.current.poster !== next.poster)) {
					waitPoster.current = why === 'interval';
					p.current.onCurrent(next);
				}
				schedule();
			}, () => { if (!disposed) problem(tt('video.cantRead')); });
		};

		failedRef.current = (path) => {
			if (disposed) return;
			failed[path] = true;
			problem(tt('video.cantPlay', {name: videoTitle(path)}));
			if (!single) pick('error');
		};

		const onVisibility = () => {
			if (document.hidden) {
				if (since) { shownMs += Date.now() - since; since = 0; }
				if (!hiddenAt) hiddenAt = Date.now();
				stopTimer();
				return;
			}
			if (pending) { pending = false; since = Date.now(); hiddenAt = 0; pick('start'); return; }
			if (since) return;                                    // already counted as visible (a repeated event)
			const away = hiddenAt ? Date.now() - hiddenAt : 0;
			hiddenAt = 0;
			since = Date.now();
			if (!single && videoChangeDue(p.current.change, {visible: true, returning: true, awayMs: away, shownMs: shown()})) pick('home');
			else schedule();
		};

		// nothing known yet: pick one, but not while Hearth is hidden (a start in the background waits until it is shown)
		let pending = !p.current.current;
		if (pending && !document.hidden) { pending = false; pick('start'); }
		else if (!pending) schedule();
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			disposed = true;
			stopTimer();
			failedRef.current = () => undefined;
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [props.choice, props.change, props.shuffle]);

	return null;
}
