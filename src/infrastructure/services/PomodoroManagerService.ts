export interface PomoState {
  mode: "focus" | "short" | "long";
  running: boolean;
  timeLeft: number;
  totalTime: number;
  endTime: number;
}

export interface StopwatchState {
  running: boolean;
  time: number;
  startTime: number;
}

export interface AlarmItem {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
}

const POMO_KEY = "pomodoro_timer_state";
const STOPWATCH_KEY = "stopwatch_state";
const ALARMS_KEY = "pomodoro_alarms";

import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const DEFAULT_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

const defaultPomoState: PomoState = {
  mode: "focus",
  running: false,
  timeLeft: DEFAULT_TIMES.focus,
  totalTime: DEFAULT_TIMES.focus,
  endTime: 0,
};

const defaultStopwatchState: StopwatchState = {
  running: false,
  time: 0,
  startTime: 0,
};

export const pomodoroManager = {
  // --- Pomodoro ---
  async getState(): Promise<PomoState> {
    return new Promise((resolve) => {
      chrome.storage.local.get([POMO_KEY], (res) => {
        if (res[POMO_KEY]) {
          const state = res[POMO_KEY] as PomoState;
          if (state.running) {
            const now = Date.now();
            const remaining = Math.max(
              0,
              Math.round((state.endTime - now) / 1000),
            );
            state.timeLeft = remaining;
            if (remaining === 0) {
              state.running = false;
            }
          }
          resolve(state);
        } else {
          resolve({ ...defaultPomoState });
        }
      });
    });
  },

  async saveState(state: PomoState): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [POMO_KEY]: state }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  },

  async startTimer(
    timeLeft: number,
    mode: "focus" | "short" | "long",
    totalTime: number,
  ): Promise<PomoState> {
    const endTime = Date.now() + timeLeft * 1000;
    const newState: PomoState = {
      mode,
      running: true,
      timeLeft,
      totalTime,
      endTime,
    };
    await this.saveState(newState);
    return newState;
  },

  async pauseTimer(timeLeft: number): Promise<PomoState> {
    const state = await this.getState();
    const newState: PomoState = {
      ...state,
      running: false,
      timeLeft,
      endTime: 0,
    };
    await this.saveState(newState);
    return newState;
  },

  async resetTimer(
    mode: "focus" | "short" | "long",
    totalTime: number,
  ): Promise<PomoState> {
    const newState: PomoState = {
      mode,
      running: false,
      timeLeft: totalTime,
      totalTime,
      endTime: 0,
    };
    await this.saveState(newState);
    return newState;
  },

  onStateChanged(callback: (state: PomoState) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes[POMO_KEY]) {
        const state = changes[POMO_KEY].newValue as PomoState;
        if (state) {
          if (state.running) {
            const now = Date.now();
            const remaining = Math.max(
              0,
              Math.round((state.endTime - now) / 1000),
            );
            state.timeLeft = remaining;
            if (remaining === 0) {
              state.running = false;
            }
          }
          callback(state);
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  },

  // --- Synced Stopwatch ---
  async getStopwatch(): Promise<StopwatchState> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STOPWATCH_KEY], (res) => {
        if (res[STOPWATCH_KEY]) {
          const state = res[STOPWATCH_KEY] as StopwatchState;
          if (state.running) {
            const elapsed =
              state.time + Math.floor((Date.now() - state.startTime) / 1000);
            state.time = elapsed;
          }
          resolve(state);
        } else {
          resolve({ ...defaultStopwatchState });
        }
      });
    });
  },

  async saveStopwatch(state: StopwatchState): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STOPWATCH_KEY]: state }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  },

  async startStopwatch(time: number): Promise<StopwatchState> {
    const newState: StopwatchState = {
      running: true,
      time,
      startTime: Date.now(),
    };
    await this.saveStopwatch(newState);
    return newState;
  },

  async pauseStopwatch(time: number): Promise<StopwatchState> {
    const newState: StopwatchState = {
      running: false,
      time,
      startTime: 0,
    };
    await this.saveStopwatch(newState);
    return newState;
  },

  async resetStopwatch(): Promise<StopwatchState> {
    const newState = { ...defaultStopwatchState };
    await this.saveStopwatch(newState);
    return newState;
  },

  onStopwatchChanged(callback: (state: StopwatchState) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes[STOPWATCH_KEY]) {
        const state = changes[STOPWATCH_KEY].newValue as StopwatchState;
        if (state) {
          if (state.running) {
            const elapsed =
              state.time + Math.floor((Date.now() - state.startTime) / 1000);
            state.time = elapsed;
          }
          callback(state);
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  },

  // --- Synced Phone-Style Alarms ---
  async getAlarms(): Promise<AlarmItem[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([ALARMS_KEY], (res) => {
        resolve((res[ALARMS_KEY] as AlarmItem[]) || []);
      });
    });
  },

  async saveAlarms(alarms: AlarmItem[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [ALARMS_KEY]: alarms }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  },

  async addAlarm(time: string): Promise<AlarmItem[]> {
    const alarms = await this.getAlarms();
    // Prevent duplicate times
    if (alarms.some((a) => a.time === time)) {
      return alarms;
    }
    const newAlarm: AlarmItem = {
      id: Math.random().toString(36).substring(2, 9),
      time,
      enabled: true,
    };
    const updated = [...alarms, newAlarm].sort((a, b) =>
      a.time.localeCompare(b.time),
    );
    await this.saveAlarms(updated);
    return updated;
  },

  async toggleAlarm(id: string, enabled: boolean): Promise<AlarmItem[]> {
    const alarms = await this.getAlarms();
    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled } : a));
    await this.saveAlarms(updated);
    return updated;
  },

  async deleteAlarm(id: string): Promise<AlarmItem[]> {
    const alarms = await this.getAlarms();
    const updated = alarms.filter((a) => a.id !== id);
    await this.saveAlarms(updated);
    return updated;
  },

  onAlarmsChanged(callback: (alarms: AlarmItem[]) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes[ALARMS_KEY]) {
        const alarms = changes[ALARMS_KEY].newValue as AlarmItem[];
        if (alarms) {
          callback(alarms);
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  },
};
