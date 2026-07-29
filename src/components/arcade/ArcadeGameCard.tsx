import { GameEntry } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";

interface ArcadeGameCardProps {
  game: GameEntry;
  lang: Language;
  onPlay: (game: GameEntry) => void;
  onOpenDetails: (game: GameEntry) => void;
  onToggleFavorite: (gameId: string) => void;
  onDeleteGame?: (gameId: string) => void;
}

export function ArcadeGameCard({
  game,
  lang,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
  onDeleteGame,
}: ArcadeGameCardProps) {

  const t = translations[lang];
  const tr = t as Record<string, string>;

  // Category SVG or Badge color
  const getCategoryColor = (cat: GameEntry["category"]) => {
    switch (cat) {
      case "action":
        return "#ef4444";
      case "rpg":
        return "#a855f7";
      case "simulation":
        return "#3b82f6";
      case "puzzle":
        return "#f59e0b";
      case "ai":
        return "#10b981";
      default:
        return "#8b5cf6";
    }
  };

  const statusBadge = (status: GameEntry["status"]) => {
    if (status === "playable") {
      return (
        <span className="arcade-status-badge playable">
          <span className="status-dot green"></span>
          {tr.arcade_status_playable || "Oynanabilir"}
        </span>
      );
    }
    if (status === "in_progress") {
      return (
        <span className="arcade-status-badge in-progress">
          <span className="status-dot amber"></span>
          {tr.arcade_status_in_progress || "Geliştiriliyor"}
        </span>
      );
    }
    return (
      <span className="arcade-status-badge concept">
        <span className="status-dot purple"></span>
        {tr.arcade_status_concept || "Konsept"}
      </span>
    );
  };

  return (
    <div className="arcade-game-card">
      {/* Top Banner / Cover */}
      <div className="arcade-card-cover" onClick={() => onPlay(game)}>
        {game.coverImage ? (
          <img src={game.coverImage} alt={game.title} className="arcade-cover-img" />
        ) : (
          <div className="arcade-cover-placeholder" style={{ background: `linear-gradient(135deg, ${getCategoryColor(game.category)}22, rgba(15,23,42,0.95))` }}>
            <div className="arcade-placeholder-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={getCategoryColor(game.category)} strokeWidth="1.5">
                <rect x="2" y="6" width="20" height="12" rx="4" />
                <path d="M6 12h4m-2-2v4m9-2h.01m3-2h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="arcade-cover-cat" style={{ color: getCategoryColor(game.category) }}>
              {game.category.toUpperCase()}
            </span>
          </div>
        )}



        <button
          className={`arcade-fav-btn ${game.isFavorite ? "fav" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          title={game.isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={game.isFavorite ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        <div className="arcade-card-play-overlay">
          <div className="play-icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>

        {statusBadge(game.status)}
      </div>

      {/* Card Info Content */}
      <div className="arcade-card-content">
        <div className="arcade-card-header">
          <h3 className="arcade-card-title">{game.title}</h3>
        </div>

        <p className="arcade-card-desc">{game.description}</p>

        {/* Tech Badges */}
        {game.techStack && game.techStack.length > 0 && (
          <div className="arcade-tech-badges">
            {game.techStack.slice(0, 3).map((tech, idx) => (
              <span key={idx} className="arcade-tech-tag">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="arcade-card-footer">
          <div className="arcade-score-info">
            {game.highScore > 0 ? (
              <span className="high-score-text">
                Skor: <strong>{game.highScore}</strong>
              </span>
            ) : (
              <span className="no-score-text">Yeni Oyun</span>
            )}
          </div>

          <div className="arcade-action-btns">
            {onDeleteGame && (
              <button
                className="arcade-details-btn arcade-delete-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGame(game.id);
                }}
                title="Oyunu Kütüphaneden Sil"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}

            <button className="arcade-details-btn" onClick={() => onOpenDetails(game)} title="Steam Dev Detayları">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </button>

            <button className="arcade-play-btn" onClick={() => onPlay(game)} title="Oyunu Başlat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{tr.arcade_play_btn || "Oyna"}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
