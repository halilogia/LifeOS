/**
 * CityEventCard.tsx
 * Visual poster card for City Pulse events.
 * Features featured media thumbnails, category badges, calendar integration, and favorite toggle.
 */

import { useState } from "preact/hooks";
import type { CityEvent } from "@/types/cityPulse.js";
import { escapeHtml, sanitizeUrl } from "@/utils/sanitize.js";
import { generateGoogleCalendarUrl } from "@/services/cityPulseService.js";

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
  const [imgError, setImgError] = useState(false);

  const safeTitle = escapeHtml(event.title);
  const safeExcerpt = escapeHtml(event.excerpt);
  const safeLink = sanitizeUrl(event.link);
  const venueBadges = event.categoryIds
    .map(categoryName)
    .filter(Boolean)
    .slice(0, 2);
  const typeBadges = event.typeIds.map(typeName).filter(Boolean).slice(0, 3);
  const dateText = formatEventDate(event.date);

  const primaryVenue = venueBadges[0] || event.venueName || "İstanbul";
  const calendarUrl = generateGoogleCalendarUrl(
    event.title,
    event.date,
    event.link,
    primaryVenue,
  );

  return (
    <article className="city-event-card">
      {/* 1. Visual Poster Header / Thumbnail */}
      <div className="city-event-card-media">
        {event.imageUrl && !imgError ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="city-event-poster"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="city-event-poster-fallback">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="event-fallback-icon"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="event-fallback-text">{typeBadges[0] || "Etkinlik"}</span>
          </div>
        )}

        {/* Favorite Heart Button overlaid on top right */}
        <button
          className={`cp-fav-btn ${isFavorite ? "active" : ""}`}
          onClick={onToggleFavorite}
          title={isFavorite ? t.cp_remove_favorite : t.cp_add_favorite}
          aria-label={isFavorite ? t.cp_remove_favorite : t.cp_add_favorite}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Date Pill Overlaid on Bottom Left */}
        {dateText && (
          <div className="city-event-media-date">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{dateText}</span>
          </div>
        )}
      </div>

      {/* 2. Card Body Content */}
      <div className="city-event-card-body">
        <div className="city-event-card-badges">
          {venueBadges.map((name) => (
            <span
              key={`${event.id}-v-${name}`}
              className="cp-badge cp-badge-venue"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {name}
            </span>
          ))}
          {typeBadges.map((name) => (
            <span
              key={`${event.id}-t-${name}`}
              className="cp-badge cp-badge-type"
            >
              {name}
            </span>
          ))}
          <span className="cp-badge cp-badge-free">{t.cp_free_chip || "Ücretsiz"}</span>
        </div>

        <h3 className="city-event-card-title" title={event.title}>{safeTitle}</h3>

        {safeExcerpt && <p className="city-event-card-excerpt">{safeExcerpt}</p>}
      </div>

      {/* 3. Action Footer (Add to Calendar & View Details) */}
      <div className="city-event-card-foot">
        <a
          className="city-event-btn calendar-btn"
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={t.cp_add_to_calendar || "Google Takvim'e Ekle"}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="12" y1="14" x2="12" y2="18" />
            <line x1="10" y1="16" x2="14" y2="16" />
          </svg>
          <span>{t.cp_calendar_short || "Takvime Ekle"}</span>
        </a>

        <a
          className="city-event-btn details-btn"
          href={safeLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{t.cp_details || "Detaylar"}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
