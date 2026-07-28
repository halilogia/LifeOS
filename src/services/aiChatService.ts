/**
 * aiChatService.ts
 * Service module for AI API interactions (Ollama, OpenRouter, Gemini), Note creation, and Google AI Mode Web Search Agent.
 * Clean Architecture - Service Layer.
 */

import { parseAIResponse } from "@/utils/aiCommandParser.js";
import {
  executeWebSearch,
  detectNeedsWebSearch,
  type WebSearchSource,
} from "./webSearchAgent.js";

export interface AICallParams {
  userPrompt: string;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  enableWebSearch?: boolean;
}

export interface AIResponseData {
  reply: string;
  action?: string;
  params?: any;
  thinking?: string;
  searchQuery?: string;
  sources?: WebSearchSource[];
}

/**
 * Dispatches prompt request to configured AI Provider API (Ollama, OpenRouter, Gemini) with Google AI Mode Search Agent.
 */
export async function callAIConfigured({
  userPrompt,
  aiProvider,
  aiApiKey,
  aiModel,
  aiEndpoint,
  enableWebSearch = true,
}: AICallParams): Promise<AIResponseData> {
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Google AI Mode Autonomous Web Search Agent Step
  let webSearchData: { query: string; sources: WebSearchSource[] } | null = null;
  const shouldSearch = enableWebSearch && detectNeedsWebSearch(userPrompt);

  if (shouldSearch) {
    try {
      webSearchData = await executeWebSearch(userPrompt);
    } catch (e) {
      console.warn("webSearchAgent execution error:", e);
    }
  }

  let webContextPrompt = "";
  if (webSearchData && webSearchData.sources.length > 0) {
    webContextPrompt =
      `\n\n--- 🌐 CANLI İNTERNET ARAMA SONUÇLARI (Google & Web Real-Time Search Results) ---\n` +
      `Arama Sorgusu: "${webSearchData.query}"\n` +
      webSearchData.sources
        .map(
          (s, i) =>
            `[${i + 1}] Başlık: ${s.title}\n    Link: ${s.url}\n    Özet: ${s.snippet}`,
        )
        .join("\n") +
      `\n\nKURALLAR:\n1. Yanıtını yukarıdaki CANLI İNTERNET ARAMA SONUÇLARINA dayandır.\n2. Bilgileri aktarırken metnin içine [1], [2] şeklinde kaynak numarası ekle.\n3. Yanıtın başında araştırmayı özetle.`;
  }

  const systemPrompt = `You are a helpful AI Assistant for the Life OS Personal Dashboard Chrome Extension with built-in Google AI Mode Web Research capabilities. The current year is ${new Date().getFullYear()}. The current date is ${todayStr}.
You MUST default to replying in Turkish unless the user explicitly requests you in their prompt to reply in another specific language (e.g. English, Arabic, Korean, French, German, Spanish, etc.). If the user does not explicitly request a foreign language response, always respond in Turkish.
You can chat naturally, but if the user wants to add, create, or schedule a task, or add a diary entry/note/study note, you must output a structured JSON response.
${webContextPrompt}

Format your final output ONLY as a JSON object matching this schema:
{
  "reply": "Your conversational response text (default to Turkish unless explicitly requested otherwise). Include [1], [2] citations if web sources were provided.",
  "action": "create_task" | "add_note" | "none",
  "params": {
    "text": "Task text (only for create_task)",
    "dueDate": "YYYY-MM-DD target date (calculated relative to today's date if requested - only for create_task)",
    "repeat": "none" | "daily" | "weekly" | "monthly" (only for create_task),
    "note_type": "note" | "diary" | "cornell" (only for add_note),
    "note_title": "Title for the note/diary/cornell entry (provide a suitable brief title if not explicitly provided - only for add_note)",
    "note_content": "Content of the note or main notes section of Cornell notes (only for add_note)",
    "note_cues": "Keywords, cues or questions (only for Cornell notes, cues/questions derived from context - only for add_note)",
    "note_summary": "A brief summary of the study material (only for Cornell notes - only for add_note)"
  }
}
Output raw JSON only. Do not wrap it in markdown code blocks like \`\`\`json.`;

  let responseData: AIResponseData;

  if (aiProvider === "ollama") {
    const baseUrl =
      aiEndpoint && aiEndpoint.trim()
        ? aiEndpoint.trim().replace(/\/$/, "")
        : "http://localhost:11434";
    const url = baseUrl.includes("/v1")
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/v1/chat/completions`;
    const modelName = aiModel || "llama3";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      let errBody = "";
      try {
        errBody = await res.text();
      } catch {
        // ignore
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
    responseData = parseAIResponse(textResponse);
  } else if (aiProvider === "openrouter") {
    const baseUrl =
      aiEndpoint && aiEndpoint.trim()
        ? aiEndpoint.trim().replace(/\/$/, "")
        : "https://openrouter.ai/api/v1";
    const url = `${baseUrl}/chat/completions`;
    const modelName = aiModel || "google/gemini-2.5-flash";
    const isLocal =
      baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (aiApiKey && aiApiKey.trim()) {
      headers["Authorization"] = `Bearer ${aiApiKey}`;
    }

    if (!isLocal) {
      headers["HTTP-Referer"] =
        "https://github.com/halilogia/chrome-extension-todo";
      headers["X-Title"] = "Life OS Dashboard";
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      let errBody = "";
      try {
        errBody = await res.text();
      } catch {
        // ignore
      }
      throw new Error(
        `OpenRouter API returned status ${res.status}: ${errBody || res.statusText}`,
      );
    }

    const data = await res.json();
    const textResponse = data?.choices?.[0]?.message?.content;
    if (!textResponse) {
      throw new Error("Empty response from OpenRouter");
    }
    responseData = parseAIResponse(textResponse);
  } else {
    // Gemini API with Native Google Search Grounding Tool support
    const modelName = aiModel || "gemini-1.5-flash";
    const baseUrl =
      aiEndpoint && aiEndpoint.trim()
        ? aiEndpoint.trim().replace(/\/$/, "")
        : "https://generativelanguage.googleapis.com/v1beta";
    const url = `${baseUrl}/models/${modelName}:generateContent?key=${aiApiKey}`;

    const reqPayload: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    // Native Gemini Google Search Grounding Tool
    if (enableWebSearch) {
      reqPayload.tools = [{ googleSearch: {} }];
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqPayload),
    });

    if (!res.ok) {
      let errBody = "";
      try {
        errBody = await res.text();
      } catch {
        // ignore
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
    responseData = parseAIResponse(textResponse);
  }

  // Attach search telemetry
  if (webSearchData && webSearchData.sources.length > 0) {
    responseData.searchQuery = webSearchData.query;
    responseData.sources = webSearchData.sources;
  }

  return responseData;
}

/**
 * Creates note, diary, or Cornell study note in chrome.storage.sync notes array.
 */
export async function handleAddNoteFromAI(
  type: "note" | "diary" | "cornell",
  content: string,
  lang: string,
  title?: string,
  cues?: string,
  summary?: string,
): Promise<void> {
  const currentNotes: any[] = await new Promise((r) =>
    chrome.storage.sync.get(["notes"], (res) =>
      r((res.notes as any[]) || []),
    ),
  );
  const formattedDate = new Date().toLocaleDateString(
    lang === "tr" ? "tr-TR" : "en-US",
  );
  const defaultTitle =
    title ||
    (type === "diary"
      ? lang === "tr"
        ? `Günlük - ${formattedDate}`
        : `Diary - ${formattedDate}`
      : type === "cornell"
        ? lang === "tr"
          ? `Ders Notu - ${formattedDate}`
          : `Study Note - ${formattedDate}`
        : lang === "tr"
          ? `Not - ${formattedDate}`
          : `Note - ${formattedDate}`);

  currentNotes.push({
    id: crypto.randomUUID(),
    title: defaultTitle,
    content: content,
    type: type,
    cues: cues || "",
    summary: summary || "",
    createdAt: new Date().toISOString(),
  });
  await new Promise<void>((r) =>
    chrome.storage.sync.set({ notes: currentNotes }, r),
  );
}
