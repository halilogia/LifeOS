/**
 * useSettings — facade over the Zustand singleton store.
 * Signature unchanged; consumer components untouched.
 */

import { useSettingsStore } from "@/presentation/store/settingsStore.js";

export function useSettings() {
  const s = useSettingsStore;

  return {
    // State
    lang: s((st) => st.lang),
    setLangState: s((st) => st.setLangState),
    sidebarOpen: s((st) => st.sidebarOpen),
    setSidebarOpenState: s((st) => st.setSidebarOpenState),
    freeGamesNotificationsEnabled: s((st) => st.freeGamesNotificationsEnabled),
    calendarNotificationsEnabled: s((st) => st.calendarNotificationsEnabled),
    pomoBlockEnabled: s((st) => st.pomoBlockEnabled),
    universalInfoBoxEnabled: s((st) => st.universalInfoBoxEnabled),
    universalInfoBoxHotkey: s((st) => st.universalInfoBoxHotkey),
    whatsappBridgeEnabled: s((st) => st.whatsappBridgeEnabled),
    telegramBridgeEnabled: s((st) => st.telegramBridgeEnabled),
    autoGroupTabsEnabled: s((st) => st.autoGroupTabsEnabled),
    aiProvider: s((st) => st.aiProvider),
    aiApiKey: s((st) => st.aiApiKey),
    aiModel: s((st) => st.aiModel),
    aiEndpoint: s((st) => st.aiEndpoint),
    aiShowThinking: s((st) => st.aiShowThinking),
    kpssGoalType: s((st) => st.kpssGoalType),
    kpssTargetNet: s((st) => st.kpssTargetNet),
    kpssTargetScore: s((st) => st.kpssTargetScore),
    detoxLimits: s((st) => st.detoxLimits),
    // Actions
    loadSettings: s((st) => st.loadSettings),
    handleToggleLang: s((st) => st.handleToggleLang),
    handleSidebarToggle: s((st) => st.handleSidebarToggle),
    handleToggleFreeGamesNotifications: s((st) => st.handleToggleFreeGamesNotifications),
    handleToggleCalendarNotifications: s((st) => st.handleToggleCalendarNotifications),
    handleTogglePomoBlock: s((st) => st.handleTogglePomoBlock),
    handleToggleUniversalInfoBox: s((st) => st.handleToggleUniversalInfoBox),
    handleUniversalInfoBoxHotkeyChange: s((st) => st.handleUniversalInfoBoxHotkeyChange),
    handleToggleWhatsappBridge: s((st) => st.handleToggleWhatsappBridge),
    handleToggleTelegramBridge: s((st) => st.handleToggleTelegramBridge),
    handleToggleAutoGroupTabs: s((st) => st.handleToggleAutoGroupTabs),
    handleClearAllData: s((st) => st.handleClearAllData),
    handleUpdateAIConfig: s((st) => st.handleUpdateAIConfig),
    handleUpdateAIShowThinking: s((st) => st.handleUpdateAIShowThinking),
    handleKpssGoalTypeChange: s((st) => st.handleKpssGoalTypeChange),
    handleKpssTargetNetChange: s((st) => st.handleKpssTargetNetChange),
    handleKpssTargetScoreChange: s((st) => st.handleKpssTargetScoreChange),
    handleDetoxLimitsChange: s((st) => st.handleDetoxLimitsChange),
  };
}