import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storageManager.js";

export async function getTopics() {
  return getStorageItem(STORAGE_KEYS.topics, []);
}

export async function setTopics(topics) {
  return setStorageItem(STORAGE_KEYS.topics, topics);
}

export async function addTopic(topic) {
  const topics = await getTopics();
  await setTopics([topic, ...topics]);
  return topic;
}

export async function updateTopicCount(topicId, delta) {
  const topics = await getTopics();
  await setTopics(
    topics.map((topic) =>
      topic.id === topicId
        ? { ...topic, count: Math.max(0, (topic.count || 0) + delta) }
        : topic,
    ),
  );
}

export async function deleteTopic(topicId) {
  const topics = await getTopics();
  await setTopics(topics.filter((topic) => topic.id !== topicId));
}
