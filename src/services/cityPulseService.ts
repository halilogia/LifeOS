/**
 * cityPulseService.ts
 * Service layer for the City Pulse (Şehir Etkinlikleri) module.
 * Fetches live events + taxonomies from kultur.istanbul WordPress REST API,
 * extracts featured media posters, formats Google Calendar links,
 * provides Event Hub shortcuts, and caches results via ICityPulseCacheRepository.
 */

import type {
  CityEvent,
  CityEventCategory,
  CityEventType,
  EventHubShortcut,
} from "@/types/cityPulse.js";
import type { ICityPulseCacheRepository } from "@/domain/repositories/ICityPulseCacheRepository.js";
import { logger } from "@/utils/logger.js";

const EVENTS_CACHE_EXPIRY = 20 * 60 * 1000; // 20 minutes
const TAXONOMIES_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const EVENTS_URL =
  "https://kultur.istanbul/wp-json/wp/v2/event_listing?per_page=50&_embed";
const CATEGORIES_URL =
  "https://kultur.istanbul/wp-json/wp/v2/event_listing_category?per_page=100&_fields=id,name,count";
const TYPES_URL =
  "https://kultur.istanbul/wp-json/wp/v2/event_listing_type?per_page=100&_fields=id,name,count";

export const CITY_EVENT_HUBS: EventHubShortcut[] = [
  {
    id: "ibb-kultur",
    name: "İBB Kültür Sanat",
    url: "https://kultur.istanbul/etkinlikler/",
    category: "culture",
    description: "İstanbul genelinde konser, tiyatro, sergi ve ücretsiz kültür etkinlikleri",
    badge: "Ücretsiz / İBB",
  },
  {
    id: "biletix",
    name: "Biletix",
    url: "https://www.biletix.com/",
    category: "tickets",
    description: "Konser, tiyatro, festival, spor ve sahne sanatları biletleme",
    badge: "Türkiye Geneli",
  },
  {
    id: "passo",
    name: "Passo",
    url: "https://www.passo.com.tr/tr/etkinlikler",
    category: "tickets",
    description: "Konser, tiyatro, müzikal ve spor karşılaşmaları biletleri",
    badge: "Popüler",
  },
  {
    id: "bubilet",
    name: "Bubilet",
    url: "https://www.bubilet.com.tr/",
    category: "tickets",
    description: "İndirimli tiyatro, stand-up ve konser biletleri",
    badge: "Fırsatlar",
  },
  {
    id: "biletinial",
    name: "Biletinial",
    url: "https://biletinial.com/",
    category: "tickets",
    description: "Devlet Tiyatroları, Opera, Bale, Sinema ve Konser biletleri",
    badge: "Resmi / DT",
  },
  {
    id: "bizizmir",
    name: "Bizİzmir Kültür",
    url: "https://www.bizizmir.com/tr/Etkinlikler",
    category: "culture",
    description: "İzmir Büyükşehir Belediyesi kültür ve sanat etkinlik takvimi",
    badge: "İzmir",
  },
  {
    id: "akm-cso",
    name: "AKM & CSO Ada",
    url: "https://akmistanbul.gov.tr/",
    category: "culture",
    description: "Atatürk Kültür Merkezi ve Cumhurbaşkanlığı Senfoni Orkestrası programları",
    badge: "Bakanlık",
  },
  {
    id: "muze-galeri",
    name: "Müzeler & Galeriler",
    url: "https://www.istanbulmodern.org/tr/etkinlikler",
    category: "museum",
    description: "İstanbul Modern, Pera Müzesi ve Sakıp Sabancı güncel sergileri",
    badge: "Sergiler",
  },
  {
    id: "meetup-tech",
    name: "Meetup Tech Istanbul",
    url: "https://www.meetup.com/find/?location=tr--istanbul&source=EVENTS&categoryId=546",
    category: "tech",
    description: "Yazılım, Yapay Zeka, Tasarım ve Girişimcilik topluluk buluşmaları",
    badge: "Meetup & Dev",
  },
  {
    id: "zorlu-psm",
    name: "Zorlu PSM",
    url: "https://www.zorlupsm.com/etkinlikler",
    category: "tickets",
    description: "Dünya standartlarında müzikaller, caz ve uluslararası konserler",
    badge: "PSM",
  },
];

interface WpFeaturedMediaItem {
  source_url?: string;
  media_details?: {
    sizes?: {
      medium?: { source_url?: string };
      large?: { source_url?: string };
      thumbnail?: { source_url?: string };
    };
  };
}

interface WpEvent {
  id: number;
  date: string;
  link: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  event_listing_category?: number[];
  event_listing_type?: number[];
  _embedded?: {
    "wp:featuredmedia"?: WpFeaturedMediaItem[];
  };
}

interface WpTerm {
  id: number;
  name: string;
  count: number;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "-",
  mdash: "-",
  hellip: "...",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201d",
  ldquo: "\u201c",
  uuml: "\u00fc",
  Uuml: "\u00dc",
  auml: "\u00e4",
  Auml: "\u00c4",
  ouml: "\u00f6",
  Ouml: "\u00d6",
  iuml: "\u00ef",
  Iuml: "\u00cf",
  uml: "\u00a8",
  ccedil: "\u00e7",
  Ccedil: "\u00c7",
  ugrave: "\u00f9",
  eacute: "\u00e9",
  Eacute: "\u00c9",
  agrave: "\u00e0",
  egrave: "\u00e8",
  igrave: "\u00ec",
  ograve: "\u00f2",
  szlig: "\u00df",
  deg: "\u00b0",
  plusmn: "\u00b1",
  times: "\u00d7",
  divide: "\u00f7",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
  laquo: "\u00ab",
  raquo: "\u00bb",
  middot: "\u00b7",
  bull: "\u2022",
  euro: "\u20ac",
  pound: "\u00a3",
  yen: "\u00a5",
  larr: "\u2190",
  rarr: "\u2192",
  uarr: "\u2191",
  darr: "\u2193",
  rsaquo: "\u203a",
  lsaquo: "\u2039",
  frac12: "\u00bd",
  frac14: "\u00bc",
  frac34: "\u00be",
};

/** Decodes &name; and &#NNN;/&#xHH; entities in a plain string (DOM-free). */
export function decodeEntities(input: string): string {
  if (!input) {
    return "";
  }
  return String(input)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name: string) => {
      const mapped = NAMED_ENTITIES[name];
      return mapped !== undefined ? mapped : match;
    });
}

/** Strips HTML tags from API-rendered content/excerpt into plain text. */
export function stripHtml(html: string): string {
  if (!html) {
    return "";
  }
  return decodeEntities(
    String(html)
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+([.,;:!?])/g, "$1")
      .trim(),
  );
}

/** Extracts the first image src from HTML string */
export function extractFirstImageSrc(html: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : undefined;
}

/** Generates a pre-filled Google Calendar event URL */
export function generateGoogleCalendarUrl(
  title: string,
  dateStr: string,
  detailsUrl: string,
  location?: string,
): string {
  try {
    const titleEncoded = encodeURIComponent(title);
    const detailsEncoded = encodeURIComponent(`Etkinlik Detayları: ${detailsUrl}`);
    const locationEncoded = location ? encodeURIComponent(location) : "";

    let startIso = "";
    let endIso = "";

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const y = d.getUTCFullYear();
      const m = pad(d.getUTCMonth() + 1);
      const day = pad(d.getUTCDate());
      const h = pad(d.getUTCHours() || 19); // Default 19:00 if midnight
      const min = pad(d.getUTCMinutes());
      startIso = `${y}${m}${day}T${h}${min}00Z`;

      const endD = new Date(d.getTime() + 2 * 60 * 60 * 1000); // +2 hours default
      const endY = endD.getUTCFullYear();
      const endM = pad(endD.getUTCMonth() + 1);
      const endDay = pad(endD.getUTCDate());
      const endH = pad(endD.getUTCHours() || 21);
      const endMin = pad(endD.getUTCMinutes());
      endIso = `${endY}${endM}${endDay}T${endH}${endMin}00Z`;
    }

    const datesParam = startIso && endIso ? `&dates=${startIso}/${endIso}` : "";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleEncoded}&details=${detailsEncoded}${locationEncoded ? `&location=${locationEncoded}` : ""}${datesParam}`;
  } catch {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}`;
  }
}

export function createCityPulseService(cacheRepo: ICityPulseCacheRepository) {
  return {
    getEventHubs(): EventHubShortcut[] {
      return CITY_EVENT_HUBS;
    },

    /**
     * Fetches live events from kultur.istanbul, utilizing local cache.
     */
    async fetchEvents(forceFresh = false): Promise<CityEvent[]> {
      if (!forceFresh) {
        const cached = await cacheRepo.getEventsCache();
        if (cached && Date.now() - cached.timestamp < EVENTS_CACHE_EXPIRY) {
          return cached.data;
        }
      }

      try {
        const res = await fetch(EVENTS_URL, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = (await res.json()) as WpEvent[];
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: expected array of events");
        }

        const events: CityEvent[] = data.map((item) => {
          // Extract image from featuredmedia or content
          let imageUrl: string | undefined = undefined;
          const media = item._embedded?.["wp:featuredmedia"]?.[0];
          if (media) {
            imageUrl =
              media.media_details?.sizes?.large?.source_url ||
              media.media_details?.sizes?.medium?.source_url ||
              media.source_url;
          }
          if (!imageUrl && item.content?.rendered) {
            imageUrl = extractFirstImageSrc(item.content.rendered);
          }

          return {
            id: item.id,
            title: decodeEntities(item.title?.rendered ?? ""),
            link: item.link,
            date: item.date,
            excerpt: stripHtml(item.excerpt?.rendered ?? item.content?.rendered ?? ""),
            categoryIds: item.event_listing_category ?? [],
            typeIds: item.event_listing_type ?? [],
            imageUrl,
            priceType: "free",
            source: "İBB Kültür Sanat",
          };
        });

        await cacheRepo.saveEventsCache(events);
        return events;
      } catch (error) {
        logger.error("cityPulseService: Failed to fetch events:", error);
        // Fall back to expired cache if available
        const cached = await cacheRepo.getEventsCache();
        if (cached && cached.data.length > 0) {
          logger.warn("cityPulseService: Using expired events cache as fallback");
          return cached.data;
        }
        throw error;
      }
    },

    /**
     * Fetches categories and event types (taxonomies), utilizing local cache.
     */
    async fetchTaxonomies(): Promise<{
      categories: CityEventCategory[];
      types: CityEventType[];
    }> {
      const cached = await cacheRepo.getTaxonomiesCache();
      if (cached && Date.now() - cached.timestamp < TAXONOMIES_CACHE_EXPIRY) {
        return { categories: cached.categories, types: cached.types };
      }

      try {
        const [catRes, typeRes] = await Promise.all([
          fetch(CATEGORIES_URL, { headers: { Accept: "application/json" } }),
          fetch(TYPES_URL, { headers: { Accept: "application/json" } }),
        ]);

        if (!catRes.ok || !typeRes.ok) {
          throw new Error("Failed to fetch categories or types");
        }

        const [catData, typeData] = (await Promise.all([
          catRes.json(),
          typeRes.json(),
        ])) as [WpTerm[], WpTerm[]];

        const categories: CityEventCategory[] = (
          Array.isArray(catData) ? catData : []
        ).map((c) => ({
          id: c.id,
          name: decodeEntities(c.name),
          count: c.count,
        }));

        const types: CityEventType[] = (
          Array.isArray(typeData) ? typeData : []
        ).map((t) => ({
          id: t.id,
          name: decodeEntities(t.name),
          count: t.count,
        }));

        await cacheRepo.saveTaxonomiesCache(categories, types);
        return { categories, types };
      } catch (error) {
        logger.error("cityPulseService: Failed to fetch taxonomies:", error);
        const cached = await cacheRepo.getTaxonomiesCache();
        if (cached) {
          logger.warn("cityPulseService: Using expired taxonomies cache as fallback");
          return { categories: cached.categories, types: cached.types };
        }
        return { categories: [], types: [] };
      }
    },

    async loadFavorites(): Promise<number[]> {
      return cacheRepo.getFavorites();
    },

    async saveFavorites(favorites: number[]): Promise<void> {
      await cacheRepo.saveFavorites(favorites);
    },
  };
}

export type CityPulseService = ReturnType<typeof createCityPulseService>;

import { ChromeStorageCityPulseCacheRepository } from "@/infrastructure/persistence/repositories/ChromeStorageCityPulseCacheRepository.js";

const _defaultCacheRepo = new ChromeStorageCityPulseCacheRepository();
export const cityPulseService = createCityPulseService(_defaultCacheRepo);
