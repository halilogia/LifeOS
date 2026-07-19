/**
 * ChromeStorageAlarmRepository
 * Infrastructure implementation of IAlarmRepository using chrome.storage.local.
 * Wraps the existing pomodoroManager for alarm operations.
 */

import { pomodoroManager } from "../../core/pomodoroManager.js";
import type { IAlarmRepository } from "../../application/use-cases/pomodoro/AlarmUseCase.js";
import type { AlarmItem } from "../../application/use-cases/pomodoro/AlarmUseCase.js";

export class ChromeStorageAlarmRepository implements IAlarmRepository {
    async getAll(): Promise<AlarmItem[]> {
        return pomodoroManager.getAlarms() as Promise<AlarmItem[]>;
    }

    async saveAll(alarms: AlarmItem[]): Promise<void> {
        return pomodoroManager.saveAlarms(alarms as any);
    }

    onChanged(callback: (alarms: AlarmItem[]) => void): () => void {
        return pomodoroManager.onAlarmsChanged(callback as any);
    }
}