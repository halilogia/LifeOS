import { useState, useEffect } from "preact/hooks";
import { Language } from "../types/types.js";
import { translations } from "../utils/i18n.js";

interface DetoxViewProps {
  lang: Language;
}

const SUPPORTED_SITES = [
  { id: "x.com", label: "Twitter / X", domains: ["x.com", "twitter.com"] },
  { id: "instagram.com", label: "Instagram", domains: ["instagram.com"] },
  { id: "youtube.com", label: "YouTube", domains: ["youtube.com"] },
  { id: "tiktok.com", label: "TikTok", domains: ["tiktok.com"] },
  { id: "facebook.com", label: "Facebook", domains: ["facebook.com"] },
];

const DURATIONS = [
  { value: 15 * 60 * 1000, labelKey: "detox_duration_15m" },
  { value: 30 * 60 * 1000, labelKey: "detox_duration_30m" },
  { value: 60 * 60 * 1000, labelKey: "detox_duration_1h" },
  { value: 120 * 60 * 1000, labelKey: "detox_duration_2h" },
  { value: 240 * 60 * 1000, labelKey: "detox_duration_4h" },
  { value: -1, labelKey: "detox_duration_permanent" },
];

export function DetoxView({ lang }: DetoxViewProps) {
  const t = translations[lang];

  const [enabled, setEnabled] = useState(false);
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [endTime, setEndTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(30 * 60 * 1000); // 30m default
  const [timeLeft, setTimeLeft] = useState(0);
  const [customSiteInput, setCustomSiteInput] = useState("");

  // Screen Time Stats
  const [screenTimeStats, setScreenTimeStats] = useState<
    Record<string, number>
  >({});
  const [showAllStats, setShowAllStats] = useState(false);

  // Load configuration from storage
  useEffect(() => {
    chrome.storage.sync.get(
      ["detox_enabled", "detox_blocked_sites", "detox_end_time"],
      (resData) => {
        const res = resData as Record<string, any>;
        const isEnabled = res.detox_enabled || false;
        const sites = res.detox_blocked_sites || [];
        const end = res.detox_end_time || 0;

        // Check if time expired
        if (isEnabled && end !== -1 && end <= Date.now()) {
          handleDisableDetox();
        } else {
          setEnabled(isEnabled);
          setBlockedSites(sites);
          setEndTime(end);
        }
      },
    );
  }, []);

  // Load screen time tracking stats
  useEffect(() => {
    const loadStats = () => {
      const todayStr = new Date().toLocaleDateString("sv");
      chrome.storage.local.get(["screen_time_stats"], (res) => {
        const stats = res.screen_time_stats?.[todayStr] || {};
        setScreenTimeStats(stats);
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Tick local countdown timer if active
  useEffect(() => {
    let interval: number | null = null;

    if (enabled && endTime !== -1) {
      const calcTimeLeft = () => {
        const remaining = Math.max(
          0,
          Math.round((endTime - Date.now()) / 1000),
        );
        setTimeLeft(remaining);
        if (remaining === 0) {
          handleDisableDetox();
        }
      };

      calcTimeLeft();
      interval = window.setInterval(calcTimeLeft, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [enabled, endTime]);

  const handleToggleSite = (siteDomains: string[]) => {
    setBlockedSites((prev) => {
      const exists = prev.includes(siteDomains[0]);
      let updated;
      if (exists) {
        updated = prev.filter((d) => !siteDomains.includes(d));
      } else {
        updated = [...prev, ...siteDomains];
      }
      if (enabled) {
        chrome.storage.sync.set({ detox_blocked_sites: updated });
      }
      return updated;
    });
  };

  const handleAddCustomSite = () => {
    let site = customSiteInput.trim().toLowerCase();
    if (!site) {
      return;
    }
    site = site.replace(/^(https?:\/\/)?(www\.)?/, "");
    if (!site) {
      return;
    }

    setBlockedSites((prev) => {
      if (prev.includes(site)) {
        return prev;
      }
      const updated = [...prev, site];
      chrome.storage.sync.set({ detox_blocked_sites: updated });
      return updated;
    });
    setCustomSiteInput("");
  };

  const handleRemoveCustomSite = (site: string) => {
    setBlockedSites((prev) => {
      const updated = prev.filter((s) => s !== site);
      chrome.storage.sync.set({ detox_blocked_sites: updated });
      return updated;
    });
  };

  const handleEnableDetox = async () => {
    if (blockedSites.length === 0) {
      alert(t.detox_no_sites_alert || "Lütfen en az bir site seçin.");
      return;
    }

    const calculatedEndTime =
      selectedDuration === -1 ? -1 : Date.now() + selectedDuration;
    const settings = {
      detox_enabled: true,
      detox_blocked_sites: blockedSites,
      detox_end_time: calculatedEndTime,
    };

    chrome.storage.sync.set(settings, () => {
      setEnabled(true);
      setEndTime(calculatedEndTime);
    });
  };

  const handleDisableDetox = async () => {
    const settings = {
      detox_enabled: false,
      detox_end_time: 0,
    };

    chrome.storage.sync.set(settings, () => {
      setEnabled(false);
      setEndTime(0);
      setTimeLeft(0);
    });
  };

  const formatTime = (secs: number) => {
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

  const formatDurationText = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return lang === "tr" ? `${h} sa ${m} dk` : `${h}h ${m}m`;
    }
    if (m > 0) {
      return lang === "tr" ? `${m} dk ${s} sn` : `${m}m ${s}s`;
    }
    return lang === "tr" ? `${s} sn` : `${s}s`;
  };

  // Screen time details calculations
  const totalScreenTimeSeconds = Object.values(screenTimeStats).reduce(
    (acc, val) => acc + val,
    0,
  );
  const sortedScreenTimeSites = Object.entries(screenTimeStats).sort(
    (a, b) => b[1] - a[1],
  );
  const visibleScreenTimeSites = showAllStats
    ? sortedScreenTimeSites
    : sortedScreenTimeSites.slice(0, 5);

  const defaultDomains = SUPPORTED_SITES.flatMap((s) => s.domains);
  const customBlockedSites = blockedSites.filter(
    (site) => !defaultDomains.includes(site),
  );

  return (
    <div id="detox-view" className="view-content active">
      <div className="detox-container">
        {/* Screen Time Usage Dashboard Card */}
        <div className="detox-card" style={{ padding: "2rem" }}>
          <div
            className="detox-status-header"
            style={{ borderBottom: "none", paddingBottom: 0 }}
          >
            <div className="detox-title-group">
              <h2>
                {lang === "tr"
                  ? "Bugün Chrome'da Ne Kadar Vakit Geçirdin?"
                  : "Screen Time on Chrome Today"}
              </h2>
              <p>
                {lang === "tr"
                  ? "Tarayıcıda harcadığınız aktif süreyi takip edin."
                  : "Track your active time spent on domains."}
              </p>
            </div>
            <div
              className="detox-status-badge active"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                borderColor: "rgba(139, 92, 246, 0.2)",
                color: "var(--accent-color)",
              }}
            >
              <span style={{ fontSize: "1.2rem", fontWeight: "800" }}>
                {formatDurationText(totalScreenTimeSeconds)}
              </span>
            </div>
          </div>

          {sortedScreenTimeSites.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontStyle: "italic",
              }}
            >
              {lang === "tr"
                ? "Bugün henüz başka sitelerde aktif vakit geçirmediniz."
                : "No active domain usage recorded today yet."}
            </div>
          ) : (
            <div
              className="screen-time-stats-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "1rem",
              }}
            >
              {visibleScreenTimeSites.map(([domain, secs]) => {
                const percentage =
                  totalScreenTimeSeconds > 0
                    ? Math.round((secs / totalScreenTimeSeconds) * 100)
                    : 0;
                return (
                  <div
                    key={domain}
                    className="screen-time-item"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        {domain}
                      </span>
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontWeight: "500",
                        }}
                      >
                        {formatDurationText(secs)}{" "}
                        <span
                          style={{
                            opacity: 0.5,
                            fontSize: "0.75rem",
                            marginLeft: "6px",
                          }}
                        >
                          ({percentage}%)
                        </span>
                      </span>
                    </div>
                    {/* Glassmorphic progress bar */}
                    <div
                      className="screen-time-bar-track"
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--card-border)",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="screen-time-bar-fill"
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background:
                            "linear-gradient(90deg, var(--accent-color) 0%, #a78bfa 100%)",
                          borderRadius: "10px",
                          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {sortedScreenTimeSites.length > 5 && (
                <button
                  className="text-btn"
                  onClick={() => setShowAllStats(!showAllStats)}
                  style={{
                    alignSelf: "center",
                    marginTop: "10px",
                    fontSize: "0.8rem",
                    color: "var(--accent-color)",
                    fontWeight: "600",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {showAllStats
                    ? lang === "tr"
                      ? "Daha Az Göster"
                      : "Show Less"
                    : lang === "tr"
                      ? `Tümünü Göster (${sortedScreenTimeSites.length})`
                      : `Show All (${sortedScreenTimeSites.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Status Block Card */}
        <div className="detox-card">
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

              <div className="detox-active-info">
                <h3>{t.detox_active_title || "Derin Odaklanma Modu"}</h3>
                <p>
                  {t.detox_active_desc ||
                    "Odaklanma oturumunuz boyunca seçilen sosyal medya kanalları tamamen engellenmiştir."}
                </p>

                <button
                  className="detox-btn danger"
                  onClick={handleDisableDetox}
                >
                  {t.detox_btn_disable || "Detoksu Sonlandır"}
                </button>
              </div>
            </div>
          ) : (
            // Configure Detox Settings Form
            <div className="detox-setup-form">
              <div className="setup-section">
                <h3>
                  {t.detox_select_sites || "Engellenecek Platformları Seçin"}
                </h3>
                <div className="platforms-grid">
                  {SUPPORTED_SITES.map((site) => {
                    const isChecked = blockedSites.includes(site.domains[0]);
                    return (
                      <div
                        key={site.id}
                        className={`platform-checkbox-card ${isChecked ? "checked" : ""}`}
                        onClick={() => handleToggleSite(site.domains)}
                      >
                        <div className="card-checkbox-circle">
                          {isChecked && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              stroke-width="3"
                              stroke-linecap="round"
                              stroke-linejoin="round"
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
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}
                >
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
                      setCustomSiteInput((e.target as HTMLInputElement).value)
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddCustomSite();
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
                    onClick={handleAddCustomSite}
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
                          onClick={() => handleRemoveCustomSite(site)}
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
                            (e.currentTarget.style.color = "var(--danger)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color =
                              "var(--text-secondary)")
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
                      setSelectedDuration(
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

              <button className="detox-btn primary" onClick={handleEnableDetox}>
                {t.detox_btn_enable || "Detoksu Başlat"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
