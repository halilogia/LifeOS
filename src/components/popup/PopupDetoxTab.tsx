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

const SUPPORTED_SITES = [
  { id: "x.com", label: "Twitter / X", domains: ["x.com", "twitter.com"] },
  { id: "instagram.com", label: "Instagram", domains: ["instagram.com"] },
  { id: "youtube.com", label: "YouTube", domains: ["youtube.com"] },
  { id: "tiktok.com", label: "TikTok", domains: ["tiktok.com"] },
  { id: "facebook.com", label: "Facebook", domains: ["facebook.com"] },
];

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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  textAlign: "left",
                  fontWeight: "500",
                }}
              >
                {t.popup_detox_platforms_title}
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                {SUPPORTED_SITES.map((site) => {
                  const isChecked = detoxBlockedSites.includes(site.domains[0]);
                  return (
                    <button
                      key={site.id}
                      onClick={() => handleTogglePopupSite(site.domains)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        background: isChecked
                          ? "rgba(139, 92, 246, 0.15)"
                          : "rgba(255,255,255,0.02)",
                        border: isChecked
                          ? "1px solid var(--accent-color)"
                          : "1px solid var(--card-border)",
                        borderRadius: "10px",
                        padding: "8px 0",
                        cursor: "pointer",
                        color: isChecked
                          ? "var(--accent-color)"
                          : "var(--text-secondary)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {/* Platform SVG Icon */}
                      {site.id === "x.com" && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {site.id === "instagram.com" && (
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
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="20"
                            rx="5"
                            ry="5"
                          />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      )}
                      {site.id === "youtube.com" && (
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
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                          <polygon
                            points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      {site.id === "tiktok.com" && (
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
                          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                        </svg>
                      )}
                      {site.id === "facebook.com" && (
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
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                      )}
                      <span
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: "600",
                          marginTop: "2px",
                        }}
                      >
                        {site.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

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
