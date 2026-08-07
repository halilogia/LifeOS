/**
 * useSync store
 * Zustand singleton — Google Sync orchestration (login/logout/manual sync/Drive backup).
 * Sync *state* (syncSettings, googleUserEmail, isSyncing) lives in uiStore; these actions
 * read/write it via getState. Side effects surface through uiStore.showAlert.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/repositories/ChromeStorageTodoRepository.js";
import { ChromeStorageSyncRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSyncRepository.js";
import { GoogleDriveApi } from "@/infrastructure/api/GoogleDriveApi.js";
import { GoogleAuthUseCase } from "@/application/use-cases/sync/GoogleAuthUseCase.js";
import { SyncGoogleTasksUseCase } from "@/application/use-cases/sync/SyncGoogleTasksUseCase.js";
import { BackupToDriveUseCase } from "@/application/use-cases/sync/BackupToDriveUseCase.js";
import { RestoreFromDriveUseCase } from "@/application/use-cases/sync/RestoreFromDriveUseCase.js";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { logger } from "@/utils/logger.js";
import { createSyncPort } from "@/application/ports/createSyncPort.js";

const syncRepo = new ChromeStorageSyncRepository();
const todoRepo = new ChromeStorageTodoRepository();
const syncPort: ReturnType<typeof createSyncPort> = createSyncPort();

const authUC = new GoogleAuthUseCase(syncRepo, syncPort);
const syncTasksUC = new SyncGoogleTasksUseCase(todoRepo, syncRepo, syncPort);
const driveApi = new GoogleDriveApi();
const backupUC = new BackupToDriveUseCase(syncRepo, driveApi, todoRepo);
const restoreUC = new RestoreFromDriveUseCase(syncRepo, driveApi, todoRepo);

export interface UseSyncLabels {
  errorLabel?: string;
  detailLabel?: string;
  successBackupLabel?: string;
  successRestoreLabel?: string;
  noBackupLabel?: string;
}

interface SyncState {
  labels: UseSyncLabels;
  setLabels: (l: UseSyncLabels) => void;
  loadSyncSettings: () => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleGoogleLogout: () => Promise<void>;
  handleManualSyncTasks: () => Promise<void>;
  handleBackupToGoogleDrive: () => Promise<void>;
  handleRestoreFromGoogleDrive: () => Promise<void>;
  triggerCloudBackup: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()((set, get) => ({
  labels: {},
  setLabels: (l) => set({ labels: l }),

  loadSyncSettings: async () => {
    const settings = await syncRepo.getSyncSettings();
    const ui = useUIStore.getState();
    ui.setSyncSettings(settings);
    if (settings.userEmail) {
      ui.setGoogleUserEmail(settings.userEmail);
    }
  },

  handleGoogleLogin: async () => {
    const ui = useUIStore.getState();
    const { errorLabel = "Sync error", detailLabel = "Detail" } = get().labels;
    ui.setIsSyncing(true);
    try {
      const result = await authUC.login();
      if (result.success && result.email) {
        ui.setGoogleUserEmail(result.email);
        const settings = await syncRepo.getSyncSettings();
        ui.setSyncSettings(settings);
        await syncTasksUC.execute();
      } else if (!result.success) {
        const errMsg = result.error ?? "Unknown error";
        ui.showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Google sign in failed:", e);
      ui.showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
    } finally {
      ui.setIsSyncing(false);
    }
  },

  handleGoogleLogout: async () => {
    const ui = useUIStore.getState();
    ui.setIsSyncing(true);
    try {
      await authUC.logout();
      ui.setGoogleUserEmail("");
      ui.setSyncSettings({
        enabled: false,
        tasksEnabled: false,
        calendarEnabled: false,
      });
    } finally {
      ui.setIsSyncing(false);
    }
  },

  handleManualSyncTasks: async () => {
    const ui = useUIStore.getState();
    const { errorLabel = "Sync error", detailLabel = "Detail" } = get().labels;
    ui.setIsSyncing(true);
    try {
      await syncTasksUC.execute();
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Manual task sync failed:", e);
      ui.showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
    } finally {
      ui.setIsSyncing(false);
    }
  },

  handleBackupToGoogleDrive: async () => {
    const ui = useUIStore.getState();
    const {
      errorLabel = "Sync error",
      detailLabel = "Detail",
      successBackupLabel,
    } = get().labels;
    ui.setIsSyncing(true);
    try {
      await backupUC.execute();
      const current = await syncRepo.getSyncSettings();
      const updated = { ...current, lastSyncedBackup: Date.now() };
      await syncRepo.setSyncSettings(updated);
      ui.setSyncSettings(updated);
      if (successBackupLabel) {
        ui.showAlert(successBackupLabel);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Manual backup failed:", e);
      ui.showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
    } finally {
      ui.setIsSyncing(false);
    }
  },

  handleRestoreFromGoogleDrive: async () => {
    const ui = useUIStore.getState();
    const {
      errorLabel = "Sync error",
      detailLabel = "Detail",
      successRestoreLabel,
      noBackupLabel,
    } = get().labels;
    ui.setIsSyncing(true);
    try {
      const result = await restoreUC.execute();
      if (result.restored) {
        if (successRestoreLabel) {
          ui.showAlert(successRestoreLabel, () => window.location.reload());
        }
      } else if (noBackupLabel) {
        ui.showAlert(noBackupLabel);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Restore failed:", e);
      ui.showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
    } finally {
      ui.setIsSyncing(false);
    }
  },

  triggerCloudBackup: async () => {
    const settings = await syncRepo.getSyncSettings();
    if (settings.enabled) {
      try {
        await backupUC.execute();
        logger.log("Cloud auto-backup completed successfully.");
      } catch (e) {
        logger.error("Auto cloud backup failed:", e);
      }
    }
  },
}));