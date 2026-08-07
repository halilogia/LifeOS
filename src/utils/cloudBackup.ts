/**
 * cloudBackup.ts
 * Debounced cloud backup trigger shared across ALL feature stores/hooks.
 *
 * Why: Drive backup is a full snapshot (chrome.storage.local.get(null)).
 * Firing it on every mutation (todos, notes, KPSS, quotes…) would spam the
 * Drive API and upload the whole 10MB quota repeatedly. Debounce collapses
 * rapid mutations into a single backup.
 *
 * Transient keys excluded from the snapshot so the backup file only carries
 * real user data (not 5-min caches / log ring buffers).
 */

import { BackupToDriveUseCase } from "@/application/use-cases/sync/BackupToDriveUseCase.js";
import { ChromeStorageSyncRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSyncRepository.js";
import { GoogleDriveApi } from "@/infrastructure/api/GoogleDriveApi.js";
import { logger } from "@/utils/logger.js";

const syncRepo = new ChromeStorageSyncRepository();
const backupUC = new BackupToDriveUseCase(syncRepo, new GoogleDriveApi());

/** Geçici/cache veriler — yedek dosyasına girmesin. */
const TRANSIENT_KEYS = new Set([
  "logger_entries",
  "bistStockCache",
  "kapNewsCache",
  "free_games_cache",
  "epic_history_cache",
]);

const DEBOUNCE_MS = 5_000;
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;

/** Snapshot'tan geçici key'leri ayıklar. */
export function stripTransientKeys(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (!TRANSIENT_KEYS.has(k) && !k.startsWith("prayer_calendar_")) {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

/** Debounce'lu otomatik backup: 5sn içinde tek sefer. */
export function scheduleCloudBackup(): void {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    timer = null;
    void runCloudBackup();
  }, DEBOUNCE_MS);
}

/** Anında (manuel buton gibi) backup — debounce beklemez. */
export async function runCloudBackup(force = false): Promise<void> {
  if (inFlight) {
    return inFlight;
  }
  inFlight = (async () => {
    try {
      const settings = await syncRepo.getSyncSettings();
      if (!settings.enabled && !force) {
        return;
      }
      await backupUC.execute();
      logger.log("Cloud auto-backup completed successfully.");
    } catch (e) {
      logger.error("Auto cloud backup failed:", e);
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
