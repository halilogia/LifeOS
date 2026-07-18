import { Language } from "@/types/types.js";
import { GoogleSyncSettings } from "@/core/storage.js";

interface SyncSettingsTabProps {
  t: any;
  lang: Language;
  googleUserEmail: string;
  isSyncing: boolean;
  syncSettings: GoogleSyncSettings;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onBackupToGoogleDrive: () => void;
  onRestoreFromGoogleDrive: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: any) => void;
  onClearAllData: () => void;
}

export function SyncSettingsTab({
  t,
  lang,
  googleUserEmail,
  isSyncing,
  syncSettings,
  onGoogleLogin,
  onGoogleLogout,
  onBackupToGoogleDrive,
  onRestoreFromGoogleDrive,
  onExportBackup,
  onImportBackup,
  onClearAllData,
}: SyncSettingsTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Google Cloud Sync Section */}
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

      {/* Manual Backup and Restore Actions */}
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
  );
}
