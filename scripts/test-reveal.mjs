// Tests for src/lib/reveal.ts (Home reveal: when it plays, and its timings).   Run: npm test
import {build} from 'esbuild';

const out = new URL('../node_modules/.cache-reveal-test.mjs', import.meta.url).pathname;
await build({entryPoints: [new URL('../src/lib/reveal.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error'});
const r = await import(out);
let fail = 0;
const eq = (a, b, m) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) { fail++; console.log('FAIL', m, JSON.stringify(a), '!=', JSON.stringify(b)); } else console.log('ok  ', m); };

const base = {style: 'subtle', firstShow: false, awayMs: 60000, quiet: false, covered: false};
const kind = (o) => r.revealKind({...base, ...o});
eq(kind({firstShow: true, awayMs: 0}), 'start', 'the first show after the page started plays the start reveal');
eq(kind({}), 'return', 'back after a minute away: the shorter return reveal');
eq([kind({awayMs: r.REVEAL_MIN_AWAY_MS - 1}), kind({awayMs: r.REVEAL_MIN_AWAY_MS})], [null, 'return'], 'away for less than 5 s: no reveal; 5 s or more: reveal');
eq([kind({awayMs: 0}), kind({awayMs: 1200})], [null, null], 'Home pressed while in front, or a quick look at another app: no reveal');
eq([kind({quiet: true}), kind({quiet: true, firstShow: true})], [null, null], 'waking from quiet mode: no reveal (quiet mode has its own fade)');
eq([kind({style: 'off'}), kind({style: 'off', firstShow: true})], [null, null], 'the setting Off: never');
eq([kind({covered: true}), kind({covered: true, firstShow: true})], [null, null], 'Settings, a menu or a pop-up over Home: no reveal');
eq([kind({style: 'cascade'}), kind({style: 'cascade', firstShow: true})], ['return', 'start'], 'Cascade follows the same rules');

eq([0, 1, 7, 8, 30].map((n) => r.cascadeDelay('start', n)), [80, 110, 290, 290, 290], 'Cascade (start): 30 ms apart after the clock, the stagger stops after 8 tiles');
eq([0, 1, 7, 9].map((n) => r.cascadeDelay('return', n)), [40, 55, 145, 145], 'Cascade (return): shorter');
eq(r.revealEndMs('start', 'subtle') > 350 && r.revealEndMs('return', 'subtle') > 200 && r.revealEndMs('return', 'subtle') < r.revealEndMs('start', 'subtle'), true, 'the classes come off after the animations, sooner on a return');
eq(r.revealEndMs('start', 'cascade') >= r.cascadeDelay('start', 99) + 200, true, 'and after the last cascade tile');

let ran = 0;
const cancel = r.whenFirstFrame(() => { ran++; });
r.whenFirstFrame(() => { ran += 10; })();        // cancelled at once
eq(ran, 0, 'nothing runs before the first frame');
r.noteFirstFrame();
r.noteFirstFrame();
eq(ran, 1, 'the first frame runs what waited, once (a cancelled wait does not run)');
r.whenFirstFrame(() => { ran++; });
eq(ran, 2, 'after the first frame a new wait runs at once');
cancel();

if (fail) { console.log(`${fail} failed`); process.exit(1); }
