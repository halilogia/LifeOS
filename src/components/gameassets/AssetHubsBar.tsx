/**
 * AssetHubsBar.tsx
 * Quick access shortcuts to top curated free game asset portals.
 */

import { AssetHubShortcut } from "@/types/gameAssets.js";

interface AssetHubsBarProps {
  hubs: AssetHubShortcut[];
  titleLabel: string;
}

export function AssetHubsBar({ hubs, titleLabel }: AssetHubsBarProps) {
  return (
    <div className="asset-hubs-container">
      <div className="asset-hubs-header">
        <span className="asset-hubs-title">{titleLabel}</span>
      </div>
      <div className="asset-hubs-grid">
        {hubs.map((hub) => (
          <a
            key={hub.name}
            href={hub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="asset-hub-chip"
            title={hub.description}
          >
            <span className="hub-name">{hub.name}</span>
            {hub.badge && <span className="hub-badge">{hub.badge}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
