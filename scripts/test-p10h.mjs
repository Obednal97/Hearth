// Phase 10h: Debug RAM warning and single storage line, dimmer Settings backdrop on light themes.   Run: npm test
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url)) + '/';
const src = path.resolve(dir, '../src') + '/';
const out = path.resolve(dir, '../node_modules/.cache-p10h-test.mjs');
await build({stdin: {contents: `export {debugPages, LOW_RAM_MB} from './lib/debuginfo'; export {THEMES, LIGHT_THEMES} from './theme/tokens'; export {DEFAULT_CONFIG} from './lib/storage';`, resolveDir: src, loader: 'ts'},
	bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'silent'});
const a = await import(out);
let fail = 0;
const eq = (got, want, name) => { const ok = JSON.stringify(got) === JSON.stringify(want); console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : `\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`)); if (!ok) fail++; };
const disks = [{mount: '/', totalMB: 1200, freeMB: 0}, {mount: '/var', totalMB: 722, freeMB: 255}, {mount: '/mnt/lg/appstore', totalMB: 2000, freeMB: 720}];
const page2 = (stats) => a.debugPages({about: '', rootDetail: '', appList: null, weather: 'off', config: a.DEFAULT_CONFIG, events: [], userAgent: 'Chrome/87.0', stats})[1].lines.join('\n');
const low = page2({ramTotalMB: 1200, ramFreeMB: 80, disks});
eq(low.indexOf('FREE RAM TOO LOW: HEARTH MIGHT BEHAVE UNEXPECTEDLY') !== -1, true, 'under 100 MB free: the warning is shown');
eq(page2({ramTotalMB: 1200, ramFreeMB: 100, disks}).indexOf('FREE RAM') === -1, true, '100 MB free: no warning');
eq(page2({ramTotalMB: 1200, ramFreeMB: -1, disks}).indexOf('FREE RAM') === -1, true, 'unknown RAM: no warning');
const ok = page2({ramTotalMB: 1200, ramFreeMB: 234, disks});
eq([ok.indexOf('Storage /mnt/lg/appstore') !== -1, ok.indexOf('Storage /var') === -1, ok.indexOf('Storage /:') === -1], [true, true, true], 'only the app storage line is listed');
eq(page2({ramTotalMB: 1200, ramFreeMB: 234, disks: disks.slice(0, 2)}).split('Storage').length - 1, 2, 'a TV without that mount still lists what it has');
for (const n of a.LIGHT_THEMES) {
	const c = a.THEMES[n];
	const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
	eq([lum(c.pickerBg) < lum(c.tileBg) - 0.15, lum(c.pickerBg) < 0.62], [true, true], `${n}: Settings backdrop is clearly dimmer than the rows`);
}
console.log(fail ? `${fail} FAILED` : 'all ok');
process.exit(fail ? 1 : 0);
