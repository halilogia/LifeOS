/**
 * useUI — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import { useUIStore } from "@/presentation/store/uiStore.js";

export function useUI() {
  const s = useUIStore;
  return {
    activeView: s((st) => st.activeView),
    setActiveView: s((st) => st.setActiveView),
    sidebarOrder: s((st) => st.sidebarOrder),
    setSidebarOrder: s((st) => st.setSidebarOrder),
    activeTab: s((st) => st.activeTab),
    setActiveTab: s((st) => st.setActiveTab),
    settingsOpen: s((st) => st.settingsOpen),
    setSettingsOpen: s((st) => st.setSettingsOpen),
    settingsInitialTab: s((st) => st.settingsInitialTab),
    clockText: s((st) => st.clockText),
    dateText: s((st) => st.dateText),
    quoteText: s((st) => st.quoteText),
    confirmDialog: s((st) => st.confirmDialog),
    setConfirmDialog: s((st) => st.setConfirmDialog),
    alertDialog: s((st) => st.alertDialog),
    setAlertDialog: s((st) => st.setAlertDialog),
    showConfirm: s((st) => st.showConfirm),
    showAlert: s((st) => st.showAlert),
    refreshClock: s((st) => st.refreshClock),
    refreshQuote: s((st) => st.refreshQuote),
    handleViewChange: s((st) => st.handleViewChange),
    handleTabChange: s((st) => st.handleTabChange),
    handleTabChangeUI: s((st) => st.handleTabChangeUI),
    handleOpenSettings: s((st) => st.handleOpenSettings),
    loadSidebarOrder: s((st) => st.loadSidebarOrder),
    googleUserEmail: s((st) => st.googleUserEmail),
    setGoogleUserEmail: s((st) => st.setGoogleUserEmail),
    isSyncing: s((st) => st.isSyncing),
    setIsSyncing: s((st) => st.setIsSyncing),
    syncSettings: s((st) => st.syncSettings),
    setSyncSettings: s((st) => st.setSyncSettings),
  };
}