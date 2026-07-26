/**
 * TimerUseCase
 * Application use case for Pomodoro timer operations.
 * Orchestrates the pomodoro timer state through storage.
 */

export interface PomoState {
  readonly mode: "focus" | "short" | "long";
  readonly running: boolean;
  readonly timeLeft: number;
  readonly totalTime: number;
  readonly endTime: number;
}

export interface IPomoTimerRepository {
  getState(): Promise<PomoState>;
  saveState(state: PomoState): Promise<void>;
  onStateChanged(callback: (state: PomoState) => void): () => void;
}

export class TimerUseCase {
  constructor(private timerRepo: IPomoTimerRepository) {}

  async getState(): Promise<PomoState> {
    return this.timerRepo.getState();
  }

  async start(
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
    await this.timerRepo.saveState(newState);
    return newState;
  }

  async pause(timeLeft: number): Promise<PomoState> {
    const state = await this.timerRepo.getState();
    const newState: PomoState = {
      ...state,
      running: false,
      timeLeft,
      endTime: 0,
    };
    await this.timerRepo.saveState(newState);
    return newState;
  }

  async reset(
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
    await this.timerRepo.saveState(newState);
    return newState;
  }

  onStateChanged(callback: (state: PomoState) => void): () => void {
    return this.timerRepo.onStateChanged(callback);
  }
}
