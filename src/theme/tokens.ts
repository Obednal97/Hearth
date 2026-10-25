// Design tokens: the single source of truth for colour, spacing, type and motion.
// `applyTokens()` exposes them as CSS custom properties so the stylesheet and the
// components read the same values.

import {setRootVars} from '../lib/cssvars';

export type ThemeName = 'black' | 'grey' | 'midnight' | 'forest' | 'cloud' | 'sand' | 'mist';

export interface Colors {
	bg: string; wallpaperStart: string; wallpaperMid: string; wallpaperEnd: string;
	textPrimary: string; textSecondary: string; textMuted: string;
	tileBg: string; tileBgFocus: string; tileBorder: string; tileBorderFocus: string;
	badge: string; badgeText: string; liftShadow: string;
	buttonBorder: string; buttonActiveBg: string; buttonActiveText: string;
	switchTrack: string; switchTrackOn: string; switchKnob: string; switchKnobOn: string;
	danger: string;
	/** dim layer behind Settings, so a wallpaper doesn't fight the text */
	overlay: string;
	pickerBg: string;
	/** r, g, b of the soft fade over the wallpaper (black on dark themes, white on light ones) */
	scrim: string;
	/** opacity of the shade at the top, middle and bottom of the wallpaper (0: none, as on light themes, where a pale shade glows) */
	scrimTop: string; scrimMid: string; scrimBottom: string;
}

/** OLED black: pure #000 so the pixels are off, with neutral greys on top. */
const BLACK: Colors = {
	bg: '#000000',
	wallpaperStart: '#000000',
	wallpaperMid: '#000000',
	wallpaperEnd: '#000000',
	textPrimary: '#F2F2F2',
	textSecondary: '#A8A8A8',
	textMuted: '#6A6A6A',
	tileBg: '#101010',
	tileBgFocus: '#1D1D1D',
	tileBorder: '#2A2A2A',
	tileBorderFocus: '#F2F2F2',
	badge: '#F2F2F2',
	badgeText: '#000000',
	liftShadow: 'rgba(0, 0, 0, 0.8)',
	buttonBorder: '#3A3A3A',
	buttonActiveBg: '#F2F2F2',
	buttonActiveText: '#000000',
	switchTrack: '#333333',
	switchTrackOn: '#F2F2F2',
	switchKnob: '#A8A8A8',
	switchKnobOn: '#000000',
	danger: '#EF7A73',
	overlay: 'rgba(0, 0, 0, 0.88)',
	pickerBg: '#000000',
	scrim: '0, 0, 0', scrimTop: '0.22', scrimMid: '0.08', scrimBottom: '0.5'
};

/** The calm blue-grey look. */
const GREY: Colors = {
	bg: '#101a24',
	wallpaperStart: '#1c2b3a',
	wallpaperMid: '#25384c',
	wallpaperEnd: '#101a24',
	textPrimary: '#F2F5F8',
	textSecondary: '#B9C6D3',
	textMuted: '#7F90A1',
	tileBg: '#1a2733',
	tileBgFocus: '#243546',
	tileBorder: '#34485c',
	tileBorderFocus: '#F2F5F8',
	badge: '#F2F5F8',
	badgeText: '#101a24',
	liftShadow: 'rgba(0, 0, 0, 0.6)',
	buttonBorder: '#43586d',
	buttonActiveBg: '#F2F5F8',
	buttonActiveText: '#101a24',
	switchTrack: '#34485c',
	switchTrackOn: '#F2F5F8',
	switchKnob: '#B9C6D3',
	switchKnobOn: '#101a24',
	danger: '#EF7A73',
	overlay: 'rgba(10, 17, 24, 0.82)',
	pickerBg: '#0a1118',
	scrim: '0, 0, 0', scrimTop: '0.22', scrimMid: '0.08', scrimBottom: '0.5'
};

/** #rrggbb as rgba() (8-digit hex is not understood by the web view of older TVs). */
function rgba (hex: string, alpha: number): string {
	return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;
}

/** A dark theme from its background, tiles and accent. */
function dark (bg: string, w: [string, string, string], tile: string, focus: string, edge: string, ink: [string, string, string]): Colors {
	return {
		bg, wallpaperStart: w[0], wallpaperMid: w[1], wallpaperEnd: w[2],
		textPrimary: ink[0], textSecondary: ink[1], textMuted: ink[2],
		tileBg: tile, tileBgFocus: focus, tileBorder: edge, tileBorderFocus: ink[0],
		badge: ink[0], badgeText: bg, liftShadow: 'rgba(0, 0, 0, 0.6)',
		buttonBorder: edge, buttonActiveBg: ink[0], buttonActiveText: bg,
		switchTrack: edge, switchTrackOn: ink[0], switchKnob: ink[1], switchKnobOn: bg,
		danger: '#EF7A73', overlay: rgba(bg, 0.82), pickerBg: bg, scrim: '0, 0, 0', scrimTop: '0.22', scrimMid: '0.08', scrimBottom: '0.5'
	};
}

/** A light theme: dark text on soft, mid-light backgrounds and off-white tiles. `dim` is the darker backdrop of Settings and
 *  the pickers, so the bright rows stand out and the screen is easy on the eyes. Nothing is pure white, so a bright
 *  room or an OLED panel is not dazzled. */
function light (bg: string, w: [string, string, string], tile: string, edge: string, focus: string, dim: string): Colors {
	return {
		bg, wallpaperStart: w[0], wallpaperMid: w[1], wallpaperEnd: w[2],
		textPrimary: '#1B2430', textSecondary: '#2E3946', textMuted: '#434F5C',
		tileBg: tile, tileBgFocus: focus, tileBorder: edge, tileBorderFocus: '#1B2430',
		badge: '#1B2430', badgeText: '#E4E9EE', liftShadow: 'rgba(0, 0, 0, 0.25)',
		buttonBorder: '#6F7C8A', buttonActiveBg: '#1B2430', buttonActiveText: '#E4E9EE',
		switchTrack: '#9AA6B2', switchTrackOn: '#1B2430', switchKnob: '#566372', switchKnobOn: '#E4E9EE',
		danger: '#C0392B', overlay: rgba(dim, 0.95), pickerBg: dim, scrim: '0, 0, 0', scrimTop: '0', scrimMid: '0', scrimBottom: '0'
	};
}

const SOFT_INK: [string, string, string] = ['#F2F5F8', '#B9C6D3', '#7F90A1'];

export const THEMES: Record<ThemeName, Colors> = {
	black: BLACK,
	grey: GREY,
	midnight: dark('#0a1020', ['#101a36', '#1b2a5c', '#0a1020'], '#121a30', '#1c2848', '#2c3d66', SOFT_INK),
	forest: dark('#0b1a12', ['#12281b', '#1d4030', '#0b1a12'], '#12231a', '#1b3326', '#2d4a3a', ['#F1F6F2', '#B7C9BC', '#7C927F']),
	cloud: light('#B4C0CE', ['#C6D0DC', '#AEBBCA', '#93A5B8'], '#D6DEE6', '#9AA9BA', '#E8EEF3', '#8895A4'),
	sand: light('#CFC0A8', ['#DCCFB9', '#CBBB9F', '#B4A183'], '#E6DBC8', '#B2A183', '#F2EADC', '#A29478'),
	mist: light('#AFC4C9', ['#C2D4D8', '#A8C0C6', '#8BA8B0'], '#D3E1E4', '#94ADB3', '#E6EFF1', '#82999F')
};

/** The themes with dark text (the clock turns dark grey on them, see prefs). */
export const LIGHT_THEMES: ThemeName[] = ['cloud', 'sand', 'mist'];

export const FONT = {
	family: '"Inter Variable", "LG Smart UI", "Helvetica Neue", Arial, sans-serif',
	rowLabel: 20,
	tileLabel: 19,
	settingsTitle: 40,
	settingsTab: 26,
	settingsButton: 22,
	optionLabel: 26,
	optionDescription: 20,
	toast: 24
} as const;

export const LAYOUT = {
	screenWidth: 1920,
	screenHeight: 1080,
	edgePadding: 140,       // padding of the Settings screens (the home row has its own, adjustable margins)
	headerTop: 84,
	tileSize: 144,          // app / source tiles are square at 100% icon size
	tileGap: 28,
	tileRadius: 24,
	rowLabelGap: 14,        // gap between a row's subheader and its tiles
	rowGap: 28,             // vertical space between rows
	gridTileSize: 112,      // tiles in the Settings grid (Apps, Sources): smaller than on the home row so more fit
	gridColumns: 11         // tiles per line in that grid (11 x (112 + 28) = 1540 px of the 1640 px available)
} as const;

export const MOTION = {
	focusMs: 160,
	scrollMs: 260,
	focusScale: 1.12,
	liftScale: 1.2,         // a tile picked up in re-order mode
	unfocusedRowOpacity: 0.55
} as const;

/** The scrim is not drawn at all when all three of its strengths are 0 (the light themes): nothing to paint or blend. */
function scrimDisplay (c: {scrimTop: string; scrimMid: string; scrimBottom: string}): string {
	return Number(c.scrimTop) === 0 && Number(c.scrimMid) === 0 && Number(c.scrimBottom) === 0 ? 'none' : 'block';
}

/** Writes every token onto :root as --color-*, --font-*, --layout-*, --motion-*. */
export function applyTokens (theme: ThemeName = 'black'): void {
	const groups: Record<string, object> = {color: THEMES[theme], font: FONT, layout: LAYOUT, motion: MOTION};
	const vars: Record<string, string> = {};
	for (const group in groups) {
		const values = groups[group] as Record<string, string | number>;
		for (const key in values) {
			const value = values[key];
			const unit = typeof value === 'number' && !/scale|opacity|columns/i.test(key) ? (key.endsWith('Ms') ? 'ms' : 'px') : '';
			vars[`--${group}-${kebab(key)}`] = `${value}${unit}`;
		}
	}
	vars['--scrim-display'] = scrimDisplay(THEMES[theme]);
	setRootVars(vars);
}

/** Switch the colour theme at runtime. */
export function applyTheme (theme: ThemeName): void {
	const colors = THEMES[theme] as unknown as Record<string, string>;
	const vars: Record<string, string> = {};
	for (const key in colors) vars[`--color-${kebab(key)}`] = colors[key];
	vars['--scrim-display'] = scrimDisplay(THEMES[theme]);
	setRootVars(vars);
}

function kebab (s: string): string {
	return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}
