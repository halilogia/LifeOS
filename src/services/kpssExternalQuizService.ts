/**
 * kpssExternalQuizService.ts
 * Harici AI servisleri (Gemini, ChatGPT, Claude, Copilot) için KPSS sınav prompt üretici
 * ve yeni sekme açma servisini yönetir.
 *
 * Strateji: Tüm servislerde URL açılır + prompt panoya kopyalanır + 
 * sayfa yüklendiğinde otomatik olarak textarea'ya doldurulur.
 * Bu sayede Claude, Gemini, ChatGPT, Copilot ve diğer tüm AI sitelerinde
 * kullanıcının hiçbir şey yapmasına gerek kalmaz.
 */

import { Language } from "@/types/types.js";
import { SUBJECT_NAMES } from "@/domain/constants/kpssConstants.js";

export type ExternalAIService = "gemini" | "chatgpt" | "claude" | "copilot";

/** Harici AI servislerinin yeni sekme URL'leri */
const SERVICE_URLS: Record<ExternalAIService, string> = {
  gemini:  "https://gemini.google.com/app",
  chatgpt: "https://chatgpt.com/",
  claude:  "https://claude.ai/new",
  copilot: "https://copilot.microsoft.com/",
};

/** Kullanıcıya gösterilecek servis isimleri */
const SERVICE_NAMES: Record<ExternalAIService, string> = {
  gemini:  "Gemini",
  chatgpt: "ChatGPT",
  claude:  "Claude",
  copilot: "Copilot",
};

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

  let subjectRules = "";

  switch (subjectKey) {
    case "geometri":
    case "matematik":
      subjectRules = `
Matematik/Geometri soruları için: Eğer grafik okuma, tablo, çizgi grafik veya geometri sorusu ise sorunun hemen altında şeklin nasıl göründüğünü metin olarak tarif et (örn: "Şekilde ABC üçgeninde A=60°, B=x, C=80° verilmiştir.").`;
      break;
    case "cografya":
      subjectRules = `
Coğrafya soruları için: Bilimsel ve akademik doğruluk şart. Türkiye'de doğu-batı sıcaklık farklarını enlemle açıklama — bu yanlıştır. "Matematik (Mutlak) Konum" ile "Göreceli (Özel) Konum" ayrımını net belirt. Eğer harita gerektiren soru soruyorsan haritada hangi bölgenin numaralandırıldığını yazıyla tarif et.`;
      break;
    case "turkce":
      subjectRules = `
Türkçe soruları için: Paragraf sorularında edebi/felsefi derinlik içeren, ÖSYM'nin uzun sınav paragraflarına tam uyumlu zengin metinler oluştur. Şıklar arasında anlamsal çelişki olmamalıdır.`;
      break;
    case "tarih":
      subjectRules = `
Tarih soruları için: Kronolojik olarak tamamen doğru, bilimsel literatüre uygun olmalı. Padişah dönemleri, savaş isimleri, antlaşma maddeleri ve inkılap tarihine yönelik bağlamları kusursuz kurgula. Uydurma/kurgusal olaylar kesinlikle yasak.`;
      break;
    case "vatandaslik":
      subjectRules = `
Vatandaşlık soruları için: TC Anayasası, idare hukuku ve temel hukuk kavramlarına %100 sadık kal. Güncel olmayan anayasa kuralları veya uydurulmuş maddeler kesinlikle kullanılmamalı.`;
      break;
  }

  return `Sen KPSS Lisans düzeyinde uzman bir öğretmensin. Aşağıdaki talimatlara göre sınav soruları hazırla.

### ÖSYM Formatı ve Soru Kalitesi Kuralları:
1. Sorular ÖSYM'nin KPSS Lisans sınavlarındaki gibi zengin, ayrıntılı, paragraflı veya öncüllü (I, II, III şeklinde maddeler içeren) olmalıdır. Çok kısa, tek cümlelik yüzeysel sorulardan KESİNLİKLE kaçın.
2. Soru kökleri yoruma kapalı, neyi sorduğu %100 açık olmalıdır.
3. Her sorunun A, B, C, D, E olmak üzere tam 5 seçeneği olmalıdır.
4. Diğer 4 yanlış seçenek akademik olarak tamamen yanlış olmalı, doğru seçenek ise tartışmaya yer bırakmayacak şekilde kesin olmalıdır.
5. Her sorunun sonunda "Doğru Cevap: X — Açıklama: ..." formatında çözüm açıklaması yaz.${subjectRules}

### Görev:
${subjectLabel} dersinin "${topicName}" konusu hakkında tam ${count} adet zorlayıcı KPSS seviye tespit sorusu oluştur.

Soru formatı:
**Soru 1:** [Soru metni]
A) ...  B) ...  C) ...  D) ...  E) ...
✓ Doğru Cevap: [Harf] — [Kısa çözüm açıklaması]

---`;
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
    if (updatedTabId !== tabId) return;
    if (info.status !== "complete") return;

    // Listener'ı bir kere çalıştır, sonra kaldır
    chrome.tabs.onUpdated.removeListener(onUpdated);

    // Kısa bir gecikme — SPA framework'lerin input'u hazır hale getirmesi için
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: (text: string) => {
          // Tüm AI siteleri için ortak seçiciler
          const selectors = [
            "textarea",
            "[contenteditable='true']",
            "[role='textbox']",
            ".ProseMirror",          // Claude
            "div[contenteditable='true']",
            "textarea[placeholder*='Message']",
            "textarea[placeholder*='prompt']",
            "textarea[placeholder*='yaz']",
            "textarea[placeholder*='sor']",
          ];

          for (const sel of selectors) {
            const el = document.querySelector(sel) as HTMLElement | null;
            if (!el || !el.isConnected) continue;

            try {
              // Textarea / input
              if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
                const inputEl = el as HTMLTextAreaElement;
                inputEl.value = text;
              }
              // Contenteditable (Claude, ChatGPT, Gemini)
              else if (el.isContentEditable) {
                el.focus();
                el.innerText = text;

                // React/Vue state güncellemesi için native input setter
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLTextAreaElement?.prototype || window.HTMLInputElement?.prototype,
                  "value",
                )?.set;
                if (nativeInputValueSetter) {
                  nativeInputValueSetter.call(el, text);
                }
              }

              // Event'leri dispatch et (React state güncellemesi için)
              el.focus();
              el.dispatchEvent(new Event("focus", { bubbles: true }));
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
              el.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
            } catch {
              // Sessizce dene — bir seçici çalışmazsa diğerine geç
            }
          }
        },
        args: [prompt],
      }).catch(() => {
        // executeScript fail olursa (sayfa henüz hazır değilse) sessizce devam et
        // Kullanıcı zaten clipboard'dan yapıştırabilir
      });
    }, 1200);
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
