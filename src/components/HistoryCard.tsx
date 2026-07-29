import { HistoricalEpicGame } from "@/types/games.js";

interface HistoryCardProps {
  game: HistoricalEpicGame;
  formattedDate: string;
  wasFreeSuccessLabel: string;
  wasFreeOnLabel: string;
  metaScoreLabel: string;
  steamScoreLabel: string;
}

export function HistoryCard({
  game,
  formattedDate,
  wasFreeSuccessLabel,
  wasFreeOnLabel,
  metaScoreLabel,
  steamScoreLabel,
}: HistoryCardProps) {
  const metaHtml = game.metacriticScore ? (
    <div className="rating-item metacritic" title="Metacritic score">
      <span className="rating-label">{metaScoreLabel}</span>{" "}
      <span className="rating-val">{game.metacriticScore}</span>
    </div>
  ) : null;

  const steamHtml = game.steamDBRating ? (
    <div className="rating-item steamdb" title="SteamDB rating">
      <span className="rating-label">{steamScoreLabel}</span>{" "}
      <span className="rating-val">%{game.steamDBRating}</span>
    </div>
  ) : null;

  return (
    <div className="history-card">
      <div className="history-card-header">
        <div className="history-check-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="history-card-title-group">
          <h3 className="history-title">{game.gameTitle}</h3>
          <span className="history-success-label">{wasFreeSuccessLabel}</span>
        </div>
      </div>
      <div className="history-card-body">
        <div className="history-info-row">
          <span className="history-label">{wasFreeOnLabel}</span>
          <span className="history-value">{formattedDate}</span>
        </div>
        {(metaHtml || steamHtml) && (
          <div className="history-ratings">
            {metaHtml}
            {steamHtml}
          </div>
        )}
      </div>
      <div className="history-card-footer">
        {game.epicStoreLink && (
          <a
            href={game.epicStoreLink}
            target="_blank"
            className="history-link-btn"
            rel="noopener noreferrer"
          >
            Epic Games
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
        )}
      </div>
    </div>
  );
}
