const NODE_LEGEND = [
  { color: "#a855f7", label: "Tarih" },
  { color: "#10b981", label: "Coğrafya" },
  { color: "#3b82f6", label: "Vatandaşlık" },
  { color: "#f59e0b", label: "Türkçe" },
  { color: "#ef4444", label: "Matematik" },
  { color: "#6366f1", label: "Genel" },
];

export function GraphLegend() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        fontSize: "0.75rem",
        color: "#cbd5e1",
        flexWrap: "wrap",
        padding: "4px 8px",
        background: "rgba(15, 23, 42, 0.4)",
        borderRadius: "10px",
      }}
    >
      {/* Edge connection types */}
      <span style={{ fontWeight: 600, color: "#94a3b8" }}>Bağlantı:</span>
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span
          style={{
            width: "18px",
            height: "3px",
            background: "#10b981",
            borderRadius: "2px",
          }}
        />
        Alt Not
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span
          style={{
            width: "18px",
            height: "3px",
            background: "#a855f7",
            borderRadius: "2px",
            backgroundImage:
              "repeating-linear-gradient(90deg, #a855f7 0, #a855f7 4px, transparent 4px, transparent 7px)",
          }}
        />
        Wikilink
      </span>

      <span style={{ color: "rgba(255,255,255,0.15)", fontWeight: 700 }}>
        |
      </span>

      {/* Node color categories */}
      <span style={{ fontWeight: 600, color: "#94a3b8" }}>Kategori:</span>
      {NODE_LEGEND.map((item) => (
        <span
          key={item.label}
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: item.color,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
