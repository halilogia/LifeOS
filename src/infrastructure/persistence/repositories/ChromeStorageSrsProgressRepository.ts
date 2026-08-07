/**
 * ChromeStorageSrsProgressRepository
 * Infrastructure implementation of ISrsProgressRepository using chrome.storage.local
 * for KPSS SRS flashcard progress data + AI cards.
 */

import type { ISrsProgressRepository } from "@/domain/repositories/ISrsProgressRepository.js";
import type { KpssFlashcard } from "@/services/kpss/kpssService.js";
import { SYNC_KPSS_SRS } from "@/infrastructure/storage/keys.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const SRS_KEY = SYNC_KPSS_SRS;
const AI_CARDS_KEY = "kpssAiSrsCards";

export class ChromeStorageSrsProgressRepository implements ISrsProgressRepository {
  async getAll(): Promise<Record<string, unknown>[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([SRS_KEY], (res) => {
        resolve((res[SRS_KEY] as Record<string, unknown>[]) || []);
      });
    });
  }

  async saveAll(items: Record<string, unknown>[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SRS_KEY]: items }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  }

  async getAiCards(): Promise<KpssFlashcard[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([AI_CARDS_KEY], (res) => {
        resolve((res[AI_CARDS_KEY] as KpssFlashcard[]) || []);
      });
    });
  }

  async saveAiCards(cards: KpssFlashcard[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [AI_CARDS_KEY]: cards }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  }
}
