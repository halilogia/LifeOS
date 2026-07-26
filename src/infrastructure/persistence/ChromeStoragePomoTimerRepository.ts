/**
 * ChromeStoragePomoTimerRepository
 * Infrastructure implementation of IPomoTimerRepository using chrome.storage.local
 * directly (not wrapping legacy pomodoroManager).
 */

import type {
  PomoState,
  IPomoTimerRepository,
} from "../../application/use-cases/pomodoro/TimerUseCase.js";

const POMO_STORAGE_KEY = "pomoState";

type StateChangeCallback = (state: PomoState) => void;

export class ChromeStoragePomoTimerRepository implements IPomoTimerRepository {
  private listeners: Set<StateChangeCallback> = new Set();
  private boundOnChanged:
    | ((
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => void)
    | null = null;

  async getState(): Promise<PomoState> {
    return new Promise((resolve) => {
      chrome.storage.local.get([POMO_STORAGE_KEY], (result) => {
        resolve(
          (result[POMO_STORAGE_KEY] as PomoState) ?? {
            mode: "focus",
            running: false,
            timeLeft: 25 * 60,
            totalTime: 25 * 60,
            endTime: 0,
          },
        );
      });
    });
  }

  async saveState(state: PomoState): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [POMO_STORAGE_KEY]: state }, resolve);
    });
  }

  onStateChanged(callback: (state: PomoState) => void): () => void {
    this.listeners.add(callback);

    if (!this.boundOnChanged) {
      this.boundOnChanged = (changes, areaName) => {
        if (areaName === "local" && changes[POMO_STORAGE_KEY]) {
          const newState = changes[POMO_STORAGE_KEY].newValue as PomoState;
          for (const listener of this.listeners) {
            listener(newState);
          }
        }
      };
      chrome.storage.onChanged.addListener(this.boundOnChanged);
    }

    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0 && this.boundOnChanged) {
        chrome.storage.onChanged.removeListener(this.boundOnChanged);
        this.boundOnChanged = null;
      }
    };
  }
}
