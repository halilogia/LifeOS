/**
 * GovJobHubsBar.tsx
 * Quick access shortcuts to top official government job portals.
 */

import type { GovJobHubShortcut } from "@/types/govJobs.js";

interface GovJobHubsBarProps {
  hubs: GovJobHubShortcut[];
  titleLabel?: string;
}

export function GovJobHubsBar({
  hubs,
  titleLabel = "Resmi Kamu İşe Alım Portalları",
}: GovJobHubsBarProps) {
  return (
    <div className="gov-hubs-container">
      <div className="gov-hubs-header">
        <span className="gov-hubs-title">{titleLabel}</span>
      </div>
      <div className="gov-hubs-grid">
        {hubs.map((hub) => (
          <a
            key={hub.id}
            href={hub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gov-hub-chip"
            title={hub.description}
          >
            <span className="gov-hub-name">{hub.name}</span>
            {hub.badge && <span className="gov-hub-badge">{hub.badge}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
