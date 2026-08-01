import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { usePrayer } from "@/presentation/hooks/usePrayer.js";
import { PRAYER_NAMES } from "@/domain/constants/prayerConstants.js";
import { PrayerCityForm } from "@/components/prayer/PrayerCityForm.js";

interface PrayerViewProps {
  lang: Language;
  compact?: boolean;
}

export function PrayerView({ lang, compact = false }: PrayerViewProps) {
  const t = getTranslation(lang);
  const labels = PRAYER_NAMES[lang] || PRAYER_NAMES.tr;

  const {
    loading,
    error,
    city,
    setCity,
    times,
    isFormOpen,
    setIsFormOpen,
    currentPrayerIdx,
    handleSaveCity,
  } = usePrayer();

  if (loading) {
    return (
      <div id="prayer-view" className="view-content active">
        <div className="prayer-standalone-container">
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "var(--text-secondary)",
              animation: "pulse 1.5s infinite",
            }}
          >
            {t.prayer_loading}
          </div>
        </div>
      </div>
    );
  }

  if (error || !times) {
    return (
      <div id="prayer-view" className="view-content active">
        <div className="prayer-standalone-container">
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--danger)",
            }}
          >
            {t.prayer_error}
          </div>
        </div>
      </div>
    );
  }

  const prayerItems = [
    { label: labels.Fajr, time: times.Fajr },
    { label: labels.Sunrise, time: times.Sunrise },
    { label: labels.Dhuhr, time: times.Dhuhr },
    { label: labels.Asr, time: times.Asr },
    { label: labels.Maghrib, time: times.Maghrib },
    { label: labels.Isha, time: times.Isha },
  ];

  if (compact) {
    return (
      <div className="prayer-times-widget">
        <div className="prayer-widget-header" style={{ position: "relative" }}>
          <h3>{labels.title}</h3>
          <span
            className="prayer-city-tag"
            onClick={() => setIsFormOpen((prev) => !prev)}
            style={{ cursor: "pointer", marginLeft: "12px" }}
          >
            {city}
          </span>
        </div>

        {isFormOpen && (
          <PrayerCityForm
            city={city}
            onCityChange={setCity}
            onSave={handleSaveCity}
            compact
            saveLabel={t.prayer_ok}
          />
        )}

        <div className="prayer-list">
          {prayerItems.map((item, idx) => (
            <div
              key={idx}
              className={`prayer-item ${idx === currentPrayerIdx ? "active" : ""}`}
              data-time={item.time}
            >
              <span className="prayer-name">{item.label}</span>
              <span className="prayer-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="prayer-view" className="view-content active">
      <div className="prayer-standalone-container">
        <div
          className="prayer-standalone-card"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div
            className="prayer-widget-header"
            style={{
              marginBottom: "2rem",
              paddingBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              borderBottom: "1px solid var(--card-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {labels.title}
              </h2>
              <div
                id="city-display-container"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  marginLeft: "12px",
                }}
                onClick={() => setIsFormOpen((prev) => !prev)}
              >
                <span
                  className="prayer-city-tag"
                  style={{
                    fontSize: "0.9rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    color: "var(--accent-color)",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    fontWeight: 600,
                  }}
                >
                  {city}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style={{
                    opacity: 0.5,
                    transform: isFormOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </div>
            </div>

            {isFormOpen && (
              <PrayerCityForm
                city={city}
                onCityChange={setCity}
                onSave={handleSaveCity}
                saveLabel={t.prayer_save}
              />
            )}
          </div>

          <div className="prayer-list" style={{ display: "grid", gap: "1rem" }}>
            {prayerItems.map((item, idx) => (
              <div
                key={idx}
                className={`prayer-item ${idx === currentPrayerIdx ? "active" : ""}`}
                data-time={item.time}
              >
                <span className="prayer-name">{item.label}</span>
                <span className="prayer-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
