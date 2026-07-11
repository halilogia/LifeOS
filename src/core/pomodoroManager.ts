export interface PomoState {
  mode: 'focus' | 'short' | 'long';
  running: boolean;
  timeLeft: number;
  totalTime: number;
  endTime: number;
}

const STORAGE_KEY = 'pomodoro_timer_state';
const DEFAULT_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

const defaultState: PomoState = {
  mode: 'focus',
  running: false,
  timeLeft: DEFAULT_TIMES.focus,
  totalTime: DEFAULT_TIMES.focus,
  endTime: 0,
};

export const pomodoroManager = {
  async getState(): Promise<PomoState> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        if (res[STORAGE_KEY]) {
          const state = res[STORAGE_KEY] as PomoState;
          // If timer is running, recalculate remaining time based on endTime
          if (state.running) {
            const now = Date.now();
            const remaining = Math.max(0, Math.round((state.endTime - now) / 1000));
            state.timeLeft = remaining;
            if (remaining === 0) {
              state.running = false;
            }
          }
          resolve(state);
        } else {
          resolve({ ...defaultState });
        }
      });
    });
  },

  async saveState(state: PomoState): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
        resolve();
      });
    });
  },

  async startTimer(timeLeft: number, mode: 'focus' | 'short' | 'long', totalTime: number): Promise<PomoState> {
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

  async resetTimer(mode: 'focus' | 'short' | 'long', totalTime: number): Promise<PomoState> {
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
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[STORAGE_KEY]) {
        const state = changes[STORAGE_KEY].newValue as PomoState;
        if (state) {
          if (state.running) {
            const now = Date.now();
            const remaining = Math.max(0, Math.round((state.endTime - now) / 1000));
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
};
