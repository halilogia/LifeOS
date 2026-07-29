/**
 * Types for free-games features (GamerPower API, Epic history, exclusions).
 * Shared between service layer, components, and cache repository.
 */

export interface Giveaway {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  platforms: string;
  end_date: string;
  type: string;
  status: string;
}

export interface HistoricalEpicGame {
  gameTitle: string;
  freeDate: string;
  epicStoreLink?: string;
  metacriticScore?: number;
  metacriticUrl?: string;
  steamDBRating?: number;
  steamUrl?: string;
}

export interface ExclusionSettings {
  steam: boolean;
  epic: boolean;
  gog: boolean;
  humble: boolean;
  indiegala: boolean;
  itch: boolean;
  other: boolean;
}

export const defaultExclusions: ExclusionSettings = {
  steam: true,
  epic: true,
  gog: true,
  humble: true,
  indiegala: true,
  itch: true,
  other: true,
};

export interface CachedLiveGames {
  timestamp: number;
  data: Giveaway[];
}

export interface CachedHistoryGames {
  timestamp: number;
  data: HistoricalEpicGame[];
}
