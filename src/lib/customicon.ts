// A picture file as a source's icon: read through the Homebrew Channel (so it needs root, like wallpapers), shrunk to a
// small square and kept in the settings as a data URI. Nothing is read again afterwards.

import {isSafePath, mimeType, readFileChunks} from './wallpaper';

export const ICON_PIXELS = 160;
const MAX_CHARS = 150000;

export function iconFromFile (path: string): Promise<string> {
	if (!isSafePath(path)) return Promise.reject(new Error("That file name can't be used"));
	return readFileChunks(path).then((parts) => new Promise<string>((resolve, reject) => {
		const url = URL.createObjectURL(new Blob(parts as unknown as BlobPart[], {type: mimeType(path)}));
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			try {
				const side = Math.min(img.naturalWidth, img.naturalHeight);
				if (!side) throw new Error('empty');
				const canvas = document.createElement('canvas');
				canvas.width = canvas.height = ICON_PIXELS;
				const ctx = canvas.getContext('2d');
				if (!ctx) throw new Error('no canvas');
				ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, ICON_PIXELS, ICON_PIXELS);
				const data = canvas.toDataURL('image/png');
				if (data.length > MAX_CHARS) throw new Error('too detailed');
				resolve(data);
			} catch (e) { reject(e); }
		};
		img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('not a picture the TV can show')); };
		img.src = url;
	}));
}
