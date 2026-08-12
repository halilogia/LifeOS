import type { StateCreator } from "zustand";
import type { PomodoroState } from "../pomodoroStore.js";
import { pomodoroManager } from "@/infrastructure/services/PomodoroManagerService.js";
import { notify } from "./pomodoroNotify.js";

export interface TimerSlice {
  customTimes: { focus: number; short: number; long: number };
  pomoMode: "focus" | "short" | "long";
  pomoTimeLeft: number;
  pomoTotalTime: number;
  pomoRunning: boolean;
  pomoEndTime: number;
  handlePomoModeChange: (mode: "focus" | "short" | "long") => Promise<void>;
  handleCustomTimeChange: (
    mode: "focus" | "short" | "long",
    mins: number,
  ) => Promise<void>;
  handlePomoStart: () => Promise<void>;
  handlePomoPause: () => Promise<void>;
  handlePomoReset: () => Promise<void>;
  initTimer: () => () => void;
}

const POMO_MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const CUSTOM_TIMES_KEY = "pomoCustomTimes";

export const createTimerSlice: StateCreator<
  PomodoroState,
  [],
  [],
  TimerSlice
> = (set, get) => ({
  customTimes: { ...POMO_MODE_TIMES },
  pomoMode: "focus",
  pomoTimeLeft: POMO_MODE_TIMES.focus,
  pomoTotalTime: POMO_MODE_TIMES.focus,
  pomoRunning: false,
  pomoEndTime: 0,

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
    const { pomoRunning: running, pomoMode: currentMode } = get();
    if (!running && currentMode === mode) {
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

  initTimer: () => {
    void pomodoroManager.getState().then((state) => {
      set({
        pomoMode: state.mode,
        pomoTimeLeft: state.timeLeft,
        pomoTotalTime: state.totalTime,
        pomoRunning: state.running,
        pomoEndTime: state.endTime,
      });
    });
    const unsub = pomodoroManager.onStateChanged((state) => {
      set({
        pomoMode: state.mode,
        pomoTimeLeft: state.timeLeft,
        pomoTotalTime: state.totalTime,
        pomoRunning: state.running,
        pomoEndTime: state.endTime,
      });
    });

    chrome.storage.local.get([CUSTOM_TIMES_KEY], (res) => {
      const times = res[CUSTOM_TIMES_KEY] as
        { focus: number; short: number; long: number } | undefined;
      if (times) {
        set({ customTimes: times });
      }
    });

    const pomoTimer = setInterval(() => {
      const { pomoRunning, pomoEndTime, pomoMode, pomoTotalTime } = get();
      if (pomoRunning) {
        const remaining = Math.max(
          0,
          Math.round((pomoEndTime - Date.now()) / 1000),
        );
        if (remaining === 0) {
          set({ pomoRunning: false, pomoTimeLeft: 0 });
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
        } else {
          set({ pomoTimeLeft: remaining });
        }
      }
    }, 1000);

    return () => {
      unsub();
      clearInterval(pomoTimer);
    };
  },
});
