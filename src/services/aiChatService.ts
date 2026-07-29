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
 * Single Authoritative AI Config Loader
 * Guaranteed 0 API error protocol: reads both sync & local, supports both key names, provides 9Router/OpenRouter defaults.
 */
export async function getAIConfigFromStorage(): Promise<{
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  aiShowThinking: boolean;
}> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ["aiProvider", "aiApiKey", "geminiApiKey", "aiModel", "aiEndpoint", "aiShowThinking"],
      (syncRes) => {
        chrome.storage.local.get(
          ["aiProvider", "aiApiKey", "geminiApiKey", "aiModel", "aiEndpoint", "aiShowThinking"],
          (localRes) => {
            const provider =
              (typeof syncRes.aiProvider === "string" && syncRes.aiProvider) ||
              (typeof localRes.aiProvider === "string" && localRes.aiProvider) ||
              "openrouter";

            const rawApiKey =
              syncRes.geminiApiKey ||
              syncRes.aiApiKey ||
              localRes.geminiApiKey ||
              localRes.aiApiKey;
            const apiKey = typeof rawApiKey === "string" ? rawApiKey.trim() : "";

            const rawModel =
              (typeof syncRes.aiModel === "string" && syncRes.aiModel) ||
              (typeof localRes.aiModel === "string" && localRes.aiModel) ||
              "free";
            const model = rawModel.trim() ? rawModel.trim() : "free";

            const rawEndpoint =
              (typeof syncRes.aiEndpoint === "string" && syncRes.aiEndpoint) ||
              (typeof localRes.aiEndpoint === "string" && localRes.aiEndpoint) ||
              "http://localhost:20128/v1";
            const endpoint = rawEndpoint.trim() ? rawEndpoint.trim() : "http://localhost:20128/v1";

            const showThinking =
              syncRes.aiShowThinking !== undefined
                ? syncRes.aiShowThinking
                : localRes.aiShowThinking !== undefined
                  ? localRes.aiShowThinking
                  : true;

            resolve({
              aiProvider: provider,
              aiApiKey: apiKey,
              aiModel: model,
              aiEndpoint: endpoint,
              aiShowThinking: Boolean(showThinking),
            });
          },
        );
      },
    );
  });
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

  // Fetch Personal AI Memory (memory.md) context
  const userMemory: string = await new Promise<string>((r) =>
    chrome.storage.sync.get(["aiUserMemory"], (res: Record<string, any>) =>
      r(typeof res?.aiUserMemory === "string" ? res.aiUserMemory : ""),
    ),
  );

  let memoryContextPrompt = "";
  if (userMemory && userMemory.trim()) {
    memoryContextPrompt = `\n\n--- 🧠 KİŞİSEL KULLANICI HAFIZASI & KİŞİSEL BAĞLAM (memory.md) ---\n${userMemory.trim()}\n\nÖNEMLİ: Tüm yanıtlarında yukarıdaki kişisel kullanıcı hafızasını ve tercihlerini her zaman göz önünde bulundur.`;
  }

  const systemPrompt = `You are a helpful AI Assistant for the Life OS Personal Dashboard Chrome Extension with built-in Google AI Mode Web Research capabilities. The current year is ${new Date().getFullYear()}. The current date is ${todayStr}.
You MUST default to replying in Turkish unless the user explicitly requests you in their prompt to reply in another specific language (e.g. English, Arabic, Korean, French, German, Spanish, etc.). If the user does not explicitly request a foreign language response, always respond in Turkish.
You can chat naturally, but if the user wants to add/create a task, add a diary/note, or wants you to remember a fact/preference about them, you must output a structured JSON response.
${memoryContextPrompt}
${webContextPrompt}

Format your final output ONLY as a JSON object matching this schema:
{
  "reply": "Your conversational response text (default to Turkish unless explicitly requested otherwise). Include [1], [2] citations if web sources were provided.",
  "action": "create_task" | "add_note" | "update_memory" | "none",
  "params": {
    "text": "Task text (only for create_task)",
    "dueDate": "YYYY-MM-DD target date (calculated relative to today's date if requested - only for create_task)",
    "repeat": "none" | "daily" | "weekly" | "monthly" (only for create_task),
    "note_type": "note" | "diary" | "cornell" (only for add_note),
    "note_title": "Title for the note/diary/cornell entry (only for add_note)",
    "note_content": "Content of the note (only for add_note)",
    "note_cues": "Keywords or questions (only for add_note)",
    "note_summary": "Summary of the study material (only for add_note)",
    "memory_fact": "A concise bullet point describing a key personal fact, role, habit, goal, or preference the user told you to remember (only for update_memory)"
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
  } else if (aiProvider === "openrouter" || aiProvider === "9router") {
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
      if (res.status === 401) {
        throw new Error(
          "9Router / OpenRouter API anahtarı geçersiz veya eksik. Lütfen Ayarlar > AI Asistan menüsünden API anahtarınızı kontrol edin.",
        );
      }
      throw new Error(
        `OpenRouter / 9Router Hata Dündü (${res.status}): ${errBody || res.statusText}`,
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
 * Automatically executes structured AI actions (create tasks, add notes/diaries, update memory).
 */
export async function executeAIAction(
  aiResult: AIResponseData,
  lang: string = "tr",
): Promise<void> {
  if (!aiResult.action || aiResult.action === "none") {return;}

  if (aiResult.action === "create_task" && aiResult.params?.text) {
    const text = aiResult.params.text;
    const repeat = aiResult.params.repeat || "none";
    const dueDate = aiResult.params.dueDate || "";

    const todos: any[] = await new Promise((r) =>
      chrome.storage.sync.get(["todos"], (res) => r((res.todos as any[]) || [])),
    );

    const newTodo = {
      id: `task-${Date.now()}`,
      text: text,
      completed: false,
      repeat: repeat,
      dueDate: dueDate,
      status: "todo",
      category: "general",
      createdAt: new Date().toISOString(),
    };

    todos.unshift(newTodo);
    await new Promise<void>((r) => chrome.storage.sync.set({ todos }, r));
  } else if (aiResult.action === "add_note" && aiResult.params?.note_content) {
    const type = aiResult.params.note_type || "note";
    const content = aiResult.params.note_content;
    const title = aiResult.params.note_title;
    const cues = aiResult.params.note_cues;
    const summary = aiResult.params.note_summary;
    await handleAddNoteFromAI(type, content, lang, title, cues, summary);
  } else if (
    aiResult.action === "update_memory" &&
    aiResult.params?.memory_fact
  ) {
    await handleUpdateMemoryFromAI(aiResult.params.memory_fact);
  }
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

/**
 * Appends a new learned personal memory fact from AI Chat to chrome.storage.sync aiUserMemory.
 */
export async function handleUpdateMemoryFromAI(
  newFact: string,
): Promise<void> {
  if (!newFact || !newFact.trim()) {return;}

  const currentMemory: string = await new Promise<string>((r) =>
    chrome.storage.sync.get(["aiUserMemory"], (res: Record<string, any>) =>
      r(typeof res?.aiUserMemory === "string" ? res.aiUserMemory : ""),
    ),
  );

  const dateStr = new Date().toLocaleDateString("tr-TR");
  const cleanFact = `- [${dateStr}] ${newFact.trim()}`;

  let updatedMemory = currentMemory;
  if (!updatedMemory || !updatedMemory.trim()) {
    updatedMemory = `# Kişisel Hafıza & Kullanıcı Bağlamı (memory.md)\n\n## 💡 AI Tarafından Öğrenilen Bilgiler\n${cleanFact}`;
  } else if (updatedMemory.includes("## 💡 AI Tarafından Öğrenilen Bilgiler")) {
    updatedMemory = updatedMemory.replace(
      "## 💡 AI Tarafından Öğrenilen Bilgiler",
      `## 💡 AI Tarafından Öğrenilen Bilgiler\n${cleanFact}`,
    );
  } else {
    updatedMemory = `${updatedMemory.trim()}\n\n## 💡 AI Tarafından Öğrenilen Bilgiler\n${cleanFact}`;
  }

  await new Promise<void>((r) =>
    chrome.storage.sync.set({ aiUserMemory: updatedMemory }, r),
  );
}
