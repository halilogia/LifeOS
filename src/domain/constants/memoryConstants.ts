import type { Language } from "@/domain/value-objects/Language.js";
import { getTranslation } from "@/utils/i18n.js";

export function formatMemoryUpdate(
  currentMemory: string,
  cleanFact: string,
  lang: Language = "tr",
): string {
  const t = getTranslation(lang);
  const mainHeader =
    t.ai_memory_header_main ||
    "# Kişisel Hafıza & Kullanıcı Bağlamı (memory.md)";
  const sectionHeader =
    t.ai_memory_header_section || "## 💡 AI Tarafından Öğrenilen Bilgiler";

  if (!currentMemory || !currentMemory.trim()) {
    return `${mainHeader}\n\n${sectionHeader}\n${cleanFact}`;
  }
  if (currentMemory.includes(sectionHeader)) {
    return currentMemory.replace(
      sectionHeader,
      `${sectionHeader}\n${cleanFact}`,
    );
  }
  return `${currentMemory.trim()}\n\n${sectionHeader}\n${cleanFact}`;
}
