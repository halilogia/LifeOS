/**
 * ChromeStorageStopwatchRepository
 * Infrastructure implementation of IStopwatchRepository using chrome.storage.local
 * directly (not wrapping legacy pomodoroManager).
 */

import type { IStopwatchRepository, StopwatchState } from "../../application/use-cases/pomodoro/StopwatchUseCase.js";

const STOPWATCH_STORAGE_KEY = "stopwatchState";

type StateChangeCallback = (state: StopwatchState) => void;

export class ChromeStorageStopwatchRepository implements IStopwatchRepository {
    private listeners: Set<StateChangeCallback> = new Set();
    private boundOnChanged: ((changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void) | null = null;

    async getState(): Promise<StopwatchState> {
        return new Promise((resolve) => {
            chrome.storage.local.get([STOPWATCH_STORAGE_KEY], (result) => {
                resolve(
                    (result[STOPWATCH_STORAGE_KEY] as StopwatchState) ?? {
                        running: false,
                        time: 0,
                        startTime: 0,
                    },
                );
            });
        });
    }

    async saveState(state: StopwatchState): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STOPWATCH_STORAGE_KEY]: state }, resolve);
        });
    }

    onStateChanged(callback: (state: StopwatchState) => void): () => void {
        this.listeners.add(callback);

        if (!this.boundOnChanged) {
            this.boundOnChanged = (changes, areaName) => {
                if (areaName === "local" && changes[STOPWATCH_STORAGE_KEY]) {
                    const newState = changes[STOPWATCH_STORAGE_KEY].newValue as StopwatchState;
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