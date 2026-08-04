const LEGEND_ITEMS = [
  { color: "#a855f7", label: "Tarih" },
  { color: "#10b981", label: "Coğrafya" },
  { color: "#3b82f6", label: "Vatandaşlık" },
  { color: "#f59e0b", label: "Türkçe" },
  { color: "#ef4444", label: "Matematik" },
  { color: "#6366f1", label: "Genel Notlar" },
];

export function GraphLegend() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "0.75rem",
        color: "#cbd5e1",
        flexWrap: "wrap",
        padding: "4px 8px",
        background: "rgba(15, 23, 42, 0.4)",
        borderRadius: "10px",
      }}
    >
      <span style={{ fontWeight: 600, color: "#94a3b8" }}>Kategoriler:</span>
      {LEGEND_ITEMS.map((item) => (
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
          ></span>
          {item.label}
        </span>
      ))}
    </div>
  );
}
