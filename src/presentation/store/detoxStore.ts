/**
 * useDetox store
 * Zustand singleton — detox config state + screen time stats + persistence.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const ENABLED_KEY = "detox_enabled";
const SITES_KEY = "detox_blocked_sites";
const END_TIME_KEY = "detox_end_time";
const STATS_KEY = "screen_time_stats";

interface DetoxState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  blockedSites: string[];
  setBlockedSites: (sites: string[] | ((prev: string[]) => string[])) => void;
  endTime: number;
  setEndTime: (t: number) => void;
  screenTimeStats: Record<string, number>;
  loadConfig: () => Promise<void>;
  loadScreenTimeStats: () => Promise<void>;
  saveBlockedSites: (sites: string[]) => void;
  enableDetox: (sites: string[], duration: number) => void;
  disableDetox: () => void;
}

export const useDetoxState = create<DetoxState>()((set) => ({
  enabled: false,
  setEnabled: (v) => set({ enabled: v }),
  blockedSites: [],
  setBlockedSites: (sites) =>
    set((s) => ({
      blockedSites:
        typeof sites === "function" ? sites(s.blockedSites) : sites,
    })),
  endTime: 0,
  setEndTime: (t) => set({ endTime: t }),
  screenTimeStats: {},

  loadConfig: async () => {
    const res = await new Promise<{
      detox_enabled?: boolean;
      detox_blocked_sites?: string[];
      detox_end_time?: number;
    }>((resolve) =>
      chrome.storage.local.get(
        [ENABLED_KEY, SITES_KEY, END_TIME_KEY],
        (r) => resolve(r),
      ),
    );
    const isEnabled = res.detox_enabled || false;
    const sites = res.detox_blocked_sites || [];
    const end = res.detox_end_time || 0;

    if (isEnabled && end !== -1 && end <= Date.now()) {
      // Time expired, disable
      chrome.storage.local.set({
        [ENABLED_KEY]: false,
        [END_TIME_KEY]: 0,
      });
      set({ enabled: false, blockedSites: sites, endTime: 0 });
    } else {
      set({ enabled: isEnabled, blockedSites: sites, endTime: end });
    }
  },

  loadScreenTimeStats: async () => {
    const todayStr = new Date().toLocaleDateString("sv");
    const res = await new Promise<{ screen_time_stats?: Record<string, unknown> }>(
      (resolve) => chrome.storage.local.get([STATS_KEY], (r) => resolve(r)),
    );
    const stats = (res.screen_time_stats?.[todayStr] as Record<string, number>) || {};
    set({ screenTimeStats: stats });
  },

  saveBlockedSites: (sites) => {
    chrome.storage.local.set({ [SITES_KEY]: sites });
    scheduleCloudBackup();
  },

  enableDetox: (sites, duration) => {
    const calculatedEndTime = duration === -1 ? -1 : Date.now() + duration;
    const settings = {
      [ENABLED_KEY]: true,
      [SITES_KEY]: sites,
      [END_TIME_KEY]: calculatedEndTime,
    };
    chrome.storage.local.set(settings, () => {
      set({ enabled: true, endTime: calculatedEndTime });
    });
    scheduleCloudBackup();
  },

  disableDetox: () => {
    const settings = {
      [ENABLED_KEY]: false,
      [END_TIME_KEY]: 0,
    };
    chrome.storage.local.set(settings, () => {
      set({ enabled: false, endTime: 0 });
    });
    scheduleCloudBackup();
  },
}));
