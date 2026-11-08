// local build: the app side of Continue Watching (Plex), kept out of app.tsx so rebases stay small.
import {useCallback, useEffect, useRef, useState} from 'preact/hooks';
import {log} from '../lib/log';
import {cachedContinue, fetchContinue, openContinue, plexServerName, plexSignOut, type ContinueItem} from '../lib/plex';
import {CONTINUE_CARD} from '../components/ContinueRow';
import {startDelay, TIER2_MS} from '../lib/startup';
import {markAliveSoon} from '../lib/homehook';
import {saveConfig, type UserConfig} from '../lib/storage';
import {TIMING} from '../config/constants';
import {t as tt} from '../i18n';

type Toast = (text: string, kind?: 'info' | 'error') => void;

/** The saved list is drawn at once; the server is read off the start-up path, like the app list and the weather: at TIER2
 *  after a start, a few seconds after a wake, at most once a minute. Signing in reads it at once. A failed read keeps what is
 *  on screen, unless it signed Hearth out (token revoked). */
export function useContinueWatching (config: UserConfig, setConfig: (f: (c: UserConfig) => UserConfig) => void, wakes: number, showToast: Toast, go: (screen: 'plexlink' | 'settings') => void) {
	const [server, setServer] = useState<string | null>(plexServerName);
	const [items, setItems] = useState<ContinueItem[]>(() => (config.continueWatching ? cachedContinue() : []));
	const [reloads, setReloads] = useState(0);
	const readAt = useRef(0);
	const seenReloads = useRef(0);
	const shown = config.continueWatching && !!server;

	useEffect(() => {
		if (!shown) return undefined;
		const forced = reloads !== seenReloads.current;
		seenReloads.current = reloads;
		if (!forced && Date.now() - readAt.current < 60000) return undefined;
		let cancelled = false;
		const timer = window.setTimeout(() => {
			if (document.hidden) return;
			fetchContinue(12, CONTINUE_CARD.width, CONTINUE_CARD.height).then(
				(list) => { if (cancelled) return; readAt.current = Date.now(); setItems(list); setServer(plexServerName()); },
				(e: Error) => {
					if (cancelled) return;
					log('Continue Watching: ' + (e && e.message ? e.message : 'could not be read'));
					if (!plexServerName()) { setServer(null); setItems([]); }
				}
			);
		}, forced ? 0 : startDelay(TIER2_MS, TIMING.backgroundWorkMs));
		return () => { cancelled = true; window.clearTimeout(timer); };
	}, [shown, wakes, reloads]);

	const signedIn = useCallback((name: string) => {
		setServer(name);
		setConfig((c) => { const next = {...c, continueWatching: true}; saveConfig(next); return next; });
		setReloads((n) => n + 1);
		go('settings');
		showToast(tt('app.plexSignedIn', {server: name}));
	}, [showToast]);       // eslint-disable-line react-hooks/exhaustive-deps

	const replaceHome = useRef(config.replaceHome);
	replaceHome.current = config.replaceHome;
	const open = useCallback((item: ContinueItem, details: boolean) => {
		if (replaceHome.current) markAliveSoon('launcher: opening Plex', false);
		openContinue(item, details).catch(() => showToast(tt('app.couldNotOpenPlex'), 'error'));
	}, [showToast]);

	// Settings rows: true when handled. Switching the row on before signing in signs in first (it is switched on after).
	const state = useRef({server, on: config.continueWatching});
	state.current = {server, on: config.continueWatching};
	const onOption = useCallback((optionId: string): boolean => {
		const s = state.current;
		if (optionId === 'continueWatching' && !s.on && !s.server) { go('plexlink'); return true; }
		if (optionId !== 'plexAccount') return false;
		if (!s.server) { go('plexlink'); return true; }
		plexSignOut();
		setServer(null);
		setItems([]);
		showToast(tt('app.plexSignedOut'));
		return true;
	}, [showToast]);       // eslint-disable-line react-hooks/exhaustive-deps

	return {server, items: shown ? items : undefined, open, signedIn, onOption};
}
