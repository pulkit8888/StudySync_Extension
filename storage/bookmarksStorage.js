import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storageManager.js";

export async function getBookmarks() {
  return getStorageItem(STORAGE_KEYS.bookmarks, []);
}

export async function setBookmarks(bookmarks) {
  return setStorageItem(STORAGE_KEYS.bookmarks, bookmarks);
}

export async function addBookmark(bookmark) {
  const bookmarks = await getBookmarks();
  await setBookmarks([bookmark, ...bookmarks]);
  return bookmark;
}

export async function updateBookmark(id, changes) {
  const bookmarks = await getBookmarks();
  let updated = null;
  const next = bookmarks.map((bookmark) =>
    bookmark.id === id ? ((updated = { ...bookmark, ...changes }), updated) : bookmark,
  );
  if (updated) {
    await setBookmarks(next);
  }
  return updated;
}

export async function removeBookmark(id) {
  const bookmarks = await getBookmarks();
  const next = bookmarks.filter((bookmark) => bookmark.id !== id);
  await setBookmarks(next);
  return bookmarks.find((bookmark) => bookmark.id === id) || null;
}
