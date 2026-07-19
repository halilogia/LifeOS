/**
 * ChromeStoragePomoTimerRepository
 * Infrastructure implementation of IPomoTimerRepository using chrome.storage.local.
 * Wraps the existing pomodoroManager for timer state operations.
 */

import { pomodoroManager } from "../../core/pomodoroManager.js";
import type { IPomoTimerRepository } from "../../application/use-cases/pomodoro/TimerUseCase.js";
import type { PomoState } from "../../application/use-cases/pomodoro/TimerUseCase.js";

export class ChromeStoragePomoTimerRepository implements IPomoTimerRepository {
    async getState(): Promise<PomoState> {
        return pomodoroManager.getState() as Promise<PomoState>;
    }

    async saveState(state: PomoState): Promise<void> {
        return pomodoroManager.saveState(state as any);
    }

    onStateChanged(callback: (state: PomoState) => void): () => void {
        return pomodoroManager.onStateChanged(callback as any);
    }
}