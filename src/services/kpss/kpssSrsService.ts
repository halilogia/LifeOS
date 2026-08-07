/**
 * kpssSrsService.ts
 * Service for AI-generated KPSS history flashcards + SM-2 spaced repetition.
 *
 * Kart kaynağı artık SABİT dosya değil: Yapay zeka (local/OpenRouter/Gemini) her
 * üretimde 5 flashcard oluşturur, kartlar chrome.storage.local'a kaydedilir
 * (local-first; bulut senkron isteğe bağlı Drive backup). SM-2 tekrar mekaniği
 * domain SrsService üzerinden korunur.
 *
 * eslint: aşağıdaki Türkçe string'ler AI'ya gönderilen PROMPT metnidir (UI değil).
 */
/* eslint-disable local/no-turkish-literals */

import { callAIConfigured, getAIConfigFromStorage } from "@/services/aichat/index.js";
import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
  type ReviewQuality,
  type WordReviewData,
} from "@/domain/services/SrsService.js";
import type { KpssFlashcard } from "@/services/kpss/kpssService.js";
import type { ISrsProgressRepository } from "@/domain/repositories/ISrsProgressRepository.js";
import { logger } from "@/utils/logger.js";

/** localStorage key: AI-üretimli tarih flashcard kütüphanesi. */
const AI_CARDS_KEY = "kpssAiSrsCards";

/**
 * AI'ya tarih konusundan `count` adet flashcard üretmesini söyleyen prompt.
 * subject-tarih kuralı + JSON şema. Kod icine gömülü (repo convention,
 * .md dosyaları repoda ölü).
 */
function buildSrsPrompt(subject: string, count: number): string {
  return `Sen KPSS Tarih sınavına hazırlanan bir öğrenci için tekrar kartları (flashcard) üreten uzman tarih öğretmenisin.

### Tarih Doğruluk Kuralları:
Kronolojik olarak tamamen doğru, bilimsel literatüre uygun olmalı. Padişah dönemleri, savaş isimleri, antlaşma maddeleri ve inkılap tarihi bağlamları kusursuz kurgulanmalı. Kronoloji kontrolü (olay-padişah-antlaşma-savaş eşleşmesi) üretim öncesi yapılmalı. Uydurma/kurgusal olaylar kesinlikle yasak.

### Kart Özellikleri:
- Her kartın ON YUZU: KPSS tarzı bir tarih sorusu veya eksik bilgi tamamlama (bilgi hatırlatıcı).
- ARKA YUZU: Kısa, net, doğru cevap (1-2 cümle).
- IPUCU: Cevabı hatırlatacak kısa anahtar kelime veya ipucu.
- KATEGORI: Verilen konu adı.

### Görev:
"${subject}" konusu hakkında tam ${count} adet tarih flashcard'i oluştur.

### Çıktı Formatı (BUNUN DIŞINA CIKMA):
SADECE geçerli bir JSON dizisi dondur, baska hicbir metin, giriş veya kod blogu yazma:
[
  {
    "question": "on yuz sorusu",
    "answer": "kisa dogru cevap",
    "hint": "ipucu",
    "category": "${subject}"
  }
]
Kesinlikle JSON formatı dışında hiçbir açıklama yazma.`;
}

/** AI yanıtından JSON dizisi ayiklar (markdown fance / ekstra metin guvenli). */
function extractJsonArray(text: string): Array<Record<string, unknown>> {
  const trimmed = text.trim();
  // ??le/arkadaki markdown kod blogunu temizle
  const cleaned = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/m, "")
    .trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response contains no JSON array");
  }
  const sliced = cleaned.slice(start, end + 1);
  const parsed = JSON.parse(sliced);
  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not a JSON array");
  }
  return parsed as Array<Record<string, unknown>>;
}

/** Kart kutuphanesini local depodan okur. */
async function readAiCards(): Promise<KpssFlashcard[]> {
  const res = await new Promise<Record<string, unknown>>((resolve) => {
    chrome.storage.local.get([AI_CARDS_KEY], (r) => resolve(r as Record<string, unknown>));
  });
  return (res[AI_CARDS_KEY] as KpssFlashcard[]) || [];
}

/** Kart kutuphanesini local depoya yazar. */
async function writeAiCards(cards: KpssFlashcard[]): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [AI_CARDS_KEY]: cards }, () => resolve());
  });
}

/**
 * Fallback kartlari: AI yapilandirmasi yokken / AI cagrisi basarisiz olunca
 * SRS'nin bos kalmamasi icin kullanilan yerlesik 5 tarih flashcard'i.
 * Kronolojik olarak dogru KPSS Tarih konularindan secilmistir.
 */
const DEFAULT_KPSS_HISTORY_CARDS: KpssFlashcard[] = [
  {
    id: "kpss_default_1",
    question: "Osmanlı Devleti'ni kuran Türkmen beyliği hangisiydi?",
    answer: "Osmanlı Beyliği (Söğüt-Domaniç yöresinde kuruldu).",
    hint: "Kayı boyu — Ertuğrul Gazi'nin oğlu.",
    category: "Osmanlı Kuruluş Dönemi",
  },
  {
    id: "kpss_default_2",
    question: "İstanbul kaç yılında, kim tarafından fethedildi?",
    answer:
      "1453'te Fatih Sultan Mehmet tarafından; bu olayla Orta Çağ kapandı, Yeni Çağ başladı.",
    hint: "'Fetih' + 'Çağ' eşleşmesi (1453/1492).",
    category: "Yükselme Dönemi",
  },
  {
    id: "kpss_default_3",
    question: "Kurtuluş Savaşı'nın dönüm noktası olan 1921 büyük zaferi hangisidir?",
    answer: "Sakarya Meydan Savaşı (23 Ağustos–13 Eylül 1921).",
    hint: "Mustafa Kemal'e 'Gazi' ünvanı burada verildi.",
    category: "Millî Mücadele",
  },
  {
    id: "kpss_default_4",
    question:
      "Cumhuriyet döneminin ilk resmî iktisat politikası hangisidir?",
    answer: "1923 İzmir İktisat Kongresi kararları (millî ve katılımcı iktisat).",
    hint: "Lozan sonrası; 'Türk iktisat politikaları' ilk kez burada belirlendi.",
    category: "Cumhuriyet Dönemi",
  },
  {
    id: "kpss_default_5",
    question: "Tanzimat Fermanı hangi dönemde ve ne amaçla ilan edildi?",
    answer:
      "1839'da Sultan Abdülmecid döneminde; malik-mülk-can güvenliğini garanti eden ıslahat fermanı.",
    hint: "1839; 'Gülhane Hatt-ı Hümâyûnu' adıyla da bilinir.",
    category: "Osmanlı Islahat Dönemi",
  },
];

export function createKpssSrsService(srsRepo: ISrsProgressRepository) {
  return {
    /**
     * AI'dan `count` tarih flashcard'i uretir ve local kutuphanesine ekler.
     * Yeni kartlar mevcutlara append edilir (oncekileri korur).
     */
    async generateAiCards(subject: string, count: number = 5): Promise<KpssFlashcard[]> {
      const config = await getAIConfigFromStorage();
      const prompt = buildSrsPrompt(subject, count);
      const aiResp = await callAIConfigured({
        userPrompt: prompt,
        aiProvider: config.aiProvider,
        aiApiKey: config.aiApiKey,
        aiModel: config.aiModel,
        aiEndpoint: config.aiEndpoint,
        enableWebSearch: false,
      });

      const raw = extractJsonArray(aiResp.reply);
      const cards: KpssFlashcard[] = raw.map((item, i) => ({
        id: `kpss_ai_${Date.now()}_${i}`,
        question: String(item.question ?? ""),
        answer: String(item.answer ?? ""),
        hint: String(item.hint ?? ""),
        category: String(item.category ?? subject),
      }));

      const existing = await readAiCards();
      const merged = [...existing, ...cards];
      await writeAiCards(merged);
      return cards;
    },

    /**
     * Kart kutuphanesi bos ise doldurur: once AI'dan uretir; AI yapilandirmasi
     * yoksa / cagri basarisiz olursa yerlesik 5 fallback karta duser (SRS asla bos kalmaz).
     */
    async ensureInitialCards(subject: string = "Tarih"): Promise<void> {
      const existing = await readAiCards();
      if (existing.length > 0) {
        return;
      }
      try {
        await this.generateAiCards(subject, 5);
      } catch (e) {
        logger.warn(
          "[kpssSrs] AI card generation failed, using default fallback cards:",
          e,
        );
        await writeAiCards(DEFAULT_KPSS_HISTORY_CARDS);
      }
    },

    /** Local AI kartlarından SM-2 queue kurar. Bos ise fallback 5 kart (AI yoksa sabit). */
    async loadSrsQueue(chapter: string = "all"): Promise<{
      queue: WordReviewData[];
      universe: KpssFlashcard[];
      chapters: string[];
    }> {
      let cards = await readAiCards();
      if (cards.length === 0) {
        await this.ensureInitialCards("Tarih");
        cards = await readAiCards();
      }

      let activeUniverseCards: KpssFlashcard[];
      if (chapter === "all") {
        activeUniverseCards = cards;
      } else {
        activeUniverseCards = cards.filter((c) => c.category === chapter);
      }
      if (activeUniverseCards.length === 0) {
        activeUniverseCards = cards;
      }

      const chapters = Array.from(new Set(cards.map((c) => c.category))).sort();

      const progress = await srsRepo.getAll();
      const validIds = new Set(activeUniverseCards.map((c) => c.id));
      const filteredProgress = progress.filter((p) =>
        validIds.has(p.wordId as string),
      );
      if (filteredProgress.length !== progress.length) {
        await srsRepo.saveAll(filteredProgress);
      }

      const progressMap = new Map<string, WordReviewData>();
      filteredProgress.forEach((p) =>
        progressMap.set(p.wordId as string, p as unknown as WordReviewData),
      );

      const srsUniverse: SRSWordWithInfo[] = activeUniverseCards.map((w) => {
        const p = progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
        return { ...p, level: w.category, listType: "kpss", freq: 0 };
      });

      const enrichedProgress: SRSWordWithInfo[] = filteredProgress.map((p) => {
        const wInfo = activeUniverseCards.find((w) => w.id === p.wordId);
        return {
          ...p,
          level: wInfo?.category || "Tarih",
          listType: "kpss",
          freq: 0,
        } as unknown as SRSWordWithInfo;
      });

      const queue = prepareSRSQueue(enrichedProgress, {
        dailyGoal: 15,
        isCustomMode: true,
        filters: { listType: "kpss", levels: [] },
        universe: srsUniverse,
      });

      return { queue, universe: activeUniverseCards, chapters };
    },

    /** SM-2 ile tekrar kalitesi isler ve persist eder. */
    async saveSrsReview(reviewData: WordReviewData, quality: ReviewQuality): Promise<void> {
      const outcome = calculateSM2(reviewData, quality, new Date());
      const progress = await srsRepo.getAll();
      const idx = progress.findIndex((p) => p.wordId === outcome.wordId);
      if (idx >= 0) {
        progress[idx] = outcome as unknown as Record<string, unknown>;
      } else {
        progress.push(outcome as unknown as Record<string, unknown>);
      }
      await srsRepo.saveAll(progress);
    },
  };
}

export type KpssSrsService = ReturnType<typeof createKpssSrsService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageSrsProgressRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSrsProgressRepository.js";

const _defaultSrsRepo = new ChromeStorageSrsProgressRepository();
const _defaultSrsService = createKpssSrsService(_defaultSrsRepo);

export const kpssSrsService = _defaultSrsService;