import { Language } from "../types/types.js";
import { Giveaway } from "../services/gamesService.js";

interface GameCardProps {
  game: Giveaway;
  lang: Language;
  worthText: string;
  expiryText: string;
  displayPlatforms: string[];
  getGameLabel: string;
  worthFreeLabel: string;
}

export function GameCard({
  game,
  worthText,
  expiryText,
  displayPlatforms,
  getGameLabel,
  worthFreeLabel,
}: GameCardProps) {
  return (
    <div className="game-card">
      <div
        className="game-card-image"
        style={{ backgroundImage: `url('${game.image}')` }}
      >
        <div className="game-badges">
          {worthText ? (
            <span className="game-worth-badge">{worthText}</span>
          ) : (
            <span className="game-worth-badge free">{worthFreeLabel}</span>
          )}
        </div>
      </div>
      <div className="game-card-content">
        <div className="game-platforms-container">
          {displayPlatforms.map((p) => (
            <span
              key={p}
              className={`game-platform-badge ${p.toLowerCase().replace(/\./g, "-").replace(/\s+/g, "-")}`}
              title={game.platforms}
            >
              {p}
            </span>
          ))}
        </div>
        <h3 className="game-title" title={game.title}>
          {game.title}
        </h3>
        <p className="game-description" title={game.description}>
          {game.description}
        </p>
        <div className="game-card-footer">
          <span className="game-expiry" title={expiryText}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style={{
                marginRight: "4px",
                display: "inline-block",
                verticalAlign: "middle",
              }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
              }}
            >
              {expiryText}
            </span>
          </span>
          <a
            href={game.open_giveaway_url}
            target="_blank"
            rel="noopener noreferrer"
            className="game-claim-btn"
          >
            {getGameLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
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
  );
}
