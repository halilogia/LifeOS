/**
 * ChromeStorageSyncRepository
 * Infrastructure implementation of ISyncRepository using chrome.storage.sync
 * directly (not wrapping legacy storage.ts).
 */

import type {
  ISyncRepository,
  GoogleSyncSettings,
} from "../../../domain/repositories/ISyncRepository.js";
import { SYNC_SETTINGS } from "@/infrastructure/storage/keys.js";

export class ChromeStorageSyncRepository implements ISyncRepository {
  async getSyncSettings(): Promise<GoogleSyncSettings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([SYNC_SETTINGS], (result) => {
        const settings = result[SYNC_SETTINGS] as
          GoogleSyncSettings | undefined;
        resolve(
          settings ?? {
            enabled: false,
            tasksEnabled: false,
            calendarEnabled: false,
          },
        );
      });
    });
  }

  async setSyncSettings(settings: GoogleSyncSettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [SYNC_SETTINGS]: settings }, resolve);
    });
  }
}
