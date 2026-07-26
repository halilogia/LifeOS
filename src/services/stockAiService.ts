/**
 * stockAiService.ts
 * BIST hisse ve portföy verileri için Yapay Zeka (Ollama / OpenRouter / Gemini) analiz servisi.
 */

import type { StockQuote } from "@/services/bistService.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";

export interface StockAiRequest {
  symbol?: string;
  quote?: StockQuote;
  portfolio?: StockPortfolioItem[];
  rules?: StockRule[];
}

export async function analyzeStockWithAI(req: StockAiRequest): Promise<string> {
  // Chrome storage'dan AI ayarlarını al
  const settings = await new Promise<any>((resolve) => {
    chrome.storage.sync.get(
      ["aiProvider", "aiApiKey", "aiModel", "aiEndpoint"],
      (res) => {
        resolve(res || {});
      },
    );
  });

  const provider = settings.aiProvider || "gemini";
  const apiKey = settings.aiApiKey || "";
  const model =
    settings.aiModel || (provider === "ollama" ? "llama3" : "gemini-1.5-flash");
  const endpoint = settings.aiEndpoint || "http://localhost:11434";

  let contextPrompt = "";
  if (req.symbol && req.quote) {
    contextPrompt = `Hisse Kodu: ${req.symbol} (${req.quote.shortName})\nAnlık Fiyat: ₺${req.quote.price}\nGünlük Değişim: %${req.quote.changePercent.toFixed(2)}\nGünlük En Yüksek: ₺${req.quote.dayHigh}\nGünlük En Düşük: ₺${req.quote.dayLow}\nHacim: ${req.quote.volume}`;
  } else if (req.portfolio) {
    contextPrompt = `Portföydeki Hisse Sayısı: ${req.portfolio.length}\nHisseler: ${req.portfolio.map((p) => `${p.symbol} (Alış: ₺${p.buyPrice}, Adet: ${p.lotCount})`).join(", ")}`;
  }

  const prompt = `Sen uzman bir Borsa İstanbul (BIST) teknik ve temel analiz asistanısın. Aşağıdaki verileri değerlendirerek yatırımcıya Türkçe kısa, net, 3 maddelik stratejik öneri ve duygu özeti çıkar:\n\n${contextPrompt}`;

  // Eğer API Key veya Ollama erişimi varsa gerçek API çağrısı yap
  if (provider === "ollama") {
    try {
      const res = await fetch(`${endpoint}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, stream: false }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const json = await res.json();
        return json.response || "AI yanıtı alınamadı.";
      }
    } catch {
      // Fallback
    }
  } else if (apiKey) {
    // OpenRouter / Gemini API call
    try {
      const url =
        provider === "openrouter"
          ? "https://openrouter.ai/api/v1/chat/completions"
          : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const body =
        provider === "openrouter"
          ? JSON.stringify({
              model: model || "google/gemini-flash-1.5",
              messages: [{ role: "user", content: prompt }],
            })
          : JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (provider === "openrouter") {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const json = await res.json();
        if (provider === "openrouter") {
          return json.choices?.[0]?.message?.content || "AI yanıtı alınamadı.";
        } else {
          return (
            json.candidates?.[0]?.content?.parts?.[0]?.text ||
            "AI yanıtı alınamadı."
          );
        }
      }
    } catch {
      // Fallback
    }
  }

  // Akıllı kural tabanlı fallback analizi
  if (req.quote) {
    const isTavan = req.quote.changePercent >= 9.5;
    const isRed = req.quote.changePercent < 0;
    return (
      `### 🤖 ${req.symbol} AI & Algoritma Yorumu\n\n` +
      `1. **Trend ve Momentum:** Hisse bugün %${req.quote.changePercent.toFixed(2)} değişim gösterdi. ${isTavan ? "Tavan serisinde/güçlü alım baskısında." : isRed ? "Mum kırmızıda; kısa vadeli stop-loss kurallarını gözden geçirin." : "Pozitif yükseliş trendi korunuyor."}\n` +
      `2. **Oynaklık (Volatilite):** Günün en yüksek seviyesi ₺${req.quote.dayHigh}, en düşük seviyesi ₺${req.quote.dayLow}. Aradaki marj %${(((req.quote.dayHigh - req.quote.dayLow) / req.quote.dayLow) * 100).toFixed(1)}.\n` +
      `3. **Stratejik Öneri:** Günü kırmızı kapatması durumunda riskinizi sınırlamak için otomatik Otomatik Stop kuralını aktif tutmanız önerilir.`
    );
  }

  return "AI Analiz servisi şu anda hazır. Daha detaylı canlı yapay zeka analizleri için Ayarlar sekmesinden OpenRouter veya Ollama API anahtarınızı tanımlayabilirsiniz.";
}
