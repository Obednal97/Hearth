import {placeLabels, type RemoteButton, type RemoteLayout} from '../lib/remotes';

interface Props {
	layout: RemoteLayout;
	/** the focused button (null: focus is elsewhere on the screen) */
	focusedId: string | null;
	/** the button just pressed on the real remote: it flashes once (seq restarts the flash) */
	pulse: {id: string; seq: number} | null;
	/** what each reassigned button does now, by button id (shown beside the drawing) */
	jobs: Record<string, string>;
	/** buttons LG Input Hook also acts on */
	hooked: string[];
	onSelect: (id: string) => void;
	onActivate: (id: string) => void;
}

const LABEL_GAP = 34;

/** A size for a button's text that fits inside it. */
function textSize (b: RemoteButton): number {
	const fit = (b.w * (b.shape === 'pill' ? 1.3 : 1.45)) / Math.max(3, b.text.length);
	return Math.max(6.5, Math.min(b.shape === 'pill' ? 13 : 11, Math.round(fit * 2) / 2));
}

function shape (b: RemoteButton, extra = 0) {
	const w = b.w + extra * 2;
	const h = b.h + extra * 2;
	if (b.shape === 'circle' || b.shape === 'ring') return <ellipse cx={b.x} cy={b.y} rx={w / 2} ry={h / 2} />;
	const r = b.shape === 'key' ? 5 : Math.min(w, h) / 2;
	return <rect x={b.x - w / 2} y={b.y - h / 2} width={w} height={h} rx={r} ry={r} />;
}

/** A simple line drawing of a remote, made for Hearth. The buttons that can be given a new job stand out, the others
 *  are dimmed; the focused one has a ring, and one pressed on the real remote flashes. Static SVG: only classes change
 *  (focus, the flash's opacity animation), nothing is redrawn per frame. */
export function RemoteArt ({layout, focusedId, pulse, jobs, hooked, onSelect, onActivate}: Props) {
	const {body} = layout;
	const labelX = body.x + body.w + 34;
	const labelled = layout.buttons.filter((b) => b.key && (jobs[b.id] || hooked.indexOf(b.id) !== -1));
	const ys = placeLabels(labelled.map((b) => b.y), LABEL_GAP, 30, layout.height - 20);
	return (
		<svg class="remote-art" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
			<rect class="remote-art__body" x={body.x} y={body.y} width={body.w} height={body.h} rx={body.r} ry={body.r} />
			{/* the leaders first, so the buttons hide where a line passes behind them */}
			{labelled.map((b, i) => <path key={'p' + b.id} class="remote-art__leader" d={`M${b.x + b.w / 2 + 4} ${b.y}L${labelX - 22} ${ys[i]}L${labelX - 8} ${ys[i]}`} />)}
			{layout.buttons.map((b) => {
				const can = !!b.key;
				const cls = ['remote-art__button', can ? 'remote-art__button--can' : 'remote-art__button--fixed',
					jobs[b.id] && 'remote-art__button--set', focusedId === b.id && 'remote-art__button--focused'].filter(Boolean).join(' ');
				return (
					<g
						key={b.id}
						class={cls}
						onMouseEnter={can ? () => onSelect(b.id) : undefined}
						onClick={can ? () => onActivate(b.id) : undefined}
					>
						<g class="remote-art__shape" style={b.color ? {fill: b.color} : undefined}>{shape(b)}</g>
						{b.shape === 'ring' && <ellipse class="remote-art__inner" cx={b.x} cy={b.y} rx={b.w / 4.2} ry={b.h / 4.2} />}
						{b.shape === 'rocker' && <path class="remote-art__mark" d={`M${b.x - 6} ${b.y - b.h / 2 + 16}h12M${b.x} ${b.y - b.h / 2 + 10}v12M${b.x - 6} ${b.y + b.h / 2 - 16}h12`} />}
						{b.text && <text class="remote-art__text" x={b.x} y={b.shape === 'rocker' ? b.y + 5 : b.y + 4} style={{fontSize: `${textSize(b)}px`}}>{b.text}</text>}
						{focusedId === b.id && <g class="remote-art__ring">{shape(b, 7)}</g>}
						{pulse && pulse.id === b.id && <g key={pulse.seq} class="remote-art__pulse">{shape(b, 10)}</g>}
					</g>
				);
			})}
			{labelled.map((b, i) => (
				<g key={'l' + b.id} class={'remote-art__label' + (focusedId === b.id ? ' remote-art__label--focused' : '')}>
					<text class="remote-art__job" x={labelX} y={ys[i] + 6}>{jobs[b.id] || ''}{hooked.indexOf(b.id) !== -1 ? (jobs[b.id] ? ' · ' : '') + 'Input Hook' : ''}</text>
				</g>
			))}
		</svg>
	);
}
