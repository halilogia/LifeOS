import { useMemo } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { CURATED_MOVIES, CuratedMovieItem } from "@/services/curatedCatalogData.js";
import { normalizeTitle } from "@/services/movieSeriesData.js";

interface CuratedMoviesHubProps {
  lang: Language;
  userItems: MediaItem[];
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
  onToggleMovie,
  statusFilter = "all",
  searchQuery = "",
}: CuratedMoviesHubProps) {
  const t = getTranslation(lang);

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return CURATED_MOVIES.filter((movie) => {
      // Search filter
      if (q) {
        const matchTitle = movie.title.toLowerCase().includes(q);
        const matchDirector = movie.director.toLowerCase().includes(q);
        const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchTitle && !matchDirector && !matchGenre) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const movieNorm = normalizeTitle(movie.title);
        const origNorm = movie.originalTitle ? normalizeTitle(movie.originalTitle) : "";
        const userItem = userItems.find(
          (u) =>
            u.type === "movie" &&
            (normalizeTitle(u.title) === movieNorm || (origNorm && normalizeTitle(u.title) === origNorm)),
        );
        if (statusFilter === "completed" && userItem?.status !== "completed") return false;
        if (statusFilter === "backlog" && userItem?.status !== "backlog") return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, userItems]);

  return (
    <section className="curated-catalog-section">
      {/* Header */}
      <div className="curated-catalog-header">
        <div className="curated-catalog-header-left">
          <div className="curated-catalog-badge movie-badge">
            <span>🍿 IMDb Top Başyapıtlar</span>
          </div>
          <h2 className="curated-catalog-title">
            {t.media_movies_catalog_title || "Sinema Tarihinin Zirvesindeki Kült Filmler"}
          </h2>
          <p className="curated-catalog-subtitle">
            {t.media_movies_catalog_subtitle ||
              "Seri dışındaki kült başyapıtlar. İzlediklerini işaretle, izleme listene al ve puanla."}
          </p>
        </div>
      </div>

      {/* Grid of Movies */}
      <div className="curated-catalog-grid">
        {filteredMovies.map((movie) => {
          const movieNorm = normalizeTitle(movie.title);
          const origNorm = movie.originalTitle ? normalizeTitle(movie.originalTitle) : "";
          const userItem = userItems.find(
            (u) =>
              u.type === "movie" &&
              (normalizeTitle(u.title) === movieNorm || (origNorm && normalizeTitle(u.title) === origNorm)),
          );
          const isWatched = userItem?.status === "completed";
          const isWishlist = userItem?.status === "backlog";
          const userRating = userItem?.rating;

          return (
            <div
              key={movie.id}
              className={`curated-card movie-card ${isWatched ? "status-completed" : isWishlist ? "status-backlog" : ""}`}
            >
              <div className="curated-card-media">
                <img
                  src={movie.coverUrl}
                  alt={movie.title}
                  className="curated-card-cover"
                  loading="lazy"
                />
                <div className="curated-card-pills">
                  <span className="curated-rating-pill">★ {movie.rating.toFixed(1)} IMDb</span>
                  <span className="curated-pages-pill">{movie.runtimeMinutes} dk</span>
                </div>
              </div>

              <div className="curated-card-content">
                <div className="curated-card-header">
                  <span className="curated-category-tag">{movie.releaseYear} • {movie.genres.join(", ")}</span>
                  <h3 className="curated-card-title">{movie.title}</h3>
                  <p className="curated-card-creator">Yönetmen: {movie.director}</p>
                </div>

                <p className="curated-card-synopsis">{movie.synopsis}</p>

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
                    className={`curated-action-btn btn-backlog ${isWishlist ? "active" : ""}`}
                    onClick={() => onToggleMovie(movie, "backlog")}
                  >
                    <span>{isWishlist ? "★ İzleme Listemde" : "＋ İzleyeceğim"}</span>
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
