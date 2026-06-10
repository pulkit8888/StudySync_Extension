import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storageManager.js";

export async function getNotes() {
  return getStorageItem(STORAGE_KEYS.notes, []);
}

export async function addNote(note) {
  const notes = await getNotes();
  await setStorageItem(STORAGE_KEYS.notes, [note, ...notes]);
  return note;
}
