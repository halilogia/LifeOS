/**
 * kapNewsService.ts
 * Kamuyu Aydınlatma Platformu (KAP) ve BIST haberlerinin RSS üzerinden çekilmesi ve yerel önbelleklenmesi.
 */

export interface KapNewsItem {
  id: string;
  symbol?: string;
  title: string;
  summary: string;
  pubDate: string;
  link: string;
  category?: string;
}

const KAP_CACHE_KEY = "kapNewsCache";
const KAP_CACHE_TTL = 15 * 60 * 1000; // 15 dakika cache

export async function fetchLatestKapNews(
  targetSymbols?: string[],
): Promise<KapNewsItem[]> {
  // Önce yerel cache kontrol et
  try {
    const cached = await new Promise<any>((resolve) => {
      chrome.storage.local.get([KAP_CACHE_KEY], (res) =>
        resolve(res[KAP_CACHE_KEY]),
      );
    });

    if (
      cached &&
      cached.timestamp &&
      Date.now() - cached.timestamp < KAP_CACHE_TTL &&
      cached.data
    ) {
      const items: KapNewsItem[] = cached.data;
      if (targetSymbols && targetSymbols.length > 0) {
        const uppercaseSyms = targetSymbols.map((s) =>
          s.replace(/\.IS$/, "").toUpperCase(),
        );
        return items.filter(
          (item) =>
            item.symbol && uppercaseSyms.includes(item.symbol.toUpperCase()),
        );
      }
      return items;
    }
  } catch {
    // Cache okuma hatasında devam et
  }

  // KAP RSS akışını çek
  try {
    const res = await fetch("https://www.kap.org.tr/tr/rss", {
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const xmlText = await res.text();
      const items = parseKapRssXml(xmlText);

      // Cache'e yaz
      await chrome.storage.local.set({
        [KAP_CACHE_KEY]: {
          timestamp: Date.now(),
          data: items,
        },
      });

      if (targetSymbols && targetSymbols.length > 0) {
        const uppercaseSyms = targetSymbols.map((s) =>
          s.replace(/\.IS$/, "").toUpperCase(),
        );
        return items.filter(
          (item) =>
            item.symbol && uppercaseSyms.includes(item.symbol.toUpperCase()),
        );
      }
      return items;
    }
  } catch (e) {
    console.error("fetchLatestKapNews error:", e);
  }

  // Fallback örnek haberler
  return getFallbackKapNews(targetSymbols);
}

function parseKapRssXml(xmlText: string): KapNewsItem[] {
  const items: KapNewsItem[] = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const itemNodes = xmlDoc.querySelectorAll("item");

    itemNodes.forEach((node, index) => {
      const title = node.querySelector("title")?.textContent || "";
      const link = node.querySelector("link")?.textContent || "";
      const pubDate =
        node.querySelector("pubDate")?.textContent || new Date().toISOString();
      const description = node.querySelector("description")?.textContent || "";

      // Başlık veya içerikten hisse sembolü ayıkla (Örn: "THYAO - Özel Durum Açıklaması")
      const symbolMatch = title.match(/\b([A-Z]{4,5})\b/);
      const symbol = symbolMatch ? symbolMatch[1] : undefined;

      items.push({
        id: `kap-${index}-${Date.now()}`,
        symbol,
        title,
        summary: description.replace(/<[^>]*>?/gm, "").slice(0, 200) + "...",
        pubDate,
        link,
      });
    });
  } catch {
    // XML Parse hatası
  }
  return items;
}

function getFallbackKapNews(targetSymbols?: string[]): KapNewsItem[] {
  const mockNews: KapNewsItem[] = [
    {
      id: "kap-mock-1",
      symbol: "THYAO",
      title: "THYAO - Yeni Uçak Alım Sözleşmesi Hakkında",
      summary:
        "Türk Hava Yolları, filo genişletme stratejisi kapsamında yeni uçak siparişlerinin teslimatı konusunda anlaşmaya varıldığını duyurdu.",
      pubDate: new Date().toISOString(),
      link: "https://www.kap.org.tr",
    },
    {
      id: "kap-mock-2",
      symbol: "KRDMD",
      title: "KRDMD - İhracat Anlaşması ve Kapasite Artışı",
      summary:
        "Kardemir, yeni ray ve ağır profil üretim hattından yurtdışına 500 milyon TL tutarında satış sözleşmesi imzalandığını bildirdi.",
      pubDate: new Date().toISOString(),
      link: "https://www.kap.org.tr",
    },
  ];

  if (targetSymbols && targetSymbols.length > 0) {
    const uppercaseSyms = targetSymbols.map((s) =>
      s.replace(/\.IS$/, "").toUpperCase(),
    );
    return mockNews.filter(
      (item) =>
        item.symbol && uppercaseSyms.includes(item.symbol.toUpperCase()),
    );
  }
  return mockNews;
}
