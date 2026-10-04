/**
 * mediaInternetSyncService.ts
 * Hardened Service for fetching and synchronizing live catalog data from open APIs
 * (TVMaze API for TV series, Open Library for books, FreeToGame for games, IMDb top feed).
 * Adheres strictly to Zero Hardcoded Fake Data Protocol: missing values remain undefined.
 * All external boundaries validated via Zod schemas.
 * Uses ChromeStorageMediaCatalogCache for MV3 storage of remote deltas only.
 */

import { z } from "zod";
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
import {
  mediaCatalogCache,
  type StoredWebCatalogDelta,
} from "@/infrastructure/persistence/repositories/ChromeStorageMediaCatalogCache.js";
import { logger } from "@/utils/logger.js";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Pin to immutable commit SHA on GitHub to avoid master branch drift / supply-chain tampering
const IMDB_TOP250_URL =
  "https://raw.githubusercontent.com/movie-monk-b0t/top250/a75ff045a4ce2b779cc748ac4a5df582c8fc2915/top250.json";

/* ── Zod Validation Schemas for External API Boundaries ────── */

const TvMazeShowSchema = z.object({
  id: z.number(),
  name: z.string(),
  genres: z.array(z.string()).optional(),
  rating: z.object({ average: z.number().nullable().optional() }).optional(),
  image: z
    .object({
      medium: z.string().optional(),
      original: z.string().optional(),
    })
    .nullable()
    .optional(),
  summary: z.string().nullable().optional(),
  premiered: z.string().nullable().optional(),
  network: z.object({ name: z.string() }).nullable().optional(),
  webChannel: z.object({ name: z.string() }).nullable().optional(),
});

const TvMazeSearchResultSchema = z.array(
  z.object({
    show: TvMazeShowSchema,
  }),
);

const OpenLibrarySubjectResponseSchema = z.object({
  works: z
    .array(
      z.object({
        key: z.string(),
        title: z.string(),
        authors: z.array(z.object({ name: z.string() })).optional(),
        first_publish_year: z.number().optional(),
        cover_id: z.number().optional(),
      }),
    )
    .optional(),
});

const FreeToGameItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  thumbnail: z.string().optional(),
  short_description: z.string().optional(),
  genre: z.string().optional(),
  platform: z.string().optional(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  release_date: z.string().optional(),
});

const ImdbMovieItemSchema = z.object({
  name: z.string(),
  image: z.string().optional(),
  description: z.string().optional(),
  datePublished: z.string().optional(),
  director: z.array(z.object({ name: z.string() })).optional(),
  genre: z.array(z.string()).optional(),
  aggregateRating: z
    .object({
      ratingValue: z.number().optional(),
    })
    .optional(),
});

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
 * Fetches popular TV shows from TVMaze's public API with Zod validation.
 * Never invents fake season/episode counts.
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

    const rawJson = await res.json();
    const parseResult = z.array(TvMazeShowSchema).safeParse(rawJson);

    if (!parseResult.success) {
      logger.warn("[mediaInternetSyncService] TVMaze schema validation failed:", parseResult.error);
      return [];
    }

    const data = parseResult.data;

    // Filter top rated and map to CuratedTvItem without fake season/episode counts
    const validShows = data
      .filter((s) => s.rating?.average && s.rating.average >= 8.0)
      .slice(0, limit)
      .map((s): CuratedTvItem => {
        const parsedYear = s.premiered ? parseInt(s.premiered.slice(0, 4), 10) : undefined;
        const releaseYear = parsedYear && !isNaN(parsedYear) ? parsedYear : undefined;
        
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
          creator: s.network?.name || s.webChannel?.name || undefined,
          totalSeasons: undefined, // Zero fake data: not provided by /shows summary
          totalEpisodes: undefined,
          releaseYear,
          category,
          genres: s.genres && s.genres.length > 0 ? s.genres : [],
          coverUrl: s.image?.medium || s.image?.original || undefined,
          rating: s.rating?.average ?? undefined,
          synopsis: s.summary ? stripHtml(s.summary) : undefined,
          provenance: "api",
        };
      });

    return validShows;
  } catch (err) {
    logger.warn("[mediaInternetSyncService] TVMaze live fetch skipped:", err);
    return [];
  }
}

/**
 * Fetches curated books across subjects from Open Library API with Zod validation.
 * Never invents fake page counts or fake 8.8 ratings.
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

      if (!res.ok) {continue;}

      const rawJson = await res.json();
      const parseResult = OpenLibrarySubjectResponseSchema.safeParse(rawJson);

      if (!parseResult.success || !parseResult.data.works) {
        continue;
      }

      const works = parseResult.data.works;

      let categoryName = "Klasikler & Edebiyat";
      if (subject === "philosophy") {categoryName = "Felsefe & Düşünce";}
      else if (subject === "dystopian") {categoryName = "Bilim Kurgu & Distopya";}
      else if (subject === "politics") {categoryName = "Politika & Toplum";}

      for (const work of works) {
        if (!work.title) {continue;}
        const authorName =
          work.authors && work.authors.length > 0
            ? work.authors[0].name
            : undefined;
        const coverUrl = work.cover_id
          ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
          : undefined;

        books.push({
          id: `web-ol-${work.key.replace(/\//g, "-")}`,
          title: work.title,
          author: authorName,
          totalPages: undefined, // Zero fake data
          releaseYear: work.first_publish_year || undefined,
          category: categoryName,
          genres: [categoryName, subject],
          coverUrl,
          rating: undefined, // Zero fake data
          synopsis: undefined,
          provenance: "api",
        });
      }
    } catch (err) {
      logger.warn(`[mediaInternetSyncService] Open Library ${subject} fetch skipped:`, err);
    }
  }

  return books;
}

/**
 * Fetches top rated movies from open movie catalog feeds with Zod validation.
 */
export async function fetchTopMoviesFromOpenDataset(limit = 40): Promise<CuratedMovieItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(IMDB_TOP250_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {return [];}

    const rawJson = await res.json();
    const parseResult = z.array(ImdbMovieItemSchema).safeParse(rawJson);

    if (!parseResult.success) {
      logger.warn("[mediaInternetSyncService] IMDb movie schema validation failed:", parseResult.error);
      return [];
    }

    const data = parseResult.data;

    return data.slice(0, limit).map((m, idx): CuratedMovieItem => {
      const parsedYear = m.datePublished ? parseInt(m.datePublished.slice(0, 4), 10) : undefined;
      const releaseYear = parsedYear && !isNaN(parsedYear) ? parsedYear : undefined;
      const director =
        m.director && m.director.length > 0 ? m.director[0].name : undefined;
      const rating = m.aggregateRating?.ratingValue ?? undefined;
      // Zero fake data: only use genres actually returned by the API.
      const genres = m.genre && m.genre.length > 0 ? m.genre : [];

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
        releaseYear,
        runtimeMinutes: undefined, // Zero fake data
        category,
        genres,
        coverUrl: m.image || undefined,
        rating,
        synopsis: m.description || undefined,
        provenance: "api",
      };
    });
  } catch (err) {
    logger.warn("[mediaInternetSyncService] Open movies fetch skipped:", err);
    return [];
  }
}

/**
 * Fetches popular gaming titles from open database with Zod validation.
 * Never invents fake 8.8 rating or 40 hours playtime.
 */
export async function fetchGamesFromOpenApi(limit = 30): Promise<CuratedGameItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://www.freetogame.com/api/games", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {return [];}

    const rawJson = await res.json();
    const parseResult = z.array(FreeToGameItemSchema).safeParse(rawJson);

    if (!parseResult.success) {
      logger.warn("[mediaInternetSyncService] FreeToGame schema validation failed:", parseResult.error);
      return [];
    }

    const data = parseResult.data;

    return data.slice(0, limit).map((g): CuratedGameItem => {
      const parsedYear = g.release_date ? parseInt(g.release_date.slice(0, 4), 10) : undefined;
      const releaseYear = parsedYear && !isNaN(parsedYear) ? parsedYear : undefined;
      // Zero fake data: only use the genre actually provided by the API.
      const genre = g.genre?.trim() || undefined;
      let category = "Popüler";
      if (genre && /rpg|mmorpg/i.test(genre)) {category = "Rol Yapma (RPG)";}
      else if (genre && /strategy/i.test(genre)) {category = "Strateji";}
      else if (genre && /shooter|action/i.test(genre)) {category = "Aksiyon & Macera";}

      return {
        id: `web-game-${g.id}`,
        title: g.title,
        developer: g.developer || g.publisher || undefined,
        releaseYear,
        platform: g.platform?.trim() || undefined,
        playtimeHours: undefined, // Zero fake data
        category,
        genres: genre ? [genre] : [],
        coverUrl: g.thumbnail || undefined,
        rating: undefined, // Zero fake data
        synopsis: g.short_description || undefined,
        provenance: "api",
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
      if (origKey) {seen.add(origKey);}
      result.push(item);
    }
  }

  return result;
}

let _memoryCache: StoredWebCatalogDelta | null = null;

/**
 * Loads the current cached delta from storage or in-memory fallback.
 */
export function getStoredWebCatalog(): WebCatalogCache | null {
  if (!_memoryCache) {
    // Attempt asynchronous load into memory cache for subsequent calls
    mediaCatalogCache.loadCache().then((cached) => {
      if (cached) {_memoryCache = cached;}
    });
    return null;
  }
  return {
    lastUpdated: _memoryCache.lastUpdated,
    tvShows: _memoryCache.tvShows || [],
    books: _memoryCache.books || [],
    games: _memoryCache.games || [],
    movies: _memoryCache.movies || [],
  };
}

/**
 * Saves remote delta catalog to storage and in-memory cache.
 */
export function saveWebCatalog(delta: StoredWebCatalogDelta): void {
  _memoryCache = delta;
  mediaCatalogCache.saveCache(delta);
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
 * and saves ONLY the remote delta to ChromeStorageMediaCatalogCache.
 */
export async function syncAllCatalogsFromWeb(forceRefresh = false): Promise<SyncCatalogResult> {
  const cached = _memoryCache || (await mediaCatalogCache.loadCache());
  const now = Date.now();

  if (
    !forceRefresh &&
    cached &&
    now - new Date(cached.lastUpdated).getTime() < CACHE_TTL_MS
  ) {
    _memoryCache = cached;
    return {
      success: true,
      tvCount: mergeByTitle(CURATED_TV_SHOWS, cached.tvShows || []).length,
      bookCount: mergeByTitle(CURATED_BOOKS, cached.books || []).length,
      gameCount: mergeByTitle(CURATED_GAMES, cached.games || []).length,
      movieCount: mergeByTitle(CURATED_MOVIES, cached.movies || []).length,
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

    // 2. Cache ONLY the remote delta (do not duplicate curated items in storage!)
    const deltaCache: StoredWebCatalogDelta = {
      lastUpdated: new Date().toISOString(),
      tvShows: liveTvShows,
      books: liveBooks,
      games: liveGames,
      movies: liveMovies,
    };

    saveWebCatalog(deltaCache);

    const mergedTv = mergeByTitle(CURATED_TV_SHOWS, liveTvShows);
    const mergedBooks = mergeByTitle(CURATED_BOOKS, liveBooks);
    const mergedMovies = mergeByTitle(CURATED_MOVIES, liveMovies);
    const mergedGames = mergeByTitle(CURATED_GAMES, liveGames);

    return {
      success: true,
      tvCount: mergedTv.length,
      bookCount: mergedBooks.length,
      gameCount: mergedGames.length,
      movieCount: mergedMovies.length,
      lastUpdated: deltaCache.lastUpdated,
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
  creator?: string;
  releaseYear?: number;
  category: string;
  genres: string[];
  coverUrl?: string;
  rating?: number;
  synopsis?: string;
  extraInfo?: string;
  rawTvItem?: CuratedTvItem;
  rawMovieItem?: CuratedMovieItem;
  rawBookItem?: CuratedBookItem;
}

/**
 * Searches public open APIs on-demand for any TV show with Zod schema verification.
 */
export async function searchInternetMedia(query: string): Promise<WebSearchResultItem[]> {
  const cleanQ = query.trim();
  if (!cleanQ) {return [];}

  const results: WebSearchResultItem[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanQ)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const rawJson = await res.json();
      const parseResult = TvMazeSearchResultSchema.safeParse(rawJson);

      if (parseResult.success) {
        for (const item of parseResult.data.slice(0, 8)) {
          const s = item.show;
          const parsedYear = s.premiered ? parseInt(s.premiered.slice(0, 4), 10) : undefined;
          const releaseYear = parsedYear && !isNaN(parsedYear) ? parsedYear : undefined;
          const genres = s.genres && s.genres.length > 0 ? s.genres : [];
          const creator = s.network?.name || s.webChannel?.name || undefined;
          const coverUrl =
            s.image?.medium || s.image?.original || undefined;
          const synopsis = s.summary ? stripHtml(s.summary) : undefined;
          const rating = s.rating?.average ?? undefined;

          results.push({
            id: `web-search-tv-${s.id}`,
            type: "tv",
            title: s.name,
            creator,
            releaseYear,
            category: genres[0] || "Dizi",
            genres,
            coverUrl,
            rating,
            synopsis,
            extraInfo: `${releaseYear ? `${releaseYear} • ` : ""}TV Dizisi`,
            rawTvItem: {
              id: `web-tv-${s.id}`,
              title: s.name,
              creator,
              totalSeasons: undefined, // Zero fake data
              totalEpisodes: undefined,
              releaseYear,
              category: "Dizi",
              genres,
              coverUrl,
              rating,
              synopsis,
              provenance: "api",
            },
          });
        }
      }
    }
  } catch (err) {
    logger.warn("[mediaInternetSyncService] TVMaze live search skipped:", err);
  }

  return results;
}
