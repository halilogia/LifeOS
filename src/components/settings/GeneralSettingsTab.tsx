import { Language } from "@/types/types.js";

interface GeneralSettingsTabProps {
  lang: Language;
  t: any;
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
}

export function GeneralSettingsTab({
  lang,
  t,
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
  autoGroupTabsEnabled = true,
  onToggleAutoGroupTabs,
}: GeneralSettingsTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="settings-group">
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
            opacity: 0.8,
          }}
        >
          {t.settings_app_settings_title}
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

          {/* Calendar Tasks Notifications Toggle */}
          <button
            className="settings-action-btn"
            onClick={onToggleCalendarNotifications}
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{t.settings_notify_tasks}</span>
            <span
              style={{
                marginLeft: "auto",
                fontWeight: 700,
                color: calendarNotificationsEnabled
                  ? "var(--accent-color)"
                  : "var(--text-secondary)",
              }}
            >
              {calendarNotificationsEnabled ? t.enabled : t.disabled}
            </span>
          </button>

          {/* Pomodoro Focus Block Toggle */}
          <button className="settings-action-btn" onClick={onTogglePomoBlock}>
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>{t.settings_pomo_blocker}</span>
            <span
              style={{
                marginLeft: "auto",
                fontWeight: 700,
                color: pomoBlockEnabled
                  ? "var(--accent-color)"
                  : "var(--text-secondary)",
              }}
            >
              {pomoBlockEnabled ? t.enabled : t.disabled}
            </span>
          </button>

          {/* Universal Info Box Toggle */}
          <button
            className="settings-action-btn"
            onClick={onToggleUniversalInfoBox}
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

          {/* Auto Tab Grouping Toggle */}
          {onToggleAutoGroupTabs && (
            <button
              className="settings-action-btn"
              onClick={onToggleAutoGroupTabs}
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
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
              <span>
                {lang === "tr"
                  ? "Yan Panel Açıldığında Sekmeyi Otomatik Grupla"
                  : "Auto-group Active Tab on Side Panel Open"}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontWeight: 700,
                  color: autoGroupTabsEnabled
                    ? "var(--accent-color)"
                    : "var(--text-secondary)",
                }}
              >
                {autoGroupTabsEnabled ? t.enabled : t.disabled}
              </span>
            </button>
          )}

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

          {/* Side Panel Copilot Hotkey Management */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--card-border)",
              borderRadius: "10px",
              marginTop: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-color)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "white" }}>
                  {lang === "tr" ? "Web Copilot Yan Panel Kısayolu" : "Web Copilot Side Panel Shortcut"}
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  {lang === "tr" ? "Varsayılan: Ctrl + Shift + E" : "Default: Ctrl + Shift + E"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
              }}
              style={{
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid var(--accent-color)",
                color: "white",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.75rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {lang === "tr" ? "Kısayolu Değiştir" : "Configure Shortcut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
