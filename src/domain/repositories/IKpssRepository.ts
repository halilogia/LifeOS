/**
 * IKpssRepository Interface
 * Repository pattern for KPSS data persistence (progress + daily stats).
 * Domain layer — pure interface, no external dependencies.
 */

import type { KpssProgress, KpssDailyStats } from "@/types/types.js";

export interface IKpssRepository {
  getAllProgress(): Promise<KpssProgress[]>;
  saveAllProgress(items: KpssProgress[]): Promise<void>;
  getAllDailyStats(): Promise<KpssDailyStats[]>;
  saveAllDailyStats(items: KpssDailyStats[]): Promise<void>;
  removeAll(): Promise<void>;
  /** Save/overwrite past quizzes map. */
  savePastQuizzes(quizzes: Record<string, unknown>): Promise<void>;
}
