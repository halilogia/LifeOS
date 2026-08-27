/**
 * ICityPulseCacheRepository Interface
 * Repository pattern for City Pulse cache data (events, taxonomies, favorites).
 * Domain layer — pure interface, no external dependencies.
 */

import type {
  CityEvent,
  CityEventCategory,
  CityEventType,
  CachedCityEvents,
  CachedCityTaxonomies,
} from "@/types/cityPulse.js";

export interface ICityPulseCacheRepository {
  getEventsCache(): Promise<CachedCityEvents | null>;
  saveEventsCache(data: CityEvent[]): Promise<void>;
  setEventsCache?(data: CityEvent[]): Promise<void>;
  getTaxonomiesCache(): Promise<CachedCityTaxonomies | null>;
  saveTaxonomiesCache(
    categories: CityEventCategory[],
    types: CityEventType[],
  ): Promise<void>;
  setTaxonomiesCache?(
    categories: CityEventCategory[],
    types: CityEventType[],
  ): Promise<void>;
  loadFavorites(): Promise<number[]>;
  getFavorites?(): Promise<number[]>;
  saveFavorites(favorites: number[]): Promise<void>;
}
