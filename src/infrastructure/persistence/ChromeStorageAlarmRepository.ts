/**
 * ChromeStorageAlarmRepository
 * Infrastructure implementation of IAlarmRepository using chrome.storage.sync
 * directly (not wrapping legacy pomodoroManager).
 */

import type {
  IAlarmRepository,
  AlarmItem,
} from "../../application/use-cases/pomodoro/AlarmUseCase.js";
import { SYNC_ALARMS } from "@/infrastructure/storage/keys.js";

const ALARM_STORAGE_KEY = SYNC_ALARMS;

type StateChangeCallback = (alarms: AlarmItem[]) => void;

export class ChromeStorageAlarmRepository implements IAlarmRepository {
  private listeners: Set<StateChangeCallback> = new Set();
  private boundOnChanged:
    | ((
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => void)
    | null = null;

  async getAll(): Promise<AlarmItem[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([ALARM_STORAGE_KEY], (result) => {
        resolve((result[ALARM_STORAGE_KEY] as AlarmItem[]) || []);
      });
    });
  }

  async saveAll(alarms: AlarmItem[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [ALARM_STORAGE_KEY]: alarms }, resolve);
    });
  }

  onChanged(callback: (alarms: AlarmItem[]) => void): () => void {
    this.listeners.add(callback);

    if (!this.boundOnChanged) {
      this.boundOnChanged = (changes, areaName) => {
        if (areaName === "sync" && changes[ALARM_STORAGE_KEY]) {
          const newAlarms = changes[ALARM_STORAGE_KEY].newValue as AlarmItem[];
          for (const listener of this.listeners) {
            listener(newAlarms);
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
