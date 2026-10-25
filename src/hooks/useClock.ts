import {useEffect, useState} from 'preact/hooks';
import {TIMING} from '../config/constants';

/** Current time. The clock shows no seconds, so the screen is re-rendered only when the minute changes (the check
 *  still runs every second, which keeps the displayed minute exact). Before, the whole home screen redrew every second. */
export function useClock (paused = false): Date {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		if (paused) return undefined;
		const tick = () => setNow((prev) => {
			const next = new Date();
			return Math.floor(next.getTime() / 60000) === Math.floor(prev.getTime() / 60000) && next.getDate() === prev.getDate() ? prev : next;
		});
		tick();
		const id = window.setInterval(tick, TIMING.clockTickMs);
		return () => window.clearInterval(id);
	}, [paused]);
	return now;
}
