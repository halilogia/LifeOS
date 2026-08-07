/**
 * useSync — facade over the Zustand singleton store.
 * Signature accepts the same option labels as before; they are forwarded to the store.
 * Consumer components are untouched.
 */

import { useEffect } from "preact/hooks";
import { useSyncStore } from "@/presentation/store/syncStore.js";
import type { UseSyncLabels } from "@/presentation/store/syncStore.js";

export function useSync(options: UseSyncLabels = {}) {
  const s = useSyncStore;

  useEffect(() => {
    useSyncStore.getState().setLabels(options);
  }, [options.errorLabel, options.detailLabel, options.successBackupLabel, options.successRestoreLabel, options.noBackupLabel]);

  return {
    loadSyncSettings: s((st) => st.loadSyncSettings),
    handleGoogleLogin: s((st) => st.handleGoogleLogin),
    handleGoogleLogout: s((st) => st.handleGoogleLogout),
    handleManualSyncTasks: s((st) => st.handleManualSyncTasks),
    handleBackupToGoogleDrive: s((st) => st.handleBackupToGoogleDrive),
    handleRestoreFromGoogleDrive: s((st) => st.handleRestoreFromGoogleDrive),
    handleExportBackup: s((st) => st.handleBackupToGoogleDrive),
    handleImportBackup: s((st) => st.handleRestoreFromGoogleDrive),
    triggerCloudBackup: s((st) => st.triggerCloudBackup),
  };
}