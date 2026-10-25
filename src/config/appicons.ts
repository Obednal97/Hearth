// The app icons shipped in public/icons/apps/: the choices offered when editing an app's icon (they work without root).
// scripts/test-appicons.mjs checks that this list and the folder match.

export interface AppIcon {
	/** file name under icons/apps/ */
	file: string;
	label: string;
}

export const APP_ICONS: readonly AppIcon[] = [
	{file: 'youtube.leanback.v4.png', label: 'YouTube'},
	{file: 'amazon.png', label: 'Prime Video'},
	{file: 'com.apple.appletv.png', label: 'Apple TV'},
	{file: 'cdp-30.png', label: 'Plex'},
	{file: 'tv.twitch.tv.starshot.lg.png', label: 'Twitch'},
	{file: 'amazon.alexa.view.png', label: 'Alexa'},
	{file: 'bbc.iplayer.3.0.png', label: 'BBC iPlayer'},
	{file: 'bbc.sounds.1.0.png', label: 'BBC Sounds'},
	{file: 'com.fvp.itv.png', label: 'ITVX'},
	{file: 'com.fvp.ch4.png', label: 'Channel 4'},
	{file: 'demand5.png', label: 'Channel 5'},
	{file: 'com.fvp.uktv.png', label: 'UKTV Play'},
	{file: 'now.tv.png', label: 'NOW'},
	{file: 'com.lennylxx.iptv.png', label: 'IPTV Player'},
	{file: 'com.webos.app.browser.png', label: 'Browser'},
	{file: 'com.webos.app.homeconnect.png', label: 'Home Dashboard'},
	{file: 'com.webos.app.igallery.png', label: 'Art Gallery'},
	{file: 'com.webos.app.mediadiscovery.png', label: 'Media Player'},
	{file: 'com.webos.app.sportsteamsettings.png', label: 'Sports'},
	{file: 'org.webosbrew.hbchannel.png', label: 'Homebrew'},
	{file: 'org.webosbrew.inputhook.png', label: 'Input Hook'},
	{file: 'org.webosbrew.safeupdate.png', label: 'HB Updater'}
];

/** `SourceEdit.icon` value for a bundled app icon. */
export const APP_ICON_PREFIX = 'app:';
export const APP_ICON_IDS: string[] = APP_ICONS.map((i) => APP_ICON_PREFIX + i.file);

const find = (id: string): AppIcon | undefined => APP_ICONS.filter((i) => APP_ICON_PREFIX + i.file === id)[0];
export const isAppIcon = (id: string): boolean => !!find(id);
export const appIconLabel = (id: string): string => { const i = find(id); return i ? i.label : ''; };
export const appIconUrl = (id: string): string => { const i = find(id); return i ? 'icons/apps/' + i.file : ''; };
