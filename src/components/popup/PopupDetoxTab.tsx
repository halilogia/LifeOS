import { DetoxPlatformGrid } from "./DetoxPlatformGrid.js";

interface PopupDetoxTabProps {
  t: Record<string, string>;
  detoxEnabled: boolean;
  detoxBlockedSites: string[];
  detoxEndTime: number;
  detoxDuration: number;
  detoxTimeLeft: number;
  setDetoxDuration: (duration: number) => void;
  handleTogglePopupSite: (siteDomains: string[]) => void;
  handleEnableDetox: () => void;
  handleDisableDetox: () => void;
}

const formatLongTime = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  let str = "";
  if (h > 0) {
    str += `${h.toString().padStart(2, "0")}:`;
  }
  str += `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return str;
};

export function PopupDetoxTab({
  t,
  detoxEnabled,
  detoxBlockedSites,
  detoxEndTime,
  detoxDuration,
  detoxTimeLeft,
  setDetoxDuration,
  handleTogglePopupSite,
  handleEnableDetox,
  handleDisableDetox,
}: PopupDetoxTabProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "14px",
        }}
      >
        {/* Status row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--text-secondary)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {t.popup_detox_status}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "2px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: detoxEnabled
                    ? "#10b981"
                    : "var(--text-secondary)",
                }}
              ></span>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: detoxEnabled ? "#10b981" : "var(--text-secondary)",
                }}
              >
                {detoxEnabled ? t.popup_detox_active : t.popup_detox_inactive}
              </span>
            </div>
          </div>

          {detoxEnabled && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10b981",
                padding: "4px 10px",
                borderRadius: "50px",
                fontSize: "0.75rem",
                fontWeight: "700",
              }}
            >
              {detoxEndTime === -1
                ? t.popup_detox_indefinite
                : formatLongTime(detoxTimeLeft)}
            </div>
          )}
        </div>

        {detoxEnabled ? (
          <button className="detox-btn danger" onClick={handleDisableDetox}>
            {t.popup_detox_end_btn}
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Duration select */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                }}
              >
                {t.popup_detox_duration_title}
              </span>
              <select
                className="detox-select"
                value={detoxDuration}
                onChange={(e) =>
                  setDetoxDuration(
                    Number((e.target as HTMLSelectElement).value),
                  )
                }
              >
                <option value={15 * 60 * 1000}>{t.detox_duration_15m}</option>
                <option value={30 * 60 * 1000}>{t.detox_duration_30m}</option>
                <option value={60 * 60 * 1000}>{t.detox_duration_1h}</option>
                <option value={120 * 60 * 1000}>{t.detox_duration_2h}</option>
                <option value={240 * 60 * 1000}>{t.detox_duration_4h}</option>
                <option value={-1}>{t.popup_detox_indefinite}</option>
              </select>
            </div>

            {/* Popular platforms grid */}
            <DetoxPlatformGrid
              t={t}
              blockedSites={detoxBlockedSites}
              onToggleSite={handleTogglePopupSite}
            />

            <button
              className="detox-btn primary"
              style={{ marginTop: "4px" }}
              onClick={handleEnableDetox}
            >
              {t.popup_detox_start_btn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
