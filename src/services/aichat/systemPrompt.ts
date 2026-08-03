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
