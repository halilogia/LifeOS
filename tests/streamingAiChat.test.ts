import { describe, it, expect, vi } from "vitest";
import { callOpenRouter, callGemini } from "@/services/aichat/providers.js";

describe("Streaming AI Chat & Providers", () => {
  it("should stream OpenRouter SSE chunks progressively to onChunk callback", async () => {
    const ssePayload = [
      'data: {"choices":[{"delta":{"content":"Merhaba"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" nasıl"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" yardımcı olabilirim?"}}]}\n\n',
      "data: [DONE]\n\n",
    ].join("");

    const mockResponse = new Response(ssePayload, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const chunks: string[] = [];
    const onChunk = vi.fn((accumulated: string, delta: string) => {
      chunks.push(delta);
    });

    const result = await callOpenRouter(
      "system prompt",
      [],
      "selam",
      "http://localhost:20128/v1",
      "free",
      "test_key",
      undefined,
      undefined,
      onChunk,
    );

    expect(result.reply).toBe("Merhaba nasıl yardımcı olabilirim?");
    expect(onChunk).toHaveBeenCalledTimes(3);
    expect(chunks.join("")).toBe("Merhaba nasıl yardımcı olabilirim?");

    vi.unstubAllGlobals();
  });

  it("should stream Gemini SSE chunks progressively without JSON parse errors", async () => {
    const geminiSsePayload = [
      'data: {"candidates":[{"content":{"parts":[{"text":"Kod hazır:"}]}}]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":" console.log(42);"}]}}]}\n\n',
    ].join("");

    const mockResponse = new Response(geminiSsePayload, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const chunks: string[] = [];
    const onChunk = vi.fn((accumulated: string, delta: string) => {
      chunks.push(delta);
    });

    const result = await callGemini(
      "system prompt",
      [],
      "kod ver",
      "https://generativelanguage.googleapis.com/v1beta",
      "gemini-1.5-flash",
      "test_gemini_key",
      false,
      undefined,
      undefined,
      onChunk,
    );

    expect(result.reply).toBe("Kod hazır: console.log(42);");
    expect(onChunk).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });
});
