/**
 * cityPulseService
 * Service layer for the City Pulse (İstanbul free events) module.
 * Fetches live events + taxonomies from the kultur.istanbul WordPress REST API
 * and caches results via ICityPulseCacheRepository. No chrome.* calls here.
 */

import type {
  CityEvent,
  CityEventCategory,
  CityEventType,
} from "@/types/cityPulse.js";
import type { ICityPulseCacheRepository } from "@/domain/repositories/ICityPulseCacheRepository.js";

const EVENTS_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes
const TAXONOMIES_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const EVENTS_URL =
  "https://kultur.istanbul/wp-json/wp/v2/event_listing?per_page=50&_fields=id,date,link,title,content,excerpt,event_listing_category,event_listing_type";
const CATEGORIES_URL =
  "https://kultur.istanbul/wp-json/wp/v2/event_listing_category?per_page=100&_fields=id,name,count";
const TYPES_URL =
  "https://kultur.istanbul/wp-json/wp/v2/event_listing_type?per_page=100&_fields=id,name,count";

interface WpEvent {
  id: number;
  date: string;
  link: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  event_listing_category?: number[];
  event_listing_type?: number[];
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
      .trim(),
  );
}

export function createCityPulseService(cacheRepo: ICityPulseCacheRepository) {
  return {
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
        const response = await fetch(EVENTS_URL, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = (await response.json()) as WpEvent[];
        const list: CityEvent[] = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              title: item.title?.rendered || "",
              link: item.link || "",
              date: item.date || "",
              excerpt: stripHtml(item.excerpt?.rendered || ""),
              categoryIds: Array.isArray(item.event_listing_category)
                ? item.event_listing_category
                : [],
              typeIds: Array.isArray(item.event_listing_type)
                ? item.event_listing_type
                : [],
            }))
          : [];
        await cacheRepo.setEventsCache(list);
        return list;
      } catch (error) {
        logger.error("cityPulseService: Failed to fetch events:", error);
        const cached = await cacheRepo.getEventsCache();
        if (cached && cached.data.length > 0) {
          logger.log(
            "cityPulseService: Using expired events cache as fallback",
          );
          return cached.data;
        }
        throw error;
      }
    },

    /**
     * Fetches event taxonomies (locations/categories and types), utilizing cache.
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
          throw new Error(
            `HTTP error! categories: ${catRes.status}, types: ${typeRes.status}`,
          );
        }

        const catData = (await catRes.json()) as WpTerm[];
        const typeData = (await typeRes.json()) as WpTerm[];
        const categories: CityEventCategory[] = Array.isArray(catData)
          ? catData.map((t) => ({ id: t.id, name: t.name, count: t.count }))
          : [];
        const types: CityEventType[] = Array.isArray(typeData)
          ? typeData.map((t) => ({ id: t.id, name: t.name, count: t.count }))
          : [];

        await cacheRepo.setTaxonomiesCache(categories, types);
        return { categories, types };
      } catch (error) {
        logger.error("cityPulseService: Failed to fetch taxonomies:", error);
        if (cached) {
          logger.log(
            "cityPulseService: Using expired taxonomies cache as fallback",
          );
          return { categories: cached.categories, types: cached.types };
        }
        throw error;
      }
    },

    loadFavorites(): Promise<number[]> {
      return cacheRepo.loadFavorites();
    },

    saveFavorites(favorites: number[]): Promise<void> {
      return cacheRepo.saveFavorites(favorites);
    },
  };
}

export type CityPulseService = ReturnType<typeof createCityPulseService>;

/**
 * Singleton instance with the default storage-backed repository.
 * Components that need testability can import `createCityPulseService` instead.
 */
import { ChromeStorageCityPulseCacheRepository } from "@/infrastructure/persistence/repositories/ChromeStorageCityPulseCacheRepository.js";
import { logger } from "@/utils/logger.js";
const _defaultCacheRepo = new ChromeStorageCityPulseCacheRepository();
export const cityPulseService = createCityPulseService(_defaultCacheRepo);
