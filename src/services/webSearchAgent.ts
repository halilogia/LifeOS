/**
 * webSearchAgent.ts
 * Google AI Mode & Perplexity Tarzı Özerk Web Araştırma Agent Servisi.
 * Canlı internet sonuçlarını (DuckDuckGo / Google Search Engine) çeker ve kaynak özetlerini derler.
 */

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResult {
  query: string;
  sources: WebSearchSource[];
}

/**
 * Kullanıcı prompt'unun canlı internet araştırması gerektirip gerektirmediğini tespit eder.
 */
export function detectNeedsWebSearch(prompt: string): boolean {
  if (!prompt || prompt.trim().length < 3) return false;
  const p = prompt.toLowerCase().trim();

  // Search intent keywords
  const searchKeywords = [
    "nedir",
    "ne zaman",
    "kimdir",
    "nasıl",
    "kaç",
    "nerede",
    "haber",
    "fiyat",
    "güncel",
    "son durum",
    "bugün",
    "bist",
    "dolar",
    "euro",
    "hava durumu",
    "arama",
    "araştır",
    "bilgi",
    "rehber",
    "tavsiye",
    "öneri",
    "karşılaştır",
    "farkı",
    "hangisi",
    "en iyi",
    "gelişme",
    "son dakika",
    "search",
    "latest",
    "today",
    "news",
    "weather",
  ];

  return searchKeywords.some((kw) => p.includes(kw)) || p.endsWith("?");
}

/**
 * Canlı internet aramasını gerçekleştirir ve en alakalı web kaynaklarını döndürür.
 */
export async function executeWebSearch(
  userQuery: string,
): Promise<WebSearchResult> {
  const cleanQuery = userQuery
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/gi, " ")
    .trim()
    .slice(0, 100);

  if (!cleanQuery) {
    return { query: userQuery, sources: [] };
  }

  try {
    // 1. Primary: DuckDuckGo HTML Live Web Search
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const html = await res.text();
      const sources = parseDuckDuckGoHTML(html);
      if (sources.length > 0) {
        return { query: cleanQuery, sources };
      }
    }
  } catch (e) {
    console.warn("Primary DuckDuckGo HTML search error:", e);
  }

  // 2. Fallback: DuckDuckGo Instant API
  try {
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(apiUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      const sources: WebSearchSource[] = [];

      if (json.AbstractText && json.AbstractURL) {
        sources.push({
          title: json.Heading || cleanQuery,
          url: json.AbstractURL,
          snippet: json.AbstractText,
        });
      }

      const related = json.RelatedTopics || [];
      for (const item of related) {
        if (item.Text && item.FirstURL && sources.length < 4) {
          sources.push({
            title: item.Text.slice(0, 60) + "...",
            url: item.FirstURL,
            snippet: item.Text,
          });
        }
      }

      if (sources.length > 0) {
        return { query: cleanQuery, sources };
      }
    }
  } catch (e) {
    console.warn("Fallback DuckDuckGo API search error:", e);
  }

  return { query: cleanQuery, sources: [] };
}

/**
 * DuckDuckGo HTML çıktılarını ayrıştırarak temiz başlık, URL ve özet çıkarır.
 */
function parseDuckDuckGoHTML(html: string): WebSearchSource[] {
  const sources: WebSearchSource[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const results = doc.querySelectorAll(".result");

    results.forEach((el, index) => {
      if (index >= 4) return;
      const titleEl = el.querySelector(".result__title a");
      const snippetEl = el.querySelector(".result__snippet");

      if (titleEl) {
        const rawTitle = titleEl.textContent?.trim() || "";
        let rawUrl = titleEl.getAttribute("href") || "";

        // Unpack DuckDuckGo redirect url if present
        if (rawUrl.includes("uddg=")) {
          const match = rawUrl.match(/uddg=([^&]+)/);
          if (match && match[1]) {
            rawUrl = decodeURIComponent(match[1]);
          }
        }

        const snippet = snippetEl?.textContent?.trim() || "";

        if (rawTitle && rawUrl.startsWith("http")) {
          sources.push({
            title: rawTitle,
            url: rawUrl,
            snippet: snippet || rawTitle,
          });
        }
      }
    });
  } catch (e) {
    console.error("parseDuckDuckGoHTML error:", e);
  }
  return sources;
}
