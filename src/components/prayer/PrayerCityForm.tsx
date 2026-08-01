import { TURKEY_CITIES } from "@/domain/constants/prayerConstants.js";

interface PrayerCityFormProps {
  city: string;
  onCityChange: (city: string) => void;
  onSave: (city: string) => void;
  compact?: boolean;
  saveLabel: string;
}

/**
 * City selector form — ortak bileşen (AGENTS.md 5.2: presentational).
 * PrayerView'ın compact + standalone formları aynı görünümü paylaşır.
 */
export function PrayerCityForm({
  city,
  onCityChange,
  onSave,
  compact = false,
  saveLabel,
}: PrayerCityFormProps) {
  const containerStyle = compact
    ? {
        background: "rgba(255,255,255,0.03)",
        padding: "10px",
        borderRadius: "12px",
        border: "1px solid var(--card-border)",
        marginBottom: "1rem",
      }
    : {
        background: "rgba(255,255,255,0.03)",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid var(--card-border)",
      };

  const selectStyle = {
    flex: 1,
    background: "var(--bg-color)",
    border: "1px solid var(--card-border)",
    color: "var(--text-primary)",
    padding: compact ? "6px 10px" : "8px 12px",
    borderRadius: "8px",
    fontSize: compact ? "0.8rem" : "0.9rem",
    outline: "none",
  };

  const buttonStyle = {
    background: "var(--accent-color)",
    color: "white",
    border: "none",
    padding: compact ? "6px 12px" : "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: compact ? "0.8rem" : undefined,
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", gap: "8px" }}>
        <select
          id={compact ? undefined : "prayer-city-select"}
          style={selectStyle}
          value={city}
          onChange={(e) => onCityChange((e.target as HTMLSelectElement).value)}
        >
          {TURKEY_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          id={compact ? undefined : "save-prayer-city-btn"}
          style={buttonStyle}
          onClick={() => onSave(city)}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
