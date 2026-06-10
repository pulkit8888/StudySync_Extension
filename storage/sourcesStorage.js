import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storageManager.js";

export async function getSources() {
  return getStorageItem(STORAGE_KEYS.sources, []);
}

export async function addSource(source) {
  const sources = await getSources();
  await setStorageItem(STORAGE_KEYS.sources, [source, ...sources]);
  return source;
}
