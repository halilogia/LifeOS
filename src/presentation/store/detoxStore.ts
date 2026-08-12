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
const DISTRACTION_KEY = "detox_distraction_settings";

export interface DistractionSettings {
  ytShortsBlock: boolean;
  ytFeedBlock: boolean;
  ytCommentsBlock: boolean;
  ytSubscriptionsBlock: boolean;
  ytUpNextBlock: boolean;
  igReelsBlock: boolean;
  igExploreBlock: boolean;
  igFeedBlock: boolean;
  fbReelsBlock: boolean;
  fbFeedBlock: boolean;
  ttFeedBlock: boolean;
  xFeedBlock: boolean;
  xExploreBlock: boolean;
}

export const DEFAULT_DISTRACTION_SETTINGS: DistractionSettings = {
  ytShortsBlock: true,
  ytFeedBlock: true,
  ytCommentsBlock: false,
  ytSubscriptionsBlock: true,
  ytUpNextBlock: true,
  igReelsBlock: true,
  igExploreBlock: false,
  igFeedBlock: false,
  fbReelsBlock: true,
  fbFeedBlock: false,
  ttFeedBlock: true,
  xFeedBlock: false,
  xExploreBlock: false,
};

interface DetoxState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  blockedSites: string[];
  setBlockedSites: (sites: string[] | ((prev: string[]) => string[])) => void;
  endTime: number;
  setEndTime: (t: number) => void;
  screenTimeStats: Record<string, number>;
  distractionSettings: DistractionSettings;
  setDistractionSettings: (
    settings: Partial<DistractionSettings> | ((prev: DistractionSettings) => DistractionSettings),
  ) => void;
  loadConfig: () => Promise<void>;
  loadScreenTimeStats: () => Promise<void>;
  saveBlockedSites: (sites: string[]) => void;
  saveDistractionSettings: (settings: DistractionSettings) => void;
  enableDetox: (sites: string[], duration: number) => void;
  disableDetox: () => void;
}

export const useDetoxState = create<DetoxState>()((set, get) => ({
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
  distractionSettings: DEFAULT_DISTRACTION_SETTINGS,
  setDistractionSettings: (updater) =>
    set((s) => {
      const updated =
        typeof updater === "function"
          ? updater(s.distractionSettings)
          : { ...s.distractionSettings, ...updater };
      get().saveDistractionSettings(updated);
      return { distractionSettings: updated };
    }),

  loadConfig: async () => {
    const res = await new Promise<{
      detox_enabled?: boolean;
      detox_blocked_sites?: string[];
      detox_end_time?: number;
      detox_distraction_settings?: DistractionSettings;
    }>((resolve) =>
      chrome.storage.local.get(
        [ENABLED_KEY, SITES_KEY, END_TIME_KEY, DISTRACTION_KEY],
        (r) => resolve(r),
      ),
    );
    const isEnabled = res.detox_enabled || false;
    const sites = res.detox_blocked_sites || [];
    const end = res.detox_end_time || 0;
    const distraction = res.detox_distraction_settings
      ? { ...DEFAULT_DISTRACTION_SETTINGS, ...res.detox_distraction_settings }
      : DEFAULT_DISTRACTION_SETTINGS;

    if (isEnabled && end !== -1 && end <= Date.now()) {
      // Time expired, disable
      chrome.storage.local.set({
        [ENABLED_KEY]: false,
        [END_TIME_KEY]: 0,
      });
      set({ enabled: false, blockedSites: sites, endTime: 0, distractionSettings: distraction });
    } else {
      set({ enabled: isEnabled, blockedSites: sites, endTime: end, distractionSettings: distraction });
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

  saveDistractionSettings: (settings) => {
    chrome.storage.local.set({ [DISTRACTION_KEY]: settings });
    chrome.storage.sync.set({ [DISTRACTION_KEY]: settings });
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
