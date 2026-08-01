/**
 * useSync Hook
 * Presentation hook that wraps Google Sync related state and use cases.
 * Accepts showAlert + translations so it can surface errors to the user.
 */

import { useState, useCallback } from "preact/hooks";
import type { GoogleSyncSettings } from "@/domain/repositories/ISyncRepository.js";
import type { RemoteTask } from "@/application/ports/ITodoSyncPort.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/ChromeStorageTodoRepository.js";
import { ChromeStorageSyncRepository } from "@/infrastructure/persistence/ChromeStorageSyncRepository.js";
import { GoogleAuthApi } from "@/infrastructure/api/GoogleAuthApi.js";
import { GoogleTasksApi } from "@/infrastructure/api/GoogleTasksApi.js";
import { GoogleDriveApi } from "@/infrastructure/api/GoogleDriveApi.js";
import { GoogleAuthUseCase } from "@/application/use-cases/sync/GoogleAuthUseCase.js";
import { SyncGoogleTasksUseCase } from "@/application/use-cases/sync/SyncGoogleTasksUseCase.js";
import { BackupToDriveUseCase } from "@/application/use-cases/sync/BackupToDriveUseCase.js";
import { RestoreFromDriveUseCase } from "@/application/use-cases/sync/RestoreFromDriveUseCase.js";
import { logger } from "@/utils/logger.js";

function createSyncPort() {
  const tasksApi = new GoogleTasksApi();
  const authApi = new GoogleAuthApi();
  return {
    getAuthToken: (interactive: boolean) => authApi.getAuthToken(interactive),
    getUserEmail: (token: string) => authApi.getUserEmail(token),
    getOrCreateTaskList: (token: string, title: string) =>
      tasksApi.getOrCreateTaskList(token, title),
    getTasks: (token: string, taskListId: string) =>
      tasksApi.getTasks(token, taskListId),
    createTask: (token: string, taskListId: string, task: RemoteTask) =>
      tasksApi.createTask(token, taskListId, task),
    updateTask: (
      token: string,
      taskListId: string,
      taskId: string,
      task: RemoteTask,
    ) => tasksApi.updateTask(token, taskListId, taskId, task),
    deleteTask: (token: string, taskListId: string, taskId: string) =>
      tasksApi.deleteTask(token, taskListId, taskId),
    removeCachedAuthToken: (token: string) =>
      authApi.removeCachedAuthToken(token),
  };
}

export interface UseSyncOptions {
  showAlert?: (message: string, onConfirm?: () => void) => void;
  errorLabel?: string; // e.g. translations[lang].google_sync_error
  detailLabel?: string; // e.g. "Detay" or "Detail"
  successBackupLabel?: string;
  successRestoreLabel?: string;
  noBackupLabel?: string;
}

export function useSync(options: UseSyncOptions = {}) {
  const {
    showAlert,
    errorLabel = "Sync error",
    detailLabel = "Detail",
    successBackupLabel,
    successRestoreLabel,
    noBackupLabel,
  } = options;

  const [syncSettings, setSyncSettingsState] = useState<GoogleSyncSettings>({
    enabled: false,
    tasksEnabled: false,
    calendarEnabled: false,
  });
  const [googleUserEmail, setGoogleUserEmail] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  const syncRepo = new ChromeStorageSyncRepository();
  const todoRepo = new ChromeStorageTodoRepository();
  const driveApi = new GoogleDriveApi();
  const syncPort = createSyncPort();

  const authUC = new GoogleAuthUseCase(syncRepo, syncPort);
  const syncTasksUC = new SyncGoogleTasksUseCase(todoRepo, syncRepo, syncPort);
  const backupUC = new BackupToDriveUseCase(syncRepo, driveApi, todoRepo);
  const restoreUC = new RestoreFromDriveUseCase(syncRepo, driveApi, todoRepo);

  const loadSyncSettings = useCallback(async () => {
    const settings = await syncRepo.getSyncSettings();
    setSyncSettingsState(settings);
    if (settings.userEmail) {
      setGoogleUserEmail(settings.userEmail);
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await authUC.login();
      if (result.success && result.email) {
        setGoogleUserEmail(result.email);
        const settings = await syncRepo.getSyncSettings();
        setSyncSettingsState(settings);
        await syncTasksUC.execute();
      } else if (!result.success && showAlert) {
        const errMsg = result.error ?? "Unknown error";
        showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Google sign in failed:", e);
      if (showAlert) {
        showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [showAlert, errorLabel, detailLabel]);

  const handleGoogleLogout = useCallback(async () => {
    setIsSyncing(true);
    try {
      await authUC.logout();
      setGoogleUserEmail("");
      setSyncSettingsState({
        enabled: false,
        tasksEnabled: false,
        calendarEnabled: false,
      });
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleManualSyncTasks = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncTasksUC.execute();
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Manual task sync failed:", e);
      if (showAlert) {
        showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [showAlert, errorLabel, detailLabel]);

  const handleBackupToGoogleDrive = useCallback(async () => {
    setIsSyncing(true);
    try {
      await backupUC.execute();
      // Update lastSyncedBackup timestamp
      const current = await syncRepo.getSyncSettings();
      const updated = { ...current, lastSyncedBackup: Date.now() };
      await syncRepo.setSyncSettings(updated);
      setSyncSettingsState(updated);
      if (showAlert && successBackupLabel) {
        showAlert(successBackupLabel);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Manual backup failed:", e);
      if (showAlert) {
        showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [showAlert, errorLabel, detailLabel, successBackupLabel]);

  const handleRestoreFromGoogleDrive = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await restoreUC.execute();
      if (result.restored) {
        if (showAlert && successRestoreLabel) {
          showAlert(successRestoreLabel, () => window.location.reload());
        }
      } else {
        if (showAlert && noBackupLabel) {
          showAlert(noBackupLabel);
        }
      }
      return result;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logger.error("Restore failed:", e);
      if (showAlert) {
        showAlert(`${errorLabel}\n\n[${detailLabel}]: ${errMsg}`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [showAlert, errorLabel, detailLabel, successRestoreLabel, noBackupLabel]);

  const triggerCloudBackup = useCallback(async () => {
    const settings = await syncRepo.getSyncSettings();
    if (settings.enabled) {
      try {
        await backupUC.execute();
        logger.log("Cloud auto-backup completed successfully.");
      } catch (e) {
        logger.error("Auto cloud backup failed:", e);
      }
    }
  }, []);

  return {
    syncSettings,
    setSyncSettingsState,
    googleUserEmail,
    setGoogleUserEmail,
    isSyncing,
    loadSyncSettings,
    handleGoogleLogin,
    handleGoogleLogout,
    handleManualSyncTasks,
    handleBackupToGoogleDrive,
    handleRestoreFromGoogleDrive,
    // Aliases for App.tsx destructuring
    handleExportBackup: handleBackupToGoogleDrive,
    handleImportBackup: handleRestoreFromGoogleDrive,
    triggerCloudBackup,
  };
}
