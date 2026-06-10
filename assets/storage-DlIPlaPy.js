import { generateId } from "../storage/storageManager.js";
import * as topicStorage from "../storage/topicsStorage.js";
import * as bookmarkStorage from "../storage/bookmarksStorage.js";
import * as summaryStorage from "../storage/summariesStorage.js";
import * as notesStorage from "../storage/notesStorage.js";
import * as sourcesStorage from "../storage/sourcesStorage.js";

export const D = generateId;
export const s = {
  getTopics: topicStorage.getTopics,
  setTopics: topicStorage.setTopics,
  addTopic: topicStorage.addTopic,
  updateTopicCount: topicStorage.updateTopicCount,
  deleteTopic: topicStorage.deleteTopic,
  getBookmarks: bookmarkStorage.getBookmarks,
  addBookmark: bookmarkStorage.addBookmark,
  updateBookmark: bookmarkStorage.updateBookmark,
  removeBookmark: bookmarkStorage.removeBookmark,
  getSummaries: summaryStorage.getSummaries,
  addSummary: summaryStorage.addSummary,
  getNotes: notesStorage.getNotes,
  addNote: notesStorage.addNote,
  getSources: sourcesStorage.getSources,
  addSource: sourcesStorage.addSource,
};
export const u = {
  getTopics: topicStorage.getTopics,
  getBookmarks: bookmarkStorage.getBookmarks,
  getSummaries: summaryStorage.getSummaries,
  getNotes: notesStorage.getNotes,
  getSources: sourcesStorage.getSources,
};
