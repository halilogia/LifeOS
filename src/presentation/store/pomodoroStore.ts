/**
 * pomodoroStore.ts
 * Zustand singleton — pomodoro timer + stopwatch + alarms + zen garden.
 * 4 slice (Zustand Slice Pattern) + UI state (activeTab) + configure/init.
 * Tüketici: usePomodoro.ts facade — hiç değişmez.
 */

import { create } from "zustand";
import type { Language } from "@/types/types.js";
import { createTimerSlice, type TimerSlice } from "./pomodoro/timerSlice.js";
import {
  createStopwatchSlice,
  type StopwatchSlice,
} from "./pomodoro/stopwatchSlice.js";
import { createAlarmSlice, type AlarmSlice } from "./pomodoro/alarmSlice.js";
import { createZenSlice, type ZenSlice } from "./pomodoro/zenSlice.js";

export type { Language } from "@/types/types.js";

interface PomodoroCallbacks {
  lang: Language;
  t: Record<string, string>;
}

export interface PomodoroState
  extends TimerSlice, StopwatchSlice, AlarmSlice, ZenSlice {
  activeTab: "timer" | "zen";
  setActiveTab: (t: "timer" | "zen") => void;
  configure: (c: PomodoroCallbacks) => void;
  init: () => () => void;
}

export const usePomodoroState = create<PomodoroState>()((set, get, _api) => ({
  ...createTimerSlice(set, get, _api),
  ...createStopwatchSlice(set, get, _api),
  ...createAlarmSlice(set, get, _api),
  ...createZenSlice(set, get, _api),

  activeTab: "timer",
  setActiveTab: (t) => set({ activeTab: t }),

  configure: (_c) => {
    // Callbacks artık slice'lar içinde ihtiyaç duyulduğunda doğrudan
    // getTranslation() ile alınır; configure korunur (geriye uyumluluk).
  },

  init: () => {
    const unsubTimer = get().initTimer();
    const unsubSw = get().initStopwatch();
    const unsubAlarms = get().initAlarms();
    get().initZen();

    return () => {
      unsubTimer();
      unsubSw();
      unsubAlarms();
    };
  },
}));
