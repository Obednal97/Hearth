const __glob = () => ({});

// src/config/version.ts
var HEARTH_VERSION = "2.2.0";

// src/config/catalog.ts
var BASE_CATALOG = [
  // Global streaming
  { id: "youtube.leanback.v4", title: "YouTube", icon: "youtube.leanback.v4.png" },
  { id: "netflix", title: "Netflix", color: "#b1060f" },
  { id: "amazon", title: "Prime Video", icon: "amazon.png" },
  { id: "com.disney.disneyplus-prod", title: "Disney+", color: "#0f2b6b" },
  { id: "com.apple.appletv", title: "Apple TV", icon: "com.apple.appletv.png" },
  { id: "com.apple.tv", title: "Apple TV", icon: "com.apple.appletv.png" },
  { id: "com.wbd.stream", title: "Max", color: "#002be7" },
  { id: "hbo-go-2", title: "HBO Max", color: "#5822b4" },
  { id: "crunchyroll", title: "Crunchyroll", color: "#f47521" },
  { id: "cdp-30", title: "Plex", icon: "cdp-30.png" },
  { id: "plex", title: "Plex", icon: "cdp-30.png" },
  { id: "spotify-beehive", title: "Spotify", color: "#1db954" },
  { id: "tv.twitch.tv.starshot.lg", title: "Twitch", icon: "tv.twitch.tv.starshot.lg.png" },
  // North America
  { id: "hulu", title: "Hulu", color: "#1ce783" },
  { id: "youtube.leanback.ytv.v1", title: "YouTube TV", color: "#cc0000" },
  { id: "com.plutotv.app", title: "Pluto TV", color: "#2b2b2b" },
  { id: "com.tubitv.ott.tubi", title: "Tubi", color: "#7408ff" },
  { id: "com.espn.espnplus-prod", title: "ESPN", color: "#c8102e" },
  { id: "vudu", title: "Fandango at Home", color: "#3399ff" },
  // UK
  { id: "bbc.iplayer.3.0", title: "BBC iPlayer", icon: "bbc.iplayer.3.0.png" },
  { id: "bbc.sounds.1.0", title: "BBC Sounds", icon: "bbc.sounds.1.0.png" },
  { id: "com.fvp.itv", title: "ITVX", icon: "com.fvp.itv.png" },
  { id: "com.fvp.ch4", title: "Channel 4", icon: "com.fvp.ch4.png" },
  { id: "demand5", title: "Channel 5", icon: "demand5.png" },
  { id: "com.fvp.uktv", title: "UKTV Play", icon: "com.fvp.uktv.png" },
  { id: "now.tv", title: "NOW", icon: "now.tv.png" },
  // LG built-ins
  { id: "com.webos.app.browser", title: "Browser", icon: "com.webos.app.browser.png" },
  { id: "com.webos.app.mediadiscovery", title: "Media Player", icon: "com.webos.app.mediadiscovery.png" },
  { id: "com.webos.app.igallery", title: "Art Gallery", icon: "com.webos.app.igallery.png" },
  { id: "com.webos.app.homeconnect", title: "Home Dashboard", icon: "com.webos.app.homeconnect.png" },
  { id: "amazon.alexa.view", title: "Alexa", icon: "amazon.alexa.view.png" },
  { id: "com.palm.app.settings", title: "LG Settings", color: "#2f3339" },
  { id: "com.webos.app.discovery", title: "LG Content Store", color: "#a50034" },
  // webOS Homebrew
  { id: "org.webosbrew.hbchannel", title: "Homebrew", icon: "org.webosbrew.hbchannel.png" },
  { id: "org.webosbrew.inputhook", title: "Input Hook", icon: "org.webosbrew.inputhook.png" },
  { id: "org.webosbrew.safeupdate", title: "HB Updater", icon: "org.webosbrew.safeupdate.png" },
  { id: "com.lennylxx.iptv", title: "IPTV Player", icon: "com.lennylxx.iptv.png" },
  { id: "org.jellyfin.webos", title: "Jellyfin", color: "#00a4dc" }
];
var BASE_DEFAULT_APP_IDS = [
  "youtube.leanback.v4",
  "netflix",
  "amazon",
  "com.disney.disneyplus-prod",
  "com.apple.appletv",
  "com.wbd.stream",
  "cdp-30",
  "spotify-beehive"
];
var localModules = __glob("./catalog.local.ts", { eager: true });
var local = localModules["./catalog.local.ts"] || {};
function mergeCatalog(base, extra) {
  const extraIds = extra.map((a) => a.id);
  return base.filter((a) => extraIds.indexOf(a.id) === -1).concat(extra);
}
var APP_CATALOG = mergeCatalog(BASE_CATALOG, local.EXTRA_APPS || []);
var DEFAULT_APP_IDS = local.DEFAULT_APP_IDS || BASE_DEFAULT_APP_IDS;

// src/config/constants.ts
var APP_ID = "tld.my.customlauncher";
var LUNA = {
  launch: "luna://com.webos.applicationManager/launch",
  appLoadStatus: "luna://com.webos.applicationManager/getAppLoadStatus",
  inputStatus: "luna://com.webos.service.eim/getAllInputStatus",
  preferences: "luna://com.webos.service.systemservice/getPreferences",
  /** Homebrew Channel's root shell; only used when the user opts in (see lib/apps.ts) */
  homebrewExec: "luna://org.webosbrew.hbchannel.service/exec"
};
var TIMING = {
  lunaTimeoutMs: 4e3,
  toastMs: 2200,
  clockTickMs: 1e3,
  longPressMs: 600,
  // OK held this long opens the tile's menu
  /** Everything that is not needed to show the home screen (re-reading the app list, the helper check,
   *  closing LG Home) waits this long after the launcher appears, so the screen comes up first. */
  backgroundWorkMs: 5e3
};
var STORAGE_KEY = "customlauncher-config-v1";
var WALLPAPER = {
  fadeMs: 1400,
  // cross-fade between pictures (keep in sync with global.css)
  maxPixels: 25e6,
  // pictures larger than this are skipped (too heavy for the TV)
  probeTimeoutMs: 15e3,
  maxBytes: 8 * 1024 * 1024,
  // pictures bigger than this file size are skipped
  chunkBytes: 98304,
  // read per shell call: ~128 KB of base64, safely under the service's output limit; a multiple of 3 so every chunk's base64 stands alone
  parallelChunks: 3,
  intervals: [0, 10, 20, 30, 60, 300, 900, 1800, 3600]
  // seconds, the choices in Settings; 0 = Each visit (R9: new picture on restart and after 1+ min away)
};

// src/config/features.ts
var NOROOT_MOCK = typeof __NOROOT__ === "undefined" ? false : __NOROOT__;

// src/lib/luna.ts
function lunaCall(uri, params = {}, timeoutMs = TIMING.lunaTimeoutMs) {
  return new Promise((resolve, reject) => {
    const Bridge = window.PalmServiceBridge;
    if (!Bridge) {
      reject(new Error("Not running on webOS"));
      return;
    }
    const bridge = new Bridge();
    let settled = false;
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      try {
        bridge.cancel && bridge.cancel();
      } catch {
      }
      fn();
    };
    const timer = window.setTimeout(() => finish(() => reject(new Error(`Timed out: ${uri}`))), timeoutMs);
    bridge.onservicecallback = (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch (e) {
        finish(() => reject(e));
        return;
      }
      if (data.returnValue === false) {
        finish(() => reject(new Error(data.errorText || `${uri} failed`)));
      } else {
        finish(() => resolve(data));
      }
    };
    try {
      bridge.call(uri, JSON.stringify(params));
    } catch (e) {
      finish(() => reject(e));
    }
  });
}

// src/i18n/en.ts
var en = {
  "picker.networkFolder": "Network folder",
  "picker.networkFolderSet": "{where}. OK connects and opens it. If it cannot be reached, Hearth uses the default.",
  "picker.networkFolderChange": "Change or forget the network folder",
  "picker.networkFolderChangeDetail": "Address, shared folder, user name and password.",
  "picker.networkFolderNone": "Network folder (not set up)",
  "picker.networkFolderNoneDetail": "A shared folder on a NAS or router. OK sets it up.",
  "picker.networkFolderConnecting": "Connecting to the network folder\u2026 Back gives up.",
  "picker.networkFolderFailed": "Could not connect: {why}",
  "netfolder.whyLogin": "the NAS refused the user name or password",
  "netfolder.whyGuest": "the NAS does not let guests in. Turn on its guest account (or guest access for SMB), or type a user name and password",
  "netfolder.whyShare": "there is no shared folder with that name",
  "netfolder.whyDown": "the NAS does not answer",
  "netfolder.whyHost": "that address is not found on the network",
  "netfolder.whyNone": "no network folder is set up",
  "netfolder.whyRefused": "the address, folder or user name has characters that cannot be used",
  "netfolder.whyOther": "the connection failed",
  "netfolder.title": "Network folder",
  "netfolder.hint": "OK on a row to type. Enter keeps the text, Back leaves the field.",
  "netfolder.about": "A shared folder on a NAS, a router with a disk or a computer (SMB). Hearth only reads from it, and connects it when you open it here or when a picture folder on it is used.",
  "netfolder.privacy": "No user name: Hearth connects as a guest. A user name and password are stored on the TV, readable by root only.",
  "netfolder.host": "Address",
  "netfolder.share": "Shared folder",
  "netfolder.user": "User name",
  "netfolder.pass": "Password",
  "netfolder.empty": "empty. OK to type",
  "netfolder.guest": "none: guest. OK to type",
  "netfolder.userSaved": "saved, not shown. OK to type it again",
  "netfolder.connect": "Connect",
  "netfolder.connecting": "Connecting\u2026",
  "netfolder.connectDetail": "Saves these and connects the folder.",
  "netfolder.forget": "Disconnect and forget",
  "netfolder.forgetDetail": "What is on the NAS stays.",
  "netfolder.back": "Back",
  "netfolder.needHost": "Type the address and the shared folder first.",
  "netfolder.retype": "Type the user name and password again, or forget the folder first to connect as a guest.",
  "netfolder.connected": "Network folder connected. Open it from the list.",
  "netfolder.forgotten": "Network folder forgotten.",
  "netfolder.exampleHost": "192.168.1.71",
  "netfolder.exampleShare": "Video",
  "pref.weatherOn.label": "Show the weather",
  "pref.weatherOn.desc": "The temperature and conditions under the date.",
  "pref.weatherCity.label": "Weather: city",
  "pref.weatherCity.desc": "The city for the weather. Needs internet.",
  "pref.weatherUnit.label": "Weather: temperature unit",
  "pref.weatherUnit.desc": "Celsius or Fahrenheit.",
  "pref.weatherCityName.label": "Weather: show the city name",
  "pref.weatherCityName.desc": "The city's name before the temperature.",
  "pref.weatherRange.label": "Weather: show today's high and low",
  "pref.weatherRange.desc": "Today's high and low, for example H 31\xB0  L 25\xB0.",
  "pref.theme.label": "Current theme",
  "pref.theme.desc": "Colours of the tiles, text and background; \u2190 \u2192 also browse your saved themes. OK loads a theme file (rooted TVs).",
  "pref.themeExport.label": "Export theme base",
  "pref.themeExport.desc": "Writes your apps, names and icons as a theme zip into the themes folder.",
  "pref.themeSave.label": "Save this theme",
  "pref.themeSave.desc": "Keeps this theme in Hearth, so you can pick it again under Current theme.",
  "pref.themeRemove.label": "Delete this theme",
  "pref.themeRemove.desc": "Deletes this theme from Hearth; what it set goes back to the defaults.",
  "pref.quietSec.label": "Quiet mode",
  "pref.quietSec.desc": "Hides the apps after a pause; any key brings them back.",
  "pref.quietDimSec.label": "Quiet mode: dim the screen after",
  "pref.quietDimSec.desc": "Dims the whole screen this long after the apps hide.",
  "pref.quietDimLevel.label": "Quiet mode: dim strength",
  "pref.quietDimLevel.desc": "How dark the quiet-mode dim is.",
  "pref.quietPowerOff.label": "Quiet mode: switch the TV off after",
  "pref.quietPowerOff.desc": "Switches the TV off this long after the apps hide.",
  "pref.iconScale.label": "Icon size",
  "pref.iconScale.desc": "How big the app icons are.",
  "pref.iconGap.label": "Icon spacing",
  "pref.iconGap.desc": "The space between the icons on the home row.",
  "pref.tileShape.label": "Icon shape",
  "pref.tileShape.desc": "The shape of the icons.",
  "pref.iconStyle.label": "Icon style (experimental)",
  "pref.iconStyle.desc": "Original artwork, no borders, one-colour shapes on dark or light tiles, or the artwork on a themed tile.",
  "pref.iconLight.label": "Icon tile",
  "pref.iconLight.desc": "Dark tile with a light shape, or a light tile with a dark shape.",
  "pref.iconColor.label": "Icon colour",
  "pref.iconColor.desc": "The colour of the icon shapes: the theme's own, or a plain colour.",
  "pref.rows.label": "Home row: rows of apps",
  "pref.rows.desc": "Show the apps in one row or two.",
  "pref.showLabels.label": "Show app names",
  "pref.showLabels.desc": "The name under each icon.",
  "pref.labelColor.label": "App names: colour",
  "pref.labelColor.desc": "The colour of the app names.",
  "pref.labelFont.label": "App names: font",
  "pref.labelFont.desc": "The typeface of the app names.",
  "pref.labelSize.label": "App names: size",
  "pref.labelSize.desc": "The size of the app names.",
  "pref.labelWeight.label": "App names: thickness",
  "pref.labelWeight.desc": "The thickness of the app names.",
  "pref.homeFocus.label": "When Home is pressed",
  "pref.homeFocus.desc": "Where the highlight starts: the first app, or the one you opened last.",
  "pref.scrollSpeed.label": "Home row: scroll speed",
  "pref.scrollSpeed.desc": "How fast the row moves while Left or Right is held, or the pointer is at its edge.",
  "pref.inputStatus.label": "Show input status",
  "pref.inputStatus.desc": "Unplugged inputs are greyed out; a connected device's name shows under it (rooted TVs).",
  "pref.showLgHome.label": "Show the LG Home tile",
  "pref.showLgHome.desc": "A tile that opens LG's own Home.",
  "pref.showSystem.label": "Show the System Settings tile",
  "pref.showSystem.desc": "A tile that opens the TV's own settings.",
  "pref.hideSettings.label": "Hide the Hearth Settings tile",
  "pref.hideSettings.desc": "Hold OK on an app, then choose Hearth Settings.",
  "pref.sideMargin.label": "Home row: side margin",
  "pref.sideMargin.desc": "Space left and right of the app row.",
  "pref.bottomMargin.label": "Home row: bottom margin",
  "pref.bottomMargin.desc": "Space below the app row.",
  "pref.favSideMargin.label": "Favourites: side margin",
  "pref.favSideMargin.desc": "Space left and right of the favourites row.",
  "pref.favBottomMargin.label": "Favourites: bottom margin",
  "pref.favBottomMargin.desc": "Space below the favourites row while it is alone; raise it for a high row.",
  "pref.recentsSize.label": "Recent apps panel size",
  "pref.recentsSize.desc": "The size of the Recent apps panel (Back on Home).",
  "pref.oledShift.label": "Home: OLED shift",
  "pref.oledShift.desc": "Moves the clock and apps a few pixels each minute against burn-in.",
  "pref.restoreLook.label": "Restore my settings from before the update",
  "pref.restoreLook.desc": "Brings back your earlier look, widget, wallpaper and home row. Used once.",
  "pref.resetLook.label": "Reset Hearth visual settings to default",
  "pref.resetLook.desc": "Theme, wallpaper, look, quiet mode, clock and weather back to default.",
  "pref.clockFormat.label": "Widget: time format",
  "pref.clockFormat.desc": "12-hour, 24-hour, or the same as the TV.",
  "pref.clockSize.label": "Widget size",
  "pref.clockSize.desc": "How big the time is.",
  "pref.widgetOn.label": "Show widget",
  "pref.widgetOn.desc": "The time, date and weather on the home screen.",
  "pref.clockFont.label": "Widget font",
  "pref.clockFont.desc": "The typeface of the time and date.",
  "pref.clockWeight.label": "Widget thickness",
  "pref.clockWeight.desc": "The thickness of the time and date.",
  "pref.clockTop.label": "Widget position (vertical)",
  "pref.clockTop.desc": "Distance from the top of the screen.",
  "pref.clockLeft.label": "Widget position (horizontal)",
  "pref.clockLeft.desc": "Left to right position (50% is the centre).",
  "pref.showDate.label": "Widget: show the date",
  "pref.showDate.desc": "The day and date under the time.",
  "pref.showPeriod.label": "Widget: show AM / PM",
  "pref.showPeriod.desc": "AM or PM beside the time (12-hour only).",
  "pref.wallpaper.label": "Wallpaper",
  "pref.wallpaper.desc": "OK: choose your own picture, a slideshow or a moving background (video). \u2190 \u2192: the built-in backgrounds.",
  // local build
  "pref.interval.label": "Wallpaper: change picture every",
  "pref.interval.desc": "How long each picture stays up. Each visit: a new one after a restart or 1+ min away.",
  "pref.shuffle.label": "Wallpaper: shuffle",
  "pref.shuffle.desc": "Random order; off plays A to Z.",
  "pref.clockColor.label": "Widget colour (clock, date, weather)",
  "pref.clockColor.desc": "The colour of the clock, date and weather.",
  "pref.fadeStrength.label": "Wallpaper: bottom fade",
  "pref.fadeStrength.desc": "Darkens the bottom of the picture so the icons stay readable.",
  "pref.clockAlign.label": "Widget alignment",
  "pref.clockAlign.desc": "Clock, date and weather line up left, centre or right of their position.",
  "pref.clockOpacity.label": "Widget opacity",
  "pref.clockOpacity.desc": "How solid the clock, date and weather are.",
  "pref.wallpaperOpacity.label": "Wallpaper: opacity",
  "pref.wallpaperOpacity.desc": "How solid the picture is; lower softens it.",
  "pref.clockShadow.label": "Widget shadow",
  "pref.clockShadow.desc": "A soft shadow so the widget reads on bright pictures.",
  "pref.clockScrim.label": "Widget backdrop",
  "pref.clockScrim.desc": "A soft dark/light glow behind the widget, so it reads on any picture.",
  "pref.iconOpacity.label": "Icon opacity",
  "pref.iconOpacity.desc": "How solid the icons are; lower lets the wallpaper show through.",
  "pref.homeKey.label": "Map home button",
  "pref.homeKey.desc": "Makes the Home button open Hearth, with no LG Home flash.",
  "pref.preload.label": "LG preloaded apps (experimental)",
  "pref.preload.desc": "Choose which apps LG keeps loaded in the background.",
  "pref.keepReady.label": "Keep Hearth ready (experimental)",
  "pref.keepReady.desc": "Keeps Hearth in memory so Home opens at once. Uses TV RAM.",
  "pref.keepRelaunch.label": "Reopen Hearth if the TV closed it (experimental)",
  "pref.keepRelaunch.desc": "Needs Keep Hearth ready. Reloads Hearth at start-up if the TV closed it.",
  "pref.tvApps.label": "Load app list from the TV without root (experimental)",
  "pref.tvApps.desc": 'Needs "LG Connect Apps" On: LG menu, Network or Connection > Mobile Connection Management.',
  "pref.noRootGuide.label": "Open Hearth without root: guide",
  "pref.noRootGuide.desc": "LG Home cannot be replaced without root. OK shows two ways to reach Hearth quickly.",
  "pref.replaceHome.label": "Replace LG Home (helper)",
  "pref.replaceHome.desc": "Opens Hearth instead of LG Home. Map the Home button to avoid flashes.",
  "pref.samHome.label": "Replace LG Home with SAM (experimental)",
  "pref.samHome.desc": "Mounts a stand-in over LG Home. May restart the TV's app manager.",
  "pref.homeApp.label": "Set Hearth as the TV's Home app (experimental, webOS 4.x)",
  "pref.homeApp.desc": "Worked on webOS 4.x, did not work on webOS 7.x.",
  "pref.tvInput.label": "Add Hearth as a TV input",
  "pref.tvInput.desc": "Lists Hearth next to HDMI 1. Set the TV to start on its last input.",
  "pref.powerOnApp.label": "When the TV turns on, open...",
  "pref.powerOnApp.desc": "The app the TV opens at power-on instead of Live TV (after one restart).",
  "pref.remap.label": "Map additional keys",
  "pref.remap.desc": "Give other remote buttons (Netflix and more) a new job. Not Home.",
  "pref.lgLogo.label": "Show the LG logo when the TV starts",
  "pref.lgLogo.desc": "LG's own switch for the logo when the TV starts.",
  "pref.screensaver.label": "Custom Screen Saver (Photo, GIF, Video or Slideshow)",
  "pref.screensaver.desc": "Replaces the TV's screen saver with your pictures or videos.",
  "pref.screensaverPictures.label": "Screensaver file or folder",
  "pref.screensaverPictures.desc": "Pick a picture, GIF, video or folder to play.",
  "pref.screensaverInterval.label": "Screensaver: change picture every",
  "pref.screensaverInterval.desc": "How long each picture stays up in the saver.",
  "pref.screensaverShuffle.label": "Screensaver: shuffle",
  "pref.screensaverShuffle.desc": "Random order; off plays A to Z.",
  "pref.screensaverCare.label": "Screensaver: OLED care",
  "pref.screensaverCare.desc": "A thin moving frame keeps a single picture from burning in.",
  "settings.uninstallApps": "Uninstall apps",
  "settings.okUninstallsTheApp": "OK asks to uninstall the app \xB7 Back or Done finishes",
  "pref.wallpaperFit.label": "Wallpaper: picture size",
  "pref.wallpaperFit.desc": "Fit shows the whole picture; Fill crops it to the screen.",
  "pref.screensaverFit.label": "Screensaver: picture size",
  "pref.screensaverFit.desc": "Fit shows the whole picture; Fill crops it to the screen.",
  "pref.screensaverDim.label": "Screensaver: brightness",
  "pref.screensaverDim.desc": "Bright shows the pictures as they are; Dim darkens them by the chosen amount.",
  "pref.screensaverPowerOff.label": "Screensaver: switch the TV off after",
  "pref.screensaverPowerOff.desc": "Switches the TV off after the saver has run this long.",
  "pref.screensaverShow.label": "Screensaver: show it now",
  "pref.screensaverShow.desc": "Starts the saver now, to try it.",
  "pref.language.label": "Hearth language",
  "pref.language.desc": "Hearth's menu language. \u2190 \u2192 switch languages; OK loads your own language file (rooted TVs).",
  "pref.languageRemove.label": "Remove the language file",
  "pref.languageRemove.desc": "Deletes the loaded language file from Hearth; the menus go back to English.",
  "pref.updates.label": "Check for updates",
  "pref.updates.desc": "Looks for a newer Hearth. Only when you press OK.",
  "updates.title": "Check for updates",
  "updates.hintList": "You have Hearth {version}. Up and Down choose a version, Back returns.",
  "updates.hintOther": "You have Hearth {version}. OK checks again, Back returns.",
  "updates.checking": "Looking for updates\u2026",
  "updates.upToDate": "Hearth is up to date",
  "updates.upToDateText": "You have {version}, the newest version.",
  "updates.failed": "Could not check",
  "updates.failedText": "No answer from the update list. Check the TV's internet connection and try again.",
  "updates.rowNewest": "Newest version",
  "updates.rowIncluded": "Comes with {newest}",
  "updates.whatsNew": "What is new in {version}",
  "updates.summaryNote": "A short summary of the changes",
  "updates.found": "Newer versions found: {count}",
  "updates.noNotes": "No summary was published for this version.",
  "updates.hintInstall": "You have Hearth {version}. OK installs the chosen version, Up and Down read the summaries, Back returns.",
  "updates.hintBrew": "You have Hearth {version}. OK shows how to update, Up and Down read the summaries, Back returns.",
  "updates.openBrew": "Open Homebrew Channel",
  "updates.noRootTitle": "Update with Homebrew",
  "updates.noRootText": "Hearth can only install itself on a rooted TV. Open the Homebrew Channel and update Hearth there, or install the new version the way you installed Hearth.",
  "updates.noFactsTitle": "Update with Homebrew",
  "updates.noFactsText": "This version has no direct download. Open the Homebrew Channel and update Hearth there.",
  "updates.askTitle": "Install Hearth {version}?",
  "updates.askText": "Hearth downloads the new version, checks it and installs it over this one. Your settings stay. The screen may close for a moment.",
  "updates.askInstall": "Install",
  "updates.installing": "Installing Hearth {version}\u2026 Please wait, do not turn the TV off.",
  "updates.stepStart": "Starting\u2026",
  "updates.stepDownload": "Downloading {percent}%",
  "updates.stepCheck": "Checking the file",
  "updates.stepInstall": "Installing",
  "updates.stepFinish": "Almost done",
  "updates.doneTitle": "Hearth {version} is installed",
  "updates.doneText": "If Hearth does not restart by itself, open it again from the app list.",
  "updates.failTitle": "Could not install",
  "updates.failText": "The update was not installed and nothing was changed. You can update with the Homebrew Channel instead.",
  "pref.showDebug.label": "Show the Debug tab",
  "pref.showDebug.desc": "Adds the Debug and Tests tabs, for reporting a problem.",
  "pref.undoAll.label": "Uninstall Hearth and undo all system changes",
  "pref.undoAll.desc": "Takes back what Hearth changed on the TV and uninstalls it.",
  "pref.essentialsEdit.label": "Edit Essentials",
  "pref.essentialsEdit.desc": "Add, remove or reorder the rows on this tab.",
  "undoall.title": "Thank you for using Hearth",
  "undoall.text": "OK takes back what Hearth changed on the TV (start-up links, folders, saver, button settings, Home app), writes one log file ({log}) and uninstalls Hearth. Your own wallpaper, theme and language folders stay. If the TV was set to open Hearth when it turns on, it restarts once at the end. This cannot be undone from Hearth.",
  "undoall.working": "Uninstalling Hearth",
  "undoall.workingText": "Please wait. This closes when the TV has removed Hearth. If the TV was set to open Hearth when it turns on, it then restarts by itself. Log: {log}",
  "undoall.failed": "Could not start the undo script.",
  // ----- option values, greyed-out reasons, small texts of the Settings table (lib/prefs.ts) -----
  "theme.black": "OLED black",
  "theme.grey": "Calm blue-grey",
  "theme.midnight": "Midnight blue",
  "theme.forest": "Deep forest",
  "theme.teal": "Deep teal",
  "theme.graphite": "Warm graphite",
  "timeFormat.12h": "12-hour (AM/PM)",
  "timeFormat.24h": "24-hour",
  "timeFormat.tv": "Same as the TV",
  "weight.200": "Thin",
  "weight.300": "Light",
  "weight.400": "Regular",
  "weight.500": "Medium",
  "weight.600": "Semi-bold",
  "weight.700": "Bold",
  "iconStyle.original": "Original",
  "iconStyle.minimal": "Minimal",
  "iconStyle.glyph": "Glyph",
  "iconStyle.mono": "Dark mono",
  "iconStyle.soft": "Soft mono",
  "iconStyle.accent": "Accent mono",
  "iconStyle.gradient": "Gradient mono",
  "iconStyle.tinted": "Tinted tile",
  "align.left": "Left",
  "align.center": "Centre",
  "align.right": "Right",
  "panel.small": "Small",
  "panel.medium": "Medium",
  "panel.large": "Large",
  "level.off": "Off",
  "level.light": "Light",
  "level.medium": "Medium",
  "level.strong": "Strong",
  "level.max": "Max",
  "disabled.inputHook": "The Input Hook app is installed and already has button settings. Hearth leaves them alone, so this is off. Remove those settings in the Input Hook app to use it here.",
  "disabled.rows": "Not used while favourites are set: the favourites row shows alone.",
  "disabled.homeApp": 'Switch "Replace LG Home (helper + Home button)" off first. Only one way of replacing LG Home can be on.',
  "disabled.replaceHome": `Switch "Set Hearth as the TV's Home app" off first. Only one way of replacing LG Home can be on.`,
  "disabled.samHome": 'Switch "Replace LG Home (helper)" off first. Only one way of replacing LG Home can be on.',
  "disabled.samBusy": "SAM is being set up. Wait until it is done.",
  "disabled.replaceHomeSam": 'Switch "Replace LG Home with SAM" off first. Only one way of replacing LG Home can be on.',
  "disabled.powerOn": "This TV's software has no power-on setting Hearth can use.",
  "disabled.keepRelaunch": 'Switch "Keep Hearth ready" on first. This row needs it.',
  "disabled.keepList": "This TV has no memory list that Keep Hearth ready can change, so it cannot work here.",
  "disabled.lgLogo": "This TV doesn't have a setting for the LG logo at start.",
  "disabled.rootDenied": 'the TV refused the command. If this TV is rooted, updating the Homebrew Channel may help. On webOS 11, run once over SSH: sh /media/developer/apps/usr/palm/applications/tld.my.customlauncher/tools/webos11-permission.sh (see "webOS 11" in the README).',
  "disabled.rootDown": "the Homebrew Channel service is not running. If this TV is rooted, open the Homebrew Channel once, then reopen Settings.",
  "disabled.needsRoot": "Needs a rooted TV: {why}",
  "disabled.tvSaid": " (TV said: {detail})",
  "time.seconds": "{n} seconds",
  "time.oneMinute": "1 minute",
  "time.minutes": "{n} minutes",
  "time.oneHour": "1 hour",
  "time.eachVisit": "Each visit",
  "time.hours": "{n} hours",
  "pref.darker": "{n}% darker",
  "act.export": "Export",
  "act.save": "Save",
  "act.delete": "Delete",
  "act.restore": "Restore",
  "act.remove": "Remove",
  "act.reset": "Reset",
  "act.undoAll": "Undo",
  "act.read": "Read",
  "common.on": "On",
  "common.off": "Off",
  "common.unknown": "Unknown",
  "common.default": "Default",
  "common.notOnTv": "Not on this TV",
  "pref.notSet": "Not set",
  "pref.fahrenheit": "Fahrenheit (\xB0F)",
  "pref.celsius": "Celsius (\xB0C)",
  "pref.network": " + network",
  "pref.tvDefault": "TV default",
  "pref.byOtherTool": "Set by another tool",
  "pref.afterRestart": "{name} (after a restart)",
  "pref.tileLight": "Light",
  "pref.tileDark": "Dark",
  "pref.row1": "1 row",
  "pref.rows2": "2 rows",
  "pref.picture": "Picture: {name}",
  "pref.slideshow": "Slideshow: {name}",
  "pref.withSubfolders": " (with subfolders)",
  "pref.builtIn": "Built-in: {name}",
  "pref.button": "Button {code}",
  "pref.nOff": "{n} off",
  "pref.lgDefault": "LG default",
  "pref.oneButton": "1 button",
  "pref.nButtons": "{n} buttons",
  "pref.saverPhotos": "Photos slideshow (built in)",
  "pref.saverVideo": "Built-in video",
  // ----- pop-ups and toasts of app.tsx (T1b) -----
  "app.themeTakenOffIt": "Theme taken off (it was not saved)",
  "app.themeTakenOff": "Theme taken off",
  "app.keepHearthReadyIs": "Keep Hearth ready is off again: {why}",
  "app.turningOnThisTakes": "Turning on: this takes about 20 seconds",
  "app.theAppListIs": "The app list is up to date",
  "app.couldNotReadThe": "Could not read the app list{why}",
  "app.removingTheOldSam": "Removing the old SAM method\u2026",
  "app.couldnTGetThe": "Couldn't get the weather yet. Check the TV's internet connection. It will try again",
  "app.closingLgHomeWas": "Closing LG Home was switched off: LG Home kept coming back to the front",
  "app.withDifferences": "{title} (with differences)",
  "app.ok": "OK",
  "app.lookAtTheTv": "Look at the TV: when it asks to allow the connection, press OK on the remote (waiting up to a minute)",
  "app.pairedReadingTheApp": "Paired. Reading the app list\u2026",
  "app.rootAccessFailed": "Root access failed",
  "app.hearthCouldNotUse": "Hearth could not use the Homebrew Channel (root), so the settings that need root are hidden. Without root Hearth can still read the app list through the TV's remote-control service (SSAP, experimental). ",
  "app.turnOnSsapApp": "Turn on SSAP app list",
  "app.noRootNeededThe": "No root needed. The TV asks once to allow it",
  "app.myTvIsRooted": "My TV is rooted",
  "app.howToGetRoot": "How to get root access back",
  "app.close": "Close",
  "app.getRootAccessBack": "Get root access back",
  "app.firstRunOnceOver": 'First run once over SSH: sh /media/developer/apps/usr/palm/applications/tld.my.customlauncher/tools/webos11-permission.sh, then restart the TV. Only if that does not help, update the Homebrew Channel to 0.8.0-rc1 and open it once. Details: README, "webOS 11" and Troubleshooting.',
  "app.ok2": "OK",
  "app.saving": "Saving...",
  "app.restartingTheTv": "Restarting the TV...",
  "app.theTvDidNot": "The TV did not restart{why}. Restart it from its own settings, or unplug it for a minute",
  "app.couldnTOpenThe": "Couldn't open the TV's settings",
  "app.couldnTOpenLg": "Couldn't open LG Home",
  "app.pressHomeOnYour": "Press the Home button on your remote once.",
  "app.homeKeyLearned": "Home key learned.",
  "app.lgHome2": "LG Home",
  "app.opensLgSOwnHome": "Opens LG's own home screen.",
  "app.aHomeReplacementIsOn": "A Home replacement is on",
  "app.lgHomeWillNotComeTo": "LG Home will not come to front if a replacement method has been enabled. Please disable all LG Home replacement methods before using this action.",
  "app.disableReplacementsFirst": "Disable replacements first",
  "app.proceed": "Proceed",
  "app.switchTheLgHomeReplacement": "Switch the LG Home replacement off in Settings, System, then give the button this job again.",
  "app.couldnTOpen": "Couldn't open {label}",
  "app.chooseACityFirst": "Choose a city first",
  "app.keepHearthReady": "Keep Hearth ready?",
  "app.keepItOff": "Keep it off",
  "app.turnOnExperimental": "Turn on (experimental)",
  "app.usesTvRamOff": "Uses TV RAM; Off undoes it",
  "app.bootLoopTitle": "Possible start-up loop",
  "app.bootLoopInput": "On some webOS 3 TVs, starting on the Hearth input makes the TV hang at the logo after it is switched on. Additional steps may be required to get back to Hearth.",
  "app.bootLoopPowerOn": "On some webOS 3 TVs, opening an app when the TV turns on makes the TV hang at the logo. Additional steps may be required to get back to Hearth.",
  "app.bootLoopGo": "Continue anyway",
  "app.bootLoopGoDetail": "May freeze the TV at start",
  "app.bootGuardReverted": "The TV did not start on Hearth, so Hearth switched off its TV input and power-on app.",
  "app.replaceLgHomeWithSam": "Replace LG Home with SAM?",
  "app.samExplain": "Hearth takes LG Home's place, so the TV opens Hearth wherever it would open LG Home, with no flash. To do this a black stand-in is mounted over LG Home and the TV's app manager (SAM) may be restarted once; the screen can blink for a few seconds. It starts about 25 seconds after the TV starts, and it can break the TV's picture size setting. Experimental: tested on webOS 7 only. Switch it off here to undo it.",
  "app.samMayRestart": "May restart the app manager",
  "app.samSettingUp": "Setting up. This can take up to a minute...",
  "app.samNeedsRestart": "Turned off. Restart the TV to get LG Home back",
  "app.yourEarlierSettingsAre": "Your earlier settings are back",
  "app.noEarlierSettingsFound": "No earlier settings found",
  "app.visualSettingsResetTo": "Visual settings reset to default",
  "app.writingTheThemeBase": "Writing the theme base\u2026",
  "app.savedThemeBaseZip": "Saved theme_base.zip in the themes folder: {apps} apps, {icons} icons",
  "app.themeSavedInHearth": "Theme saved in Hearth",
  "app.themeDeleted": "Theme deleted",
  "app.turnedOffTheTv": "Turned off. The TV's own screen saver is back",
  "app.settingUp": "Setting up\u2026",
  "app.startingTheScreenSaver": "Starting the screen saver\u2026 press any key to end it",
  "app.theTvDidnT": "The TV didn't start its screen saver. Try again, or wait for its idle time",
  "app.turnedOffTheBuilt": "Turned off. The built-in list is used when there is no root",
  "app.openHearthWithoutRoot": "Open Hearth without root",
  "app.withoutRootNothingCan": "Without root nothing can replace LG Home. 1) Quick Access: open Hearth once, then hold a number key 1-9 on the remote and choose Hearth; that key opens Hearth from any app (slower than rooted). 2) Advanced: a second always-on device (Raspberry Pi) running webos-vibehack opens Hearth when LG Home shows. ",
  "app.detailsReadme": " Details: README.",
  "app.ok3": "OK",
  "app.puttingTheTvS": "Putting the TV's Home app back...",
  "app.settingUp2": "Setting up...",
  "app.turnedOffLgHome": "Turned off. LG Home opens as usual",
  "app.settingUp3": "Setting up...",
  "app.lgHomeIsReplaced": "LG Home is replaced",
  "app.replaceLgHomeAnyway": "Replace LG Home anyway?",
  "app.hearthWillOpenInstead": "Hearth will open instead of LG Home, but LG Home may flash for a moment, for example after Back from the last app, when the TV wakes and at start. The Home button itself shows no flash once it is mapped to Hearth (Settings, System, Remote control, Map home button).",
  "app.bindHomeKeyTo": "Bind Home key to Hearth first",
  "app.nothingIsReplacedNow": "Nothing is replaced now. Opens the Home button setting",
  "app.replaceLgHomeWithout": "Replace LG Home without Home key binding",
  "app.lgHomeMayFlash": "LG Home may flash now and then",
  "app.addingHearthToThe": "Adding Hearth to the inputs\u2026",
  "app.addedToTheTv": "Added to the TV's inputs",
  "app.removingHearthFromThe": "Removing Hearth from the inputs\u2026",
  "app.removedFromTheTv": "Removed from the TV's inputs",
  "app.theTvAcceptedThat": "The TV accepted that but doesn't show the change yet. Check the TV's input list",
  "app.theTvDidnT2": "The TV didn't accept that (details: {TV_INPUT_LOG})",
  "app.changing": "Changing\u2026",
  "app.theLgLogoWill": "The LG logo will show when the TV starts",
  "app.theLgLogoIs": "The LG logo is turned off for the next start",
  "app.theTvDidnT3": "The TV didn't accept that change{why}",
  "app.checkingForNewApps": "Checking for new apps\u2026",
  "app.startingThePhotoSlideshow": "Starting the photo slideshow",
  "app.builtInBackgroundRestored": "Built-in background restored",
  "app.loadingWallpaper": "Loading wallpaper\u2026",
  "app.startingSlideshow": "Starting slideshow\u2026",
  "app.screenSaverPhotoSlideshow": "Screen saver: photo slideshow",
  "app.screenSaverPicturesSet": "Screen saver pictures set",
  "app.theScreenSaverFollows": "The screen saver follows the wallpaper",
  "app.screenSaverBuiltIn": "Screen saver: built-in video",
  "app.weatherSetTo": "Weather set to {name}",
  "app.uninstalled": "Uninstalled {title}",
  "app.theTvDidNot2": "The TV did not uninstall {title} (details: {UNINSTALL_LOG})",
  "app.beforeYouMapButtons": "Before you map buttons",
  "app.mappingButtonsChangesHow": "Mapping buttons changes how your remote works. If the remote stops answering, restart the TV (unplug it for 30 seconds). If that does not help, follow the repair steps in the Troubleshooting guide.",
  "app.remoteButtonsWereNot": "Remote buttons were not kept after the restart: Off. Turn them on again to use them",
  "app.couldnTListenFor": "Couldn't listen for a button. Choose it from the list instead",
  "app.choosingAPictureNeeds": "Choosing a picture needs the Homebrew Channel (root)",
  "app.couldnTUseThat": "Couldn't use that picture",
  "app.themeNotLoaded": "Theme not loaded",
  "app.nothingWasChanged": "{reason}. Nothing was changed.",
  "app.ok4": "OK",
  "app.oneNewApp": "1 new app found",
  "app.newApps": "{added} new apps found",
  "app.builtInList": "Using the built-in app list{why}",
  "app.homebrewNotYet": ". The Homebrew Channel is not available yet",
  "app.couldNotPair": "Could not pair: {why}. Is LG Connect Apps on in the TV settings? You can also add apps by hand: see the README",
  "app.tileHidden": "{title} hidden. Add it back in Settings \u2192 {tab}",
  "app.tabApps": "Apps",
  "app.tabSources": "Sources",
  "app.couldnTUninstall": "Couldn't uninstall that app{why}",
  "app.tvNotAccept": ". The TV did not accept the command",
  "app.themeSwitched": "Theme switched",
  "app.themeLoaded": "Theme loaded",
  "app.notSaved": "Not saved",
  // ----- Settings group headers (T1b; the English name is also the group id) -----
  "group.Time and date": "Time and date",
  "group.Weather": "Weather",
  "group.Widget look": "Widget look",
  "group.Favourites": "Favourites",
  "group.Home row": "Home row",
  "group.Icons": "Icons",
  "group.Labels": "Labels",
  "group.Quiet mode": "Quiet mode",
  "group.Recent apps": "Recent apps",
  "group.Theme": "Theme",
  "group.Memory": "Memory",
  "group.Remote control": "Remote control",
  "group.TV start": "TV start",
  // ----- p22c: Settings help panel (English only until p25; a tab, group or row without a text shows no panel) -----
  "help.tab.essentials": "The settings people change most, in one list. Each row also stays in its own tab. The last row lets you choose which rows appear here.",
  "help.tab.look": "How the home row looks and behaves: theme, icons, app names, spacing, where the highlight starts and quiet mode.",
  "help.tab.clock": "The clock, date and weather on the home screen. A live preview shows while the widget is on.",
  "help.tab.wallpaper": "The picture behind the apps: a built-in background, your own pictures or a slideshow, and how it is shown.",
  "help.tab.saver": "A screen saver of your own, for rooted TVs (experimental): what plays, for how long and how it protects an OLED screen.",
  "help.tab.system": "Language, updates, how Home and other remote buttons open Hearth, what starts with the TV, and uninstalling Hearth.",
  "help.group.Theme": "Colours of the tiles, text and background. Your own looks can be saved as themes.",
  "help.group.Icons": "Size, shape, style, colour and spacing of the app icons on the home row.",
  "help.group.Home row": "How the home row is laid out and scrolls, where the highlight starts, and which extra tiles it shows.",
  "help.group.Labels": "The app names under the icons: show or hide them, and set their colour, font, size and thickness.",
  "help.group.Quiet mode": "After a pause with no key press the apps hide, so only the wallpaper shows. Any key brings them back. It can also dim the screen, switch the TV off later and shift the clock and apps slightly against burn-in.",
  "help.group.Favourites": "Spacing of the favourites row. While favourites are set, only that row shows; Down shows the full row.",
  "help.group.Recent apps": "The panel that opens when you press Back on the home screen.",
  "help.group.Remote control": "The Home button and other remote buttons. Needs root; Hearth uses its bundled key hook, so no other tool is needed. Map the Home button first, then other keys, and use the pointer block only if the Magic Remote pointer gets in the way.",
  "help.group.TV start": "What happens when the TV starts or Home is pressed: replacing LG Home (the Home button, the helper or a stand-in), an app at power-on, a TV input entry and the LG logo. Use one Home replacement at a time; the Home button is the cleanest.",
  "help.group.Memory": "Experimental ways to keep Hearth or LG apps loaded so they open faster. They use the memory of the TV, so leave them off unless your TV has memory to spare and a slow start bothers you.",
  "help.pref.iconScale": "Makes the app icons on the home row larger or smaller.",
  "help.pref.rows": "Shows the apps in one row or split over two rows.",
  "help.pref.tileShape": "The outline of every app icon: rounded, square, circle and more.",
  "help.pref.iconGap": "The space between the icons.",
  "help.pref.showLabels": "Shows or hides the app names under the icons.",
  "help.pref.labelColor": "The colour of the app names.",
  "help.pref.labelFont": "The typeface of the app names.",
  "help.pref.labelSize": "How large the app names are.",
  "help.pref.labelWeight": "How thick the app names are.",
  "help.pref.theme": "The colours of tiles, text and background. Arrows browse your saved themes; the preview shows the result.",
  "help.pref.themeExport": "Writes theme_base.zip into the themes folder (/media/developer/themes): a ready starting point for your own theme. It already holds your apps in their present order, their names and their icons. Copy it to a computer, change colours, fonts, names or icons in its manifest.json (or hand it to an AI helper together with the theme guide that is inside the zip), zip it again and copy it back. Then pick it under Current theme (OK loads a zip). Parts you leave out change nothing, so you can make a theme of only colours or only icons. Needs a rooted TV.",
  "help.pref.iconStyle": "How the icons are drawn: the original artwork, one-colour shapes, or artwork on a themed tile. Experimental.",
  "help.pref.iconLight": "Dark tiles with light shapes, or light tiles with dark shapes. Only for the one-colour styles.",
  "help.pref.iconColor": "The colour of the one-colour icon shapes: the theme's own or a plain colour.",
  "help.pref.iconOpacity": "Lower values let the wallpaper show through the icons.",
  "help.pref.sideMargin": "The space left and right of the app row.",
  "help.pref.bottomMargin": "The space between the app row and the bottom of the screen.",
  "help.pref.favSideMargin": "The space left and right of the favourites row.",
  "help.pref.favBottomMargin": "The space below the favourites row while it is alone. Raise it for a higher row.",
  "help.pref.inputStatus": "Unplugged inputs are greyed out, and a connected device's name shows under its tile. Rooted TVs.",
  "help.pref.showLgHome": "Adds a tile that opens LG's own Home screen.",
  "help.pref.showSystem": "Adds a tile that opens the TV's own settings.",
  "help.pref.hideSettings": "Hides the Hearth Settings tile. Hold OK on an app and choose Hearth Settings to get in.",
  "help.pref.clockFormat": "12-hour, 24-hour, or the same as the TV.",
  "help.pref.showPeriod": "Shows AM or PM beside the time. Only in 12-hour format.",
  "help.pref.showDate": "Shows the day and date under the time.",
  "help.pref.clockSize": "How large the time is. The date and weather scale with it.",
  "help.pref.clockFont": "The typeface of the time, date and weather.",
  "help.pref.clockWeight": "How thick the time and date are.",
  "help.pref.clockTop": "How far the widget sits from the top of the screen.",
  "help.pref.clockLeft": "Where the widget sits from left to right. 50% is the centre.",
  "help.pref.clockAlign": "Lines the time, date and weather up left, centre or right of the widget's position.",
  "help.pref.clockColor": "The colour of the time, date and weather. Follow theme keeps the theme's own.",
  "help.pref.clockShadow": "A soft shadow so the widget reads on bright pictures.",
  "help.pref.clockScrim": "A soft glow behind the widget so it reads on any picture. Dark behind light text, light behind dark text.",
  "help.pref.clockOpacity": "How solid the time, date and weather are.",
  "help.pref.weatherOn": "Shows the temperature and conditions under the date. Needs internet.",
  "help.pref.weatherUnit": "Celsius or Fahrenheit.",
  "help.pref.weatherCity": "The city the weather is for. Opens the city list.",
  "help.pref.weatherCityName": "Puts the city name before the temperature.",
  "help.pref.weatherRange": "Adds today's high and low, for example H 31 L 25.",
  "help.pref.updates": "Looks for a newer Hearth and offers to install it. It runs only when you press OK; nothing checks in the background.",
  "help.pref.language": "The language of Hearth's menus. Left and right switch between the bundled languages; the texts in them are mostly machine translated. On a rooted TV, OK loads your own language file (a .json file from a USB drive or the folder /media/developer/languages); a wrong file changes nothing and the pop-up says why. The format is described in the language pack guide.",
  "help.pref.languageRemove": "Deletes the language file you loaded and takes it out of Hearth. The menus go back to English. Bundled languages are not touched, and you can load a file again at any time.",
  "help.pref.tvApps": "For TVs without root. Reads the list of apps from the TV through LG's own connection, so the home row can show your apps. It needs LG Connect Apps switched on in the TV's network settings (Mobile Connection Management). It is experimental and does not work on every webOS version. Rooted TVs do not need it.",
  "help.pref.noRootGuide": "Without root, LG Home cannot be replaced, so Hearth cannot open by the Home button alone. OK shows two ways to reach Hearth quickly anyway: put it on one of LG's Quick Access buttons (1 to 9), or run a small watcher on a second device that opens Hearth when LG Home appears. Read-only; nothing is changed on the TV.",
  "help.pref.tvInput": "Lists Hearth next to HDMI 1 in the TV's input list, so you can switch to it like an input. If you set the TV to start on its last input, the TV boots straight into Hearth. Rooted TVs only.",
  "help.pref.samHome": "A second way to replace LG Home: Hearth mounts a stand-in over LG Home, so pressing Home opens Hearth instead. It may restart the TV's app manager, which closes running apps for a moment. Use it only if the other ways do not work for you. Experimental.",
  "help.pref.powerOnApp": "The app the TV opens when it is switched on, instead of Live TV or the last input. Pick Hearth or any other app. It takes effect after one TV restart, because the TV reads the setting at boot. Rooted TVs only.",
  "help.pref.lgLogo": "LG's own switch for the logo shown while the TV starts. Hearth only flips LG's own setting; it does not change how long the TV needs to boot. Not available on every TV.",
  "help.pref.homeApp": "Registers Hearth as the TV's Home app, so the TV's own Home setting points to Hearth. It worked on webOS 4.x and did not work on webOS 7.x, so try it only on an older TV and keep it off otherwise. Experimental. Undo all system changes puts the old value back.",
  "help.pref.preload": "Choose which LG apps the TV keeps loaded in the background, so they open faster when you start them. Every app you tick uses TV memory, so tick only the ones you really use. Experimental; if the TV becomes slow, untick them again.",
  "help.pref.keepReady": "Keeps Hearth in the TV's memory so pressing Home brings it back at once instead of starting it again. The more you keep ready, the more TV memory Hearth uses, which can slow other apps on a TV with little memory. Experimental. Switch it off if the TV feels slower.",
  "help.pref.keepRelaunch": "Loads Hearth again at start-up if the TV closed it while it was kept ready. It needs Keep Hearth ready to be on; on its own it does nothing. Experimental.",
  "help.pref.showDebug": "Adds the Debug and Tests tabs to Settings. Debug shows technical facts about your TV and Hearth, and writes a report to /tmp/hearth-debug.txt; the Tests tab holds checks you run by hand. Turn it on only when you are reporting a problem or were asked to; the tabs do nothing on their own.",
  "help.group.Time and date": "What the widget shows: the time format, AM or PM, and the date.",
  "help.group.Widget look": "Size, font, colour, position and backdrop of the clock, date and weather.",
  "help.group.Weather": "The temperature and conditions under the date. Needs internet.",
  "help.pref.wallpaper": "A built-in background, your own picture or a slideshow. The preview shows it behind your home screen.",
  "help.pref.wallpaperFit": "Fill crops the picture to the screen; Fit shows all of it.",
  "help.pref.interval": "How long each slideshow picture stays up. Each visit: a new one after a restart or a minute away.",
  "help.pref.shuffle": "Plays the slideshow in random order. Off plays A to Z.",
  "help.pref.wallpaperOpacity": "How solid the picture is. Lower values soften it.",
  "help.pref.fadeStrength": "Darkens the bottom of the picture so the icons stay easy to read.",
  "help.pref.homeFocus": "Where the highlight starts when you come back to the home screen from another app. While you browse the row it stays where you put it.",
  "help.pref.widgetOn": "Turns the clock, date and weather on or off. With it on, the Widget tab shows more rows and a live preview.",
  "help.pref.resetLook": "Puts theme, wallpaper, look, quiet mode, clock and weather back to their defaults. Favourites, their order, the apps on the home row and the screen saver are not touched.",
  "help.pref.essentialsEdit": "Choose which rows appear in Essentials.",
  "help.pref.homeKey": "Makes the Home button open Hearth directly, so LG Home does not flash. Hearth uses its bundled key hook for this and finds the button code itself; if another tool already uses the Input Hook, these rows grey out. Needs root. This is the cleanest way to replace LG Home.",
  "help.pref.remap": "Give another remote button a job: open an app, switch to an input, act as another button or run a TV action. Home, arrows, OK, Back, power, volume, channels and numbers cannot be mapped. Mapped buttons work through Hearth's bundled key hook, so they need root. Actions marked experimental may not work on every TV; tell us which ones do.",
  "help.pref.replaceHome": "A small helper runs on the TV and opens Hearth whenever LG Home comes to the front. LG Home can flash briefly first, except when the Home button is mapped (Map home button). Rooted TVs only.",
  "help.pref.screensaver": "Replaces the TV screen saver with your own pictures, GIFs, videos or a slideshow. Rooted TVs only and experimental; if the set-up fails, it switches itself off and says why.",
  "help.pref.screensaverPictures": "Chooses what the saver plays: the built-in photos or video, one of your own pictures, GIFs or videos, or a whole folder as a slideshow. Rooted TVs only.",
  "help.pref.screensaverInterval": "How long each picture stays on screen in a slideshow before the next one comes. Shown only for a slideshow.",
  "help.pref.screensaverShuffle": "Plays the slideshow in random order. Off plays the pictures in name order, A to Z. Shown only for a slideshow.",
  "help.pref.screensaverCare": "Moves a thin frame slowly around the picture so a still image does not burn into an OLED screen. Best left on for a single picture.",
  "help.pref.screensaverFit": "Fit shows the whole picture, with black bars where it does not match the screen. Fill covers the whole screen and crops what does not fit.",
  "help.pref.screensaverDim": "Darkens the saver pictures by the chosen amount, which is gentler on an OLED screen and in a dark room. Bright shows them unchanged.",
  "help.pref.screensaverPowerOff": "Switches the TV off after the saver has run for this long. Off lets the saver run until you press a key.",
  "help.pref.screensaverShow": "Starts the saver right now so you can try your settings.",
  "help.pref.quietSec": "Hides the apps after the chosen time without a key press, and any key brings them back. Dimming and switching the TV off after a while can be added below. Off turns it off.",
  "help.pref.scrollSpeed": "How fast the home row moves while Left or Right is held down, and while the Magic Remote pointer rests at the edge of the row.",
  "help.pref.undoAll": "Takes back every change Hearth made on the TV: start-up links, folders, screen saver, button settings, the Home app. It writes one log file, then uninstalls Hearth. Your own wallpaper, theme and language folders stay. The TV may restart at the end. Use it before removing Hearth for good.",
  // ----- screens, components, lib helper messages (T1c) -----
  "homeappcmd.onTheHomeButton": "On: the Home button now opens Hearth",
  "homeappcmd.thisTvHasNo": "This TV has no Home app setting, so this method does not work here",
  "homeappcmd.theTvDidNot": "The TV did not accept the change{detail}. Nothing was changed",
  "homeappcmd.couldnTReadThe": "Couldn't read the TV's Home app setting{detail}",
  "homehook.onLgHomeNow": "On: LG Home now hands over to this launcher",
  "homehook.theLauncherMustBe": "The launcher must be installed to do this",
  "homehook.theHelperFilesAre": "The helper files are missing, nothing was changed",
  "homehook.couldnTSetThat": "Couldn't set that up{detail}. Nothing was changed",
  "keepreadycmd.theTvReportedSee": 'the TV reported "{state}" (see {KEEP_LOG})',
  "keepreadycmd.couldnTChangeThis": "Couldn't change this{detail}. Nothing was changed",
  "keepreadycmd.keepHearthReadyOn": "Keep Hearth ready: on. Log: {KEEP_LOG}",
  "keepreadycmd.keepHearthReadyOff": "Keep Hearth ready: off",
  "poweroncmd.turnedOffAfterThe": "Turned off. After the TV restarts once, it opens Live TV or the last input again",
  "poweroncmd.thisTvSSoftware": "This TV's software has no power-on setting Hearth can use, so nothing was changed",
  "poweroncmd.anotherStartUpFile": "Another start-up file is already in place ({OVERRIDE_FILE}), so Hearth left it alone",
  "preloadcmd.done": "Done",
  "preloadcmd.thisTvHasNo": "This TV has no list of preloaded apps. Nothing was changed",
  "preloadcmd.thatAppCannotBe": "That app cannot be changed here",
  "preloadcmd.theFilesCouldNot": "The files could not be written{detail}. Nothing was changed",
  "preloadcmd.couldNotReachThe": "Could not reach the TV{detail}. Nothing was changed",
  "preloadcmd.theTvDidNot": "The TV did not take the change. Nothing was changed. Details: /tmp/launcher-preload.log on the TV",
  "remap.onTheReassignedButtons": "On: the reassigned buttons work now",
  "remap.offEveryButtonDoes": "Off: every button does what the TV does again",
  "remap.hearthMustBeInstalled": "Hearth must be installed to do this",
  "remap.theHelperFilesAre": "The helper files are missing, nothing was changed",
  "remap.couldnTSetThat": "Couldn't set that up{detail}. Nothing was changed",
  "remap.thisTvHasNoKeyFilterList": "This TV's software has no key filter list for this method to use (older webOS). Use Map additional keys instead. Nothing was changed",
  "screensavercmd.onTheTvS": "On: the TV's screen saver now plays your wallpapers. It starts after the idle time set in the TV's own screen saver settings",
  "screensavercmd.hearthMustBeInstalled": "Hearth must be installed to do this",
  "screensavercmd.theFilesAreMissing": "The files are missing, nothing was changed",
  "screensavercmd.thisTvHasNo": "This TV has no way to make its app manager read a replaced screen saver. Nothing was changed",
  "screensavercmd.theBuiltInVideo": "The built-in video is not part of this build yet. Choose something else for the screen saver",
  "screensavercmd.theTvDidNot": "The TV did not take the replacement screen saver (webOS 10 and later: experimental). LG's own was put back and nothing was restarted. Details: /tmp/launcher-screensaver.log on the TV",
  "screensavercmd.couldNotFindThe": "Could not find the TV's screen saver file. Nothing was changed. Details: /tmp/launcher-screensaver.log on the TV",
  "screensavercmd.noPhotosWereFound": "No photos were found to show. Nothing was changed",
  "screensavercmd.itWasSwitchedOff": "It was switched off on the TV, so it is off here too",
  "screensavercmd.couldnTSetThat": "Couldn't set that up{detail}. The TV's own screen saver was left as it was",
  "takeovercmd.theSamMethodWas": 'The SAM method was removed and LG Home is back. To open Hearth from the Home button, turn on "Replace LG Home with a helper script" in Options',
  "takeovercmd.theSamMethodCould": "The SAM method could not be fully removed. Restart the TV to finish",
  "failure.couldnT": "Couldn't {doing}. {failureReason}",
  "homeengine.theKeyEngineWas": "The key engine was already running.",
  "homeengine.hearthStartedItsKey": "Hearth started its key engine.",
  "homeengine.theKeyEngineS": "The key engine's files are missing from the Hearth install. Reinstall Hearth.",
  "homeengine.theTvSInput": "The TV's input service was not found, so the key engine could not start. Try again in a minute.",
  "homeengine.theKeyEngineDid": "The key engine did not start. Restart the TV and try again, or pick a code anyway.",
  "saverconfig.off": "Off",
  "saverconfig.1Minute": "1 minute",
  "saverconfig.1Hour": "1 hour",
  "saverconfig.minutes": "{v} minutes",
  "saverconfig.fillTheScreenCropped": "Fill the screen (cropped)",
  "saverconfig.fitWholePicture": "Fit (whole picture)",
  "homefocus.theLastAppOpened": "The last app opened",
  "homefocus.theFirstApp": "The first app",
  "clockcolor.theThemeSOwn": "The theme's own",
  "themefile.andMore": "{shown}. And {v} more.",
  "themeapply.text": "{length} {what} ({shown}{v})",
  "citypicker.searchForACity": "Search for a city\u2026",
  "citypicker.typeItsNameWith": "Type its name with the on-screen keyboard",
  "citypicker.searchAgain": "Search again\u2026",
  "citypicker.backToTheList": "Back to the list",
  "citypicker.searching": "Searching\u2026",
  "citypicker.couldNotSearch": "Could not search",
  "citypicker.checkTheTvS": "Check the TV's internet connection and try again",
  "citypicker.noMatchingPlaceFound": "No matching place found",
  "citypicker.tryAnotherSpellingOr": "Try another spelling, or just the city's name",
  "citypicker.chooseACity": "Choose a city",
  "citypicker.cityName": "City name",
  "extrakeys.addAButton": "Add a button\u2026",
  "extrakeys.pressItOnThe": "Press it on the remote and Hearth names it",
  "extrakeys.remote": "Remote: {v}",
  "extrakeys.okChangesTheDrawing": "OK changes the drawing",
  "extrakeys.button": "Button {keyLabel}",
  "extrakeys.useTheOtherMethod": "Use the other method (experimental)",
  "extrakeys.theTvSKey": "The TV's key filter: for buttons the list here cannot find. Opens its own screen",
  "extrakeys.pressTheButtonOn": "Press the button on the remote now",
  "extrakeys.nothingWasPressed": "Nothing was pressed",
  "extrakeys.hearthListensForUp": "Up to a minute. If an app opens, come back to Hearth: the button is listed here \xB7 arrows, OK, Back, Home not offered",
  "extrakeys.okOnListenAgain": 'OK on "Listen again"',
  "extrakeys.detectedButton": "Detected: button {keyLabel}",
  "extrakeys.seenOkToChoose": "seen {count}\xD7 \xB7 OK to choose what it does",
  "extrakeys.listenAgain": "Listen again",
  "extrakeys.forgetsWhatWasDetected": "Forgets what was detected and listens for a new press",
  "extrakeys.remote2": "Remote: {v}",
  "extrakeys.okChangesTheDrawing2": "OK changes the drawing",
  "extrakeys.useTheOtherMethod2": "Use the other method (experimental)",
  "extrakeys.buttonsNotDetectedHere": "Buttons not detected here? The TV's key filter may see them. Opens its own screen",
  "extrakeys.backToTheTv": "Back to the TV's own action",
  "extrakeys.removesTheJobHearth": "Removes the job Hearth gave this button",
  "extrakeys.buttonDetectionAndMapping": "Button detection and mapping use the Input Hook library (Simon34545, with inputhookpp by Sundermann, GPL-3.0; idea by Informatic) and root commands through the Homebrew Channel.",
  "homekey.buttonIsNeededTo": "Button {keyLabel} is needed to move around Hearth, so it can't be used",
  "homekey.checking": "Checking\u2026",
  "homekey.pleaseWait": "Please wait",
  "homekey.yesContinue": "Yes, continue",
  "homekey.hearthStartsItsKey": "Hearth starts its key engine and adds one button of its own. Your other buttons are left alone",
  "homekey.noGoBack": "No, go back",
  "homekey.nothingIsStartedOr": "Nothing is started or changed",
  "homekey.pleaseWait2": "Please wait",
  "homekey.yesMakeButtonOpen": "Yes: make button {keyLabel} open Hearth",
  "homekey.itNowRemoveHere": "It {describeBind} now; Remove here gives that back",
  "homekey.youCanRemoveThis": "You can remove this here at any time",
  "homekey.noGoBack2": "No, go back",
  "homekey.nothingIsChanged": "Nothing is changed",
  "homekey.detectedButton": "Detected: button {keyLabel}",
  "homekey.knownHomeCode": "Known Home code: {keyLabel}",
  "homekey.removeButtonOpensHearth": "Remove: button {keyLabel} opens Hearth",
  "homekey.okGivesTheButton": "OK gives the button back to LG",
  "homekey.listenForButtonsAgain": "Listen for buttons again",
  "homekey.listenForTheHomeButton": "Listen for the Home button",
  "homekey.forgetWhatWasDetected": "Forget what was detected and start again",
  "homekey.thenPressTheHome": "Then press the Home button on the remote",
  "homekey.remote": "Remote: {v}",
  "homekey.okChangesTheDrawing": "OK changes the drawing",
  "homekey.homeButton": "Home button",
  "homekey.buttonDetectionAndMapping": "Button detection and mapping use the Input Hook library (Simon34545, with inputhookpp by Sundermann, GPL-3.0; idea by Informatic) and root commands through the Homebrew Channel.",
  "picker.themesFolder": "Themes folder",
  "picker.sameAsTheWallpaper": "Same as the wallpaper",
  "picker.theScreenSaverFollows": "The screen saver follows the Wallpaper row (the built-in photos if none)",
  "picker.builtInBackground": "Built-in background",
  "picker.noPictureChangeWhich": "No picture. Change which one with \u2190 \u2192 on the Wallpaper row",
  "picker.photosSlideshowBuiltIn": "Photos slideshow (built in)",
  "picker.the25PhotosThat": "The 25 photos that come with Hearth, one after another",
  "picker.builtInVideoScreen": "Built-in video screen saver",
  "picker.aVideoThatComes": "A video that comes with Hearth, played again and again",
  "picker.photosSlideshow": "Photos slideshow",
  "picker.the25PhotosThat2": "The 25 photos that come with Hearth, one after another. No root or USB needed",
  "picker.tryAgain": "Try again",
  "picker.readTheStorageAgain": "Read the storage again",
  "picker.noUsbDriveFound": "No USB drive found",
  "picker.plugOneInThen": "Plug one in, then open this screen again",
  "picker.useThisFolderFor": "Use this folder for the screen saver",
  "picker.playThisFolderAs": "Play this folder as a slideshow",
  "picker.useThisFolderAnd": "Use this folder and its subfolders for the screen saver",
  "picker.playThisFolderAnd": "Play this folder and its subfolders as a slideshow",
  "picker.everyPictureInAnd": "Every picture in {baseName} and in all the folders inside it",
  "picker.nothingHere": "Nothing here",
  "picker.thisFolderHasNo": "This folder has no theme (.zip) files or folders",
  "picker.thisFolderHasNo2": "This folder has no pictures or folders",
  "picker.beforeYouChoose": "Before you choose",
  "picker.beforeYouChoose2": "Before you choose",
  "picker.loading": "Loading\u2026",
  "poweronpicker.pressOkAgainTo": "Press OK again to restart the TV",
  "poweronpicker.theScreenGoesDark": "The screen goes dark for about half a minute. Back cancels",
  "poweronpicker.restartTheTvNow": "Restart the TV now to start using it",
  "poweronpicker.theTvReadsThis": "The TV reads this when it starts up. Until it restarts, it opens {untilRestart}",
  "poweronpicker.howPhoneAppsAnd": "How phone apps and Home Assistant switch it on. Casting to it while off then opens this app first",
  "poweronpicker.whenTheTvTurns": "When the TV turns on, open\u2026",
  "poweronpicker.okChoosesJumpA": "OK chooses \xB7 \u2190 \u2192 jump a page \xB7 Back returns to settings",
  "preload.pleaseWait": "Please wait",
  "preload.readingTheTv": "Reading the TV\u2026",
  "preload.pleaseWait2": "Please wait",
  "preload.switchedOffOkGives": "Switched off \xB7 OK gives it back to LG's setting",
  "preload.noPreloadedAppsFound": "No preloaded apps found",
  "preload.lgPreloadsNoneOf": "LG preloads none of the apps installed here",
  "preload.everythingBackToLg": "Everything back to LG's setting",
  "preload.givesEverySwitchedOff": "Gives every switched-off app back to LG",
  "preload.readTheTvAgain": "Read the TV again",
  "preload.okTriesOnceMore": "OK tries once more",
  "preload.lgPreloadedApps": "LG preloaded apps",
  "preload.moveOkSwitchesOff": "\u2191 \u2193 move \xB7 OK switches off or back \xB7 Back returns to settings",
  "preload.experimental": "Experimental",
  "recents.someAppsDidNot": "Some apps did not close",
  "recents.theTvWouldNot": "The TV would not close {label}",
  "recents.closedApps": "Closed {length} apps",
  "recents.closed": "Closed {label}",
  "recents.couldnTOpen": "Couldn't open {title}",
  "recents.recentApps": "Recent apps",
  "recents.closeAll": "Close all",
  "remotebuttons.oneMoment": "One moment\u2026",
  "remotebuttons.theButtonsBelowDo": "The buttons below do what you chose. OK turns it off: every button does what the TV does again",
  "remotebuttons.everyButtonDoesWhat": "Every button does what the TV does. OK turns your choices on",
  "remotebuttons.remoteStopsAnswering": "Remote stops answering? Restart the TV. If that does not help, see \u201CThe remote stops answering\u201D in the Troubleshooting guide.",
  "remotebuttons.pressAButtonTo": "Press a button to reassign it\u2026",
  "remotebuttons.theSurestWayRemotes": "The surest way: remotes from different years can send different codes for the same button. Not the arrows, OK, Back, Home, power, volume, channels or numbers",
  "remotebuttons.pressTheButtonOn": "Press the button on the remote now",
  "remotebuttons.hearthIsListeningFor": "Hearth is listening for one press, for up to a minute \xB7 Back cancels",
  "settings.settings": "Settings",
  "settings.refreshList": "Refresh list",
  "settings.nothingOnTheHome": "Nothing on the home screen yet.",
  "sourceeditor.releaseOkThenPress": "Release OK, then press \u2193 to edit",
  "sourceeditor.editing": "Editing: {label}",
  "sourceeditor.name": "Name",
  "sourceeditor.stepThroughSuggestionsOk": "\u2190 \u2192 step through suggestions \xB7 OK types a name",
  "sourceeditor.okTypesAName": "OK types a name",
  "sourceeditor.icon": "Icon",
  "sourceeditor.orOkToChange": "\u2190 \u2192 or OK to change the icon",
  "sourceeditor.useAPictureFrom": "Use a picture from a USB drive or the TV",
  "sourceeditor.aSquarePictureWorks": "A square picture works best",
  "sourceeditor.needsTheHomebrewChannel": "Needs the Homebrew Channel (root); not available on this TV",
  "sourceeditor.useNameAndIcon": "Use {own} name and icon",
  "sourceeditor.done": "Done",
  "sourceeditor.editNameAmpIcon": "Edit name & icon",
  "appmenu.reorderRow": "Reorder home row",
  "move.hint": "Click OK to select and place an app/input, use arrow keys to move, back button to exit to the home screen.",
  "move.hintBack": "Back once puts the picked-up app down, Back again exits.",
  "appmenu.removeFromFavourites": "Remove from favourites",
  "appmenu.addToFavourites": "Add to favourites",
  "appmenu.shownAloneOnThe": "Shown alone on the first row",
  "appmenu.hideFromTheHome": "Hide from the home screen",
  "appmenu.uninstall": "Uninstall",
  "appmenu.removesTheAppFrom": "Removes the app from the TV",
  "appmenu.cancel": "Cancel",
  "appmenu.hearthSettings": "Hearth Settings",
  "appmenu.settingsDetail": "Opens the settings",
  "appmenu.settingsPractice": "Choose this to finish hiding the tile",
  "appmenu.cancel2": "Cancel",
  "appmenu.uninstall2": "Uninstall {title}",
  "appmenu.thisCannotBeUndone": "This cannot be undone",
  "appmenu.thisRemovesTheApp": "This removes the app from the TV.",
  "appmenu.pleaseWaitThisCan": "Please wait, this can take a few seconds.",
  "app.lgHome": "LG Home",
  "app.systemSettings": "System Settings",
  "app.hearthSettings": "Hearth Settings",
  "app.hidePracticeTitle": "Hide the Settings tile",
  "app.hidePracticeText": "First try the way back: hold OK on any app and choose Hearth Settings. The tile is hidden only after you have done that. If you ever need the tile again, press Down five times on the Home screen; it comes back until Hearth restarts.",
  "app.hidePracticeGo": "Try it now",
  "app.settingsNotSaved": "Settings could not be saved (storage full). Changes may be lost at restart.",
  "app.restoreNotSaved": "Earlier settings are shown but could not be saved. They may be lost at restart.",
  "app.settingsTileHidden": "The tile is hidden. Hold OK on an app to open Hearth Settings.",
  "app.settingsTileBack": "The Settings tile is back until Hearth restarts.",
  "app.liveTvOrThe": "Live TV or the last input (the TV's default)",
  "app.whatTheTvDoes": "What the TV does on its own: the input you used last, usually Live TV",
  "app.hearth": "Hearth",
  "app.thisHomeScreen": "This home screen",
  "app.app": "App",
  "app.appsSources": "Apps & Sources",
  "app.apps": "Apps",
  "app.sources": "Sources",
  "app.essentials": "Essentials",
  "ess.title": "Edit Essentials",
  "ess.hint": "OK adds or removes a row. \u2190 \u2192 moves a chosen row.",
  "ess.reset": "Reset to default",
  "ess.resetDetail": "Brings back the standard rows.",
  "app.look": "Look",
  "app.widget": "Widget",
  "app.wallpaper": "Wallpaper",
  "app.screenSaver": "Screen saver",
  "app.system": "System",
  "app.homeKeyMapped": "Home button mapped",
  "app.homeKeyMappedText": "Button {keyLabel} now opens Hearth. If the Home button still opens LG Home, map it by hand: Settings > {tab} > {row}.",
  "app.homeKeyNotMapped": "Home button not mapped",
  "app.homeKeyNotMappedText": "{why} Please map the button by hand: Settings > {tab} > {row}, then press OK on a Home code or on the button Hearth detects.",
  "app.debug": "Debug",
  "app.tests": "Tests",
  "app.theTvSOwn": "The TV's own action",
  "app.whatTheButtonDid": "What the button did before",
  "app.nothing": "Nothing",
  "app.theButtonIsSwitched": "The button is switched off",
  "app.hearth2": "Hearth",
  "app.thisHomeScreen2": "This home screen",
  "app.muteOrUnmute": "Mute or unmute",
  "app.likeTheMuteButton": "Like the mute button",
  "app.input": "Input",
  "app.app2": "App",
  "homeappcmd.restored": "Turned off. The Home button opens {name} again",
  "common.lgHome": "LG Home",
  "poweroncmd.saved": "Saved: the TV will open {name} when you turn it on. It starts working after the TV restarts once",
  "poweroncmd.thatApp": "that app",
  "poweroncmd.couldntChange": "Couldn't change the power-on app{detail}. {now}",
  "poweroncmd.setTo": "It is set to: {name}",
  "poweroncmd.noCheck": "Hearth couldn't check what is set now",
  "picker.putYourOwn": "{path} \xB7 put your own {what} here",
  "picker.themeFiles2": "language files",
  "picker.languagesFolder": "Languages folder",
  "picker.loadALanguage": "Load a language file",
  "picker.loadingTheLanguage": "Loading the language file\u2026",
  "picker.pickWhereTheLanguage": "Pick where the language file is \xB7 Back returns to settings",
  "picker.okOpensAFolderLanguage": "OK opens a folder or loads a language file \xB7 Back goes up",
  "picker.thisFolderHasNoLanguage": "This folder has no .json files and no folders",
  "picker.languageNote1": "A language file is a .json file with the menu texts translated. A wrong file changes nothing and shows the reason.",
  "picker.languageNote2": "Texts the file does not have stay in English. Put language files in /media/developer/languages (the Languages folder row below), or plug in a USB drive.",
  "picker.languageNote3": "The English base file to translate, and how: docs/language_packs.md on the Hearth GitHub Pages site.",
  "app.languageLoaded": "Language loaded: {name} ({summary})",
  "app.languageNotLoaded": "The language file was not loaded",
  "app.languageCouldNotLoad": "The language could not be loaded: back to English",
  "app.languageRemoved": "Language file removed: back to English",
  "app.languageNeedsRoot": "Loading a language file needs a rooted TV",
  "picker.themeFiles": "theme files",
  "picker.picturesAndVideos": "pictures and videos",
  "picker.pictures": "pictures",
  "picker.onePictureIn": "1 picture in {name}",
  "picker.picturesIn": "{count} pictures in {name}",
  "poweronpicker.network": "Also when woken over the network: {state}",
  "preload.preloadedByLg": "Preloaded by LG \xB7 {memory}{loaded} \xB7 OK switches it off",
  "preload.loadedNow": " \xB7 loaded now",
  "remotebuttons.reassigned": "Reassigned buttons: {state}",
  "sourceeditor.ownName": "  ({own} name)",
  "scroll.slow": "Slow",
  "scroll.medium": "Medium",
  "scroll.brisk": "Fast",
  "scroll.fast": "Max",
  "shape.rounded": "Rounded square",
  "shape.square": "Sharp square",
  "shape.squircle": "Soft squircle",
  "shape.circle": "Circle",
  "shape.leaf": "Leaf",
  "shape.arch": "Arch",
  "shape.drop": "Teardrop",
  "color.theme": "Follow theme",
  "color.white": "White",
  "color.warm": "Warm white",
  "color.blue": "Ice blue",
  "color.amber": "Amber",
  "color.grey": "Grey",
  "color.charcoal": "Dark grey",
  "color.black": "Black",
  // ----- backgrounds, saver brightness -----
  "bg.theme": "The theme's own",
  "bg.photo-show": "Slideshow: Hearth photos",
  "bg.charcoal": "Plain: charcoal",
  "bg.navy": "Plain: deep navy",
  "bg.dusk": "Gradient: Dusk (dark)",
  "bg.ocean": "Gradient: Ocean (dark)",
  "bg.forest": "Gradient: Forest (dark)",
  "bg.ember": "Gradient: Ember (dark)",
  "bg.aurora": "Gradient: Aurora (dark)",
  "bg.cloud": "Gradient: Cloud (light)",
  "bg.peach": "Gradient: Peach (light)",
  "bg.mint": "Gradient: Mint (light)",
  "bg.sky": "Gradient: Sky (light)",
  "bg.lavender": "Gradient: Lavender (light)",
  "bg.photo": "Photo: {n}",
  "pref.saverBright": "Bright (as is)",
  "pref.saverDim": "Dim {n}%",
  // L4: texts that were written directly in the code
  "app.doneTheTvOpensV1": "Done: the TV opens {v1} when you turn it on",
  "app.doneNetworkWakeUpsGo": "Done: network wake-ups go where they ask again",
  "app.doneNetworkWakeUpsOpen": "Done: network wake-ups open it too",
  "app.changeTheTvInput": "change the TV input",
  "app.v1BackToTheTv": "{v1}: back to the TV's own action",
  "app.youCanAddItBack": "You can add it back in Settings \u2192 Apps",
  "app.youCanAddItBack2": "You can add it back in Settings \u2192 Sources",
  "appmenu.uninstallTitle": "Uninstall {title}?",
  "appmenu.uninstallingTitle": "Uninstalling {title}\u2026",
  "remotedrawing.lgAkb30085202": "LG AKB30085202",
  "row.nothingHereYet": "Nothing here yet",
  "wallpaper.noPicturesFoundInThat": "No pictures found in that folder",
  "wallpaper.couldnTReadTheWallpaper": "Couldn't read the wallpaper folder. Is the USB drive still plugged in?",
  "wallpaper.couldnTShowAnyPicture": "Couldn't show any picture from that location",
  "wallpaper.couldnTShowThatPicture": "Couldn't show that picture",
  "about.theTvRefusedTheCommand": "the TV refused the command",
  "about.homebrewChannelServiceNotFound": "Homebrew Channel service not found",
  "about.theHomebrewChannelDidNot": "the Homebrew Channel did not answer",
  "about.notRunningOnATv": "not running on a TV",
  "about.theCommandFailed": "the command failed",
  "clock.goodMorning": "Good morning",
  "clock.goodAfternoon": "Good afternoon",
  "clock.goodEvening": "Good evening",
  "earlystart.keyEngine": "key engine",
  "extrakeys.useMapHomeButtonTo": 'Use "Map home button" to open Hearth from a button.',
  "extrakeys.thisButtonAlreadyOpensHearth": "This button already opens Hearth.",
  "extrakeys.couldnTPutTheLg": "Couldn't put the LG Home helper on the TV. Try again.",
  "extrakeys.savedButReadingTheFile": "Saved, but reading the file back did not show the change. Try again.",
  "extrakeys.buttonV1V2": "Button {v1} {v2}.",
  "extrakeys.changeTheButtonSettings": "change the button settings",
  "extrakeys.buttonV1WorksAsLg": "Button {v1} works as LG made it.",
  "extrakeyscore.thatIsNotAButton": "That is not a button number.",
  "extrakeyscore.buttonV1IsNeededTo": "Button {v1} is needed to move around Hearth, so it can't be used.",
  "extrakeyscore.thatIsTheHomeButton": 'That is the Home button: use "Map home button" for it.',
  "failure.thisOnlyWorksOnThe": "This only works on the TV itself",
  "failure.theHomebrewChannelServiceIs": "The Homebrew Channel service is not running. This needs a rooted TV. If the TV is rooted, open the Homebrew Channel once and try again",
  "failure.theTvRefusedItWithout": "The TV refused it. Without root, apps are not allowed to do this",
  "failure.theHomebrewChannelServiceDid": "The Homebrew Channel service did not answer in time. It may still be starting, so try again in a moment",
  "failure.theTvReportedDetail": "The TV reported: {detail}",
  "failure.theCommandDidNotWork": "The command did not work",
  "homeapp.notRunningOnATv": "not running on a TV",
  "homeapp.theTvDidNotAnswer": "the TV did not answer",
  "homeengine.thisOnlyWorksOnA": "This only works on a TV.",
  "homeengine.startTheKeyEngine": "start the key engine",
  "homehook.notRunningOnATv": "not running on a TV",
  "samhome.hearthIsInLg": "Hearth is in LG Home's place",
  "samhome.thisTvNeedsSam": "This TV can only do it by restarting its app manager, which was not allowed",
  "samhome.stillWorkingOnIt": "Still starting up. Try again in a minute",
  "samhome.couldnTSetThat": "Couldn't set that up{detail}",
  "homehook.theHomebrewServiceDidNot": "the Homebrew service did not answer",
  "homekey.theButtonSettingsFileHook": "The button settings file ({HOOK_CONFIG}) can't be read as JSON, so Hearth leaves it alone. Fix or delete it, or open the Input Hook app.",
  "homekey.thereAreTooManyButton": "There are too many button settings to save safely from here. Edit the file by hand.",
  "homekey.theKeepaliveScriptCouldNot": "the keepAlive script could not be written",
  "homekey.readingTheFileBackDid": "reading the file back did not show the change",
  "homekey.changeTheButtonSettings": "change the button settings",
  "homekey.thatIsNotAButton": "That is not a button number.",
  "homekey.buttonV1IsNeededTo": "Button {v1} is needed to move around Hearth, so it can't be used.",
  "homekey.savedButReadingTheFile": "Saved, but reading the file back did not show the change. Try again, or look at {HOOK_CONFIG}.",
  "homekey.buttonV1NowOpensHearth": "Button {v1} now opens Hearth.",
  "homekey.noButtonOpensHearthNow": "No button opens Hearth now.",
  "homekey.savedButReadingTheFile2": "Saved, but reading the file back still shows Hearth on a button. Look at {HOOK_CONFIG}.",
  "homekey.removedTheHomeButtonWorks": "Removed. The Home button works as LG made it.",
  "homekeycore.opensHearth": "opens Hearth",
  "homekeycore.opensId": "opens {id}",
  "homekeycore.actsAsButtonKeycode": "acts as button {keycode}",
  "homekeycore.isSwitchedOff": "is switched off",
  "homekeycore.runsACommand": "runs a command",
  "homekeycore.opensLgHome": "opens LG Home",
  "inputs.launcher": "Launcher",
  "keepready.notRunningOnATv": "not running on a TV",
  "keepready.theTvDidNotConfirm": "the TV did not confirm",
  "keepready.noAnswer": "no answer",
  "keepready.turnOnKeepHearthReady": "turn on Keep Hearth ready ({name})",
  "langpack.theFileIsNotValid": "The file is not valid JSON",
  "langpack.theFileMustHoldOne": "The file must hold one JSON object",
  "langpack.theFileHasNoText": "The file has no text that matches the English keys",
  "langpack.theFileNameCannotBe": "The file name cannot be used",
  "langpack.theFileIsGone": "The file is gone",
  "langpack.theFileIsTooBig": "The file is too big (over {v1} KB)",
  "langpack.theFileIsEmptyOr": "The file is empty or cannot be read",
  "langpack.theLanguageFileCouldNot": "The language file could not be saved",
  "langpack.lengthTexts": "{length} texts",
  "langpack.missingStillInEnglish": ", {missing} still in English",
  "langpack.theTvDidNotAnswer": "The TV did not answer: ",
  "langpack.noAnswer": "no answer",
  "poweron.noAnswer": "no answer",
  "poweron.notRunningOnATv": "not running on a TV",
  "poweron.theTvDidNotAnswer": "the TV did not answer",
  "poweron.theTvDidNotKeep": "the TV did not keep it",
  "remap.theHomebrewServiceDidNot": "the Homebrew service did not answer",
  "screensaver.notRunningOnATv": "not running on a TV",
  "screensaver.theHomebrewServiceDidNot": "the Homebrew service did not answer",
  "sourceicons.otherInput": "Other input",
  "theme.theFileNameCannotBe": "The file name cannot be used",
  "theme.thisTvHasNoUnzip": "This TV has no unzip tool (neither unzip nor busybox unzip was found)",
  "theme.theFileIsGone": "The file is gone",
  "theme.theFileIsNotA": "The file is not a readable zip",
  "theme.theZipCouldNotBe": "The zip could not be extracted",
  "theme.manifestJsonIsTooBig": "manifest.json is too big",
  "theme.theThemeCouldNotBe": "The theme could not be checked",
  "theme.theThemeCouldNotBe2": "The theme could not be kept on the TV",
  "theme.theTvDidNotAnswer": "The TV did not answer: ",
  "theme.noAnswer": "no answer",
  "theme.theThemeCouldNotBe3": "The theme could not be saved",
  "theme.noThemeIsLoaded": "No theme is loaded",
  "theme.thatSavedThemeIsGone": "That saved theme is gone",
  "theme.theSavedThemeCouldNot": "The saved theme could not be brought back on the TV",
  "themeapply.appsOfTheThemeAre": "apps of the theme are not on this TV",
  "themeapply.appsOnThisTvAre": "apps on this TV are not in the theme",
  "themeapply.iconsOfTheThemeAre": "icons of the theme are for apps not on this TV",
  "themeapply.appsOnThisTvHave": "apps on this TV have no icon in the theme",
  "themeexport.theFileWasNotWritten": "The file was not written completely",
  "themeexport.couldNotWriteBasePath": "Could not write {BASE_PATH}: {v2}",
  "themefile.manifestJsonIsNotValid": "manifest.json is not valid JSON",
  "themefile.manifestJsonIsMissing": "manifest.json is missing",
  "themefile.manifestJsonIsTooBig": "manifest.json is too big",
  "themefile.manifestJsonMustHoldOne": "manifest.json must hold one object",
  "themefile.unknownPartKInManifest": 'Unknown part "{k}" in manifest.json',
  "themefile.themeFormatFormatIsNot": "Theme format {format} is not supported (this Hearth reads format {THEME_FORMAT})",
  "themefile.manifestJsonHasNoFormat": 'manifest.json has no "format" number',
  "themefile.theThemeNeedsAName": 'The theme needs a "name"',
  "themefile.whatTheFileNameIs": "{what}: the file name is missing or not allowed",
  "themefile.whatTheFileFileIs": '{what}: the file "{file}" is not in the zip',
  "themefile.whatFileMustBeV3": '{what}: "{file}" must be {v3}',
  "themefile.keyMustBeAnObject": '"{key}" must be an object',
  "themefile.keyMustBeAList": '"{key}" must be a list',
  "themefile.unknownEntryKInKey": 'Unknown entry "{k}" in "{key}"',
  "themefile.colorsThemeMustBeOne": "colors.theme must be one of {v1}",
  "themefile.colorsKMustBeTheme": 'colors.{k} must be "theme" (follow the theme) or one of {v2}',
  "themefile.colorsWidgetinkMustBeA": 'colors.widgetInk must be a colour of six hex digits, for example "#FFE9C7"',
  "themefile.colorsGiveEitherWidgetOr": 'colors: give either "widget" or "widgetInk", not both',
  "themefile.fontsFilesMustBeA": "fonts.files must be a list",
  "themefile.wMustBeAnObject": "{w} must be an object",
  "themefile.wIdMustBe1": '{w}: "id" must be 1-32 lower-case letters, digits or dashes',
  "themefile.wTheIdIdIs": '{w}: the id "{id}" is used by a built-in font',
  "themefile.wTheIdIdIs2": '{w}: the id "{id}" is used twice',
  "themefile.fontsKeyMustBeA": "fonts.{key} must be a built-in font or one of the theme's own font ids",
  "themefile.iconstyleStyleMustBeOne": "iconStyle.style must be one of {v1}",
  "themefile.iconstyleTileMustBeDark": 'iconStyle.tile must be "dark" or "light"',
  "themefile.wallpaperNeedsExactlyOneOf": 'wallpaper needs exactly one of "file" or "folder"',
  "themefile.wallpaperIntervalsecAndShuffleBelong": 'wallpaper: "intervalSec" and "shuffle" belong to a "folder"',
  "themefile.wallpaperFolderTheFolderName": "wallpaper.folder: the folder name is missing or not allowed",
  "themefile.wallpaperFolderDirHoldsNo": 'wallpaper.folder: "{dir}" holds no png or jpg picture',
  "themefile.wallpaperIntervalsecMustBeA": "wallpaper.intervalSec must be a whole number of seconds, {THEME_WALLPAPER_MIN_SEC} to {THEME_WALLPAPER_MAX_SEC}",
  "themefile.wallpaperShuffleMustBeTrue": "wallpaper.shuffle must be true or false",
  "themefile.wAppTheAppId": '{w}: "app" (the app id) is missing',
  "themefile.wTheAppAppHas": '{w}: the app "{app}" has two icons',
  "themefile.wIdTheAppId": '{w}: "id" (the app id) is missing',
  "themefile.wTheAppIdIs": '{w}: the app "{id}" is listed twice',
  "themefile.wNameMustBeText": '{w}: "name" must be text',
  "themefile.wNameIsMissing": '{w}: "name" is missing',
  "themefile.wLat9090And": '{w}: "lat" (-90..90) and "lon" (-180..180) must be numbers',
  "tiles.notConnected": "Not connected",
  "tvinput.appidAppIdPigimageMvpdicon": '{"appId":"{APP_ID}","pigImage":"","mvpdIcon":"","label":"Hearth","description":"Hearth home screen"}',
  "uninstall.thatAppSIdCan": "That app's ID can't be used",
  "uninstall.systemAppsCanTBe": "System apps can't be uninstalled",
  "uninstall.theTvSaysThisApp": "The TV says this app cannot be removed",
  "uninstall.thisDoesnTLookLike": "This doesn't look like an app you installed",
  "wallpaper.usbDriveV1": "USB drive {v1}",
  "wallpaper.usbDrive": "USB drive",
  "wallpaper.thatFileNameCanT": "That file name can't be used",
  "wallpaper.thePictureTookTooLong": "The picture took too long to open",
  "wallpaper.thatPictureIsMegapixelsMegapixels": "That picture is {megapixels} megapixels; the limit is {v2}",
  "wallpaper.theTvCouldnTOpen": "The TV couldn't open that picture. Use JPG or PNG",
  "wallpaper.wallpapers": "Wallpapers",
  "wallpaper.holiday2025": "Holiday 2025",
  "weather.clear": "Clear",
  "weather.mostlyClear": "Mostly clear",
  "weather.partlyCloudy": "Partly cloudy",
  "weather.overcast": "Overcast",
  "weather.fog": "Fog",
  "weather.drizzle": "Drizzle",
  "weather.freezingDrizzle": "Freezing drizzle",
  "weather.lightRain": "Light rain",
  "weather.rain": "Rain",
  "weather.heavyRain": "Heavy rain",
  "weather.freezingRain": "Freezing rain",
  "weather.lightSnow": "Light snow",
  "weather.snow": "Snow",
  "weather.heavySnow": "Heavy snow",
  "weather.snowGrains": "Snow grains",
  "weather.lightShowers": "Light showers",
  "weather.showers": "Showers",
  "weather.heavyShowers": "Heavy showers",
  "weather.snowShowers": "Snow showers",
  "weather.thunderstorm": "Thunderstorm",
  "weather.thunderstormHail": "Thunderstorm, hail",
  "weather.cloudy": "Cloudy",
  "citypicker.okChoosesACityBack": "OK chooses a city \xB7 Back returns to settings",
  "citypicker.popularCities": "Popular cities",
  "citypicker.searchResults": "Search results",
  "extrakeys.opensV1": "Opens {v1}",
  "extrakeys.saving": "Saving\u2026",
  "extrakeys.givingTheButtonBack": "Giving the button back\u2026",
  "extrakeys.buttonV1": "Button {v1}",
  "extrakeys.okGivesTheButtonThis": "OK gives the button this job \xB7 \u2190 \u2192 jump a page \xB7 Back goes back",
  "extrakeys.moveOkChoosesBackReturns": "\u2191 \u2193 move \xB7 OK chooses \xB7 Back returns to the list",
  "extrakeys.moveOkChoosesBackReturns2": "\u2191 \u2193 move \xB7 OK chooses \xB7 Back returns to settings",
  "extrakeys.thisOnlyWorksOnA": "This only works on a TV.",
  "extrakeys.buttonsHearthSetUpUse": "Buttons Hearth set up use the same key hook as the Home button. Other buttons of yours are left alone.",
  "homekey.readTheKeyEngine": "read the key engine",
  "homekey.listenForButtons": "listen for buttons",
  "homekey.startTheKeyEngine": "start the key engine",
  "homekey.settingButtonV1": "Setting button {v1}\u2026",
  "homekey.textPressItOnThe": "{text} Press it on the remote now: Hearth should open. If LG Home opens instead, restart the TV once.",
  "homekey.removingTheMapping": "Removing the mapping\u2026",
  "homekey.notUsableThisButtonIs": "Not usable: this button is needed to move around Hearth",
  "homekey.hearthOpensFromThisButton": "Hearth opens from this button now",
  "homekey.thisButtonAlreadyV1Choosing": "This button already {v1}. Choosing it replaces that",
  "homekey.thisOnlyWorksOnA": "This only works on a TV.",
  "homekey.startingTheKeyEngine": "Starting the key engine\u2026",
  "homekey.keyEngineRunning": "Key engine running{inputHook}.",
  "homekey.theInputHookAppIs": " (the Input Hook app is installed too; both use the same settings file)",
  "homekey.theKeyEngineIsNot": "The key engine is not confirmed running. A button saved here may need a restart of the TV to work.",
  "homekey.homeButtonButtonOpens": "Home button: button {button} opens Hearth.",
  "homekey.homeButtonNotMappedYet": "Home button: not mapped yet.",
  "homekey.autoBlocked": "Button {keyLabel} is already used by another app ({describeBind}), so Hearth left it alone.",
  "homekey.notListeningNowBecauseA": 'Not listening now, because a button is set. Choose "Listen for buttons again", or open this setting again, to look for another one.',
  "homekey.startingToListenForButton": "Starting to listen for button presses\u2026",
  "homekey.notListeningYet": 'Not listening yet. Choose "Listen for the Home button" below, or pick one of the known codes.',
  "homekey.pluralSuffix": "s",
  "homekey.minutesEnd": " minutes).",
  "homekey.detectingLengthButtonV2Seen": "Detecting: {length} button{v2} seen since you started. Press the Home button if it is not listed.",
  "homekey.listeningHasEndedAndNothing": 'Listening has ended and nothing was seen. Choose "Forget what was detected and start again", or pick one of the known Home codes below.',
  "homekey.detectingPressTheHomeButton": "Detecting: press the Home button on your remote now. If the TV leaves Hearth, open Hearth and this screen again (it remembers for ",
  "homekey.itSeemsTheInputHook": "It seems the Input Hook app is active here and button settings already exist:",
  "homekey.buttonSettingsLeftFromThe": "Button settings left from the Input Hook app were found, and Hearth's key engine would make them work again:",
  "homekey.theHookIsAlreadyRunning": "The hook is already running with these settings.",
  "homekey.hearthAddsOneEntryOf": "Hearth adds one entry of its own and leaves the others alone, but these buttons are in use.",
  "homekey.areYouSureYouWant": "Are you sure you want to proceed?",
  "homekey.buttonSettingsAlreadyExist": "Button settings already exist",
  "homekey.homeButtonOpensHearth": "Home button opens Hearth",
  "homekey.makeButtonV1OpenHearth": "Make button {v1} open Hearth?",
  "homekey.afterYouSayYesPress": "After you say Yes, press that button on the remote: Hearth should open straight away.",
  "homekey.ifLgHomeOpensInstead": "If LG Home opens instead, restart the TV once or come back and try another code.",
  "homekey.savedInHookConfigOnly": "Saved in {HOOK_CONFIG}. Only Hearth's own entry is added or removed; other buttons are left alone.",
  "homekey.okChoosesBackGoesBack": "OK chooses \xB7 Back goes back",
  "homekey.moveOkChoosesBackReturns": "\u2191 \u2193 move \xB7 OK chooses \xB7 Back returns to settings",
  "picker.readTheStorage": "read the storage",
  "picker.couldnTReadThisFolder": "Couldn't read this folder{v1}",
  "picker.loadATheme": "Load a theme",
  "picker.chooseAPictureForThe": "Choose a picture for the icon",
  "picker.chooseScreenSaverPictures": "Choose screen saver file or folder",
  "picker.chooseWallpaper": "Choose wallpaper",
  "picker.loadingTheTheme": "Loading the theme\u2026",
  "picker.pickWhereTheThemeFile": "Pick where the theme file is \xB7 Back returns to settings",
  "picker.okOpensAFolderOr": "OK opens a folder or loads a theme \xB7 Back goes up",
  "picker.locations": "Locations",
  "poweronpicker.whenYouSwitchItOn": "When you switch it on, also from a phone or Home Assistant. HDMI-CEC still goes where it asks",
  "poweronpicker.onlyWhenYouSwitchIt": "Only when you switch it on yourself: casting and HDMI-CEC still go where they ask",
  "preload.readTheTvSPreload": "read the TV's preload list",
  "preload.aboutMemorymbMbWhenLoaded": "about {memoryMb} MB when loaded",
  "preload.memoryUseNotKnown": "memory use not known",
  "preload.nothingIsClosedAnApp": "Nothing is closed: an app that is loaded now stays until the TV unloads it. The choice lasts across restarts.",
  "recents.couldnTReadTheRecent": "Couldn't read the recent apps",
  "recents.recentAppsWorksOnThe": "Recent apps works on the TV, with the Homebrew Channel",
  "recents.noRecentApps": "No recent apps",
  "recents.closing": "Closing\u2026",
  "recents.okClosesAllAppsBack": "OK closes all \xB7 \u2193 apps \xB7 Back returns",
  "recents.okOpenHoldOkClose": "OK open \xB7 Hold OK close \xB7 \u2191 Close all",
  "remotebuttons.switchesToLabel": "Switches to {label}",
  "remotebuttons.opensV1": "Opens {v1}",
  "remotebuttons.keyWebosRed": "Key_webOS_Red",
  "remotebuttons.keyWebosGreen": "Key_webOS_Green",
  "remotebuttons.keyWebosYellow": "Key_webOS_Yellow",
  "remotebuttons.keyWebosBlue": "Key_webOS_Blue",
  "remotebuttons.v1Button": "{v1} button",
  "remotebuttons.reassignRemoteButtons": "Reassign remote buttons",
  "remotebuttons.okGivesTheButtonThis": "OK gives the button this job \xB7 \u2190 \u2192 jump a page \xB7 Back keeps it as it is",
  "remotebuttons.pressTheButtonYouWant": "Press the button you want to reassign \xB7 Back cancels",
  "remotebuttons.okChoosesWhatAButton": "OK chooses what a button does \xB7 Back returns to settings",
  "remotebuttons.chooseWhatItDoes": "Choose what it does",
  "remotebuttons.waitingForAButton": "Waiting for a button",
  "remotebuttons.buttons": "Buttons",
  "settings.photographThePageChangePage": "Photograph the page \xB7 \u2191 \u2193 change page \xB7 Back returns home",
  "settings.mostUsedOn": "Most used: On",
  "settings.mostUsedOff": "Most used: Off",
  "sourceeditor.theAppS": "the app's",
  "sourceeditor.theTvS": "the TV's",
  "sourceeditor.yourPicture": "Your picture",
  "sourceeditor.theAppSOwnIcon": "The app's own icon",
  "sourceeditor.ownIcon": "  ({own} icon)",
  "sourceeditor.okOrBackWhenYou": "OK or Back when you are done \xB7 the home row shows the change at once",
  "sourceicons.hdmiPort": "HDMI port",
  "sourceicons.tv": "TV",
  "sourceicons.gameConsole": "Game console",
  "sourceicons.gameController": "Game controller",
  "sourceicons.desktopPc": "Desktop PC",
  "sourceicons.laptop": "Laptop",
  "sourceicons.tvBoxStick": "TV box / stick",
  "sourceicons.cableSatelliteBox": "Cable / satellite box",
  "sourceicons.discPlayer": "Disc player",
  "sourceicons.soundbarSpeaker": "Soundbar / speaker",
  "sourceicons.antenna": "Antenna",
  "sourceicons.phoneTablet": "Phone / tablet",
  "sourceicons.camera": "Camera",
  "sourceicons.usb": "USB",
  "sourceicons.cableBox": "Cable box",
  "sourceicons.soundbar": "Soundbar",
  "picker.warningHighPowerConsumption": "WARNING: HIGH POWER CONSUMPTION",
  "picker.animatedGifsVideosAndFast": "ANIMATED GIFS, VIDEOS AND FAST SLIDESHOWS KEEP THE TV BUSY AND USE MORE POWER THAN A STILL PICTURE OR LG'S OWN SCREEN SAVER.",
  "picker.forTheLowestPowerUse": "FOR THE LOWEST POWER USE CHOOSE ONE DARK STILL PICTURE, AND SET A SHORT IDLE TIME IN THE TV'S OWN SETTINGS.",
  "picker.putYourOwnPicturesGifs": "Put your own pictures, GIFs and videos in /media/developer/screensavers (the Screen savers folder row below), or plug in a USB drive.",
  "picker.aThemeIsAZip": "A theme is a .zip file (colours, fonts, icon style, icons, app list, cities). A wrong file changes nothing and shows the reason.",
  "picker.veryHeavyFontsOrIcons": "Very heavy fonts or icons slow Hearth down: the smaller the files, the faster it starts.",
  "picker.putThemeFilesInMedia": "Put theme files in /media/developer/themes (the Themes folder row below), or plug in a USB drive and browse it here.",
  "picker.overSshFromAComputer": "Over SSH, from a computer:  scp photo.jpg root@<TV address>:/media/developer/wallpapers/   (if scp fails, try scp -O)",
  "picker.withWebosDevManagerConnect": "With webOS Dev Manager: connect to the TV and use its file or terminal option to copy into /media/developer/wallpapers.",
  "picker.tvAddressIsTheIp": `<TV address> is the "IP:" number at the bottom right of Settings, or in the TV's network settings.`,
  "picker.toUseYourOwnPictures": "To use your own pictures, put them in /media/developer/wallpapers (the Wallpapers folder row below), or plug in a USB drive.",
  "picker.recommendedSize1920x1080AGood": "Recommended size: 1920x1080, a good balance of quality and speed. Please resize your wallpapers for better performance.",
  "picker.bigPicturesSlowDownThe": "Big pictures slow down the launcher when it loads them: the smaller the file, the faster it starts.",
  "picker.pickWhereYourPicturesAre": "Pick where your pictures are \xB7 Back returns to settings",
  "settings.okAddsOrRemovesAn": "OK adds or removes an item \xB7 Hold OK to edit its name and icon \xB7 Back returns home",
  "settings.okMarksOrUnmarksA": "OK marks or unmarks a favourite \xB7 Back or Done finishes",
  "settings.testsLeaveHint": "OK runs a test. Press Back or Home to leave the Tests tab.",
  "settings.homeLeaveHint": "Home twice or Back leaves Settings",
  "settings.okChangesASettingAdjust": "OK changes a setting \xB7 \u2190 \u2192 adjust numbers \xB7 Back returns home",
  "picker.hardLimitMbMbAnd": "Hard limit: {mb} MB and {mp} megapixels per picture (a 4K picture is about 8 megapixels). Pictures over the limit are skipped in a slideshow, and refused as a single wallpaper.",
  "wallpaper.internalStorage": "Internal storage",
  "wallpaper.wallpapersFolder": "Wallpapers folder",
  "wallpaper.screenSaversFolder": "Screen savers folder",
  "uninstall.thisIsTheLauncherItself": "This is the launcher itself",
  "uninstall.lgHomeIsPartOfThe": "LG Home is part of the TV",
  "uninstall.theLauncherNeedsTheHomebrew": "The launcher needs the Homebrew Channel to run its commands",
  "inputs.liveTv": "Live TV",
  "clock.day0": "Sunday",
  "clock.day1": "Monday",
  "clock.day2": "Tuesday",
  "clock.day3": "Wednesday",
  "clock.day4": "Thursday",
  "clock.day5": "Friday",
  "clock.day6": "Saturday",
  "clock.month0": "January",
  "clock.month1": "February",
  "clock.month2": "March",
  "clock.month3": "April",
  "clock.month4": "May",
  "clock.month5": "June",
  "clock.month6": "July",
  "clock.month7": "August",
  "clock.month8": "September",
  "clock.month9": "October",
  "clock.month10": "November",
  "clock.month11": "December",
  "extrakeys.couldnTPutTheActionScript": "Couldn't put the action script on the TV. Nothing was changed",
  "extrakeys.openAnApp": "Open an app",
  "extrakeys.countChoices": "{n} to choose from",
  "extrakeys.switchInputSource": "Switch input / source",
  "extrakeys.theTvOffersNInputs": "The TV offers {n} inputs (HDMI, Live TV...)",
  "extrakeys.noInputsWereFound": "No inputs were found",
  "extrakeys.actAsAnotherButton": "Act as another button",
  "extrakeys.volumeMuteChannelPlay": "Volume, channel, play, pause, info, guide...",
  "extrakeys.runATvAction": "Run a TV action",
  "extrakeys.systemSettingsScreenOffPicture": "System settings, screen off, picture settings, standby...",
  "extrakeys.okGoesBack": "OK goes back",
  "maptargets.likeThatButton": "Works like that button",
  "maptargets.likeThatButtonUntested": "Works like that button (experimental)",
  "maptargets.systemSettings": "System settings",
  "maptargets.opensTheTvSNormal": "Opens the TV's normal Settings page",
  "maptargets.untested": "experimental",
  "app.reassignRemoteButtonsWasRemoved": "Reassign remote buttons was removed",
  "app.nButtonsSetWithItAre": "{n} buttons set with it are back to the TV's own action. Map them again in System > Map additional keys. The old list is kept inside Hearth.",
  "keyact.screenoff.label": "Screen off",
  "keyact.screenoff.detail": "Sound goes on, any button brings the picture back",
  "keyact.standby.label": "Switch the TV off",
  "keyact.standby.detail": "Standby, like the power button",
  "keyact.saver.label": "Start the screen saver",
  "keyact.saver.detail": "The TV's screen saver now (Hearth's when it is on)",
  "keyact.energy.label": "Energy saving: next level",
  "keyact.energy.detail": "Off, minimum, medium, maximum, off...",
  "keyact.backlightup.label": "Backlight / OLED light: up",
  "keyact.backlightup.detail": "Ten points brighter",
  "keyact.backlightdown.label": "Backlight / OLED light: down",
  "keyact.backlightdown.detail": "Ten points darker",
  "keyact.picturemode.label": "Picture mode: next",
  "keyact.picturemode.detail": "Standard, cinema, game, vivid, sports, eco",
  "keyact.eyecomfort.label": "Eye comfort: on or off",
  "keyact.eyecomfort.detail": "A warmer picture for the evening",
  "keyact.tonemap.label": "Tone mapping: on or off",
  "keyact.tonemap.detail": "Not offered by every TV",
  "keyact.reboot.label": "Restart the TV",
  "keyact.reboot.detail": "Switches off and on again, takes about a minute",
  "keytarget.115": "Volume up",
  "keytarget.114": "Volume down",
  "keytarget.402": "Channel up",
  "keytarget.403": "Channel down",
  "keytarget.164": "Play / pause",
  "keytarget.207": "Play",
  "keytarget.119": "Pause",
  "keytarget.128": "Stop",
  "keytarget.168": "Rewind",
  "keytarget.208": "Fast forward",
  "keytarget.358": "Info",
  "keytarget.365": "Guide",
  "keytarget.370": "Subtitles",
  // ----- local build: this fork's own strings (English only; other languages fall back to English) -----
  // Continue Watching (Plex)
  "pref.continueWatching.label": "Show Continue Watching",
  "pref.continueWatching.desc": "What you are part-way through on Plex, above the apps. OK plays it, holding OK opens its page.",
  "pref.plexAccount.label": "Plex account",
  "pref.plexAccount.desc": "Sign in with a code at plex.tv/link (nothing to type on the TV). OK again signs out.",
  "pref.plexSignedIn": "Signed in \xB7 {server}",
  "pref.plexNotSignedIn": "Not signed in",
  "group.Plex": "Plex",
  "home.continueWatching": "Continue Watching",
  "app.plexSignedOut": "Signed out of Plex",
  "app.plexSignedIn": "Signed in. Continue Watching comes from {server}",
  "app.couldNotOpenPlex": "Couldn't open Plex",
  "plexLink.title": "Sign in to Plex",
  "plexLink.howTo": "On your phone or computer, go to {url} and enter this code.",
  "plexLink.gettingCode": "Getting a code\u2026",
  "plexLink.waiting": "Waiting for you to sign in\u2026",
  "plexLink.findingServer": "Signed in. Finding your Plex server\u2026",
  "plexLink.noServer": "Couldn't find a Plex server",
  "plexLink.retrying": "Couldn't reach plex.tv. Trying again\u2026",
  "plexLink.backCancels": "Back cancels.",
  "plex.signInExpired": "Plex sign-in expired",
  "plex.answered": "Plex answered {status}",
  "plex.unreachable": "Could not reach Plex",
  "plex.tooSlow": "Plex took too long to answer",
  "plex.noAddress": "{name} has no address",
  "plex.cantReachServer": "Could not reach {name}",
  "plex.noServer": "No Plex server is linked to this account",
  "plex.notSignedIn": "Not signed in to Plex",
  "plex.minutes": "{m}m",
  "plex.hoursMinutes": "{h}h {m}m",
  "plex.timeLeft": "{time} left",
  "plex.special": "Special {n}",
  "plex.episode": "S{season} \xB7 E{episode}",
  // moving backgrounds (video wallpapers) and the wallpaper picker
  "pref.videoChange.label": "Change video",
  "pref.videoChange.desc": "When the next video from the folder starts. Each time you come Home counts only after 5 minutes away.",
  "pref.videoShade.label": "Shade for moving backgrounds",
  "pref.videoShade.desc": "A soft dark glow behind the clock and a deeper fade behind the apps, so text stays easy to read over moving pictures.",
  "pref.moving": "Moving: {name}",
  "video.everyIn": "every video in {name}",
  "video.never": "Never",
  "video.onHome": "Each time you come Home",
  "video.every": "Every {time}",
  "video.folder": "Moving backgrounds folder",
  "video.videos": "videos (.mp4, .webm, .mov)",
  "video.playFolder": "Play every video in this folder as a moving background",
  "video.oneIn": "One video in {name}",
  "video.countIn": "{count} videos in {name} \xB7 change and shuffle in Settings",
  "video.movingBackground": "Moving background",
  "video.noneInFolder": "No videos found in that folder",
  "video.noneCanPlay": "None of the videos in that folder can be played",
  "video.missing": "Couldn't find the video {name}",
  "video.cantPlay": "The TV couldn't play {name}; the still wallpaper is shown instead",
  "video.cantRead": "Couldn't read the videos folder",
  "app.startingMovingBackground": "Starting the moving background\u2026",
  "picker.wallRootsHint": "Move to preview \xB7 OK chooses \xB7 Back returns to Settings",
  "picker.wallFolderHint": "Move to preview \xB7 OK chooses \xB7 Back goes up",
  // quiet mode: dim style
  "pref.quietFade.label": "Quiet mode: dim style",
  "pref.quietFade.desc": "Darken dims the whole screen. Fade the widgets keeps the wallpaper bright, dims the clock and hides the date and weather.",
  "pref.quietFade.darken": "Darken",
  "pref.quietFade.fade": "Fade the widgets"
};

// src/i18n/index.ts
var table = en;
function fill(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, name) => vars[name] !== void 0 ? String(vars[name]) : m);
}
function t(key, vars) {
  return fill(table[key] !== void 0 ? table[key] : en[key], vars);
}
function td(key, vars) {
  const own = table[key] !== void 0 ? table[key] : en[key];
  return fill(own !== void 0 ? own : key, vars);
}

// src/lib/failure.ts
function classifyFailure(error) {
  const text = String(error && error.message ? error.message : error || "");
  if (/not running on webos/i.test(text)) return "not-webos";
  if (/timed out/i.test(text)) return "timeout";
  if (/does not exist|not exist|unknown service|not registered|no such service|service .*not (found|running|available)/i.test(text)) return "no-service";
  if (/denied|permission|not allowed|not authori[sz]ed|forbidden/i.test(text)) return "denied";
  return "failed";
}
var state = "unknown";
var lastKind = null;
var lastDetail = "";
function noteExec(error) {
  if (error === void 0) {
    state = "yes";
    lastKind = null;
    lastDetail = "";
    return;
  }
  const kind = classifyFailure(error);
  lastKind = kind;
  lastDetail = String(error && error.message ? error.message : "").slice(0, 80);
  if (kind === "no-service" || kind === "denied") state = "no";
  else if (kind === "failed") state = "yes";
}

// src/lib/log.ts
var MAX_LINES = 40;
var MAX_CHARS = 110;
var ALL_LINES = 400;
var ALL_CHARS = 1e3;
var lines = [];
var all = [];
var listeners = [];
function onLog(fn) {
  listeners.push(fn);
}
function pad(n) {
  return n < 10 ? "0" + n : String(n);
}
function log(text, now = /* @__PURE__ */ new Date()) {
  const clean2 = text.replace(/[\r\n\t]+/g, " ").trim();
  const stamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const whole = `${stamp} ${clean2}`.slice(0, ALL_CHARS);
  all.push(whole);
  if (all.length > ALL_LINES) all.shift();
  lines.push(whole.slice(0, MAX_CHARS));
  listeners.forEach((fn) => fn(whole));
  if (lines.length > MAX_LINES) lines.shift();
}
function allLogLines() {
  return all.slice();
}
function logLines() {
  return lines.slice();
}
function clearLog() {
  lines.length = 0;
  all.length = 0;
}

// src/lib/apps.ts
function exec(command, timeoutMs = 8e3) {
  if (NOROOT_MOCK) {
    const e = new Error("Service does not exist: org.webosbrew.hbchannel.service (mock non-root build)");
    noteExec(e);
    return Promise.reject(e);
  }
  return lunaCall(LUNA.homebrewExec, { command }, timeoutMs).then(
    (r) => {
      noteExec();
      return r.stdoutString || "";
    },
    (error) => {
      noteExec(error);
      throw error;
    }
  );
}

// src/lib/about.ts
function readVersions() {
  return lunaCall("luna://com.webos.service.tv.systemproperty/getSystemInfo", { keys: ["firmwareVersion", "sdkVersion"] }, 4e3).then(
    (r) => ({ webos: clean(r.sdkVersion), firmware: clean(r.firmwareVersion) }),
    () => ({})
  );
}
function readIp() {
  return lunaCall("luna://com.webos.service.connectionmanager/getStatus", {}, 4e3).then(
    (r) => {
      const wired = r.wired || {};
      const wifi = r.wifi || {};
      const pick = wired.state === "connected" && wired.ipAddress ? wired.ipAddress : wifi.state === "connected" && wifi.ipAddress ? wifi.ipAddress : wired.ipAddress || wifi.ipAddress;
      return typeof pick === "string" && /^[0-9.]{7,15}$/.test(pick) && pick !== "0.0.0.0" ? pick : void 0;
    },
    () => void 0
  );
}
function readHomebrewVersion() {
  return exec(`luna-send -n 1 luna://com.webos.applicationManager/getAppInfo '{"id":"org.webosbrew.hbchannel"}'`, 5e3).then(
    (out) => {
      try {
        return clean((JSON.parse(out).appInfo || {}).version);
      } catch {
        return void 0;
      }
    },
    () => void 0
  );
}
function clean(value) {
  return typeof value === "string" && /^[A-Za-z0-9._ -]{1,40}$/.test(value.trim()) ? value.trim() : void 0;
}
function rootNote(kind) {
  switch (kind) {
    case "denied":
      return t("about.theTvRefusedTheCommand");
    case "no-service":
      return t("about.homebrewChannelServiceNotFound");
    case "timeout":
      return t("about.theHomebrewChannelDidNot");
    case "not-webos":
      return t("about.notRunningOnATv");
    default:
      return t("about.theCommandFailed");
  }
}
function aboutText(v, root, kind, hearth = HEARTH_VERSION) {
  const parts = [`Hearth ${hearth}`];
  if (v.webos) parts.push(`webOS ${v.webos}`);
  if (v.firmware) parts.push(`firmware ${v.firmware}`);
  if (v.homebrew) parts.push(`Homebrew ${v.homebrew}`);
  if (v.ip) parts.push(`IP: ${v.ip}`);
  parts.push(root === "yes" ? "Root: yes" : root === "no" ? `Root: not available (${rootNote(kind)})` : "Root: checking\u2026");
  return parts.join("  \xB7  ");
}

// src/lib/apporder.ts
function visibleApps(apps, order, hidden) {
  const byId = {};
  apps.forEach((a) => {
    byId[a.id] = a;
  });
  if (hidden === null) {
    return order ? order.filter((id) => byId[id]).map((id) => byId[id]) : apps;
  }
  const isHidden = {};
  hidden.forEach((id) => {
    isHidden[id] = true;
  });
  const placed = {};
  const ordered = [];
  (order || []).forEach((id) => {
    if (byId[id] && !isHidden[id] && !placed[id]) {
      ordered.push(byId[id]);
      placed[id] = true;
    }
  });
  return ordered.concat(apps.filter((a) => !placed[a.id] && !isHidden[a.id]));
}
function hiddenAfterUpgrade(apps, order) {
  if (!order) return [];
  return apps.filter((a) => order.indexOf(a.id) === -1).map((a) => a.id);
}
function toggleHidden(hidden, id) {
  return hidden.indexOf(id) === -1 ? hidden.concat(id) : hidden.filter((x) => x !== id);
}
function extendOrder(apps, order) {
  if (apps.length === 0) return order;
  const known = {};
  (order || []).forEach((id) => {
    known[id] = true;
  });
  const added = apps.filter((a) => !known[a.id]).map((a) => a.id);
  if (added.length === 0 && order !== null) return order;
  return (order || []).concat(added);
}

// src/config/appicons.ts
var APP_ICONS = [
  { file: "youtube.leanback.v4.png", label: "YouTube" },
  { file: "amazon.png", label: "Prime Video" },
  { file: "com.apple.appletv.png", label: "Apple TV" },
  { file: "cdp-30.png", label: "Plex" },
  { file: "tv.twitch.tv.starshot.lg.png", label: "Twitch" },
  { file: "amazon.alexa.view.png", label: "Alexa" },
  { file: "bbc.iplayer.3.0.png", label: "BBC iPlayer" },
  { file: "bbc.sounds.1.0.png", label: "BBC Sounds" },
  { file: "com.fvp.itv.png", label: "ITVX" },
  { file: "com.fvp.ch4.png", label: "Channel 4" },
  { file: "demand5.png", label: "Channel 5" },
  { file: "com.fvp.uktv.png", label: "UKTV Play" },
  { file: "now.tv.png", label: "NOW" },
  { file: "com.lennylxx.iptv.png", label: "IPTV Player" },
  { file: "com.webos.app.browser.png", label: "Browser" },
  { file: "com.webos.app.homeconnect.png", label: "Home Dashboard" },
  { file: "com.webos.app.igallery.png", label: "Art Gallery" },
  { file: "com.webos.app.mediadiscovery.png", label: "Media Player" },
  { file: "com.webos.app.sportsteamsettings.png", label: "Sports" },
  { file: "org.webosbrew.hbchannel.png", label: "Homebrew" },
  { file: "org.webosbrew.inputhook.png", label: "Input Hook" },
  { file: "org.webosbrew.safeupdate.png", label: "HB Updater" }
];
var APP_ICON_PREFIX = "app:";
var APP_ICON_IDS = APP_ICONS.map((i) => APP_ICON_PREFIX + i.file);
var find = (id) => APP_ICONS.filter((i) => APP_ICON_PREFIX + i.file === id)[0];
var isAppIcon = (id) => !!find(id);
var appIconUrl = (id) => {
  const i = find(id);
  return i ? "icons/apps/" + i.file : "";
};

// src/lib/sourceicons.ts
var SOURCE_ICONS = [
  { id: "hdmi", get label() {
    return t("sourceicons.hdmiPort");
  }, path: "M4 7.5h16v6.2l-2.3 3.3H6.3L4 13.7zM8.5 11h7" },
  { id: "tv", get label() {
    return t("sourceicons.tv");
  }, path: "M3 5.5h18v11H3zM8.5 20h7M12 16.5V20" },
  { id: "console", get label() {
    return t("sourceicons.gameConsole");
  }, path: "M3.5 8.5h17v7.5h-17zM7 12.2h6.5M17 12.2h.01M9 19h6" },
  { id: "controller", get label() {
    return t("sourceicons.gameController");
  }, path: "M7 7.5h10a4 4 0 0 1 4 4v1.5a3 3 0 0 1-5.2 2L14.5 14h-5l-1.3 1A3 3 0 0 1 3 13v-1.5a4 4 0 0 1 4-4zM8 10v3M6.5 11.5h3M15.5 10.8h.01M17.5 12.6h.01" },
  { id: "desktop", get label() {
    return t("sourceicons.desktopPc");
  }, path: "M3.5 4.5h17v11h-17zM9 20h6M12 15.5V20" },
  { id: "laptop", get label() {
    return t("sourceicons.laptop");
  }, path: "M5.5 6h13v9h-13zM3 18.5h18l-1.2-3.5H4.2z" },
  { id: "tvbox", get label() {
    return t("sourceicons.tvBoxStick");
  }, path: "M4 9.5h16v6.5H4zM8 12.8h4M17 12.8h.01" },
  { id: "settop", get label() {
    return t("sourceicons.cableSatelliteBox");
  }, path: "M3.5 9h17v7h-17zM7 12.5h3M17 11.2h.01M17 13.8h.01" },
  { id: "disc", get label() {
    return t("sourceicons.discPlayer");
  }, path: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 10.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z" },
  { id: "speaker", get label() {
    return t("sourceicons.soundbarSpeaker");
  }, path: "M3 9.5h18v6H3zM7 12.5h.01M17 12.5h.01M10 12.5h4" },
  { id: "antenna", get label() {
    return t("sourceicons.antenna");
  }, path: "M12 12.5v8M8 20.5h8M7.5 9a6 6 0 0 1 9 0M4.7 6.5a10 10 0 0 1 14.6 0M12 12.5h.01" },
  { id: "phone", get label() {
    return t("sourceicons.phoneTablet");
  }, path: "M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5zM11 18h2" },
  { id: "camera", get label() {
    return t("sourceicons.camera");
  }, path: "M4 8h3.5l1.5-2h6l1.5 2H20v10.5H4zM12 10.3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
  { id: "usb", get label() {
    return t("sourceicons.usb");
  }, path: "M12 3.5v13M12 16.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 11l4-2.5v-2M12 13.5L8 11V9M15 4.5h2.5v2H15zM6.8 7h2.4v2H6.8z" },
  { id: "input", get label() {
    return t("sourceicons.otherInput");
  }, path: "M14 4.5h5.5v15H14M3.5 12h11M10.5 8l4 4-4 4" }
];
var SOURCE_ICON_IDS = SOURCE_ICONS.map((i) => i.id);
function suggestedNames() {
  return [
    "PlayStation 5",
    "PlayStation 4",
    "Xbox",
    "Nintendo Switch",
    "PC",
    t("sourceicons.laptop"),
    "Apple TV",
    "Fire TV",
    "Chromecast",
    "Roku",
    t("sourceicons.cableBox"),
    "Blu-ray",
    t("sourceicons.soundbar"),
    t("sourceicons.camera"),
    t("sourceicons.gameConsole")
  ];
}
var LG_ICON = {
  gameconsole: "console",
  pc: "desktop",
  settopbox: "settop",
  streamingbox: "tvbox",
  bluray: "disc",
  dvd: "disc",
  vcr: "disc",
  hometheater: "speaker",
  sound: "speaker",
  antenna: "antenna",
  satellite: "settop",
  mobile: "phone",
  camera: "camera",
  usb: "usb",
  "usb-port": "usb",
  tv: "tv",
  av: "input",
  component: "input",
  scart: "input",
  portaltv: "tvbox",
  screenshare: "phone",
  dlna: "input",
  mediaserver: "input",
  inputhub: "input"
};
function autoIcon(file) {
  const name = file.replace(/\.[a-z]+$/i, "").toLowerCase();
  return LG_ICON[name] || "hdmi";
}
var MAX_SOURCE_NAME = 24;
function cleanEdits(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  const src = raw;
  for (const key in src) {
    const e = src[key];
    if (!e || typeof e !== "object" || key.length > 80) continue;
    const label = typeof e.label === "string" ? e.label.trim().slice(0, MAX_SOURCE_NAME) : "";
    const icon = typeof e.icon === "string" && (SOURCE_ICON_IDS.indexOf(e.icon) !== -1 || isAppIcon(e.icon)) ? e.icon : "";
    const iconData = typeof e.iconData === "string" && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(e.iconData) && e.iconData.length <= 15e4 ? e.iconData : "";
    if (label || icon || iconData) out[key] = { ...label ? { label } : {}, ...icon ? { icon } : {}, ...iconData ? { iconData } : {} };
  }
  return out;
}
function setEdit(edits, key, patch) {
  const merged = { ...edits[key], ...patch };
  const next = { ...edits };
  delete next[key];
  return cleanEdits({ ...next, [key]: merged });
}
function iconPath(id) {
  const icon = SOURCE_ICONS.filter((i) => i.id === id)[0];
  return icon ? icon.path : SOURCE_ICONS[SOURCE_ICONS.length - 1].path;
}
function iconLabel(id) {
  const icon = SOURCE_ICONS.filter((i) => i.id === id)[0];
  return icon ? icon.label : t("sourceicons.otherInput");
}

// src/lib/system.ts
function parseStats(out) {
  const disks = [];
  const seen = {};
  const lines2 = out.split("---")[1] ? out.split("---")[1].split("\n") : [];
  for (const line of lines2) {
    const f = line.trim().split(/\s+/);
    if (f.length < 6 || !/^\d+$/.test(f[1]) || !/^\d+$/.test(f[3]) || f[5].charAt(0) !== "/") continue;
    const key = f[0] + ":" + f[1];
    if (seen[key]) continue;
    seen[key] = true;
    disks.push({ mount: f[5], totalMB: Math.round(Number(f[1]) / 1024), freeMB: Math.round(Number(f[3]) / 1024) });
  }
  return { disks };
}

// src/lib/netfoldercmd.ts
var NETFOLDER_SCRIPT = `/media/developer/apps/usr/palm/applications/${APP_ID}/netfolder/netfolder.sh`;

// src/lib/wallpaper.ts
var DEEP_NAMES = ["jpg", "jpeg", "png", "webp", "bmp"].map((x) => `-iname '*.${x}'`).join(" -o ");

// src/lib/themecmd.ts
var THEME_FOLDER = "/media/developer/themes";
var THEME_WORK = "/tmp/hearth-theme";
var THEME_STORE = "/media/developer/launcher-theme";
var MANIFEST_READ = 3 * 1024 * 1024;
var LIST_COMMAND = `mkdir -p ${THEME_FOLDER} 2>/dev/null; ls -1 ${THEME_FOLDER} 2>/dev/null`;
var STORE_COMMAND = `mkdir -p ${THEME_STORE} && rm -rf ${THEME_STORE}/current && mv ${THEME_WORK} ${THEME_STORE}/current && test -f ${THEME_STORE}/current/manifest.json && echo stored`;
var MAKE_FOLDER_COMMAND = `mkdir -p ${THEME_FOLDER} 2>/dev/null; echo made`;
var REMOVE_COMMAND = `rm -rf ${THEME_STORE}/current; echo removed`;
var CLEAN_COMMAND = `rm -rf ${THEME_WORK}`;

// src/lib/themeicons.ts
var KEY = "hearth-theme-icons-v1";
var cache = null;
function themeIcon(id) {
  if (cache === null) {
    try {
      const raw = localStorage.getItem(KEY);
      cache = raw ? JSON.parse(raw) : {};
    } catch (e) {
      cache = {};
    }
    const n = Object.keys(cache).length;
    let active = false;
    try {
      active = !!localStorage.getItem("hearth-theme-active-v1");
    } catch (e) {
    }
    if (n || active) log(`theme icons: ${n} in storage${active && !n ? " (a theme is loaded but none are kept)" : ""}`);
  }
  return cache[id];
}

// src/lib/tiles.ts
function appTile(app, edits = {}) {
  const edit = edits[app.id];
  const themed = themeIcon(app.id);
  if (!edit) return { key: app.id, label: app.title, imageUrl: themed || app.iconUrl, color: app.color };
  const bundled = edit.icon && isAppIcon(edit.icon) ? appIconUrl(edit.icon) : "";
  return { key: app.id, label: edit.label || app.title, imageUrl: edit.iconData || bundled || (edit.icon ? void 0 : themed || app.iconUrl), sourceIcon: edit.iconData || bundled ? void 0 : edit.icon, color: app.color };
}

// src/theme/tokens.ts
var BLACK = {
  bg: "#000000",
  wallpaperStart: "#000000",
  wallpaperMid: "#000000",
  wallpaperEnd: "#000000",
  textPrimary: "#F2F2F2",
  textSecondary: "#A8A8A8",
  textMuted: "#6A6A6A",
  widgetInk: "#F2F2F2",
  tileBg: "#101010",
  tileBgFocus: "#1D1D1D",
  tileBorder: "#2A2A2A",
  tileBorderFocus: "#F2F2F2",
  badge: "#F2F2F2",
  badgeText: "#000000",
  liftShadow: "rgba(0, 0, 0, 0.8)",
  buttonBorder: "#3A3A3A",
  buttonActiveBg: "#F2F2F2",
  buttonActiveText: "#000000",
  switchTrack: "#333333",
  switchTrackOn: "#F2F2F2",
  switchKnob: "#A8A8A8",
  switchKnobOn: "#000000",
  danger: "#EF7A73",
  overlay: "rgba(0, 0, 0, 0.58)",
  pickerBg: "#000000",
  pickerTile: "#101010",
  pickerTileFocus: "#1D1D1D",
  pickerEdge: "#2A2A2A",
  iconInk: "#B9B9B9",
  iconTile: "#000000",
  softInk: "#7A7A7A",
  softTile: "#0A0A0A",
  accentInk: "#E6E6E6",
  gradInk: "#6E6E6E",
  scrim: "0, 0, 0",
  scrimTop: "0.22",
  scrimMid: "0.08",
  scrimBottom: "0.5"
};
var GREY = {
  bg: "#101a24",
  wallpaperStart: "#1c2b3a",
  wallpaperMid: "#25384c",
  wallpaperEnd: "#101a24",
  textPrimary: "#F2F5F8",
  textSecondary: "#B9C6D3",
  textMuted: "#7F90A1",
  widgetInk: "#CFE3F5",
  tileBg: "#1a2733",
  tileBgFocus: "#243546",
  tileBorder: "#34485c",
  tileBorderFocus: "#F2F5F8",
  badge: "#F2F5F8",
  badgeText: "#101a24",
  liftShadow: "rgba(0, 0, 0, 0.6)",
  buttonBorder: "#43586d",
  buttonActiveBg: "#F2F5F8",
  buttonActiveText: "#101a24",
  switchTrack: "#34485c",
  switchTrackOn: "#F2F5F8",
  switchKnob: "#B9C6D3",
  switchKnobOn: "#101a24",
  danger: "#EF7A73",
  overlay: "rgba(10, 17, 24, 0.52)",
  pickerBg: calm("#0a1118"),
  pickerTile: calm("#1a2733"),
  pickerTileFocus: calm("#243546"),
  pickerEdge: calm("#34485c"),
  iconInk: "#B9B9B9",
  iconTile: "#0f1923",
  softInk: "#6F8294",
  softTile: "#121e29",
  accentInk: "#6FB3D9",
  gradInk: "#617688",
  scrim: "0, 0, 0",
  scrimTop: "0.22",
  scrimMid: "0.08",
  scrimBottom: "0.5"
};
function rgba(hex, alpha) {
  return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;
}
function calm(hex, amount = 0.4) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  return "#" + c.map((v) => ("0" + Math.round(v + (l - v) * amount).toString(16)).slice(-2)).join("");
}
function dark(bg, w, tile, focus, edge, ink, mono, widgetInk) {
  return {
    bg,
    wallpaperStart: w[0],
    wallpaperMid: w[1],
    wallpaperEnd: w[2],
    textPrimary: ink[0],
    textSecondary: ink[1],
    textMuted: ink[2],
    widgetInk,
    tileBg: tile,
    tileBgFocus: focus,
    tileBorder: edge,
    tileBorderFocus: ink[0],
    badge: ink[0],
    badgeText: bg,
    liftShadow: "rgba(0, 0, 0, 0.6)",
    buttonBorder: edge,
    buttonActiveBg: ink[0],
    buttonActiveText: bg,
    switchTrack: edge,
    switchTrackOn: ink[0],
    switchKnob: ink[1],
    switchKnobOn: bg,
    danger: "#EF7A73",
    overlay: rgba(bg, 0.52),
    pickerBg: calm(bg),
    pickerTile: calm(tile),
    pickerTileFocus: calm(focus),
    pickerEdge: calm(edge),
    iconInk: mono[0],
    iconTile: mono[1],
    softInk: mono[2],
    softTile: mono[3],
    accentInk: mono[4],
    gradInk: mono[5],
    scrim: "0, 0, 0",
    scrimTop: "0.22",
    scrimMid: "0.08",
    scrimBottom: "0.5"
  };
}
var SOFT_INK = ["#F2F5F8", "#B9C6D3", "#7F90A1"];
var THEMES = {
  black: BLACK,
  grey: GREY,
  midnight: dark("#0a1020", ["#101a36", "#1b2a5c", "#0a1020"], "#121a30", "#1c2848", "#2c3d66", SOFT_INK, ["#B9B9B9", "#070c18", "#6B7AA3", "#0b1122", "#7F9BFF", "#5D6B96"], "#C3CEFF"),
  forest: dark("#0b1a12", ["#12281b", "#1d4030", "#0b1a12"], "#12231a", "#1b3326", "#2d4a3a", ["#F1F6F2", "#B7C9BC", "#7C927F"], ["#B9B9B9", "#08140d", "#6E8A78", "#0c1a12", "#7FD19A", "#607A68"], "#C2EBCF"),
  // P48 (colours are the agent's; the user picked these two themes)
  teal: dark("#08191b", ["#0d2528", "#154447", "#08191b"], "#0f2427", "#183639", "#2a4d50", ["#EFF7F6", "#B5CFCD", "#7B9A98"], ["#B9B9B9", "#061314", "#6B9A97", "#0a1b1d", "#6FD3CC", "#5E8280"], "#A9EFE8"),
  graphite: dark("#17140f", ["#201c15", "#332c20", "#17140f"], "#211d17", "#322b21", "#4a4132", ["#F4EFE6", "#CFC6B6", "#968C7A"], ["#B9B9B9", "#110f0b", "#9A8E78", "#1a1712", "#D9B36C", "#85785F"], "#F0CF8E")
};

// src/lib/fitscale.ts
var last = null;
function appliedFit() {
  return last;
}

// src/lib/debuginfo.ts
var WIDTH = 100;
var LEFT_WIDTH = 76;
var RIGHT_WIDTH = 50;
var DENSE_ROWS = 22;
var APP_STORAGE = "/mnt/lg/appstore";
var REPORT_FILE = "/tmp/hearth-debug.txt";
var clip = (s, width = WIDTH) => s.length > width ? s.slice(0, width - 1) + "\u2026" : s;
var gb = (mb) => mb < 0 ? "?" : mb >= 1024 ? (mb / 1024).toFixed(1) + " GB" : mb + " MB";
var yn = (v) => v ? "on" : "off";
function debugPages(s) {
  const c = s.config;
  const chrome = /Chrome\/([0-9.]+)/.exec(s.userAgent);
  const state2 = [
    s.rootDetail ? "Root detail: " + s.rootDetail : "",
    `Web view: ${chrome ? "Chrome " + chrome[1] : "unknown"}   Screen: ${typeof window !== "undefined" ? window.innerWidth + "\xD7" + window.innerHeight : "?"}${appliedFit() ? " (scaled to " + Math.round(appliedFit().scale * 100) + "%)" : ""}`,
    s.appList ? `App list: ${s.appList.count} apps from the ${s.appList.source === "homebrew" ? "live Homebrew list" : s.appList.source === "tv" ? "TV's remote-control service (experimental)" : "built-in list"} (${s.appList.ago})` : "App list: not read yet",
    `Weather: ${s.weather}`,
    "",
    `Theme ${c.theme}, background ${c.background}, icons ${c.iconScale}%, ${c.rows} row${c.rows === 1 ? "" : "s"}, labels ${yn(c.showLabels)}, minimal ${yn(c.minimal)}`,
    `Wallpaper ${c.wallpaper.mode}${c.wallpaper.path ? " " + c.wallpaper.path : ""}`,
    `Close LG Home ${c.closeHome ? "on" : "switched off (it kept coming back)"}, helper ${yn(c.replaceHome)}`,
    `Hidden apps ${c.hiddenIds ? c.hiddenIds.length : "?"}, sources shown ${c.sourceIds.length}, edited sources ${Object.keys(c.sourceEdits).length}`,
    `LG Home tile ${yn(c.showLgHome)}, System Settings tile ${yn(c.showSystem)}`
  ].filter((l, i) => l !== "" || i === 5);
  const st = s.stats;
  state2.push("");
  if (st) {
    const appStore = st.disks.filter((d) => d.mount === APP_STORAGE);
    (appStore.length ? appStore : st.disks).forEach((d) => state2.push(`Storage ${d.mount}: ${gb(d.freeMB)} free of ${gb(d.totalMB)}`));
  } else state2.push("Storage: not available (needs a rooted TV)");
  const help = [
    "To send the report, photograph page 2 (the report file holds all events, not just these).",
    "",
    "Rooted TV, over SSH: open this tab once, then on a computer run",
    `   ssh root@<TV address> cat ${REPORT_FILE}`,
    "   ssh root@<TV address> cat /tmp/launcher-homehook.log      (the helper's own log, if the helper is on)",
    "   <TV address> is shown in the Homebrew Channel settings. The first file is written when this tab opens.",
    "",
    "No SSH client? webOS Dev Manager has a terminal option that gives SSH access to the TV:",
    "   open it, use the terminal, and run the same cat commands as above.",
    "",
    "Not rooted: only the photo works (a TV app cannot save files you can reach).",
    "",
    "Use \u2191 and \u2193 to change page."
  ].map((l) => clip(l));
  const wrapped = s.events.reduce((rows, e) => rows.concat(e.length <= RIGHT_WIDTH ? [e] : [e.slice(0, RIGHT_WIDTH), "  " + e.slice(RIGHT_WIDTH, RIGHT_WIDTH * 2 - 2)]), []);
  const events = wrapped.length ? wrapped.slice(-DENSE_ROWS) : ["Nothing has happened yet."];
  return [
    { title: "Debug 1 of 2: how to share the logs", lines: help },
    {
      title: "Debug 2 of 2: this TV and the latest events",
      lines: state2.map((l) => clip(l, LEFT_WIDTH)),
      dense: true,
      right: { title: "Latest events", lines: events.map((l) => clip(l, RIGHT_WIDTH)) }
    }
  ];
}
function reportText(pages, allEvents, beforeRestart, bootTrace) {
  const base = pages.map((p) => p.title + "\n" + p.lines.join("\n") + (p.right ? "\n\n" + p.right.title + "\n" + p.right.lines.join("\n") : "")).join("\n\n") + "\n";
  const earlier = beforeRestart && beforeRestart.length ? "\nBefore the last restart (end of the old file)\n" + beforeRestart.join("\n") + "\n" : "";
  const trace = bootTrace && bootTrace.length ? "\nBoot trace of the webOS 3 guard (oldest first)\n" + bootTrace.join("\n") + "\n" : "";
  return (allEvents && allEvents.length ? base + "\nAll events since this start (oldest first)\n" + allEvents.join("\n") + "\n" : base) + earlier + trace;
}

// src/lib/backgrounds.ts
var plain = (c) => [c, c, c];
var RAW_BACKGROUNDS = [
  { id: "theme", colors: ["", "", ""] },
  { id: "photo-show", colors: ["#10161a", "#10161a", "#080b0d"] },
  { id: "photo-17", num: 1, colors: ["#1a251a", "#141e13", "#09130c"], image: "wallpapers/photo-17.jpg" },
  { id: "photo-02", num: 2, colors: ["#06102e", "#0a1c47", "#192855"], image: "wallpapers/photo-02.jpg" },
  { id: "photo-03", num: 3, colors: ["#455463", "#acaeb1", "#999792"], image: "wallpapers/photo-03.jpg" },
  { id: "photo-04", num: 4, colors: ["#54548b", "#402b50", "#4b3f6d"], image: "wallpapers/photo-04.jpg" },
  { id: "photo-05", num: 5, colors: ["#94b6cb", "#869192", "#3f3c2f"], image: "wallpapers/photo-05.jpg" },
  { id: "photo-06", num: 6, colors: ["#d4d7d5", "#b0b2af", "#1e2023"], image: "wallpapers/photo-06.jpg" },
  { id: "photo-07", num: 7, colors: ["#10232e", "#17232f", "#1f2b39"], image: "wallpapers/photo-07.jpg" },
  { id: "photo-08", num: 8, colors: ["#005a62", "#066e60", "#021d1e"], image: "wallpapers/photo-08.jpg" },
  { id: "photo-09", num: 9, colors: ["#5b6fc7", "#3349b0", "#405dd8"], image: "wallpapers/photo-09.jpg" },
  { id: "photo-10", num: 10, colors: ["#787b89", "#2c485c", "#192d3a"], image: "wallpapers/photo-10.jpg" },
  { id: "photo-11", num: 11, colors: ["#535e69", "#606363", "#343b41"], image: "wallpapers/photo-11.jpg" },
  { id: "photo-12", num: 12, colors: ["#95aeae", "#106e75", "#457351"], image: "wallpapers/photo-12.jpg" },
  { id: "photo-13", num: 13, colors: ["#7da5c5", "#5b7993", "#28455c"], image: "wallpapers/photo-13.jpg" },
  { id: "photo-14", num: 14, colors: ["#0e4673", "#255784", "#323130"], image: "wallpapers/photo-14.jpg" },
  { id: "photo-15", num: 15, colors: ["#17211f", "#1d3125", "#192823"], image: "wallpapers/photo-15.jpg" },
  { id: "photo-16", num: 16, colors: ["#6b9098", "#b8c2b0", "#7c6559"], image: "wallpapers/photo-16.jpg" },
  { id: "photo-20", num: 17, colors: ["#929bb0", "#6895a7", "#243235"], image: "wallpapers/photo-20.jpg" },
  { id: "photo-18", num: 18, colors: ["#b7a390", "#735e50", "#392e2b"], image: "wallpapers/photo-18.jpg" },
  { id: "photo-19", num: 19, colors: ["#6e685e", "#454942", "#273935"], image: "wallpapers/photo-19.jpg" },
  { id: "photo-01", num: 20, colors: ["#e2a0ae", "#956da0", "#69619f"], image: "wallpapers/photo-01.jpg" },
  { id: "photo-21", num: 21, colors: ["#0288b1", "#0482a6", "#0183a7"], image: "wallpapers/photo-21.jpg" },
  { id: "photo-22", num: 22, colors: ["#101957", "#274d8e", "#3c4c6e"], image: "wallpapers/photo-22.jpg" },
  { id: "photo-23", num: 23, colors: ["#132929", "#78533b", "#323934"], image: "wallpapers/photo-23.jpg" },
  { id: "photo-24", num: 24, colors: ["#889894", "#869787", "#375149"], image: "wallpapers/photo-24.jpg" },
  { id: "photo-25", num: 25, colors: ["#0a283c", "#235e72", "#214553"], image: "wallpapers/photo-25.jpg" },
  { id: "charcoal", colors: plain("#1a1a1a") },
  { id: "navy", colors: plain("#0d1b2a") },
  { id: "dusk", colors: ["#2b1055", "#5b2a86", "#1a0b2e"] },
  { id: "ocean", colors: ["#06202e", "#0b4a63", "#04141c"] },
  { id: "forest", colors: ["#0b2415", "#1c4a2c", "#07140c"] },
  { id: "ember", colors: ["#2a0a0a", "#6b1d14", "#14070a"] },
  { id: "aurora", colors: ["#06181f", "#0f4c4a", "#1b2a5e"] },
  { id: "cloud", colors: ["#c6d0dc", "#aebbca", "#93a5b8"] },
  { id: "peach", colors: ["#f2d8c6", "#e6bfa6", "#d4a088"] },
  { id: "mint", colors: ["#cfe3d6", "#b2d3bf", "#8fbba3"] },
  { id: "sky", colors: ["#c9dcee", "#aac7e2", "#86acd0"] },
  { id: "lavender", colors: ["#ddd5ee", "#c6b9e0", "#a99bcc"] }
];
var BACKGROUNDS = RAW_BACKGROUNDS.map((b) => {
  const row = { ...b };
  Object.defineProperty(row, "label", { get: () => b.num ? td("bg.photo", { n: b.num }) : td("bg." + b.id), enumerable: true });
  return row;
});
var PHOTO_IDS = BACKGROUNDS.filter((b) => !!b.image).map((b) => b.id);
var BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);

// src/lib/legacyids.ts
var LEGACY_PHOTO_IDS = {
  "nature-show": "photo-show",
  "nature-01": "photo-17",
  "nature-02": "photo-03",
  "nature-03": "photo-04",
  "nature-04": "photo-08",
  "nature-05": "photo-10",
  "nature-06": "photo-13",
  "nature-07": "photo-14",
  "nature-08": "photo-16",
  "nature-09": "photo-17",
  "nature-10": "photo-19",
  "nature-11": "photo-25"
};
function currentPhotoId(id) {
  return Object.prototype.hasOwnProperty.call(LEGACY_PHOTO_IDS, id) ? LEGACY_PHOTO_IDS[id] : id;
}
function currentSaverSource(source) {
  return source.indexOf("@photo:") === 0 ? "@photo:" + currentPhotoId(source.slice(7)) : source;
}
var LEGACY_PHOTO_TARGETS = Object.keys(LEGACY_PHOTO_IDS).map((k) => LEGACY_PHOTO_IDS[k]);

// src/lib/clockfont.ts
var BUILTIN_FONTS = [
  { id: "inter", label: "Inter (default)", family: '"Inter Variable", "LG Smart UI", "Helvetica Neue", Arial, sans-serif' },
  { id: "tv", label: "TV font", family: '"LG Smart UI", "Helvetica Neue", Helvetica, Arial, sans-serif' },
  { id: "poppins", label: "Poppins (rounded)", family: '"Poppins", "Helvetica Neue", Arial, sans-serif' },
  { id: "oswald", label: "Oswald (tall, narrow)", family: '"Oswald", "Arial Narrow", Arial, sans-serif' },
  { id: "mono", label: "Roboto Mono (digital)", family: '"Roboto Mono", "Courier New", monospace' },
  { id: "serif", label: "Cormorant (elegant serif)", family: '"Cormorant Garamond", Georgia, "Times New Roman", serif' },
  { id: "outfit", label: "Outfit (geometric)", family: '"Outfit", "Helvetica Neue", Arial, sans-serif' },
  { id: "worksans", label: "Work Sans (clean)", family: '"Work Sans", "Helvetica Neue", Arial, sans-serif' },
  { id: "bricolage", label: "Bricolage Grotesque (quirky)", family: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif' },
  { id: "bigshoulders", label: "Big Shoulders (tall, condensed)", family: '"Big Shoulders", "Arial Narrow", Arial, sans-serif' },
  { id: "jura", label: "Jura (techno)", family: '"Jura", "Helvetica Neue", Arial, sans-serif' },
  { id: "tektur", label: "Tektur (futuristic)", family: '"Tektur", "Helvetica Neue", Arial, sans-serif' },
  { id: "jetbrains", label: "JetBrains Mono (code)", family: '"JetBrains Mono", "Courier New", monospace' },
  { id: "lora", label: "Lora (classic serif)", family: '"Lora", Georgia, "Times New Roman", serif' },
  { id: "poiret", label: "Poiret One (art deco)", family: '"Poiret One", "Helvetica Neue", Arial, sans-serif' },
  { id: "pixelify", label: "Pixelify Sans (pixel)", family: '"Pixelify Sans", "Courier New", monospace' },
  { id: "nunito", label: "Nunito (rounded, bold)", family: '"Nunito", "Inter Variable", "Helvetica Neue", Arial, sans-serif' },
  { id: "montserrat", label: "Montserrat (minimal sans)", family: '"Montserrat", "Helvetica Neue", Arial, sans-serif' },
  { id: "jost", label: "Jost (geometric sans)", family: '"Jost", "Helvetica Neue", Arial, sans-serif' },
  { id: "raleway", label: "Raleway (hairline sans)", family: '"Raleway", "Helvetica Neue", Arial, sans-serif' },
  { id: "playfair", label: "Playfair Display (classic serif)", family: '"Playfair Display", Georgia, "Times New Roman", serif' },
  { id: "bebas", label: "Bebas Neue (bold display)", family: '"Bebas Neue", Impact, "Arial Narrow", Arial, sans-serif' },
  { id: "bevan", label: "Bevan (slab serif)", family: '"Bevan", Georgia, "Times New Roman", serif' },
  { id: "alfaslab", label: "Alfa Slab One (heavy slab)", family: '"Alfa Slab One", Georgia, "Times New Roman", serif' },
  { id: "greatvibes", label: "Great Vibes (elegant script)", family: '"Great Vibes", "Brush Script MT", cursive' },
  { id: "pinyon", label: "Pinyon Script (copperplate script)", family: '"Pinyon Script", "Brush Script MT", cursive' },
  { id: "kaushan", label: "Kaushan Script (brush script)", family: '"Kaushan Script", "Brush Script MT", cursive' }
];
var BUILTIN_FONT_IDS = BUILTIN_FONTS.map((f) => f.id);
var CLOCK_FONTS = BUILTIN_FONTS.slice();
var CLOCK_FONT_IDS = BUILTIN_FONT_IDS.slice();
var LABEL_FONT_IDS = ["default"].concat(BUILTIN_FONT_IDS);
var THEME_FONT_PREFIX = "Hearth Theme ";
var THEME_FONTS_KEY = "hearth-theme-fonts-v1";
function setThemeFonts(list) {
  CLOCK_FONTS.length = BUILTIN_FONTS.length;
  CLOCK_FONT_IDS.length = BUILTIN_FONT_IDS.length;
  LABEL_FONT_IDS.length = BUILTIN_FONT_IDS.length + 1;
  for (const f of list) {
    if (BUILTIN_FONT_IDS.indexOf(f.id) !== -1 || f.id === "default" || CLOCK_FONT_IDS.indexOf(f.id) !== -1) continue;
    CLOCK_FONTS.push({ id: f.id, label: f.label, family: `"${THEME_FONT_PREFIX}${f.id}", "Inter Variable", "LG Smart UI", Arial, sans-serif` });
    CLOCK_FONT_IDS.push(f.id);
    LABEL_FONT_IDS.push(f.id);
  }
}
function restoreThemeFonts() {
  try {
    const raw = localStorage.getItem(THEME_FONTS_KEY);
    if (!raw) return;
    const files = JSON.parse(raw);
    if (Array.isArray(files)) setThemeFonts(files.filter((f) => f && typeof f.id === "string").map((f) => ({ id: f.id, label: typeof f.label === "string" ? f.label : f.id })));
  } catch (e) {
  }
}

// src/lib/scrollspeed.ts
var SCROLL_SPEED_IDS = ["slow", "medium", "brisk", "fast"];

// src/lib/storeguard.ts
var FREE_ORDER = [
  ["hearth-probe-fill"],
  // J: a leftover of test 36 (only if the page was killed during it)
  ["hearth-mono-v3"],
  ["hearth-ssap-icondata-v1"],
  ["customlauncher-weather-v1"],
  ["launcher-icon-cache-v1", "launcher-icon-stamps-v1"],
  ["customlauncher-apps-v1"],
  ["customlauncher-wallpaper-id-v1", "customlauncher-wallpaper-data-v1"],
  ["hearth-bundled-id-v1", "hearth-bundled-data-v1"]
];
function writeWithRoom(store, key, value, order = FREE_ORDER) {
  const freed = [];
  try {
    store.setItem(key, value);
    return { ok: true, freed };
  } catch {
  }
  for (let i = 0; i < order.length; i++) {
    let any = false;
    for (let j = 0; j < order[i].length; j++) {
      try {
        if (store.getItem(order[i][j]) !== null) {
          store.removeItem(order[i][j]);
          any = true;
        }
      } catch {
      }
    }
    if (!any) continue;
    freed.push(order[i][order[i].length - 1]);
    try {
      store.setItem(key, value);
      return { ok: true, freed };
    } catch {
    }
  }
  return { ok: false, freed };
}

// src/lib/clockcolor.ts
var CLOCK_COLORS = [
  { id: "theme" },
  { id: "white", color: "#F2F2F2" },
  { id: "warm", color: "#FFE9C7" },
  { id: "blue", color: "#C4E2FF" },
  { id: "amber", color: "#FFB74D" },
  { id: "grey", color: "#9AA0A6" },
  { id: "charcoal", color: "#3C4043", dark: true },
  { id: "black", color: "#0A0A0A", dark: true }
];
var CLOCK_COLOR_IDS = CLOCK_COLORS.map((c) => c.id);
var REMOVED_CLOCK_COLORS = { ember: "amber", ocean: "blue", dusk: "warm" };
var PLAIN_COLOR_IDS = CLOCK_COLORS.filter((c) => !!c.color).map((c) => c.id);
var LABEL_COLOR_IDS = ["theme"].concat(CLOCK_COLORS.filter((c) => !!c.color).map((c) => c.id));
function validInk(v) {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : void 0;
}

// src/lib/homehookcmd.ts
var HOOK_DIR = "/media/developer/launcher-homehook";
var HOOK_LINK = "/var/lib/webosbrew/init.d/48-launcher-homehook";
var APP_QML = "/usr/palm/applications/com.webos.app.home/qml";
var PID_FILE = "/tmp/launcher-homehook-watch.pid";
var ALLOW_FILE = "/tmp/launcher-allow-stock-home";
var ALIVE_FILE = "/tmp/launcher-alive";
function withStatus(command) {
  return `{ ${command}; } 2>&1; echo "[exit $?]"`;
}
var STOP_WATCHER = `pid="$(cat '${PID_FILE}' 2>/dev/null)"; if [ -n "$pid" ]; then pkill -P "$pid" 2>/dev/null; kill -9 "$pid" 2>/dev/null; fi; pkill -9 -f '[l]auncher-homehook/watch.sh' 2>/dev/null; rm -f '${PID_FILE}'; true`;
var APPLY_COMMAND = withStatus(`if [ -f '${HOOK_DIR}/apply.sh' ]; then sh '${HOOK_DIR}/apply.sh'; else echo files-missing; fi`);
var STOCK_COMMAND = `[ -f '${HOOK_DIR}/stock.sh' ] && sh '${HOOK_DIR}/stock.sh'; echo stock`;
var REMOVE_COMMAND2 = `${STOP_WATCHER}; rm -f '${ALLOW_FILE}' '${ALIVE_FILE}' '${HOOK_LINK}'; while grep -q ' ${APP_QML} ' /proc/mounts; do umount '${APP_QML}' || break; done; rm -rf '${HOOK_DIR}'; echo removed`;
var VERSION_COMMAND = `cat '${HOOK_DIR}/version' 2>/dev/null; true`;
var STATUS_COMMAND = `if [ -f '${PID_FILE}' ] && kill -0 "$(cat '${PID_FILE}')" 2>/dev/null; then echo running; fi; if [ -L '${HOOK_LINK}' ]; then echo linked; fi; true`;

// src/lib/remapcmd.ts
var REMAP_DIR = "/media/developer/launcher-remap";
var REMAP_LINK = "/var/lib/webosbrew/init.d/47-launcher-remap";
var DEFAULT_REMAP = { on: false, keys: {} };
var ALIASES = { Key_webOS_USP: "Key_webOS_RakutenTV" };
function canonicalButton(name) {
  return ALIASES[name] || name;
}
var NAME_RE = /^(Key_webOS_[A-Za-z0-9]{1,30}|#[0-9]{1,10})$/;
var APP_ID_RE = /^[A-Za-z0-9._-]{1,120}$/;
function cleanAction(value) {
  if (!value || typeof value !== "object") return null;
  const a = value;
  if (a.t === "app" && typeof a.id === "string" && APP_ID_RE.test(a.id)) return { t: "app", id: a.id };
  if (a.t === "mute") return { t: "mute" };
  if (a.t === "none") return { t: "none" };
  return null;
}
function cleanRemap(value) {
  if (!value || typeof value !== "object") return { on: false, keys: {} };
  const v = value;
  const keys = {};
  if (v.keys && typeof v.keys === "object") {
    Object.keys(v.keys).forEach((name) => {
      const action = cleanAction(v.keys[name]);
      if (NAME_RE.test(name) && action && !keys[canonicalButton(name)]) keys[canonicalButton(name)] = action;
    });
  }
  return { on: v.on === true, keys };
}
var REMAP_KEEP_COMMAND = withStatus(`if [ -f '${REMAP_DIR}/apply.sh' ]; then ln -sf '${REMAP_DIR}/apply.sh' '${REMAP_LINK}' && echo applied; else echo files-missing; fi`);
var CHECK_COMMAND = withStatus(`if [ -f '${REMAP_DIR}/apply.sh' ]; then sh '${REMAP_DIR}/apply.sh' check; else echo files-missing; fi`);
var REMAP_UNKEEP_COMMAND = withStatus(`rm -f '${REMAP_LINK}'; echo applied`);
var STATE_COMMAND = withStatus(`o="$(luna-send -n 1 luna://com.webos.service.config/getConfigs '{"configNames":["com.webos.surfacemanager.keyFilters"]}' </dev/null 2>/dev/null)"; case "$o" in *'"returnValue":true'*|*'"returnValue": true'*) case "$o" in *hearthRemap*) echo applied;; *) echo removed;; esac;; *) echo failed;; esac`);
var VERSION_COMMAND2 = `cat '${REMAP_DIR}/version' 2>/dev/null; true`;
var REMOVE_COMMAND3 = withStatus(`rm -f '${REMAP_LINK}'; if [ -f '${REMAP_DIR}/apply.sh' ]; then sh '${REMAP_DIR}/apply.sh' off; else echo removed; fi; rm -rf '${REMAP_DIR}'`);

// src/lib/tileshape.ts
var TILE_SHAPES = [
  { id: "rounded" },
  { id: "square" },
  { id: "squircle" },
  { id: "circle" },
  { id: "leaf" },
  { id: "arch" },
  { id: "drop" }
];
var TILE_SHAPE_IDS = TILE_SHAPES.map((s) => s.id);

// src/lib/cities.ts
var DEFAULT_CITY = { name: "Delhi", lat: 28.6139, lon: 77.209, detail: "India" };

// src/lib/weather.ts
var FRESH_MS = 30 * 60 * 1e3;
var SHOWN_MS = 6 * 60 * 60 * 1e3;
function validCoords(lat, lon) {
  return typeof lat === "number" && typeof lon === "number" && isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

// src/config/bundledlanguages.ts
var BUNDLED_LANGUAGES = [
  { id: "ar", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { id: "de", name: "Deutsch" },
  { id: "es", name: "Espa\xF1ol" },
  { id: "fr", name: "Fran\xE7ais" },
  { id: "id", name: "Bahasa Indonesia" },
  { id: "it", name: "Italiano" },
  { id: "pl", name: "Polski" },
  { id: "pt-BR", name: "Portugu\xEAs (Brasil)" },
  { id: "ru", name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  { id: "th", name: "\u0E44\u0E17\u0E22" }
];

// src/lib/languages.ts
var LANGUAGES = [{ id: "en", name: "English" }].concat(BUNDLED_LANGUAGES);
var DEFAULT_LANGUAGE = "en";
var PACK_ID = "pack";
var languageId = (id) => id === PACK_ID ? PACK_ID : languageOf(id).id;
function languageOf(id) {
  for (let i = 0; i < LANGUAGES.length; i++) if (LANGUAGES[i].id === id) return LANGUAGES[i];
  return LANGUAGES[0];
}

// src/lib/storage.ts
var LABEL_WEIGHTS = [300, 400, 500, 600, 700];
var RANGES = {
  iconScale: { min: 50, max: 140, step: 10, def: 90 },
  // % of the standard tile size
  sideMargin: { min: 0, max: 300, step: 10, def: 20 },
  // px at 1080p, left and right of the app row
  bottomMargin: { min: 0, max: 200, step: 10, def: 10 },
  // px at 1080p, below the app row
  favSideMargin: { min: 0, max: 300, step: 10, def: 20 },
  // px at 1080p, left and right of the favourites row
  favBottomMargin: { min: 0, max: 400, step: 10, def: 30 },
  // px at 1080p, below the favourites row while it is alone (a high row is possible)
  clockSize: { min: 80, max: 240, step: 10, def: 140 },
  // px, height of the digits
  clockTop: { min: 0, max: 70, step: 2, def: 20 },
  // % of the screen height (0 = the very top)
  clockLeft: { min: 0, max: 100, step: 2, def: 50 },
  // % of the screen width (where the clock's centre sits)
  clockShadow: { min: 10, max: 100, step: 10, def: 100 },
  // % (strength of the widget's drop shadow)
  clockScrim: { min: 0, max: 100, step: 5, def: 25 },
  // strength behind the widget (fresh installs 25; a saved config without the key loads as 0, see loadConfig; 0 = off; 100 = the old 50 % darkness, see Clock.tsx)
  clockOpacity: { min: 10, max: 100, step: 10, def: 100 },
  // % (how solid the clock, date and weather are)
  iconOpacity: { min: 30, max: 100, step: 10, def: 100 },
  // % (how solid the icons of the home row are)
  iconGap: { min: 50, max: 200, step: 10, def: 100 },
  // % of the standard space between the home row's icons
  wallpaperOpacity: { min: 30, max: 100, step: 10, def: 100 },
  // % (how solid the picture is; lower lets the background show through)
  quietSec: { min: 0, max: 120, step: 10, def: 20 },
  // seconds without a key before the apps hide (0 = off); local build: max 120 (was 60)
  quietDimLevel: { min: 10, max: 80, step: 10, def: 30 },
  // % darkness of the quiet-mode dim
  quietDimSec: { min: 0, max: 120, step: 10, def: 20 },
  // seconds after the apps hide before the screen dims (0 = off); local build: max 120 (was 60)
  fadeStrength: { min: 0, max: 100, step: 5, def: 30 },
  // % darkness of the bottom fade over the wallpaper (0 = off)
  fadeHeight: { min: 20, max: 100, step: 5, def: 50 },
  // % of the screen height the bottom fade covers
  recentsW: { min: 30, max: 100, step: 5, def: 60 },
  // % of the screen width of the Recent apps panel
  recentsH: { min: 30, max: 60, step: 5, def: 30 }
  // % of the screen height of the Recent apps panel
};
var VIDEO_CHANGE_VALUES = [0, -1, 600, 1800, 3600];
var videoPathOk = (path) => path.charAt(0) === "/" && path.length < 400 && !/[\u0000-\u001f\u007f]/.test(path);
var ICON_STYLE_IDS = ["original", "mono", "soft", "accent", "gradient", "tinted", "glyph"];
var DEFAULTS_VERSION = 1;
var THEME_IDS = ["black", "grey", "midnight", "forest", "teal", "graphite"];
var REMOVED_LIGHT_THEMES = ["cloud", "sand", "mist"];
function widgetColor(saved, theme) {
  const id = typeof saved === "string" && REMOVED_CLOCK_COLORS[saved] ? REMOVED_CLOCK_COLORS[saved] : saved;
  if (CLOCK_COLOR_IDS.indexOf(id) === -1 || id === "charcoal" && REMOVED_LIGHT_THEMES.indexOf(theme) !== -1) return "white";
  return id;
}
var DEFAULT_WALLPAPER = {
  mode: "gradient",
  path: "",
  intervalSec: 60,
  shuffle: true,
  recursive: false,
  fit: "fill",
  videoChange: -1,
  videoShade: true
};
var DEFAULT_WEATHER = {
  on: false,
  // P41c: off on a fresh install and after the visual reset
  city: DEFAULT_CITY,
  unit: "c",
  showCity: true,
  showRange: false
};
var DEFAULT_CLOCK = {
  show: true,
  size: RANGES.clockSize.def,
  weight: 400,
  // P41f: Regular (was Thin 200)
  font: "outfit",
  // P41f (was Inter)
  top: RANGES.clockTop.def,
  left: RANGES.clockLeft.def,
  color: "theme",
  // P77: Follow theme (identical to white on OLED black); saved settings keep their colour
  shadow: true,
  shadowStrength: RANGES.clockShadow.def,
  scrim: RANGES.clockScrim.def,
  opacity: RANGES.clockOpacity.def,
  showDate: true,
  showPeriod: true,
  align: "center"
  // P113 (P41f had left)
};
var DEFAULT_CONFIG = {
  defaultsV: DEFAULTS_VERSION,
  appIds: null,
  hiddenIds: [],
  sourceIds: [],
  tileOrder: null,
  essentials: null,
  favourites: [],
  closeHome: true,
  tvApps: false,
  language: DEFAULT_LANGUAGE,
  showDebug: false,
  continueWatching: false,
  replaceHome: false,
  homeApp: false,
  homeAppPrevious: "",
  preloadOff: 0,
  keepReady: false,
  keepRelaunch: false,
  takeoverHome: false,
  samHome: false,
  screensaver: false,
  // local build: off by default (upstream P41c has it on)
  screensaverSource: "@video",
  screensaverInterval: 60,
  screensaverShuffle: true,
  screensaverCare: true,
  screensaverPowerOff: 300,
  // P41c: 5 minutes
  screensaverDim: false,
  screensaverDimLevel: 40,
  screensaverFit: "fit",
  screensaverRecursive: false,
  powerOnApp: "",
  powerOnNetwork: false,
  theme: "black",
  background: "photo-17",
  // P41f/P113: the default photo (fish); shown as "Photo: 1" (P107, P113: labels and list order swapped, ids and files unchanged; photo-20 is now "Photo: 17")
  iconScale: RANGES.iconScale.def,
  iconOpacity: RANGES.iconOpacity.def,
  iconGap: RANGES.iconGap.def,
  wallpaperOpacity: RANGES.wallpaperOpacity.def,
  fadeStrength: RANGES.fadeStrength.def,
  fadeHeight: RANGES.fadeHeight.def,
  tileShape: "rounded",
  iconStyle: "original",
  iconLight: false,
  themeSel: "",
  iconColor: "theme",
  remoteModel: "ir",
  recentsW: RANGES.recentsW.def,
  recentsH: RANGES.recentsH.def,
  quietSec: RANGES.quietSec.def,
  quietDimSec: RANGES.quietDimSec.def,
  quietDimLevel: RANGES.quietDimLevel.def,
  quietPowerOff: 0,
  // QP: never (additive; saved settings keep working)
  quietFade: false,
  oledShift: true,
  labelColor: "theme",
  labelFont: "default",
  labelSize: 100,
  labelWeight: 400,
  scrollSpeed: "medium",
  homeFocus: "first",
  // p22b (user 2026-11-10): fresh installs and the Look reset start on the first app (P41c: 'last'); saved settings keep theirs, see the parse below
  showLabels: true,
  minimal: false,
  showLgHome: false,
  // P41c: hidden on a fresh install (saved settings keep theirs)
  inputStatus: true,
  showSystem: false,
  // P41c: same
  hideSettings: false,
  // R10: additive, off
  orderByRecent: false,
  remap: DEFAULT_REMAP,
  remapKept: false,
  sourceEdits: {},
  appEdits: {},
  rows: 1,
  sideMargin: RANGES.sideMargin.def,
  bottomMargin: RANGES.bottomMargin.def,
  favSideMargin: RANGES.favSideMargin.def,
  favBottomMargin: RANGES.favBottomMargin.def,
  clockFormat: "tv",
  clock: DEFAULT_CLOCK,
  weather: DEFAULT_WEATHER,
  wallpaper: DEFAULT_WALLPAPER
};
function stringList(value) {
  return Array.isArray(value) ? value.filter((x) => typeof x === "string") : null;
}
function ranged(value, name) {
  const r = RANGES[name];
  if (typeof value !== "number" || !isFinite(value)) return r.def;
  const snapped = r.min + Math.round((Math.min(r.max, Math.max(r.min, value)) - r.min) / r.step) * r.step;
  return Math.min(r.max, snapped);
}
var KEPT_ON_RESET = [
  "appIds",
  "hiddenIds",
  "sourceIds",
  "tileOrder",
  "essentials",
  "favourites",
  "sourceEdits",
  "appEdits",
  "closeHome",
  "tvApps",
  "showDebug",
  "language",
  "hideSettings",
  "continueWatching",
  // local build: Continue Watching goes with the Plex sign-in
  "replaceHome",
  "homeApp",
  "homeAppPrevious",
  "preloadOff",
  "keepReady",
  "keepRelaunch",
  "takeoverHome",
  "samHome",
  "screensaver",
  "screensaverSource",
  "screensaverInterval",
  "screensaverShuffle",
  "screensaverCare",
  "screensaverPowerOff",
  "screensaverDim",
  "screensaverDimLevel",
  "screensaverFit",
  "screensaverRecursive",
  "powerOnApp",
  "powerOnNetwork",
  "remoteModel",
  "remap",
  "remapKept",
  "defaultsV"
];
function withDefaultLook(c) {
  const out = { ...DEFAULT_CONFIG, clock: { ...DEFAULT_CLOCK }, weather: { ...DEFAULT_WEATHER }, wallpaper: { ...DEFAULT_WALLPAPER } };
  const old = c;
  KEPT_ON_RESET.forEach((k) => {
    out[k] = old[k];
  });
  out.defaultsV = DEFAULTS_VERSION;
  return out;
}
var BACKUP_KEY = "hearth-prefs-backup-v1";
var backupSeen = null;
function lookOnly(c) {
  const src = c;
  const out = {};
  Object.keys(src).forEach((k) => {
    if (KEPT_ON_RESET.indexOf(k) === -1) out[k] = src[k];
  });
  return out;
}
function backUpLook(c) {
  try {
    if (localStorage.getItem(BACKUP_KEY)) return;
    localStorage.setItem(BACKUP_KEY, JSON.stringify(lookOnly(c)));
    backupSeen = true;
  } catch {
  }
}
var RESCUE_KEY = "hearth-config-rescue-v1";
function loadConfig() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    restoreThemeFonts();
    const parsed = JSON.parse(raw);
    if (typeof parsed.background === "string") parsed.background = currentPhotoId(parsed.background);
    if (typeof parsed.screensaverSource === "string") parsed.screensaverSource = currentSaverSource(parsed.screensaverSource);
    const w = parsed.wallpaper || {};
    const c = parsed.clock || {};
    const wx = parsed.weather || DEFAULT_WEATHER;
    const wc = wx.city;
    const city = wc && typeof wc.name === "string" && wc.name && validCoords(wc.lat, wc.lon) ? { name: wc.name.slice(0, 60), lat: wc.lat, lon: wc.lon, detail: typeof wc.detail === "string" ? wc.detail.slice(0, 80) : void 0 } : null;
    const path = typeof w.path === "string" ? w.path : "";
    const mode = w.mode === "image" || w.mode === "folder" || w.mode === "video" && videoPathOk(path) ? w.mode : "gradient";
    const interval = typeof w.intervalSec === "number" && (w.intervalSec === 0 || w.intervalSec >= 5) ? w.intervalSec : DEFAULT_WALLPAPER.intervalSec;
    const out = {
      defaultsV: DEFAULTS_VERSION,
      appIds: stringList(parsed.appIds),
      // older settings listed the apps to SHOW: they are converted once the app list is known
      hiddenIds: stringList(parsed.hiddenIds) !== null ? stringList(parsed.hiddenIds) : stringList(parsed.appIds) === null ? [] : null,
      sourceIds: stringList(parsed.sourceIds) || [],
      tileOrder: stringList(parsed.tileOrder),
      essentials: stringList(parsed.essentials),
      favourites: stringList(parsed.favourites) || [],
      closeHome: parsed.closeHome !== false,
      tvApps: parsed.tvApps === true,
      language: typeof parsed.language === "string" ? languageId(parsed.language) : DEFAULT_LANGUAGE,
      showDebug: parsed.showDebug === true,
      continueWatching: parsed.continueWatching === true,
      replaceHome: parsed.replaceHome === true,
      homeApp: parsed.homeApp === true,
      homeAppPrevious: typeof parsed.homeAppPrevious === "string" && /^[A-Za-z0-9._-]+$/.test(parsed.homeAppPrevious) ? parsed.homeAppPrevious : "",
      powerOnApp: typeof parsed.powerOnApp === "string" && /^[A-Za-z0-9._-]+$/.test(parsed.powerOnApp) ? parsed.powerOnApp : "",
      powerOnNetwork: parsed.powerOnNetwork === true,
      keepReady: parsed.keepReady === true || parsed.keepReady === 3,
      // P73: one switch; a saved level 3 reads as On, levels 1 and 2 as Off
      keepRelaunch: parsed.keepRelaunch === true,
      preloadOff: typeof parsed.preloadOff === "number" && parsed.preloadOff > 0 && parsed.preloadOff < 500 ? Math.floor(parsed.preloadOff) : 0,
      takeoverHome: parsed.takeoverHome === true,
      samHome: parsed.samHome === true,
      screensaver: parsed.screensaver === true,
      // local build: a saved setting without the field reads as Off
      screensaverSource: typeof parsed.screensaverSource !== "string" ? DEFAULT_CONFIG.screensaverSource : (parsed.screensaverSource.charAt(0) === "/" || /^@(photos|video|photo:photo-[0-9][0-9])$/.test(parsed.screensaverSource)) && parsed.screensaverSource.length < 400 ? parsed.screensaverSource : "",
      // P41c: the built-in choices (@photos, @video) were dropped on reload before
      screensaverInterval: typeof parsed.screensaverInterval === "number" && parsed.screensaverInterval >= 5 && parsed.screensaverInterval <= 3600 ? Math.round(parsed.screensaverInterval) : 60,
      screensaverShuffle: parsed.screensaverShuffle !== false,
      screensaverPowerOff: typeof parsed.screensaverPowerOff === "number" && parsed.screensaverPowerOff >= 0 && parsed.screensaverPowerOff <= 86400 ? parsed.screensaverPowerOff === 30 ? 60 : Math.round(parsed.screensaverPowerOff) : parsed.screensaverPowerOff === void 0 ? DEFAULT_CONFIG.screensaverPowerOff : 0,
      screensaverCare: parsed.screensaverCare !== false && parsed.screensaverCare !== "off",
      screensaverDim: parsed.screensaverDim === true,
      screensaverFit: parsed.screensaverFit === "fill" ? "fill" : "fit",
      screensaverRecursive: parsed.screensaverRecursive === true,
      theme: THEME_IDS.indexOf(parsed.theme) !== -1 ? parsed.theme : "black",
      background: BACKGROUND_IDS.indexOf(parsed.background) !== -1 ? parsed.background : "theme",
      iconScale: ranged(parsed.iconScale, "iconScale"),
      iconOpacity: ranged(parsed.iconOpacity, "iconOpacity"),
      iconGap: ranged(parsed.iconGap, "iconGap"),
      wallpaperOpacity: ranged(parsed.wallpaperOpacity, "wallpaperOpacity"),
      fadeStrength: ranged(parsed.fadeStrength, "fadeStrength"),
      fadeHeight: ranged(parsed.fadeHeight, "fadeHeight"),
      iconStyle: ICON_STYLE_IDS.indexOf(parsed.iconStyle) !== -1 ? parsed.iconStyle : "original",
      iconLight: parsed.iconLight === true,
      themeSel: typeof parsed.themeSel === "string" && /^[a-z0-9-]{1,40}$/.test(parsed.themeSel) ? parsed.themeSel : "",
      iconColor: PLAIN_COLOR_IDS.indexOf(parsed.iconColor) !== -1 ? parsed.iconColor : "theme",
      remoteModel: parsed.remoteModel === "magic-2016" || parsed.remoteModel === "magic-2019" || parsed.remoteModel === "magic-2021" || parsed.remoteModel === "magic-2025" ? parsed.remoteModel : "ir",
      tileShape: TILE_SHAPE_IDS.indexOf(parsed.tileShape) !== -1 ? parsed.tileShape : "rounded",
      recentsW: ranged(parsed.recentsW, "recentsW"),
      recentsH: ranged(parsed.recentsH, "recentsH"),
      quietSec: ranged(parsed.quietSec, "quietSec"),
      quietDimSec: ranged(parsed.quietDimSec, "quietDimSec"),
      quietDimLevel: ranged(parsed.quietDimLevel, "quietDimLevel"),
      quietPowerOff: typeof parsed.quietPowerOff === "number" && parsed.quietPowerOff >= 0 && parsed.quietPowerOff <= 86400 ? Math.round(parsed.quietPowerOff) : 0,
      quietFade: parsed.quietFade === true,
      screensaverDimLevel: typeof parsed.screensaverDimLevel === "number" && parsed.screensaverDimLevel >= 10 && parsed.screensaverDimLevel <= 80 ? Math.round(parsed.screensaverDimLevel / 10) * 10 : 40,
      oledShift: parsed.oledShift !== false,
      labelColor: LABEL_COLOR_IDS.indexOf(parsed.labelColor) !== -1 ? parsed.labelColor : "theme",
      labelFont: parsed.labelFont === "default" || CLOCK_FONT_IDS.indexOf(parsed.labelFont) !== -1 ? parsed.labelFont : "default",
      labelSize: typeof parsed.labelSize === "number" && parsed.labelSize >= 80 && parsed.labelSize <= 140 ? Math.round(parsed.labelSize / 10) * 10 : 100,
      labelWeight: LABEL_WEIGHTS.indexOf(parsed.labelWeight) !== -1 ? parsed.labelWeight : 400,
      homeFocus: parsed.homeFocus === "first" ? "first" : "last",
      // p22b: a saved setting without a valid value keeps reading as 'last' (as before); only a fresh install and the reset use the new default
      scrollSpeed: SCROLL_SPEED_IDS.indexOf(parsed.scrollSpeed) !== -1 ? parsed.scrollSpeed : "medium",
      showLabels: parsed.showLabels !== false,
      minimal: parsed.minimal === true,
      showLgHome: parsed.showLgHome !== false,
      inputStatus: parsed.inputStatus !== false,
      // P41c: a saved setting without the field (updaters) reads as On; an explicit Off stays
      showSystem: parsed.showSystem !== false,
      hideSettings: parsed.hideSettings === true,
      orderByRecent: parsed.orderByRecent === true,
      remap: cleanRemap(parsed.remap),
      remapKept: parsed.remapKept === true,
      sourceEdits: cleanEdits(parsed.sourceEdits),
      appEdits: cleanEdits(parsed.appEdits),
      rows: parsed.rows === 2 ? 2 : 1,
      sideMargin: ranged(parsed.sideMargin, "sideMargin"),
      bottomMargin: ranged(parsed.bottomMargin, "bottomMargin"),
      favSideMargin: ranged(parsed.favSideMargin, "favSideMargin"),
      favBottomMargin: ranged(parsed.favBottomMargin, "favBottomMargin"),
      clockFormat: parsed.clockFormat === "tv" || parsed.clockFormat === "24h" || parsed.clockFormat === "12h" ? parsed.clockFormat : DEFAULT_CONFIG.clockFormat,
      clock: {
        size: ranged(c.size, "clockSize"),
        show: c.show !== false,
        weight: c.weight === 300 || c.weight === 400 || c.weight === 500 || c.weight === 600 || c.weight === 700 ? c.weight : 400,
        font: CLOCK_FONT_IDS.indexOf(c.font) !== -1 ? c.font : "outfit",
        top: ranged(c.top, "clockTop"),
        left: ranged(c.left, "clockLeft"),
        color: widgetColor(c.color, parsed.theme),
        ...validInk(c.ink) ? { ink: validInk(c.ink) } : {},
        shadow: c.shadow !== false,
        shadowStrength: ranged(c.shadowStrength, "clockShadow"),
        scrim: typeof c.scrim === "number" ? ranged(c.scrim, "clockScrim") : 0,
        // saved config from before the row existed: stays Off (no change for updaters)
        opacity: ranged(c.opacity, "clockOpacity"),
        showDate: c.showDate !== false,
        showPeriod: c.showPeriod !== false,
        align: c.align === "center" || c.align === "right" ? c.align : "left"
      },
      weather: {
        on: wx.on === true && city !== null,
        city,
        unit: wx.unit === "f" ? "f" : "c",
        showCity: wx.showCity !== false,
        showRange: wx.showRange === true
        // P109: a saved setting without the field reads as Off (same as a fresh install)
      },
      wallpaper: {
        mode: path ? mode : "gradient",
        path,
        intervalSec: interval,
        shuffle: w.shuffle !== false,
        recursive: mode === "folder" && w.recursive === true,
        fit: w.fit === "fit" ? "fit" : "fill",
        videoChange: VIDEO_CHANGE_VALUES.indexOf(w.videoChange) !== -1 ? w.videoChange : DEFAULT_WALLPAPER.videoChange,
        videoShade: w.videoShade !== false
      }
    };
    if (parsed.defaultsV !== DEFAULTS_VERSION) {
      backUpLook(out);
      const fresh = withDefaultLook(out);
      saveConfig(fresh);
      return fresh;
    }
    return out;
  } catch (e) {
    let kept = false;
    try {
      if (raw && !localStorage.getItem(RESCUE_KEY)) {
        localStorage.setItem(RESCUE_KEY, raw);
        kept = true;
      }
    } catch {
    }
    log(`settings: stored value unreadable (${e instanceof Error ? e.message.slice(0, 40) : "error"}); defaults used${kept ? "; raw copy kept" : ""}`);
    return { ...DEFAULT_CONFIG };
  }
}
var saveFailHandler = null;
var failReported = false;
function saveConfig(config) {
  let json = "";
  try {
    json = JSON.stringify(config);
  } catch {
    return false;
  }
  const r = writeWithRoom(localStorage, STORAGE_KEY, json);
  if (r.freed.length) log(`settings: store full, freed ${r.freed.join(", ")}; save ${r.ok ? "ok" : "FAILED"}`);
  else if (!r.ok) log("settings: save FAILED (nothing left to free)");
  if (!r.ok && !failReported) {
    failReported = true;
    if (saveFailHandler) saveFailHandler();
  }
  return r.ok;
}
var INTERVAL_VALUES = WALLPAPER.intervals;
export {
  DEFAULT_CONFIG,
  DENSE_ROWS,
  HEARTH_VERSION,
  MAX_SOURCE_NAME,
  REPORT_FILE,
  SOURCE_ICONS,
  SOURCE_ICON_IDS,
  aboutText,
  allLogLines,
  appTile,
  autoIcon,
  cleanEdits,
  clearLog,
  debugPages,
  extendOrder,
  hiddenAfterUpgrade,
  iconLabel,
  iconPath,
  loadConfig,
  log,
  logLines,
  onLog,
  parseStats,
  readHomebrewVersion,
  readIp,
  readVersions,
  reportText,
  rootNote,
  setEdit,
  suggestedNames,
  toggleHidden,
  visibleApps
};
