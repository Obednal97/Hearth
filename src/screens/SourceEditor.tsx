import {useCallback, useEffect, useRef, useState} from 'preact/hooks';
import {SourceGlyph} from '../components/Glyph';
import {useKeys, clamp, type NavKey} from '../hooks/useKeys';
import {APP_ICON_IDS, appIconLabel, appIconUrl, isAppIcon} from '../config/appicons';
import {iconLabel, iconPath, MAX_SOURCE_NAME, SOURCE_ICON_IDS, SUGGESTED_NAMES, type SourceEdit} from '../lib/sourceicons';

interface Props {
	/** the name and icon the TV gives this source */
	base: {label: string; icon: string; /** an app's own artwork, shown while no icon is chosen */ image?: string};
	/** a TV source, or an app of the home row */
	kind?: 'source' | 'app';
	/** what the user has set (empty: the TV's) */
	edit: SourceEdit;
	onChange: (patch: SourceEdit) => void;
	/** open the file browser for a picture (needs the Homebrew Channel) */
	onBrowse: () => void;
	/** the file browser can work on this TV */
	canBrowse: boolean;
	onClose: () => void;
}

/** Rename a source and pick its icon. The name can be typed (the TV's on-screen keyboard) or stepped through a list of
 *  suggestions with ← →; the icon is stepped with ← → or OK. Changes show on the home row at once. */
export function SourceEditor ({base, kind = 'source', edit, onChange, onBrowse, canBrowse, onClose}: Props) {
	// starts on a row that does nothing: the OK that opened this screen may still be held down
	const [index, setIndex] = useState(0);
	const [typing, setTyping] = useState(false);
	const input = useRef<HTMLInputElement>(null);
	const name = edit.label || base.label;
	const icon = edit.icon || base.icon;
	const own = kind === 'app' ? "the app's" : "the TV's";

	useEffect(() => { if (typing && input.current) input.current.focus(); }, [typing]);

	const step = (list: readonly string[], current: string, dir: number): string => {
		const at = list.indexOf(current);
		return list[(at === -1 ? (dir > 0 ? 0 : list.length - 1) : (at + dir + list.length) % list.length)];
	};
	// suggestions are source names (PlayStation, Xbox...): only offered for sources; apps are typed
	const stepName = (dir: number) => { if (kind === 'source') onChange({label: step(SUGGESTED_NAMES, name, dir)}); };
	// apps choose among the app icons shipped with Hearth ('' = the app's own); sources among the drawn icons
	const iconList: readonly string[] = kind === 'app' ? [''].concat(APP_ICON_IDS) : SOURCE_ICON_IDS;
	const stepIcon = (dir: number) => onChange({icon: step(iconList, icon, dir), iconData: ''});

	const handleKey = useCallback((key: NavKey, event?: KeyboardEvent): boolean => {
		if (key === 'back') { onClose(); return true; }
		if (key === 'enter' && event && event.repeat) return true;   // OK held: not a press
		if (key === 'up') setIndex((i) => (i === 0 ? 0 : clamp(i - 1, 1, 5)));
		else if (key === 'down') setIndex((i) => clamp(i + 1, 0, 5));
		else if (key === 'left' || key === 'right') {
			const dir = key === 'left' ? -1 : 1;
			if (index === 1) stepName(dir); else if (index === 2) stepIcon(dir);
		} else if (key === 'enter') {
			if (index === 0) return true;
			if (index === 1) setTyping(true);
			else if (index === 2) stepIcon(1);
			else if (index === 3) onBrowse();
			else if (index === 4) onChange({label: '', icon: '', iconData: ''});
			else onClose();
		}
		return true;
	}, [index, name, icon, onChange, onClose]);

	useKeys(handleKey, !typing);

	const onFieldKey = (e: KeyboardEvent) => {
		if (e.keyCode === 13) { e.preventDefault(); onChange({label: (e.target as HTMLInputElement).value}); setTyping(false); }
		else if (e.keyCode === 461 || e.keyCode === 27) { e.preventDefault(); setTyping(false); }
	};

	const iconDetail = edit.iconData ? 'Your picture' : edit.icon ? (isAppIcon(edit.icon) ? appIconLabel(edit.icon) : iconLabel(edit.icon)) : (kind === 'app' ? "The app's own icon" : iconLabel(icon) + `  (${own} icon)`);
	const shownImage = edit.iconData || (isAppIcon(icon) ? appIconUrl(icon) : '') || (!icon && base.image) || '';
	const rows = [
		{label: 'Release OK, then press ↓ to edit', detail: `Editing: ${base.label}`, hint: ''},
		{label: 'Name', detail: `${name}${edit.label ? '' : `  (${own} name)`}`, hint: kind === 'source' ? '← → step through suggestions · OK types a name' : 'OK types a name'},
		{label: 'Icon', detail: iconDetail, hint: '← → or OK to change the icon'},
		{label: 'Use a picture from a USB drive or the TV', detail: canBrowse ? 'A square picture works best' : 'Needs the Homebrew Channel (root); not available on this TV', hint: ''},
		{label: `Use ${own} name and icon`, detail: '', hint: ''},
		{label: 'Done', detail: '', hint: ''}
	];

	return (
		<div class="screen screen--picker">
			<div class="settings">
				<h1 class="settings__title">Edit name &amp; icon</h1>
				<p class="settings__hint">{typing ? 'Type a name, then press OK or Enter · Back cancels' : 'OK or Back when you are done · the home row shows the change at once'}</p>
				<div class="picker">
					{rows.map((row, i) => (
						<div
							key={row.label}
							class={`picker__row${i === index && i > 0 ? ' picker__row--focused' : ''}${i === 0 ? ' picker__row--info' : ''}`}
							onMouseEnter={() => { if (!typing && i > 0) setIndex(i); }}
						>
							{i === 2 && shownImage ? <img class="picker__icon" src={shownImage} alt="" /> : kind === 'source' && (i === 1 || i === 2) ? <SourceGlyph path={iconPath(icon || 'input')} cls="picker__icon" /> : <span class="picker__icon" />}
							<div class="picker__text">
								<div class="picker__label">{row.label}</div>
								{i === 1 && typing
									? <input ref={input} class="picker__input" type="text" defaultValue={edit.label || ''} placeholder={name} maxLength={MAX_SOURCE_NAME} onKeyDown={onFieldKey} />
									: row.detail && <div class="picker__detail">{row.detail}{i === index && row.hint ? '   ·   ' + row.hint : ''}</div>}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
