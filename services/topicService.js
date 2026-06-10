import {
  getTopics as getStoredTopics,
  setTopics,
  addTopic,
  updateTopicCount,
  deleteTopic as deleteTopicStorage,
} from "../storage/topicsStorage.js";
import { generateId } from "../storage/storageManager.js";

const TOPICS_JSON_PATH =
  typeof chrome !== "undefined" && chrome.runtime?.getURL
    ? chrome.runtime.getURL("data/topics.json")
    : null;

export async function getDefaultTopics() {
  if (!TOPICS_JSON_PATH) {
    return [];
  }

  try {
    const response = await fetch(TOPICS_JSON_PATH);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getTopics() {
  const storedTopics = await getStoredTopics();
  if (storedTopics.length > 0) {
    return storedTopics;
  }

  const defaultTopics = await getDefaultTopics();
  if (defaultTopics.length > 0) {
    await setTopics(defaultTopics);
    return defaultTopics;
  }

  return [];
}

export async function createTopic(name, color = "#3b82f6") {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Topic name is required");
  }

  const topic = {
    id: generateId("topic"),
    name: trimmed,
    color,
    count: 0,
  };

  await addTopic(topic);
  return topic;
}

export async function deleteTopic(id) {
  return deleteTopicStorage(id);
}

export async function incrementTopicCount(topicId) {
  await updateTopicCount(topicId, 1);
}

export async function decrementTopicCount(topicId) {
  await updateTopicCount(topicId, -1);
}
