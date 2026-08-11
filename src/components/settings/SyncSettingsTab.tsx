/**
 * SyncSettingsTab.tsx
 * Sync & Backup sekmesi — Google Cloud sync, Drive backup/restore, data inspector.
 */

import { Language } from "@/types/types.js";
import type { GoogleSyncSettings } from "@/domain/repositories/ISyncRepository.js";
import type { SyncKeySummary, DriveBackupInfo } from "@/services/cloudDataInspector.js";
import { SettingsSection } from "@/components/settings/SettingsSection.js";

interface SyncSettingsTabProps {
  t: Record<string, string>;
  lang: Language;
  googleUserEmail: string;
  isSyncing: boolean;
  syncSettings: GoogleSyncSettings;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onBackupToGoogleDrive: () => void;
  onRestoreFromGoogleDrive: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: Event) => void;
  onClearAllData: () => void;
  syncKeysSummary?: SyncKeySummary[];
  driveBackups?: DriveBackupInfo[];
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
  syncKeysSummary = [],
  driveBackups = [],
}: SyncSettingsTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Google Cloud Sync Section */}
      <div className="settings-group">
        <SettingsSection title={t.google_sync_title} />
        <div className="google-sync-card">
          {!googleUserEmail ? (
            <button
              className="google-sync-btn primary"
              onClick={onGoogleLogin}
              disabled={isSyncing}
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              {t.google_sync_btn_login}
            </button>
          ) : (
            <>
              <div className="google-account-info">
                <div className="google-user-details">
                  <span className="google-user-label">
                    {t.google_sync_connected_as}
                  </span>
                  <span className="google-user-email">{googleUserEmail}</span>
                </div>
                <button
                  className="google-sync-btn danger"
                  onClick={onGoogleLogout}
                  disabled={isSyncing}
                  style={{ width: "auto", minWidth: "0" }}
                >
                  {t.google_sync_btn_logout}
                </button>
              </div>

              <div
                className="google-sync-status-indicator"
                style={{ marginTop: "8px" }}
              >
                <span
                  className={`sync-dot ${isSyncing ? "syncing" : "synced"}`}
                ></span>
                <span>
                  {isSyncing ? t.settings_syncing : t.google_sync_status_synced}
                </span>
              </div>

              {syncSettings.lastSyncedBackup && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  {t.google_sync_last_synced}{" "}
                  {new Date(syncSettings.lastSyncedBackup).toLocaleString(
                    lang === "tr" ? "tr-TR" : "en-US",
                  )}
                </div>
              )}

              <div
                className="google-sync-actions"
                style={{ marginTop: "12px" }}
              >
                <button
                  className="google-sync-btn"
                  onClick={onBackupToGoogleDrive}
                  disabled={isSyncing}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {t.google_sync_backup_now}
                </button>
                <button
                  className="google-sync-btn"
                  onClick={onRestoreFromGoogleDrive}
                  disabled={isSyncing}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
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
        <SettingsSection title={t.settings_sync_data_manual} />
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <span>{t.clear_all}</span>
          </button>
        </div>
      </div>

      {/* Cloud Data Inspector */}
      <div className="settings-group">
        <SettingsSection title={t.settings_cloud_inspector_title || "Cloud Data Inspector"} />
        <div className="settings-actions">
          {/* Sync Section */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                }}
              >
                {t.settings_cloud_sync_section || "Chrome Sync (Ayarlar)"}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                }}
              >
                ~100KB limit • Otomatik
              </span>
            </div>
            {syncKeysSummary.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                {t.settings_cloud_inspector_empty || "No sync data."}
              </p>
            ) : (
              <>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginBottom: "6px" }}>
                  {syncKeysSummary.length} key • {(syncKeysSummary.reduce((s, k) => s + k.size, 0) / 1024).toFixed(1)} KB
                </p>
                <div
                  style={{
                    maxHeight: "160px",
                    overflowY: "auto",
                    background: "rgba(2,6,23,0.5)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "6px",
                  }}
                >
                  {syncKeysSummary.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 6px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#fb923c",
                          minWidth: "80px",
                          wordBreak: "break-all",
                        }}
                      >
                        {item.key}
                      </span>
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          opacity: 0.7,
                        }}
                      >
                        {item.type}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          color: "var(--text-secondary)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {(item.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Drive Backups Section */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                }}
              >
                {t.settings_cloud_drive_section || "Google Drive Yedekleri"}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                }}
              >
                Manuel • Sınırsız
              </span>
            </div>
            {driveBackups.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                {t.settings_cloud_drive_empty || "Henüz Drive yedeği yok."}
              </p>
            ) : (
              <>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginBottom: "6px" }}>
                  {driveBackups.length} yedek • {(driveBackups.reduce((s, b) => s + b.size, 0) / 1024).toFixed(1)} KB
                </p>
                <div
                  style={{
                    maxHeight: "160px",
                    overflowY: "auto",
                    background: "rgba(2,6,23,0.5)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "6px",
                  }}
                >
                  {driveBackups.map((backup, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 6px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#4ade80",
                          minWidth: "100px",
                          wordBreak: "break-all",
                        }}
                      >
                        {backup.fileName}
                      </span>
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {(backup.size / 1024).toFixed(1)} KB
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          color: "var(--text-secondary)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {new Date(backup.modifiedTime).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
