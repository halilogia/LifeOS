/**
 * GameAssetCard.tsx
 * Card component for individual game asset items.
 */

import { GameAssetItem } from "@/types/gameAssets.js";
import { Language } from "@/types/types.js";

interface GameAssetCardProps {
  asset: GameAssetItem;
  lang: Language;
  claimed: boolean;
  onClaimToggle: (id: string) => void;
  getAssetLabel: string;
  claimedLabel: string;
  freeLabel: string;
}

export function GameAssetCard({
  asset,
  claimed,
  onClaimToggle,
  getAssetLabel,
  claimedLabel,
  freeLabel,
}: GameAssetCardProps) {
  const sourceName =
    asset.source === "itch"
      ? "Itch.io"
      : asset.source === "kenney"
        ? "Kenney CC0"
        : asset.source === "opengameart"
          ? "OpenGameArt"
          : "GamerPower";

  const categoryBadge = asset.category.toUpperCase();

  return (
    <div className={`game-card asset-card ${claimed ? "claimed" : ""}`}>
      <div
        className="game-card-image"
        style={{
          backgroundImage: asset.thumbnail
            ? `url('${asset.thumbnail}')`
            : "linear-gradient(135deg, #1e293b, #0f172a)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="game-badges">
          <span className="game-worth-badge free">
            {asset.price || freeLabel}
          </span>
          {asset.license && (
            <span
              className={`asset-license-badge ${asset.license.toLowerCase().includes("cc0") ? "cc0" : ""}`}
              title={asset.license}
            >
              {asset.license.length > 18
                ? asset.license.slice(0, 16) + "..."
                : asset.license}
            </span>
          )}
        </div>

        {claimed && (
          <div className="game-stamp" aria-label={claimedLabel}>
            <svg
              className="game-stamp-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="game-stamp-text">{claimedLabel}</span>
          </div>
        )}
      </div>

      <div className="game-card-content">
        <div className="game-platforms-container">
          <span
            className={`game-platform-badge asset-source-${asset.source}`}
            title={`Source: ${sourceName}`}
          >
            {sourceName}
          </span>
          <span className="game-platform-badge asset-cat-badge">
            {categoryBadge}
          </span>
          {asset.author && (
            <span className="game-platform-badge asset-author-badge">
              {asset.author}
            </span>
          )}
        </div>

        <h3 className="game-title" title={asset.title}>
          {asset.title}
        </h3>

        <p className="game-description" title={asset.description}>
          {asset.description || "Free high-quality game development asset."}
        </p>

        <div className="game-card-footer">
          <span className="game-expiry" title={asset.license || "Free License"}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                marginRight: "4px",
                display: "inline-block",
                verticalAlign: "middle",
              }}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
              }}
            >
              {asset.category.toUpperCase()} • {asset.source}
            </span>
          </span>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              type="button"
              className={`game-claim-btn ${claimed ? "claimed" : "secondary-icon"}`}
              onClick={() => onClaimToggle(asset.id)}
              title={claimedLabel}
              style={{ padding: "6px 10px" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill={claimed ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            <a
              href={asset.link}
              target="_blank"
              rel="noopener noreferrer"
              className="game-claim-btn"
            >
              {getAssetLabel}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  marginLeft: "4px",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
