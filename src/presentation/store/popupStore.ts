/**
 * usePopup store
 * Zustand singleton — popup UI state + Pomodoro/Stopwatch/Alarms/Detox subscriptions.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import {
  pomodoroManager,
  PomoState,
  AlarmItem,
} from "@/infrastructure/services/PomodoroManagerService.js";
import type { Language } from "@/domain/value-objects/Language.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const POMO_MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

interface PopupState {
  popupTab: "pomo" | "detox" | "volume";
  setPopupTab: (t: "pomo" | "detox" | "volume") => void;
  lang: Language;
  pomoState: PomoState;
  swRunning: boolean;
  swTime: number;
  swStartTime: number;
  alarms: AlarmItem[];
  alarmInput: string;
  setAlarmInput: (s: string) => void;
  detoxEnabled: boolean;
  detoxBlockedSites: string[];
  detoxEndTime: number;
  detoxDuration: number;
  setDetoxDuration: (d: number) => void;
  detoxTimeLeft: number;
  init: () => () => void;
  handlePomoTabChange: (mode: "focus" | "short" | "long") => Promise<void>;
  handlePomoPlayPause: () => Promise<void>;
  handlePomoReset: () => Promise<void>;
  handleSwPlayPause: () => Promise<void>;
  handleSwReset: () => Promise<void>;
  handleAddAlarm: () => Promise<void>;
  handleToggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  handleDeleteAlarm: (id: string) => Promise<void>;
  handleTogglePopupSite: (siteDomains: string[]) => void;
  handleEnableDetox: () => void;
  handleDisableDetox: () => void;
}

export const usePopupState = create<PopupState>()((set, get) => ({
  popupTab: "pomo",
  setPopupTab: (t) => set({ popupTab: t }),
  lang: "en",
  pomoState: {
    mode: "focus",
    running: false,
    timeLeft: POMO_MODE_TIMES.focus,
    totalTime: POMO_MODE_TIMES.focus,
    endTime: 0,
  },
  swRunning: false,
  swTime: 0,
  swStartTime: 0,
  alarms: [],
  alarmInput: "",
  setAlarmInput: (s) => set({ alarmInput: s }),
  detoxEnabled: false,
  detoxBlockedSites: [],
  detoxEndTime: 0,
  detoxDuration: 30 * 60 * 1000,
  setDetoxDuration: (d) => set({ detoxDuration: d }),
  detoxTimeLeft: 0,

  init: () => {
    // Load UI Language
    chrome.storage.local.get(["lang"], (res) => {
      if (res.lang) {
        set({ lang: res.lang as Language });
      } else if (typeof chrome !== "undefined" && chrome.i18n) {
        const uiLang = chrome.i18n.getUILanguage();
        set({ lang: uiLang.startsWith("tr") ? "tr" : "en" });
      }
    });

    // Subscriptions
    void pomodoroManager.getState().then((s) => set({ pomoState: s }));
    const unsubPomo = pomodoroManager.onStateChanged((s) =>
      set({ pomoState: s }),
    );

    void pomodoroManager.getStopwatch().then((s) => {
      set({ swRunning: s.running, swTime: s.time, swStartTime: s.startTime });
    });
    const unsubSw = pomodoroManager.onStopwatchChanged((s) => {
      set({ swRunning: s.running, swTime: s.time, swStartTime: s.startTime });
    });

    void pomodoroManager.getAlarms().then((a) => set({ alarms: a }));
    const unsubAlarms = pomodoroManager.onAlarmsChanged((a) =>
      set({ alarms: a }),
    );

    const loadDetox = () => {
      chrome.storage.local.get(
        ["detox_enabled", "detox_blocked_sites", "detox_end_time"],
        (resData: {
          detox_enabled?: boolean;
          detox_blocked_sites?: string[];
          detox_end_time?: number;
        }) => {
          set({
            detoxEnabled: resData.detox_enabled || false,
            detoxBlockedSites: resData.detox_blocked_sites || [],
            detoxEndTime: resData.detox_end_time || 0,
          });
        },
      );
    };
    loadDetox();

    const unsubStorage = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "sync") {
        if (changes["lang"]) {
          set({ lang: changes["lang"].newValue as Language });
        }
        if (
          changes["detox_enabled"] ||
          changes["detox_blocked_sites"] ||
          changes["detox_end_time"]
        ) {
          loadDetox();
        }
      }
    };
    chrome.storage.onChanged.addListener(unsubStorage);

    // Timers
    const pomoTimer = setInterval(() => {
      const { pomoState } = get();
      if (pomoState.running) {
        const remaining = Math.max(
          0,
          Math.round((pomoState.endTime - Date.now()) / 1000),
        );
        if (remaining === 0) {
          set((prev) => ({
            pomoState: { ...prev.pomoState, running: false, timeLeft: 0 },
          }));
        } else {
          set((prev) => ({
            pomoState: { ...prev.pomoState, timeLeft: remaining },
          }));
        }
      }
    }, 1000);

    const swTimer = setInterval(() => {
      const { swRunning, swStartTime } = get();
      if (swRunning) {
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - swStartTime) / 1000),
        );
        chrome.storage.local.get(
          ["stopwatch_state"],
          (resData: { stopwatch_state?: { time?: number } }) => {
            const offset = resData?.stopwatch_state?.time || 0;
            set({ swTime: offset + elapsed });
          },
        );
      }
    }, 1000);

    const detoxTimer = setInterval(() => {
      const { detoxEnabled, detoxEndTime, handleDisableDetox } = get();
      if (detoxEnabled && detoxEndTime !== -1) {
        const remaining = Math.max(
          0,
          Math.round((detoxEndTime - Date.now()) / 1000),
        );
        set({ detoxTimeLeft: remaining });
        if (remaining === 0) {
          handleDisableDetox();
        }
      } else {
        set({ detoxTimeLeft: 0 });
      }
    }, 1000);

    return () => {
      unsubPomo();
      unsubSw();
      unsubAlarms();
      chrome.storage.onChanged.removeListener(unsubStorage);
      clearInterval(pomoTimer);
      clearInterval(swTimer);
      clearInterval(detoxTimer);
    };
  },

  handlePomoTabChange: async (mode) => {
    const totalTime = POMO_MODE_TIMES[mode];
    const newState = await pomodoroManager.resetTimer(mode, totalTime);
    set({ pomoState: newState });
  },

  handlePomoPlayPause: async () => {
    const { pomoState } = get();
    if (pomoState.running) {
      const newState = await pomodoroManager.pauseTimer(pomoState.timeLeft);
      set({ pomoState: newState });
    } else {
      const newState = await pomodoroManager.startTimer(
        pomoState.timeLeft,
        pomoState.mode,
        pomoState.totalTime,
      );
      set({ pomoState: newState });
    }
  },

  handlePomoReset: async () => {
    const { pomoState } = get();
    const newState = await pomodoroManager.resetTimer(
      pomoState.mode,
      pomoState.totalTime,
    );
    set({ pomoState: newState });
  },

  handleSwPlayPause: async () => {
    const { swRunning, swTime } = get();
    if (swRunning) {
      await pomodoroManager.pauseStopwatch(swTime);
      set({ swRunning: false });
    } else {
      const state = await pomodoroManager.startStopwatch(swTime);
      set({ swRunning: true, swStartTime: state.startTime });
    }
  },

  handleSwReset: async () => {
    await pomodoroManager.resetStopwatch();
    set({ swTime: 0, swRunning: false });
  },

  handleAddAlarm: async () => {
    const { alarmInput } = get();
    if (!alarmInput) {
      return;
    }
    const list = await pomodoroManager.addAlarm(alarmInput);
    set({ alarms: list, alarmInput: "" });
  },

  handleToggleAlarm: async (id, enabled) => {
    const list = await pomodoroManager.toggleAlarm(id, enabled);
    set({ alarms: list });
  },

  handleDeleteAlarm: async (id) => {
    const list = await pomodoroManager.deleteAlarm(id);
    set({ alarms: list });
  },

  handleTogglePopupSite: (siteDomains) => {
    const { detoxBlockedSites } = get();
    const isSelected = detoxBlockedSites.includes(siteDomains[0]);
    let updated: string[];
    if (isSelected) {
      updated = detoxBlockedSites.filter((d) => !siteDomains.includes(d));
    } else {
      updated = [...detoxBlockedSites, ...siteDomains];
    }
    set({ detoxBlockedSites: updated });
    chrome.storage.local.set({ detox_blocked_sites: updated });
    scheduleCloudBackup();
  },

  handleEnableDetox: () => {
    const { detoxBlockedSites, detoxDuration } = get();
    if (detoxBlockedSites.length === 0) {
      return;
    }
    const end = detoxDuration === -1 ? -1 : Date.now() + detoxDuration;
    chrome.storage.local.set(
      {
        detox_enabled: true,
        detox_blocked_sites: detoxBlockedSites,
        detox_end_time: end,
      },
      () => {
        set({ detoxEnabled: true, detoxEndTime: end });
      },
    );
    scheduleCloudBackup();
  },

  handleDisableDetox: () => {
    chrome.storage.local.set(
      {
        detox_enabled: false,
        detox_end_time: 0,
      },
      () => {
        set({ detoxEnabled: false, detoxEndTime: 0, detoxTimeLeft: 0 });
      },
    );
    scheduleCloudBackup();
  },
}));
