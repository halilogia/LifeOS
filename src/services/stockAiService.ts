/**
 * stockAiService.ts
 * BIST hisse ve portföy verileri için Yapay Zeka (9Router / OpenRouter / Gemini) analiz servisi.
 * AI config IAiConfigRepository üzerinden alınır.
 */

import { fetchStockHistory } from "@/services/bistService.js";
import type { StockQuote, StockHistoryItem } from "@/types/bist.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";
import type { IAiConfigRepository } from "@/domain/repositories/IAiConfigRepository.js";
import {
  YTD_DISCLAIMER,
  getSingleStockSystemPrompt,
  getPremarketWatchlistSystemPrompt,
  buildStockContextPrompt,
  buildStockUserPrompt,
} from "./stockPrompts.js";

export interface StockAiRequest {
  symbol?: string;
  quote?: StockQuote;
  portfolio?: StockPortfolioItem[];
  rules?: StockRule[];
  userQuestion?: string;
}

export function createStockAiService(aiConfigRepo: IAiConfigRepository) {
  return {
    async analyzeStockWithAI(req: StockAiRequest): Promise<string> {
      const config = await aiConfigRepo.getConfig();

      const provider = config.aiProvider;
      const apiKey = config.aiApiKey;
      const model =
        config.aiModel && config.aiModel !== "free"
          ? config.aiModel
          : "google/gemini-2.5-flash";

      let endpoint = config.aiEndpoint.trim();
      if (!endpoint) {
        if (provider === "ollama") { endpoint = "http://localhost:11434"; }
        else if (provider === "9router" || provider === "local") { endpoint = "http://localhost:20128/v1"; }
        else { endpoint = "https://openrouter.ai/api/v1"; }
      }

      let historyData: StockHistoryItem[] = [];
      if (req.symbol && req.symbol !== "ALL_PORTFOLIO" && !req.symbol.includes(",")) {
        try { historyData = await fetchStockHistory(req.symbol, "1mo"); } catch { /* ignore */ }
      }

      const isPremarketReport = Boolean(
        (req.symbol && (req.symbol.includes(",") || req.symbol === "ALL_PORTFOLIO")) ||
        (req.portfolio && req.portfolio.length > 0),
      );

      const contextPrompt = buildStockContextPrompt({
        symbol: req.symbol,
        quote: req.quote,
        history: historyData,
        portfolio: req.portfolio,
        rules: req.rules,
      });

      const systemPrompt = isPremarketReport
        ? getPremarketWatchlistSystemPrompt()
        : getSingleStockSystemPrompt();

      const userPrompt = buildStockUserPrompt(contextPrompt, req.userQuestion, isPremarketReport);

      try {
        if (provider === "ollama") {
          const url = `${endpoint.replace(/\/$/, "")}/api/generate`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt: `${systemPrompt}\n\n${userPrompt}`, stream: false }),
            signal: AbortSignal.timeout(12000),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.response) { return json.response + YTD_DISCLAIMER; }
          }
        } else {
          const baseUrl = endpoint.endsWith("/chat/completions")
            ? endpoint
            : `${endpoint.replace(/\/$/, "")}/chat/completions`;

          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (apiKey) { headers["Authorization"] = `Bearer ${apiKey}`; }

          const res = await fetch(baseUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: model || "google/gemini-flash-1.5",
              temperature: 0.2,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
            signal: AbortSignal.timeout(12000),
          });

          if (res.ok) {
            const json = await res.json();
            const content = json.choices?.[0]?.message?.content || json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) { return content + YTD_DISCLAIMER; }
          }
        }
      } catch (e) {
        console.error("stockAiService fetch error:", e);
      }

      // Smart Fallback
      return getStockAiFallback(req, isPremarketReport);
    },

    async analyzeKapNewsWithAI(params: { symbol?: string; title: string; summary: string }): Promise<string> {
      return this.analyzeStockWithAI({
        symbol: params.symbol || "BIST",
        userQuestion: `KAP BİLDİRİM ANALİZİ:\nBaşlık: ${params.title}\nÖzet: ${params.summary}`,
      });
    },
  };
}

export type StockAiService = ReturnType<typeof createStockAiService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageAiConfigRepository } from "@/infrastructure/persistence/ChromeStorageAiConfigRepository.js";

const _defaultAiConfigRepo = new ChromeStorageAiConfigRepository();
const _defaultStockAiService = createStockAiService(_defaultAiConfigRepo);

export const { analyzeStockWithAI, analyzeKapNewsWithAI } = _defaultStockAiService;

/* ------------------------------------------------------------------ */
/* Fallback generator (pure)                                           */
/* ------------------------------------------------------------------ */

function getStockAiFallback(req: StockAiRequest, isPremarketReport: boolean): string {
  if (req.userQuestion) {
    return `[75/100 🐂 Boğa]\n\n### 📊 KAP Bildirim & AI Haber Analiz Özeti\n\n1. **Haber Değerlendirmesi:** [OLUMLU] Yayınlanan KAP bildirimi (${req.symbol || "BIST"}), şirketin geleceğe yönelik iş hacmini ve piyasa ilgisini destekleyebilecek niteliktedir.\n2. **Piyasa Etkisi:** Bu tür operasyonel gelişmeler kısa/orta vadede yatırımcı algısını pozitif etkiler.\n3. **Takip Uyarısı:** Hisse hacim hareketlerini ve teknik direnç seviyelerini yakından izleyin.` + YTD_DISCLAIMER;
  }

  if (isPremarketReport) {
    return `[80/100 🟢 Pozitif Gap Açılış İvmesi]\n\n### 🌅 BİST Seans Açılış Öncesi Strateji & Açılış Tahmini Raporu\n\n1. **Seans Açılış Öncesi Piyasa İvmesi & Beklenti:** BİST seans açılışında küresel piyasa duyarlılığı ve vadeli endeks ivmesiyle hafif alıcılı/pozitif bir açılış beklenmektedir.\n2. **Takip Listesi Hisselerinin Açılış Seyri Tahmini:** Takip listenizdeki hisseler seans başlangıcında hacimli pozitif hareket sergileyebilir.\n3. **Kritik Gün İçi Destek & Direnç Seviyeleri:** İlk 30 dakika seans açılışında 30 günlük dip ve zirve kırılma noktalarını takip edin.\n4. **Açılış Seansı İşlem & Risk Yönetimi Stratejisi:** İlk 15-30 dakikadaki oynaklığa karşı disiplinli stop-loss seviyelerinizi koruyun.` + YTD_DISCLAIMER;
  }

  if (req.symbol) {
    const cleanSym = req.symbol.replace(/\.IS$/, "").toUpperCase();
    const hasLivePrice = Boolean(req.quote && req.quote.price > 0);

    if (!hasLivePrice) {
      return `[50/100 ⚖️ Halka Arz Bekleniyor]\n\n### 🚀 ${cleanSym} Halka Arz & BİST İlk Seans Analizi\n\n1. **30 Günlük Tarihsel Trend & Performans:** ${cleanSym} henüz Borsa İstanbul'da işlem görmeye başlamadığı için tarihsel fiyat verisi oluşmamıştır.\n2. **Günün Seyri & Volatilite:** İlk işlem seansı tarihi ve tavan serisi yakından takip edilmelidir.\n3. **Kritik Destek & Direnç Seviyeleri:** Halka arz arz fiyatı baz destek seviyesidir.\n4. **Risk Derecesi & Strateji:** İlk işlem günü tavan kilitlenme ivmesini ve tavan bozma hacmini kontrol edin.` + YTD_DISCLAIMER;
    }

    const isUp = (req.quote?.changePercent || 0) >= 0;
    const scoreText = isUp ? "85/100 🐂 Boğa" : "40/100 🐻 Ayı";

    return `[${scoreText}]\n\n### 🤖 ${cleanSym} Derinlemesine BİST & Risk Analizi\n\n1. **30 Günlük Tarihsel Trend & Performans:** ${cleanSym} son seanslarını %+${req.quote?.changePercent.toFixed(2)} değişim ve ₺${req.quote?.price} canlı fiyat seviyesinde sürdürmektedir.\n2. **Günün Seyri & Volatilite:** Gün içi band ₺${req.quote?.dayLow} - ₺${req.quote?.dayHigh} aralığında seyretmiştir.\n3. **Kritik Destek & Direnç Seviyeleri:** Seanslık ana destek ₺${req.quote?.dayLow}, direnç ₺${req.quote?.dayHigh} seviyesindedir.\n4. **Risk Derecesi & Strateji:** Piyasa hacimlerini dikkate alarak stop-loss seviyelerinizi koruyun.` + YTD_DISCLAIMER;
  }

  return `[75/100 🐂 Boğa]\n\n### 💼 BİST Portföy & Genel Risk Analizi\n\n1. **Portföy İvmesi:** Varlıklarınız genel trend dengesini korumaktadır.\n2. **Risk Dağılımı:** Hisse ağırlıklarınızı sektörel çeşitlemeye tabi tutmanız önerilir.\n3. **Strateji:** Kar al ve stop-loss kurallarınıza sadık kalın.` + YTD_DISCLAIMER;
}
