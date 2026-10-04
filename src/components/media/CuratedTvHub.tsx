import { useState, useMemo, useRef } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { CURATED_TV_SHOWS, CuratedTvItem } from "@/services/curatedCatalogData.js";
import { normalizeTitle } from "@/services/movieSeriesData.js";

interface CuratedTvHubProps {
  lang: Language;
  userItems: MediaItem[];
  tvShows?: CuratedTvItem[];
  onToggleTv: (
    tvShow: CuratedTvItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => void;
  statusFilter?: string;
  searchQuery?: string;
}

export function CuratedTvHub({
  lang,
  userItems,
  tvShows = CURATED_TV_SHOWS,
  onToggleTv,
  statusFilter = "all",
  searchQuery = "",
}: CuratedTvHubProps) {
  const t = getTranslation(lang);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [layoutMode, setLayoutMode] = useState<"shelf" | "grid">("grid");
  const shelfRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const set = new Set(tvShows.map((s) => s.category));
    return Array.from(set);
  }, [tvShows]);

  const sortedAndFilteredShows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return [...tvShows]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .filter((show) => {
        // Category filter
        if (selectedCategory !== "all" && show.category !== selectedCategory) {
          return false;
        }

        // Search filter
        if (q) {
          const matchTitle = show.title.toLowerCase().includes(q);
          const matchOrig = show.originalTitle
            ? show.originalTitle.toLowerCase().includes(q)
            : false;
          const matchCreator = show.creator.toLowerCase().includes(q);
          const matchGenre = show.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchTitle && !matchOrig && !matchCreator && !matchGenre) {return false;}
        }

        // Status filter
        if (statusFilter !== "all") {
          const showNorm = normalizeTitle(show.title);
          const origNorm = show.originalTitle ? normalizeTitle(show.originalTitle) : "";
          const userItem = userItems.find(
            (u) =>
              u.type === "tv" &&
              (normalizeTitle(u.title) === showNorm ||
                (origNorm && normalizeTitle(u.title) === origNorm)),
          );
          if (statusFilter === "completed" && userItem?.status !== "completed") {return false;}
          if (statusFilter === "in_progress" && userItem?.status !== "in_progress") {return false;}
          if (statusFilter === "backlog" && userItem?.status !== "backlog") {return false;}
        }

        return true;
      });
  }, [tvShows, selectedCategory, searchQuery, statusFilter, userItems]);

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
    <section className="curated-catalog-section tv-hub-section">
      {/* Header */}
      <div className="curated-catalog-header">
        <div className="curated-catalog-header-left">
          <div className="curated-catalog-badge tv-badge">
            <span>📺 Efsane Diziler & Mini-Seriler</span>
          </div>
          <h2 className="curated-catalog-title">
            {t.media_tv_catalog_title && t.media_tv_catalog_title !== "media_tv_catalog_title"
              ? t.media_tv_catalog_title
              : "Dünya Çapında Beğeni Toplayan Diziler"}
          </h2>
          <p className="curated-catalog-subtitle">
            {t.media_tv_catalog_subtitle && t.media_tv_catalog_subtitle !== "media_tv_catalog_subtitle"
              ? t.media_tv_catalog_subtitle
              : "IMDb puanları, sezon/bölüm sayıları ve türleriyle hazırlanmış dizi kataloğu. İzlediklerini veya izleme listeni tek tıkla işaretle."}
          </p>
        </div>

        {/* Layout Switcher & Shelf Arrows */}
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
          Tümü ({tvShows.length})
        </button>
        {categories.map((cat) => {
          const count = tvShows.filter((s) => s.category === cat).length;
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
        {sortedAndFilteredShows.map((show) => {
          const showNorm = normalizeTitle(show.title);
          const origNorm = show.originalTitle ? normalizeTitle(show.originalTitle) : "";
          const userItem = userItems.find(
            (u) =>
              u.type === "tv" &&
              (normalizeTitle(u.title) === showNorm ||
                (origNorm && normalizeTitle(u.title) === origNorm)),
          );
          const isWatched = userItem?.status === "completed";
          const isWatching = userItem?.status === "in_progress";
          const isWatchlist = userItem?.status === "backlog";
          const userRating = userItem?.rating;

          return (
            <div
              key={show.id}
              className={`curated-card tv-card ${isWatched ? "status-completed" : isWatching ? "status-in-progress" : isWatchlist ? "status-backlog" : ""}`}
            >
              <div className="curated-card-media">
                <img
                  src={show.coverUrl}
                  alt={show.title}
                  className="curated-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=500&q=80";
                  }}
                />
                <div className="curated-card-pills">
                  {show.rating !== undefined && (
                    <span className="curated-rating-pill">⭐ {show.rating.toFixed(1)}</span>
                  )}
                  {(show.totalSeasons !== undefined || show.totalEpisodes !== undefined) && (
                    <span className="curated-pages-pill">
                      {show.totalSeasons !== undefined ? `${show.totalSeasons} Sezon` : ""}
                      {show.totalSeasons !== undefined && show.totalEpisodes !== undefined ? " • " : ""}
                      {show.totalEpisodes !== undefined ? `${show.totalEpisodes} Bölüm` : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="curated-card-content">
                <div className="curated-card-header">
                  <div className="curated-genres-row">
                    <span className="curated-category-tag">{show.category}</span>
                    {show.genres.slice(0, 2).map((g) => (
                      <span key={g} className="curated-subgenre-tag">{g}</span>
                    ))}
                  </div>
                  <h3 className="curated-card-title">{show.title}</h3>
                  <p className="curated-card-creator">
                    {show.creator} • {show.releaseYear}{show.endYear ? ` - ${show.endYear}` : "..."}
                  </p>
                </div>

                <p className="curated-card-synopsis">{show.synopsis}</p>

                {/* Actions Row */}
                <div className="curated-card-actions">
                  <button
                    type="button"
                    className={`curated-action-btn btn-complete ${isWatched ? "active" : ""}`}
                    onClick={() => onToggleTv(show, "completed")}
                  >
                    <span>{isWatched ? "✓ Bitirildi" : "Bitirdim"}</span>
                  </button>

                  <button
                    type="button"
                    className={`curated-action-btn btn-progress ${isWatching ? "active" : ""}`}
                    onClick={() => onToggleTv(show, "in_progress")}
                  >
                    <span>{isWatching ? "📺 İzleniyor" : "İzliyorum"}</span>
                  </button>

                  <button
                    type="button"
                    className={`curated-action-btn btn-backlog ${isWatchlist ? "active" : ""}`}
                    onClick={() => onToggleTv(show, "backlog")}
                  >
                    <span>{isWatchlist ? "★ Listemde" : "＋ İzleyeceğim"}</span>
                  </button>
                </div>

                {/* Rating Dropdown (if completed or rated) */}
                {isWatched && (
                  <div className="curated-rating-row">
                    <span className="rating-label">Puanınız:</span>
                    <select
                      className="curated-rating-select"
                      value={userRating || ""}
                      onChange={(e) => {
                        const val = Number((e.target as HTMLSelectElement).value);
                        onToggleTv(show, "completed", val);
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
