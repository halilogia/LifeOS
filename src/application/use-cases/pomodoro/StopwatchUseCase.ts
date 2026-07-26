/**
 * StopwatchUseCase
 * Application use case for stopwatch operations.
 * Orchestrates the stopwatch state through storage.
 */

export interface StopwatchState {
  readonly running: boolean;
  readonly time: number;
  readonly startTime: number;
}

export interface IStopwatchRepository {
  getState(): Promise<StopwatchState>;
  saveState(state: StopwatchState): Promise<void>;
  onStateChanged(callback: (state: StopwatchState) => void): () => void;
}

export class StopwatchUseCase {
  constructor(private stopwatchRepo: IStopwatchRepository) {}

  async getState(): Promise<StopwatchState> {
    return this.stopwatchRepo.getState();
  }

  async start(time: number): Promise<StopwatchState> {
    const newState: StopwatchState = {
      running: true,
      time,
      startTime: Date.now(),
    };
    await this.stopwatchRepo.saveState(newState);
    return newState;
  }

  async pause(time: number): Promise<StopwatchState> {
    const newState: StopwatchState = {
      running: false,
      time,
      startTime: 0,
    };
    await this.stopwatchRepo.saveState(newState);
    return newState;
  }

  async reset(): Promise<StopwatchState> {
    const newState: StopwatchState = {
      running: false,
      time: 0,
      startTime: 0,
    };
    await this.stopwatchRepo.saveState(newState);
    return newState;
  }

  onStateChanged(callback: (state: StopwatchState) => void): () => void {
    return this.stopwatchRepo.onStateChanged(callback);
  }
}
