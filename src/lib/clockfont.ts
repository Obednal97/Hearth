// The typefaces the clock can use. All but "TV font" are bundled with the launcher (so they look the
// same on every TV and webOS version); "TV font" is whatever the TV's own web view uses for its UI.

export type ClockFont = 'inter' | 'tv' | 'poppins' | 'oswald' | 'mono' | 'serif' | 'outfit' | 'worksans' | 'bricolage' | 'bigshoulders' | 'jura' | 'tektur' | 'jetbrains' | 'lora' | 'poiret' | 'pixelify';

export interface ClockFontInfo {
	id: ClockFont;
	label: string;
	/** CSS font-family list, with fallbacks for while a font loads or if it is missing */
	family: string;
}

export const CLOCK_FONTS: readonly ClockFontInfo[] = [
	{id: 'inter', label: 'Inter (default)', family: '"Inter Variable", "LG Smart UI", "Helvetica Neue", Arial, sans-serif'},
	{id: 'tv', label: 'TV font', family: '"LG Smart UI", "Helvetica Neue", Helvetica, Arial, sans-serif'},
	{id: 'poppins', label: 'Poppins (rounded)', family: '"Poppins", "Helvetica Neue", Arial, sans-serif'},
	{id: 'oswald', label: 'Oswald (tall, narrow)', family: '"Oswald", "Arial Narrow", Arial, sans-serif'},
	{id: 'mono', label: 'Roboto Mono (digital)', family: '"Roboto Mono", "Courier New", monospace'},
	{id: 'serif', label: 'Cormorant (elegant serif)', family: '"Cormorant Garamond", Georgia, "Times New Roman", serif'},
	{id: 'outfit', label: 'Outfit (geometric)', family: '"Outfit", "Helvetica Neue", Arial, sans-serif'},
	{id: 'worksans', label: 'Work Sans (clean)', family: '"Work Sans", "Helvetica Neue", Arial, sans-serif'},
	{id: 'bricolage', label: 'Bricolage Grotesque (quirky)', family: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif'},
	{id: 'bigshoulders', label: 'Big Shoulders (tall, condensed)', family: '"Big Shoulders", "Arial Narrow", Arial, sans-serif'},
	{id: 'jura', label: 'Jura (techno)', family: '"Jura", "Helvetica Neue", Arial, sans-serif'},
	{id: 'tektur', label: 'Tektur (futuristic)', family: '"Tektur", "Helvetica Neue", Arial, sans-serif'},
	{id: 'jetbrains', label: 'JetBrains Mono (code)', family: '"JetBrains Mono", "Courier New", monospace'},
	{id: 'lora', label: 'Lora (classic serif)', family: '"Lora", Georgia, "Times New Roman", serif'},
	{id: 'poiret', label: 'Poiret One (art deco)', family: '"Poiret One", "Helvetica Neue", Arial, sans-serif'},
	{id: 'pixelify', label: 'Pixelify Sans (pixel)', family: '"Pixelify Sans", "Courier New", monospace'}
];

export const CLOCK_FONT_IDS: readonly ClockFont[] = CLOCK_FONTS.map((f) => f.id);

export function fontFamily (id: ClockFont): string {
	for (const f of CLOCK_FONTS) if (f.id === id) return f.family;
	return CLOCK_FONTS[0].family;
}

export function fontLabel (id: ClockFont): string {
	for (const f of CLOCK_FONTS) if (f.id === id) return f.label;
	return CLOCK_FONTS[0].label;
}
