const API_BASE_URL = "";

async function post(path, body) {
  if (!API_BASE_URL) {
    throw new Error("No API base url configured");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export const apiService = { post };
