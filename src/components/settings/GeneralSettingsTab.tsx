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
  kpssGoalType: "net" | "score";
  kpssTargetNet: number;
  kpssTargetScore: number;
  onKpssGoalTypeChange: (type: "net" | "score") => void;
  onKpssTargetNetChange: (val: number) => void;
  onKpssTargetScoreChange: (val: number) => void;
  detoxLimits: Record<string, number>;
  onDetoxLimitsChange: (limits: Record<string, number>) => void;
  onExportBackup: () => void;
  onImportBackup: (e: any) => void;
  onClearAllData: () => void;
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
  kpssGoalType,
  kpssTargetNet,
  kpssTargetScore,
  onKpssGoalTypeChange,
  onKpssTargetNetChange,
  onKpssTargetScoreChange,
  detoxLimits,
  onDetoxLimitsChange,
  onExportBackup,
  onImportBackup,
  onClearAllData,
}: GeneralSettingsTabProps) {
  return (
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
            <span>{lang === "tr" ? "Bugünkü Görevleri Bildir" : "Notify Today's Tasks"}</span>
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
          <button
            className="settings-action-btn"
            onClick={onTogglePomoBlock}
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>{lang === "tr" ? "Pomodoro Odak Engelleyici" : "Pomodoro Focus Blocker"}</span>
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

      <div className="settings-group" style={{ marginTop: "10px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", opacity: 0.8 }}>
          {lang === "tr" ? "KPSS Hedef Ayarları" : "KPSS Goal Settings"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "12px 14px" }}>
          
          {/* Goal Type Pill Selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}>
              {lang === "tr" ? "Hedef Türü" : "Goal Type"}
            </span>
            <div style={{ display: "flex", gap: "2px", background: "rgba(255, 255, 255, 0.05)", padding: "2px", borderRadius: "6px", border: "1px solid var(--card-border)" }}>
              <button
                type="button"
                onClick={() => onKpssGoalTypeChange("net")}
                style={{
                  background: kpssGoalType === "net" ? "var(--accent-color)" : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s"
                }}
              >
                {lang === "tr" ? "Net" : "Net"}
              </button>
              <button
                type="button"
                onClick={() => onKpssGoalTypeChange("score")}
                style={{
                  background: kpssGoalType === "score" ? "var(--accent-color)" : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s"
                }}
              >
                {lang === "tr" ? "Puan" : "Score"}
              </button>
            </div>
          </div>

          {/* Target Tuning Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}>
              {kpssGoalType === "net" ? (lang === "tr" ? "Soru Net Hedefi" : "Net Target") : (lang === "tr" ? "Puan Hedefi" : "Score Target")}
            </span>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden", height: "30px" }}>
              <button
                type="button"
                onClick={() => {
                  if (kpssGoalType === "net") {
                    onKpssTargetNetChange(Math.max(10, kpssTargetNet - 1));
                  } else {
                    onKpssTargetScoreChange(Math.max(40, kpssTargetScore - 1));
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: "0 10px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  userSelect: "none"
                }}
              >
                -
              </button>
              <input
                type="number"
                value={kpssGoalType === "net" ? kpssTargetNet : kpssTargetScore}
                readOnly
                style={{
                  width: "30px",
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "0.95rem",
                  padding: 0,
                  fontWeight: "700",
                  textAlign: "center",
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (kpssGoalType === "net") {
                    onKpssTargetNetChange(Math.min(120, kpssTargetNet + 1));
                  } else {
                    onKpssTargetScoreChange(Math.min(100, kpssTargetScore + 1));
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: "0 10px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  userSelect: "none"
                }}
              >
                +
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="settings-group" style={{ marginTop: "10px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", opacity: 0.8 }}>
          {lang === "tr" ? "Sosyal Medya Günlük Limitleri" : "Social Media Daily Limits"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "12px 14px" }}>
          {[
            { domain: "youtube.com", label: "YouTube" },
            { domain: "instagram.com", label: "Instagram" },
            { domain: "twitter.com", label: "Twitter / X" },
            { domain: "facebook.com", label: "Facebook" },
            { domain: "tiktok.com", label: "TikTok" }
          ].map((site) => {
            const limit = detoxLimits[site.domain] || 0;
            return (
              <div key={site.domain} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}>
                  {site.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {limit === 0
                      ? (lang === "tr" ? "Sınırsız" : "Unlimited")
                      : `${limit} ${lang === "tr" ? "dk" : "min"}`}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden", height: "26px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newLimits = { ...detoxLimits };
                        const nextVal = Math.max(0, limit - 5);
                        if (nextVal === 0) {
                          delete newLimits[site.domain];
                        } else {
                          newLimits[site.domain] = nextVal;
                        }
                        onDetoxLimitsChange(newLimits);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255, 255, 255, 0.6)",
                        padding: "0 8px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        userSelect: "none"
                      }}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newLimits = { ...detoxLimits };
                        newLimits[site.domain] = limit === 0 ? 5 : Math.min(360, limit + 5);
                        onDetoxLimitsChange(newLimits);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255, 255, 255, 0.6)",
                        padding: "0 8px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        userSelect: "none"
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
  );
}
