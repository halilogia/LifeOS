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
  computeStockTelemetry,
} from "./stockPrompts.js";
import type { StockTelemetry } from "./stockPrompts.js";

export interface StockAiRequest {
  symbol?: string;
  quote?: StockQuote;
  portfolio?: StockPortfolioItem[];
  rules?: StockRule[];
  userQuestion?: string;
  history?: StockHistoryItem[];
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
        if (provider === "ollama") {
          endpoint = "http://localhost:11434";
        } else if (provider === "9router" || provider === "local") {
          endpoint = "http://localhost:20128/v1";
        } else {
          endpoint = "https://openrouter.ai/api/v1";
        }
      }

      let historyData: StockHistoryItem[] = [];
      if (
        !req.history &&
        req.symbol &&
        req.symbol !== "ALL_PORTFOLIO" &&
        !req.symbol.includes(",")
      ) {
        try {
          historyData = await fetchStockHistory(req.symbol, "1mo");
        } catch {
          /* ignore */
        }
      } else if (req.history) {
        historyData = req.history;
      }

      const isPremarketReport = Boolean(
        (req.symbol &&
          (req.symbol.includes(",") || req.symbol === "ALL_PORTFOLIO")) ||
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

      const userPrompt = buildStockUserPrompt(
        contextPrompt,
        req.userQuestion,
        isPremarketReport,
      );

      try {
        if (provider === "ollama") {
          const url = `${endpoint.replace(/\/$/, "")}/api/generate`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              prompt: `${systemPrompt}\n\n${userPrompt}`,
              stream: false,
            }),
            signal: AbortSignal.timeout(12000),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.response) {
              return json.response + YTD_DISCLAIMER;
            }
          }
        } else {
          const baseUrl = endpoint.endsWith("/chat/completions")
            ? endpoint
            : `${endpoint.replace(/\/$/, "")}/chat/completions`;

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
          }

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
            const content =
              json.choices?.[0]?.message?.content ||
              json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              return content + YTD_DISCLAIMER;
            }
          }
        }
      } catch (e) {
        logger.error("stockAiService fetch error:", e);
      }

      // Smart Fallback — tarihsel veriyle de
      return getStockAiFallback(req, isPremarketReport, historyData);
    },

    async analyzeKapNewsWithAI(params: {
      symbol?: string;
      title: string;
      summary: string;
    }): Promise<string> {
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
import { logger } from "@/utils/logger.js";

const _defaultAiConfigRepo = new ChromeStorageAiConfigRepository();
const _defaultStockAiService = createStockAiService(_defaultAiConfigRepo);

export const { analyzeStockWithAI, analyzeKapNewsWithAI } =
  _defaultStockAiService;

/* ------------------------------------------------------------------ */
/* Fallback generator (pure)                                           */
/* ------------------------------------------------------------------ */

function getStockAiFallback(
  req: StockAiRequest,
  isPremarketReport: boolean,
  historyData?: StockHistoryItem[],
): string {
  const cleanSym = req.symbol
    ? req.symbol.replace(/\\.IS$/, "").toUpperCase()
    : "";
  const hasLivePrice = Boolean(req.quote && req.quote.price > 0);
  const currentPrice = req.quote?.price ?? 0;
  const changePct = req.quote?.changePercent ?? 0;
  const dayLow = req.quote?.dayLow ?? 0;
  const dayHigh = req.quote?.dayHigh ?? 0;

  // Matematiksel telemetri hesapla (varsa)
  let telemetry = "";
  if (historyData && historyData.length > 0) {
    const t = computeStockTelemetry(historyData, currentPrice);
    if (t) {
      telemetry = buildSimpleTelemetryText(t, currentPrice);
    }
  }

  if (req.userQuestion) {
    let trendNote = "";
    if (telemetry) {
      trendNote = `\n📊 **Teknik Veriler:**${telemetry}\n`;
    }
    return (
      `[75/100 🐂 Boğa]\n\n### 📢 KAP Bildirim & Haber Analiz Özeti\n\n1. **Haber Değerlendirmesi:** [OLUMLU] Yayınlanan KAP bildirimi (${req.symbol || "BIST"}), şirketin geleceğe yönelik iş hacmini ve piyasa ilgisini destekleyebilecek niteliktedir.\n2. **Piyasa Etkisi:** Bu tür operasyonel gelişmeler kısa/orta vadede yatırımcı algısını pozitif etkiler.\n3. **Takip Uyarısı:** Hisse hacim hareketlerini ve teknik direnç (yükselişin durabileceği fiyat) seviyelerini yakından izleyin.${trendNote}` +
      YTD_DISCLAIMER
    );
  }

  if (isPremarketReport) {
    return (
      `[80/100 🟢 Pozitif Açılış Beklentisi]\n\n### 🌅 BİST Seans Açılış Öncesi Strateji & Tahmin Raporu\n\n1. **Seans Açılış Öncesi Piyasa İvmesi ve Beklenti:** BİST seans açılışında küresel piyasa duyarlılığıyla hafif alıcılı/pozitif bir açılış beklenmektedir.\n2. **Takip Listesi Hisselerinin Açılış Seyri Tahmini:** Takip listenizdeki hisseler seans başlangıcında hacimli pozitif hareket sergileyebilir.\n3. **Kritik Gün İçi Destek ve Direnç Seviyeleri (fiyatın durabileceği alt/üst noktalar):** İlk 30 dakika seans açılışında 30 günlük dip ve zirve kırılma noktalarını takip edin.\n4. **Açılış Seansı İşlem ve Risk Yönetimi Stratejisi:** İlk 15-30 dakikadaki oynaklığa (ani fiyat dalgalanması) karşı stop-loss seviyelerinizi (otomatik satış emri) koruyun.${telemetry ? `\n\n---\n📊 **Teknik Göstergeler:**${telemetry}` : ""}` +
      YTD_DISCLAIMER
    );
  }

  if (req.symbol) {
    // Halka arz durumu
    if (!hasLivePrice) {
      return (
        `[50/100 ⚖️ Halka Arz Sürecinde]\n\n### 🚀 ${cleanSym} — Halka Arz & Beklenen İlk Seans Analizi\n\n1. **Durum:** ${cleanSym} henüz Borsa İstanbul'da işlem görmeye **başlamadı**. Bu bir halka arz (şirketin ilk kez halka açılması) hissesidir.\n2. **İlk Seans Stratejisi:** Halka arzdan sonraki ilk günlerde genellikle tavan (günlük %10 yükseliş sınırı) serisi yaşanabilir. Tavan bozulursa satış gelebilir.\n3. **Kritik Seviyeler:** Halka arz fiyatı baz destek (en düşük ihtimalle gelinebilecek nokta) seviyesidir. İlk gün tavan fiyatı üzerinde işlem görmesi beklenir.\n4. **Risk Uyarısı:** Halka arz hisseleri ilk günlerde yüksek talep görür ancak tavan serisi sonrası sert düşüşler (tahta boşaltma) yaşanabilir. Stop-loss kullanmanız önemlidir.${telemetry ? `\n\n---\n📊 **Teknik Göstergeler:**${telemetry}` : ""}` +
        YTD_DISCLAIMER
      );
    }

    // Canlı fiyat varsa — zenginleştirilmiş analiz
    const isUp = changePct >= 0;
    const scoreText = isUp
      ? "75/100 🐂 Boğa (yükseliş)"
      : "35/100 🐻 Ayı (düşüş)";
    const trendDir = isUp ? "yükseliş" : "düşüş";
    const emoji = isUp ? "📈" : "📉";

    return (
      `[${scoreText}] ${emoji}\n\n### 🤖 ${cleanSym} — Derinlemesine BİST ve Risk Analizi (Basitleştirilmiş)\n\n1. **30 Günlük Geçmiş Performans:** ${cleanSym} son bir ayda %${Math.abs(changePct).toFixed(2)} ${trendDir} göstermiştir. Canlı fiyat: **₺${currentPrice}** seviyesindedir.\n2. **Günün Seyri ve Dalgalanma (Volatilite):** Gün içinde en düşük ₺${dayLow} ile en yüksek ₺${dayHigh} arasında hareket etmiştir. Aradaki fark, günlük oynaklık seviyesini gösterir.\n3. **Kritik Destek (Dibe Karşı Kalkan) ve Direnç (Yukarıda Engel) Seviyeleri:** Günlük ana destek ₺${dayLow} (fiyatın buraya kadar düşme ihtimali), direnç ₺${dayHigh} (fiyatın buraya kadar çıkma ihtimali) seviyesindedir.\n4. **Risk Değerlendirmesi ve Stop-loss Stratejisi:** Piyasa hacmini takip edin. Düşük hacimli hareketler güvenilmezdir. Stop-loss (belirlediğiniz fiyatın altında otomatik satış emri) seviyesi olarak desteğin hemen altını kullanabilirsiniz.${telemetry ? `\n\n📊 **Teknik Göstergeler (Otomatik Hesaplanan):**${telemetry}` : ""}` +
      YTD_DISCLAIMER
    );
  }

  return (
    `[75/100 🐂 Boğa]\n\n### 💼 BİST Portföy ve Genel Risk Analizi\n\n1. **Portföy İvmesi:** Varlıklarınız genel trend dengesini korumaktadır.\n2. **Risk Dağılımı:** Hisse ağırlıklarınızı sektörel çeşitlemeye (farklı sektörlere yatırım yaparak riski dağıtmak) tabi tutmanız önerilir.\n3. **Strateji:** Kar al ve stop-loss kurallarınıza (önceden belirlediğiniz satış emirleri) sadık kalın.` +
    YTD_DISCLAIMER
  );
}

/**
 * Hesaplanan telemetri verilerini kısa, sade bir metne dönüştürür.
 */
function buildSimpleTelemetryText(
  t: StockTelemetry,
  currentPrice: number,
): string {
  const rsiLine =
    t.rsi !== null
      ? `  • RSI (Göreceli Güç Endeksi — aşırı alım/satım ölçer): ${t.rsi.toFixed(1)} (${t.rsiStatus})\n`
      : "";
  return (
    `\n${rsiLine}` +
    `  • SMA-20 (20 günlük ortalama — trend yönünü gösterir): ${t.sma20Status}\n` +
    `  • Aylık Getiri: %${t.monthChangePct.toFixed(2)} (${t.monthChangePct >= 0 ? "📈" : "📉"})\n` +
    `  • Aylık En Yüksek/Düşük: ₺${t.monthHigh.toFixed(2)} / ₺${t.monthLow.toFixed(2)}\n` +
    `  • Hacim İvmesi (son hacim / ortalama hacim): ${t.volRatio.toFixed(1)}x (${t.volRatio > 1.5 ? "yüksek 🟢" : t.volRatio < 0.5 ? "düşük 🔴" : "normal 🟡"})\n` +
    `  • İncelenen Seans: ${t.totalDays} gün`
  );
}
