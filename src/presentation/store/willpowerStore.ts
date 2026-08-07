/**
 * useWillpower store
 * Zustand singleton — willpower streak state + timer + history persistence.
 * Uses callback-DI: confirm dialogs flow through module-level callbacks
 * configured per-render (fresh closures for lang).
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import type { WillpowerStreak, Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const STORAGE_KEY = "willpowerStreak";

interface WillpowerCallbacks {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

let cb: WillpowerCallbacks | null = null;

interface WillpowerState {
  data: WillpowerStreak | null;
  note: string;
  setNote: (n: string) => void;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  configure: (c: WillpowerCallbacks) => void;
  loadData: () => Promise<void>;
  handleReset: () => void;
  handleClearHistory: () => void;
}

function elapsedParts(startDateStr: string) {
  const start = new Date(startDateStr).getTime();
  const now = new Date().getTime();
  const diffMs = Math.max(0, now - start);
  const diffSecs = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(diffSecs / 86400),
    hours: Math.floor((diffSecs % 86400) / 3600),
    minutes: Math.floor((diffSecs % 3600) / 60),
    seconds: diffSecs % 60,
  };
}

export const useWillpowerState = create<WillpowerState>()((set, get) => ({
  data: null,
  note: "",
  setNote: (n) => set({ note: n }),
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,

  configure: (c) => {
    cb = c;
  },

  loadData: async () => {
    const result = await new Promise<WillpowerStreak | undefined>((resolve) =>
      chrome.storage.local.get([STORAGE_KEY], (res) =>
        resolve(res[STORAGE_KEY] as WillpowerStreak | undefined),
      ),
    );
    let streakData = result;
    if (!streakData) {
      streakData = {
        startDate: new Date().toISOString(),
        bestStreakDays: 0,
        history: [],
      };
      chrome.storage.local.set({ [STORAGE_KEY]: streakData });
    }
    set({ data: streakData, ...elapsedParts(streakData.startDate) });
  },

  handleReset: () => {
    const c = cb;
    const { data } = get();
    if (!c || !data) {
      return;
    }
    const t = getTranslation(c.lang);
    const confirmMsg = t.willpower_reset_confirm;
    c.onShowConfirm(confirmMsg, async () => {
      const start = new Date(data.startDate).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);
      const diffSecs = Math.floor(diffMs / 1000);
      const finalDays = Math.floor(diffSecs / 86400);

      const nowStr = new Date().toISOString();
      const historyItem = {
        startDate: data.startDate,
        endDate: nowStr,
        days: finalDays,
        note: get().note.trim() || undefined,
      };

      const updatedData: WillpowerStreak = {
        startDate: nowStr,
        bestStreakDays: Math.max(data.bestStreakDays, finalDays),
        history: [...data.history, historyItem],
      };

      await new Promise<void>((resolve) =>
        chrome.storage.local.set({ [STORAGE_KEY]: updatedData }, resolve),
      );
      set({ note: "", data: updatedData, ...elapsedParts(nowStr) });
      scheduleCloudBackup();
    });
  },

  handleClearHistory: () => {
    const c = cb;
    const { data } = get();
    if (!c || !data) {
      return;
    }
    const t = getTranslation(c.lang);
    const confirmMsg = t.willpower_clear_history_confirm;
    c.onShowConfirm(confirmMsg, async () => {
      const updatedData: WillpowerStreak = {
        ...data,
        history: [],
      };
      await new Promise<void>((resolve) =>
        chrome.storage.local.set({ [STORAGE_KEY]: updatedData }, resolve),
      );
      set({ data: updatedData });
      scheduleCloudBackup();
    });
  },
}));

// 1s countdown ticker — module-level interval shared by all consumers.
setInterval(() => {
  const { data } = useWillpowerState.getState();
  if (data) {
    useWillpowerState.setState(elapsedParts(data.startDate));
  }
}, 1000);
