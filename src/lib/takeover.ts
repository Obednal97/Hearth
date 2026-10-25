// "Replace LG Home with a script and SAM": Hearth is mounted in LG Home's own place, so the TV never opens LG Home.
// The scripts are written to the TV by the launcher itself. See takeovercmd.ts for the commands and src/takeover for
// the scripts, and src/takeover/README.md for how to undo it over SSH.

import shimHtml from '../takeover/shim.html?raw';
import takeoverSh from '../takeover/takeover.sh?raw';
import {exec} from './apps';
import {classifyFailure, failureReason} from './failure';
import {isWebOS} from './luna';
import {
	APPLY_COMMAND, installSteps, lastLine, parseApplyOutput, parseExit, parseRemoved, parseStock, parseTakeoverResult, parseTakeoverStatus, REMOVE_COMMAND,
	SLOW_STEP, STATUS_COMMAND, STOCK_COMMAND, TAKEOVER_VERSION, takeoverMessage, withStatus,
	type StockResult, type TakeoverResult, type TakeoverStatus
} from './takeovercmd';

export type {TakeoverResult, TakeoverStatus};
export {takeoverMessage};

const lf = (text: string): string => text.replace(/\r\n?/g, '\n');     // plain line ends even from a Windows checkout
const FILES = {takeoverSh: lf(takeoverSh), shimHtml: lf(shimHtml)};
/** Making the TV read LG Home's manifest again can take a while (a restart of sam waits for it to settle, twice if undoing). */
const SLOW_MS = 90000;

export function getTakeoverStatus (): Promise<TakeoverStatus | null> {
	if (!isWebOS()) return Promise.resolve(null);
	return exec(STATUS_COMMAND, 12000).then(parseTakeoverStatus).catch(() => null);
}

export interface TakeoverOutcome {
	result: TakeoverResult;
	/** for a failure: which step, and what the TV said */
	detail: string;
}

/** Writes the files and puts Hearth in LG Home's place, one small step at a time. If it can't be done, everything it
 *  added is removed again (the script itself puts LG Home back before it reports a refusal), and the outcome says why. */
export function installTakeover (): Promise<TakeoverOutcome> {
	if (!isWebOS()) return Promise.resolve({result: 'failed', detail: 'not running on a TV'});
	const steps = installSteps(FILES);
	const run = (i: number): Promise<TakeoverOutcome> => {
		const step = steps[i];
		return exec(withStatus(step.command), step.name === SLOW_STEP ? SLOW_MS : 15000).then(
			(output): TakeoverOutcome | Promise<TakeoverOutcome> => {
				if (i === steps.length - 1) return {result: parseTakeoverResult(output), detail: lastLine(output)};
				const code = parseExit(output);
				if (code !== 0) return {result: 'failed', detail: `${step.name}: ${lastLine(output) || 'exit ' + code}`};
				return run(i + 1);
			},
			(error: Error): TakeoverOutcome => ({result: 'failed', detail: `${step.name}: ${failureReason(classifyFailure(error), error && error.message ? error.message : '')}`})
		);
	};
	return run(0).then((outcome) => outcome.result === 'applied' || outcome.result === 'busy' ? outcome : removeTakeover().then(() => outcome));
}

export interface TakeoverReapplied extends TakeoverOutcome {
	/** it can't work on this TV (or was removed): turn the setting off */
	fatal: boolean;
	/** the Homebrew service did not answer, or the TV is busy with it: try again later, change nothing */
	unreachable?: boolean;
}

/** Makes sure Hearth is in LG Home's place (after a reboot, or when the launcher opens). If the copy on the TV is from
 *  an older version of the launcher, it is rewritten first, so updating the launcher updates it. */
export function reapplyTakeover (): Promise<TakeoverReapplied> {
	if (!isWebOS()) return Promise.resolve({result: 'failed', detail: 'not running on a TV', fatal: false});
	const done = (outcome: TakeoverOutcome): TakeoverReapplied => ({
		...outcome,
		unreachable: outcome.result === 'busy',
		fatal: outcome.result !== 'applied' && outcome.result !== 'busy'
	});
	// One call: it starts the watcher on the TV at once (so Home opens Hearth from now on), and reports the installed version.
	return exec(APPLY_COMMAND, SLOW_MS).then(
		(output): TakeoverReapplied | Promise<TakeoverReapplied> => {
			const {version, result} = parseApplyOutput(output);
			if (result === 'off') return done({result, detail: ''});
			if (version !== TAKEOVER_VERSION) return installTakeover().then(done);
			return done({result, detail: lastLine(output)});
		},
		(): TakeoverReapplied => ({result: 'failed', detail: 'the Homebrew service did not answer in time', fatal: false, unreachable: true})
	);
}

/** LG's own Home is wanted: the TV is given it back now. Hearth takes the place again once LG Home has been left.
 *  Where only a restart of sam can put LG Home back, nothing is done (`unsupported`): switch the takeover off instead. */
export function stockTakeover (): Promise<StockResult> {
	if (!isWebOS()) return Promise.resolve('failed');
	return exec(STOCK_COMMAND, SLOW_MS).then(parseStock).catch((): StockResult => 'failed');
}

/** Switches it off: LG Home gets its place back, and everything it added is deleted. Resolves true when LG Home's
 *  folder is free again. */
export function removeTakeover (): Promise<boolean> {
	if (!isWebOS()) return Promise.resolve(true);
	return exec(REMOVE_COMMAND, SLOW_MS).then(parseRemoved).catch(() => false);
}
