import { Language } from "@/types/types.js";
import { DetoxMotivationCard } from "@/components/detox/DetoxMotivationCard.js";

interface DetoxStatusCardProps {
  lang: Language;
  t: any;
  enabled: boolean;
  endTime: number;
  timeLeft: number;
  customSiteInput: string;
  blockedSites: string[];
  selectedDuration: number;
  customBlockedSites: string[];
  SUPPORTED_SITES: any[];
  DURATIONS: any[];
  formatTime: (secs: number) => string;
  onDisableDetox: () => void;
  onEnableDetox: () => void;
  onToggleSite: (domains: string[]) => void;
  onCustomSiteInput: (val: string) => void;
  onAddCustomSite: () => void;
  onRemoveCustomSite: (site: string) => void;
  onSelectedDurationChange: (dur: number) => void;
}

export function DetoxStatusCard({
  lang,
  t,
  enabled,
  endTime,
  timeLeft,
  customSiteInput,
  blockedSites,
  selectedDuration,
  customBlockedSites,
  SUPPORTED_SITES,
  DURATIONS,
  formatTime,
  onDisableDetox,
  onEnableDetox,
  onToggleSite,
  onCustomSiteInput,
  onAddCustomSite,
  onRemoveCustomSite,
  onSelectedDurationChange,
}: DetoxStatusCardProps) {
  return (
    <div className="detox-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="detox-status-header">
        <div className="detox-title-group">
          <h2>{t.detox_title || "Sosyal Medya Detoksu"}</h2>
          <p>
            {t.detox_desc ||
              "Sosyal medyaya erişimi engelleyerek odaklanmanızı artırın."}
          </p>
        </div>

        <div className={`detox-status-badge ${enabled ? "active" : ""}`}>
          <div className="badge-dot"></div>
          <span>
            {enabled
              ? t.detox_status_active || "Aktif"
              : t.detox_status_inactive || "Pasif"}
          </span>
        </div>
      </div>

      {enabled ? (
        // Active Countdown Screen Layout
        <div className="detox-active-screen">
          <div className="countdown-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle className="ring-bg" cx="60" cy="60" r="50" />
              <circle
                className="ring-progress animate-pulse"
                cx="60"
                cy="60"
                r="50"
              />
            </svg>
            <div className="ring-text">
              <span className="ring-time-val">
                {endTime === -1 ? "∞" : formatTime(timeLeft)}
              </span>
              <span className="ring-time-lbl">
                {endTime === -1
                  ? t.detox_duration_permanent || "Süresiz"
                  : t.time_remaining || "Kalan Süre"}
              </span>
            </div>
          </div>

          <div className="detox-active-info" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3>{t.detox_active_title || "Derin Odaklanma Modu"}</h3>
            <p>
              {t.detox_active_desc ||
                "Odaklanma oturumunuz boyunca seçilen sosyal medya kanalları tamamen engellenmiştir."}
            </p>

            <DetoxMotivationCard
              durationMinutes={endTime === -1 ? 0 : Math.max(1, Math.round(timeLeft / 60))}
              lang={lang}
            />

            <button className="detox-btn danger" onClick={onDisableDetox}>
              {t.detox_btn_disable || "Detoksu Sonlandır"}
            </button>
          </div>
        </div>
      ) : (
        // Configure Detox Settings Form
        <div className="detox-setup-form">
          <div className="setup-section">
            <h3>{t.detox_select_sites || "Engellenecek Platformları Seçin"}</h3>
            <div className="platforms-grid">
              {SUPPORTED_SITES.map((site) => {
                const isChecked = blockedSites.includes(site.domains[0]);
                return (
                  <div
                    key={site.id}
                    className={`platform-checkbox-card ${isChecked ? "checked" : ""}`}
                    onClick={() => onToggleSite(site.domains)}
                  >
                    <div className="card-checkbox-circle">
                      {isChecked && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="platform-label">{site.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual URL entry section */}
          <div
            className="setup-section"
            style={{
              borderTop: "1px solid var(--card-border)",
              paddingTop: "1.5rem",
            }}
          >
            <h3>
              {lang === "tr"
                ? "Özel Adres Engelle (Manuel)"
                : "Block Custom Address (Manual)"}
            </h3>
            <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
              <input
                type="text"
                className="free-games-select detox-select"
                style={{
                  flex: 1,
                  height: "42px",
                  padding: "0 15px",
                  background: "rgba(255,255,255,0.02)",
                }}
                placeholder={
                  lang === "tr"
                    ? "Örn: reddit.com, linkedin.com..."
                    : "E.g. reddit.com, linkedin.com..."
                }
                value={customSiteInput}
                onInput={(e) =>
                  onCustomSiteInput((e.target as HTMLInputElement).value)
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    onAddCustomSite();
                  }
                }}
              />
              <button
                className="detox-btn primary"
                style={{
                  width: "auto",
                  height: "42px",
                  padding: "0 24px",
                  borderRadius: "12px",
                }}
                onClick={onAddCustomSite}
              >
                +
              </button>
            </div>

            {/* Custom sites list */}
            {customBlockedSites.length > 0 && (
              <div
                className="custom-sites-list"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "1rem",
                }}
              >
                {customBlockedSites.map((site) => (
                  <div
                    key={site}
                    className="custom-site-badge"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--card-border)",
                      padding: "6px 12px",
                      borderRadius: "50px",
                      fontSize: "0.8rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span>{site}</span>
                    <button
                      onClick={() => onRemoveCustomSite(site)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "1rem",
                      }}
                      onMouseOver={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--danger)")
                      }
                      onMouseOut={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
                      }
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="setup-section duration-section">
            <div className="duration-picker-group">
              <div className="picker-label-group">
                <h3>{t.detox_select_duration || "Süre Belirleyin"}</h3>
                <p>
                  {t.detox_duration_desc ||
                    "Bloklamanın ne kadar süreceğini seçin."}
                </p>
              </div>

              <select
                className="free-games-select detox-select"
                value={selectedDuration}
                onChange={(e) =>
                  onSelectedDurationChange(
                    Number((e.target as HTMLSelectElement).value),
                  )
                }
              >
                {DURATIONS.map((dur) => (
                  <option key={dur.value} value={dur.value}>
                    {t[dur.labelKey as keyof typeof t] || dur.labelKey}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DetoxMotivationCard
            durationMinutes={
              selectedDuration === -1 ? 0 : Math.round(selectedDuration / 60000)
            }
            lang={lang}
          />

          <button className="detox-btn primary" onClick={onEnableDetox}>
            {t.detox_btn_enable || "Detoksu Başlat"}
          </button>
        </div>
      )}
    </div>
  );
}
