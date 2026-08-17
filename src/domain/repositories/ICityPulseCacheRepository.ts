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
  setEventsCache(data: CityEvent[]): Promise<void>;
  getTaxonomiesCache(): Promise<CachedCityTaxonomies | null>;
  setTaxonomiesCache(
    categories: CityEventCategory[],
    types: CityEventType[],
  ): Promise<void>;
  loadFavorites(): Promise<number[]>;
  saveFavorites(favorites: number[]): Promise<void>;
}
