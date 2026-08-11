import { useState, useEffect } from "preact/hooks";
import { translations } from "@/utils/i18n.js";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab.js";
import { AiSettingsTab } from "@/components/settings/AiSettingsTab.js";
import { SyncSettingsTab } from "@/components/settings/SyncSettingsTab.js";
import { KpssSettingsTab } from "@/components/settings/KpssSettingsTab.js";
import { DetoxSettingsTab } from "@/components/settings/DetoxSettingsTab.js";
import { useSettingsStore } from "@/presentation/store/settingsStore.js";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { useSyncStore } from "@/presentation/store/syncStore.js";
import { useTodosStore } from "@/presentation/store/todosStore.js";
import { useSidebarUsageStore } from "@/presentation/store/sidebarUsageStore.js";
import { kpssService } from "@/services/kpss/kpssService.js";

export interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "general" | "kpss" | "detox" | "ai" | "sync";
  onNotify?: (message: string) => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  initialTab,
  onNotify,
}: SettingsDrawerProps) {
  // Store selectors
  const lang = useSettingsStore((s) => s.lang);
  const onToggleLang = useSettingsStore((s) => s.handleToggleLang);
  const freeGamesNotificationsEnabled = useSettingsStore(
    (s) => s.freeGamesNotificationsEnabled,
  );
  const onToggleFreeGamesNotifications = useSettingsStore(
    (s) => s.handleToggleFreeGamesNotifications,
  );
  const calendarNotificationsEnabled = useSettingsStore(
    (s) => s.calendarNotificationsEnabled,
  );
  const onToggleCalendarNotifications = useSettingsStore(
    (s) => s.handleToggleCalendarNotifications,
  );
  const pomoBlockEnabled = useSettingsStore((s) => s.pomoBlockEnabled);
  const onTogglePomoBlock = useSettingsStore((s) => s.handleTogglePomoBlock);
  const universalInfoBoxEnabled = useSettingsStore(
    (s) => s.universalInfoBoxEnabled,
  );
  const onToggleUniversalInfoBox = useSettingsStore(
    (s) => s.handleToggleUniversalInfoBox,
  );
  const universalInfoBoxHotkey = useSettingsStore(
    (s) => s.universalInfoBoxHotkey,
  );
  const onUniversalInfoBoxHotkeyChange = useSettingsStore(
    (s) => s.handleUniversalInfoBoxHotkeyChange,
  );
  const whatsappBridgeEnabled = useSettingsStore(
    (s) => s.whatsappBridgeEnabled,
  );
  const onToggleWhatsappBridge = useSettingsStore(
    (s) => s.handleToggleWhatsappBridge,
  );
  const telegramBridgeEnabled = useSettingsStore(
    (s) => s.telegramBridgeEnabled,
  );
  const onToggleTelegramBridge = useSettingsStore(
    (s) => s.handleToggleTelegramBridge,
  );
  const autoGroupTabsEnabled = useSettingsStore(
    (s) => s.autoGroupTabsEnabled,
  );
  const onToggleAutoGroupTabs = useSettingsStore(
    (s) => s.handleToggleAutoGroupTabs,
  );
  // Sidebar auto-sort
  const sidebarAutoSortEnabled = useUIStore((s) => s.autoSortEnabled);
  const setAutoSortEnabled = useUIStore((s) => s.setAutoSortEnabled);
  const onToggleSidebarAutoSort = () => {
    void setAutoSortEnabled(!sidebarAutoSortEnabled);
  };
  const handleResetSidebarUsage = useSidebarUsageStore((s) => s.reset);
  const onResetSidebarUsage = async () => {
    await handleResetSidebarUsage();
    // Reset sonrası sidebar'ı varsayılana döndür
    const ui = useUIStore.getState();
    ui.applySortedOrder();
    if (onNotify) {
      onNotify(t.settings_sidebar_reset_done || "Kullanım istatistikleri temizlendi.");
    }
  };
  const aiApiKey = useSettingsStore((s) => s.aiApiKey);
  const aiModel = useSettingsStore((s) => s.aiModel);
  const aiEndpoint = useSettingsStore((s) => s.aiEndpoint);
  const onUpdateAIConfig = useSettingsStore((s) => s.handleUpdateAIConfig);
  const aiShowThinking = useSettingsStore((s) => s.aiShowThinking);
  const onUpdateAIShowThinking = useSettingsStore(
    (s) => s.handleUpdateAIShowThinking,
  );
  const kpssGoalType = useSettingsStore((s) => s.kpssGoalType);
  const kpssTargetNet = useSettingsStore((s) => s.kpssTargetNet);
  const kpssTargetScore = useSettingsStore((s) => s.kpssTargetScore);
  const onKpssGoalTypeChange = useSettingsStore(
    (s) => s.handleKpssGoalTypeChange,
  );
  const onKpssTargetNetChange = useSettingsStore(
    (s) => s.handleKpssTargetNetChange,
  );
  const onKpssTargetScoreChange = useSettingsStore(
    (s) => s.handleKpssTargetScoreChange,
  );
  const detoxLimits = useSettingsStore((s) => s.detoxLimits);
  const onDetoxLimitsChange = useSettingsStore(
    (s) => s.handleDetoxLimitsChange,
  );

  // UI store (sync-related + drawer state)
  const googleUserEmail = useUIStore((s) => s.googleUserEmail);
  const isSyncing = useUIStore((s) => s.isSyncing);
  const syncSettings = useUIStore((s) => s.syncSettings);
  const showAlert = useUIStore((s) => s.showAlert);
  const showConfirm = useUIStore((s) => s.showConfirm);

  const onGoogleLogin = useSyncStore((s) => s.handleGoogleLogin);
  const onGoogleLogout = useSyncStore((s) => s.handleGoogleLogout);
  const onBackupToGoogleDrive = useSyncStore((s) => s.handleBackupToGoogleDrive);
  const onRestoreFromGoogleDrive = useSyncStore(
    (s) => s.handleRestoreFromGoogleDrive,
  );
  const onExportBackup = useTodosStore((s) => s.handleExportBackup);
  const onImportBackup = useTodosStore((s) => s.handleImportBackup);
  const clearAllData = useSettingsStore((s) => s.handleClearAllData);

  const handleClearAllData = () => {
    showConfirm("Tüm veriler kalıcı olarak silinecek. Emin misiniz?", () => {
      void clearAllData();
    });
  };

  const handleResetKpssData = () => {
    showConfirm(
      "KPSS verileri sıfırlanacak. Bu işlem geri alınamaz. Emin misiniz?",
      async () => {
        await kpssService.resetAllKpssData();
        showAlert(translations[lang].alert_kpss_reset_success);
      },
    );
  };

  const t = translations[lang];
  const [settingsTab, setSettingsTab] = useState<
    "general" | "kpss" | "detox" | "ai" | "sync"
  >("general");

  useEffect(() => {
    if (isOpen && initialTab) {
      setSettingsTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-panel active" onClick={onClose}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()}>
        <header className="settings-header">
          <h2>{t.settings_title}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </header>

        {/* Settings Tab Headers */}
        <div className="settings-tabs">
          <button
            className={`settings-tab-btn ${settingsTab === "general" ? "active" : ""}`}
            onClick={() => setSettingsTab("general")}
          >
            {t.settings_tab_general}
          </button>
          <button
            className={`settings-tab-btn ${settingsTab === "kpss" ? "active" : ""}`}
            onClick={() => setSettingsTab("kpss")}
          >
            {t.settings_tab_kpss || "KPSS"}
          </button>
          <button
            className={`settings-tab-btn ${settingsTab === "detox" ? "active" : ""}`}
            onClick={() => setSettingsTab("detox")}
          >
            {t.settings_tab_detox || "Detox"}
          </button>
          <button
            className={`settings-tab-btn ${settingsTab === "ai" ? "active" : ""}`}
            onClick={() => setSettingsTab("ai")}
          >
            {t.settings_tab_ai}
          </button>
          <button
            className={`settings-tab-btn ${settingsTab === "sync" ? "active" : ""}`}
            onClick={() => setSettingsTab("sync")}
          >
            {t.settings_tab_sync}
          </button>
        </div>

        {/* TAB 1: GENERAL SETTINGS */}
        {settingsTab === "general" && (
          <GeneralSettingsTab
            lang={lang}
            t={t}
            onToggleLang={onToggleLang}
            freeGamesNotificationsEnabled={freeGamesNotificationsEnabled}
            onToggleFreeGamesNotifications={onToggleFreeGamesNotifications}
            calendarNotificationsEnabled={calendarNotificationsEnabled}
            onToggleCalendarNotifications={onToggleCalendarNotifications}
            pomoBlockEnabled={pomoBlockEnabled}
            onTogglePomoBlock={onTogglePomoBlock}
            universalInfoBoxEnabled={universalInfoBoxEnabled}
            onToggleUniversalInfoBox={onToggleUniversalInfoBox}
            universalInfoBoxHotkey={universalInfoBoxHotkey}
            onUniversalInfoBoxHotkeyChange={onUniversalInfoBoxHotkeyChange}
            whatsappBridgeEnabled={whatsappBridgeEnabled}
            onToggleWhatsappBridge={onToggleWhatsappBridge}
            telegramBridgeEnabled={telegramBridgeEnabled}
            onToggleTelegramBridge={onToggleTelegramBridge}
            autoGroupTabsEnabled={autoGroupTabsEnabled}
            onToggleAutoGroupTabs={onToggleAutoGroupTabs}
            sidebarAutoSortEnabled={sidebarAutoSortEnabled}
            onToggleSidebarAutoSort={onToggleSidebarAutoSort}
            onResetSidebarUsage={onResetSidebarUsage}
            onNotify={onNotify}
          />
        )}

        {/* TAB 2: KPSS SETTINGS */}
        {settingsTab === "kpss" && (
          <KpssSettingsTab
            t={t}
            kpssGoalType={kpssGoalType}
            kpssTargetNet={kpssTargetNet}
            kpssTargetScore={kpssTargetScore}
            onKpssGoalTypeChange={onKpssGoalTypeChange}
            onKpssTargetNetChange={onKpssTargetNetChange}
            onKpssTargetScoreChange={onKpssTargetScoreChange}
            onResetKpssData={handleResetKpssData}
          />
        )}

        {/* TAB 3: DETOX SETTINGS */}
        {settingsTab === "detox" && (
          <DetoxSettingsTab
            lang={lang}
            detoxLimits={detoxLimits}
            onDetoxLimitsChange={onDetoxLimitsChange}
          />
        )}

        {/* TAB 4: AI ASSISTANT SETTINGS */}
        {settingsTab === "ai" && (
          <AiSettingsTab
            t={t}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            aiEndpoint={aiEndpoint}
            onUpdateAIConfig={onUpdateAIConfig}
            aiShowThinking={aiShowThinking}
            onUpdateAIShowThinking={onUpdateAIShowThinking}
          />
        )}

        {/* TAB 5: GOOGLE CLOUD SYNC & BACKUP SETTINGS */}
        {settingsTab === "sync" && (
          <SyncSettingsTab
            t={t}
            lang={lang}
            googleUserEmail={googleUserEmail}
            isSyncing={isSyncing}
            syncSettings={syncSettings}
            onGoogleLogin={onGoogleLogin}
            onGoogleLogout={onGoogleLogout}
            onBackupToGoogleDrive={onBackupToGoogleDrive}
            onRestoreFromGoogleDrive={onRestoreFromGoogleDrive}
            onExportBackup={onExportBackup}
            onImportBackup={onImportBackup}
            onClearAllData={handleClearAllData}
          />
        )}
      </div>
    </div>
  );
}