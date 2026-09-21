import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { calculateProgressPercent } from "@/services/mediaService.js";

interface MediaCardProps {
  item: MediaItem;
  lang: Language;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrement: (id: string, delta?: number) => void;
  onOpenQuotes: (item: MediaItem) => void;
}

export function MediaCard({
  item,
  lang,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrement,
  onOpenQuotes,
}: MediaCardProps) {
  const t = getTranslation(lang);
  const progressPercent = calculateProgressPercent(item);

  const getStatusLabel = () => {
    switch (item.status) {
      case "in_progress":
        if (item.type === "movie" || item.type === "tv") {
          return t.media_status_watching || "Watching";
        }
        if (item.type === "book") {
          return t.media_status_reading || "Reading";
        }
        if (item.type === "game") {
          return t.media_status_playing || "Playing";
        }
        return t.media_status_in_progress || "In Progress";
      case "completed":
        return t.media_status_completed || "Completed";
      case "backlog":
        return t.media_status_backlog || "Backlog";
      case "dropped":
        return t.media_status_dropped || "Dropped";
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case "movie":
        return t.media_tab_movie || "Movie";
      case "tv":
        return t.media_tab_tv || "TV Series";
      case "book":
        return t.media_tab_book || "Book";
      case "game":
        return t.media_tab_game || "Game";
    }
  };

  const handleDelete = () => {
    const confirmMsg =
      t.media_card_delete_confirm || "Are you sure you want to delete this item?";
    if (window.confirm(confirmMsg)) {
      onDelete(item.id);
    }
  };

  return (
    <div className={`media-card media-type-${item.type} status-${item.status}`}>
      {/* Top Header: Badge, Favorite, Actions */}
      <div className="media-card-top-bar">
        <div className="media-card-badges">
          <span className={`media-type-badge media-type-${item.type}`}>
            {getTypeLabel()}
          </span>
          <span className={`media-status-pill status-${item.status}`}>
            {getStatusLabel()}
          </span>
        </div>

        <div className="media-card-actions">
          <button
            type="button"
            className={`media-action-icon-btn media-fav-btn ${item.favorite ? "active" : ""}`}
            title="Favorite"
            onClick={() => onToggleFavorite(item.id)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={item.favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <button
            type="button"
            className="media-action-icon-btn"
            title={t.media_card_edit_btn || "Edit"}
            onClick={() => onEdit(item)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            type="button"
            className="media-action-icon-btn media-btn-danger"
            title="Delete"
            onClick={handleDelete}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="media-card-body">
        {/* Cover thumbnail or fallback icon */}
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="media-card-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : null}

        <div className="media-card-main-info">
          <h3 className="media-card-title">{item.title}</h3>

          <div className="media-card-meta">
            {item.creator && (
              <span className="media-card-creator">{item.creator}</span>
            )}
            {item.releaseYear && (
              <span className="media-card-year">({item.releaseYear})</span>
            )}
          </div>

          {/* Genres Chips */}
          {item.genres && item.genres.length > 0 && (
            <div className="media-card-genres">
              {item.genres.slice(0, 3).map((g) => (
                <span key={g} className="media-genre-pill">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating & Review */}
      <div className="media-card-rating-row">
        <div className="media-card-score-box">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="media-score-number">
            {item.rating > 0 ? `${item.rating}/10` : "-"}
          </span>
        </div>

        {item.type === "book" && (
          <button
            type="button"
            className="media-quotes-badge-btn"
            onClick={() => onOpenQuotes(item)}
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>
              {t.media_card_quotes_btn || "Quotes"} (
              {item.bookProgress?.quotes?.length || 0})
            </span>
          </button>
        )}
      </div>

      {/* Review preview if provided */}
      {item.review && (
        <div className="media-card-review-preview">
          <p>"{item.review}"</p>
        </div>
      )}

      {/* Progress Section */}
      <div className="media-card-progress-section">
        {/* TV Series Progress */}
        {item.type === "tv" && item.tvProgress && (
          <div className="media-progress-details">
            <div className="media-progress-text-row">
              <span className="media-progress-desc">
                {t.media_card_season || "Season"} {item.tvProgress.currentSeason},{" "}
                {t.media_card_episodes || "Ep"} {item.tvProgress.currentEpisode}
                {item.tvProgress.totalEpisodes
                  ? ` / ${item.tvProgress.totalEpisodes}`
                  : ""}
              </span>
              <span className="media-progress-percent">{progressPercent}%</span>
            </div>

            <div className="media-progress-bar-bg">
              <div
                className="media-progress-bar-fill media-fill-tv"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="media-quick-actions">
              <button
                type="button"
                className="media-quick-btn"
                onClick={() => onIncrement(item.id, 1)}
              >
                {t.media_btn_increment_ep || "+1 Episode"}
              </button>
            </div>
          </div>
        )}

        {/* Book Progress */}
        {item.type === "book" && item.bookProgress && (
          <div className="media-progress-details">
            <div className="media-progress-text-row">
              <span className="media-progress-desc">
                {item.bookProgress.currentPage} / {item.bookProgress.totalPages}{" "}
                {t.media_card_pages || "Pages"}
              </span>
              <span className="media-progress-percent">{progressPercent}%</span>
            </div>

            <div className="media-progress-bar-bg">
              <div
                className="media-progress-bar-fill media-fill-book"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="media-quick-actions">
              <button
                type="button"
                className="media-quick-btn"
                onClick={() => onIncrement(item.id, 10)}
              >
                {t.media_btn_increment_page || "+10 Pages"}
              </button>
              <button
                type="button"
                className="media-quick-btn"
                onClick={() => onIncrement(item.id, 25)}
              >
                {t.media_btn_increment_page_large || "+25 Pages"}
              </button>
            </div>
          </div>
        )}

        {/* Game Progress */}
        {item.type === "game" && item.gameProgress && (
          <div className="media-progress-details">
            <div className="media-progress-text-row">
              <span className="media-progress-desc">
                {item.gameProgress.playtimeHours}h
                {item.gameProgress.targetHours
                  ? ` / ${item.gameProgress.targetHours}h`
                  : ""}{" "}
                ({item.gameProgress.platform})
              </span>
              <span className="media-progress-percent">{progressPercent}%</span>
            </div>

            <div className="media-progress-bar-bg">
              <div
                className="media-progress-bar-fill media-fill-game"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="media-quick-actions">
              <button
                type="button"
                className="media-quick-btn"
                onClick={() => onIncrement(item.id, 1)}
              >
                {t.media_btn_increment_hour || "+1 Hour"}
              </button>
              <button
                type="button"
                className="media-quick-btn"
                onClick={() => onIncrement(item.id, 2)}
              >
                {t.media_btn_increment_hour_large || "+2 Hours"}
              </button>
            </div>
          </div>
        )}

        {/* Movie Progress */}
        {item.type === "movie" && item.movieProgress && (
          <div className="media-movie-details">
            {item.movieProgress.runtimeMinutes ? (
              <span className="media-runtime-tag">
                {item.movieProgress.runtimeMinutes} min
              </span>
            ) : null}
            {item.movieProgress.rewatchCount &&
            item.movieProgress.rewatchCount > 0 ? (
              <span className="media-rewatch-tag">
                🔄 {item.movieProgress.rewatchCount}x
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
