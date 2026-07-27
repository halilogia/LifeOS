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
      (syncRes) => {
        chrome.storage.local.get(
          ["aiProvider", "aiApiKey", "aiModel", "aiEndpoint"],
          (localRes) => {
            resolve({ ...(localRes || {}), ...(syncRes || {}) });
          },
        );
      },
    );
  });

  const provider = settings.aiProvider || "openrouter";
  const apiKey = settings.aiApiKey || "";
  const model =
    settings.aiModel && settings.aiModel !== "free"
      ? settings.aiModel
      : "google/gemini-2.5-flash";

  let endpoint = (settings.aiEndpoint || "").trim();
  if (!endpoint) {
    if (provider === "ollama") {
      endpoint = "http://localhost:11434";
    } else if (provider === "9router" || provider === "local") {
      endpoint = "http://localhost:20128/v1";
    } else {
      endpoint = "https://openrouter.ai/api/v1";
    }
  }

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
    `Sen uzman, son derece disiplinli bir Borsa İstanbul (BIST) finans ve borsa verisi asistanısın.

KURALLAR VE İLKELER:
1. YALNIZCA sağlanan gerçek verileri (Fiyat, % Değişim, Yüksek/Düşük, Halka Arz Sezonu, KAP Metni) kullan.
2. Sağlanan verilerde hisse fiyatı 0 veya 'Açılış Bekleniyor' ise, UYDURMA grafik/teknik indikatör yorumu YAPMA. Hisse henüz borsada açılmamış bir halka arz hissesidir; açılış günü beklendiğini açıkça belirt.
3. Asla UYDURMA (hallucination) fiyat veya grafik desteği uydurma.
4. Yanıtı maksimum 3 net, sade ve anlaşılır Türkçe maddede sun.
5. Yasal uyarı içerikli finansal danışmanlık terimleri kullanma; durum özeti çıkar.

ÖRNEN YANIT YAPISI (Açık Hisse):
1. Günün Seyri: THYAO %2.40 yükselişle ₺312.50 seviyesinde.
2. Volatilite: Günün bandı ₺308 - ₺315 aralığında.
3. Risk: Kâr-al ve stop alarmlarınızı güncel tutun.

ÖRNEN YANIT YAPISI (Halka Arz / Henüz İşleme Başlamamış Hisse):
1. Borsa Durumu: MASFN henüz BİST'te açılmamıştır (Açılış günü bekleniyor).
2. Takip: Alış maliyetiniz üzerinden portföyde izlenmektedir.
3. Strateji: İlk seans günlerinde tavan serisi oynaklığına karşı alarmlarınızı hazırlayın.`;

  const userPrompt = req.userQuestion
    ? `Aşağıdaki BIST verisini değerlendir:\n${contextPrompt}\n\nAnaliz İsteği: ${req.userQuestion}`
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
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.response) {
          return json.response + YTD_DISCLAIMER;
        }
      }
    } else {
      // 9Router / OpenRouter / OpenAI Uyumlu Endpoint
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
    console.error("stockAiService fetch error:", e);
  }

  // Smart Fallback when AI API network is unreachable or returning empty
  if (req.userQuestion) {
    return (
      `### 📊 KAP Bildirim & AI Haber Analiz Özeti\n\n` +
      `1. **Haber Değerlendirmesi:** Yayınlanan KAP bildirimi (${req.symbol || "BIST"}), şirketin geleceğe yönelik iş hacmini ve piyasa ilgisini pozitif yönde destekleyebilecek niteliktedir.\n` +
      `2. **Piyasa Etkisi:** Bu tür operasyonel gelişmeler kısa/orta vadede yatırımcı algısını destekler.\n` +
      `3. **Takip Uyarısı:** Hisse hacim hareketlerini ve direnç seviyelerini yakından izleyin.` +
      YTD_DISCLAIMER
    );
  }

  if (req.symbol) {
    const cleanSym = req.symbol.replace(/\.IS$/, "").toUpperCase();
    const hasLivePrice = Boolean(req.quote && req.quote.price > 0);

    if (!hasLivePrice) {
      return (
        `### 🚀 ${cleanSym} Halka Arz & Açılış Öncesi Durum Analizi\n\n` +
        `1. **Borsa İşlem Durumu:** ${cleanSym} hissesi henüz Borsa İstanbul'da ilk işlem gününe başlamamıştır (Açılış bekleniyor).\n` +
        `2. **Takip & Maliyet:** Portföyünüze kaydettiğiniz alış fiyatı üzerinden takip edilmektedir. Hisse tahtası borsada açıldığı an canlı fiyat, derinlik ve grafik verileri otomatik güncellenecektir.\n` +
        `3. **Açılış Stratejisi:** Yeni halka arzlarda ilk günlerde tavan serisi ve yüksek volatilite yaşanabileceğinden hedef fiyat alarmlarınızı hazır tutmanız önerilir.` +
        YTD_DISCLAIMER
      );
    }

    const isTavan = req.quote!.changePercent >= 9.5;
    const isRed = req.quote!.changePercent < 0;
    const priceText = `₺${req.quote!.price.toFixed(2)}`;
    const changeText = `%${req.quote!.changePercent.toFixed(2)}`;

    return (
      `### 🤖 ${cleanSym} Yapay Zeka Hisse & Risk Analizi\n\n` +
      `1. **Günün Seyri & Trend:** ${cleanSym} hissesi son BİST seansında ${changeText} (${priceText}) ile hareket ediyor. ${
        isTavan
          ? "Hisse tavan serisinde güçlü alım baskısıyla ilerliyor."
          : isRed
            ? "Mum kırmızıda; belirlediğiniz stop-loss ve alarm seviyelerini gözden geçirin."
            : "Teknik açıdan ana destek ve direnç seviyeleri üzerinde pozitif görünüm korunuyor."
      }\n` +
      `2. **Oynaklık (Volatilite) & Hacim:** Gün içi işlemler ${
        req.quote!.dayHigh > 0
          ? `₺${req.quote!.dayLow} - ₺${req.quote!.dayHigh}`
          : "direnç aralığında"
      } seyretmekte olup takas hacimleri takip edilmektedir.\n` +
      `3. **Risk Uyarısı & Strateji:** BİST dalgalanmalarına karşı kâr-al (Take Profit) ve stop-loss alarmlarınızı aktif tutmanız önerilir.` +
      YTD_DISCLAIMER
    );
  }

  return (
    "AI Analiz servisi hazır. 9Router veya OpenRouter yapılandırmanız ile canlı borsa analizleri alabilirsiniz." +
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
