import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import type { GoogleSyncSettings } from "@/domain/repositories/ISyncRepository.js";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab.js";
import { AiSettingsTab } from "@/components/settings/AiSettingsTab.js";
import { SyncSettingsTab } from "@/components/settings/SyncSettingsTab.js";
import { KpssSettingsTab } from "@/components/settings/KpssSettingsTab.js";
import { DetoxSettingsTab } from "@/components/settings/DetoxSettingsTab.js";

export interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToggleLang: () => void;
  freeGamesNotificationsEnabled: boolean;
  onToggleFreeGamesNotifications: () => void;
  calendarNotificationsEnabled: boolean;
  onToggleCalendarNotifications: () => void;
  pomoBlockEnabled: boolean;
  onTogglePomoBlock: () => void;
  universalInfoBoxEnabled: boolean;
  onToggleUniversalInfoBox: () => void;
  universalInfoBoxHotkey: string;
  onUniversalInfoBoxHotkeyChange: (hotkey: string) => void;
  autoGroupTabsEnabled?: boolean;
  onToggleAutoGroupTabs?: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: any) => void;
  onClearAllData: () => void;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  onUpdateAIConfig: (
    provider: string,
    key: string,
    model: string,
    endpoint?: string,
  ) => void;
  aiShowThinking: boolean;
  onUpdateAIShowThinking: (val: boolean) => void;
  googleUserEmail: string;
  isSyncing: boolean;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  syncSettings: GoogleSyncSettings;
  onBackupToGoogleDrive: () => void;
  onRestoreFromGoogleDrive: () => void;
  kpssGoalType: "net" | "score";
  kpssTargetNet: number;
  kpssTargetScore: number;
  onKpssGoalTypeChange: (type: "net" | "score") => void;
  onKpssTargetNetChange: (val: number) => void;
  onKpssTargetScoreChange: (val: number) => void;
  onResetKpssData?: () => void;
  detoxLimits: Record<string, number>;
  onDetoxLimitsChange: (limits: Record<string, number>) => void;
  initialTab?: "general" | "kpss" | "detox" | "ai" | "sync";
}

export function SettingsDrawer({
  isOpen,
  onClose,
  lang,
  onToggleLang,
  freeGamesNotificationsEnabled,
  onToggleFreeGamesNotifications,
  calendarNotificationsEnabled,
  onToggleCalendarNotifications,
  pomoBlockEnabled,
  onTogglePomoBlock,
  universalInfoBoxEnabled,
  onToggleUniversalInfoBox,
  universalInfoBoxHotkey,
  onUniversalInfoBoxHotkeyChange,
  autoGroupTabsEnabled,
  onToggleAutoGroupTabs,
  onExportBackup,
  onImportBackup,
  onClearAllData,
  aiApiKey,
  aiModel,
  aiEndpoint,
  onUpdateAIConfig,
  aiShowThinking,
  onUpdateAIShowThinking,
  googleUserEmail,
  isSyncing,
  onGoogleLogin,
  onGoogleLogout,
  syncSettings,
  onBackupToGoogleDrive,
  onRestoreFromGoogleDrive,
  kpssGoalType,
  kpssTargetNet,
  kpssTargetScore,
  onKpssGoalTypeChange,
  onKpssTargetNetChange,
  onKpssTargetScoreChange,
  onResetKpssData,
  detoxLimits,
  onDetoxLimitsChange,
  initialTab,
}: SettingsDrawerProps) {
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
            autoGroupTabsEnabled={autoGroupTabsEnabled}
            onToggleAutoGroupTabs={onToggleAutoGroupTabs}
          />
        )}

        {/* TAB 2: KPSS SETTINGS */}
        {settingsTab === "kpss" && (
          <KpssSettingsTab
            lang={lang}
            t={t}
            kpssGoalType={kpssGoalType}
            kpssTargetNet={kpssTargetNet}
            kpssTargetScore={kpssTargetScore}
            onKpssGoalTypeChange={onKpssGoalTypeChange}
            onKpssTargetNetChange={onKpssTargetNetChange}
            onKpssTargetScoreChange={onKpssTargetScoreChange}
            onResetKpssData={onResetKpssData}
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
            onClearAllData={onClearAllData}
          />
        )}
      </div>
    </div>
  );
}
