/**
 * mediaInternetSyncService.ts
 * Service for fetching and synchronizing live catalog data from public open APIs
 * (e.g., TVMaze API for TV series, Open Library for books, public databases).
 * Merges live web results with the curated offline-first golden catalog so that
 * the user never experiences a blank screen and never needs to manually add items.
 */

import {
  CURATED_TV_SHOWS,
  CURATED_BOOKS,
  CURATED_GAMES,
  CURATED_MOVIES,
  type CuratedTvItem,
  type CuratedBookItem,
  type CuratedGameItem,
  type CuratedMovieItem,
} from "./curatedCatalogData.js";
import { normalizeTitle } from "./movieSeriesData.js";
import { logger } from "@/utils/logger.js";

const CACHE_STORAGE_KEY = "lifeos_media_web_catalog_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface WebCatalogCache {
  lastUpdated: string;
  tvShows: CuratedTvItem[];
  books: CuratedBookItem[];
  games: CuratedGameItem[];
  movies: CuratedMovieItem[];
}

export interface SyncCatalogResult {
  success: boolean;
  tvCount: number;
  bookCount: number;
  gameCount: number;
  movieCount: number;
  lastUpdated: string;
  error?: string;
}

/**
 * Strips HTML tags from text (useful for TVMaze summaries).
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

/**
 * Fetches popular TV shows from TVMaze's public API without needing any API key.
 */
export async function fetchPopularTvShowsFromTvMaze(limit = 20): Promise<CuratedTvItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://api.tvmaze.com/shows?page=0", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`TVMaze API returned status ${res.status}`);
    }

    const data: Array<{
      id: number;
      name: string;
      genres?: string[];
      rating?: { average?: number };
      image?: { medium?: string; original?: string };
      summary?: string;
      premiered?: string;
      network?: { name: string };
      webChannel?: { name: string };
    }> = await res.json();

    // Filter top rated and map to CuratedTvItem
    const validShows = data
      .filter((s) => s.rating?.average && s.rating.average >= 8.0)
      .slice(0, limit)
      .map((s): CuratedTvItem => {
        const releaseYear = s.premiered ? parseInt(s.premiered.slice(0, 4), 10) : 2020;
        const mainGenre = s.genres && s.genres.length > 0 ? s.genres[0] : "Drama";
        
        let category = "Suç & Drama";
        if (s.genres?.some((g) => /sci-fi|fantasy/i.test(g))) {
          category = "Bilim Kurgu & Gerilim";
        } else if (s.genres?.some((g) => /comedy/i.test(g))) {
          category = "Komedi & Hiciv";
        } else if (s.genres?.some((g) => /history|war/i.test(g))) {
          category = "Tarih & Mini-Dizi";
        } else if (s.genres?.some((g) => /mystery|crime/i.test(g))) {
          category = "Suç & Drama";
        }

        return {
          id: `web-tvmaze-${s.id}`,
          title: s.name,
          creator: s.network?.name || s.webChannel?.name || "TV Network",
          totalSeasons: 3, // default estimation
          totalEpisodes: 30,
          releaseYear: isNaN(releaseYear) ? 2020 : releaseYear,
          category,
          genres: s.genres && s.genres.length > 0 ? s.genres : [category],
          coverUrl:
            s.image?.medium ||
            s.image?.original ||
            "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=500&q=80",
          rating: s.rating?.average || 8.0,
          synopsis: s.summary
            ? stripHtml(s.summary)
            : `${s.name} popüler televizyon dizisi.`,
        };
      });

    return validShows;
  } catch (err) {
    logger.warn("[mediaInternetSyncService] TVMaze live fetch skipped:", err);
    return [];
  }
}

/**
 * Fetches curated books across subjects (philosophy, classics, dystopian, politics) from Open Library API.
 */
export async function fetchBooksFromOpenLibrary(
  subjects = ["philosophy", "classic_literature", "dystopian", "politics"],
  limitPerSubject = 15,
): Promise<CuratedBookItem[]> {
  const books: CuratedBookItem[] = [];

  for (const subject of subjects) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `https://openlibrary.org/subjects/${subject}.json?limit=${limitPerSubject}`,
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data: {
        works?: Array<{
          key: string;
          title: string;
          authors?: Array<{ name: string }>;
          first_publish_year?: number;
          cover_id?: number;
        }>;
      } = await res.json();

      if (!data.works) continue;

      let categoryName = "Klasikler & Edebiyat";
      if (subject === "philosophy") categoryName = "Felsefe & Düşünce";
      else if (subject === "dystopian") categoryName = "Bilim Kurgu & Distopya";
      else if (subject === "politics") categoryName = "Politika & Toplum";

      for (const work of data.works) {
        if (!work.title) continue;
        const authorName =
          work.authors && work.authors.length > 0
            ? work.authors[0].name
            : "Klasik Yazar";
        const coverUrl = work.cover_id
          ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
          : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80";

        books.push({
          id: `web-ol-${work.key.replace(/\//g, "-")}`,
          title: work.title,
          author: authorName,
          totalPages: 320,
          releaseYear: work.first_publish_year || 1950,
          category: categoryName,
          genres: [categoryName, subject],
          coverUrl,
          rating: 8.8,
          synopsis: `${work.title} - ${authorName} tarafından kaleme alınan ${categoryName.toLowerCase()} alanında saygın eser.`,
        });
      }
    } catch (err) {
      logger.warn(`[mediaInternetSyncService] Open Library ${subject} fetch skipped:`, err);
    }
  }

  return books;
}

/**
 * Fetches top rated movies from open movie catalog feeds (IMDb Top 250 / Open database).
 */
export async function fetchTopMoviesFromOpenDataset(limit = 40): Promise<CuratedMovieItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      "https://raw.githubusercontent.com/movie-monk-b0t/top250/master/top250.json",
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data: Array<{
      name: string;
      image?: string;
      description?: string;
      datePublished?: string;
      director?: Array<{ name: string }>;
      genre?: string[];
      aggregateRating?: { ratingValue?: number };
    }> = await res.json();

    return data.slice(0, limit).map((m, idx): CuratedMovieItem => {
      const year = m.datePublished ? parseInt(m.datePublished.slice(0, 4), 10) : 2000;
      const director =
        m.director && m.director.length > 0 ? m.director[0].name : "Yönetmen";
      const rating = m.aggregateRating?.ratingValue || 8.5;
      const genres = m.genre && m.genre.length > 0 ? m.genre : ["Dram", "Kült"];

      let category = "Kült Başyapıtlar";
      if (genres.some((g) => /sci-fi|fantasy/i.test(g))) {
        category = "Bilim Kurgu & Zihin Açıcı";
      } else if (genres.some((g) => /crime|mystery/i.test(g))) {
        category = "Suç & Kara Film";
      } else if (genres.some((g) => /history|war/i.test(g))) {
        category = "Tarih & Biyografi";
      }

      return {
        id: `web-imdb-${idx}-${m.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        title: m.name,
        originalTitle: m.name,
        director,
        releaseYear: isNaN(year) ? 2000 : year,
        category,
        genres,
        coverUrl:
          m.image ||
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
        rating,
        synopsis: m.description || `${m.name}, IMDb Top listesinde yer alan kült sinema eseri.`,
      };
    });
  } catch (err) {
    logger.warn("[mediaInternetSyncService] Open movies fetch skipped:", err);
    return [];
  }
}

/**
 * Fetches popular gaming titles from open database.
 */
export async function fetchGamesFromOpenApi(limit = 30): Promise<CuratedGameItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://www.freetogame.com/api/games", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data: Array<{
      id: number;
      title: string;
      thumbnail?: string;
      short_description?: string;
      genre?: string;
      developer?: string;
      publisher?: string;
      release_date?: string;
    }> = await res.json();

    return data.slice(0, limit).map((g): CuratedGameItem => {
      const year = g.release_date ? parseInt(g.release_date.slice(0, 4), 10) : 2020;
      const genre = g.genre || "Aksiyon";
      let category = "Aksiyon & Macera";
      if (/rpg|mmorpg/i.test(genre)) category = "Rol Yapma (RPG)";
      else if (/strategy/i.test(genre)) category = "Strateji";

      return {
        id: `web-game-${g.id}`,
        title: g.title,
        developer: g.developer || g.publisher || "Oyun Stüdyosu",
        releaseYear: isNaN(year) ? 2020 : year,
        category,
        genres: [genre, "Popüler"],
        coverUrl:
          g.thumbnail ||
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80",
        rating: 8.8,
        playtimeHours: 40,
        synopsis:
          g.short_description ||
          `${g.title} dünya genelinde milyonlarca oyuncusu bulunan popüler video oyunu.`,
      };
    });
  } catch (err) {
    logger.warn("[mediaInternetSyncService] Games fetch skipped:", err);
    return [];
  }
}

/**
 * Merges two lists of items while preserving unique normalized titles.
 */
function mergeByTitle<T extends { title: string; originalTitle?: string }>(
  baseItems: T[],
  newItems: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of baseItems) {
    const key = normalizeTitle(item.title);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  for (const item of newItems) {
    const key = normalizeTitle(item.title);
    const origKey = item.originalTitle ? normalizeTitle(item.originalTitle) : "";
    if (!seen.has(key) && (!origKey || !seen.has(origKey))) {
      seen.add(key);
      if (origKey) seen.add(origKey);
      result.push(item);
    }
  }

  return result;
}

let _memoryCache: WebCatalogCache | null = null;

/**
 * Loads the current cached catalog from storage or in-memory fallback.
 */
export function getStoredWebCatalog(): WebCatalogCache | null {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as WebCatalogCache;
    }
  } catch {
    // fallback to in-memory
  }
  return _memoryCache;
}

/**
 * Saves web catalog to storage and in-memory cache.
 */
export function saveWebCatalog(catalog: WebCatalogCache): void {
  _memoryCache = catalog;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(catalog));
    }
  } catch (err) {
    logger.warn("[mediaInternetSyncService] Failed to cache web catalog:", err);
  }
}

/**
 * Returns merged active catalog combining golden offline curated data
 * with any synced internet items.
 */
export function getActiveMergedCatalog(): {
  tvShows: CuratedTvItem[];
  books: CuratedBookItem[];
  games: CuratedGameItem[];
  movies: CuratedMovieItem[];
} {
  const cached = getStoredWebCatalog();

  if (!cached) {
    return {
      tvShows: CURATED_TV_SHOWS,
      books: CURATED_BOOKS,
      games: CURATED_GAMES,
      movies: CURATED_MOVIES,
    };
  }

  return {
    tvShows: mergeByTitle(CURATED_TV_SHOWS, cached.tvShows || []),
    books: mergeByTitle(CURATED_BOOKS, cached.books || []),
    games: mergeByTitle(CURATED_GAMES, cached.games || []),
    movies: mergeByTitle(CURATED_MOVIES, cached.movies || []),
  };
}

/**
 * Performs a comprehensive multi-source live sync from the internet for ALL categories
 * (TV Shows, Books, Movies, Games) and updates cache.
 */
export async function syncAllCatalogsFromWeb(forceRefresh = false): Promise<SyncCatalogResult> {
  const cached = getStoredWebCatalog();
  const now = Date.now();

  if (
    !forceRefresh &&
    cached &&
    now - new Date(cached.lastUpdated).getTime() < CACHE_TTL_MS
  ) {
    return {
      success: true,
      tvCount: (cached.tvShows || CURATED_TV_SHOWS).length,
      bookCount: (cached.books || CURATED_BOOKS).length,
      gameCount: (cached.games || CURATED_GAMES).length,
      movieCount: (cached.movies || CURATED_MOVIES).length,
      lastUpdated: cached.lastUpdated,
    };
  }

  try {
    // 1. Fetch TV, Books, Movies, Games in parallel
    const [tvResult, booksResult, moviesResult, gamesResult] = await Promise.allSettled([
      fetchPopularTvShowsFromTvMaze(40),
      fetchBooksFromOpenLibrary(["philosophy", "classic_literature", "dystopian", "politics"], 15),
      fetchTopMoviesFromOpenDataset(40),
      fetchGamesFromOpenApi(30),
    ]);

    const liveTvShows = tvResult.status === "fulfilled" ? tvResult.value : [];
    const liveBooks = booksResult.status === "fulfilled" ? booksResult.value : [];
    const liveMovies = moviesResult.status === "fulfilled" ? moviesResult.value : [];
    const liveGames = gamesResult.status === "fulfilled" ? gamesResult.value : [];

    // 2. Merge with base catalogs
    const mergedTv = mergeByTitle(CURATED_TV_SHOWS, liveTvShows);
    const mergedBooks = mergeByTitle(CURATED_BOOKS, liveBooks);
    const mergedMovies = mergeByTitle(CURATED_MOVIES, liveMovies);
    const mergedGames = mergeByTitle(CURATED_GAMES, liveGames);

    const newCache: WebCatalogCache = {
      lastUpdated: new Date().toISOString(),
      tvShows: mergedTv,
      books: mergedBooks,
      games: mergedGames,
      movies: mergedMovies,
    };

    saveWebCatalog(newCache);

    return {
      success: true,
      tvCount: mergedTv.length,
      bookCount: mergedBooks.length,
      gameCount: mergedGames.length,
      movieCount: mergedMovies.length,
      lastUpdated: newCache.lastUpdated,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("[mediaInternetSyncService] Sync failed:", errorMsg);

    return {
      success: false,
      tvCount: CURATED_TV_SHOWS.length,
      bookCount: CURATED_BOOKS.length,
      gameCount: CURATED_GAMES.length,
      movieCount: CURATED_MOVIES.length,
      lastUpdated: new Date().toISOString(),
      error: errorMsg,
    };
  }
}

export interface WebSearchResultItem {
  id: string;
  type: "movie" | "tv" | "book" | "game";
  title: string;
  originalTitle?: string;
  creator: string;
  releaseYear?: number;
  category: string;
  genres: string[];
  coverUrl: string;
  rating: number;
  synopsis: string;
  extraInfo?: string;
  rawTvItem?: CuratedTvItem;
  rawMovieItem?: CuratedMovieItem;
  rawBookItem?: CuratedBookItem;
}

/**
 * Searches public open APIs (TVMaze, etc.) on-demand for any film or series.
 */
export async function searchInternetMedia(query: string): Promise<WebSearchResultItem[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  const results: WebSearchResultItem[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanQ)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const shows: Array<{
        show: {
          id: number;
          name: string;
          genres?: string[];
          rating?: { average?: number };
          image?: { medium?: string; original?: string };
          summary?: string;
          premiered?: string;
          network?: { name: string };
          webChannel?: { name: string };
        };
      }> = await res.json();

      for (const item of shows.slice(0, 8)) {
        const s = item.show;
        const releaseYear = s.premiered ? parseInt(s.premiered.slice(0, 4), 10) : 2020;
        const genres = s.genres && s.genres.length > 0 ? s.genres : ["Drama"];
        const creator = s.network?.name || s.webChannel?.name || "TV Network";
        const coverUrl =
          s.image?.medium ||
          s.image?.original ||
          "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=500&q=80";
        const synopsis = s.summary ? stripHtml(s.summary) : `${s.name} dizisi.`;
        const rating = s.rating?.average || 7.5;

        results.push({
          id: `web-search-tv-${s.id}`,
          type: "tv",
          title: s.name,
          creator,
          releaseYear: isNaN(releaseYear) ? 2020 : releaseYear,
          category: genres[0] || "Dizi",
          genres,
          coverUrl,
          rating,
          synopsis,
          extraInfo: `${isNaN(releaseYear) ? "" : releaseYear} • TV Dizisi`,
          rawTvItem: {
            id: `web-tv-${s.id}`,
            title: s.name,
            creator,
            totalSeasons: 3,
            totalEpisodes: 30,
            releaseYear: isNaN(releaseYear) ? 2020 : releaseYear,
            category: "Dizi",
            genres,
            coverUrl,
            rating,
            synopsis,
          },
        });
      }
    }
  } catch (err) {
    logger.warn("[mediaInternetSyncService] TVMaze live search skipped:", err);
  }

  return results;
}

