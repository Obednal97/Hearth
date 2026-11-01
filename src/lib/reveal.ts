// Home reveal: when Hearth starts, or comes back to the front after a while, the clock fades in, then the app rows rise
// into place, then Continue Watching. Pure decisions and timings only (the animations are CSS: `.reveal--*` in global.css),
// so they can be tested on their own and nothing here costs anything at start-up.

export type RevealStyle = 'off' | 'subtle' | 'cascade';
export const REVEAL_STYLES: readonly RevealStyle[] = ['off', 'subtle', 'cascade'];
export const DEFAULT_REVEAL: RevealStyle = 'subtle';

/** 'start': the first time Home is shown after the page started; 'return': back to the front after a while (shorter). */
export type RevealKind = 'start' | 'return';

/** Away for less than this: no reveal (a quick look at another app should not replay it). */
export const REVEAL_MIN_AWAY_MS = 5000;

export interface RevealCheck {
	style: RevealStyle;
	/** Home has not been shown since the page started (started visible, or in the background and shown now) */
	firstShow: boolean;
	/** how long Hearth was in the background (ms) */
	awayMs: number;
	/** quiet mode had the apps hidden or the screen dimmed: its own fade brings them back */
	quiet: boolean;
	/** Settings, a menu or a pop-up is over Home */
	covered: boolean;
}

/** Should Home play its reveal, and which one (null: show everything at once). */
export function revealKind (c: RevealCheck): RevealKind | null {
	if (c.style === 'off' || c.covered || c.quiet) return null;
	if (c.firstShow) return 'start';
	return c.awayMs >= REVEAL_MIN_AWAY_MS ? 'return' : null;
}

/** Cascade: the tiles in view come in one after another; the stagger stops growing after this many. */
export const CASCADE_MAX = 8;

/** Cascade: the animation delay (ms) of the n-th tile in view (n from 0). */
export function cascadeDelay (kind: RevealKind, n: number): number {
	const step = Math.min(Math.max(0, n), CASCADE_MAX - 1);
	return kind === 'start' ? 80 + step * 30 : 40 + step * 15;
}

/** When the reveal classes can come off again (every animation has ended; a little spare for a slow frame). */
export function revealEndMs (kind: RevealKind, style: RevealStyle): number {
	if (style === 'cascade') return kind === 'start' ? cascadeDelay(kind, CASCADE_MAX) + 200 + 120 : cascadeDelay(kind, CASCADE_MAX) + 130 + 100;
	return kind === 'start' ? 350 + 120 : 200 + 100;
}

// ---- the first frame (main.tsx says when it has been drawn) ----

let drawn = false;
let waiting: (() => void)[] = [];

/** Called once by main.tsx after the first frame was drawn. */
export function noteFirstFrame (): void {
	if (drawn) return;
	drawn = true;
	const list = waiting;
	waiting = [];
	list.forEach((f) => f());
}

/** Runs `f` once the first frame has been drawn (at once if it has). Returns a function that cancels it. */
export function whenFirstFrame (f: () => void): () => void {
	if (drawn) { f(); return () => undefined; }
	waiting.push(f);
	return () => { waiting = waiting.filter((x) => x !== f); };
}
