/**
 * ChromeStorageSrsProgressRepository
 * Infrastructure implementation of ISrsProgressRepository using chrome.storage.sync
 * for KPSS SRS flashcard progress data.
 */

import type { ISrsProgressRepository } from "@/domain/repositories/ISrsProgressRepository.js";
import { SYNC_KPSS_SRS } from "@/infrastructure/storage/keys.js";

const SRS_KEY = SYNC_KPSS_SRS;

export class ChromeStorageSrsProgressRepository implements ISrsProgressRepository {
  async getAll(): Promise<Record<string, unknown>[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([SRS_KEY], (res) => {
        resolve((res[SRS_KEY] as Record<string, unknown>[]) || []);
      });
    });
  }

  async saveAll(items: Record<string, unknown>[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [SRS_KEY]: items }, resolve);
    });
  }
}
