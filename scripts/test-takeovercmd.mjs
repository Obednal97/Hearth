// The takeover's command builders and parsers, plus a replay of the real install steps on a fake TV folder.   Run: npm test
import {build} from 'esbuild';
import {execSync} from 'child_process';
import {existsSync, mkdirSync, readFileSync, mkdtempSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';

const out = new URL('../node_modules/.cache-takeovercmd-test.mjs', import.meta.url).pathname;
await build({entryPoints: [new URL('../src/lib/takeovercmd.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error'});
const h = await import(out);
const here = (p) => new URL(p, import.meta.url).pathname;
let fail = 0;
const eq = (a, b, m) => { const ok = a === b; if (!ok) fail++; console.log(ok ? 'ok  ' : 'FAIL', m, ok ? '' : `(${a} != ${b})`); };

eq([h.parseTakeoverResult('applied\n[exit 0]'), h.parseTakeoverResult('x\nsam-refused\n[exit 3]'), h.parseTakeoverResult('needs-restart'), h.parseTakeoverResult('busy'), h.parseTakeoverResult('off'), h.parseTakeoverResult('garbage'), h.parseTakeoverResult('')].join(','), 'applied,sam-refused,needs-restart,busy,off,failed,failed', 'the result word is found in the output');
const st = (o) => JSON.stringify(h.parseTakeoverStatus(o));
eq(st('enabled\nmounted\nweb\nlinked\n'), '{"enabled":true,"mounted":true,"web":true,"linked":true,"restartAllowed":false,"restartUsed":false}', 'status: everything in place');
eq(st('enabled\nlinked\nrestart-allowed\nrestart-used\n'), '{"enabled":true,"mounted":false,"web":false,"linked":true,"restartAllowed":true,"restartUsed":true}', 'status: switched on but not in place (after a restart), and sam restarts noted');
eq(st(''), '{"enabled":false,"mounted":false,"web":false,"linked":false,"restartAllowed":false,"restartUsed":false}', 'status: nothing');
eq([h.parseStock('stock\n[exit 0]'), h.parseStock('unsupported\nstock'), h.parseStock('')].join(','), 'stock,unsupported,failed', 'putting LG Home back: done, unsupported, or failed');
eq(JSON.stringify(h.parseApplyOutput('version=6\napplied\n[exit 0]')), '{"version":"6","result":"applied"}', 'the apply reports the installed version and the result');
eq(JSON.stringify(h.parseApplyOutput('version=\nfiles-missing')), '{"version":"","result":"files-missing"}', 'a TV with nothing installed reports no version');
eq(h.APPLY_COMMAND.indexOf('version=') !== -1 && h.APPLY_COMMAND.indexOf(' apply') !== -1, true, 'one command does both');
eq(h.parseRemoved('removed\nremoved\n'), true, 'removal confirmed');
eq(h.parseRemoved('still-mounted\n'), false, 'removal not confirmed while the mount is held');
for (const r of ['applied', 'launcher-missing', 'files-missing', 'sam-refused', 'needs-restart', 'busy', 'off', 'failed']) eq(h.takeoverMessage(r, 'x').length > 10, true, `a message for ${r}`);

const sh = readFileSync(here('../src/takeover/takeover.sh'), 'utf8');
const shim = readFileSync(here('../src/takeover/shim.html'), 'utf8');
// eslint-disable-next-line no-control-regex
eq(/<script/i.test(shim) || /PalmServiceBridge/.test(shim), false, 'the stand-in page has no script: a page with LG Home\'s id gets no answer to Luna calls');
eq(/background:#000/.test(shim), true, 'and it is black');
eq(/[^\x00-\x7F]/.test(sh) || /[^\x00-\x7F]/.test(shim), false, 'the files are plain ASCII (they travel as base64 through btoa)');

const root = mkdtempSync(join(tmpdir(), 'fake-tv-'));
const fake = (cmd) => cmd.split('/media/developer').join(root + '/media/developer').split('/var/lib/webosbrew').join(root + '/var/lib/webosbrew');
const run = (cmd) => { try { return execSync(fake(cmd), {shell: '/bin/sh', encoding: 'utf8'}); } catch (e) { return String(e.stdout || ''); } };
mkdirSync(root + '/var/lib/webosbrew/init.d', {recursive: true});
const steps = h.installSteps({takeoverSh: sh, shimHtml: shim});
// every step except the last (which would mount over the real system) runs for real on the fake folder
for (const s of steps.slice(0, -1)) {
  const o = run(h.withStatus(s.command));
  if (h.parseExit(o) !== 0) { fail++; console.log('FAIL step', s.name, o); }
}
const dir = root + '/media/developer/launcher-takeover';
eq(readFileSync(dir + '/takeover.sh', 'utf8') === sh, true, 'takeover.sh arrives byte for byte');
eq(readFileSync(dir + '/shim.html', 'utf8') === shim, true, 'shim.html arrives byte for byte');
eq(readFileSync(dir + '/version', 'utf8').trim(), h.TAKEOVER_VERSION, 'the version is written');
eq(existsSync(dir + '/takeover.sh.new') || existsSync(dir + '/shim.html.new'), false, 'no half-written files are left');
const allow = steps.findIndex((s) => s.name === 'allow restarting SAM');
eq(allow !== -1 && steps[allow].command === `touch '${h.TAKEOVER_DIR}/allow-restart'`, true, 'choosing the method is the permission to restart SAM: always written');
eq(allow !== -1 && allow < steps.length - 1, true, 'and it comes before the last step');
eq(steps[steps.length - 1].name, h.SLOW_STEP, 'the last step is the slow one');
eq(steps[steps.length - 1].command, `sh '${h.TAKEOVER_DIR}/takeover.sh' on`, 'and it switches the takeover on');
const rm = h.REMOVE_COMMAND;
eq(rm.indexOf('still-mounted') < rm.indexOf('rm -rf'), true, 'the folder is only deleted after the mount check');
rmSync(root, {recursive: true, force: true});
process.exit(fail ? 1 : 0);
