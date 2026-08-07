/**
 * usePomodoro store
 * Zustand singleton — pomodoro timer + stopwatch + alarms + zen garden + history.
 * All pomodoroManager subscriptions + chrome.storage + local timers live here.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import type { Language, PomodoroLog } from "@/types/types.js";
import {
  pomodoroManager,
  AlarmItem,
} from "@/infrastructure/services/PomodoroManagerService.js";
import { logger } from "@/utils/logger.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const POMO_MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const HISTORY_KEY = "pomodoroHistory";
const CUSTOM_TIMES_KEY = "pomoCustomTimes";

interface PomodoroCallbacks {
  lang: Language;
  t: Record<string, string>;
}

let cb: PomodoroCallbacks | null = null;

interface PomodoroState {
  // UI state
  activeTab: "timer" | "zen";
  setActiveTab: (t: "timer" | "zen") => void;

  // Zen Garden & History
  pomodoroHistory: PomodoroLog[];
  setPomodoroHistory: (h: PomodoroLog[]) => void;
  showPlantModal: boolean;
  setShowPlantModal: (v: boolean) => void;
  focusNote: string;
  setFocusNote: (n: string) => void;
  selectedElement: PomodoroLog["element"];
  setSelectedElement: (e: PomodoroLog["element"]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Pomodoro Timer
  customTimes: { focus: number; short: number; long: number };
  pomoMode: "focus" | "short" | "long";
  pomoTimeLeft: number;
  pomoTotalTime: number;
  pomoRunning: boolean;
  pomoEndTime: number;

  // Stopwatch
  swTime: number;
  swRunning: boolean;
  swStartTime: number;

  // Alarms
  alarms: AlarmItem[];
  alarmInput: string;
  setAlarmInput: (s: string) => void;

  // Last completed session (for zen garden)
  lastCompletedDuration: number;
  lastCompletedStartTime: string;
  lastCompletedEndTime: string;
  setLastCompletedDuration: (d: number) => void;
  setLastCompletedStartTime: (s: string) => void;
  setLastCompletedEndTime: (s: string) => void;

  configure: (c: PomodoroCallbacks) => void;
  init: () => () => void;

  // Actions
  handlePomoModeChange: (mode: "focus" | "short" | "long") => Promise<void>;
  handleCustomTimeChange: (mode: "focus" | "short" | "long", mins: number) => Promise<void>;
  handlePomoStart: () => Promise<void>;
  handlePomoPause: () => Promise<void>;
  handlePomoReset: () => Promise<void>;
  handleSwStart: () => Promise<void>;
  handleSwPause: () => Promise<void>;
  handleSwReset: () => Promise<void>;
  handleAddAlarm: () => Promise<void>;
  handleToggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  handleDeleteAlarm: (id: string) => Promise<void>;
  handlePlantElement: () => Promise<void>;
}

function notify(msg: string) {
  try {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.volume = 0.4;
    audio.play();
  } catch (e) {
    logger.error("[PomodoroView] notify audio failed:", e);
  }
  if (Notification.permission === "granted") {
    new Notification("Life OS", { body: msg });
  } else {
    Notification.requestPermission();
  }
}

export const usePomodoroState = create<PomodoroState>()((set, get) => ({
  // UI
  activeTab: "timer",
  setActiveTab: (t) => set({ activeTab: t }),

  // Zen Garden
  pomodoroHistory: [],
  setPomodoroHistory: (h) => set({ pomodoroHistory: h }),
  showPlantModal: false,
  setShowPlantModal: (v) => set({ showPlantModal: v }),
  focusNote: "",
  setFocusNote: (n) => set({ focusNote: n }),
  selectedElement: "bonsai",
  setSelectedElement: (e) => set({ selectedElement: e }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Pomodoro Timer
  customTimes: { ...POMO_MODE_TIMES },
  pomoMode: "focus",
  pomoTimeLeft: POMO_MODE_TIMES.focus,
  pomoTotalTime: POMO_MODE_TIMES.focus,
  pomoRunning: false,
  pomoEndTime: 0,

  // Stopwatch
  swTime: 0,
  swRunning: false,
  swStartTime: 0,

  // Alarms
  alarms: [],
  alarmInput: "",
  setAlarmInput: (s) => set({ alarmInput: s }),

  // Last completed
  lastCompletedDuration: 25 * 60,
  lastCompletedStartTime: "",
  lastCompletedEndTime: "",
  setLastCompletedDuration: (d) => set({ lastCompletedDuration: d }),
  setLastCompletedStartTime: (s) => set({ lastCompletedStartTime: s }),
  setLastCompletedEndTime: (s) => set({ lastCompletedEndTime: s }),

  configure: (c) => {
    cb = c;
  },

  init: () => {
    // 1. Pomodoro initial state
    void pomodoroManager.getState().then((state) => {
      set({
        pomoMode: state.mode,
        pomoTimeLeft: state.timeLeft,
        pomoTotalTime: state.totalTime,
        pomoRunning: state.running,
        pomoEndTime: state.endTime,
      });
    });
    const unsubPomo = pomodoroManager.onStateChanged((state) => {
      set({
        pomoMode: state.mode,
        pomoTimeLeft: state.timeLeft,
        pomoTotalTime: state.totalTime,
        pomoRunning: state.running,
        pomoEndTime: state.endTime,
      });
    });

    // 2. Stopwatch initial state
    void pomodoroManager.getStopwatch().then((s) => {
      set({ swRunning: s.running, swTime: s.time, swStartTime: s.startTime });
    });
    const unsubSw = pomodoroManager.onStopwatchChanged((s) => {
      set({ swRunning: s.running, swTime: s.time, swStartTime: s.startTime });
    });

    // 3. Alarms initial state
    void pomodoroManager.getAlarms().then((list) => set({ alarms: list }));
    const unsubAlarms = pomodoroManager.onAlarmsChanged((list) =>
      set({ alarms: list }),
    );

    // 4. Pomodoro history initial state
    chrome.storage.local.get([HISTORY_KEY], (res) => {
      set({ pomodoroHistory: (res[HISTORY_KEY] as PomodoroLog[]) || [] });
    });

    // 5. Load custom times settings
    chrome.storage.local.get([CUSTOM_TIMES_KEY], (res) => {
      const times = res[CUSTOM_TIMES_KEY] as
        | { focus: number; short: number; long: number }
        | undefined;
      if (times) {
        set({ customTimes: times });
      }
    });

    // Timers
    const pomoTimer = setInterval(() => {
      const { pomoRunning, pomoEndTime, pomoMode, pomoTotalTime } = get();
      if (pomoRunning) {
        const remaining = Math.max(
          0,
          Math.round((pomoEndTime - Date.now()) / 1000),
        );
        if (remaining === 0) {
          set((prev) => ({
            pomoRunning: false,
            pomoTimeLeft: 0,
          }));
          const c = cb;
          if (c) {
            notify(
              pomoMode === "focus"
                ? "Focus session completed! Plant your Zen Element."
                : "Break finished!",
            );
            set({
              lastCompletedDuration: pomoTotalTime,
              lastCompletedStartTime: new Date(
                Date.now() - pomoTotalTime * 1000,
              ).toISOString(),
              lastCompletedEndTime: new Date().toISOString(),
              showPlantModal: true,
            });
          }
        } else {
          set({ pomoTimeLeft: remaining });
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

    const alarmTimer = setInterval(() => {
      const { alarms } = get();
      const c = cb;
      if (!c) {return;}
      const now = new Date();
      const currentHHMM = now.toTimeString().slice(0, 5);
      alarms.forEach(async (alarm) => {
        if (alarm.enabled && alarm.time === currentHHMM) {
          await pomodoroManager.toggleAlarm(alarm.id, false);
          notify(`${c.t.alarm_time_label} ${alarm.time}`);
        }
      });
    }, 1000);

    return () => {
      unsubPomo();
      unsubSw();
      unsubAlarms();
      clearInterval(pomoTimer);
      clearInterval(swTimer);
      clearInterval(alarmTimer);
    };
  },

  // --- Actions ---
  handlePomoModeChange: async (mode) => {
    const { customTimes } = get();
    const totalTime = customTimes[mode];
    await pomodoroManager.resetTimer(mode, totalTime);
  },

  handleCustomTimeChange: async (mode, mins) => {
    if (isNaN(mins) || mins <= 0) {
      return;
    }
    const seconds = mins * 60;
    const newTimes = { ...get().customTimes, [mode]: seconds };
    set({ customTimes: newTimes });
    chrome.storage.local.set({ [CUSTOM_TIMES_KEY]: newTimes });
    scheduleCloudBackup();

    const { pomoRunning, pomoMode: currentMode } = get();
    if (!pomoRunning && currentMode === mode) {
      await pomodoroManager.resetTimer(mode, seconds);
    }
  },

  handlePomoStart: async () => {
    const { pomoTimeLeft, pomoMode, pomoTotalTime } = get();
    await pomodoroManager.startTimer(pomoTimeLeft, pomoMode, pomoTotalTime);
  },

  handlePomoPause: async () => {
    const { pomoTimeLeft } = get();
    await pomodoroManager.pauseTimer(pomoTimeLeft);
  },

  handlePomoReset: async () => {
    const { pomoMode, pomoTotalTime } = get();
    await pomodoroManager.resetTimer(pomoMode, pomoTotalTime);
  },

  handleSwStart: async () => {
    const { swTime } = get();
    const state = await pomodoroManager.startStopwatch(swTime);
    set({ swRunning: true, swStartTime: state.startTime });
  },

  handleSwPause: async () => {
    const { swTime } = get();
    await pomodoroManager.pauseStopwatch(swTime);
    set({ swRunning: false });
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

  handlePlantElement: async () => {
    const {
      pomodoroHistory,
      lastCompletedStartTime,
      lastCompletedEndTime,
      lastCompletedDuration,
      focusNote,
      selectedElement,
    } = get();
    const c = cb;
    if (!c) {return;}

    let position = -1;
    const occupied = new Set(pomodoroHistory.map((h) => h.position));
    for (let i = 0; i < 25; i++) {
      if (!occupied.has(i)) {
        position = i;
        break;
      }
    }
    if (position === -1) {
      position = pomodoroHistory.length % 25;
    }

    const newLog: PomodoroLog = {
      id: crypto.randomUUID(),
      startTime: lastCompletedStartTime || new Date().toISOString(),
      endTime: lastCompletedEndTime || new Date().toISOString(),
      duration: lastCompletedDuration,
      mode: "focus",
      note: focusNote.trim() || c.t.pomodoro_session_title,
      element: selectedElement,
      position,
    };

    const nextHistory = [
      ...pomodoroHistory.filter((h) => h.position !== position),
      newLog,
    ];
    await new Promise<void>((r) =>
      chrome.storage.local.set({ [HISTORY_KEY]: nextHistory }, r),
    );
    set({ pomodoroHistory: nextHistory, showPlantModal: false, focusNote: "" });
    scheduleCloudBackup();
  },
}));