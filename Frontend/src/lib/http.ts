export async function readJsonResponse<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!contentType.includes("application/json")) {
    const preview = text.replace(/\s+/g, " ").slice(0, 140);
    throw new Error(`Server returned HTML/non-JSON (HTTP ${response.status}). Check production API URL/deployment. ${preview}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Server returned invalid JSON (HTTP ${response.status}).`);
  }
}
