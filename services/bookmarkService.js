import {
  getBookmarks as getStoredBookmarks,
  addBookmark as addBookmarkRecord,
  updateBookmark as updateBookmarkRecord,
  removeBookmark as removeBookmarkRecord,
  setBookmarks as setStoredBookmarks,
} from "../storage/bookmarksStorage.js";
import * as topicService from "./topicService.js";
import { generateId } from "../storage/storageManager.js";

export async function getBookmarks() {
  return getStoredBookmarks();
}

export async function saveBookmark(bookmark) {
  const item = {
    id: generateId("bm"),
    ...bookmark,
    createdAt: Date.now(),
  };

  await addBookmarkRecord(item);
  await topicService.incrementTopicCount(item.topicId);
  return item;
}

export async function updateBookmark(id, updates) {
  const bookmarks = await getStoredBookmarks();
  const existing = bookmarks.find((entry) => entry.id === id);
  if (!existing) {
    return null;
  }

  const updated = { ...existing, ...updates };
  await setStoredBookmarks(
    bookmarks.map((entry) => (entry.id === id ? updated : entry)),
  );

  if (updates.topicId && updates.topicId !== existing.topicId) {
    await topicService.incrementTopicCount(updates.topicId);
    await topicService.decrementTopicCount(existing.topicId);
  }

  return updated;
}

export async function removeBookmark(id) {
  const bookmarks = await getStoredBookmarks();
  const existing = bookmarks.find((entry) => entry.id === id);
  if (!existing) {
    return null;
  }

  await removeBookmarkRecord(id);
  await topicService.decrementTopicCount(existing.topicId);
  return existing;
}
