import { apiService } from "./apiService.js";
import { addSummary, getSummaries } from "../storage/summariesStorage.js";

function buildMockSummary(text) {
  const cleanText = text.trim();
  const firstSentence = cleanText
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)[0]
    .slice(0, 160);

  const headline = firstSentence || cleanText.slice(0, 160);
  const sentence = headline.endsWith(".") ? headline : `${headline}.`;

  return [
    `Core idea: ${sentence}`,
    "Highlights the main terminology worth remembering.",
    "Surfaces practical takeaways for revision.",
    "Connects to broader concepts in this topic.",
  ];
}

export async function generateSummary(text) {
  const trimmed = text.trim();
  if (trimmed.length < 3) {
    return { bullets: buildMockSummary(trimmed), source: "mock" };
  }

  try {
    const response = await apiService.post("/summary", { text: trimmed });
    if (
      response &&
      Array.isArray(response.summary) &&
      response.summary.every((item) => typeof item === "string")
    ) {
      return { bullets: response.summary, source: "api" };
    }
  } catch {
    /* fallback to mock summary */
  }

  return { bullets: buildMockSummary(trimmed), source: "mock" };
}

export async function saveSummary(summary) {
  return addSummary(summary);
}

export async function getSavedSummaries() {
  return getSummaries();
}
