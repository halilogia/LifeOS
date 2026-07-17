import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { GoogleSyncSettings } from "@/core/storage.js";

export interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToggleLang: () => void;
  freeGamesNotificationsEnabled: boolean;
  onToggleFreeGamesNotifications: () => void;
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
}

export function SettingsDrawer({
  isOpen,
  onClose,
  lang,
  onToggleLang,
  freeGamesNotificationsEnabled,
  onToggleFreeGamesNotifications,
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="settings-group">
              <h3 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", opacity: 0.8 }}>
                {lang === "tr" ? "Uygulama Ayarları" : "App Settings"}
              </h3>
              <div className="settings-actions">
                {/* Language Switch */}
                <button className="settings-action-btn" onClick={onToggleLang}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <span>{t.change_lang}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: "var(--accent-color)",
                    }}
                  >
                    {lang.toUpperCase()}
                  </span>
                </button>

                {/* Free Games Notifications Toggle */}
                <button
                  className="settings-action-btn"
                  onClick={onToggleFreeGamesNotifications}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>{t.free_games_notifications_title}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: freeGamesNotificationsEnabled
                        ? "var(--accent-color)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {freeGamesNotificationsEnabled ? t.enabled : t.disabled}
                  </span>
                </button>

                {/* Universal Info Box Toggle */}
                <button className="settings-action-btn" onClick={onToggleUniversalInfoBox}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>{t.uib_title}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: universalInfoBoxEnabled
                        ? "var(--accent-color)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {universalInfoBoxEnabled ? t.enabled : t.disabled}
                  </span>
                </button>

                {/* Universal Info Box Hotkey Selection */}
                {universalInfoBoxEnabled && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "6px",
                      margin: "2px 0 6px 0",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                      {t.uib_hotkey}:
                    </span>
                    <select
                      value={universalInfoBoxHotkey}
                      onChange={(e) =>
                        onUniversalInfoBoxHotkeyChange(
                          (e.target as HTMLSelectElement).value,
                        )
                      }
                      style={{
                        marginLeft: "auto",
                        background: "#1e1e24",
                        color: "#f1f5f9",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "0.85rem",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="none"
                      >
                        {t.uib_hotkey_none}
                      </option>
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="alt"
                      >
                        {t.uib_hotkey_alt}
                      </option>
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="ctrl"
                      >
                        {t.uib_hotkey_ctrl}
                      </option>
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="shift"
                      >
                        {t.uib_hotkey_shift}
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="settings-group">
              <h3 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", opacity: 0.8 }}>
                {lang === "tr" ? "Veri Yönetimi (Manuel)" : "Data Management (Manual)"}
              </h3>
              <div className="settings-actions">
                {/* Export Backup */}
                <button className="settings-action-btn" onClick={onExportBackup}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>{t.backup}</span>
                </button>

                {/* Import Backup */}
                <label
                  className="settings-action-btn"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span style={{ flex: 1 }}>{t.restore}</span>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={onImportBackup}
                  />
                </label>

                {/* Delete / Reset All */}
                <button
                  className="settings-action-btn danger"
                  onClick={onClearAllData}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>{t.clear_all}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI ASSISTANT SETTINGS */}
        {settingsTab === "ai" && (
          <div className="settings-group">
            <h3>{t.settings_ai_title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_provider}:</label>
                <select
                  value={aiProvider}
                  onChange={(e) => onUpdateAIConfig((e.target as HTMLSelectElement).value, aiApiKey, aiModel, aiEndpoint)}
                  style={{
                    background: "#1e1e24",
                    color: "#f1f5f9",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="gemini">Gemini API</option>
                  <option value="openrouter">OpenRouter API</option>
                  <option value="ollama">Ollama (Local / LAN)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_key}:</label>
                <input
                  type="password"
                  value={aiApiKey}
                  placeholder={aiProvider === "ollama" ? "Gerekli değil (Ollama)" : "sk-or-v1-... veya AIzaSy..."}
                  onInput={(e) => onUpdateAIConfig(aiProvider, (e.target as HTMLInputElement).value, aiModel, aiEndpoint)}
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#f1f5f9",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  {lang === "tr" ? "Özel API Adresi (Endpoint URL):" : "Custom API Endpoint URL:"}
                </label>
                <input
                  type="text"
                  value={aiEndpoint}
                  placeholder={
                    aiProvider === "openrouter" 
                      ? "https://openrouter.ai/api/v1" 
                      : aiProvider === "ollama"
                        ? "http://localhost:11434"
                        : "https://generativelanguage.googleapis.com"
                  }
                  onInput={(e) => onUpdateAIConfig(aiProvider, aiApiKey, aiModel, (e.target as HTMLInputElement).value)}
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#f1f5f9",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.6 }}>
                  {lang === "tr" 
                    ? "Örn: http://localhost:20120/v1 (9Router) veya http://192.168.1.100:11434 (LAN/Masaüstü Ollama)" 
                    : "e.g. http://localhost:20120/v1 (9Router) or http://192.168.1.100:11434 (LAN/Desktop Ollama)"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{t.settings_ai_model}:</label>
                <input
                  type="text"
                  value={aiModel}
                  placeholder={
                    aiProvider === "openrouter" 
                      ? "google/gemini-2.5-flash" 
                      : aiProvider === "ollama"
                        ? "llama3"
                        : "gemini-1.5-flash"
                  }
                  onInput={(e) => onUpdateAIConfig(aiProvider, aiApiKey, (e.target as HTMLInputElement).value, aiEndpoint)}
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#f1f5f9",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.6 }}>
                  {t.settings_ai_model_desc}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE CLOUD SYNC SETTINGS */}
        {settingsTab === "sync" && (
          <div className="settings-group">
            <h3>{t.google_sync_title}</h3>
            <div className="google-sync-card">
              {!googleUserEmail ? (
                <button className="google-sync-btn primary" onClick={onGoogleLogin} disabled={isSyncing}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  {t.google_sync_btn_login}
                </button>
              ) : (
                <>
                  <div className="google-account-info">
                    <div className="google-user-details">
                      <span className="google-user-label">{t.google_sync_connected_as}</span>
                      <span className="google-user-email">{googleUserEmail}</span>
                    </div>
                    <button className="google-sync-btn danger" onClick={onGoogleLogout} disabled={isSyncing} style={{ width: "auto", minWidth: "0" }}>
                      {t.google_sync_btn_logout}
                    </button>
                  </div>

                  <div className="google-sync-status-indicator" style={{ marginTop: "8px" }}>
                    <span className={`sync-dot ${isSyncing ? "syncing" : "synced"}`}></span>
                    <span>
                      {isSyncing ? (lang === "tr" ? "Senkronize ediliyor..." : "Syncing...") : t.google_sync_status_synced}
                    </span>
                  </div>

                  {syncSettings.lastSyncedBackup && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {t.google_sync_last_synced} {new Date(syncSettings.lastSyncedBackup).toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}
                    </div>
                  )}

                  <div className="google-sync-actions" style={{ marginTop: "12px" }}>
                    <button className="google-sync-btn" onClick={onBackupToGoogleDrive} disabled={isSyncing}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {t.google_sync_backup_now}
                    </button>
                    <button className="google-sync-btn" onClick={onRestoreFromGoogleDrive} disabled={isSyncing}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {t.google_sync_restore_now}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
