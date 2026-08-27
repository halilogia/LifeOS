/**
 * EventHubsBar.tsx
 * Quick portal shortcuts to top culture, ticketing, museum, and tech event hubs in Turkey.
 */

import { EventHubShortcut } from "@/types/cityPulse.js";
import { sanitizeUrl } from "@/utils/sanitize.js";

interface EventHubsBarProps {
  hubs: EventHubShortcut[];
  t: Record<string, string>;
}

export function EventHubsBar({ hubs, t }: EventHubsBarProps) {
  if (!hubs || hubs.length === 0) return null;

  return (
    <div className="event-hubs-container">
      <div className="event-hubs-header">
        <div className="event-hubs-title">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>{t.cp_hubs_title || "Popüler Etkinlik & Kültür Portalları"}</span>
        </div>
        <span className="event-hubs-subtitle">
          {t.cp_hubs_subtitle || "Konser, tiyatro, sergi, meetup ve bilet merkezleri"}
        </span>
      </div>

      <div className="event-hubs-chips-scroll">
        {hubs.map((hub) => {
          const safeUrl = sanitizeUrl(hub.url);
          return (
            <a
              key={hub.id}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="event-hub-chip"
              title={hub.description}
            >
              <span className="event-hub-name">{hub.name}</span>
              {hub.badge && <span className="event-hub-badge">{hub.badge}</span>}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="event-hub-external-icon"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          );
        })}
      </div>
    </div>
  );
}
