import { useState } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem, MovieSeries } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import {
  getMovieSeriesList,
  computeSeriesProgress,
} from "@/services/movieSeriesData.js";

interface MovieSeriesHubProps {
  lang: Language;
  userItems: MediaItem[];
  onOpenTimeline: (series: MovieSeries) => void;
  onBatchWatchlist?: (series: MovieSeries) => void;
  isStandaloneTab?: boolean;
}

export function MovieSeriesHub({
  lang,
  userItems,
  onOpenTimeline,
  onBatchWatchlist,
  isStandaloneTab = false,
}: MovieSeriesHubProps) {
  const t = getTranslation(lang);
  const seriesList = getMovieSeriesList();
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const allGenres = Array.from(
    new Set(seriesList.flatMap((s) => s.genres)),
  ).slice(0, 8);

  const filteredSeries = seriesList.filter((s) => {
    if (selectedGenre === "all") return true;
    return s.genres.includes(selectedGenre);
  });

  return (
    <section className={`movie-series-hub-section ${isStandaloneTab ? "standalone" : ""}`}>
      {/* Shelf Header */}
      <div className="movie-series-hub-header">
        <div className="movie-series-hub-header-left">
          <div className="movie-series-hub-badge">
            <span className="movie-series-fire-icon">🔥</span>
            <span>{t.media_series_badge || "Koleksiyonlar & Seriler"}</span>
          </div>
          <h2 className="movie-series-hub-title">
            {t.media_series_title || "Popüler Film Serileri & Evrenler"}
          </h2>
          <p className="movie-series-hub-subtitle">
            {t.media_series_subtitle ||
              "Web'den hazır çekilmiş efsane seriler. Tek tıkla izleme listeni oluştur, kronolojik zaman çizelgesini takip et."}
          </p>
        </div>

        {/* Quick Genre Filter Chips */}
        <div className="movie-series-genre-chips">
          <button
            type="button"
            className={`movie-series-chip ${selectedGenre === "all" ? "active" : ""}`}
            onClick={() => setSelectedGenre("all")}
          >
            {t.media_tab_all || "Tümü"}
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`movie-series-chip ${selectedGenre === genre ? "active" : ""}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scrollable Shelf of Series Cards */}
      <div className="movie-series-shelf" role="region" aria-label="Film Serileri">
        {filteredSeries.map((series) => {
          const progress = computeSeriesProgress(series, userItems);
          const isComplete = progress.percent === 100;

          return (
            <div key={series.id} className="movie-series-card">
              {/* Card Banner Backdrop */}
              <div
                className="movie-series-card-banner"
                style={{ backgroundImage: `url(${series.bannerUrl})` }}
              >
                <div className="movie-series-banner-overlay" />
                <div className="movie-series-top-pills">
                  <span className="movie-series-count-pill">
                    🎬 {series.totalMovies} {t.media_tab_movie || "Film"}
                  </span>
                  <span className="movie-series-rating-pill">
                    ★ {series.averageRating.toFixed(1)} IMDb
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="movie-series-card-body">
                <h3 className="movie-series-card-title">{series.title}</h3>
                <p className="movie-series-card-desc">{series.description}</p>

                {/* Mini Timeline Dots Preview */}
                <div className="movie-series-mini-timeline">
                  <div className="movie-series-mini-timeline-label">
                    <span>{t.media_timeline_preview || "Zaman Çizelgesi:"}</span>
                    <span className="movie-series-years-span">
                      {series.items[0]?.releaseYear} -{" "}
                      {series.items[series.items.length - 1]?.releaseYear}
                    </span>
                  </div>
                  <div className="movie-series-dots-row">
                    {series.items.slice(0, 10).map((movie, idx) => {
                      const itemStatus = progress.itemStatuses.find(
                        (st) => st.seriesItem.id === movie.id,
                      );
                      const isWatched = itemStatus?.isWatched;
                      const isWatchlist = itemStatus?.isWatchlist;

                      return (
                        <div
                          key={movie.id}
                          className={`movie-series-dot ${
                            isWatched
                              ? "watched"
                              : isWatchlist
                                ? "watchlist"
                                : ""
                          }`}
                          title={`${movie.releaseYear} - ${movie.title} (${
                            isWatched
                              ? "İzlendi"
                              : isWatchlist
                                ? "İzleme Listesinde"
                                : "İzlenmedi"
                          })`}
                        >
                          <span className="dot-index">{idx + 1}</span>
                        </div>
                      );
                    })}
                    {series.items.length > 10 && (
                      <span className="movie-series-dots-more">
                        +{series.items.length - 10}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Next Up */}
                <div className="movie-series-progress-box">
                  <div className="movie-series-progress-labels">
                    <span>
                      {progress.watchedCount} / {progress.totalMovies} İzlendi
                    </span>
                    <span className="movie-series-progress-percent">
                      %{progress.percent}
                    </span>
                  </div>
                  <div className="movie-series-progress-track">
                    <div
                      className={`movie-series-progress-fill ${isComplete ? "complete" : ""}`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>

                  {progress.nextUpItem && !isComplete && (
                    <div className="movie-series-next-up">
                      <span className="next-up-tag">Sıradaki:</span>
                      <span className="next-up-title" title={progress.nextUpItem.title}>
                        {progress.nextUpItem.title} ({progress.nextUpItem.releaseYear})
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="movie-series-card-footer">
                  <button
                    type="button"
                    className="movie-series-open-btn"
                    onClick={() => onOpenTimeline(series)}
                  >
                    <span>{t.media_open_timeline || "Zaman Çizelgesini Aç"}</span>
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
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {onBatchWatchlist && progress.watchedCount < progress.totalMovies && (
                    <button
                      type="button"
                      className="movie-series-quick-add-btn"
                      title={t.media_add_all_watchlist || "Kalanları İzleme Listeme Ekle"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBatchWatchlist(series);
                      }}
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
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
