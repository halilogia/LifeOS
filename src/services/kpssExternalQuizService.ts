/**
 * kpssExternalQuizService.ts
 * Harici AI servisleri (Gemini, ChatGPT, Claude, Copilot) için KPSS sınav prompt üretici
 * ve yeni sekme açma servisini yönetir.
 *
 * Prompt: yerel AI ile aynı gelişmiş system+user prompt birleşimini kullanır
 * (getKpssSystemPrompt + userPrompt) — ancak JSON çıktısı yerine
 * okunabilir soru formatında üretmesi istenir.
 */

import { Language } from "@/types/types.js";
import { SUBJECT_NAMES } from "@/domain/constants/kpssConstants.js";

export type ExternalAIService = "gemini" | "chatgpt" | "claude" | "copilot";

/** Harici AI servislerinin yeni sekme URL'leri */
const SERVICE_URLS: Record<ExternalAIService, string> = {
  gemini:  "https://gemini.google.com/app",
  chatgpt: "https://chatgpt.com/",
  claude:  "https://claude.ai/new",
  copilot: "https://copilot.microsoft.com/chat",
};

/**
 * URL pre-fill parametresini destekleyen servisler.
 * Gemini: ?q=   → input alanına yazar VE otomatik gönderir
 * Claude: ?q=   → input alanına yazar ama göndermez (Enter gerekir)
 * ChatGPT / Copilot: ?q= desteği yok → clipboard fallback
 */
const SERVICE_QUERY_PARAMS: Partial<Record<ExternalAIService, string>> = {
  gemini: "q",
  claude: "q",
};

/**
 * Yerel AI ile aynı gelişmiş prompt metnini oluşturur.
 * System rules + user talebi tek mesaj olarak birleştirilir.
 * Çıktı formatı okunabilir metin (JSON değil).
 */
export function buildKpssQuizPrompt(
  subjectKey: string,
  topicName: string,
  count: number,
  lang: Language,
): string {
  const subjectNames = SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr;
  const subjectLabel = subjectNames[subjectKey] || subjectKey;

  // Konu bazlı gelişmiş kurallar (yerel AI prompt'undan alınmıştır)
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
 * Harici AI servisini yeni sekmede açar.
 *
 * Strateji:
 * - Gemini & Claude: ?q= parametresi ile prompt pre-fill edilir (otomasyon)
 * - ChatGPT & Copilot: URL param desteği yok → prompt panoya kopyalanır
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

    // KPSS promptları genellikle 400-600 karakter — URL limitine sığar
    if (fullUrl.length <= 8000) {
      targetUrl = fullUrl;
      method = "url";
    }
  }

  // ChatGPT ve Copilot için clipboard fallback
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
