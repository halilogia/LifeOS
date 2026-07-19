/**
 * useSync Hook
 * Presentation hook that wraps Google Sync related state and use cases.
 * Currently wraps the existing App.tsx sync logic for future migration.
 */

import { useState, useCallback } from "preact/hooks";
import type { GoogleSyncSettings } from "../../domain/repositories/ISyncRepository.js";
import { ChromeStorageSyncRepository } from "../../infrastructure/persistence/ChromeStorageSyncRepository.js";
import { GoogleAuthApi } from "../../infrastructure/api/GoogleAuthApi.js";
import { GoogleTasksApi } from "../../infrastructure/api/GoogleTasksApi.js";
import { GoogleDriveApi } from "../../infrastructure/api/GoogleDriveApi.js";
import { ChromeStorageTodoRepository } from "../../infrastructure/persistence/ChromeStorageTodoRepository.js";
import { GoogleAuthUseCase } from "../../application/use-cases/sync/GoogleAuthUseCase.js";
import { SyncGoogleTasksUseCase } from "../../application/use-cases/sync/SyncGoogleTasksUseCase.js";
import { BackupToDriveUseCase } from "../../application/use-cases/sync/BackupToDriveUseCase.js";
import { RestoreFromDriveUseCase } from "../../application/use-cases/sync/RestoreFromDriveUseCase.js";

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
        createTask: (
            token: string,
            taskListId: string,
            task: any,
        ) => tasksApi.createTask(token, taskListId, task),
        updateTask: (
            token: string,
            taskListId: string,
            taskId: string,
            task: any,
        ) => tasksApi.updateTask(token, taskListId, taskId, task),
        deleteTask: (token: string, taskListId: string, taskId: string) =>
            tasksApi.deleteTask(token, taskListId, taskId),
        removeCachedAuthToken: (token: string) =>
            authApi.removeCachedAuthToken(token),
    };
}

export function useSync() {
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
                // Trigger initial sync after login
                await syncTasksUC.execute();
            }
        } finally {
            setIsSyncing(false);
        }
    }, []);

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
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const handleBackupToGoogleDrive = useCallback(async () => {
        setIsSyncing(true);
        try {
            await backupUC.execute();
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const handleRestoreFromGoogleDrive = useCallback(async () => {
        setIsSyncing(true);
        try {
            const result = await restoreUC.execute();
            return result;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    return {
        syncSettings,
        setSyncSettingsState,
        googleUserEmail,
        isSyncing,
        loadSyncSettings,
        handleGoogleLogin,
        handleGoogleLogout,
        handleManualSyncTasks,
        handleBackupToGoogleDrive,
        handleRestoreFromGoogleDrive,
    };
}