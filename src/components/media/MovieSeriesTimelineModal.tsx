import { useState, useMemo } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MovieSeries, MovieSeriesItem, MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { computeSeriesProgress } from "@/services/movieSeriesData.js";

interface MovieSeriesTimelineModalProps {
  isOpen: boolean;
  series: MovieSeries | null;
  userItems: MediaItem[];
  lang: Language;
  onToggleStatus: (
    item: MovieSeriesItem,
    targetStatus: "completed" | "backlog",
    rating?: number,
  ) => void;
  onBatchWatchlist: (series: MovieSeries) => void;
  onClose: () => void;
}

export function MovieSeriesTimelineModal({
  isOpen,
  series,
  userItems,
  lang,
  onToggleStatus,
  onBatchWatchlist,
  onClose,
}: MovieSeriesTimelineModalProps) {
  const t = getTranslation(lang);
  const [orderMode, setOrderMode] = useState<"release" | "chronological">("release");
  const [onlyUnwatched, setOnlyUnwatched] = useState<boolean>(false);

  if (!isOpen || !series) return null;

  const progress = useMemo(
    () => computeSeriesProgress(series, userItems),
    [series, userItems],
  );

  // Sorted items based on user choice
  const sortedItems = useMemo(() => {
    let list = [...series.items];

    if (orderMode === "chronological" && series.hasChronologicalOrder) {
      list.sort((a, b) => (a.chronologicalOrder || 999) - (b.chronologicalOrder || 999));
    } else {
      list.sort((a, b) => a.releaseOrder - b.releaseOrder);
    }

    if (onlyUnwatched) {
      list = list.filter((movie) => {
        const itemStatus = progress.itemStatuses.find(
          (st) => st.seriesItem.id === movie.id,
        );
        return !itemStatus?.isWatched;
      });
    }

    return list;
  }, [series, orderMode, onlyUnwatched, progress]);

  // Group items by Phase/Arc if applicable
  const groupedItems = useMemo(() => {
    const groups: { name: string; items: MovieSeriesItem[] }[] = [];
    let currentGroupName = "";
    let currentGroup: MovieSeriesItem[] = [];

    for (const movie of sortedItems) {
      const groupName = movie.phaseOrArc || "Tüm Filmler";
      if (groupName !== currentGroupName) {
        if (currentGroup.length > 0) {
          groups.push({ name: currentGroupName, items: currentGroup });
        }
        currentGroupName = groupName;
        currentGroup = [movie];
      } else {
        currentGroup.push(movie);
      }
    }

    if (currentGroup.length > 0) {
      groups.push({ name: currentGroupName, items: currentGroup });
    }

    return groups;
  }, [sortedItems]);

  const totalRuntimeHours = useMemo(() => {
    const totalMinutes = series.items.reduce(
      (acc, m) => acc + (m.runtimeMinutes || 120),
      0,
    );
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [series]);

  return (
    <div className="movie-series-modal-backdrop" onClick={onClose}>
      <div
        className="movie-series-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="series-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="movie-series-modal-close-btn"
          aria-label="Kapat"
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Hero Header */}
        <div
          className="movie-series-modal-hero"
          style={{ backgroundImage: `url(${series.bannerUrl})` }}
        >
          <div className="movie-series-hero-gradient" />
          <div className="movie-series-hero-content">
            <div className="movie-series-hero-badges">
              <span className="hero-badge-pill">🎬 {series.totalMovies} Film</span>
              <span className="hero-badge-pill">★ {series.averageRating.toFixed(1)} IMDb</span>
              <span className="hero-badge-pill">⏱ ~{totalRuntimeHours} Saat Toplam</span>
            </div>

            <h2 id="series-modal-title" className="movie-series-hero-title">
              {series.title}
            </h2>
            {series.originalTitle && series.originalTitle !== series.title && (
              <p className="movie-series-hero-orig-title">{series.originalTitle}</p>
            )}
            <p className="movie-series-hero-desc">{series.description}</p>

            {/* Overall Progress Bar */}
            <div className="movie-series-hero-progress">
              <div className="hero-progress-labels">
                <span className="hero-progress-text">
                  İlerlemen: <strong>{progress.watchedCount}</strong> / {progress.totalMovies} Film İzlendi
                </span>
                <span className="hero-progress-percent">%{progress.percent}</span>
              </div>
              <div className="hero-progress-track">
                <div
                  className="hero-progress-bar"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            {/* Next Up Banner */}
            {progress.nextUpItem && progress.percent < 100 && (
              <div className="movie-series-hero-next-up">
                <span className="hero-next-icon">👉</span>
                <span>
                  Sıradaki: <strong>{progress.nextUpItem.title}</strong> ({progress.nextUpItem.releaseYear})
                </span>
                <button
                  type="button"
                  className="hero-next-watch-btn"
                  onClick={() => onToggleStatus(progress.nextUpItem!, "completed")}
                >
                  ✓ İzlendi Yap
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="movie-series-modal-toolbar">
          <div className="movie-series-modal-order-toggle">
            <button
              type="button"
              className={`order-toggle-btn ${orderMode === "release" ? "active" : ""}`}
              onClick={() => setOrderMode("release")}
            >
              📅 {t.media_release_order || "Çıkış Yılına Göre"}
            </button>
            {series.hasChronologicalOrder && (
              <button
                type="button"
                className={`order-toggle-btn ${orderMode === "chronological" ? "active" : ""}`}
                onClick={() => setOrderMode("chronological")}
              >
                ⏳ {t.media_chronological_order || "Evren Kronolojisi (Hikaye)"}
              </button>
            )}
          </div>

          <div className="movie-series-modal-actions-right">
            <label className="movie-series-checkbox-label">
              <input
                type="checkbox"
                checked={onlyUnwatched}
                onChange={(e) =>
                  setOnlyUnwatched((e.target as HTMLInputElement).checked)
                }
              />
              <span>{t.media_filter_unwatched || "Sadece İzlemediklerim"}</span>
            </label>

            {progress.watchedCount < progress.totalMovies && (
              <button
                type="button"
                className="movie-series-add-all-btn"
                onClick={() => onBatchWatchlist(series)}
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
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>{t.media_add_all_watchlist || "Kalanları Listeme Ekle"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Timeline Body */}
        <div className="movie-series-timeline-container">
          {groupedItems.map((group, groupIdx) => (
            <div key={groupIdx} className="movie-series-timeline-group">
              {group.name && group.name !== "Tüm Filmler" && (
                <div className="movie-series-group-header">
                  <span className="group-header-line" />
                  <h4 className="group-header-title">{group.name}</h4>
                  <span className="group-header-line" />
                </div>
              )}

              <div className="movie-series-timeline-stream">
                <div className="timeline-spine-line" />

                {group.items.map((movie) => {
                  const itemProgress = progress.itemStatuses.find(
                    (st) => st.seriesItem.id === movie.id,
                  );
                  const isWatched = !!itemProgress?.isWatched;
                  const isWatchlist = !!itemProgress?.isWatchlist;
                  const userRating = itemProgress?.rating;

                  const orderBadge =
                    orderMode === "chronological" && movie.chronologicalOrder
                      ? `#${movie.chronologicalOrder}`
                      : `#${movie.releaseOrder}`;

                  return (
                    <div
                      key={movie.id}
                      className={`timeline-entry-row ${isWatched ? "is-watched" : ""} ${isWatchlist ? "is-watchlist" : ""}`}
                    >
                      {/* Timeline Node Point */}
                      <div className="timeline-node-point">
                        <div
                          className={`node-dot ${isWatched ? "watched" : isWatchlist ? "watchlist" : ""}`}
                        >
                          {isWatched ? "✓" : orderBadge}
                        </div>
                      </div>

                      {/* Movie Card */}
                      <div className="timeline-movie-card">
                        <div className="timeline-poster-wrapper">
                          <img
                            src={movie.coverUrl}
                            alt={movie.title}
                            className="timeline-poster-img"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                          <span className="timeline-year-badge">
                            {movie.releaseYear}
                          </span>
                        </div>

                        <div className="timeline-movie-content">
                          <div className="timeline-movie-top">
                            <div>
                              <h4 className="timeline-movie-title">
                                {movie.title}
                              </h4>
                              {movie.originalTitle &&
                                movie.originalTitle !== movie.title && (
                                  <span className="timeline-movie-orig">
                                    {movie.originalTitle}
                                  </span>
                                )}
                            </div>
                            <div className="timeline-movie-meta-pills">
                              <span className="timeline-imdb-pill">
                                ★ {movie.imdbRating?.toFixed(1) || "-"} IMDb
                              </span>
                              {movie.runtimeMinutes && (
                                <span className="timeline-runtime-pill">
                                  ⏱ {movie.runtimeMinutes} dk
                                </span>
                              )}
                            </div>
                          </div>

                          {movie.director && (
                            <p className="timeline-director">
                              Yönetmen: <span>{movie.director}</span>
                            </p>
                          )}

                          {movie.synopsis && (
                            <p className="timeline-synopsis">{movie.synopsis}</p>
                          )}

                          {/* Action Buttons Row */}
                          <div className="timeline-card-actions">
                            <button
                              type="button"
                              className={`timeline-btn-watched ${isWatched ? "active" : ""}`}
                              onClick={() => onToggleStatus(movie, "completed")}
                            >
                              <span className="btn-icon">
                                {isWatched ? "✓" : "○"}
                              </span>
                              <span>
                                {isWatched
                                  ? t.media_status_completed || "İzlendi"
                                  : t.media_mark_watched || "İzlendi Yap"}
                              </span>
                            </button>

                            <button
                              type="button"
                              className={`timeline-btn-watchlist ${isWatchlist ? "active" : ""}`}
                              onClick={() => onToggleStatus(movie, "backlog")}
                            >
                              <span className="btn-icon">
                                {isWatchlist ? "★" : "＋"}
                              </span>
                              <span>
                                {isWatchlist
                                  ? t.media_status_backlog || "İzleme Listemde"
                                  : t.media_add_watchlist || "İzleme Listeme Ekle"}
                              </span>
                            </button>

                            {/* Rating Selector if watched */}
                            {isWatched && (
                              <div className="timeline-rating-box">
                                <span className="timeline-rating-label">Puanın:</span>
                                <select
                                  className="timeline-rating-select"
                                  value={userRating || ""}
                                  onChange={(e) => {
                                    const val = Number((e.target as HTMLSelectElement).value);
                                    onToggleStatus(movie, "completed", val);
                                  }}
                                >
                                  <option value="">Puansız</option>
                                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                                    <option key={r} value={r}>
                                      ★ {r}/10
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {sortedItems.length === 0 && (
            <div className="movie-series-empty-timeline">
              <p>Tebrikler! Bu serideki tüm filmleri izlediniz. 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
