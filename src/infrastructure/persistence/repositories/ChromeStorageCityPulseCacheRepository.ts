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

export class ChromeStorageCityPulseCacheRepository implements ICityPulseCacheRepository {
  getEventsCache(): Promise<CachedCityEvents | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([EVENTS_KEY], (res) => {
        resolve((res[EVENTS_KEY] as CachedCityEvents) || null);
      });
    });
  }

  setEventsCache(data: CityEvent[]): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedCityEvents = {
        timestamp: Date.now(),
        data,
      };
      chrome.storage.local.set({ [EVENTS_KEY]: cacheVal }, resolve);
    });
  }

  getTaxonomiesCache(): Promise<CachedCityTaxonomies | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([TAXONOMIES_KEY], (res) => {
        resolve((res[TAXONOMIES_KEY] as CachedCityTaxonomies) || null);
      });
    });
  }

  setTaxonomiesCache(
    categories: CityEventCategory[],
    types: CityEventType[],
  ): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedCityTaxonomies = {
        timestamp: Date.now(),
        categories,
        types,
      };
      chrome.storage.local.set({ [TAXONOMIES_KEY]: cacheVal }, resolve);
    });
  }

  loadFavorites(): Promise<number[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([FAVORITES_KEY], (res) => {
        const stored = res[FAVORITES_KEY] as number[] | undefined;
        resolve(Array.isArray(stored) ? stored : []);
      });
    });
  }

  saveFavorites(favorites: number[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [FAVORITES_KEY]: favorites }, resolve);
    });
  }
}
