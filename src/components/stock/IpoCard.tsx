import { Language } from "@/types/types.js";
import { IPOEntry } from "@/services/ipoService.js";

interface IpoCardProps {
  ipo: IPOEntry;
  lang: Language;
  t: any;
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
    if (lang === "tr") {
      const months = [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Ekim",
        "Kas",
        "Ara",
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function IpoCard({ ipo, lang, t: _t }: IpoCardProps) {
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
            ? "Tamamlandı"
            : isUpcoming
              ? "Yakında"
              : "Aktif Halka Arz"}
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
            Halka Arz Fiyatı
          </div>
          <div style={{ fontWeight: 600, color: "#f8fafc" }}>
            {ipo.priceRange}
          </div>
        </div>

        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Sektör</div>
          <div style={{ fontWeight: 600, color: "#f8fafc" }}>
            {ipo.sector || "Genel"}
          </div>
        </div>

        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
            Talep Tarihleri
          </div>
          <div style={{ fontWeight: 600, color: "#cbd5e1" }}>
            {formatDate(ipo.startDate, lang)} - {formatDate(ipo.endDate, lang)}
          </div>
        </div>

        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
            Borsa Kodu
          </div>
          <div style={{ fontWeight: 600, color: "#cbd5e1" }}>{ipo.ticker}</div>
        </div>
      </div>
    </div>
  );
}
