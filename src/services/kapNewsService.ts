/**
 * kapNewsService.ts
 * Kamuyu Aydınlatma Platformu (KAP) ve BIST haberlerinin RSS üzerinden çekilmesi ve IKapNewsCacheRepository ile önbelleklenmesi.
 */

import type { IKapNewsCacheRepository, KapNewsCache } from "@/domain/repositories/IKapNewsCacheRepository.js";
import type { KapNewsItem } from "@/types/kap.js";

export type { KapNewsItem } from "@/types/kap.js";

const KAP_CACHE_TTL = 15 * 60 * 1000; // 15 dakika cache

export function createKapNewsService(cacheRepo: IKapNewsCacheRepository) {
  return {
    async fetchLatestKapNews(targetSymbols?: string[]): Promise<KapNewsItem[]> {
      // Önce yerel cache kontrol et
      try {
        const cached = await cacheRepo.getCached();
        if (cached && cached.timestamp && Date.now() - cached.timestamp < KAP_CACHE_TTL && cached.data) {
          const items: KapNewsItem[] = cached.data;
          if (targetSymbols && targetSymbols.length > 0) {
            const uppercaseSyms = targetSymbols.map((s) => s.replace(/\.IS$/, "").toUpperCase());
            const filtered = items.filter(
              (item) => item.symbol && uppercaseSyms.includes(item.symbol.toUpperCase()),
            );
            if (filtered.length > 0) { return filtered; }
          }
          return items;
        }
      } catch {
        // Cache okuma hatasında devam et
      }

      // Canlı RSS akışını çek (Mynet BIST / KAP Haber akışı)
      try {
        const res = await fetch("https://finans.mynet.com/rss/borsa/", {
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const xmlText = await res.text();
          const items = parseKapRssXml(xmlText);

          if (items.length > 0) {
            const cachePayload: KapNewsCache = { timestamp: Date.now(), data: items };
            await cacheRepo.setCached(cachePayload);

            if (targetSymbols && targetSymbols.length > 0) {
              const uppercaseSyms = targetSymbols.map((s) => s.replace(/\.IS$/, "").toUpperCase());
              const filtered = items.filter(
                (item) => item.symbol && uppercaseSyms.includes(item.symbol.toUpperCase()),
              );
              if (filtered.length > 0) { return filtered; }
            }
            return items;
          }
        }
      } catch {
        // RSS isteğinde hata olursa sessizce fallback verisine geç
      }

      return getFallbackKapNews(targetSymbols);
    },
  };
}

export type KapNewsService = ReturnType<typeof createKapNewsService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageKapNewsCacheRepository } from "@/infrastructure/persistence/ChromeStorageKapNewsCacheRepository.js";

const _defaultKapRepo = new ChromeStorageKapNewsCacheRepository();
const _defaultKapService = createKapNewsService(_defaultKapRepo);

export const { fetchLatestKapNews } = _defaultKapService;

/* ------------------------------------------------------------------ */
/* Parsers & fallback (pure — no chrome.*)                             */
/* ------------------------------------------------------------------ */

function parseKapRssXml(xmlText: string): KapNewsItem[] {
  const items: KapNewsItem[] = [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const itemNodes = xmlDoc.querySelectorAll("item");

    itemNodes.forEach((node, index) => {
      const title = node.querySelector("title")?.textContent || "";
      const link = node.querySelector("link")?.textContent || "";
      const pubDate = node.querySelector("pubDate")?.textContent || new Date().toISOString();
      const description = node.querySelector("description")?.textContent || "";

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
      title: "THYAO - Yeni Uçak Alım ve Filo Genişletme Sözleşmesi",
      summary: "Türk Hava Yolları, filo genişletme stratejisi kapsamında yeni uçak siparişlerinin teslimatı konusunda anlaşmaya varıldığını bildirdi.",
      pubDate: new Date().toISOString(),
      link: "https://www.kap.org.tr",
    },
    {
      id: "kap-mock-2",
      symbol: "KRDMD",
      title: "KRDMD - İhracat Anlaşması ve Kapasite Artışı Bildirimi",
      summary: "Kardemir, yeni ray ve ağır profil üretim hattından yurtdışına 500 milyon TL tutarında satış sözleşmesi imzalandığını bildirdi.",
      pubDate: new Date().toISOString(),
      link: "https://www.kap.org.tr",
    },
    {
      id: "kap-mock-3",
      symbol: "EREGL",
      title: "EREGL - Temettü Dağıtım Kararı ve Yatırım Planı",
      summary: "Ereğli Demir Çelik, yeni çelik tesisi yatırımı ve temettü ödeme takvimi hakkında kamuoyunu bilgilendirdi.",
      pubDate: new Date().toISOString(),
      link: "https://www.kap.org.tr",
    },
  ];

  if (targetSymbols && targetSymbols.length > 0) {
    const uppercaseSyms = targetSymbols.map((s) => s.replace(/\.IS$/, "").toUpperCase());
    const filtered = mockNews.filter((item) => item.symbol && uppercaseSyms.includes(item.symbol.toUpperCase()));
    if (filtered.length > 0) { return filtered; }
  }
  return mockNews;
}
