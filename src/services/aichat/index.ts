/**
 * aichat/index.ts
 * Service module for AI API interactions (Ollama, OpenRouter, Gemini),
 * Note creation, and AI action execution.
 * Clean Architecture — Service Layer with injected repositories.
 */

import { buildSystemPrompt } from "./systemPrompt.js";
import { callOllama, callOpenRouter, callGemini } from "./providers.js";
import {
  executeAIAction as runAIAction,
  handleAddNoteFromAI as addNoteImpl,
  handleUpdateMemoryFromAI as updateMemoryImpl,
} from "./actionExecutor.js";
import type {
  AICallParams,
  AIResponseData,
  AiChatDependencies,
} from "./types.js";

export type {
  AICallParams,
  AIResponseData,
  AiChatDependencies,
} from "./types.js";

export function createAiChatService(deps: AiChatDependencies) {
  const { aiConfigRepo, memoryRepo, todoRepo, noteRepo } = deps;

  /** Single authoritative AI config loader: sync → local → defaults. */
  async function getAIConfigFromStorage() {
    return aiConfigRepo.getConfig();
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
    const historyMessages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];
    for (const msg of conversationHistory) {
      historyMessages.push({ role: msg.role, content: msg.content });
    }

    // Build system prompt with web search + memory context
    const { systemPrompt, webSearchData } = await buildSystemPrompt(
      userPrompt,
      enableWebSearch,
      memoryRepo,
    );

    // Route to the correct provider
    let responseData: AIResponseData;
    if (aiProvider === "ollama") {
      responseData = await callOllama(
        systemPrompt,
        historyMessages,
        userPrompt,
        aiEndpoint,
        aiModel,
      );
    } else if (aiProvider === "openrouter" || aiProvider === "9router") {
      responseData = await callOpenRouter(
        systemPrompt,
        historyMessages,
        userPrompt,
        aiEndpoint,
        aiModel,
        aiApiKey,
      );
    } else {
      responseData = await callGemini(
        systemPrompt,
        historyMessages,
        userPrompt,
        aiEndpoint,
        aiModel,
        aiApiKey,
        enableWebSearch,
      );
    }

    // Attach search telemetry
    if (webSearchData && webSearchData.sources.length > 0) {
      responseData.searchQuery = webSearchData.query;
      responseData.sources = webSearchData.sources;
    }

    return responseData;
  }

  return {
    getAIConfigFromStorage,
    callAIConfigured,
    executeAIAction: (aiResult: AIResponseData, lang?: string) =>
      runAIAction(aiResult, lang, todoRepo, noteRepo, memoryRepo),
    handleAddNoteFromAI: (
      type: "note" | "diary" | "cornell",
      content: string,
      lang: string,
      title?: string,
      cues?: string,
      summary?: string,
    ) =>
      addNoteImpl(type, content, lang, noteRepo, title, cues, summary),
    handleUpdateMemoryFromAI: (newFact: string) =>
      updateMemoryImpl(newFact, memoryRepo),
  };
}

export type AiChatService = ReturnType<typeof createAiChatService>;

/* ------------------------------------------------------------------ */
/* Lazy singleton — infrastructure is NOT created at module import.   */
/* The first function call triggers instantiation.                    */
/* ------------------------------------------------------------------ */

import { ChromeStorageAiConfigRepository } from "@/infrastructure/persistence/repositories/ChromeStorageAiConfigRepository.js";
import { ChromeStorageMemoryRepository } from "@/infrastructure/persistence/repositories/ChromeStorageMemoryRepository.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/repositories/ChromeStorageTodoRepository.js";
import { ChromeStorageNoteRepository } from "@/infrastructure/persistence/repositories/ChromeStorageNoteRepository.js";

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
export function callAIConfigured(params: AICallParams): Promise<AIResponseData> {
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
  return getAiChatService().handleAddNoteFromAI(
    type,
    content,
    lang,
    title,
    cues,
    summary,
  );
}
export function handleUpdateMemoryFromAI(newFact: string): Promise<void> {
  return getAiChatService().handleUpdateMemoryFromAI(newFact);
}
