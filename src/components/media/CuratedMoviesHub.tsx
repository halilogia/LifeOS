import { useState, useMemo, useRef } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { CURATED_MOVIES, CuratedMovieItem } from "@/services/curatedCatalogData.js";
import { normalizeTitle } from "@/services/movieSeriesData.js";

interface CuratedMoviesHubProps {
  lang: Language;
  userItems: MediaItem[];
  movies?: CuratedMovieItem[];
  onToggleMovie: (
    movie: CuratedMovieItem,
    targetStatus: "completed" | "backlog",
    rating?: number,
  ) => void;
  statusFilter?: string;
  searchQuery?: string;
}

export function CuratedMoviesHub({
  lang,
  userItems,
  movies = CURATED_MOVIES,
  onToggleMovie,
  statusFilter = "all",
  searchQuery = "",
}: CuratedMoviesHubProps) {
  const t = getTranslation(lang);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [layoutMode, setLayoutMode] = useState<"shelf" | "grid">("grid");
  const shelfRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const set = new Set(movies.map((m) => m.category || "Kült Filmler"));
    return Array.from(set);
  }, [movies]);

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return [...movies]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .filter((movie) => {
        // Category filter
        if (selectedCategory !== "all" && movie.category !== selectedCategory) {
          return false;
        }

        // Search filter
        if (q) {
          const matchTitle = movie.title.toLowerCase().includes(q);
          const matchOrig = movie.originalTitle
            ? movie.originalTitle.toLowerCase().includes(q)
            : false;
          const matchDirector = movie.director ? movie.director.toLowerCase().includes(q) : false;
          const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchTitle && !matchOrig && !matchDirector && !matchGenre) {return false;}
        }

        // Status filter
        if (statusFilter !== "all") {
          const movieNorm = normalizeTitle(movie.title);
          const origNorm = movie.originalTitle ? normalizeTitle(movie.originalTitle) : "";
          const userItem = userItems.find(
            (u) =>
              u.type === "movie" &&
              (normalizeTitle(u.title) === movieNorm ||
                (origNorm && normalizeTitle(u.title) === origNorm)),
          );
          if (statusFilter === "completed" && userItem?.status !== "completed") {return false;}
          if (statusFilter === "backlog" && userItem?.status !== "backlog") {return false;}
        }

        return true;
      });
  }, [movies, selectedCategory, searchQuery, statusFilter, userItems]);

  const handleScrollLeft = () => {
    if (shelfRef.current) {
      shelfRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (shelfRef.current) {
      shelfRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <section className="curated-catalog-section movies-hub-section">
      {/* Header */}
      <div className="curated-catalog-header">
        <div className="curated-catalog-header-left">
          <div className="curated-catalog-badge movie-badge">
            <span>🍿 IMDb Top Başyapıtlar</span>
          </div>
          <h2 className="curated-catalog-title">
            {t.media_movies_catalog_title && t.media_movies_catalog_title !== "media_movies_catalog_title"
              ? t.media_movies_catalog_title
              : "Sinema Tarihinin Zirvesindeki Kült Filmler"}
          </h2>
          <p className="curated-catalog-subtitle">
            {t.media_movies_catalog_subtitle && t.media_movies_catalog_subtitle !== "media_movies_catalog_subtitle"
              ? t.media_movies_catalog_subtitle
              : "Seri dışındaki kült başyapıtlar. İzlediklerini işaretle, izleme listene al ve puanla."}
          </p>
        </div>

        {/* Layout Switcher & Shelf Controls */}
        <div className="curated-catalog-header-controls">
          <div className="movie-series-layout-toggle" role="group" aria-label="Görünüm Modu">
            <button
              type="button"
              className={`layout-toggle-btn ${layoutMode === "shelf" ? "active" : ""}`}
              onClick={() => setLayoutMode("shelf")}
              title="Yatay Raf Görünümü"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>Raf</span>
            </button>
            <button
              type="button"
              className={`layout-toggle-btn ${layoutMode === "grid" ? "active" : ""}`}
              onClick={() => setLayoutMode("grid")}
              title="Izgara Görünümü"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Izgara</span>
            </button>
          </div>

          {layoutMode === "shelf" && (
            <div className="movie-series-nav-arrows">
              <button
                type="button"
                className="movie-series-arrow-btn"
                onClick={handleScrollLeft}
                aria-label="Sola kaydır"
                title="Sola Kaydır"
              >
                ‹
              </button>
              <button
                type="button"
                className="movie-series-arrow-btn"
                onClick={handleScrollRight}
                aria-label="Sağa kaydır"
                title="Sağa Kaydır"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="curated-genre-chips">
        <button
          type="button"
          className={`curated-chip ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          Tümü ({movies.length})
        </button>
        {categories.map((cat) => {
          const count = movies.filter((m) => m.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              className={`curated-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Content Container (Shelf or Grid) */}
      <div
        ref={shelfRef}
        className={layoutMode === "shelf" ? "curated-catalog-shelf" : "curated-catalog-grid"}
      >
        {filteredMovies.map((movie) => {
          const movieNorm = normalizeTitle(movie.title);
          const origNorm = movie.originalTitle ? normalizeTitle(movie.originalTitle) : "";
          const userItem = userItems.find(
            (u) =>
              u.type === "movie" &&
              (normalizeTitle(u.title) === movieNorm ||
                (origNorm && normalizeTitle(u.title) === origNorm)),
          );
          const isWatched = userItem?.status === "completed";
          const isWatchlist = userItem?.status === "backlog";
          const userRating = userItem?.rating;

          return (
            <div
              key={movie.id}
              className={`curated-card movie-card ${isWatched ? "status-completed" : isWatchlist ? "status-backlog" : ""}`}
            >
              <div className="curated-card-media">
                <img
                  src={movie.coverUrl}
                  alt={movie.title}
                  className="curated-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";
                  }}
                />
                <div className="curated-card-pills">
                  {movie.rating !== undefined && (
                    <span className="curated-rating-pill">⭐ {movie.rating.toFixed(1)}</span>
                  )}
                  {movie.runtimeMinutes !== undefined && (
                    <span className="curated-pages-pill">{movie.runtimeMinutes} dk</span>
                  )}
                </div>
              </div>

              <div className="curated-card-content">
                <div className="curated-card-header">
                  <div className="curated-genres-row">
                    <span className="curated-category-tag">{movie.category}</span>
                    {movie.genres.slice(0, 2).map((g) => (
                      <span key={g} className="curated-subgenre-tag">{g}</span>
                    ))}
                  </div>
                  <h3 className="curated-card-title">{movie.title}</h3>
                  <p className="curated-card-creator">
                    {movie.director || "Bilinmiyor"}
                    {movie.releaseYear ? ` • ${movie.releaseYear}` : ""}
                  </p>
                </div>

                {movie.synopsis && <p className="curated-card-synopsis">{movie.synopsis}</p>}

                {/* Actions Row */}
                <div className="curated-card-actions">
                  <button
                    type="button"
                    className={`curated-action-btn btn-complete ${isWatched ? "active" : ""}`}
                    onClick={() => onToggleMovie(movie, "completed")}
                  >
                    <span>{isWatched ? "✓ İzlendi" : "İzledim"}</span>
                  </button>

                  <button
                    type="button"
                    className={`curated-action-btn btn-backlog ${isWatchlist ? "active" : ""}`}
                    onClick={() => onToggleMovie(movie, "backlog")}
                  >
                    <span>{isWatchlist ? "★ Listemde" : "＋ İzleyeceğim"}</span>
                  </button>
                </div>

                {/* Rating Dropdown (if watched) */}
                {isWatched && (
                  <div className="curated-rating-row">
                    <span className="rating-label">Puanınız:</span>
                    <select
                      className="curated-rating-select"
                      value={userRating || ""}
                      onChange={(e) => {
                        const val = Number((e.target as HTMLSelectElement).value);
                        onToggleMovie(movie, "completed", val);
                      }}
                    >
                      <option value="">Puan Seç</option>
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
          );
        })}
      </div>
    </section>
  );
}
