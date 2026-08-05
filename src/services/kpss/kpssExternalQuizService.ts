/**
 * kpssExternalQuizService.ts
 * Harici AI servisleri (Gemini, ChatGPT, Claude, Copilot) için KPSS sınav prompt üretici
 * ve yeni sekme açma servisini yönetir.
 *
 * Strateji: Tüm servislerde URL açılır + prompt panoya kopyalanır +
 * sayfa yüklendiğinde otomatik olarak textarea'ya doldurulur.
 * Bu sayede Claude, Gemini, ChatGPT, Copilot ve diğer tüm AI sitelerinde
 * kullanıcının hiçbir şey yapmasına gerek kalmaz.
 *
 * Prompt metinleri kod içinde değil, `./prompts/*.md` şablonlarında yaşar.
 * Dinamik değerler (soru sayısı, ders adı, konu adı) placeholder olarak
 * şablona gömülür ve `buildKpssQuizPrompt` içinde replace edilir.
 */

import { Language } from "@/types/types.js";
import { SUBJECT_NAMES } from "@/domain/constants/kpssConstants.js";

import baseRulesMd from "./prompts/base-rules.md?raw";
import subjectTarihMd from "./prompts/subject-tarih.md?raw";
import subjectMatematikMd from "./prompts/subject-matematik.md?raw";
import subjectCografyaMd from "./prompts/subject-cografya.md?raw";
import subjectTurkceMd from "./prompts/subject-turkce.md?raw";
import subjectVatandaslikMd from "./prompts/subject-vatandaslik.md?raw";

export type ExternalAIService = "gemini" | "chatgpt" | "claude" | "copilot";

/** Harici AI servislerinin yeni sekme URL'leri */
const SERVICE_URLS: Record<ExternalAIService, string> = {
  gemini: "https://gemini.google.com/app",
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
  copilot: "https://copilot.microsoft.com/",
};

/** Kullanıcıya gösterilecek servis isimleri */
const SERVICE_NAMES: Record<ExternalAIService, string> = {
  gemini: "Gemini",
  chatgpt: "ChatGPT",
  claude: "Claude",
  copilot: "Copilot",
};

/** Ders bazlı özel kurallar — `prompts/subject-*.md` şablonlarından yüklenir */
const SUBJECT_RULES: Record<string, string> = {
  geometri: subjectMatematikMd,
  matematik: subjectMatematikMd,
  cografya: subjectCografyaMd,
  turkce: subjectTurkceMd,
  tarih: subjectTarihMd,
  vatandaslik: subjectVatandaslikMd,
};

/** Prompt şablonundaki dinamik placeholder'lar */
const PLACEHOLDERS = {
  subjectRules: "__SUBJECT_RULES__",
  subject: "__SUBJECT__",
  topic: "__TOPIC__",
  count: "__COUNT__",
} as const;

/**
 * Yerel AI ile aynı gelişmiş prompt metnini oluşturur.
 */
export function buildKpssQuizPrompt(
  subjectKey: string,
  topicName: string,
  count: number,
  lang: Language,
): string {
  const subjectNames = SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr;
  const subjectLabel = subjectNames[subjectKey] || subjectKey;

  const subjectRules = SUBJECT_RULES[subjectKey] ?? "";

  return baseRulesMd
    .replaceAll(PLACEHOLDERS.subjectRules, subjectRules)
    .replaceAll(PLACEHOLDERS.subject, subjectLabel)
    .replaceAll(PLACEHOLDERS.topic, topicName)
    .replaceAll(PLACEHOLDERS.count, String(count));
}

/**
 * Yeni açılan sekmede AI sohbet textarea'sını bulup prompt'u otomatik doldurur.
 * Background script (service worker) context'inde çalışır.
 */
function autoFillPromptOnTab(tabId: number, prompt: string): void {
  const onUpdated = (
    updatedTabId: number,
    info: { status?: string; url?: string },
    _tab: chrome.tabs.Tab,
  ) => {
    if (updatedTabId !== tabId) {
      return;
    }
    if (info.status !== "complete") {
      return;
    }

    // Listener'ı bir kere çalıştır, sonra kaldır
    chrome.tabs.onUpdated.removeListener(onUpdated);

    // Kısa bir gecikme — SPA framework'lerin input'u hazır hale getirmesi için
    setTimeout(() => {
      let attempts = 0;
      const MAX_ATTEMPTS = 8;
      const RETRY_DELAY = 1200;

      const tryFill = () => {
        attempts++;
        chrome.scripting
          .executeScript({
            target: { tabId },
            world: "MAIN",
            func: (text: string) => {
              // Tüm AI siteleri için ortak seçiciler
              const selectors = [
                "textarea",
                "[contenteditable='true']",
                "[role='textbox']",
                ".ProseMirror", // Claude
                "div[contenteditable='true']",
                "textarea[placeholder*='Message']",
                "textarea[placeholder*='prompt']",
                "textarea[placeholder*='yaz']",
                "textarea[placeholder*='sor']",
              ];

              for (const sel of selectors) {
                const el = document.querySelector(sel) as HTMLElement | null;
                if (!el || !el.isConnected) {
                  continue;
                }
                // Skip hidden/zero-size inputs (React lazy mounts them late)
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) {
                  continue;
                }

                try {
                  // Textarea / input
                  if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
                    const inputEl = el as HTMLTextAreaElement;
                    const setter = Object.getOwnPropertyDescriptor(
                      window.HTMLTextAreaElement.prototype,
                      "value",
                    )?.set;
                    if (setter) {
                      setter.call(inputEl, text); // React-controlled
                    } else {
                      inputEl.value = text;
                    }
                  }
                  // Contenteditable (Claude, ChatGPT, Gemini)
                  else if (el.isContentEditable) {
                    el.focus();
                    // Use execCommand for contenteditable (more reliable than innerText)
                    document.execCommand("selectAll", false);
                    document.execCommand("insertText", false, text);
                  }

                  // Event'leri dispatch et (React state güncellemesi için)
                  el.focus();
                  el.dispatchEvent(new Event("focus", { bubbles: true }));
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                  el.dispatchEvent(new Event("change", { bubbles: true }));
                  el.dispatchEvent(
                    new KeyboardEvent("keyup", { key: " ", bubbles: true }),
                  );
                  return true;
                } catch {
                  // Sessizce dene — bir seçici çalışmazsa diğerine geç
                }
              }
              return false;
            },
            args: [prompt],
          })
          .then((results) => {
            // Filled successfully — stop retrying.
            const filled = results?.some((r) => r.result === true);
            if (!filled && attempts < MAX_ATTEMPTS) {
              setTimeout(tryFill, RETRY_DELAY);
            }
          })
          .catch(() => {
            // executeScript fail olursa (sayfa henüz hazır değilse) tekrar dene
            if (attempts < MAX_ATTEMPTS) {
              setTimeout(tryFill, RETRY_DELAY);
            }
          });
      };

      tryFill();
    }, 800);
  };

  chrome.tabs.onUpdated.addListener(onUpdated);
}

/**
 * Harici AI servisini yeni sekmede açar, prompt'u panoya kopyalar,
 * VE sayfa yüklendiğinde textarea'ya otomatik doldurur.
 *
 * @returns "clipboard"
 */
export async function openExternalAIService(
  service: ExternalAIService,
  prompt: string,
): Promise<"clipboard"> {
  const baseUrl = SERVICE_URLS[service];

  // 1. Prompt'u her zaman panoya kopyala (yedek)
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    // Clipboard erişimi yoksa sessizce devam et
  }

  // 2. URL'yi hazırla (?q= Claude'da pre-fill dener)
  let targetUrl = baseUrl;
  const encoded = encodeURIComponent(prompt);
  const fullUrl = `${baseUrl}?q=${encoded}`;
  if (fullUrl.length <= 8000) {
    targetUrl = fullUrl;
  }

  // 3. Sekmeyi aç + otomatik doldur
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.create({ url: targetUrl, active: true }, (tab) => {
      if (tab?.id) {
        autoFillPromptOnTab(tab.id, prompt);
      }
    });
  } else {
    window.open(targetUrl, "_blank");
  }

  return "clipboard";
}
