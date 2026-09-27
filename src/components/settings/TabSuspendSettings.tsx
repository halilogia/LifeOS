/**
 * TabSuspendSettings.tsx
 * Genel Ayarlar → "Bellek Uyutucu" bölümü.
 *
 * `chrome.tabs.discard()` geri dönüşsüz bir işlemdir: sekmenin belleğini
 * boşaltır ve sayfadaki JS durumunu (kaydedilmemiş form, çalışan zamanlayıcı)
 * yok eder. Bu yüzden varsayılan **kapalıdır** ve kullanıcıya ne olacağı açıkça
 * yazılır. Ayarlar `tab_suspend_config` anahtarında durur; servis worker de
 * aynı anahtarı okur ve değişikliği `chrome.storage.onChanged` ile algılar.
 */

import { useEffect, useState } from "preact/hooks";
import { SettingsSection } from "@/components/settings/SettingsSection.js";
import {
  IDLE_MINUTE_OPTIONS,
  useTabSuspendStore,
} from "@/presentation/store/tabSuspendStore.js";
import { logger } from "@/utils/logger.js";

interface TabSuspendSettingsProps {
  t: Record<string, string>;
  onNotify?: (message: string) => void;
}

export function TabSuspendSettings({ t, onNotify }: TabSuspendSettingsProps) {
  const enabled = useTabSuspendStore((s) => s.enabled);
  const idleMinutes = useTabSuspendStore((s) => s.idleMinutes);
  const status = useTabSuspendStore((s) => s.status);
  const setEnabled = useTabSuspendStore((s) => s.setEnabled);
  const setIdleMinutes = useTabSuspendStore((s) => s.setIdleMinutes);
  const refreshStatus = useTabSuspendStore((s) => s.refreshStatus);
  const runNow = useTabSuspendStore((s) => s.runNow);

  const [running, setRunning] = useState(false);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const handleToggle = async () => {
    try {
      await setEnabled(!enabled);
    } catch (err) {
      logger.error("[TabSuspendSettings] toggle failed:", err);
      onNotify?.(String(err));
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await runNow();
      onNotify?.(
        t.settings_tab_suspend_last_result
          .replace("{discarded}", String(status.discarded))
          .replace("{candidates}", String(status.candidates)),
      );
    } catch (err) {
      logger.error("[TabSuspendSettings] run now failed:", err);
      onNotify?.(String(err));
    } finally {
      setRunning(false);
    }
  };

  const lastSweepLabel =
    status.lastSweepAt > 0
      ? new Date(status.lastSweepAt).toLocaleTimeString()
      : t.settings_tab_suspend_never;

  return (
    <div className="settings-group">
      <SettingsSection title={t.settings_tab_suspend_title} />

      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
        }}
      >
        {t.settings_tab_suspend_desc}
      </p>

      <div className="settings-actions">
        {/* Enable toggle */}
        <button
          className="settings-action-btn"
          onClick={handleToggle}
          aria-pressed={enabled}
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
            <rect x="2" y="4" width="20" height="12" rx="2" ry="2"></rect>
            <line x1="6" y1="20" x2="18" y2="20"></line>
          </svg>
          <span>{t.settings_tab_suspend_toggle}</span>
          <span
            style={{
              marginLeft: "auto",
              fontWeight: 700,
              color: enabled
                ? "var(--accent-color)"
                : "var(--text-secondary)",
            }}
          >
            {enabled
              ? t.settings_tab_suspend_on
              : t.settings_tab_suspend_off}
          </span>
        </button>

        {/* Idle threshold */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 14px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            opacity: enabled ? 1 : 0.5,
          }}
        >
          <span
            style={{ fontSize: "0.85rem", fontWeight: "600", color: "white" }}
          >
            {t.settings_tab_suspend_threshold}
          </span>
          <select
            value={String(idleMinutes)}
            disabled={!enabled}
            onChange={(e) => {
              const next = Number(
                (e.currentTarget as HTMLSelectElement).value,
              );
              void setIdleMinutes(next);
            }}
            style={{
              background: "var(--bg-card, #1a1a2e)",
              color: "white",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              padding: "4px 8px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {IDLE_MINUTE_OPTIONS.map((minutes) => (
              <option key={minutes} value={String(minutes)}>
                {t.settings_tab_suspend_minutes.replace("{n}", String(minutes))}
              </option>
            ))}
          </select>
        </div>

        {/* Last sweep result */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            opacity: enabled ? 1 : 0.5,
          }}
        >
          <span
            style={{ fontSize: "0.85rem", fontWeight: "600", color: "white" }}
          >
            {t.settings_tab_suspend_last_sweep}
          </span>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            {status.lastSweepAt === 0
              ? lastSweepLabel
              : `${lastSweepLabel} · ${t.settings_tab_suspend_discarded.replace(
                  "{count}",
                  String(status.discarded),
                )}`}
          </span>
        </div>

        {/* Run now */}
        <button
          className="settings-action-btn"
          onClick={handleRunNow}
          disabled={running}
          style={{
            opacity: running ? 0.5 : 1,
            cursor: running ? "not-allowed" : "pointer",
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
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
          </svg>
          <span>{running ? "..." : t.settings_tab_suspend_run_now}</span>
        </button>
      </div>
    </div>
  );
}
