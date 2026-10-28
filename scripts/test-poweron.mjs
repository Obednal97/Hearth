// Tests for "When the TV turns on, open…": the start-up file it builds, reading the TV's status, the messages, and the
// install / remove commands run against a fake TV folder.   Run: npm test
import {build} from 'esbuild';
import {execSync} from 'child_process';
import {existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';

const out = new URL('../node_modules/.cache-poweroncmd-test.mjs', import.meta.url).pathname;
await build({entryPoints: [new URL('../src/lib/poweroncmd.ts', import.meta.url).pathname], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'error'});
const h = await import(out);
let fail = 0;
const eq = (a, b, m) => { const ok = a === b; if (!ok) fail++; console.log(ok ? 'ok  ' : 'FAIL', m, ok ? '' : `(${a} != ${b})`); };

// The shape of /etc/palm/bootd.json on a webOS 4.5 TV (shortened: the real file has more sections and keys).
const stock = JSON.stringify({
	inputApps: {DTV: 'com.webos.app.livetv', HDMI_1: 'com.webos.app.hdmi1'},
	common: {
		firstApp: {firstAppInFirstUse: 'com.palm.app.firstuse', firstAppInNormal: '{LAST_INPUT_APP}'},
		firstAppByPowerOnReason: {netflix: 'netflix', amazon: 'amazon', remoteKey: '{LAST_APP}', localKey: '{LAST_APP}'},
		logger: {logType: ['file', 'pmlog'], logLevel: 'debug'}
	},
	standard: {description: 'variant'}
}, null, 4);

// ---- the start-up file ----
const built = JSON.parse(h.buildOverride(stock, 'youtube.leanback.v4'));
const table = built.common.firstAppByPowerOnReason;
eq([table.remoteKey, table.localKey, table.micomPower].join(), 'youtube.leanback.v4,youtube.leanback.v4,youtube.leanback.v4', 'the power button, the TV\'s button and a cold start open the chosen app');
eq([table.netflix, table.amazon].join(), 'netflix,amazon', 'the Netflix and Prime Video buttons keep LG\'s own apps');
eq(table.wakeOnWiFi === undefined && table.hdmiCec === undefined, true, 'network wake-ups and HDMI-CEC are not given an app (they go where they ask)');
eq(JSON.stringify({...built, common: {...built.common, firstAppByPowerOnReason: JSON.parse(stock).common.firstAppByPowerOnReason}}), JSON.stringify(JSON.parse(stock)), 'everything else is LG\'s file unchanged');
eq(h.overrideApp(h.buildOverride(stock, 'tld.my.customlauncher')), 'tld.my.customlauncher', 'the app can be read back out of the file');
eq(h.overrideApp(stock), '', 'LG\'s own file names no app ({LAST_APP} is not one)');
eq(h.overrideApp('not json'), '', 'a file that is not JSON names no app');
let rejected = 0;
for (const bad of ["x'; reboot; '", 'a b', '', '$(id)']) { try { h.buildOverride(stock, bad); } catch { rejected++; } }
eq(rejected, 4, 'only a plain app id is ever written (no shell injection)');
let unknown = 0;
for (const other of ['{}', '{"common":{}}', '[1]', 'garbage']) { try { h.buildOverride(other, 'youtube.leanback.v4'); } catch { unknown++; } }
eq(unknown, 4, 'a start-up file of another kind is never rewritten');

// ---- the status ----
const status = (fields, file = '') => h.parseStatus(Object.entries(fields).map(([k, v]) => `${k}=${v}`).join('\n') + '\n--- start-up file ---\n' + file);
const mine = h.buildOverride(stock, 'youtube.leanback.v4');
eq(JSON.stringify(status({support: 'yes', override: 'no', ours: 'no', loaded: ''})), JSON.stringify({supported: true, chosen: '', loaded: '', foreign: false}), 'nothing in place: the TV default, nothing loaded');
eq(JSON.stringify(status({support: 'yes', override: 'yes', ours: 'yes', loaded: ''}, mine)), JSON.stringify({supported: true, chosen: 'youtube.leanback.v4', loaded: '', foreign: false}), 'just chosen: chosen, not loaded yet');
eq(h.needsRestart(status({support: 'yes', override: 'yes', ours: 'yes', loaded: ''}, mine)), true, 'so a restart is needed');
eq(h.needsRestart(status({support: 'yes', override: 'yes', ours: 'yes', loaded: 'youtube.leanback.v4'}, mine)), false, 'after the restart it is not');
eq(h.needsRestart(status({support: 'yes', override: 'no', ours: 'no', loaded: 'youtube.leanback.v4'})), true, 'switched off while loaded: a restart is needed to go back');
eq(status({support: 'yes', override: 'no', ours: 'no', loaded: 'stock'}).loaded, '', '"stock" means nothing loaded');
eq(status({support: 'yes', override: 'yes', ours: 'no', loaded: ''}, mine).foreign, true, 'a start-up file Hearth did not write is someone else\'s');
eq(status({support: 'yes', override: 'yes', ours: 'no', loaded: ''}, mine).chosen, '', 'and its app is not taken for Hearth\'s');
eq(h.needsRestart(status({support: 'yes', override: 'yes', ours: 'no', loaded: ''}, mine)), false, 'nor does it ask for a restart');
eq(status({support: 'no', override: 'no', ours: 'no', loaded: ''}).supported, false, 'a TV without it says so');
eq(status({support: 'yes', override: 'no', ours: 'no', loaded: "x'; reboot"}).loaded, '', 'a loaded value that is not an app id is not used');
eq(h.parseStatus(''), null, 'no output: null');
eq(h.parseStatus('Permission denied'), null, 'other output: null');

// ---- messages ----
eq(/restarts once/.test(h.powerOnMessage('applied', 'YouTube')) && /YouTube/.test(h.powerOnMessage('applied', 'YouTube')), true, 'saved: names the app and says a restart is needed');
eq(/Live TV/.test(h.powerOnMessage('removed')), true, 'off: says what comes back');
eq(/Nothing was changed/.test(h.powerOnMessage('failed', '', 'x')), true, 'a failure says nothing was changed');
eq(h.powerOnName(''), 'Live TV or the last input', 'the TV default has a name');
eq(h.powerOnName('youtube.leanback.v4', 'YouTube'), 'YouTube', 'an app is named by its title');

// ---- install and remove on a fake TV ----
const root = mkdtempSync(tmpdir() + '/poweron-');
const paths = [[h.POWER_ON_DIR, root + '/dir'], [h.POWER_ON_LINK, root + '/init.d/45-launcher-poweron'], [h.OVERRIDE_FILE, root + '/prefs/bootd.json'], [h.BOOTD_FILE, root + '/etc/bootd.json'], [h.BOOTD_BIN, root + '/bootd'], [h.LOADED_FILE, root + '/loaded']];
const onTv = (cmd) => paths.reduce((c, [from, to]) => c.split(from).join(to), cmd);
const sh = (cmd) => execSync(onTv(cmd), {shell: '/bin/sh'}).toString();
mkdirSync(root + '/init.d'); mkdirSync(root + '/prefs'); mkdirSync(root + '/etc');
writeFileSync(root + '/etc/bootd.json', stock);
writeFileSync(root + '/bootd', `ELF ... ${root}/prefs/bootd.json ...`);     // the path as onTv() rewrites it
const guardSh = readFileSync(new URL('../src/poweron/guard.sh', import.meta.url).pathname, 'utf8');
const read = () => h.parseStatus(sh(h.STATUS_COMMAND));

eq(read().supported, true, 'the fake TV has it');
eq(sh(h.READ_STOCK_COMMAND), stock, 'LG\'s file is read as it is');
const steps = h.writeSteps(guardSh, mine, 'youtube.leanback.v4');
for (const step of steps) sh(step.command);
eq(sh(h.READ_NEW_COMMAND), mine, 'the new file is written under a temporary name and reads back the same');
eq(existsSync(root + '/prefs/bootd.json'), false, 'nothing is in the TV\'s place before it has been checked');
const finish = h.finishSteps('youtube.leanback.v4');
eq(finish[finish.length - 1].name, 'add the start-up link', 'the start-up link is added last, so a half-written check never runs');
for (const step of finish) sh(step.command);
eq(readFileSync(root + '/prefs/bootd.json', 'utf8'), mine, 'then moved into place');
eq(readFileSync(root + '/dir/guard.sh', 'utf8'), guardSh, 'with the start-up check written as it is');
eq(lstatSync(root + '/init.d/45-launcher-poweron').isSymbolicLink() && readlinkSync(root + '/init.d/45-launcher-poweron'), root + '/dir/guard.sh', 'and linked from the startup folder');
eq(JSON.stringify(read()), JSON.stringify({supported: true, chosen: 'youtube.leanback.v4', loaded: '', foreign: false}), 'the status reads it back: chosen, not loaded until a restart');
writeFileSync(root + '/loaded', 'youtube.leanback.v4\n');
eq(h.needsRestart(read()), false, 'once the start-up check has noted it loaded, no restart is needed');
eq(sh(h.REMOVE_COMMAND).trim(), 'removed', 'switching off removes it');
eq(existsSync(root + '/prefs/bootd.json') || existsSync(root + '/dir') || existsSync(root + '/init.d/45-launcher-poweron'), false, 'and leaves nothing behind');
eq(h.needsRestart(read()), true, 'until the restart the TV still has it loaded');

writeFileSync(root + '/prefs/bootd.json', '{"someone":"else"}');
eq(read().foreign, true, 'someone else\'s start-up file is recognised');
eq(sh(h.REMOVE_COMMAND).trim(), 'kept', 'and switching off never removes it');
eq(readFileSync(root + '/prefs/bootd.json', 'utf8'), '{"someone":"else"}', 'it is left exactly as it was');
writeFileSync(root + '/bootd', 'ELF without the copy');
eq(read().supported, false, 'a boot daemon that does not read the copy: not supported');
rmSync(root, {recursive: true, force: true});
process.exit(fail ? 1 : 0);
