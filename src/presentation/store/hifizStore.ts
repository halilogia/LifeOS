/**
 * useHifiz store
 * Zustand singleton — hifiz memorization + yeterlikler state & persistence.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import {
  INITIAL_HIFIZ_ITEMS,
  YETERLIKLER_DATA,
} from "@/domain/data/hifizData.js";
import type { HifizProgress, HifizItem } from "@/types/types.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const PROGRESS_KEY = "hifizProgress";
const YETERLIKLER_KEY = "yeterlikler";

interface HifizState {
  subView: "memorizations" | "yeterlikler";
  setSubView: (v: "memorizations" | "yeterlikler") => void;
  category: "surahs" | "duas";
  setCategory: (c: "surahs" | "duas") => void;
  search: string;
  setSearch: (s: string) => void;
  hifizProgress: HifizProgress[];
  yeterlikler: number[];
  activeMushafItem: HifizItem | null;
  setActiveMushafItem: (i: HifizItem | null) => void;
  currentPageIndex: number;
  setCurrentPageIndex: (i: number | ((prev: number) => number)) => void;
  activeYeterlik: { title: string; description: string } | null;
  setActiveYeterlik: (y: { title: string; description: string } | null) => void;
  loadData: () => Promise<void>;
  handleCycleStatus: (itemId: string) => Promise<void>;
  handleCyclePageStatus: (itemId: string, pageIdx: number) => Promise<void>;
  handleToggleYeterlik: (index: number) => Promise<void>;
  openMushaf: (item: HifizItem) => void;
  closeMushaf: () => void;
}

const STATUSES: HifizProgress["status"][] = [
  "not_started",
  "in_progress",
  "memorized",
];

export const useHifizState = create<HifizState>()((set, get) => ({
  subView: "memorizations",
  setSubView: (v) => set({ subView: v }),
  category: "surahs",
  setCategory: (c) => set({ category: c }),
  search: "",
  setSearch: (s) => set({ search: s }),
  hifizProgress: [],
  yeterlikler: [],
  activeMushafItem: null,
  setActiveMushafItem: (i) => set({ activeMushafItem: i }),
  currentPageIndex: 0,
  setCurrentPageIndex: (i) =>
    set((s) => ({
      currentPageIndex: typeof i === "function" ? i(s.currentPageIndex) : i,
    })),
  activeYeterlik: null,
  setActiveYeterlik: (y) => set({ activeYeterlik: y }),

  loadData: async () => {
    const progress: HifizProgress[] = await new Promise((r) =>
      chrome.storage.local.get([PROGRESS_KEY], (res) =>
        r((res[PROGRESS_KEY] as HifizProgress[]) || []),
      ),
    );
    const completedYeterlikler: number[] = await new Promise((r) =>
      chrome.storage.local.get([YETERLIKLER_KEY], (res) =>
        r((res[YETERLIKLER_KEY] as number[]) || []),
      ),
    );
    set({ hifizProgress: progress, yeterlikler: completedYeterlikler });
  },

  handleCycleStatus: async (itemId) => {
    const itemData = INITIAL_HIFIZ_ITEMS.find((i) => i.id === itemId);
    const progress: HifizProgress[] = await new Promise((r) =>
      chrome.storage.local.get([PROGRESS_KEY], (res) =>
        r((res[PROGRESS_KEY] as HifizProgress[]) || []),
      ),
    );
    const idx = progress.findIndex((p) => p.itemId === itemId);

    if (idx === -1) {
      const newItem: HifizProgress = {
        itemId,
        status: "in_progress",
        lastUpdated: new Date().toISOString(),
      };
      if (itemData?.totalPages && itemData.totalPages > 1) {
        newItem.pageStatuses = new Array(itemData.totalPages).fill(
          "not_started",
        );
      }
      progress.push(newItem);
    } else {
      const current = progress[idx].status;
      const nextIndex = (STATUSES.indexOf(current) + 1) % STATUSES.length;
      const nextStatus = STATUSES[nextIndex];
      progress[idx].status = nextStatus;
      progress[idx].lastUpdated = new Date().toISOString();

      if (progress[idx].pageStatuses) {
        progress[idx].pageStatuses = progress[idx].pageStatuses?.map(
          () => nextStatus,
        );
      }
    }

    await new Promise<void>((r) =>
      chrome.storage.local.set({ [PROGRESS_KEY]: progress }, r),
    );
    set({ hifizProgress: progress });
    scheduleCloudBackup();
  },

  handleCyclePageStatus: async (itemId, pageIdx) => {
    const itemData = INITIAL_HIFIZ_ITEMS.find((i) => i.id === itemId);
    if (!itemData) {
      return;
    }

    const progress: HifizProgress[] = await new Promise((r) =>
      chrome.storage.local.get([PROGRESS_KEY], (res) =>
        r((res[PROGRESS_KEY] as HifizProgress[]) || []),
      ),
    );
    let itemProgress = progress.find((p) => p.itemId === itemId);

    if (!itemProgress) {
      itemProgress = {
        itemId,
        status: "in_progress",
        pageStatuses: new Array(itemData.totalPages || 1).fill("not_started"),
        lastUpdated: new Date().toISOString(),
      };
      progress.push(itemProgress);
    }

    if (!itemProgress.pageStatuses) {
      itemProgress.pageStatuses = new Array(itemData.totalPages || 1).fill(
        itemProgress.status,
      );
    }

    const current = itemProgress.pageStatuses[pageIdx];
    const nextIndex = (STATUSES.indexOf(current) + 1) % STATUSES.length;
    itemProgress.pageStatuses[pageIdx] = STATUSES[nextIndex];
    itemProgress.lastUpdated = new Date().toISOString();

    const allMemorized = itemProgress.pageStatuses.every(
      (s) => s === "memorized",
    );
    const anyProgress = itemProgress.pageStatuses.some(
      (s) => s !== "not_started",
    );

    if (allMemorized) {
      itemProgress.status = "memorized";
    } else if (anyProgress) {
      itemProgress.status = "in_progress";
    } else {
      itemProgress.status = "not_started";
    }

    await new Promise<void>((r) =>
      chrome.storage.local.set({ [PROGRESS_KEY]: progress }, r),
    );
    set({ hifizProgress: progress });
    scheduleCloudBackup();
  },

  handleToggleYeterlik: async (index) => {
    const currentCompleted: number[] = await new Promise((r) =>
      chrome.storage.local.get([YETERLIKLER_KEY], (res) =>
        r((res[YETERLIKLER_KEY] as number[]) || []),
      ),
    );
    const next = currentCompleted.includes(index)
      ? currentCompleted.filter((i) => i !== index)
      : [...currentCompleted, index];
    await new Promise<void>((r) =>
      chrome.storage.local.set({ [YETERLIKLER_KEY]: next }, r),
    );
    set({ yeterlikler: next });
    scheduleCloudBackup();
  },

  openMushaf: (item) => {
    if (!item.pages || item.pages.length === 0) {
      return;
    }
    set({ activeMushafItem: item, currentPageIndex: 0 });
    document.body.classList.remove("sidebar-open");
  },

  closeMushaf: () => {
    set({ activeMushafItem: null });
  },
}));

// Derived stats (pure — exported helpers so the facade can compute without
// duplicating the logic). The facade computes these from store state.
export function computeHifizStats(hifizProgress: HifizProgress[]) {
  let totalPages = 0;
  let memorizedPages = 0;

  INITIAL_HIFIZ_ITEMS.forEach((item) => {
    const total = item.totalPages || 1;
    totalPages += total;

    const itemProgress = hifizProgress.find((p) => p.itemId === item.id);
    if (itemProgress) {
      if (itemProgress.status === "memorized") {
        memorizedPages += total;
      } else if (itemProgress.pageStatuses) {
        memorizedPages += itemProgress.pageStatuses.filter(
          (s) => s === "memorized",
        ).length;
      }
    }
  });

  const memorizedCount = hifizProgress.filter(
    (p) => p.status === "memorized",
  ).length;
  const inProgressCount = hifizProgress.filter(
    (p) => p.status === "in_progress",
  ).length;

  return {
    memorizedCount,
    inProgressCount,
    totalCount: INITIAL_HIFIZ_ITEMS.length,
    overallPercent: totalPages > 0 ? Math.round((memorizedPages / totalPages) * 100) : 0,
  };
}

export function computeYeterliklerStats(yeterlikler: number[]) {
  return {
    completedCount: yeterlikler.length,
    totalCount: YETERLIKLER_DATA.length,
    percent:
      YETERLIKLER_DATA.length > 0
        ? Math.round((yeterlikler.length / YETERLIKLER_DATA.length) * 100)
        : 0,
  };
}
