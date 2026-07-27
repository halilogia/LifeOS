/**
 * stockAiService.ts
 * BIST hisse ve portföy verileri için Yapay Zeka (9Router / OpenRouter / Gemini) analiz servisi.
 */

import type { StockQuote } from "@/services/bistService.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";

export interface StockAiRequest {
  symbol?: string;
  quote?: StockQuote;
  portfolio?: StockPortfolioItem[];
  rules?: StockRule[];
  userQuestion?: string;
}

const YTD_DISCLAIMER =
  "\n\n⚠️ YASAL UYARI: Bu analiz yapay zeka tarafından derlenmiş olup kesinlikle Yatırım Tavsiyesi Değildir (YTD).";

export async function analyzeStockWithAI(req: StockAiRequest): Promise<string> {
  const settings = await new Promise<any>((resolve) => {
    chrome.storage.sync.get(
      ["aiProvider", "aiApiKey", "aiModel", "aiEndpoint"],
      (res) => {
        resolve(res || {});
      },
    );
  });

  const provider = settings.aiProvider || "openrouter";
  const apiKey = settings.aiApiKey || "";
  const model = settings.aiModel || "google/gemini-flash-1.5";
  const endpoint = settings.aiEndpoint || "https://openrouter.ai/api/v1";

  let contextPrompt = "";
  if (req.symbol && req.quote) {
    contextPrompt = `Hisse Kodu: ${req.symbol} (${req.quote.shortName})\nAnlık Fiyat: ₺${req.quote.price}\nGünlük Değişim: %${req.quote.changePercent.toFixed(2)}\nGünlük En Yüksek: ₺${req.quote.dayHigh}\nGünlük En Düşük: ₺${req.quote.dayLow}\nHacim: ${req.quote.volume}`;
  } else if (req.portfolio && req.portfolio.length > 0) {
    contextPrompt = `Portföydeki Hisse Sayısı: ${req.portfolio.length}\nHisseler:\n${req.portfolio
      .map(
        (p) =>
          `- ${p.symbol} (Alış Fiyatı: ₺${p.buyPrice}, Lot: ${p.lotCount}, Tarih: ${p.buyDate})`,
      )
      .join("\n")}`;
  }

  const systemPrompt =
    "Sen uzman bir Borsa İstanbul (BIST) finans ve portföy asistanısın. Yatırımcıya karmaşık grafik terimleri kullanmadan tamamen sade, net ve anlaşılır Türkçe ile tavsiyesiz durum analizi sunarsın.";
  const userPrompt = req.userQuestion
    ? `Aşağıdaki verileri ve soruyu değerlendirip kısa ve net yanıtla:\n${contextPrompt}\n\nSoru: ${req.userQuestion}`
    : `Aşağıdaki BIST verilerini değerlendirerek Türkçe kısa, net 3 maddelik durum ve risk özeti çıkar:\n\n${contextPrompt}`;

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
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const json = await res.json();
        return (json.response || "AI yanıtı alınamadı.") + YTD_DISCLAIMER;
      }
    } else {
      // 9Router / OpenRouter / OpenAI Uyumlu Endpoint
      const baseUrl = endpoint
        ? endpoint.trim().replace(/\/$/, "")
        : "https://openrouter.ai/api/v1";
      const url = baseUrl.endsWith("/chat/completions")
        ? baseUrl
        : `${baseUrl}/chat/completions`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: model || "google/gemini-flash-1.5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: AbortSignal.timeout(15000),
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
    console.error("stockAiService fetch error:", e);
    const isLocal =
      endpoint.includes("localhost") || endpoint.includes("127.0.0.1");
    if (isLocal) {
      return (
        `⚠️ 9Router / Yerel AI sunucusuna (${endpoint}) bağlanılamadı.\n\n` +
        `Lütfen bilgisayarınızda 9Router uygulamasının açık olduğundan veya Ayarlar sekmesindeki port adresinin doğru olduğundan emin olun.` +
        YTD_DISCLAIMER
      );
    }
  }

  // Fallback if network/API fails
  if (req.quote) {
    const isTavan = req.quote.changePercent >= 9.5;
    const isRed = req.quote.changePercent < 0;
    return (
      `### 🤖 ${req.symbol} Durum & Risk Analizi\n\n` +
      `1. **Günün Seyri:** Hisse bugün %${req.quote.changePercent.toFixed(2)} değişim gösterdi. ${
        isTavan
          ? "Hisse tavan serisinde güçlü alım baskısıyla ilerliyor."
          : isRed
            ? "Mum kırmızıda; belirlediğiniz stop-loss seviyelerini gözden geçirin."
            : "Pozitif yükseliş eğilimi korunuyor."
      }\n` +
      `2. **Oynaklık (Volatilite):** Günün en yükseği ₺${req.quote.dayHigh}, en düşüğü ₺${req.quote.dayLow}.\n` +
      `3. **Risk Uyarısı:** Dalgalı piyasalarda stop-loss ve izleyen stop kurallarını aktif tutmanız önerilir.` +
      YTD_DISCLAIMER
    );
  }

  return (
    "AI Analiz servisi şu anda hazır. 9Router veya OpenRouter yapılandırmanız ile canlı borsa analizleri alabilirsiniz." +
    YTD_DISCLAIMER
  );
}

export async function analyzeKapNewsWithAI(news: {
  symbol?: string;
  title: string;
  summary: string;
}): Promise<string> {
  const userQuestion = `Şu KAP Bildirimini / Haberini analiz et:
Şirket/Hisse: ${news.symbol || "BIST"}
Başlık: ${news.title}
Özet: ${news.summary}

Bu haberin şirket ve hisse üzerindeki olası etkisini (Olumlu / Nötr / Olumsuz), temel gerekçesini ve yatırımcı için ne anlama geldiğini maksimum 3 net, sade cümle ile özetle.`;

  return analyzeStockWithAI({
    symbol: news.symbol,
    userQuestion,
  });
}
