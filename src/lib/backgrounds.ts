// Built-in backgrounds (Settings → Wallpaper → Built-in background): plain colours and gradients drawn by CSS, so
// they cost no memory and no start-up time, and a few bundled pictures (public/wallpapers, 1920 px wide, painted by CSS
// behind everything, so they need no root). 'theme' is the current theme's own background.

import {setRootVars} from './cssvars';

export interface Background {
	id: string;
	label: string;
	/** gradient start, middle, end (the same colour three times for a plain one) */
	colors: [string, string, string];
	/** a bundled picture (path inside the app); the colours are what shows until it has loaded */
	image?: string;
}

const plain = (c: string): [string, string, string] => [c, c, c];

export const BACKGROUNDS: readonly Background[] = [
	{id: 'theme', label: "The theme's own", colors: ['', '', '']},
	{id: 'nature-show', label: 'Slideshow: Nature photos', colors: ['#10161a', '#10161a', '#080b0d']},
	{id: 'nature-01', label: 'Photo: Nature 1', colors: ['#181e22', '#1a1e21', '#0d1115'], image: 'wallpapers/nature-01.jpg'},
	{id: 'nature-02', label: 'Photo: Nature 2', colors: ['#262e36', '#5e6061', '#545350'], image: 'wallpapers/nature-02.jpg'},
	{id: 'nature-03', label: 'Photo: Nature 3', colors: ['#2e2e4c', '#23182c', '#29233c'], image: 'wallpapers/nature-03.jpg'},
	{id: 'nature-04', label: 'Photo: Nature 4', colors: ['#003236', '#033c35', '#011010'], image: 'wallpapers/nature-04.jpg'},
	{id: 'nature-05', label: 'Photo: Nature 5', colors: ['#42434b', '#182832', '#0d1820'], image: 'wallpapers/nature-05.jpg'},
	{id: 'nature-06', label: 'Photo: Nature 6', colors: ['#455b6c', '#324251', '#162632'], image: 'wallpapers/nature-06.jpg'},
	{id: 'nature-07', label: 'Photo: Nature 7', colors: ['#07263f', '#143048', '#1c1a1a'], image: 'wallpapers/nature-07.jpg'},
	{id: 'nature-08', label: 'Photo: Nature 8', colors: ['#3b4f54', '#656b61', '#443730'], image: 'wallpapers/nature-08.jpg'},
	{id: 'nature-09', label: 'Photo: Nature 9', colors: ['#0e140e', '#0b100b', '#050a06'], image: 'wallpapers/nature-09.jpg'},
	{id: 'nature-10', label: 'Photo: Nature 10', colors: ['#3c3934', '#262824', '#161f1d'], image: 'wallpapers/nature-10.jpg'},
	{id: 'nature-11', label: 'Photo: Nature 11', colors: ['#051621', '#13333e', '#12262d'], image: 'wallpapers/nature-11.jpg'},
	{id: 'charcoal', label: 'Plain: charcoal', colors: plain('#1a1a1a')},
	{id: 'navy', label: 'Plain: deep navy', colors: plain('#0d1b2a')},
	{id: 'dusk', label: 'Gradient: Dusk (dark)', colors: ['#2b1055', '#5b2a86', '#1a0b2e']},
	{id: 'ocean', label: 'Gradient: Ocean (dark)', colors: ['#06202e', '#0b4a63', '#04141c']},
	{id: 'forest', label: 'Gradient: Forest (dark)', colors: ['#0b2415', '#1c4a2c', '#07140c']},
	{id: 'ember', label: 'Gradient: Ember (dark)', colors: ['#2a0a0a', '#6b1d14', '#14070a']},
	{id: 'aurora', label: 'Gradient: Aurora (dark)', colors: ['#06181f', '#0f4c4a', '#1b2a5e']},
	{id: 'cloud', label: 'Gradient: Cloud (light)', colors: ['#c6d0dc', '#aebbca', '#93a5b8']},
	{id: 'peach', label: 'Gradient: Peach (light)', colors: ['#f2d8c6', '#e6bfa6', '#d4a088']},
	{id: 'mint', label: 'Gradient: Mint (light)', colors: ['#cfe3d6', '#b2d3bf', '#8fbba3']},
	{id: 'sky', label: 'Gradient: Sky (light)', colors: ['#c9dcee', '#aac7e2', '#86acd0']},
	{id: 'lavender', label: 'Gradient: Lavender (light)', colors: ['#ddd5ee', '#c6b9e0', '#a99bcc']}
];

/** The bundled photos, and the id of the slideshow that plays them one after another (see app.tsx). */
export const NATURE_SHOW = 'nature-show';
export const NATURE_IDS: string[] = BACKGROUNDS.filter((b) => !!b.image).map((b) => b.id);

/** The next photo of the slideshow: a random other one when shuffled, else the following one. */
export function nextNature (index: number, shuffle: boolean): number {
	const n = NATURE_IDS.length;
	if (n < 2) return 0;
	if (!shuffle) return (index + 1) % n;
	const r = Math.floor(Math.random() * (n - 1));
	return r >= index ? r + 1 : r;
}

/** Address of the bundled photo with this index (absolute: see `imageUrl`). */
export function natureUrl (index: number): string {
	const b = BACKGROUNDS.filter((x) => x.id === NATURE_IDS[index])[0];
	return b && b.image ? imageUrl(b.image) : '';
}

export const BACKGROUND_IDS: string[] = BACKGROUNDS.map((b) => b.id);

export function backgroundLabel (id: string): string {
	const b = BACKGROUNDS.filter((x) => x.id === id)[0];
	return b ? b.label : BACKGROUNDS[0].label;
}

/** A custom property's url() is resolved against the stylesheet (assets/), not the page, so the page's address is used. */
function imageUrl (path: string): string {
	return typeof document !== 'undefined' && document.baseURI ? new URL(path, document.baseURI).href : path;
}

/** Puts the chosen background on screen; 'theme' puts the theme's own colours back. */
/** With no picture on screen the scrim shades only the plain background, so it is left out when that is pure black
 *  (it would change nothing) or when the theme has no scrim. */
export function applyBackground (id: string, themeColors: {wallpaperStart: string; wallpaperMid: string; wallpaperEnd: string; scrimTop?: string; scrimMid?: string; scrimBottom?: string}): void {
	const b = BACKGROUNDS.filter((x) => x.id === id)[0];
	const c: [string, string, string] = b && b.id !== 'theme' ? b.colors : [themeColors.wallpaperStart, themeColors.wallpaperMid, themeColors.wallpaperEnd];
	const black = c.every((x) => /^#0{3}(0{3})?$/.test(x));
	const noScrim = themeColors.scrimTop !== undefined && Number(themeColors.scrimTop) === 0 && Number(themeColors.scrimMid) === 0 && Number(themeColors.scrimBottom) === 0;
	setRootVars({
		'--color-wallpaper-start': c[0], '--color-wallpaper-mid': c[1], '--color-wallpaper-end': c[2],
		'--wallpaper-image': b && b.image ? `url("${imageUrl(b.image)}")` : 'none',
		'--scrim-bare-display': (black && !(b && b.image)) || noScrim ? 'none' : 'block'
	});
}
