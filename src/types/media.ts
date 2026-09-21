/**
 * media.ts
 * Type definitions for Media Vault (Movies, TV Series, Books & Games tracking).
 */

export type MediaType = "movie" | "tv" | "book" | "game";

export type MediaStatus = "in_progress" | "completed" | "backlog" | "dropped";

export type GamePlaystyle = "main_story" | "main_extra" | "completionist";

export type GamePlatform =
  | "PC"
  | "Steam Deck"
  | "PlayStation"
  | "Xbox"
  | "Nintendo"
  | "Mobile"
  | "Other";

export interface MediaQuote {
  id: string;
  text: string;
  page?: number;
  createdAt: string;
}

export interface MovieProgress {
  runtimeMinutes?: number;
  rewatchCount?: number;
  watchedDate?: string;
}

export interface TvProgress {
  currentSeason: number;
  currentEpisode: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  rewatchCount?: number;
}

export interface BookProgress {
  currentPage: number;
  totalPages: number;
  quotes: MediaQuote[];
}

export interface GameProgress {
  playtimeHours: number;
  targetHours?: number;
  playstyle: GamePlaystyle;
  platform: GamePlatform;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  creator?: string; // Director, Author, Studio
  coverUrl?: string;
  releaseYear?: number;
  genres?: string[];
  status: MediaStatus;
  rating: number; // 0 to 10 (0 = unrated)
  review?: string;
  favorite: boolean;
  movieProgress?: MovieProgress;
  tvProgress?: TvProgress;
  bookProgress?: BookProgress;
  gameProgress?: GameProgress;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
}

export type MediaSortBy =
  | "updated"
  | "rating_desc"
  | "rating_asc"
  | "title"
  | "progress";

export type MediaTypeFilter = "all" | MediaType;

export type MediaStatusFilter = "all" | MediaStatus;

export interface MediaStats {
  totalItems: number;
  totalMoviesWatched: number;
  totalTvEpisodesWatched: number;
  totalTvSeriesCompleted: number;
  totalBookPagesRead: number;
  totalBooksCompleted: number;
  totalGameHoursPlayed: number;
  totalGamesCompleted: number;
  averageRating: number;
  inProgressCount: number;
  completedCount: number;
  backlogCount: number;
}
