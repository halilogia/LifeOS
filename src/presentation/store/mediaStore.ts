/**
 * mediaStore.ts
 * Zustand state management for Media Vault.
 * Handles item loading, filtering, sorting, CRUD, and progress modifications.
 */

import { create } from "zustand";
import type {
  MediaItem,
  MediaType,
  MediaTypeFilter,
  MediaStatusFilter,
  MediaSortBy,
  MediaStats,
} from "@/types/media.js";
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
import { logger } from "@/utils/logger.js";

const mediaRepo = new ChromeStorageMediaRepository();

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

  setTypeFilter: (filter: MediaTypeFilter) => void;
  setStatusFilter: (filter: MediaStatusFilter) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: MediaSortBy) => void;

  openCreateModal: (defaultType?: MediaType) => void;
  openEditModal: (item: MediaItem) => void;
  closeDetailModal: () => void;
  openQuotesModal: (book: MediaItem) => void;
  closeQuotesModal: () => void;

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

  stats: computeMediaStats([]),
  filteredItems: [],

  loadItems: async () => {
    set({ isLoading: true });
    try {
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
      const parsed = JSON.parse(jsonStr) as { items?: MediaItem[] } | MediaItem[];
      const itemsToImport = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.items)
          ? parsed.items
          : null;

      if (!itemsToImport) {
        return { success: false, error: "Invalid backup JSON structure" };
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
