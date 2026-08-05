import { SettingsSection } from "@/components/settings/SettingsSection.js";

interface KpssAutoTitleToggleProps {
  t: Record<string, string>;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

export function KpssAutoTitleToggle({
  t,
  enabled,
  onToggle,
}: KpssAutoTitleToggleProps) {
  return (
    <div className="settings-group">
      <SettingsSection title={t.settings_kpss_notes_wiki} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "rgba(255,255,255,0.01)",
          border: "1px solid var(--card-border)",
          borderRadius: "10px",
          padding: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "white",
                fontWeight: "600",
              }}
            >
              {t.settings_kpss_auto_title}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-secondary)",
                marginTop: "2px",
              }}
            >
              {t.settings_kpss_auto_title_desc}
            </div>
          </div>

          <label
            style={{
              position: "relative",
              display: "inline-block",
              width: "44px",
              height: "22px",
              flexShrink: 0,
            }}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                onToggle(checked);
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: enabled
                  ? "var(--accent-color, #3b82f6)"
                  : "rgba(255,255,255,0.15)",
                transition: "0.3s",
                borderRadius: "22px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  content: '""',
                  height: "16px",
                  width: "16px",
                  left: enabled ? "24px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: "0.3s",
                  borderRadius: "50%",
                }}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
