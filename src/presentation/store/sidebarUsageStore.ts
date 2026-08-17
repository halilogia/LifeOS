/**
 * sidebarUsageStore.ts
 * Sidebar kullanım istatistikleri + otomatik sıralama mantığı.
 * Her view'a girişte sayaç +1 → smart reorder (recency bonus ile).
 * Clean Architecture - Presentation Store.
 */

import { create } from "zustand";
import { DEFAULT_SIDEBAR_ORDER } from "@/domain/constants/sidebarConstants.js";
import { logger } from "@/utils/logger.js";
import { useUIStore } from "@/presentation/store/uiStore.js";

const USAGE_KEY = "sidebarUsage";
const AUTO_SORT_KEY = "sidebarAutoSort";
const LAST_USED_KEY = "sidebarLastUsed";
const PINNED_KEY = "sidebarPinned";
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 saat recency bonus penceresi

interface LastUsedMap {
  [viewKey: string]: number; // ms timestamp
}

interface SidebarUsageState {
  usage: Record<string, number>;
  lastUsed: LastUsedMap;
  autoSort: boolean;
  pinnedViews: string[];
  _saveTimer: ReturnType<typeof setTimeout> | null;

  load: () => Promise<void>;
  increment: (viewKey: string) => void;
  setAutoSort: (enabled: boolean) => Promise<void>;
  togglePin: (viewKey: string) => Promise<void>;
  reset: () => Promise<void>;
  /** İstatistiklere göre sıralı dizi döndürür — pinned view'lar en üstte, kalanlar skora göre. */
  computeSortedOrder: () => string[];
}

function getStorageItem<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (res) => {
      resolve((res[key] as T) ?? null);
    });
  });
}

function setStorageItem<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

export const useSidebarUsageStore = create<SidebarUsageState>()((set, get) => ({
  usage: {},
  lastUsed: {},
  autoSort: true,
  pinnedViews: [],
  _saveTimer: null,

  load: async () => {
    const usage =
      (await getStorageItem<Record<string, number>>(USAGE_KEY)) || {};
    const lastUsed = (await getStorageItem<LastUsedMap>(LAST_USED_KEY)) || {};
    const autoSortRaw = await getStorageItem<boolean>(AUTO_SORT_KEY);
    const pinnedViews = (await getStorageItem<string[]>(PINNED_KEY)) || [];
    set({
      usage,
      lastUsed,
      autoSort: autoSortRaw === null ? true : autoSortRaw === true,
      pinnedViews,
    });
  },

  increment: (viewKey: string) => {
    const state = get();
    if (!viewKey || viewKey === "settings") {
      return; // settings view istatistik tutmaz
    }
    const now = Date.now();
    const usage = {
      ...state.usage,
      [viewKey]: (state.usage[viewKey] || 0) + 1,
    };
    const lastUsed = { ...state.lastUsed, [viewKey]: now };
    set({ usage, lastUsed });

    // Debounced save (300ms) — hızlı geçişlerde storage thrash yok
    if (state._saveTimer) {
      clearTimeout(state._saveTimer);
    }
    const timer = setTimeout(() => {
      void Promise.all([
        setStorageItem(USAGE_KEY, usage),
        setStorageItem(LAST_USED_KEY, lastUsed),
      ]).then(() => {
        logger.info(`[SidebarUsage] saved (${viewKey}=${usage[viewKey]})`);
      });
    }, 300);
    set({ _saveTimer: timer });
  },

  setAutoSort: async (enabled: boolean) => {
    set({ autoSort: enabled });
    await setStorageItem(AUTO_SORT_KEY, enabled);
    logger.info(`[SidebarUsage] autoSort=${enabled}`);
  },

  togglePin: async (viewKey: string) => {
    const { pinnedViews } = get();
    const next = pinnedViews.includes(viewKey)
      ? pinnedViews.filter((k) => k !== viewKey)
      : [...pinnedViews, viewKey];
    set({ pinnedViews: next });
    await setStorageItem(PINNED_KEY, next);
    logger.info(
      `[SidebarUsage] pin ${viewKey} => ${next.includes(viewKey) ? "pinned" : "unpinned"}`,
    );
  },

  reset: async () => {
    set({ usage: {}, lastUsed: {} });
    await Promise.all([
      setStorageItem(USAGE_KEY, {}),
      setStorageItem(LAST_USED_KEY, {}),
    ]);
    logger.info("[SidebarUsage] usage reset");
  },

  /**
   * Skor = count + recencyBonus.
   * recencyBonus = son 24 saatte kullanıldıysa +5.
   * Pinned view'lar her zaman en üstte (kendi aralarında pin sırasına göre).
   * Kalanlar skora göre azalan.
   */
  computeSortedOrder: () => {
    const { usage, lastUsed } = get();
    const now = Date.now();
    const currentOrder =
      useUIStore.getState().sidebarOrder.length > 0
        ? useUIStore.getState().sidebarOrder
        : DEFAULT_SIDEBAR_ORDER;

    const allViews = new Set<string>(currentOrder);
    Object.keys(usage).forEach((k) => allViews.add(k));

    const score = (k: string): number => {
      const count = usage[k] || 0;
      const last = lastUsed[k] || 0;
      const recent = now - last < RECENT_WINDOW_MS ? 5 : 0;
      return count + recent;
    };

    return Array.from(allViews)
      .map((k) => ({ k, s: score(k) }))
      .sort((a, b) => {
        if (b.s !== a.s) {
          return b.s - a.s;
        }
        // Tie-breaker: mevcut sıralama
        const idxA = currentOrder.indexOf(a.k);
        const idxB = currentOrder.indexOf(b.k);
        return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
      })
      .map((x) => x.k);
  },
}));
