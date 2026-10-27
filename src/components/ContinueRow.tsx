import {Component} from 'preact';
import {clamp} from '../hooks/useKeys';
import type {ContinueItem} from '../lib/plex';

interface Props {
	/** the row's heading (default "Continue Watching") */
	label?: string;
	items: ContinueItem[];
	focused: boolean;
	selected: number;
	/** the width the row has to fit in (px at 1080p) */
	viewportWidth: number;
	onSelect: (index: number) => void;
	onActivate: (index: number) => void;
}

/** card width and gap (px at 1080p); keep in sync with .continue__card in global.css */
export const CONTINUE_CARD = {width: 320, height: 180, gap: 28};

/** One card; skips its redraw unless its own focus or item changed (moving the highlight redraws two cards). */
class Card extends Component<{item: ContinueItem; focused: boolean; showImage: boolean; onHover: () => void; onActivate: () => void}> {
	shouldComponentUpdate (next: {item: ContinueItem; focused: boolean; showImage: boolean}): boolean {
		return next.focused !== this.props.focused || next.item !== this.props.item || next.showImage !== this.props.showImage;
	}

	render () {
		const {item, focused, showImage, onHover, onActivate} = this.props;
		return (
			<div class={`continue__card${focused ? ' continue__card--focused' : ''}`} onMouseEnter={onHover} onClick={onActivate}>
				<div class="continue__frame">
					{item.imageUrl ? (showImage ? <img class="continue__image" src={item.imageUrl} alt="" /> : null) : <div class="continue__blank">{item.title.charAt(0)}</div>}
					{item.progress > 0 && <div class="continue__bar"><div class="continue__fill" style={{transform: `scaleX(${item.progress.toFixed(3)})`}} /></div>}
					<div class="continue__ring" />
				</div>
				<div class="continue__title">{item.title}</div>
				{item.detail && <div class="continue__detail">{item.detail}</div>}
			</div>
		);
	}
}

/** "Continue Watching" above the home row: wide cards, a carousel that keeps the selected card in view. */
export function ContinueRow ({label = 'Continue Watching', items, focused, selected, viewportWidth, onSelect, onActivate}: Props) {
	const step = CONTINUE_CARD.width + CONTINUE_CARD.gap;
	const total = items.length * step - CONTINUE_CARD.gap;
	const fits = total <= viewportWidth;
	const offset = fits ? 0 : clamp(selected * step + CONTINUE_CARD.width / 2 - viewportWidth / 2, 0, total - viewportWidth);
	// pictures only for the cards on screen and one either side (long rows would otherwise load every picture at once)
	const firstShown = Math.floor(offset / step) - 1;
	const lastShown = Math.ceil((offset + viewportWidth) / step) + 1;
	return (
		<section class={`row continue${focused ? ' row--focused' : ''}`}>
			<h2 class="row__label">{label}</h2>
			<div class="row__viewport">
				<div class={`row__track${fits ? ' row__track--centered' : ''}`} style={{transform: `translate3d(${-offset}px, 0, 0)`}}>
					{items.map((item, i) => (
						<Card key={item.key} item={item} focused={focused && i === selected} showImage={i >= firstShown && i <= lastShown} onHover={() => onSelect(i)} onActivate={() => onActivate(i)} />
					))}
				</div>
			</div>
		</section>
	);
}
