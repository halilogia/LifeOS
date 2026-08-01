import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

interface DetoxSettingsTabProps {
  lang: Language;
  detoxLimits: Record<string, number>;
  onDetoxLimitsChange: (limits: Record<string, number>) => void;
}

export function DetoxSettingsTab({
  lang,
  detoxLimits,
  onDetoxLimitsChange,
}: DetoxSettingsTabProps) {
  const t = getTranslation(lang);
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
          {t.settings_detox_limits_title}
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "16px 14px",
          }}
        >
          {[
            { domain: "youtube.com", label: "YouTube" },
            { domain: "instagram.com", label: "Instagram" },
            { domain: "twitter.com", label: "Twitter / X" },
            { domain: "facebook.com", label: "Facebook" },
            { domain: "tiktok.com", label: "TikTok" },
          ].map((site) => {
            const limit = detoxLimits[site.domain] || 0;
            return (
              <div
                key={site.domain}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  {site.label}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {limit === 0
                      ? t.settings_unlimited
                      : t.detox_limit_format.replace("{limit}", String(limit))}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      height: "26px",
                    }}
                  >
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
                        userSelect: "none",
                      }}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newLimits = { ...detoxLimits };
                        newLimits[site.domain] =
                          limit === 0 ? 5 : Math.min(360, limit + 5);
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
                        userSelect: "none",
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
    </div>
  );
}
