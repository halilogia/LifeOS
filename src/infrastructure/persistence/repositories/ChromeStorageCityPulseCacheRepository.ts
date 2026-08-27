/**
 * ChromeStorageCityPulseCacheRepository
 * Infrastructure implementation of ICityPulseCacheRepository using chrome.storage.local
 * for City Pulse cache data (events, taxonomies) and user favorites.
 */

import type { ICityPulseCacheRepository } from "@/domain/repositories/ICityPulseCacheRepository.js";
import type {
  CityEvent,
  CityEventCategory,
  CityEventType,
  CachedCityEvents,
  CachedCityTaxonomies,
} from "@/types/cityPulse.js";
import {
  LOCAL_CITY_PULSE_EVENTS,
  LOCAL_CITY_PULSE_TAXONOMIES,
  LOCAL_CITY_PULSE_FAVORITES,
} from "@/infrastructure/storage/keys.js";

const EVENTS_KEY = LOCAL_CITY_PULSE_EVENTS;
const TAXONOMIES_KEY = LOCAL_CITY_PULSE_TAXONOMIES;
const FAVORITES_KEY = LOCAL_CITY_PULSE_FAVORITES;

export class ChromeStorageCityPulseCacheRepository
  implements ICityPulseCacheRepository
{
  getEventsCache(): Promise<CachedCityEvents | null> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          const raw = localStorage.getItem(EVENTS_KEY);
          resolve(raw ? (JSON.parse(raw) as CachedCityEvents) : null);
        } catch {
          resolve(null);
        }
        return;
      }
      chrome.storage.local.get([EVENTS_KEY], (res) => {
        resolve((res[EVENTS_KEY] as CachedCityEvents) || null);
      });
    });
  }

  saveEventsCache(data: CityEvent[]): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedCityEvents = {
        timestamp: Date.now(),
        data,
      };
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          localStorage.setItem(EVENTS_KEY, JSON.stringify(cacheVal));
        } catch {
          // ignore
        }
        resolve();
        return;
      }
      chrome.storage.local.set({ [EVENTS_KEY]: cacheVal }, () => resolve());
    });
  }

  setEventsCache(data: CityEvent[]): Promise<void> {
    return this.saveEventsCache(data);
  }

  getTaxonomiesCache(): Promise<CachedCityTaxonomies | null> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          const raw = localStorage.getItem(TAXONOMIES_KEY);
          resolve(raw ? (JSON.parse(raw) as CachedCityTaxonomies) : null);
        } catch {
          resolve(null);
        }
        return;
      }
      chrome.storage.local.get([TAXONOMIES_KEY], (res) => {
        resolve((res[TAXONOMIES_KEY] as CachedCityTaxonomies) || null);
      });
    });
  }

  saveTaxonomiesCache(
    categories: CityEventCategory[],
    types: CityEventType[],
  ): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedCityTaxonomies = {
        timestamp: Date.now(),
        categories,
        types,
      };
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          localStorage.setItem(TAXONOMIES_KEY, JSON.stringify(cacheVal));
        } catch {
          // ignore
        }
        resolve();
        return;
      }
      chrome.storage.local.set({ [TAXONOMIES_KEY]: cacheVal }, () => resolve());
    });
  }

  setTaxonomiesCache(
    categories: CityEventCategory[],
    types: CityEventType[],
  ): Promise<void> {
    return this.saveTaxonomiesCache(categories, types);
  }

  loadFavorites(): Promise<number[]> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          const raw = localStorage.getItem(FAVORITES_KEY);
          resolve(raw ? (JSON.parse(raw) as number[]) : []);
        } catch {
          resolve([]);
        }
        return;
      }
      chrome.storage.local.get([FAVORITES_KEY], (res) => {
        const stored = res[FAVORITES_KEY] as number[] | undefined;
        resolve(Array.isArray(stored) ? stored : []);
      });
    });
  }

  getFavorites(): Promise<number[]> {
    return this.loadFavorites();
  }

  saveFavorites(favorites: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        } catch {
          // ignore
        }
        resolve();
        return;
      }
      chrome.storage.local.set({ [FAVORITES_KEY]: favorites }, () => resolve());
    });
  }
}
