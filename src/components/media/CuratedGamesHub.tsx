import { useState, useMemo } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import { CURATED_GAMES, CuratedGameItem } from "@/services/curatedCatalogData.js";
import { normalizeTitle } from "@/services/movieSeriesData.js";

interface CuratedGamesHubProps {
  lang: Language;
  userItems: MediaItem[];
  games?: CuratedGameItem[];
  onToggleGame: (
    game: CuratedGameItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => void;
  statusFilter?: string;
  searchQuery?: string;
}

export function CuratedGamesHub({
  lang,
  userItems,
  games = CURATED_GAMES,
  onToggleGame,
  statusFilter = "all",
  searchQuery = "",
}: CuratedGamesHubProps) {
  const t = getTranslation(lang);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(games.map((g) => g.category));
    return Array.from(set);
  }, [games]);

  // Sorted by acclaim (highest rating first)
  const sortedAndFilteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return [...games]
      .sort((a, b) => b.rating - a.rating)
      .filter((game) => {
        // Category filter
        if (selectedCategory !== "all" && game.category !== selectedCategory) {
          return false;
        }

        // Search filter
        if (q) {
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchDev = game.developer.toLowerCase().includes(q);
          const matchGenre = game.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchTitle && !matchDev && !matchGenre) return false;
        }

        // Status filter
        if (statusFilter !== "all") {
          const gameNorm = normalizeTitle(game.title);
          const userItem = userItems.find(
            (u) => u.type === "game" && normalizeTitle(u.title) === gameNorm,
          );
          if (statusFilter === "completed" && userItem?.status !== "completed") return false;
          if (statusFilter === "in_progress" && userItem?.status !== "in_progress") return false;
          if (statusFilter === "backlog" && userItem?.status !== "backlog") return false;
        }

        return true;
      });
  }, [selectedCategory, searchQuery, statusFilter, userItems]);

  return (
    <section className="curated-catalog-section">
      {/* Header */}
      <div className="curated-catalog-header">
        <div className="curated-catalog-header-left">
          <div className="curated-catalog-badge game-badge">
            <span>🎮 En İyi & Başyapıt Oyunlar</span>
          </div>
          <h2 className="curated-catalog-title">
            {t.media_games_catalog_title || "Ödüllü & Zirvedeki Video Oyunları"}
          </h2>
          <p className="curated-catalog-subtitle">
            {t.media_games_catalog_subtitle ||
              "Metacritic ve oyuncu değerlendirmelerine göre sıralanmış başyapıtlar. Oynadıklarını veya oynayacaklarını tek tıkla işaretle."}
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="curated-genre-chips">
          <button
            type="button"
            className={`curated-chip ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            Tümü ({CURATED_GAMES.length})
          </button>
          {categories.map((cat) => {
            const count = CURATED_GAMES.filter((g) => g.category === cat).length;
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
      </div>

      {/* Grid of Games */}
      <div className="curated-catalog-grid">
        {sortedAndFilteredGames.map((game) => {
          const gameNorm = normalizeTitle(game.title);
          const userItem = userItems.find(
            (u) => u.type === "game" && normalizeTitle(u.title) === gameNorm,
          );
          const isPlayed = userItem?.status === "completed";
          const isPlaying = userItem?.status === "in_progress";
          const isWishlist = userItem?.status === "backlog";
          const userRating = userItem?.rating;

          return (
            <div
              key={game.id}
              className={`curated-card game-card ${isPlayed ? "status-completed" : isPlaying ? "status-in-progress" : isWishlist ? "status-backlog" : ""}`}
            >
              <div className="curated-card-media">
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="curated-card-cover"
                  loading="lazy"
                />
                <div className="curated-card-pills">
                  <span className="curated-rating-pill">★ {game.rating.toFixed(1)}</span>
                  <span className="curated-pages-pill">⏱ ~{game.playtimeHours}h</span>
                </div>
              </div>

              <div className="curated-card-content">
                <div className="curated-card-header">
                  <span className="curated-category-tag">{game.category}</span>
                  <h3 className="curated-card-title">{game.title}</h3>
                  <p className="curated-card-creator">{game.developer} • {game.releaseYear}</p>
                </div>

                <p className="curated-card-synopsis">{game.synopsis}</p>

                {/* Actions Row */}
                <div className="curated-card-actions">
                  <button
                    type="button"
                    className={`curated-action-btn btn-complete ${isPlayed ? "active" : ""}`}
                    onClick={() => onToggleGame(game, "completed")}
                  >
                    <span>{isPlayed ? "✓ Bitirildi" : "Bitirdim"}</span>
                  </button>

                  <button
                    type="button"
                    className={`curated-action-btn btn-progress ${isPlaying ? "active" : ""}`}
                    onClick={() => onToggleGame(game, "in_progress")}
                  >
                    <span>{isPlaying ? "🎮 Oynanıyor" : "Oynuyorum"}</span>
                  </button>

                  <button
                    type="button"
                    className={`curated-action-btn btn-backlog ${isWishlist ? "active" : ""}`}
                    onClick={() => onToggleGame(game, "backlog")}
                  >
                    <span>{isWishlist ? "★ Listemde" : "＋ Oynayacağım"}</span>
                  </button>
                </div>

                {/* Rating Dropdown (if completed) */}
                {isPlayed && (
                  <div className="curated-rating-row">
                    <span className="rating-label">Puanınız:</span>
                    <select
                      className="curated-rating-select"
                      value={userRating || ""}
                      onChange={(e) => {
                        const val = Number((e.target as HTMLSelectElement).value);
                        onToggleGame(game, "completed", val);
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
