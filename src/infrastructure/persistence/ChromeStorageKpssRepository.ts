/**
 * ChromeStorageKpssRepository
 * Infrastructure implementation of IKpssRepository using chrome.storage.sync
 * for KPSS progress and daily stats.
 */

import type { IKpssRepository } from "@/domain/repositories/IKpssRepository.js";
import type { KpssProgress, KpssDailyStats } from "@/types/types.js";
import {
  SYNC_KPSS_PROGRESS,
  SYNC_KPSS_DAILY_STATS,
  SYNC_KPSS_SRS,
  LOCAL_KPSS_PAST_QUIZZES,
} from "@/infrastructure/storage/keys.js";

const KPSS_PROGRESS_KEY = SYNC_KPSS_PROGRESS;
const KPSS_DAILY_STATS_KEY = SYNC_KPSS_DAILY_STATS;

export class ChromeStorageKpssRepository implements IKpssRepository {
  async getAllProgress(): Promise<KpssProgress[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([KPSS_PROGRESS_KEY], (result) => {
        resolve((result[KPSS_PROGRESS_KEY] as KpssProgress[]) || []);
      });
    });
  }

  async saveAllProgress(items: KpssProgress[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [KPSS_PROGRESS_KEY]: items }, resolve);
    });
  }

  async getAllDailyStats(): Promise<KpssDailyStats[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([KPSS_DAILY_STATS_KEY], (result) => {
        resolve((result[KPSS_DAILY_STATS_KEY] as KpssDailyStats[]) || []);
      });
    });
  }

  async saveAllDailyStats(items: KpssDailyStats[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [KPSS_DAILY_STATS_KEY]: items }, resolve);
    });
  }

  async removeAll(): Promise<void> {
    await new Promise<void>((resolve) => {
      chrome.storage.sync.remove(
        [
          KPSS_PROGRESS_KEY,
          KPSS_DAILY_STATS_KEY,
          SYNC_KPSS_SRS,
          "kpssGoalType",
          "kpssTargetNet",
          "kpssTargetScore",
        ],
        () => resolve(),
      );
    });
    await new Promise<void>((resolve) => {
      chrome.storage.local.remove([LOCAL_KPSS_PAST_QUIZZES], () => resolve());
    });
  }

  async savePastQuizzes(quizzes: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [LOCAL_KPSS_PAST_QUIZZES]: quizzes }, resolve);
    });
  }
}
