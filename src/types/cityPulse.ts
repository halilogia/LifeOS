/**
 * cityPulse.ts
 * Types for the City Pulse (İstanbul free events) feature.
 * Data source: kultur.istanbul WordPress REST API (event_listing post type).
 */

export interface CityEventCategory {
  id: number;
  name: string;
  count: number;
}

export interface CityEventType {
  id: number;
  name: string;
  count: number;
}

export interface CityEvent {
  id: number;
  title: string;
  link: string;
  date: string; // ISO date from the API
  excerpt: string; // Plain-text excerpt (HTML stripped & sanitized at render)
  categoryIds: number[];
  typeIds: number[];
}

export interface CachedCityEvents {
  timestamp: number;
  data: CityEvent[];
}

export interface CachedCityTaxonomies {
  timestamp: number;
  categories: CityEventCategory[];
  types: CityEventType[];
}
