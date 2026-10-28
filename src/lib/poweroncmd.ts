// "When the TV turns on, open…": the files it reads and writes, the start-up file it builds, and the shell commands.
// Pure (no imports of the bundled files), so it can be tested on its own. See poweron.ts for the part that runs them,
// src/poweron/guard.sh for the start-up check, and src/poweron/README.md for how to undo it over SSH.
//
// How it works: at power-on the TV's boot daemon (bootd) picks the first app. Its configuration, /etc/palm/bootd.json,
// has a table "firstAppByPowerOnReason" that maps why the TV was switched on to an app: LG uses it for the Netflix and
// Prime Video buttons (switching the TV on with the Netflix button opens Netflix). For the power button ("remoteKey"),
// the TV's own button ("localKey") and a cold start ("micomPower") there is no app, so the TV opens the last input:
// Live TV on most sets. bootd reads /var/luna/preferences/bootd.json instead of its own file when that exists (a
// writable copy LG left for debugging). This method writes that copy: LG's own file with those three reasons pointed
// at the chosen app. Every other reason (a phone casting, HDMI-CEC, Wake-on-LAN, timers) is left as LG has it, so the
// TV still goes where those ask. The app opens behind LG's start-up cover, so nothing else is drawn first. If the app
// cannot be opened (uninstalled), the TV falls back to its last input as usual.
//
// bootd reads the file only when it starts, which is a full restart of the TV (not waking it from standby), so a
// change starts working after the TV has restarted once. A small start-up check notes what bootd loaded (so Hearth can
// say when a restart is still needed), removes the copy again if Hearth is uninstalled, and removes it if a software
// update changes LG's file (so an old copy never hides the new one). Needs root: both files belong to root.

import {writeFileCommands, type InstallStep} from './homehookcmd';

export const BOOTD_FILE = '/etc/palm/bootd.json';
export const OVERRIDE_FILE = '/var/luna/preferences/bootd.json';
export const BOOTD_BIN = '/usr/sbin/bootd';
export const POWER_ON_DIR = '/media/developer/launcher-poweron';
export const POWER_ON_LINK = '/var/lib/webosbrew/init.d/45-launcher-poweron';
/** Written by the start-up check at each start: the app bootd loaded then ('stock' for none). Gone after a restart. */
export const LOADED_FILE = '/tmp/launcher-poweron.loaded';
/** The reasons that mean "someone switched the TV on": the remote's power button, the TV's own button, a cold start. */
export const POWER_ON_REASONS = ['remoteKey', 'localKey', 'micomPower'] as const;
/** What LG's file has for a reason it does not send to an app (resume Netflix if it was open, else the last input). */
export const LAST_APP = '{LAST_APP}';

const APP_ID_PATTERN = /^[A-Za-z0-9._-]+$/;

export function isAppId (value: unknown): value is string {
	return typeof value === 'string' && APP_ID_PATTERN.test(value);
}

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => !!v && typeof v === 'object' && !Array.isArray(v);

/** LG's start-up file with the power-on reasons sent to `appId`, as the text to write. Throws when the file is not the
 *  kind this method knows (no "common.firstAppByPowerOnReason" table), so nothing is written on such a TV. */
export function buildOverride (stockText: string, appId: string): string {
	if (!isAppId(appId)) throw new Error('Invalid app id');
	const stock = JSON.parse(stockText) as unknown;
	if (!isObject(stock) || !isObject(stock.common) || !isObject(stock.common.firstAppByPowerOnReason)) throw new Error('unknown start-up file');
	const common = stock.common as Json;
	const table: Json = {...(common.firstAppByPowerOnReason as Json)};
	POWER_ON_REASONS.forEach((reason) => { table[reason] = appId; });
	return JSON.stringify({...stock, common: {...common, firstAppByPowerOnReason: table}}, null, 4) + '\n';
}

/** The app a start-up file sends the power button to: an app id, or '' when it does what LG's file does. */
export function overrideApp (text: string): string {
	try {
		const data = JSON.parse(text) as unknown;
		const table = isObject(data) && isObject(data.common) && isObject(data.common.firstAppByPowerOnReason) ? data.common.firstAppByPowerOnReason : null;
		const app = table ? table.remoteKey : undefined;
		return isAppId(app) ? app : '';
	} catch {
		return '';
	}
}

/** What is on the TV. */
export interface PowerOnStatus {
	/** bootd on this TV reads the writable copy, and LG's file has the table */
	supported: boolean;
	/** the app chosen now ('' = the TV's default: no copy of Hearth's in place) */
	chosen: string;
	/** the app the running bootd loaded at the last start ('' = the TV's default). Differs from chosen until a restart */
	loaded: string;
	/** a copy is in place that Hearth did not write (left alone; this method stays off) */
	foreign: boolean;
}

const SEPARATOR = '--- start-up file ---';

/** One command for everything Settings shows. Lines of key=value, then the copy itself after SEPARATOR. */
export const STATUS_COMMAND = [
	`if grep -q '${OVERRIDE_FILE}' '${BOOTD_BIN}' 2>/dev/null && grep -q firstAppByPowerOnReason '${BOOTD_FILE}' 2>/dev/null; then echo support=yes; else echo support=no; fi`,
	`if [ -f '${OVERRIDE_FILE}' ]; then echo override=yes; else echo override=no; fi`,
	`if [ -f '${OVERRIDE_FILE}' ] && [ "$(md5sum '${OVERRIDE_FILE}' | cut -d ' ' -f 1)" = "$(cat '${POWER_ON_DIR}/override.md5' 2>/dev/null)" ]; then echo ours=yes; else echo ours=no; fi`,
	`echo "loaded=$(cat '${LOADED_FILE}' 2>/dev/null)"`,
	`echo '${SEPARATOR}'`,
	`cat '${OVERRIDE_FILE}' 2>/dev/null; true`
].join('; ');

/** The status out of STATUS_COMMAND's output, or null when the output is not that (no answer). */
export function parseStatus (output: string): PowerOnStatus | null {
	const at = output.indexOf(SEPARATOR);
	if (at === -1) return null;
	const fields: Record<string, string> = {};
	output.slice(0, at).split('\n').forEach((line) => {
		const eq = line.indexOf('=');
		if (eq > 0) fields[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
	});
	if (!fields.support) return null;
	const override = fields.override === 'yes';
	const ours = override && fields.ours === 'yes';
	const loaded = isAppId(fields.loaded) && fields.loaded !== 'stock' ? fields.loaded : '';
	return {
		supported: fields.support === 'yes',
		chosen: ours ? overrideApp(output.slice(at + SEPARATOR.length)) : '',
		loaded,
		foreign: override && !ours
	};
}

/** A restart is still needed before the TV does what was chosen. */
export function needsRestart (status: PowerOnStatus | null | undefined): boolean {
	return !!status && status.supported && !status.foreign && status.chosen !== status.loaded;
}

export const READ_STOCK_COMMAND = `cat '${BOOTD_FILE}'`;
const NEW_FILE = `${OVERRIDE_FILE}.hearth-new`;
export const READ_NEW_COMMAND = `cat '${NEW_FILE}'`;

/** Writes the start-up check, then the copy under a temporary name. After these, READ_NEW_COMMAND must give back
 *  `override` exactly before finishSteps() moves it into place. */
export function writeSteps (guardSh: string, override: string, appId: string): InstallStep[] {
	if (!isAppId(appId)) throw new Error('Invalid app id');
	const write = (name: string, path: string, text: string): InstallStep[] => {
		const commands = writeFileCommands(path, text);
		return commands.map((command, i) => ({name: commands.length > 1 ? `write ${name} (${i + 1}/${commands.length})` : `write ${name}`, command}));
	};
	return [
		{name: 'create the folder', command: `mkdir -p '${POWER_ON_DIR}'`},
		...write('guard.sh', `${POWER_ON_DIR}/guard.sh`, guardSh),
		{name: 'make the check runnable', command: `chmod +x '${POWER_ON_DIR}/guard.sh'`},
		...write('the start-up file', NEW_FILE, override)
	];
}

/** Moves the copy into place and notes what was written. The start-up link is added last, so a half-written check
 *  never runs. */
export function finishSteps (appId: string): InstallStep[] {
	if (!isAppId(appId)) throw new Error('Invalid app id');
	return [
		{name: 'put the start-up file in place', command: `mv -f '${NEW_FILE}' '${OVERRIDE_FILE}'`},
		{name: 'note what was written', command: `md5sum '${OVERRIDE_FILE}' | cut -d ' ' -f 1 > '${POWER_ON_DIR}/override.md5' && md5sum '${BOOTD_FILE}' | cut -d ' ' -f 1 > '${POWER_ON_DIR}/stock.md5' && echo '${appId}' > '${POWER_ON_DIR}/app'`},
		{name: 'add the start-up link', command: `ln -sf '${POWER_ON_DIR}/guard.sh' '${POWER_ON_LINK}'`}
	];
}

/** Back to the TV's own behaviour (from the next start): Hearth's copy and the check are removed. A copy Hearth did not
 *  write is left alone. */
export const REMOVE_COMMAND = [
	`rm -f '${NEW_FILE}'`,
	`if [ -f '${OVERRIDE_FILE}' ] && [ "$(md5sum '${OVERRIDE_FILE}' | cut -d ' ' -f 1)" = "$(cat '${POWER_ON_DIR}/override.md5' 2>/dev/null)" ]; then rm -f '${OVERRIDE_FILE}'; fi`,
	`rm -f '${POWER_ON_LINK}'`,
	`rm -rf '${POWER_ON_DIR}'`,
	`if [ -f '${OVERRIDE_FILE}' ]; then echo kept; else echo removed; fi`
].join('; ');

/** A full restart, so bootd reads the file again. */
export const RESTART_COMMAND = 'sync; reboot';

export type PowerOnResult = 'applied' | 'removed' | 'unsupported' | 'foreign' | 'failed';

/** A friendly name for what the TV opens. */
export function powerOnName (appId: string, title?: string): string {
	if (!appId) return 'Live TV or the last input';
	return title || appId;
}

export function powerOnMessage (result: PowerOnResult, name = '', detail = ''): string {
	switch (result) {
		case 'applied': return `Saved: the TV will open ${name || 'that app'} when you turn it on. It starts working after the TV restarts once`;
		case 'removed': return 'Turned off. After the TV restarts once, it opens Live TV or the last input again';
		case 'unsupported': return "This TV's software has no power-on setting Hearth can use, so nothing was changed";
		case 'foreign': return `Another start-up file is already in place (${OVERRIDE_FILE}), so Hearth left it alone`;
		default: return `Couldn't change the power-on app${detail ? ': ' + detail : ''}. Nothing was changed`;
	}
}
