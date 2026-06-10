const STORAGE_KEYS = {
  topics: "ss.topics",
  bookmarks: "ss.bookmarks",
  summaries: "ss.summaries",
  notes: "ss.notes",
  sources: "ss.sources",
};

const hasChromeStorage =
  typeof chrome !== "undefined" &&
  !!(chrome.storage && chrome.storage.local);

export async function getStorageItem(key, fallback) {
  if (!hasChromeStorage) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] ?? fallback);
    });
  });
}

export async function setStorageItem(key, value) {
  if (!hasChromeStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write failures on localStorage
    }
    return;
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export { STORAGE_KEYS };