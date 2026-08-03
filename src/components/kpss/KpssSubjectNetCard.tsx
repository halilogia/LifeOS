interface KpssSubjectNetCardProps {
  t: Record<string, string>;
  labels: Record<string, string>;
  subKey: string;
  net: number;
  max: number;
  isSelected: boolean;
  onSelect: (subKey: string) => void;
}

export function KpssSubjectNetCard({
  t,
  labels,
  subKey,
  net,
  max,
  isSelected,
  onSelect,
}: KpssSubjectNetCardProps) {
  const percent = max > 0 ? Math.round((net / max) * 100) : 0;

  return (
    <div
      onClick={() => onSelect(subKey)}
      title={`${t.kpss_show_topics.replace("{subject}", labels[subKey] || subKey)}`}
      style={{
        background: isSelected
          ? "rgba(124, 58, 237, 0.14)"
          : "rgba(255, 255, 255, 0.02)",
        border: isSelected
          ? "1.5px solid var(--accent-color)"
          : "1px solid var(--card-border)",
        boxShadow: isSelected ? "0 0 14px rgba(124, 58, 237, 0.3)" : "none",
        borderRadius: "10px",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          color: isSelected ? "white" : "var(--text-secondary)",
          fontWeight: isSelected ? "700" : "600",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{labels[subKey] || subKey}</span>
        {isSelected && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--accent-color)",
              fontWeight: "800",
            }}
          >
            ✓ {t.kpss_selected}
          </span>
        )}
      </span>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          {net}{" "}
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: "500",
              color: "var(--text-secondary)",
            }}
          >
            / {max}
          </span>
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--accent-color)",
            fontWeight: "700",
          }}
        >
          %{percent}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: "var(--accent-color)",
            borderRadius: "2px",
          }}
        ></div>
      </div>
    </div>
  );
}
