import type { StateCreator } from "zustand";
import type { PomodoroState } from "../pomodoroStore.js";
import { pomodoroManager } from "@/infrastructure/services/PomodoroManagerService.js";

export interface StopwatchSlice {
  swTime: number;
  swRunning: boolean;
  swStartTime: number;
  handleSwStart: () => Promise<void>;
  handleSwPause: () => Promise<void>;
  handleSwReset: () => Promise<void>;
  initStopwatch: () => () => void;
}

export const createStopwatchSlice: StateCreator<
  PomodoroState,
  [],
  [],
  StopwatchSlice
> = (set, get) => ({
  swTime: 0,
  swRunning: false,
  swStartTime: 0,
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
  initStopwatch: () => {
    void pomodoroManager.getStopwatch().then((s) => {
      set({ swRunning: s.running, swTime: s.time, swStartTime: s.startTime });
    });
    const unsub = pomodoroManager.onStopwatchChanged((s) => {
      set({ swRunning: s.running, swTime: s.time, swStartTime: s.startTime });
    });
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
    return () => {
      unsub();
      clearInterval(swTimer);
    };
  },
});
