/** Shapes of the home-row icons. Each is only a border-radius (see `.rows--shape-*` in global.css), so it costs nothing. */
export const TILE_SHAPES: {id: string; label: string}[] = [
	{id: 'rounded', label: 'Rounded square'},
	{id: 'square', label: 'Sharp square'},
	{id: 'squircle', label: 'Soft squircle'},
	{id: 'circle', label: 'Circle'},
	{id: 'leaf', label: 'Leaf'},
	{id: 'arch', label: 'Arch'},
	{id: 'drop', label: 'Teardrop'}
];
export const TILE_SHAPE_IDS: string[] = TILE_SHAPES.map((s) => s.id);

export function tileShapeText (id: string): string {
	const s = TILE_SHAPES.filter((x) => x.id === id)[0];
	return s ? s.label : TILE_SHAPES[0].label;
}
