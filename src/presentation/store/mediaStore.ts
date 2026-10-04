/**
 * mediaStore.ts
 * Zustand state management for Media Vault.
 * Handles item loading, filtering, sorting, CRUD, and progress modifications.
 */

import { create } from "zustand";
import { z } from "zod";
import type {
  MediaItem,
  MediaType,
  MediaTypeFilter,
  MediaStatusFilter,
  MediaSortBy,
  MediaStats,
  MovieSeries,
  MovieSeriesItem,
  GamePlatform,
} from "@/types/media.js";
import type { IMediaRepository } from "@/domain/repositories/IMediaRepository.js";
import { ChromeStorageMediaRepository } from "@/infrastructure/persistence/repositories/ChromeStorageMediaRepository.js";
import {
  computeMediaStats,
  filterAndSortItems,
  incrementTvEpisode,
  incrementBookPage,
  incrementGamePlaytime,
  addQuoteToBook,
  removeQuoteFromBook,
  getSampleMediaItems,
} from "@/services/mediaService.js";
import { normalizeTitle } from "@/services/movieSeriesData.js";
import type {
  CuratedBookItem,
  CuratedGameItem,
  CuratedMovieItem,
  CuratedTvItem,
} from "@/services/curatedCatalogData.js";
import {
  getActiveMergedCatalog,
  syncAllCatalogsFromWeb,
} from "@/services/mediaInternetSyncService.js";
import { logger } from "@/utils/logger.js";

let mediaRepo: IMediaRepository = new ChromeStorageMediaRepository();

/**
 * Allows injecting custom repository for testing or decoupling.
 */
export function setMediaRepository(repo: IMediaRepository): void {
  mediaRepo = repo;
}

interface MediaState {
  items: MediaItem[];
  isLoading: boolean;
  activeTypeFilter: MediaTypeFilter;
  activeStatusFilter: MediaStatusFilter;
  searchQuery: string;
  sortBy: MediaSortBy;

  // Modal states
  isDetailModalOpen: boolean;
  selectedItemForEdit: MediaItem | null;
  defaultModalType: MediaType;
  isQuotesModalOpen: boolean;
  selectedBookForQuotes: MediaItem | null;
  selectedSeriesForTimeline: MovieSeries | null;
  isSeriesTimelineOpen: boolean;

  // Computed views & stats
  stats: MediaStats;
  filteredItems: MediaItem[];

  // Actions
  loadItems: () => Promise<void>;
  addItem: (
    itemData: Omit<MediaItem, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateItem: (item: MediaItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  incrementProgress: (id: string, delta?: number) => Promise<void>;
  addQuote: (bookId: string, quoteText: string, page?: number) => Promise<void>;
  removeQuote: (bookId: string, quoteId: string) => Promise<void>;

  toggleSeriesItem: (
    seriesItem: MovieSeriesItem,
    targetStatus: "completed" | "backlog",
    rating?: number,
  ) => Promise<void>;
  batchAddSeriesToWatchlist: (series: MovieSeries) => Promise<void>;

  toggleCuratedBook: (
    book: CuratedBookItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => Promise<void>;
  toggleCuratedGame: (
    game: CuratedGameItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => Promise<void>;
  toggleCuratedMovie: (
    movie: CuratedMovieItem,
    targetStatus: "completed" | "backlog",
    rating?: number,
  ) => Promise<void>;
  toggleCuratedTv: (
    tvShow: CuratedTvItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => Promise<void>;

  curatedTvShows: CuratedTvItem[];
  curatedBooks: CuratedBookItem[];
  curatedGames: CuratedGameItem[];
  curatedMovies: CuratedMovieItem[];
  isSyncingWeb: boolean;
  lastWebSyncTime: string | null;
  syncWebCatalog: (force?: boolean) => Promise<void>;

  setTypeFilter: (filter: MediaTypeFilter) => void;
  setStatusFilter: (filter: MediaStatusFilter) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: MediaSortBy) => void;

  openCreateModal: (defaultType?: MediaType) => void;
  openEditModal: (item: MediaItem) => void;
  closeDetailModal: () => void;
  openQuotesModal: (book: MediaItem) => void;
  closeQuotesModal: () => void;
  openSeriesTimeline: (series: MovieSeries) => void;
  closeSeriesTimeline: () => void;

  loadSampleData: () => Promise<void>;
  exportBackup: () => string;
  importBackup: (
    jsonStr: string,
  ) => Promise<{ success: boolean; count?: number; error?: string }>;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  items: [],
  isLoading: false,
  activeTypeFilter: "all",
  activeStatusFilter: "all",
  searchQuery: "",
  sortBy: "updated",

  isDetailModalOpen: false,
  selectedItemForEdit: null,
  defaultModalType: "movie",
  isQuotesModalOpen: false,
  selectedBookForQuotes: null,
  selectedSeriesForTimeline: null,
  isSeriesTimelineOpen: false,

  curatedTvShows: [],
  curatedBooks: [],
  curatedGames: [],
  curatedMovies: [],
  isSyncingWeb: false,
  lastWebSyncTime: null,

  stats: computeMediaStats([]),
  filteredItems: [],

  loadItems: async () => {
    set({ isLoading: true });
    try {
      // 1. Initialize active curated catalogs (offline-first with web cache if available)
      const catalogs = getActiveMergedCatalog();
      set({
        curatedTvShows: catalogs.tvShows,
        curatedBooks: catalogs.books,
        curatedGames: catalogs.games,
        curatedMovies: catalogs.movies,
      });

      const items = await mediaRepo.getItems();
      const stats = computeMediaStats(items);
      const state = get();
      const filtered = filterAndSortItems(
        items,
        state.activeTypeFilter,
        state.activeStatusFilter,
        state.searchQuery,
        state.sortBy,
      );
      set({ items, stats, filteredItems: filtered, isLoading: false });
    } catch (err) {
      logger.error("[useMediaStore] loadItems error:", err);
      set({ isLoading: false });
    }
  },

  addItem: async (itemData) => {
    const now = new Date().toISOString();
    const newItem: MediaItem = {
      ...itemData,
      id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    const nextItems = [newItem, ...get().items];
    await mediaRepo.saveItems(nextItems);

    const state = get();
    const stats = computeMediaStats(nextItems);
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({
      items: nextItems,
      stats,
      filteredItems: filtered,
      isDetailModalOpen: false,
      selectedItemForEdit: null,
    });
  },

  updateItem: async (updatedItem) => {
    const itemWithStamp: MediaItem = {
      ...updatedItem,
      updatedAt: new Date().toISOString(),
    };

    const nextItems = get().items.map((i) =>
      i.id === itemWithStamp.id ? itemWithStamp : i,
    );
    await mediaRepo.saveItems(nextItems);

    const state = get();
    const stats = computeMediaStats(nextItems);
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );

    // Also update selectedBookForQuotes if currently open
    const currentBook = state.selectedBookForQuotes;
    const updatedBook =
      currentBook?.id === itemWithStamp.id ? itemWithStamp : currentBook;

    set({
      items: nextItems,
      stats,
      filteredItems: filtered,
      selectedBookForQuotes: updatedBook,
      isDetailModalOpen: false,
      selectedItemForEdit: null,
    });
  },

  deleteItem: async (id) => {
    const nextItems = get().items.filter((i) => i.id !== id);
    await mediaRepo.saveItems(nextItems);

    const state = get();
    const stats = computeMediaStats(nextItems);
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: nextItems, stats, filteredItems: filtered });
  },

  toggleFavorite: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) {
      return;
    }
    const updated: MediaItem = {
      ...item,
      favorite: !item.favorite,
      updatedAt: new Date().toISOString(),
    };
    await get().updateItem(updated);
  },

  incrementProgress: async (id, delta) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) {
      return;
    }

    let updated: MediaItem;
    if (item.type === "tv") {
      updated = incrementTvEpisode(item, delta ?? 1);
    } else if (item.type === "book") {
      updated = incrementBookPage(item, delta ?? 10);
    } else if (item.type === "game") {
      updated = incrementGamePlaytime(item, delta ?? 1);
    } else {
      return;
    }

    await get().updateItem(updated);
  },

  addQuote: async (bookId, quoteText, page) => {
    const item = get().items.find((i) => i.id === bookId);
    if (!item) {
      return;
    }
    const updated = addQuoteToBook(item, quoteText, page);
    await get().updateItem(updated);
  },

  removeQuote: async (bookId, quoteId) => {
    const item = get().items.find((i) => i.id === bookId);
    if (!item) {
      return;
    }
    const updated = removeQuoteFromBook(item, quoteId);
    await get().updateItem(updated);
  },

  setTypeFilter: (filter) => {
    const state = get();
    const filtered = filterAndSortItems(
      state.items,
      filter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ activeTypeFilter: filter, filteredItems: filtered });
  },

  setStatusFilter: (filter) => {
    const state = get();
    const filtered = filterAndSortItems(
      state.items,
      state.activeTypeFilter,
      filter,
      state.searchQuery,
      state.sortBy,
    );
    set({ activeStatusFilter: filter, filteredItems: filtered });
  },

  setSearchQuery: (query) => {
    const state = get();
    const filtered = filterAndSortItems(
      state.items,
      state.activeTypeFilter,
      state.activeStatusFilter,
      query,
      state.sortBy,
    );
    set({ searchQuery: query, filteredItems: filtered });
  },

  setSortBy: (sort) => {
    const state = get();
    const filtered = filterAndSortItems(
      state.items,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      sort,
    );
    set({ sortBy: sort, filteredItems: filtered });
  },

  openCreateModal: (defaultType = "movie") => {
    set({
      isDetailModalOpen: true,
      selectedItemForEdit: null,
      defaultModalType: defaultType,
    });
  },

  openEditModal: (item) => {
    set({
      isDetailModalOpen: true,
      selectedItemForEdit: item,
      defaultModalType: item.type,
    });
  },

  closeDetailModal: () => {
    set({ isDetailModalOpen: false, selectedItemForEdit: null });
  },

  openQuotesModal: (book) => {
    set({ isQuotesModalOpen: true, selectedBookForQuotes: book });
  },

  closeQuotesModal: () => {
    set({ isQuotesModalOpen: false, selectedBookForQuotes: null });
  },

  openSeriesTimeline: (series: MovieSeries) => {
    set({ isSeriesTimelineOpen: true, selectedSeriesForTimeline: series });
  },

  closeSeriesTimeline: () => {
    set({ isSeriesTimelineOpen: false, selectedSeriesForTimeline: null });
  },

  toggleSeriesItem: async (
    seriesItem: MovieSeriesItem,
    targetStatus: "completed" | "backlog",
    rating?: number,
  ) => {
    const currentItems = get().items;
    const seriesNorm = normalizeTitle(seriesItem.title);
    const seriesOrigNorm = seriesItem.originalTitle
      ? normalizeTitle(seriesItem.originalTitle)
      : "";

    const existingIndex = currentItems.findIndex((i) => {
      if (i.seriesItemId && i.seriesItemId === seriesItem.id) {return true;}
      if (i.type !== "movie") {return false;}
      const uNorm = normalizeTitle(i.title);
      return (
        uNorm === seriesNorm ||
        (seriesOrigNorm && uNorm === seriesOrigNorm) ||
        (seriesItem.releaseYear &&
          i.releaseYear === seriesItem.releaseYear &&
          (uNorm.includes(seriesNorm) || seriesNorm.includes(uNorm)))
      );
    });

    let nextItems: MediaItem[];
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      // If already in target status, toggle it off by removing or switching
      if (existing.status === targetStatus) {
        nextItems = currentItems.filter((_, idx) => idx !== existingIndex);
      } else {
        const updated: MediaItem = {
          ...existing,
          status: targetStatus,
          seriesId: seriesItem.seriesId,
          seriesItemId: seriesItem.id,
          rating:
            rating !== undefined
              ? rating
              : existing.rating > 0
                ? existing.rating
                : targetStatus === "completed" && seriesItem.imdbRating
                  ? Math.round(seriesItem.imdbRating)
                  : 0,
          updatedAt: now,
          finishedAt:
            targetStatus === "completed" ? existing.finishedAt || now : undefined,
          movieProgress: {
            ...existing.movieProgress,
            runtimeMinutes:
              seriesItem.runtimeMinutes || existing.movieProgress?.runtimeMinutes,
            watchedDate:
              targetStatus === "completed"
                ? existing.movieProgress?.watchedDate || now.slice(0, 10)
                : undefined,
          },
        };
        nextItems = currentItems.map((item, idx) =>
          idx === existingIndex ? updated : item,
        );
      }
    } else {
      const newItem: MediaItem = {
        id: `media_movie_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "movie",
        title: seriesItem.title,
        creator: seriesItem.director,
        coverUrl: seriesItem.coverUrl,
        releaseYear: seriesItem.releaseYear,
        genres: seriesItem.genres,
        status: targetStatus,
        rating:
          rating !== undefined
            ? rating
            : targetStatus === "completed" && seriesItem.imdbRating
              ? Math.round(seriesItem.imdbRating)
              : 0,
        favorite: false,
        seriesId: seriesItem.seriesId,
        seriesItemId: seriesItem.id,
        movieProgress: {
          runtimeMinutes: seriesItem.runtimeMinutes,
          watchedDate: targetStatus === "completed" ? now.slice(0, 10) : undefined,
        },
        createdAt: now,
        updatedAt: now,
        finishedAt: targetStatus === "completed" ? now : undefined,
      };
      nextItems = [newItem, ...currentItems];
    }

    await mediaRepo.saveItems(nextItems);
    const stats = computeMediaStats(nextItems);
    const state = get();
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: nextItems, stats, filteredItems: filtered });
  },

  batchAddSeriesToWatchlist: async (series: MovieSeries) => {
    const currentItems = get().items;
    const now = new Date().toISOString();
    const newItemsToAdd: MediaItem[] = [];

    for (const movie of series.items) {
      const movieNorm = normalizeTitle(movie.title);
      const exists = currentItems.some((i) => {
        if (i.seriesItemId && i.seriesItemId === movie.id) {return true;}
        if (i.type !== "movie") {return false;}
        return normalizeTitle(i.title) === movieNorm;
      });

      if (!exists) {
        newItemsToAdd.push({
          id: `media_movie_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: "movie",
          title: movie.title,
          creator: movie.director,
          coverUrl: movie.coverUrl,
          releaseYear: movie.releaseYear,
          genres: movie.genres,
          status: "backlog",
          rating: 0,
          favorite: false,
          seriesId: series.id,
          seriesItemId: movie.id,
          movieProgress: {
            runtimeMinutes: movie.runtimeMinutes,
          },
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (newItemsToAdd.length === 0) {return;}

    const nextItems = [...newItemsToAdd, ...currentItems];
    await mediaRepo.saveItems(nextItems);
    const stats = computeMediaStats(nextItems);
    const state = get();
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: nextItems, stats, filteredItems: filtered });
  },

  toggleCuratedBook: async (book, targetStatus, rating) => {
    const currentItems = get().items;
    const bookNorm = normalizeTitle(book.title);
    const existingIndex = currentItems.findIndex(
      (i) => i.type === "book" && normalizeTitle(i.title) === bookNorm,
    );
    const now = new Date().toISOString();
    let nextItems: MediaItem[];

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      if (existing.status === targetStatus && rating === undefined) {
        nextItems = currentItems.filter((_, idx) => idx !== existingIndex);
      } else {
        const updated: MediaItem = {
          ...existing,
          status: targetStatus,
          rating:
            rating !== undefined
              ? rating
              : existing.rating ||
                (targetStatus === "completed" ? (book.rating ? Math.round(book.rating) : 0) : 0),
          updatedAt: now,
          finishedAt:
            targetStatus === "completed" ? existing.finishedAt || now : undefined,
          bookProgress: {
            currentPage:
              targetStatus === "completed"
                ? book.totalPages ?? 0
                : targetStatus === "in_progress"
                  ? existing.bookProgress?.currentPage ||
                    (book.totalPages ? Math.round(book.totalPages * 0.2) : 0)
                  : 0,
            totalPages: book.totalPages ?? 0,
            quotes: existing.bookProgress?.quotes || [],
          },
        };
        nextItems = currentItems.map((item, idx) =>
          idx === existingIndex ? updated : item,
        );
      }
    } else {
      const newItem: MediaItem = {
        id: `media_book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "book",
        title: book.title,
        creator: book.author,
        coverUrl: book.coverUrl,
        releaseYear: book.releaseYear > 0 ? book.releaseYear : undefined,
        genres: [book.category, ...book.genres],
        status: targetStatus,
        rating:
          rating !== undefined
            ? rating
            : targetStatus === "completed"
              ? (book.rating ? Math.round(book.rating) : 0)
              : 0,
        favorite: false,
        bookProgress: {
          currentPage:
            targetStatus === "completed"
              ? book.totalPages ?? 0
              : targetStatus === "in_progress"
                ? (book.totalPages ? Math.round(book.totalPages * 0.2) : 0)
                : 0,
          totalPages: book.totalPages ?? 0,
          quotes: [],
        },
        createdAt: now,
        updatedAt: now,
        finishedAt: targetStatus === "completed" ? now : undefined,
      };
      nextItems = [newItem, ...currentItems];
    }

    await mediaRepo.saveItems(nextItems);
    const stats = computeMediaStats(nextItems);
    const state = get();
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: nextItems, stats, filteredItems: filtered });
  },

  toggleCuratedGame: async (game, targetStatus, rating) => {
    const currentItems = get().items;
    const gameNorm = normalizeTitle(game.title);
    const existingIndex = currentItems.findIndex(
      (i) => i.type === "game" && normalizeTitle(i.title) === gameNorm,
    );
    const now = new Date().toISOString();
    let nextItems: MediaItem[];

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      if (existing.status === targetStatus && rating === undefined) {
        nextItems = currentItems.filter((_, idx) => idx !== existingIndex);
      } else {
        const updated: MediaItem = {
          ...existing,
          status: targetStatus,
          rating:
            rating !== undefined
              ? rating
              : existing.rating ||
                (targetStatus === "completed" ? (game.rating ? Math.round(game.rating) : 0) : 0),
          updatedAt: now,
          finishedAt:
            targetStatus === "completed" ? existing.finishedAt || now : undefined,
          gameProgress: {
            playtimeHours:
              targetStatus === "completed"
                ? game.playtimeHours ?? 0
                : targetStatus === "in_progress"
                  ? existing.gameProgress?.playtimeHours ||
                    (game.playtimeHours ? Math.round(game.playtimeHours * 0.3) : 0)
                  : 0,
            targetHours: game.playtimeHours,
            playstyle: existing.gameProgress?.playstyle || "main_story",
            platform: (game.platform as GamePlatform) || "PC",
          },
        };
        nextItems = currentItems.map((item, idx) =>
          idx === existingIndex ? updated : item,
        );
      }
    } else {
      const newItem: MediaItem = {
        id: `media_game_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "game",
        title: game.title,
        creator: game.developer,
        coverUrl: game.coverUrl,
        releaseYear: game.releaseYear,
        genres: [game.category, ...game.genres],
        status: targetStatus,
        rating:
          rating !== undefined
            ? rating
            : targetStatus === "completed"
              ? (game.rating ? Math.round(game.rating) : 0)
              : 0,
        favorite: false,
        gameProgress: {
          playtimeHours:
            targetStatus === "completed"
              ? game.playtimeHours ?? 0
              : targetStatus === "in_progress"
                ? (game.playtimeHours ? Math.round(game.playtimeHours * 0.3) : 0)
                : 0,
          targetHours: game.playtimeHours,
          playstyle: "main_story",
          platform: (game.platform as GamePlatform) || "PC",
        },
        createdAt: now,
        updatedAt: now,
        finishedAt: targetStatus === "completed" ? now : undefined,
      };
      nextItems = [newItem, ...currentItems];
    }

    await mediaRepo.saveItems(nextItems);
    const stats = computeMediaStats(nextItems);
    const state = get();
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: nextItems, stats, filteredItems: filtered });
  },

  toggleCuratedMovie: async (movie, targetStatus, rating) => {
    const currentItems = get().items;
    const movieNorm = normalizeTitle(movie.title);
    const origNorm = movie.originalTitle
      ? normalizeTitle(movie.originalTitle)
      : "";
    const existingIndex = currentItems.findIndex(
      (i) =>
        i.type === "movie" &&
        (normalizeTitle(i.title) === movieNorm ||
          (origNorm && normalizeTitle(i.title) === origNorm)),
    );
    const now = new Date().toISOString();
    let nextItems: MediaItem[];

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      if (existing.status === targetStatus && rating === undefined) {
        nextItems = currentItems.filter((_, idx) => idx !== existingIndex);
      } else {
        const updated: MediaItem = {
          ...existing,
          status: targetStatus,
          rating:
            rating !== undefined
              ? rating
              : existing.rating ||
                (targetStatus === "completed" ? (movie.rating ? Math.round(movie.rating) : 0) : 0),
          updatedAt: now,
          finishedAt:
            targetStatus === "completed" ? existing.finishedAt || now : undefined,
        };
        nextItems = currentItems.map((item, idx) =>
          idx === existingIndex ? updated : item,
        );
      }
    } else {
      const newItem: MediaItem = {
        id: `media_movie_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "movie",
        title: movie.title,
        creator: movie.director,
        coverUrl: movie.coverUrl,
        releaseYear: movie.releaseYear,
        genres: movie.genres,
        status: targetStatus,
        rating:
          rating !== undefined
            ? rating
            : targetStatus === "completed"
              ? (movie.rating ? Math.round(movie.rating) : 0)
              : 0,
        favorite: false,
        movieProgress: {
          runtimeMinutes: movie.runtimeMinutes,
          watchedDate:
            targetStatus === "completed" ? now.slice(0, 10) : undefined,
        },
        createdAt: now,
        updatedAt: now,
        finishedAt: targetStatus === "completed" ? now : undefined,
      };
      nextItems = [newItem, ...currentItems];
    }

    await mediaRepo.saveItems(nextItems);
    const stats = computeMediaStats(nextItems);
    const state = get();
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: nextItems, stats, filteredItems: filtered });
  },

  toggleCuratedTv: async (tvShow, targetStatus, rating) => {
    const currentItems = get().items;
    const showNorm = normalizeTitle(tvShow.title);
    const origNorm = tvShow.originalTitle ? normalizeTitle(tvShow.originalTitle) : "";
    const existingIndex = currentItems.findIndex(
      (i) =>
        i.type === "tv" &&
        (normalizeTitle(i.title) === showNorm ||
          (origNorm && normalizeTitle(i.title) === origNorm)),
    );
    const now = new Date().toISOString();
    let nextItems: MediaItem[];

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      if (existing.status === targetStatus && rating === undefined) {
        nextItems = currentItems.filter((_, idx) => idx !== existingIndex);
      } else {
        const updated: MediaItem = {
          ...existing,
          status: targetStatus,
          rating:
            rating !== undefined
              ? rating
              : existing.rating ||
                (targetStatus === "completed" ? (tvShow.rating ? Math.round(tvShow.rating) : 0) : 0),
          updatedAt: now,
          finishedAt:
            targetStatus === "completed" ? existing.finishedAt || now : undefined,
          tvProgress: {
            currentSeason:
              targetStatus === "completed"
                ? tvShow.totalSeasons ?? 1
                : targetStatus === "in_progress"
                  ? existing.tvProgress?.currentSeason || 1
                  : 0,
            currentEpisode:
              targetStatus === "completed"
                ? tvShow.totalEpisodes ?? 1
                : targetStatus === "in_progress"
                  ? existing.tvProgress?.currentEpisode || 1
                  : 0,
            totalSeasons: tvShow.totalSeasons,
            totalEpisodes: tvShow.totalEpisodes,
          },
        };
        nextItems = currentItems.map((item, idx) =>
          idx === existingIndex ? updated : item,
        );
      }
    } else {
      const newItem: MediaItem = {
        id: `media_tv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "tv",
        title: tvShow.title,
        creator: tvShow.creator,
        coverUrl: tvShow.coverUrl,
        releaseYear: tvShow.releaseYear,
        genres: [tvShow.category, ...tvShow.genres],
        status: targetStatus,
        rating:
          rating !== undefined
            ? rating
            : targetStatus === "completed"
              ? (tvShow.rating ? Math.round(tvShow.rating) : 0)
              : 0,
        favorite: false,
        tvProgress: {
          currentSeason:
            targetStatus === "completed"
              ? tvShow.totalSeasons ?? 1
              : targetStatus === "in_progress"
                ? 1
                : 0,
          currentEpisode:
            targetStatus === "completed"
              ? tvShow.totalEpisodes ?? 1
              : targetStatus === "in_progress"
                ? 1
                : 0,
          totalSeasons: tvShow.totalSeasons,
          totalEpisodes: tvShow.totalEpisodes,
        },
        createdAt: now,
        updatedAt: now,
        finishedAt: targetStatus === "completed" ? now : undefined,
      };
      nextItems = [newItem, ...currentItems];
    }

    await mediaRepo.saveItems(nextItems);
    const stats = computeMediaStats(nextItems);
    const state = get();
    const filtered = filterAndSortItems(
      nextItems,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: nextItems, stats, filteredItems: filtered });
  },

  syncWebCatalog: async (force = true) => {
    set({ isSyncingWeb: true });
    try {
      const result = await syncAllCatalogsFromWeb(force);
      const updated = getActiveMergedCatalog();
      set({
        curatedTvShows: updated.tvShows,
        curatedBooks: updated.books,
        curatedGames: updated.games,
        curatedMovies: updated.movies,
        lastWebSyncTime: result.lastUpdated,
        isSyncingWeb: false,
      });
    } catch (err) {
      logger.warn("[useMediaStore] syncWebCatalog error:", err);
      set({ isSyncingWeb: false });
    }
  },

  loadSampleData: async () => {
    const samples = getSampleMediaItems();
    const current = get().items;
    const combined = [...samples, ...current.filter((c) => !c.id.startsWith("media_sample_"))];
    await mediaRepo.saveItems(combined);
    const stats = computeMediaStats(combined);
    const state = get();
    const filtered = filterAndSortItems(
      combined,
      state.activeTypeFilter,
      state.activeStatusFilter,
      state.searchQuery,
      state.sortBy,
    );
    set({ items: combined, stats, filteredItems: filtered });
  },

  exportBackup: () => {
    const { items } = get();
    return JSON.stringify(
      {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        items,
      },
      null,
      2,
    );
  },

  importBackup: async (jsonStr) => {
    try {
      const parsed: unknown = JSON.parse(jsonStr);

      const MediaItemImportSchema = z
        .object({
          id: z.string(),
          type: z.enum(["movie", "tv", "book", "game"]),
          title: z.string().min(1),
          status: z.enum(["backlog", "in_progress", "completed", "dropped"]),
        })
        .passthrough();

      const BackupArraySchema = z.array(MediaItemImportSchema);
      const BackupObjectSchema = z.object({
        items: z.array(MediaItemImportSchema),
      });

      let itemsToImport: MediaItem[] | null = null;

      const arrayParse = BackupArraySchema.safeParse(parsed);
      if (arrayParse.success) {
        itemsToImport = arrayParse.data as unknown as MediaItem[];
      } else {
        const objParse = BackupObjectSchema.safeParse(parsed);
        if (objParse.success) {
          itemsToImport = objParse.data.items as unknown as MediaItem[];
        }
      }

      if (!itemsToImport) {
        return {
          success: false,
          error: "Invalid backup JSON structure (Zod schema validation failed)",
        };
      }

      await mediaRepo.saveItems(itemsToImport);
      const stats = computeMediaStats(itemsToImport);
      const state = get();
      const filtered = filterAndSortItems(
        itemsToImport,
        state.activeTypeFilter,
        state.activeStatusFilter,
        state.searchQuery,
        state.sortBy,
      );
      set({ items: itemsToImport, stats, filteredItems: filtered });
      return { success: true, count: itemsToImport.length };
    } catch (err) {
      logger.error("[useMediaStore] importBackup error:", err);
      return { success: false, error: "Failed to parse JSON file" };
    }
  },
}));
