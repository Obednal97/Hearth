// Hearth's own short event log, kept in memory and shown in Settings → Debug. On a rooted TV `logfile.ts` also
// appends it to the one report file, so it survives a restart. It holds the last few dozen events: what was asked of the TV and what the TV answered.

const MAX_LINES = 40;
const MAX_CHARS = 110;
const lines: string[] = [];
const listeners: Array<(line: string) => void> = [];

/** Called with every new line (used to copy the log to the report file). */
export function onLog (fn: (line: string) => void): void { listeners.push(fn); }

function pad (n: number): string { return n < 10 ? '0' + n : String(n); }

export function log (text: string, now: Date = new Date()): void {
	const clean = text.replace(/[\r\n\t]+/g, ' ').trim();
	const stamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	const line = `${stamp} ${clean}`.slice(0, MAX_CHARS);
	lines.push(line);
	listeners.forEach((fn) => fn(line));
	if (lines.length > MAX_LINES) lines.shift();
}

/** Newest last. */
export function logLines (): string[] { return lines.slice(); }

export function clearLog (): void { lines.length = 0; }
