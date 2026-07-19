/**
 * ChromeStorageStopwatchRepository
 * Infrastructure implementation of IStopwatchRepository using chrome.storage.local.
 * Wraps the existing pomodoroManager for stopwatch state operations.
 */

import { pomodoroManager } from "../../core/pomodoroManager.js";
import type { IStopwatchRepository } from "../../application/use-cases/pomodoro/StopwatchUseCase.js";
import type { StopwatchState } from "../../application/use-cases/pomodoro/StopwatchUseCase.js";

export class ChromeStorageStopwatchRepository implements IStopwatchRepository {
    async getState(): Promise<StopwatchState> {
        return pomodoroManager.getStopwatch() as Promise<StopwatchState>;
    }

    async saveState(state: StopwatchState): Promise<void> {
        return pomodoroManager.saveStopwatch(state as any);
    }

    onStateChanged(callback: (state: StopwatchState) => void): () => void {
        return pomodoroManager.onStopwatchChanged(callback as any);
    }
}