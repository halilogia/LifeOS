/**
 * CityEventCard.tsx
 * Single event card for City Pulse: title, date, venue badge, excerpt,
 * favorite heart toggle, and an external details link.
 */

import type { CityEvent } from "@/types/cityPulse.js";
import { escapeHtml } from "@/utils/sanitize.js";
import { sanitizeUrl } from "@/utils/sanitize.js";

interface CityEventCardProps {
  event: CityEvent;
  t: Record<string, string>;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  categoryName: (id: number) => string;
  typeName: (id: number) => string;
  formatEventDate: (dateStr: string) => string;
}

export function CityEventCard({
  event,
  t,
  isFavorite,
  onToggleFavorite,
  categoryName,
  typeName,
  formatEventDate,
}: CityEventCardProps) {
  const safeTitle = escapeHtml(event.title);
  const safeExcerpt = escapeHtml(event.excerpt);
  const safeLink = sanitizeUrl(event.link);
  const venueBadge = event.categoryIds
    .map(categoryName)
    .filter(Boolean)
    .slice(0, 2);
  const typeBadges = event.typeIds.map(typeName).filter(Boolean).slice(0, 3);
  const dateText = formatEventDate(event.date);

  return (
    <article className="city-event-card">
      <div className="city-event-card-head">
        <div className="city-event-card-badges">
          {venueBadge.map((name) => (
            <span
              key={`${event.id}-${name}`}
              className="cp-badge cp-badge-venue"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {name}
            </span>
          ))}
          {typeBadges.map((name) => (
            <span
              key={`${event.id}-${name}`}
              className="cp-badge cp-badge-type"
            >
              {name}
            </span>
          ))}
        </div>
        <button
          className={`cp-fav-btn ${isFavorite ? "active" : ""}`}
          onClick={onToggleFavorite}
          title={isFavorite ? t.cp_remove_favorite : t.cp_add_favorite}
          aria-label={isFavorite ? t.cp_remove_favorite : t.cp_add_favorite}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <h3 className="city-event-card-title">{safeTitle}</h3>

      {dateText && (
        <div className="city-event-card-date">
          <svg
            width="13"
            height="13"
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
          {dateText}
        </div>
      )}

      {safeExcerpt && <p className="city-event-card-excerpt">{safeExcerpt}</p>}

      <div className="city-event-card-foot">
        <a
          className="city-event-card-link"
          href={safeLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.cp_details}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </article>
  );
}
