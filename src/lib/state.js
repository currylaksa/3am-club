// Single read/write point for all persisted state. localStorage can throw in
// private mode / when full, so every access is wrapped.

const KEYS = {
  favorites: "wp.favorites",
  watchLog: "wp.watchLog",
  settings: "wp.settings",
  installed: "wp.installed",
};

const DEFAULTS = {
  favorites: [],
  watchLog: {}, // { [fixtureId]: "watched" | "skipped" | "highlights" }
  settings: { spoilerFree: false, wakeTimeMyt: "07:00" },
  installed: false,
};

function read(key) {
  try {
    const raw = localStorage.getItem(KEYS[key]);
    return raw === null ? structuredClone(DEFAULTS[key]) : JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULTS[key]);
  }
}

function write(key, value) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    /* ignore — private mode or quota */
  }
}

/** Load the whole persisted state in one shot. */
export function loadState() {
  return {
    favorites: read("favorites"),
    watchLog: read("watchLog"),
    settings: { ...DEFAULTS.settings, ...read("settings") },
    installed: read("installed"),
  };
}

export function saveFavorites(favorites) {
  write("favorites", favorites);
}
export function saveWatchLog(watchLog) {
  write("watchLog", watchLog);
}
export function saveSettings(settings) {
  write("settings", settings);
}
export function saveInstalled(installed) {
  write("installed", installed);
}

/** Wipe everything (Settings -> reset). */
export function resetAll() {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
