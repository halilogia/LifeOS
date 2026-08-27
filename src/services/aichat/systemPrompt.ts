import { SYSTEM_PROMPT_TEMPLATE } from "./systemPromptTemplate.js";
import {
  executeWebSearch,
  detectNeedsWebSearch,
  type WebSearchSource,
} from "../webSearchAgent.js";
import type { IMemoryRepository } from "@/domain/repositories/IMemoryRepository.js";
import { logger } from "@/utils/logger.js";

/**
 * Builds the system prompt with web search context and user memory.
 */
export async function buildSystemPrompt(
  userPrompt: string,
  enableWebSearch: boolean,
  memoryRepo: IMemoryRepository,
): Promise<{
  systemPrompt: string;
  webSearchData: { query: string; sources: WebSearchSource[] } | null;
}> {
  const todayStr = new Date().toISOString().split("T")[0];

  // Web search step
  let webSearchData: { query: string; sources: WebSearchSource[] } | null =
    null;
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

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replaceAll("__CURRENT_YEAR__", String(new Date().getFullYear()))
    .replaceAll("__TODAY_DATE__", todayStr)
    .replaceAll("__MEMORY_CONTEXT__", memoryContextPrompt)
    .replaceAll("__WEB_CONTEXT__", webContextPrompt);

  return { systemPrompt, webSearchData };
}
