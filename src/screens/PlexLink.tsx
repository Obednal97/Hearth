import {useCallback, useEffect, useState} from 'preact/hooks';
import {useKeys, type NavKey} from '../hooks/useKeys';
import {checkPin, createPin, finishSignIn} from '../lib/plex';
import {t as tt} from '../i18n';

interface Props {
	/** signed in: the Plex server Hearth will read */
	onDone: (serverName: string) => void;
	onClose: () => void;
}

const POLL_MS = 2000;
const CODE_LIFE_MS = 14 * 60 * 1000;      // plex.tv codes last about 15 minutes; a fresh one is fetched before that

/** Sign in to Plex without typing: shows a code to enter at plex.tv/link on a phone or computer. Back cancels. */
export function PlexLink ({onDone, onClose}: Props) {
	const [code, setCode] = useState('');
	const [status, setStatus] = useState(() => tt('plexLink.gettingCode'));

	useEffect(() => {
		let live = true;
		let poll = 0;
		let renew = 0;
		const start = () => {
			window.clearTimeout(poll);
			setCode('');
			setStatus(tt('plexLink.gettingCode'));
			createPin().then((pin) => {
				if (!live) return;
				setCode(pin.code);
				setStatus(tt('plexLink.waiting'));
				renew = window.setTimeout(start, CODE_LIFE_MS);
				const check = () => {
					poll = window.setTimeout(() => checkPin(pin.id).then((token) => {
						if (!live) return;
						if (!token) { check(); return; }
						window.clearTimeout(renew);
						setStatus(tt('plexLink.findingServer'));
						finishSignIn(token).then((name) => { if (live) onDone(name); }, (e: Error) => { if (live) setStatus(e && e.message ? e.message : tt('plexLink.noServer')); });
					}, () => { if (live) check(); }), POLL_MS);
				};
				check();
			}, () => {
				if (!live) return;
				setStatus(tt('plexLink.retrying'));
				renew = window.setTimeout(start, 5000);
			});
		};
		start();
		return () => { live = false; window.clearTimeout(poll); window.clearTimeout(renew); };
	}, []);

	const handleKey = useCallback((key: NavKey): boolean => {
		if (key === 'back') onClose();
		return true;
	}, [onClose]);
	useKeys(handleKey, true);

	// the address is shown in bold inside the sentence: the text has a {url} placeholder where it goes
	const howTo = tt('plexLink.howTo').split('{url}');
	// a full screen of its own (like the app menu), so it sits above Settings with a dimmed backdrop
	return (
		<div class="screen screen--dialog">
		<div class="dialog plex-link">
			<h2 class="dialog__title">{tt('plexLink.title')}</h2>
			<p class="dialog__text">{howTo[0]}<b>plex.tv/link</b>{howTo.slice(1).join('')}</p>
			<div class="plex-link__code">{code ? code.split('').map((ch, i) => <span key={i} class="plex-link__char">{ch}</span>) : <span class="plex-link__char plex-link__char--empty">…</span>}</div>
			<p class="dialog__text plex-link__status">{status}</p>
			<p class="dialog__text">{tt('plexLink.backCancels')}</p>
		</div>
		</div>
	);
}
