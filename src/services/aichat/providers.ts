import { parseAIResponse } from "@/utils/aiCommandParser.js";
import type { AIResponseData, ChatAttachment } from "./types.js";
import {
  extractDocumentContext,
  formatFileSize,
} from "./fileAttachmentService.js";

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

/** Calls Ollama API and returns parsed response. */
export async function callOllama(
  systemPrompt: string,
  historyMessages: HistoryMessage[],
  userPrompt: string,
  aiEndpoint: string,
  aiModel: string,
  attachments?: ChatAttachment[],
  signal?: AbortSignal,
): Promise<AIResponseData> {
  const baseUrl =
    aiEndpoint && aiEndpoint.trim()
      ? aiEndpoint.trim().replace(/\/$/, "")
      : "http://localhost:11434";
  const url = baseUrl.includes("/v1")
    ? `${baseUrl}/chat/completions`
    : `${baseUrl}/v1/chat/completions`;
  const modelName = aiModel || "llama3";

  const docContext = extractDocumentContext(attachments || []);
  const finalPrompt = docContext
    ? `${userPrompt}\n\n${docContext}`
    : userPrompt;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: finalPrompt },
      ],
      stream: false,
    }),
    signal,
  });
  if (!res.ok) {
    let errBody = "";
    try {
      errBody = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(
      `Ollama returned status ${res.status}: ${errBody || res.statusText}`,
    );
  }
  const data = await res.json();
  const textResponse = data?.choices?.[0]?.message?.content;
  if (!textResponse) {
    throw new Error("Empty response from Ollama");
  }
  return parseAIResponse(textResponse);
}

/** Calls OpenRouter / 9Router API and returns parsed response. */
export async function callOpenRouter(
  systemPrompt: string,
  historyMessages: HistoryMessage[],
  userPrompt: string,
  aiEndpoint: string,
  aiModel: string,
  aiApiKey: string,
  attachments?: ChatAttachment[],
  signal?: AbortSignal,
): Promise<AIResponseData> {
  const baseUrl =
    aiEndpoint && aiEndpoint.trim()
      ? aiEndpoint.trim().replace(/\/$/, "")
      : "http://localhost:20128/v1";
  const url = `${baseUrl}/chat/completions`;
  const modelName = aiModel && aiModel.trim() ? aiModel.trim() : "free";
  const isLocal =
    baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (aiApiKey && aiApiKey.trim()) {
    headers["Authorization"] = `Bearer ${aiApiKey.trim()}`;
  }
  if (!isLocal) {
    headers["HTTP-Referer"] =
      "https://github.com/halilogia/chrome-extension-todo";
    headers["X-Title"] = "Life OS Dashboard";
  }

  const imageAttachments = attachments?.filter(
    (a) => a.type === "image" && a.dataUrl,
  );
  const docContext = extractDocumentContext(attachments || []);

  let userContent: unknown = userPrompt;
  if (imageAttachments && imageAttachments.length > 0) {
    userContent = [
      {
        type: "text",
        text: docContext ? `${userPrompt}\n\n${docContext}` : userPrompt,
      },
      ...imageAttachments.map((img) => ({
        type: "image_url",
        image_url: { url: img.dataUrl },
      })),
    ];
  } else if (docContext) {
    userContent = `${userPrompt}\n\n${docContext}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: userContent },
      ],
      stream: false,
    }),
    signal,
  });
  if (!res.ok) {
    let errBody = "";
    try {
      errBody = await res.text();
    } catch {
      /* ignore */
    }
    if (res.status === 401) {
      throw new Error(
        "9Router / OpenRouter API anahtarı geçersiz veya eksik. Lütfen Ayarlar > AI Asistan menüsünden API anahtarınızı kontrol edin.",
      );
    }
    throw new Error(
      `OpenRouter / 9Router Hata Döndü (${res.status}): ${errBody || res.statusText}`,
    );
  }
  const data = await res.json();
  const textResponse = data?.choices?.[0]?.message?.content;
  if (!textResponse) {
    throw new Error("Empty response from OpenRouter");
  }
  return parseAIResponse(textResponse);
}

/** Calls Google Gemini API and returns parsed response. */
export async function callGemini(
  systemPrompt: string,
  historyMessages: HistoryMessage[],
  userPrompt: string,
  aiEndpoint: string,
  aiModel: string,
  aiApiKey: string,
  enableWebSearch: boolean,
  attachments?: ChatAttachment[],
  signal?: AbortSignal,
): Promise<AIResponseData> {
  const modelName = aiModel || "gemini-1.5-flash";
  const baseUrl =
    aiEndpoint && aiEndpoint.trim()
      ? aiEndpoint.trim().replace(/\/$/, "")
      : "https://generativelanguage.googleapis.com/v1beta";
  const url = `${baseUrl}/models/${modelName}:generateContent?key=${aiApiKey}`;

  const userParts: Array<Record<string, unknown>> = [{ text: userPrompt }];

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (att.dataUrl && (att.type === "image" || att.type === "pdf")) {
        const base64Data = att.dataUrl.includes(",")
          ? att.dataUrl.split(",")[1]
          : att.dataUrl;
        userParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: base64Data,
          },
        });
      } else if (att.textContent) {
        userParts.push({
          text: `\n[Eklenen Belge: "${att.name}" (${formatFileSize(att.size)})]\n${att.textContent}\n`,
        });
      }
    }
  }

  const reqPayload: Record<string, unknown> = {
    contents: [
      ...historyMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: userParts },
    ],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: "application/json" },
  };

  if (enableWebSearch) {
    reqPayload.tools = [{ googleSearch: {} }];
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqPayload),
    signal,
  });
  if (!res.ok) {
    let errBody = "";
    try {
      errBody = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(
      `Gemini API returned status ${res.status}: ${errBody || res.statusText}`,
    );
  }
  const data = await res.json();
  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("Empty response from Gemini");
  }
  return parseAIResponse(textResponse);
}
