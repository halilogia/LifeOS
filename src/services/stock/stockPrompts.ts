import singleStockPrompt from "./prompts/single-stock.md?raw";
import premarketWatchlistPrompt from "./prompts/premarket-watchlist.md?raw";
import kapNewsPrompt from "./prompts/kap-news.md?raw";
import type { StockHistoryItem, StockQuote } from "@/types/bist.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

export const YTD_DISCLAIMER =
  "\n\n⚠️ YASAL UYARI: Bu analiz yapay zeka tarafından derlenmiş olup kesinlikle Yatırım Tavsiyesi Değildir (YTD).";

/**
 * Tekil hisse senedi teknik ve temel analiz sistem prompt'u.
 */
export function getSingleStockSystemPrompt(): string {
  return singleStockPrompt;
}

/**
 * Takip listesi seans açılış öncesi tahmin ve açılış stratejisi sistem prompt'u.
 */
export function getPremarketWatchlistSystemPrompt(): string {
  return premarketWatchlistPrompt;
}

/**
 * KAP ve BİST duyuru analiz sistem prompt'u.
 */
export function getKapNewsSystemPrompt(): string {
  return kapNewsPrompt;
}

export interface BuildStockContextParams {
  symbol?: string;
  quote?: StockQuote;
  history?: StockHistoryItem[];
  portfolio?: StockPortfolioItem[];
  rules?: StockRule[];
}

/**
 * BİST telemetry ve piyasa verilerini yapay zekaya aktarılacak metne dönüştürür.
 */
export interface StockTelemetry {
  monthChangePct: number;
  monthHigh: number;
  monthLow: number;
  rsi: number | null;
  rsiStatus: string;
  sma20: number | null;
  sma20Status: string;
  volRatio: number;
  totalDays: number;
}

/**
 * Hisse geçmiş verilerinden RSI, SMA, hacim gibi teknik göstergeleri hesaplar.
 * Hem AI prompt'unda hem de fallback metinlerinde kullanılır.
 */
export function computeStockTelemetry(
  history: StockHistoryItem[],
  currentPrice: number,
): StockTelemetry | null {
  if (!history || history.length === 0) {
    return null;
  }

  const monthOpen = history[0].open;
  const monthChangePct =
    monthOpen > 0 ? ((currentPrice - monthOpen) / monthOpen) * 100 : 0;
  const monthHigh = Math.max(...history.map((h) => h.high));
  const monthLow = Math.min(...history.map((h) => h.low));

  // RSI (14)
  let rsi: number | null = null;
  if (history.length >= 14) {
    let gains = 0;
    let losses = 0;
    const slice14 = history.slice(-15);
    for (let i = 1; i < slice14.length; i++) {
      const diff = slice14[i].close - slice14[i - 1].close;
      if (diff >= 0) {
        gains += diff;
      } else {
        losses -= diff;
      }
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);
  }

  const rsiStatus =
    rsi !== null
      ? rsi > 70
        ? "Aşırı Alım (satış baskısı yakın)"
        : rsi < 30
          ? "Aşırı Satım (dip fırsatı)"
          : "Dengeli"
      : "N/A";

  // SMA 20
  let sma20: number | null = null;
  if (history.length >= 20) {
    const slice20 = history.slice(-20);
    sma20 = slice20.reduce((acc, h) => acc + h.close, 0) / 20;
  }

  const sma20Status =
    sma20 !== null
      ? `₺${sma20.toFixed(2)} (fiyat %${(((currentPrice - sma20) / sma20) * 100).toFixed(1)} ${currentPrice >= sma20 ? "üstünde 📈" : "altında 📉"})`
      : "N/A";

  // Volume ratio
  const avgVol = history.reduce((acc, h) => acc + h.volume, 0) / history.length;
  const curVol = history[history.length - 1].volume;
  const volRatio = avgVol > 0 ? curVol / avgVol : 1.0;

  return {
    monthChangePct,
    monthHigh,
    monthLow,
    rsi,
    rsiStatus,
    sma20,
    sma20Status,
    volRatio,
    totalDays: history.length,
  };
}

export function buildStockContextPrompt(
  params: BuildStockContextParams,
): string {
  const { symbol, quote, history, portfolio } = params;

  if (symbol && symbol !== "ALL_PORTFOLIO") {
    let historyStatsPrompt = "";
    if (history && history.length > 0) {
      const currentPrice = quote?.price || history[history.length - 1].close;
      const t = computeStockTelemetry(history, currentPrice);

      if (t) {
        historyStatsPrompt =
          `\\n--- OTOMATİK HESAPLANAN MATEMATİKSEL & TEKNİK TELEMETRİ ---\\n` +
          `- 1 Aylık Toplam Performans (Getiri): %${t.monthChangePct.toFixed(2)}\\n` +
          `- 1 Aylık En Yüksek Zirve (Ana Direnç): ₺${t.monthHigh.toFixed(2)}\\n` +
          `- 1 Aylık En Düşük Dip (Ana Destek): ₺${t.monthLow.toFixed(2)}\\n` +
          `- RSI (14 Güç Endeksi): ${t.rsi !== null ? t.rsi.toFixed(1) : "N/A"} (${t.rsiStatus})\\n` +
          `- 20 Günlük Hareketli Ortalama (SMA 20): ${t.sma20Status}\\n` +
          `- Hacim İvmesi (30 Günlük Ortalama Hacme Oranı): ${t.volRatio.toFixed(1)}x\\n` +
          `- İncelenen Seans Sayısı: ${t.totalDays} Günlük Mum`;
      }
    }

    if (quote && quote.price > 0) {
      return `Hisse Kodu: ${symbol} (${quote.shortName || symbol})\nAnlık Canlı Fiyat: ₺${quote.price}\nGünlük Değişim: %${quote.changePercent.toFixed(2)}\nGünlük En Yüksek: ₺${quote.dayHigh}\nGünlük En Düşük: ₺${quote.dayLow}\nHacim: ${quote.volume}${historyStatsPrompt}`;
    }
    return `Hisse Kodu: ${symbol}\nDurum: Borsa İstanbul'da İlk İşlem Günü Bekleniyor (Halka Arz).${historyStatsPrompt}`;
  }

  if (portfolio && portfolio.length > 0) {
    return `Takip Listesi & Portföydeki Hisse Sayısı: ${portfolio.length}\nHisseleriniz:\n${portfolio
      .map(
        (p) =>
          `- ${p.symbol} (Maliyet: ₺${p.buyPrice}, Adet: ${p.lotCount}, Tarih: ${p.buyDate})`,
      )
      .join("\n")}`;
  }

  return "Veri mevcut değil.";
}

/**
 * Kullanıcının portföyü için AI rapor prompt'u — dil desteği ile.
 */
export function getStockReportUserPrompt(lang: Language): string {
  const t = getTranslation(lang);
  return t.stock_report_user_prompt;
}

/**
 * Yapay zekaya gönderilecek son kullanıcı prompt'unu üretir.
 */
export function buildStockUserPrompt(
  contextPrompt: string,
  userQuestion?: string,
  isPremarketReport?: boolean,
): string {
  if (userQuestion) {
    return `Aşağıdaki BIST verisini değerlendir:\n${contextPrompt}\n\nAnaliz İsteği: ${userQuestion}`;
  }
  if (isPremarketReport) {
    return `Aşağıdaki Takip Listesi hisseleri için Seans Açılış Öncesi Tahmin & Strateji Raporu hazırla:\n\n${contextPrompt}`;
  }
  return `Aşağıdaki BIST verilerini değerlendirerek Türkçe kısa, net 4 maddelik DERİNLEMESİNE durum ve risk özeti çıkar:\n\n${contextPrompt}`;
}
