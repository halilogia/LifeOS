import { Language } from "@/types/types.js";
import { IPOEntry } from "@/services/ipoService.js";

interface IpoCardProps {
  ipo: IPOEntry;
  lang: Language;
  t: Record<string, string>;
}

function formatDate(dateStr: string, lang: Language): string {
  if (!dateStr) {
    return "—";
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function IpoCard({ ipo, lang, t }: IpoCardProps) {
  const isCompleted = ipo.status === "completed";
  const isUpcoming = ipo.status === "upcoming";

  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.65)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(99, 102, 241, 0.2)",
              color: "#818cf8",
            }}
          >
            {ipo.ticker}
          </span>
          <h3
            style={{ margin: "8px 0 0", fontSize: "1.1rem", color: "#f8fafc" }}
          >
            {ipo.name}
          </h3>
        </div>
        <span
          className={`stock-card-badge ${
            isCompleted
              ? "stock-badge-neutral"
              : isUpcoming
                ? "stock-badge-positive"
                : "stock-badge-tavan"
          }`}
        >
          {isCompleted
            ? t.ipo_label_completed
            : isUpcoming
              ? t.ipo_label_upcoming
              : t.ipo_label_active}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          fontSize: "0.85rem",
        }}
      >
        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
            {t.ipo_offer_price}
          </div>
          <div style={{ fontWeight: 600, color: "#f8fafc" }}>
            {ipo.priceRange}
          </div>
        </div>

        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
            {t.ipo_sector_label}
          </div>
          <div style={{ fontWeight: 600, color: "#f8fafc" }}>
            {ipo.sector || t.ipo_general}
          </div>
        </div>

        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
            {t.ipo_request_dates}
          </div>
          <div style={{ fontWeight: 600, color: "#cbd5e1" }}>
            {formatDate(ipo.startDate, lang)} - {formatDate(ipo.endDate, lang)}
          </div>
        </div>

        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
            {t.ipo_exchange_code}
          </div>
          <div style={{ fontWeight: 600, color: "#cbd5e1" }}>{ipo.ticker}</div>
        </div>
      </div>
    </div>
  );
}
