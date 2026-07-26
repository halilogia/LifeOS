import { useState, useEffect } from "preact/hooks";
import { prayerService, PrayerTimes } from "../services/prayerService.js";
import { Language } from "../types/types.js";
import { getTranslation } from "@/utils/i18n.js";

interface PrayerViewProps {
  lang: Language;
  compact?: boolean;
}

const TURKEY_CITIES = [
  "Adana",
  "Adiyaman",
  "Afyonkarahisar",
  "Agri",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydin",
  "Balikesir",
  "Bartin",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingol",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Canakkale",
  "Cankiri",
  "Corum",
  "Denizli",
  "Diyarbakir",
  "Duzce",
  "Edirne",
  "Elazig",
  "Erzincan",
  "Erzurum",
  "Eskisehir",
  "Gaziantep",
  "Giresun",
  "Gumushane",
  "Hakkari",
  "Hatay",
  "Igdir",
  "Isparta",
  "Istanbul",
  "Izmir",
  "Kahramanmaras",
  "Karabuk",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kilis",
  "Kirikkale",
  "Kirklareli",
  "Kirsehir",
  "Kocaeli",
  "Konya",
  "Kutahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Mugla",
  "Mus",
  "Nevsehir",
  "Nigde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Sanliurfa",
  "Siirt",
  "Sinop",
  "Sivas",
  "Sirnak",
  "Tekirdag",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Usak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

const PRAYER_NAMES: Record<string, Record<string, string>> = {
  tr: {
    Fajr: "İmsak",
    Sunrise: "Güneş",
    Dhuhr: "Öğle",
    Asr: "İkindi",
    Maghrib: "Akşam",
    Isha: "Yatsı",
    title: "Namaz Vakitleri",
  },
  en: {
    Fajr: "Fajr",
    Sunrise: "Sunrise",
    Dhuhr: "Dhuhr",
    Asr: "Asr",
    Maghrib: "Maghrib",
    Isha: "Isha",
    title: "Prayer Times",
  },
};

export function PrayerView({ lang, compact = false }: PrayerViewProps) {
  const t = getTranslation(lang);
  const labels = PRAYER_NAMES[lang] || PRAYER_NAMES.tr;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [city, setCity] = useState("Istanbul");
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPrayerIdx, setCurrentPrayerIdx] = useState(-1);

  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async (targetCity?: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await new Promise<any>((resolve) =>
        chrome.storage.sync.get(["prayerCity"], (r) => resolve(r)),
      );
      const activeCity = targetCity || (res.prayerCity as string) || "Istanbul";
      setCity(activeCity);

      const prayerTimes = await prayerService.getPrayerTimes(
        activeCity,
        "Turkey",
      );
      setTimes(prayerTimes);
      calculateHighlight(prayerTimes);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(true);
      setLoading(false);
    }
  };

  const calculateHighlight = (prayerTimes: PrayerTimes) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const timeToMinutes = (tStr: string) => {
      const [h, m] = tStr.split(":").map(Number);
      return h * 60 + m;
    };

    const schedule = [
      timeToMinutes(prayerTimes.Fajr),
      timeToMinutes(prayerTimes.Sunrise),
      timeToMinutes(prayerTimes.Dhuhr),
      timeToMinutes(prayerTimes.Asr),
      timeToMinutes(prayerTimes.Maghrib),
      timeToMinutes(prayerTimes.Isha),
    ];

    let idx = -1;
    for (let i = 0; i < schedule.length; i++) {
      if (currentTime >= schedule[i]) {
        idx = i;
      }
    }
    setCurrentPrayerIdx(idx);
  };

  const handleSaveCity = async (newCity: string) => {
    if (!newCity) {
      return;
    }
    chrome.storage.sync.set({ prayerCity: newCity, prayerCountry: "Turkey" });
    setIsFormOpen(false);
    loadPrayers(newCity);
  };

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
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid var(--card-border)",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                style={{
                  flex: 1,
                  background: "var(--bg-color)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-primary)",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  outline: "none",
                }}
                value={city}
                onChange={(e) => setCity((e.target as HTMLSelectElement).value)}
              >
                {TURKEY_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                style={{
                  background: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
                onClick={() => handleSaveCity(city)}
              >
                {t.prayer_ok}
              </button>
            </div>
          </div>
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
                alignSideways: "center",
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
              <div
                id="city-edit-form"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid var(--card-border)",
                }}
              >
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    id="prayer-city-select"
                    style={{
                      flex: 1,
                      background: "var(--bg-color)",
                      border: "1px solid var(--card-border)",
                      color: "var(--text-primary)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                    value={city}
                    onChange={(e) =>
                      setCity((e.target as HTMLSelectElement).value)
                    }
                  >
                    {TURKEY_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <button
                    id="save-prayer-city-btn"
                    style={{
                      background: "var(--accent-color)",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    onClick={() => handleSaveCity(city)}
                  >
                    {t.prayer_save}
                  </button>
                </div>
              </div>
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
