/**
 * kpssExternalQuizService.ts
 * Harici AI servisleri (Gemini, ChatGPT, Claude, Copilot) için KPSS sınav prompt üretici
 * ve yeni sekme açma servisini yönetir.
 */

import { Language } from "@/types/types.js";
import { SUBJECT_NAMES } from "@/domain/constants/kpssConstants.js";

export type ExternalAIService = "gemini" | "chatgpt" | "claude" | "copilot";

/** Harici AI servislerinin URL şablonları */
const SERVICE_URLS: Record<ExternalAIService, string> = {
  gemini: "https://gemini.google.com/app",
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
  copilot: "https://copilot.microsoft.com/",
};

/** URL destekleyen servisler için query param adları */
const SERVICE_QUERY_PARAMS: Partial<Record<ExternalAIService, string>> = {
  gemini: "q",
  chatgpt: "q",
  claude: "q",
};

/** Sınav prompt'u oluşturur */
export function buildKpssQuizPrompt(
  subjectKey: string,
  topicName: string,
  count: number,
  lang: Language,
): string {
  const subjectNames = SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr;
  const subjectLabel = subjectNames[subjectKey] || subjectKey;

  if (lang === "en") {
    return `Create ${count} multiple-choice questions from the "${topicName}" topic in the KPSS ${subjectLabel} subject.

For each question provide:
- Question text
- Options A, B, C, D, E (each on a separate line)
- Correct answer (e.g., "Correct Answer: C")
- Brief solution explanation

Questions should match real KPSS exam difficulty and format.
Please write in Turkish.`;
  }

  return `KPSS ${subjectLabel} dersinden, "${topicName}" konusunda ${count} adet çoktan seçmeli soru hazırla.

Her soru için şunları ver:
- Soru metni
- A, B, C, D, E şıkları (her şık ayrı satırda)
- Doğru cevap (örn: "Doğru Cevap: C")
- Kısa çözüm açıklaması

Sorular gerçek KPSS sınav formatında ve zorluk düzeyinde olsun.
Türkçe olarak hazırla.`;
}

/**
 * Harici AI servisini yeni sekmede açar.
 * URL kısa ise (≤ 2000 char) doğrudan URL param ile gönderir.
 * Uzun ise prompt'u panoya kopyalar ve servisi boş olarak açar.
 *
 * @returns "url" — URL param ile açıldı | "clipboard" — panoya kopyalandı
 */
export async function openExternalAIService(
  service: ExternalAIService,
  prompt: string,
): Promise<"url" | "clipboard"> {
  const baseUrl = SERVICE_URLS[service];
  const queryParam = SERVICE_QUERY_PARAMS[service];

  let targetUrl = baseUrl;
  let method: "url" | "clipboard" = "clipboard";

  if (queryParam) {
    const encoded = encodeURIComponent(prompt);
    const fullUrl = `${baseUrl}?${queryParam}=${encoded}`;

    // URL 2000 karakterden kısaysa doğrudan kullan
    if (fullUrl.length <= 2000) {
      targetUrl = fullUrl;
      method = "url";
    }
  }

  // Clipboard fallback — prompt panoya kopyalanır
  if (method === "clipboard") {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard erişimi yoksa sessizce devam et
    }
  }

  // Chrome Extension ortamında chrome.tabs.create kullanılır
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.create({ url: targetUrl, active: true });
  } else {
    window.open(targetUrl, "_blank");
  }

  return method;
}
