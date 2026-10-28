// "When the TV turns on, open…": the app the TV opens when it is switched on. See poweroncmd.ts for how it works, and
// src/poweron/README.md for the limits and how to undo it over SSH. Needs a rooted TV: the files belong to root, so
// everything goes through the Homebrew Channel's root shell.

import guardSh from '../poweron/guard.sh?raw';
import {exec} from './apps';
import {log} from './log';
import {isWebOS} from './luna';
import type {InstallStep} from './homehookcmd';
import {
	READ_NEW_COMMAND, READ_STOCK_COMMAND, REMOVE_COMMAND, RESTART_COMMAND, STATUS_COMMAND, buildOverride, finishSteps,
	parseStatus, powerOnMessage, writeSteps, type PowerOnResult, type PowerOnStatus
} from './poweroncmd';

export type {PowerOnResult, PowerOnStatus};
export {powerOnMessage};

const lf = (text: string): string => text.replace(/\r\n?/g, '\n');     // plain line ends even from a Windows checkout
const why = (error: unknown): string => (error && (error as Error).message ? (error as Error).message : 'no answer');

/** What is on the TV, or null when it could not be read. */
export function readPowerOn (): Promise<PowerOnStatus | null> {
	if (!isWebOS()) return Promise.resolve(null);
	return exec(STATUS_COMMAND, 6000).then(parseStatus).catch(() => null);
}

function run (steps: InstallStep[]): Promise<void> {
	const next = (i: number): Promise<void> => (i >= steps.length ? Promise.resolve()
		: exec(steps[i].command, 6000).then(() => next(i + 1), (error: Error) => { throw new Error(`${steps[i].name}: ${why(error)}`); }));
	return next(0);
}

export interface PowerOnOutcome {
	result: PowerOnResult;
	detail: string;
}

/** Sends the power button to `appId` (from the next start). Every write is read back before it counts. */
export function setPowerOnApp (appId: string): Promise<PowerOnOutcome> {
	if (!isWebOS()) return Promise.resolve({result: 'failed', detail: 'not running on a TV'});
	return readPowerOn().then((status): PowerOnOutcome | Promise<PowerOnOutcome> => {
		if (!status) return {result: 'failed', detail: 'the TV did not answer'};
		if (!status.supported) return {result: 'unsupported', detail: ''};
		if (status.foreign) return {result: 'foreign', detail: ''};
		return exec(READ_STOCK_COMMAND, 6000).then((stock) => {
			const override = buildOverride(stock, appId);         // throws on a file this method does not know
			return run(writeSteps(lf(guardSh), override, appId))
				.then(() => exec(READ_NEW_COMMAND, 6000))
				.then((written) => {
					if (written.trim() !== override.trim()) throw new Error('the file did not read back the same');
					return run(finishSteps(appId));
				})
				.then(() => readPowerOn())
				.then((now): PowerOnOutcome => {
					if (!now || now.chosen !== appId) return {result: 'failed', detail: 'the TV did not keep it'};
					log(`Power-on app: ${appId} (from the next start)`);
					return {result: 'applied', detail: ''};
				});
		}).catch((error: Error): Promise<PowerOnOutcome> => {
			log(`Power-on app: not set: ${why(error)}`);
			// a failure part-way leaves nothing in place: the TV keeps doing what it did
			return clearPowerOnApp().then(() => ({result: 'failed', detail: why(error)}));
		});
	});
}

/** Back to the TV's own behaviour (from the next start). */
export function clearPowerOnApp (): Promise<PowerOnOutcome> {
	if (!isWebOS()) return Promise.resolve({result: 'failed', detail: 'not running on a TV'});
	return exec(REMOVE_COMMAND, 6000).then((out): PowerOnOutcome => {
		if (/removed/.test(out)) { log('Power-on app: back to the TV\'s own behaviour (from the next start)'); return {result: 'removed', detail: ''}; }
		return {result: 'foreign', detail: ''};
	}, (error: Error): PowerOnOutcome => ({result: 'failed', detail: why(error)}));
}

/** Restarts the TV, so the setting starts working. */
export function restartTv (): Promise<void> {
	log('Power-on app: restarting the TV');
	return exec(RESTART_COMMAND, 4000).then(() => undefined, () => undefined);   // the answer may never come
}
