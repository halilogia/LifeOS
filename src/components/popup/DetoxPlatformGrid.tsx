import { SUPPORTED_SITES, PlatformIcon } from "./detoxPlatforms.js";

interface DetoxPlatformGridProps {
  t: Record<string, string>;
  blockedSites: string[];
  onToggleSite: (siteDomains: string[]) => void;
}

export function DetoxPlatformGrid({
  t,
  blockedSites,
  onToggleSite,
}: DetoxPlatformGridProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
          const isChecked = blockedSites.includes(site.domains[0]);
          return (
            <button
              key={site.id}
              onClick={() => onToggleSite(site.domains)}
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
              <PlatformIcon id={site.id} />
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
  );
}
