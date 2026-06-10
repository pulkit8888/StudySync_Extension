import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storageManager.js";

export async function getSummaries() {
  return getStorageItem(STORAGE_KEYS.summaries, []);
}

export async function addSummary(summary) {
  const summaries = await getSummaries();
  await setStorageItem(STORAGE_KEYS.summaries, [summary, ...summaries]);
  return summary;
}
