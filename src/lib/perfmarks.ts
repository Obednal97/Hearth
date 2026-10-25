// Start-up time marks (ms since the page began loading), read by Tests row 28. A mark is kept once, the first time it is set.

const marks: Array<[string, number]> = [];

function sinceStart (): number {
	if (typeof performance !== 'undefined' && performance.now) return performance.now();
	return Date.now() - ((performance as unknown as {timing?: {navigationStart?: number}}).timing || {}).navigationStart!;
}

export function mark (name: string): void {
	if (marks.some((m) => m[0] === name)) return;
	marks.push([name, Math.round(sinceStart())]);
}

export function markList (): ReadonlyArray<readonly [string, number]> { return marks; }
