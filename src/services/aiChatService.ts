/**
 * aiChatService.ts
 * Service module for AI API interactions (Ollama, OpenRouter, Gemini),
 * Note creation, and AI action execution.
 * Clean Architecture — Service Layer with injected repositories.
 */

import { parseAIResponse } from "@/utils/aiCommandParser.js";
import { getTranslation } from "@/utils/i18n.js";
import {
  executeWebSearch,
  detectNeedsWebSearch,
  type WebSearchSource,
} from "./webSearchAgent.js";
import type { IAiConfigRepository } from "@/domain/repositories/IAiConfigRepository.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { INoteRepository, Note } from "@/domain/repositories/INoteRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Language } from "@/domain/value-objects/Language.js";

export interface AICallParams {
  userPrompt: string;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  enableWebSearch?: boolean;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AIResponseData {
  reply: string;
  action?: string;
  params: Record<string, unknown> | null;
  thinking?: string;
  searchQuery?: string;
  sources?: WebSearchSource[];
}

export interface AiChatDependencies {
  aiConfigRepo: IAiConfigRepository;
  memoryRepo: IMemoryRepository;
  todoRepo: ITodoRepository;
  noteRepo: INoteRepository;
}

export function createAiChatService(deps: AiChatDependencies) {
  const { aiConfigRepo, memoryRepo, todoRepo, noteRepo } = deps;

  /** Single authoritative AI config loader: sync → local → defaults. */
  async function getAIConfigFromStorage() {
    return aiConfigRepo.getConfig();
  }

  /** Builds the system prompt with web search context and user memory. */
  async function buildSystemPrompt(
    userPrompt: string,
    enableWebSearch: boolean,
  ): Promise<{
    systemPrompt: string;
    webSearchData: { query: string; sources: WebSearchSource[] } | null;
  }> {
    const todayStr = new Date().toISOString().split("T")[0];

    // Web search step
    let webSearchData: { query: string; sources: WebSearchSource[] } | null = null;
    const shouldSearch = enableWebSearch && detectNeedsWebSearch(userPrompt);

    if (shouldSearch) {
      try {
        webSearchData = await executeWebSearch(userPrompt);
      } catch (e) {
        logger.warn("webSearchAgent execution error:", e);
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
    const userMemory: string = await memoryRepo.getMemory();
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

    return { systemPrompt, webSearchData };
  }

  /** Calls Ollama API and returns parsed response. */
  async function callOllama(
    systemPrompt: string,
    historyMessages: Array<{ role: "user" | "assistant"; content: string }>,
    userPrompt: string,
    aiEndpoint: string,
    aiModel: string,
  ): Promise<AIResponseData> {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });
    if (!res.ok) {
      let errBody = "";
      try { errBody = await res.text(); } catch { /* ignore */ }
      throw new Error(`Ollama returned status ${res.status}: ${errBody || res.statusText}`);
    }
    const data = await res.json();
    const textResponse = data?.choices?.[0]?.message?.content;
    if (!textResponse) { throw new Error("Empty response from Ollama"); }
    return parseAIResponse(textResponse);
  }

  /** Calls OpenRouter / 9Router API and returns parsed response. */
  async function callOpenRouter(
    systemPrompt: string,
    historyMessages: Array<{ role: "user" | "assistant"; content: string }>,
    userPrompt: string,
    aiEndpoint: string,
    aiModel: string,
    aiApiKey: string,
  ): Promise<AIResponseData> {
    const baseUrl =
      aiEndpoint && aiEndpoint.trim()
        ? aiEndpoint.trim().replace(/\/$/, "")
        : "http://localhost:20128/v1";
    const url = `${baseUrl}/chat/completions`;
    const modelName = aiModel && aiModel.trim() ? aiModel.trim() : "free";
    const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (aiApiKey && aiApiKey.trim()) {
      headers["Authorization"] = `Bearer ${aiApiKey.trim()}`;
    }
    if (!isLocal) {
      headers["HTTP-Referer"] = "https://github.com/halilogia/chrome-extension-todo";
      headers["X-Title"] = "Life OS Dashboard";
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });
    if (!res.ok) {
      let errBody = "";
      try { errBody = await res.text(); } catch { /* ignore */ }
      if (res.status === 401) {
        throw new Error("9Router / OpenRouter API anahtarı geçersiz veya eksik. Lütfen Ayarlar > AI Asistan menüsünden API anahtarınızı kontrol edin.");
      }
      throw new Error(`OpenRouter / 9Router Hata Döndü (${res.status}): ${errBody || res.statusText}`);
    }
    const data = await res.json();
    const textResponse = data?.choices?.[0]?.message?.content;
    if (!textResponse) { throw new Error("Empty response from OpenRouter"); }
    return parseAIResponse(textResponse);
  }

  /** Calls Google Gemini API and returns parsed response. */
  async function callGemini(
    systemPrompt: string,
    historyMessages: Array<{ role: "user" | "assistant"; content: string }>,
    userPrompt: string,
    aiEndpoint: string,
    aiModel: string,
    aiApiKey: string,
    enableWebSearch: boolean,
  ): Promise<AIResponseData> {
    const modelName = aiModel || "gemini-1.5-flash";
    const baseUrl =
      aiEndpoint && aiEndpoint.trim()
        ? aiEndpoint.trim().replace(/\/$/, "")
        : "https://generativelanguage.googleapis.com/v1beta";
    const url = `${baseUrl}/models/${modelName}:generateContent?key=${aiApiKey}`;

    const reqPayload: Record<string, unknown> = {
      contents: [
        ...historyMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: [{ text: userPrompt }] },
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
    });
    if (!res.ok) {
      let errBody = "";
      try { errBody = await res.text(); } catch { /* ignore */ }
      throw new Error(`Gemini API returned status ${res.status}: ${errBody || res.statusText}`);
    }
    const data = await res.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) { throw new Error("Empty response from Gemini"); }
    return parseAIResponse(textResponse);
  }

  /** Main orchestrator: builds prompt, calls the appropriate provider, attaches telemetry. */
  async function callAIConfigured({
    userPrompt,
    aiProvider,
    aiApiKey,
    aiModel,
    aiEndpoint,
    enableWebSearch = true,
    conversationHistory = [],
  }: AICallParams): Promise<AIResponseData> {
    // Build message list from conversation history
    const historyMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
    for (const msg of conversationHistory) {
      historyMessages.push({ role: msg.role, content: msg.content });
    }

    // Build system prompt with web search + memory context
    const { systemPrompt, webSearchData } = await buildSystemPrompt(userPrompt, enableWebSearch);

    // Route to the correct provider
    let responseData: AIResponseData;
    if (aiProvider === "ollama") {
      responseData = await callOllama(systemPrompt, historyMessages, userPrompt, aiEndpoint, aiModel);
    } else if (aiProvider === "openrouter" || aiProvider === "9router") {
      responseData = await callOpenRouter(systemPrompt, historyMessages, userPrompt, aiEndpoint, aiModel, aiApiKey);
    } else {
      responseData = await callGemini(systemPrompt, historyMessages, userPrompt, aiEndpoint, aiModel, aiApiKey, enableWebSearch);
    }

    // Attach search telemetry
    if (webSearchData && webSearchData.sources.length > 0) {
      responseData.searchQuery = webSearchData.query;
      responseData.sources = webSearchData.sources;
    }

    return responseData;
  }

  /** Automatically execute structured AI actions (create tasks, add notes, update memory). */
  async function executeAIAction(
    aiResult: AIResponseData,
    lang: string = "tr",
  ): Promise<void> {
    if (!aiResult.action || aiResult.action === "none") { return; }

    if (aiResult.action === "create_task" && aiResult.params?.text) {
      const todos = await todoRepo.getAll();
      const newTodo = {
        id: `task-${Date.now()}`,
        text: String(aiResult.params?.text ?? ""),
        completed: false,
        repeat: String(aiResult.params?.repeat ?? "none") as Todo["repeat"],
        dueDate: String(aiResult.params?.dueDate ?? ""),
        status: "todo",
        category: "general",
        createdAt: new Date().toISOString(),
      };
      todos.unshift({
        ...newTodo,
        status: "todo" as const,
        lastCompletedDate: null,
      });
      await todoRepo.saveAll(todos);
    } else if (aiResult.action === "add_note" && aiResult.params?.note_content) {
      await handleAddNoteFromAI(
        (String(aiResult.params.note_type) || "note") as "note" | "diary" | "cornell",
        aiResult.params.note_content as string,
        lang,
        aiResult.params.note_title as string,
        aiResult.params.note_cues as string,
        aiResult.params.note_summary as string,
      );
    } else if (aiResult.action === "update_memory" && aiResult.params?.memory_fact) {
      await handleUpdateMemoryFromAI(String(aiResult.params.memory_fact));
    }
  }

  /** Append a note (diary, cornell, or plain note) to the notes list. */
  async function handleAddNoteFromAI(
    type: "note" | "diary" | "cornell",
    content: string,
    lang: string,
    title?: string,
    cues?: string,
    summary?: string,
  ): Promise<void> {
    const currentNotes = await noteRepo.getAll();
    const t = getTranslation(lang as Language);
    const formattedDate = new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US");
    const defaultTitle =
      title ||
      (type === "diary"
        ? t.note_diary_title.replace("{date}", formattedDate)
        : type === "cornell"
          ? t.note_cornell_title.replace("{date}", formattedDate)
          : t.note_title.replace("{date}", formattedDate));

    currentNotes.push({
      id: crypto.randomUUID(),
      title: defaultTitle,
      content: content,
      type: type,
      cues: cues || "",
      summary: summary || "",
      createdAt: new Date().toISOString(),
    });
    await noteRepo.saveAll(currentNotes);
  }

  /** Append a new learned personal memory fact. */
  async function handleUpdateMemoryFromAI(newFact: string): Promise<void> {
    if (!newFact || !newFact.trim()) { return; }

    const currentMemory = await memoryRepo.getMemory();
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

    await memoryRepo.setMemory(updatedMemory);
  }

  return {
    getAIConfigFromStorage,
    callAIConfigured,
    executeAIAction,
    handleAddNoteFromAI,
    handleUpdateMemoryFromAI,
  };
}

export type AiChatService = ReturnType<typeof createAiChatService>;

/* ------------------------------------------------------------------ */
/* Lazy singleton — infrastructure is NOT created at module import.   */
/* The first function call triggers instantiation.                    */
/* ------------------------------------------------------------------ */

import { ChromeStorageAiConfigRepository } from "@/infrastructure/persistence/ChromeStorageAiConfigRepository.js";
import { ChromeStorageMemoryRepository } from "@/infrastructure/persistence/ChromeStorageMemoryRepository.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/ChromeStorageTodoRepository.js";
import { ChromeStorageNoteRepository } from "@/infrastructure/persistence/ChromeStorageNoteRepository.js";
import { logger } from "@/utils/logger.js";

let _aiChatInstance: AiChatService | null = null;
function getAiChatService(): AiChatService {
  if (!_aiChatInstance) {
    _aiChatInstance = createAiChatService({
      aiConfigRepo: new ChromeStorageAiConfigRepository(),
      memoryRepo: new ChromeStorageMemoryRepository(),
      todoRepo: new ChromeStorageTodoRepository(),
      noteRepo: new ChromeStorageNoteRepository(),
    });
  }
  return _aiChatInstance;
}

export function getAIConfigFromStorage() {
  return getAiChatService().getAIConfigFromStorage();
}
export function callAIConfigured(
  params: AICallParams,
): Promise<AIResponseData> {
  return getAiChatService().callAIConfigured(params);
}
export function executeAIAction(
  aiResult: AIResponseData,
  lang?: string,
): Promise<void> {
  return getAiChatService().executeAIAction(aiResult, lang);
}
export function handleAddNoteFromAI(
  type: "note" | "diary" | "cornell",
  content: string,
  lang: string,
  title?: string,
  cues?: string,
  summary?: string,
): Promise<void> {
  return getAiChatService().handleAddNoteFromAI(type, content, lang, title, cues, summary);
}
export function handleUpdateMemoryFromAI(newFact: string): Promise<void> {
  return getAiChatService().handleUpdateMemoryFromAI(newFact);
}
