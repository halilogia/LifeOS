import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { GoogleSyncSettings } from "@/core/storage.js";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab.js";
import { AiSettingsTab } from "@/components/settings/AiSettingsTab.js";
import { SyncSettingsTab } from "@/components/settings/SyncSettingsTab.js";

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
  onExportBackup: () => void;
  onImportBackup: (e: any) => void;
  onClearAllData: () => void;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  onUpdateAIConfig: (provider: string, key: string, model: string, endpoint?: string) => void;
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
  detoxLimits: Record<string, number>;
  onDetoxLimitsChange: (limits: Record<string, number>) => void;
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
  onExportBackup,
  onImportBackup,
  onClearAllData,
  aiProvider,
  aiApiKey,
  aiModel,
  aiEndpoint,
  onUpdateAIConfig,
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
  detoxLimits,
  onDetoxLimitsChange,
}: SettingsDrawerProps) {
  const t = translations[lang];
  const [settingsTab, setSettingsTab] = useState<"general" | "ai" | "sync">("general");

  if (!isOpen) return null;

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
            kpssGoalType={kpssGoalType}
            kpssTargetNet={kpssTargetNet}
            kpssTargetScore={kpssTargetScore}
            onKpssGoalTypeChange={onKpssGoalTypeChange}
            onKpssTargetNetChange={onKpssTargetNetChange}
            onKpssTargetScoreChange={onKpssTargetScoreChange}
            detoxLimits={detoxLimits}
            onDetoxLimitsChange={onDetoxLimitsChange}
            onExportBackup={onExportBackup}
            onImportBackup={onImportBackup}
            onClearAllData={onClearAllData}
          />
        )}

        {/* TAB 2: AI ASSISTANT SETTINGS */}
        {settingsTab === "ai" && (
          <AiSettingsTab
            t={t}
            lang={lang}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            aiEndpoint={aiEndpoint}
            onUpdateAIConfig={onUpdateAIConfig}
          />
        )}

        {/* TAB 3: GOOGLE CLOUD SYNC SETTINGS */}
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
          />
        )}
      </div>
    </div>
  );
}
