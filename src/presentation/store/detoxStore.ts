/**
 * useDetox store
 * Zustand singleton — detox config state + screen time stats + persistence.
 * Hook file stays as a facade; consumer components are untouched.
 *
 * Persistence note: detox config is mirrored to BOTH chrome.storage.local and
 * chrome.storage.sync. Local is read by the content-script blocker (fast path,
 * per-tab); sync makes the config survive on a freshly installed PC. The sync
 * mirror goes through IUserSyncProfileRepository (infrastructure boundary) so the
 * presentation layer never touches chrome.storage.sync directly.
 */

import { create } from "zustand";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";
import { userSyncProfileRepo } from "@/infrastructure/persistence/repositories/ChromeStorageUserSyncProfileRepository.js";

const ENABLED_KEY = "detox_enabled";
const SITES_KEY = "detox_blocked_sites";
const END_TIME_KEY = "detox_end_time";
const STATS_KEY = "screen_time_stats";
const DISTRACTION_KEY = "detox_distraction_settings";
const LIMITS_KEY = "detoxLimits"; // modern key
const LIMITS_LEGACY_KEY = "detox_limits"; // legacy key (SiteMatcher reads both)

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
  saveLimits: (limits: Record<string, number>) => void;
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
      detoxLimits?: Record<string, number>;
      detox_limits?: Record<string, number>;
    }>((resolve) =>
      chrome.storage.local.get(
        [ENABLED_KEY, SITES_KEY, END_TIME_KEY, DISTRACTION_KEY, LIMITS_KEY, LIMITS_LEGACY_KEY],
        (r) => resolve(r),
      ),
    );

    const synced = await userSyncProfileRepo.getProfile();
    if (res.detox_enabled === undefined && res.detox_blocked_sites === undefined) {
      // Mirror sync -> local so content-script blocker (reads local) sees it.
      const mirror: Record<string, unknown> = {};
      if (synced.detoxEnabled !== undefined) {
        mirror[ENABLED_KEY] = synced.detoxEnabled;
      }
      if (synced.detoxBlockedSites !== undefined) {
        mirror[SITES_KEY] = synced.detoxBlockedSites;
      }
      if (synced.detoxEndTime !== undefined) {
        mirror[END_TIME_KEY] = synced.detoxEndTime;
      }
      if (synced.detoxDistractionSettings !== undefined) {
        mirror[DISTRACTION_KEY] = synced.detoxDistractionSettings;
      }
      if (synced.detoxLimits !== undefined) {
        mirror[LIMITS_KEY] = synced.detoxLimits;
      }
      if (synced.detoxLimitsLegacy !== undefined) {
        mirror[LIMITS_LEGACY_KEY] = synced.detoxLimitsLegacy;
      }
      if (Object.keys(mirror).length > 0) {
        chrome.storage.local.set(mirror);
      }
    }

    const isEnabled = res.detox_enabled ?? synced.detoxEnabled ?? false;
    const sites = res.detox_blocked_sites ?? synced.detoxBlockedSites ?? [];
    const end = res.detox_end_time ?? synced.detoxEndTime ?? 0;
    const distraction = res.detox_distraction_settings
      ? { ...DEFAULT_DISTRACTION_SETTINGS, ...res.detox_distraction_settings }
      : synced.detoxDistractionSettings
        ? {
            ...DEFAULT_DISTRACTION_SETTINGS,
            ...(synced.detoxDistractionSettings as DistractionSettings),
          }
        : DEFAULT_DISTRACTION_SETTINGS;
    const limits =
      res.detoxLimits ??
      res.detox_limits ??
      synced.detoxLimits ??
      synced.detoxLimitsLegacy ??
      {};

    if (isEnabled && end !== -1 && end <= Date.now()) {
      chrome.storage.local.set({ [ENABLED_KEY]: false, [END_TIME_KEY]: 0 });
      set({ enabled: false, blockedSites: sites, endTime: 0, distractionSettings: distraction });
    } else {
      set({ enabled: isEnabled, blockedSites: sites, endTime: end, distractionSettings: distraction });
    }
    if (Object.keys(limits).length > 0) {
      chrome.storage.local.set({ [LIMITS_KEY]: limits, [LIMITS_LEGACY_KEY]: limits });
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
    void userSyncProfileRepo.saveProfile({ detoxBlockedSites: sites });
    scheduleCloudBackup();
  },

  saveDistractionSettings: (settings) => {
    chrome.storage.local.set({ [DISTRACTION_KEY]: settings });
    void userSyncProfileRepo.saveProfile({ detoxDistractionSettings: settings });
    scheduleCloudBackup();
  },

  saveLimits: (limits) => {
    chrome.storage.local.set({ [LIMITS_KEY]: limits, [LIMITS_LEGACY_KEY]: limits });
    void userSyncProfileRepo.saveProfile({ detoxLimits: limits });
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
    void userSyncProfileRepo.saveProfile({
      detoxEnabled: true,
      detoxBlockedSites: sites,
      detoxEndTime: calculatedEndTime,
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
    void userSyncProfileRepo.saveProfile({ detoxEnabled: false, detoxEndTime: 0 });
    scheduleCloudBackup();
  },
}));
