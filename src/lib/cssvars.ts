// CSS custom properties, with a fallback for Chromium 38 (webOS 3.x), which has none and drops every declaration that
// uses var(). Every place that sets a custom property goes through this file:
//  - setRootVars: properties on the whole page (theme tokens, background, bottom fade);
//  - varScope: properties on one element and what is inside it (the home rows, the clock, ...).
// Modern engines get plain custom properties. In the legacy build (LEGACY), the stylesheet source is parsed once and
// re-written with the values substituted, in one style element, rule by rule in the original order: the plain rule with
// the page-wide values, then the same rule again for the inside of each scope that sets a variable it uses (the rule is
// written for the element carrying the scope's class `vs-<name>`, or anything inside it). Nothing here runs in the normal build.

import {LEGACY} from '../config/features';

export {LEGACY};

type Vars = Record<string, string | undefined>;

// ---------- values ----------

/** The text of `text` with every var(--x, fallback) replaced; null when a variable has no value and no fallback
 *  (the declaration is then dropped, as the browser would do). `used` collects the variable names seen. */
export function substitute (text: string, lookup: (name: string) => string | undefined, used?: string[]): string | null {
	let out = '';
	let i = 0;
	while (i < text.length) {
		const at = text.indexOf('var(', i);
		if (at === -1) { out += text.slice(i); break; }
		out += text.slice(i, at);
		let depth = 1;
		let j = at + 4;
		while (j < text.length && depth > 0) {
			const ch = text.charAt(j);
			if (ch === '(') depth++; else if (ch === ')') depth--;
			j++;
		}
		const inner = text.slice(at + 4, j - 1);
		const comma = inner.indexOf(',');
		const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
		if (used) used.push(name);
		let value = lookup(name);
		if (value === undefined && comma !== -1) {
			const fallback = substitute(inner.slice(comma + 1).trim(), lookup, used);
			if (fallback === null) return null;
			value = fallback;
		}
		if (value === undefined) return null;
		out += value;
		i = j;
	}
	return out;
}

// ---------- the stylesheet as data ----------

interface Decl {prop: string; value: string; vars: string[]}
interface Rule {selectors: string[]; decls: Decl[]}

/** Splits at `sep` outside brackets, parentheses and quotes. */
export function splitTop (text: string, sep: string): string[] {
	const parts: string[] = [];
	let depth = 0, quote = '', start = 0;
	for (let i = 0; i < text.length; i++) {
		const ch = text.charAt(i);
		if (quote) { if (ch === quote) quote = ''; continue; }
		if (ch === '"' || ch === "'") quote = ch;
		else if (ch === '(' || ch === '[') depth++;
		else if (ch === ')' || ch === ']') depth--;
		else if (ch === sep && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
	}
	parts.push(text.slice(start));
	return parts.map((p) => p.trim()).filter(Boolean);
}

function declsOf (body: string): Decl[] {
	return splitTop(body, ';').map((d) => {
		const colon = d.indexOf(':');
		if (colon === -1) return null;
		const value = d.slice(colon + 1).trim();
		const vars: string[] = [];
		const re = /var\(\s*(--[\w-]+)/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(value))) vars.push(m[1]);
		return {prop: d.slice(0, colon).trim(), value, vars};
	}).filter(Boolean) as Decl[];
}

/** Rules and at-rules (only @font-face is used) of a stylesheet without nesting. Fonts' relative addresses are
 *  rewritten because the rewritten sheet lives in the page, not in assets/. */
export function parseSheet (css: string): {rules: Rule[]; fonts: string[]} {
	const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const rules: Rule[] = [];
	const fonts: string[] = [];
	let i = 0;
	while (i < text.length) {
		const open = text.indexOf('{', i);
		if (open === -1) break;
		let depth = 1, j = open + 1;
		while (j < text.length && depth > 0) { const ch = text.charAt(j); if (ch === '{') depth++; else if (ch === '}') depth--; j++; }
		const head = text.slice(i, open).trim();
		const body = text.slice(open + 1, j - 1);
		i = j;
		if (head.charAt(0) === '@') { if (head.indexOf('@font-face') === 0) fonts.push('@font-face{' + body.replace(/url\((['"]?)\.\.\/assets\//g, 'url($1assets/') + '}'); continue; }
		rules.push({selectors: splitTop(head, ','), decls: declsOf(body)});
	}
	return {rules, fonts};
}

/** The compounds of a selector with the combinators between them: ".a > .b .c" -> [".a", " > ", ".b", " ", ".c"]. */
function compounds (selector: string): string[] {
	const out: string[] = [];
	let depth = 0, cur = '', pending = '';
	const flush = () => { if (cur) { out.push(cur); cur = ''; } };
	for (let i = 0; i < selector.length; i++) {
		const ch = selector.charAt(i);
		if (ch === '(' || ch === '[') depth++;
		if (ch === ')' || ch === ']') depth--;
		if (depth === 0 && (ch === ' ' || ch === '>' || ch === '+' || ch === '~')) {
			flush(); pending += ch;
			continue;
		}
		if (pending) { out.push(' ' + pending.replace(/\s+/g, '') + ' '); pending = ''; }
		cur += ch;
	}
	flush();
	return out;
}

/** `selector` with `piece` (a class or a :not(.x), one class worth of weight) added to its last compound. */
export function weighted (selector: string): string {
	const parts = compounds(selector);
	const last = parts.length - 1;
	return parts.map((p, n) => (n === last ? addTo(p, ':not(.vsb)') : p)).join('').replace(/ {2,}/g, ' ');
}

function addTo (compound: string, piece: string): string {
	const pe = compound.indexOf('::');
	return pe === -1 ? compound + piece : compound.slice(0, pe) + piece + compound.slice(pe);
}

/** `selector` rewritten so that an element carrying class `cls` can be any one of its compounds, or an ancestor of all
 *  of it. Every plain rule is written with one extra `:not(.vsb)` (matches everything), so a rule for a scope has
 *  exactly the weight the plain rule has: the cascade (weight, then order) stays the one the stylesheet was written for. */
export function scoped (selector: string, cls: string): string[] {
	const parts = compounds(selector);
	const list = ['.' + cls + ' ' + selector];
	for (let k = 0; k < parts.length; k += 2) list.push(parts.map((p, n) => (n === k ? addTo(p, '.' + cls) : p)).join('').replace(/ {2,}/g, ' '));
	return list;
}

// ---------- the legacy engine ----------

let rules: Rule[] = [];
let fontCss = '';
let started = false;
const rootVars: Record<string, string> = {};
const scopes: Record<string, Record<string, string>> = {};
const sheets: Record<string, HTMLStyleElement> = {};
const written: Record<string, string> = {};

function declText (d: Decl, value: string): string {
	let s = d.prop + ':' + value + ';';
	if (d.prop === 'filter') s += '-webkit-filter:' + value + ';';
	return s;
}

function writeSheet (id: string, css: string): void {
	if (written[id] === css) return;
	written[id] = css;
	let el = sheets[id];
	if (!el) { el = document.createElement('style'); el.id = 'vs-' + id; document.head.appendChild(el); sheets[id] = el; }
	el.textContent = css;
}

/** The whole stylesheet, rule by rule in the original order: the plain rule with the page's values, then, for each
 *  scope that sets a variable the rule uses, the rule again for the inside of that scope. */
function emitAll (): void {
	const lookup = (n: string) => rootVars[n];
	let css = fontCss;
	for (const r of rules) {
		let body = '';
		for (const d of r.decls) {
			const v = d.vars.length ? substitute(d.value, lookup) : d.value;
			if (v !== null) body += declText(d, v);
		}
		if (body) css += r.selectors.map(weighted).join(',') + '{' + body + '}';
		for (const name in scopes) {
			const own = scopes[name];
			const inScope = (n: string) => (own[n] !== undefined ? own[n] : rootVars[n]);
			let extra = '';
			for (const d of r.decls) {
				if (!d.vars.some((n) => own[n] !== undefined)) continue;
				const v = substitute(d.value, inScope);
				if (v !== null) extra += declText(d, v);
			}
			if (!extra) continue;
			const sel: string[] = [];
			r.selectors.forEach((x) => scoped(x, 'vs-' + name).forEach((y) => sel.push(y)));
			css += sel.join(',') + '{' + extra + '}';
		}
	}
	writeSheet('root', css);
}

/** Legacy build only: hands over the stylesheet source. Call once, before anything is drawn. */
export function startLegacyVars (css: string): void {
	if (!LEGACY || started) return;
	started = true;
	const parsed = parseSheet(css);
	rules = parsed.rules;
	fontCss = parsed.fonts.join('');
	emitAll();
	// The built stylesheet (injected by the bundle's own start-up code, var() declarations dropped by this engine, no
	// prefixes) is replaced by ours. It is told apart from the page's tiny inline style by its size.
	const old = document.querySelectorAll('style');
	for (let i = 0; i < old.length; i++) {
		const el = old[i];
		if (!el.id && (el.textContent || '').length > 2000 && el.parentNode) el.parentNode.removeChild(el);
	}
}

/** Properties for the whole page. Names include the leading "--". */
export function setRootVars (vars: Record<string, string>): void {
	if (!LEGACY) {
		const style = document.documentElement.style;
		for (const k in vars) style.setProperty(k, vars[k]);
		return;
	}
	let changed = false;
	for (const k in vars) if (rootVars[k] !== vars[k]) { rootVars[k] = vars[k]; changed = true; }
	if (!changed || !started) return;
	emitAll();
}

export interface VarScope {
	/** class to add to the element ('' in the normal build) */
	cls: string;
	/** the custom properties as "--a:1;--b:2" for a style string ('' in the legacy build) */
	css: string;
	/** the same as an object, for a style object ({} in the legacy build) */
	obj: Record<string, string>;
}

/** Custom properties for one element and what is inside it. `name` is a short unique word per place (home, clock...). */
export function varScope (name: string, vars: Vars): VarScope {
	const clean: Record<string, string> = {};
	for (const k in vars) { const v = vars[k]; if (v !== undefined && v !== '') clean[k] = v; }
	if (!LEGACY) {
		let css = '';
		for (const k in clean) css += (css ? ';' : '') + k + ':' + clean[k];
		return {cls: '', css, obj: clean};
	}
	const before = JSON.stringify(scopes[name] || {});
	if (JSON.stringify(clean) !== before) {
		scopes[name] = clean;
		if (started) emitAll();
	}
	return {cls: 'vs-' + name, css: '', obj: {}};
}
