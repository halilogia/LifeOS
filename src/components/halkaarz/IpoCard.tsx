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
        "Eki",
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

function statusLabel(status: IPOEntry["status"], t: any): string {
  switch (status) {
    case "active":
      return t.ipo_status_active;
    case "upcoming":
      return t.ipo_status_upcoming;
    case "completed":
      return t.ipo_status_completed;
    case "cancelled":
      return t.ipo_status_cancelled;
  }
}

function IconCalendar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export function IpoCard({ ipo, lang, t }: IpoCardProps) {
  return (
    <div class={`ipo-card status-${ipo.status}`}>
      {/* Header */}
      <div class="ipo-card-header">
        <div class="ipo-company-info">
          <h3 class="ipo-company-name">{ipo.name}</h3>
          {ipo.ticker && <span class="ipo-ticker-badge">{ipo.ticker}</span>}
        </div>
        <div class={`ipo-status-badge status-${ipo.status}`}>
          <span class="ipo-status-dot" />
          {statusLabel(ipo.status, t)}
        </div>
      </div>

      {/* Details */}
      <div class="ipo-card-details">
        <div class="ipo-detail-row">
          <span class="ipo-detail-label">
            <IconCalendar />
            {t.ipo_dates}
          </span>
          <span class="ipo-detail-value">
            {formatDate(ipo.startDate, lang)} — {formatDate(ipo.endDate, lang)}
          </span>
        </div>
        <div class="ipo-detail-row">
          <span class="ipo-detail-label">
            <IconTag />
            {t.ipo_price_range}
          </span>
          <span class="ipo-detail-value">{ipo.priceRange}</span>
        </div>
        <div class="ipo-detail-row">
          <span class="ipo-detail-label">{t.ipo_sector}</span>
          <span class="ipo-sector-chip">{ipo.sector}</span>
        </div>
      </div>

      {/* Footer */}
      {ipo.kapUrl && (
        <div class="ipo-card-footer">
          <a
            href={ipo.kapUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="ipo-kap-link"
          >
            {t.ipo_view_kap}
            <IconExternalLink />
          </a>
        </div>
      )}
    </div>
  );
}
