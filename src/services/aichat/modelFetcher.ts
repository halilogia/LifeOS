import { logger } from "@/utils/logger.js";

export async function fetchAvailableModels(
  endpoint: string | undefined,
  apiKey: string | undefined,
): Promise<string[]> {
  const baseUrl =
    endpoint && endpoint.trim()
      ? endpoint.trim().replace(/\/$/, "")
      : "https://openrouter.ai/api/v1";
  const url = `${baseUrl}/models`;
  const headers: Record<string, string> = {};
  if (apiKey && apiKey.trim()) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data && Array.isArray(data.data)) {
    return (data.data as { id: string }[])
      .map((m: { id: string }) => m.id)
      .sort();
  }
  throw new Error("Invalid format");
}
