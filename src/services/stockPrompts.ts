/**
 * stockPrompts.ts
 * BIST Hisse ve Portföy Yapay Zeka (AI) Sistem ve Kullanıcı Prompt Şablonları.
 */

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
  return `Sen uzman, son derece disiplinli bir Borsa İstanbul (BIST) finansal ve teknik analiz asistanısın.

KURALLAR VE İLKELER:
1. YALNIZCA sağlanan gerçek borsa ve matematiksel verileri kullan.
2. Yanıtın İLK SATIRINA MUTLAKA Boğa/Ayı Skoru ekle:
   - [85/100 🐂 Boğa]
   - [50/100 ⚖️ Nötr]
   - [35/100 🐻 Ayı]
3. Analizi karmaşık terimler kullanmadan, sade Türkçe ile 4 DERİNLEMESİNE BÖLÜMDE SUN:
   - 📊 **30 Günlük Tarihsel Trend & Performans**: 1 aylık getiri %, 30 günlük zirve/dip aralığı.
   - 🎯 **Günün Seyri & Volatilite**: Anlık fiyat, % değişim ve gün içi bandı.
   - 🛡️ **Kritik Destek & Direnç Seviyeleri**: Otomatik hesaplanan 30 günlük dip (destek) ve zirve (direnç) seviyeleri.
   - ⚡ **Risk Derecesi & Yatırım Stratejisi**: Stop-loss ve oynaklık uyarısı.`;
}

/**
 * Takip listesi seans açılış öncesi tahmin ve açılış stratejisi sistem prompt'u.
 */
export function getPremarketWatchlistSystemPrompt(): string {
  return `Sen Borsa İstanbul (BIST) seans açılış öncesi başstratejistisin.
Görevin: Kullanıcının Takip Listesindeki hisseler için **Borsa Seans Açılış Öncesi Tahmin & Açılış Strateji Raporu** oluşturmaktır.

KURALLAR VE İLKELER:
1. Yanıtın İLK SATIRINA MUTLAKA Açılış İvme Skoru ekle:
   - [80/100 🟢 Pozitif Gap Açılış İvmesi] veya [50/100 🟡 Nötr/Yatay Açılış Beklentisi] veya [30/100 🔴 Satıcılı/Negatif Açılış Uyarısı]
2. Analizi sade Türkçe ile şu 4 ÖZEL SEANS AÇILIŞ ÖNCESİ BÖLÜMÜNDE SUN:
   - 🌅 **Seans Açılış Öncesi Piyasa İvmesi & Beklenti**: BİST seans açılışı öncesi genel makro duyarlılık, gap (boşluklu) açılış potansiyeli.
   - 🎯 **Takip Listesi Hisselerinin Açılış Seyri Tahmini**: Liste içerisindeki hisselerin seans başlangıcında sergilemesi beklenen ivme ve öne çıkan hisseler.
   - 🛡️ **Kritik Gün İçi Destek & Direnç Seviyeleri**: Listenin seans boyu izlenmesi gereken kritik pivot ve kırılma noktaları.
   - ⚡ **Açılış Seansı İşlem & Risk Yönetimi Stratejisi**: İlk 30 dakika taktiği, stop-loss ve kar alma disiplini.`;
}

/**
 * KAP ve BİST duyuru analiz sistem prompt'u.
 */
export function getKapNewsSystemPrompt(): string {
  return `Sen Borsa İstanbul (BIST) KAP haber ve duyuru analistisisin.
Görevin: Şirket tarafından bildirilen KAP duyurusunu finansal açıdan inceleyerek yatırımcıya etkisini net biçimde özetlemektir.

KURALLAR VE İLKELER:
1. Yanıtın İLK SATIRINA MUTLAKA Etki Skoru ekle:
   - [85/100 🟢 Pozitif KAP Bildirimi] veya [50/100 🟡 Nötr Bildirim] veya [30/100 🔴 Riskli/Negatif Bildirim]
2. 3 kısa maddede Türkçe özetle:
   - 📢 **Bildirim Özeti & Amacı**
   - 📈 **Şirket Finansallarına / İşe Etkisi**
   - ⚡ **Yatırımcı İçin Dikkat Edilecek Risk Noktası**`;
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
export function buildStockContextPrompt(params: BuildStockContextParams): string {
  const { symbol, quote, history, portfolio } = params;

  if (symbol && symbol !== "ALL_PORTFOLIO") {
    let historyStatsPrompt = "";
    if (history && history.length > 0) {
      const monthOpen = history[0].open;
      const currentPrice = quote?.price || history[history.length - 1].close;
      const monthChangePctVal =
        monthOpen > 0 ? ((currentPrice - monthOpen) / monthOpen) * 100 : 0;
      const monthHighVal = Math.max(...history.map((h) => h.high));
      const monthLowVal = Math.min(...history.map((h) => h.low));

      // 1. RSI (14)
      let rsiVal: number | null = null;
      if (history.length >= 14) {
        let gains = 0;
        let losses = 0;
        const slice14 = history.slice(-15);
        for (let i = 1; i < slice14.length; i++) {
          const diff = slice14[i].close - slice14[i - 1].close;
          if (diff >= 0) {gains += diff;}
          else {losses -= diff;}
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiVal = 100 - 100 / (1 + rs);
      }

      // 2. SMA 20
      let sma20Val: number | null = null;
      if (history.length >= 20) {
        const slice20 = history.slice(-20);
        sma20Val = slice20.reduce((acc, h) => acc + h.close, 0) / 20;
      }

      // 3. Volume ratio
      const avgVol = history.reduce((acc, h) => acc + h.volume, 0) / history.length;
      const curVol = quote?.volume || history[history.length - 1].volume;
      const volRatioVal = avgVol > 0 ? curVol / avgVol : 1.0;

      const rsiStatus = rsiVal !== null
        ? rsiVal > 70
          ? "Aşırı Alım Bölgesi (Direnç Yakın)"
          : rsiVal < 30
            ? "Aşırı Satım Bölgesi (Dip/Fırsat)"
            : "Dengeli Bölge"
        : "N/A";

      const smaStatus = sma20Val !== null
        ? `₺${sma20Val.toFixed(2)} (Fiyat ortalamanın %${(((currentPrice - sma20Val) / sma20Val) * 100).toFixed(1)} ${currentPrice >= sma20Val ? "üzerinde" : "altında"})`
        : "N/A";

      historyStatsPrompt =
        `\n--- OTOMATİK HESAPLANAN MATEMATİKSEL & TEKNİK TELEMETRİ ---\n` +
        `- 1 Aylık Toplam Performans (Getiri): %${monthChangePctVal.toFixed(2)}\n` +
        `- 1 Aylık En Yüksek Zirve (Ana Direnç): ₺${monthHighVal.toFixed(2)}\n` +
        `- 1 Aylık En Düşük Dip (Ana Destek): ₺${monthLowVal.toFixed(2)}\n` +
        `- RSI (14 Güç Endeksi): ${rsiVal !== null ? rsiVal.toFixed(1) : "N/A"} (${rsiStatus})\n` +
        `- 20 Günlük Hareketli Ortalama (SMA 20): ${smaStatus}\n` +
        `- Hacim İvmesi (30 Günlük Ortalama Hacme Oranı): ${volRatioVal !== null ? volRatioVal.toFixed(1) : "1.0"}x\n` +
        `- İncelenen Seans Sayısı: ${history.length} Günlük Mum`;
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
