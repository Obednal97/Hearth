const __glob = () => ({});

// src/config/version.ts
var HEARTH_VERSION = "1.2.0";

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
  // OK held this long enters/leaves re-order mode
  /** Everything that is not needed to show the home screen (re-reading the app list, the helper check,
   *  closing LG Home) waits this long after the launcher appears, so the screen comes up first. */
  backgroundWorkMs: 5e3
};
var STORAGE_KEY = "customlauncher-config-v1";
var WALLPAPER = {
  releaseAfterMs: 3e4,
  // the launcher keeps its wallpaper this long after going to the background, so Home shows it at once
  fadeMs: 1400,
  // cross-fade between pictures (keep in sync with global.css)
  maxPixels: 25e6,
  // pictures larger than this are skipped (too heavy for the TV)
  probeTimeoutMs: 15e3,
  maxFiles: 400,
  // at most this many pictures are used from a folder
  maxBytes: 8 * 1024 * 1024,
  // pictures bigger than this file size are skipped
  chunkBytes: 98304,
  // read per shell call: ~128 KB of base64, safely under the service's output limit; a multiple of 3 so every chunk's base64 stands alone
  parallelChunks: 3,
  intervals: [10, 30, 60, 300, 900, 1800, 3600]
  // seconds, the choices in Settings
};

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

// src/lib/apps.ts
function exec(command, timeoutMs = 8e3) {
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
      return "the TV refused the command";
    case "no-service":
      return "Homebrew Channel service not found";
    case "timeout":
      return "the Homebrew Channel did not answer";
    case "not-webos":
      return "not running on a TV";
    default:
      return "the command failed";
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
  { id: "hdmi", label: "HDMI port", path: "M4 7.5h16v6.2l-2.3 3.3H6.3L4 13.7zM8.5 11h7" },
  { id: "tv", label: "TV", path: "M3 5.5h18v11H3zM8.5 20h7M12 16.5V20" },
  { id: "console", label: "Game console", path: "M3.5 8.5h17v7.5h-17zM7 12.2h6.5M17 12.2h.01M9 19h6" },
  { id: "controller", label: "Game controller", path: "M7 7.5h10a4 4 0 0 1 4 4v1.5a3 3 0 0 1-5.2 2L14.5 14h-5l-1.3 1A3 3 0 0 1 3 13v-1.5a4 4 0 0 1 4-4zM8 10v3M6.5 11.5h3M15.5 10.8h.01M17.5 12.6h.01" },
  { id: "desktop", label: "Desktop PC", path: "M3.5 4.5h17v11h-17zM9 20h6M12 15.5V20" },
  { id: "laptop", label: "Laptop", path: "M5.5 6h13v9h-13zM3 18.5h18l-1.2-3.5H4.2z" },
  { id: "tvbox", label: "TV box / stick", path: "M4 9.5h16v6.5H4zM8 12.8h4M17 12.8h.01" },
  { id: "settop", label: "Cable / satellite box", path: "M3.5 9h17v7h-17zM7 12.5h3M17 11.2h.01M17 13.8h.01" },
  { id: "disc", label: "Disc player", path: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 10.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z" },
  { id: "speaker", label: "Soundbar / speaker", path: "M3 9.5h18v6H3zM7 12.5h.01M17 12.5h.01M10 12.5h4" },
  { id: "antenna", label: "Antenna", path: "M12 12.5v8M8 20.5h8M7.5 9a6 6 0 0 1 9 0M4.7 6.5a10 10 0 0 1 14.6 0M12 12.5h.01" },
  { id: "phone", label: "Phone / tablet", path: "M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5zM11 18h2" },
  { id: "camera", label: "Camera", path: "M4 8h3.5l1.5-2h6l1.5 2H20v10.5H4zM12 10.3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
  { id: "usb", label: "USB", path: "M12 3.5v13M12 16.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 11l4-2.5v-2M12 13.5L8 11V9M15 4.5h2.5v2H15zM6.8 7h2.4v2H6.8z" },
  { id: "input", label: "Other input", path: "M14 4.5h5.5v15H14M3.5 12h11M10.5 8l4 4-4 4" }
];
var SOURCE_ICON_IDS = SOURCE_ICONS.map((i) => i.id);
var SUGGESTED_NAMES = [
  "PlayStation 5",
  "PlayStation 4",
  "Xbox",
  "Nintendo Switch",
  "PC",
  "Laptop",
  "Apple TV",
  "Fire TV",
  "Chromecast",
  "Roku",
  "Cable box",
  "Blu-ray",
  "Soundbar",
  "Camera",
  "Game console"
];
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
  return icon ? icon.label : "Other input";
}

// src/lib/system.ts
function parseStats(out) {
  const kb = (name) => {
    const m = new RegExp(name + ":\\s+(\\d+) kB").exec(out);
    return m ? Math.round(Number(m[1]) / 1024) : -1;
  };
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
  return { ramTotalMB: kb("MemTotal"), ramFreeMB: kb("MemAvailable"), disks };
}

// src/lib/tiles.ts
function appTile(app, edits = {}) {
  const edit = edits[app.id];
  if (!edit) return { key: app.id, label: app.title, imageUrl: app.iconUrl, color: app.color };
  const bundled = edit.icon && isAppIcon(edit.icon) ? appIconUrl(edit.icon) : "";
  return { key: app.id, label: edit.label || app.title, imageUrl: edit.iconData || bundled || (edit.icon ? void 0 : app.iconUrl), sourceIcon: edit.iconData || bundled ? void 0 : edit.icon, color: app.color };
}

// src/lib/log.ts
var MAX_LINES = 40;
var MAX_CHARS = 110;
var lines = [];
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
  const line = `${stamp} ${clean2}`.slice(0, MAX_CHARS);
  lines.push(line);
  listeners.forEach((fn) => fn(line));
  if (lines.length > MAX_LINES) lines.shift();
}
function logLines() {
  return lines.slice();
}
function clearLog() {
  lines.length = 0;
}

// src/lib/debuginfo.ts
var WIDTH = 118;
var LEFT_WIDTH = 76;
var RIGHT_WIDTH = 60;
var DENSE_ROWS = 22;
var LOW_RAM_MB = 100;
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
    `Web view: ${chrome ? "Chrome " + chrome[1] : "unknown"}   Screen: ${typeof window !== "undefined" ? window.innerWidth + "\xD7" + window.innerHeight : "?"}`,
    s.appList ? `App list: ${s.appList.count} apps from the ${s.appList.source === "homebrew" ? "live Homebrew list" : s.appList.source === "tv" ? "TV's remote-control service (experimental)" : "built-in list"} (${s.appList.ago})` : "App list: not read yet",
    `Weather: ${s.weather}`,
    "",
    `Theme ${c.theme}, background ${c.background}, icons ${c.iconScale}%, ${c.rows} row${c.rows === 1 ? "" : "s"}, labels ${yn(c.showLabels)}, minimal ${yn(c.minimal)}`,
    `Wallpaper ${c.wallpaper.mode}${c.wallpaper.path ? " " + c.wallpaper.path : ""}`,
    `Close LG Home ${c.closeHome ? "on" : "switched off (it kept coming back)"}, helper ${yn(c.replaceHome)}, SAM method ${yn(c.takeoverHome)}`,
    `Hidden apps ${c.hiddenIds ? c.hiddenIds.length : "?"}, sources shown ${c.sourceIds.length}, edited sources ${Object.keys(c.sourceEdits).length}`,
    `LG Home tile ${yn(c.showLgHome)}, System Settings tile ${yn(c.showSystem)}`
  ].filter((l, i) => l !== "" || i === 5);
  const st = s.stats;
  state2.push("");
  if (st) {
    if (st.ramFreeMB >= 0 && st.ramFreeMB < LOW_RAM_MB) state2.unshift("FREE RAM TOO LOW: HEARTH MIGHT BEHAVE UNEXPECTEDLY", "");
    state2.push(`Memory: ${gb(st.ramFreeMB)} free of ${gb(st.ramTotalMB)}`);
    const appStore = st.disks.filter((d) => d.mount === APP_STORAGE);
    (appStore.length ? appStore : st.disks).forEach((d) => state2.push(`Storage ${d.mount}: ${gb(d.freeMB)} free of ${gb(d.totalMB)}`));
  } else state2.push("Memory and storage: not available (needs a rooted TV)");
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
function reportText(pages, allEvents, beforeRestart) {
  const base = pages.map((p) => p.title + "\n" + p.lines.join("\n") + (p.right ? "\n\n" + p.right.title + "\n" + p.right.lines.join("\n") : "")).join("\n\n") + "\n";
  const earlier = beforeRestart && beforeRestart.length ? "\nBefore the last restart (end of the old file)\n" + beforeRestart.join("\n") + "\n" : "";
  return (allEvents && allEvents.length ? base + "\nAll events since this start (oldest first)\n" + allEvents.join("\n") + "\n" : base) + earlier;
}

// src/lib/backgrounds.ts
var plain = (c) => [c, c, c];
var BACKGROUNDS = [
  { id: "theme", label: "The theme's own", colors: ["", "", ""] },
  { id: "nature-show", label: "Slideshow: Nature photos", colors: ["#10161a", "#10161a", "#080b0d"] },
  { id: "nature-01", label: "Photo: Nature 1", colors: ["#181e22", "#1a1e21", "#0d1115"], image: "wallpapers/nature-01.jpg" },
  { id: "nature-02", label: "Photo: Nature 2", colors: ["#262e36", "#5e6061", "#545350"], image: "wallpapers/nature-02.jpg" },
  { id: "nature-03", label: "Photo: Nature 3", colors: ["#2e2e4c", "#23182c", "#29233c"], image: "wallpapers/nature-03.jpg" },
  { id: "nature-04", label: "Photo: Nature 4", colors: ["#003236", "#033c35", "#011010"], image: "wallpapers/nature-04.jpg" },
  { id: "nature-05", label: "Photo: Nature 5", colors: ["#42434b", "#182832", "#0d1820"], image: "wallpapers/nature-05.jpg" },
  { id: "nature-06", label: "Photo: Nature 6", colors: ["#455b6c", "#324251", "#162632"], image: "wallpapers/nature-06.jpg" },
  { id: "nature-07", label: "Photo: Nature 7", colors: ["#07263f", "#143048", "#1c1a1a"], image: "wallpapers/nature-07.jpg" },
  { id: "nature-08", label: "Photo: Nature 8", colors: ["#3b4f54", "#656b61", "#443730"], image: "wallpapers/nature-08.jpg" },
  { id: "nature-09", label: "Photo: Nature 9", colors: ["#0e140e", "#0b100b", "#050a06"], image: "wallpapers/nature-09.jpg" },
  { id: "nature-10", label: "Photo: Nature 10", colors: ["#3c3934", "#262824", "#161f1d"], image: "wallpapers/nature-10.jpg" },
  { id: "nature-11", label: "Photo: Nature 11", colors: ["#051621", "#13333e", "#12262d"], image: "wallpapers/nature-11.jpg" },
  { id: "charcoal", label: "Plain: charcoal", colors: plain("#1a1a1a") },
  { id: "navy", label: "Plain: deep navy", colors: plain("#0d1b2a") },
  { id: "dusk", label: "Gradient: Dusk (dark)", colors: ["#2b1055", "#5b2a86", "#1a0b2e"] },
  { id: "ocean", label: "Gradient: Ocean (dark)", colors: ["#06202e", "#0b4a63", "#04141c"] },
  { id: "forest", label: "Gradient: Forest (dark)", colors: ["#0b2415", "#1c4a2c", "#07140c"] },
  { id: "ember", label: "Gradient: Ember (dark)", colors: ["#2a0a0a", "#6b1d14", "#14070a"] },
  { id: "aurora", label: "Gradient: Aurora (dark)", colors: ["#06181f", "#0f4c4a", "#1b2a5e"] },
  { id: "cloud", label: "Gradient: Cloud (light)", colors: ["#c6d0dc", "#aebbca", "#93a5b8"] },
  { id: "peach", label: "Gradient: Peach (light)", colors: ["#f2d8c6", "#e6bfa6", "#d4a088"] },
  { id: "mint", label: "Gradient: Mint (light)", colors: ["#cfe3d6", "#b2d3bf", "#8fbba3"] },
  { id: "sky", label: "Gradient: Sky (light)", colors: ["#c9dcee", "#aac7e2", "#86acd0"] },
  { id: "lavender", label: "Gradient: Lavender (light)", colors: ["#ddd5ee", "#c6b9e0", "#a99bcc"] }
];
var NATURE_IDS = BACKGROUNDS.filter((b) => !!b.image).map((b) => b.id);
var BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);

// src/lib/clockfont.ts
var CLOCK_FONTS = [
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
  { id: "pixelify", label: "Pixelify Sans (pixel)", family: '"Pixelify Sans", "Courier New", monospace' }
];
var CLOCK_FONT_IDS = CLOCK_FONTS.map((f) => f.id);

// src/lib/clockcolor.ts
var CLOCK_COLORS = [
  { id: "white", label: "White", color: "#F2F2F2", accent: "#F2F2F2" },
  { id: "warm", label: "Warm white", color: "#FFE9C7", accent: "#FFE9C7" },
  { id: "blue", label: "Ice blue", color: "#C4E2FF", accent: "#C4E2FF" },
  { id: "amber", label: "Amber", color: "#FFB74D", accent: "#FFB74D" },
  { id: "grey", label: "Grey", color: "#9AA0A6", accent: "#9AA0A6" },
  { id: "charcoal", label: "Dark grey", color: "#3C4043", accent: "#3C4043", dark: true },
  { id: "black", label: "Black", color: "#0A0A0A", accent: "#0A0A0A", dark: true },
  { id: "ember", label: "Gradient: Ember (red to gold)", gradient: "linear-gradient(90deg, #D62839 0%, #F08C1A 100%)", accent: "#F0803F" },
  { id: "ocean", label: "Gradient: Ocean (deep blue to aqua)", gradient: "linear-gradient(90deg, #1E4FD8 0%, #19C6D8 100%)", accent: "#1F8BDA", dark: true },
  { id: "dusk", label: "Gradient: Dusk (violet to coral)", gradient: "linear-gradient(90deg, #6A2FC9 0%, #F2634F 100%)", accent: "#A04A9A", dark: true }
];
var CLOCK_COLOR_IDS = CLOCK_COLORS.map((c) => c.id);
var LABEL_COLOR_IDS = ["theme"].concat(CLOCK_COLORS.filter((c) => !!c.color).map((c) => c.id));

// src/lib/tileshape.ts
var TILE_SHAPES = [
  { id: "rounded", label: "Rounded square" },
  { id: "square", label: "Sharp square" },
  { id: "squircle", label: "Soft squircle" },
  { id: "circle", label: "Circle" },
  { id: "leaf", label: "Leaf" },
  { id: "arch", label: "Arch" },
  { id: "drop", label: "Teardrop" }
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
var REMOVE_COMMAND = `${STOP_WATCHER}; rm -f '${ALLOW_FILE}' '${ALIVE_FILE}' '${HOOK_LINK}'; while grep -q ' ${APP_QML} ' /proc/mounts; do umount '${APP_QML}' || break; done; rm -rf '${HOOK_DIR}'; echo removed`;
var VERSION_COMMAND = `cat '${HOOK_DIR}/version' 2>/dev/null; true`;
var STATUS_COMMAND = `if [ -f '${PID_FILE}' ] && kill -0 "$(cat '${PID_FILE}')" 2>/dev/null; then echo running; fi; if [ -L '${HOOK_LINK}' ]; then echo linked; fi; true`;

// src/lib/remapcmd.ts
var REMAP_DIR = "/media/developer/launcher-remap";
var REMAP_LINK = "/var/lib/webosbrew/init.d/47-launcher-remap";
var DEFAULT_REMAP = { on: false, keys: {} };
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
      if (NAME_RE.test(name) && action) keys[name] = action;
    });
  }
  return { on: v.on === true, keys };
}
var CHECK_COMMAND = withStatus(`if [ -f '${REMAP_DIR}/apply.sh' ]; then sh '${REMAP_DIR}/apply.sh' check; else echo files-missing; fi`);
var VERSION_COMMAND2 = `cat '${REMAP_DIR}/version' 2>/dev/null; true`;
var REMOVE_COMMAND2 = withStatus(`rm -f '${REMAP_LINK}'; if [ -f '${REMAP_DIR}/apply.sh' ]; then sh '${REMAP_DIR}/apply.sh' off; else echo removed; fi; rm -rf '${REMAP_DIR}'`);

// src/lib/storage.ts
var RANGES = {
  iconScale: { min: 50, max: 140, step: 10, def: 90 },
  // % of the standard tile size
  sideMargin: { min: 0, max: 300, step: 10, def: 20 },
  // px at 1080p, left and right of the app row
  bottomMargin: { min: 0, max: 200, step: 10, def: 10 },
  // px at 1080p, below the app row
  clockSize: { min: 80, max: 220, step: 10, def: 140 },
  // px, height of the digits
  clockTop: { min: 0, max: 70, step: 2, def: 28 },
  // % of the screen height (0 = the very top)
  clockLeft: { min: 0, max: 100, step: 2, def: 50 },
  // % of the screen width (where the clock's centre sits)
  clockShadow: { min: 10, max: 100, step: 10, def: 50 },
  // % (strength of the widget's drop shadow)
  clockOpacity: { min: 10, max: 100, step: 10, def: 100 },
  // % (how solid the clock, date and weather are)
  iconOpacity: { min: 30, max: 100, step: 10, def: 100 },
  // % (how solid the icons of the home row are)
  iconGap: { min: 50, max: 200, step: 10, def: 100 },
  // % of the standard space between the home row's icons
  wallpaperOpacity: { min: 30, max: 100, step: 10, def: 100 },
  // % (how solid the picture is; lower lets the background show through)
  quietSec: { min: 0, max: 60, step: 10, def: 0 },
  // seconds without a key before the apps hide (0 = off)
  fadeStrength: { min: 0, max: 100, step: 5, def: 30 },
  // % darkness of the bottom fade over the wallpaper (0 = off)
  fadeHeight: { min: 20, max: 100, step: 5, def: 50 },
  // % of the screen height the bottom fade covers
  recentsW: { min: 30, max: 100, step: 5, def: 60 },
  // % of the screen width of the Recent apps panel
  recentsH: { min: 30, max: 60, step: 5, def: 30 }
  // % of the screen height of the Recent apps panel
};
var THEME_IDS = ["black", "grey", "midnight", "forest", "cloud", "sand", "mist"];
var DEFAULT_WALLPAPER = {
  mode: "gradient",
  path: "",
  intervalSec: 60,
  shuffle: true
};
var DEFAULT_WEATHER = {
  on: true,
  city: DEFAULT_CITY,
  unit: "c",
  showCity: true,
  showRange: false
};
var DEFAULT_CLOCK = {
  size: RANGES.clockSize.def,
  weight: 200,
  font: "inter",
  top: RANGES.clockTop.def,
  left: RANGES.clockLeft.def,
  color: "white",
  shadow: true,
  shadowStrength: RANGES.clockShadow.def,
  opacity: RANGES.clockOpacity.def,
  showDate: true,
  showPeriod: true
};
var DEFAULT_CONFIG = {
  appIds: null,
  hiddenIds: [],
  sourceIds: [],
  tileOrder: null,
  closeHome: true,
  tvApps: false,
  showDebug: false,
  replaceHome: false,
  takeoverHome: false,
  homeApp: false,
  homeAppPrevious: "",
  remap: DEFAULT_REMAP,
  theme: "black",
  background: "theme",
  iconScale: RANGES.iconScale.def,
  iconOpacity: RANGES.iconOpacity.def,
  iconGap: RANGES.iconGap.def,
  wallpaperOpacity: RANGES.wallpaperOpacity.def,
  fadeStrength: RANGES.fadeStrength.def,
  fadeHeight: RANGES.fadeHeight.def,
  tileShape: "rounded",
  recentsW: RANGES.recentsW.def,
  recentsH: RANGES.recentsH.def,
  quietSec: RANGES.quietSec.def,
  oledShift: true,
  labelColor: "theme",
  showLabels: true,
  minimal: false,
  showLgHome: true,
  showSystem: true,
  inputStatus: true,
  continueWatching: false,
  appPreviews: false,
  sourceEdits: {},
  appEdits: {},
  rows: 1,
  sideMargin: RANGES.sideMargin.def,
  bottomMargin: RANGES.bottomMargin.def,
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
function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    const w = parsed.wallpaper || {};
    const c = parsed.clock || {};
    const wx = parsed.weather || DEFAULT_WEATHER;
    const wc = wx.city;
    const city = wc && typeof wc.name === "string" && wc.name && validCoords(wc.lat, wc.lon) ? { name: wc.name.slice(0, 60), lat: wc.lat, lon: wc.lon, detail: typeof wc.detail === "string" ? wc.detail.slice(0, 80) : void 0 } : null;
    const mode = w.mode === "image" || w.mode === "folder" ? w.mode : "gradient";
    const path = typeof w.path === "string" ? w.path : "";
    const interval = typeof w.intervalSec === "number" && w.intervalSec >= 5 ? w.intervalSec : DEFAULT_WALLPAPER.intervalSec;
    return {
      appIds: stringList(parsed.appIds),
      // older settings listed the apps to SHOW: they are converted once the app list is known
      hiddenIds: stringList(parsed.hiddenIds) !== null ? stringList(parsed.hiddenIds) : stringList(parsed.appIds) === null ? [] : null,
      sourceIds: stringList(parsed.sourceIds) || [],
      tileOrder: stringList(parsed.tileOrder),
      closeHome: parsed.closeHome !== false,
      tvApps: parsed.tvApps === true,
      showDebug: parsed.showDebug === true,
      replaceHome: parsed.replaceHome === true,
      takeoverHome: parsed.takeoverHome === true,
      homeApp: parsed.homeApp === true,
      homeAppPrevious: typeof parsed.homeAppPrevious === "string" && /^[A-Za-z0-9._-]+$/.test(parsed.homeAppPrevious) ? parsed.homeAppPrevious : "",
      remap: cleanRemap(parsed.remap),
      theme: THEME_IDS.indexOf(parsed.theme) !== -1 ? parsed.theme : "black",
      background: BACKGROUND_IDS.indexOf(parsed.background) !== -1 ? parsed.background : "theme",
      iconScale: ranged(parsed.iconScale, "iconScale"),
      iconOpacity: ranged(parsed.iconOpacity, "iconOpacity"),
      iconGap: ranged(parsed.iconGap, "iconGap"),
      wallpaperOpacity: ranged(parsed.wallpaperOpacity, "wallpaperOpacity"),
      fadeStrength: ranged(parsed.fadeStrength, "fadeStrength"),
      fadeHeight: ranged(parsed.fadeHeight, "fadeHeight"),
      tileShape: TILE_SHAPE_IDS.indexOf(parsed.tileShape) !== -1 ? parsed.tileShape : "rounded",
      recentsW: ranged(parsed.recentsW, "recentsW"),
      recentsH: ranged(parsed.recentsH, "recentsH"),
      quietSec: ranged(parsed.quietSec, "quietSec"),
      oledShift: parsed.oledShift !== false,
      labelColor: LABEL_COLOR_IDS.indexOf(parsed.labelColor) !== -1 ? parsed.labelColor : "theme",
      showLabels: parsed.showLabels !== false,
      minimal: parsed.minimal === true,
      showLgHome: parsed.showLgHome !== false,
      inputStatus: parsed.inputStatus !== false,
      continueWatching: parsed.continueWatching === true,
      appPreviews: parsed.appPreviews === true,
      showSystem: parsed.showSystem !== false,
      sourceEdits: cleanEdits(parsed.sourceEdits),
      appEdits: cleanEdits(parsed.appEdits),
      rows: parsed.rows === 2 ? 2 : 1,
      sideMargin: ranged(parsed.sideMargin, "sideMargin"),
      bottomMargin: ranged(parsed.bottomMargin, "bottomMargin"),
      clockFormat: parsed.clockFormat === "tv" || parsed.clockFormat === "24h" || parsed.clockFormat === "12h" ? parsed.clockFormat : DEFAULT_CONFIG.clockFormat,
      clock: {
        size: ranged(c.size, "clockSize"),
        weight: c.weight === 300 || c.weight === 400 || c.weight === 500 || c.weight === 600 || c.weight === 700 ? c.weight : 200,
        font: CLOCK_FONT_IDS.indexOf(c.font) !== -1 ? c.font : "inter",
        top: ranged(c.top, "clockTop"),
        left: ranged(c.left, "clockLeft"),
        color: CLOCK_COLOR_IDS.indexOf(c.color) !== -1 ? c.color : "white",
        shadow: c.shadow !== false,
        shadowStrength: ranged(c.shadowStrength, "clockShadow"),
        opacity: ranged(c.opacity, "clockOpacity"),
        showDate: c.showDate !== false,
        showPeriod: c.showPeriod !== false
      },
      weather: {
        on: wx.on === true && city !== null,
        city,
        unit: wx.unit === "f" ? "f" : "c",
        showCity: wx.showCity !== false,
        showRange: wx.showRange !== false
      },
      wallpaper: {
        mode: path ? mode : "gradient",
        path,
        intervalSec: interval,
        shuffle: w.shuffle !== false
      }
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}
var INTERVAL_VALUES = WALLPAPER.intervals;
export {
  DEFAULT_CONFIG,
  DENSE_ROWS,
  HEARTH_VERSION,
  LOW_RAM_MB,
  MAX_SOURCE_NAME,
  REPORT_FILE,
  SOURCE_ICONS,
  SOURCE_ICON_IDS,
  SUGGESTED_NAMES,
  aboutText,
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
  toggleHidden,
  visibleApps
};
