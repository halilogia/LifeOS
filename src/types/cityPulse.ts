/**
 * cityPulse.ts
 * Types for the City Pulse (Şehir Etkinlikleri) feature.
 * Data source: kultur.istanbul WordPress REST API (event_listing post type) & event hubs.
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
  date: string; // ISO date or formatted date string from the API
  excerpt: string; // Plain-text excerpt (HTML stripped & sanitized at render)
  categoryIds: number[];
  typeIds: number[];
  imageUrl?: string; // Extracted featured media or inline image
  venueName?: string; // Primary venue or location name
  priceType?: "free" | "paid" | "unknown";
  source?: string;
}

export interface EventHubShortcut {
  id: string;
  name: string;
  url: string;
  category: "all" | "culture" | "tickets" | "tech" | "museum";
  iconName?: string;
  description: string;
  badge?: string;
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
