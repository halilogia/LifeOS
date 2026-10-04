import { useState, useMemo, useEffect } from "preact/hooks";
import type { Language } from "@/types/types.js";
import type { MediaItem, MovieSeries } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";
import {
  CURATED_MOVIES,
  CURATED_TV_SHOWS,
  CURATED_BOOKS,
  CURATED_GAMES,
  CuratedMovieItem,
  CuratedTvItem,
  CuratedBookItem,
  CuratedGameItem,
} from "@/services/curatedCatalogData.js";
import { getMovieSeriesList, normalizeTitle } from "@/services/movieSeriesData.js";
import {
  searchInternetMedia,
  type WebSearchResultItem,
} from "@/services/mediaInternetSyncService.js";

interface MediaSearchResultsViewProps {
  lang: Language;
  searchQuery: string;
  userItems: MediaItem[];
  curatedMovies?: CuratedMovieItem[];
  curatedTvShows?: CuratedTvItem[];
  curatedBooks?: CuratedBookItem[];
  curatedGames?: CuratedGameItem[];
  onOpenSeriesTimeline: (series: MovieSeries) => void;
  onToggleMovie: (
    movie: CuratedMovieItem,
    targetStatus: "completed" | "backlog",
    rating?: number,
  ) => void;
  onToggleTv: (
    tv: CuratedTvItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => void;
  onToggleBook: (
    book: CuratedBookItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => void;
  onToggleGame: (
    game: CuratedGameItem,
    targetStatus: "completed" | "in_progress" | "backlog",
    rating?: number,
  ) => void;
  onClearSearch: () => void;
}

type SearchCategoryFilter = "all" | "series" | "movie" | "tv" | "book" | "game" | "web";

export function MediaSearchResultsView({
  lang,
  searchQuery,
  userItems,
  curatedMovies = CURATED_MOVIES,
  curatedTvShows = CURATED_TV_SHOWS,
  curatedBooks = CURATED_BOOKS,
  curatedGames = CURATED_GAMES,
  onOpenSeriesTimeline,
  onToggleMovie,
  onToggleTv,
  onToggleBook,
  onToggleGame,
  onClearSearch,
}: MediaSearchResultsViewProps) {
  const t = getTranslation(lang);
  const [activeCategory, setActiveCategory] = useState<SearchCategoryFilter>("all");
  const [webResults, setWebResults] = useState<WebSearchResultItem[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [hasSearchedWeb, setHasSearchedWeb] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const allSeries = useMemo(() => getMovieSeriesList(), []);

  // 1. Matching Movie Series (matches series or any movie in series)
  const matchingSeries = useMemo(() => {
    if (!q) {return [];}
    return allSeries.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchOrig = s.originalTitle ? s.originalTitle.toLowerCase().includes(q) : false;
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchMovies = s.items.some(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(q)),
      );
      return matchTitle || matchOrig || matchDesc || matchMovies;
    });
  }, [allSeries, q]);

  // 2. Matching Standalone Movies
  const matchingMovies = useMemo(() => {
    if (!q) {return [];}
    return curatedMovies.filter((m) => {
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchOrig = m.originalTitle ? m.originalTitle.toLowerCase().includes(q) : false;
      const matchDirector = m.director.toLowerCase().includes(q);
      const matchGenre = m.genres.some((g) => g.toLowerCase().includes(q));
      return matchTitle || matchOrig || matchDirector || matchGenre;
    });
  }, [curatedMovies, q]);

  // 3. Matching TV Shows
  const matchingTv = useMemo(() => {
    if (!q) {return [];}
    return curatedTvShows.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchOrig = s.originalTitle ? s.originalTitle.toLowerCase().includes(q) : false;
      const matchCreator = s.creator.toLowerCase().includes(q);
      const matchGenre = s.genres.some((g) => g.toLowerCase().includes(q));
      return matchTitle || matchOrig || matchCreator || matchGenre;
    });
  }, [curatedTvShows, q]);

  // 4. Matching Books
  const matchingBooks = useMemo(() => {
    if (!q) {return [];}
    return curatedBooks.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.author.toLowerCase().includes(q);
      const matchCat = b.category.toLowerCase().includes(q);
      const matchGenre = b.genres.some((g) => g.toLowerCase().includes(q));
      return matchTitle || matchAuthor || matchCat || matchGenre;
    });
  }, [curatedBooks, q]);

  // 5. Matching Games
  const matchingGames = useMemo(() => {
    if (!q) {return [];}
    return curatedGames.filter((g) => {
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchDev = g.developer.toLowerCase().includes(q);
      const matchCat = g.category.toLowerCase().includes(q);
      const matchGenre = g.genres.some((gen) => gen.toLowerCase().includes(q));
      return matchTitle || matchDev || matchCat || matchGenre;
    });
  }, [curatedGames, q]);

  const totalLocalMatches =
    matchingSeries.length +
    matchingMovies.length +
    matchingTv.length +
    matchingBooks.length +
    matchingGames.length;

  // Reset web search when query changes
  useEffect(() => {
    setWebResults([]);
    setHasSearchedWeb(false);
  }, [searchQuery]);

  const handleLiveWebSearch = async () => {
    if (!q) {return;}
    setIsSearchingWeb(true);
    try {
      const results = await searchInternetMedia(q);
      setWebResults(results);
      setHasSearchedWeb(true);
      setActiveCategory("web");
    } catch {
      setHasSearchedWeb(true);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  return (
    <div className="media-global-search-results">
      {/* Top Search Overview Header */}
      <div className="search-results-banner">
        <div className="search-results-banner-left">
          <span className="search-lens-icon">🔍</span>
          <div>
            <h2 className="search-banner-title">
              "{searchQuery}" için arama sonuçları
            </h2>
            <p className="search-banner-stats">
              {totalLocalMatches > 0
                ? `Yerel katalogda toplam ${totalLocalMatches} içerik bulundu.`
                : "Yerel katalogda eşleşme bulunamadı. Aşağıdan internette canlı arama yapabilirsiniz."}
            </p>
          </div>
        </div>

        <div className="search-results-banner-actions">
          <button
            type="button"
            className="search-clear-action-btn"
            onClick={onClearSearch}
            title="Aramayı Temizle ve Normale Dön"
          >
            ✕ Aramayı Temizle
          </button>
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div className="search-category-filter-chips">
        <button
          type="button"
          className={`search-chip ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          🌟 Tümü ({totalLocalMatches})
        </button>

        {matchingSeries.length > 0 && (
          <button
            type="button"
            className={`search-chip ${activeCategory === "series" ? "active" : ""}`}
            onClick={() => setActiveCategory("series")}
          >
            🎬 Film Serileri ({matchingSeries.length})
          </button>
        )}

        {matchingMovies.length > 0 && (
          <button
            type="button"
            className={`search-chip ${activeCategory === "movie" ? "active" : ""}`}
            onClick={() => setActiveCategory("movie")}
          >
            🍿 Kült Filmler ({matchingMovies.length})
          </button>
        )}

        {matchingTv.length > 0 && (
          <button
            type="button"
            className={`search-chip ${activeCategory === "tv" ? "active" : ""}`}
            onClick={() => setActiveCategory("tv")}
          >
            📺 Diziler ({matchingTv.length})
          </button>
        )}

        {matchingBooks.length > 0 && (
          <button
            type="button"
            className={`search-chip ${activeCategory === "book" ? "active" : ""}`}
            onClick={() => setActiveCategory("book")}
          >
            📚 Kitaplar ({matchingBooks.length})
          </button>
        )}

        {matchingGames.length > 0 && (
          <button
            type="button"
            className={`search-chip ${activeCategory === "game" ? "active" : ""}`}
            onClick={() => setActiveCategory("game")}
          >
            🎮 Oyunlar ({matchingGames.length})
          </button>
        )}

        <button
          type="button"
          className={`search-chip web-search-chip ${activeCategory === "web" ? "active" : ""}`}
          onClick={handleLiveWebSearch}
          disabled={isSearchingWeb}
        >
          {isSearchingWeb ? "🌐 Aranıyor..." : `🌐 Canlı Web Ara ${webResults.length > 0 ? `(${webResults.length})` : ""}`}
        </button>
      </div>

      {/* 1. MATCHING MOVIE SERIES */}
      {(activeCategory === "all" || activeCategory === "series") && matchingSeries.length > 0 && (
        <section className="search-group-section">
          <div className="search-group-header">
            <span className="search-group-badge">🎬 Film Serileri</span>
            <span className="search-group-count">{matchingSeries.length} seri eşleşti</span>
          </div>
          <div className="curated-catalog-grid">
            {matchingSeries.map((series) => {
              const matchedContainedMovie = series.items.find(
                (m) =>
                  m.title.toLowerCase().includes(q) ||
                  (m.originalTitle && m.originalTitle.toLowerCase().includes(q)),
              );

              return (
                <div key={series.id} className="curated-card series-search-card">
                  <div className="curated-card-media">
                    <img
                      src={series.bannerUrl}
                      alt={series.title}
                      className="curated-card-cover"
                      loading="lazy"
                    />
                    <div className="curated-card-pills">
                      <span className="curated-rating-pill">⭐ {series.averageRating.toFixed(1)}</span>
                      <span className="curated-pages-pill">{series.totalMovies} Film</span>
                    </div>
                  </div>
                  <div className="curated-card-content">
                    <div className="curated-card-header">
                      <div className="curated-genres-row">
                        {series.genres.slice(0, 3).map((g) => (
                          <span key={g} className="curated-subgenre-tag">{g}</span>
                        ))}
                      </div>
                      <h3 className="curated-card-title">{series.title}</h3>
                      {matchedContainedMovie && (
                        <p className="search-matched-item-hint">
                          🎯 İçerir: <strong>{matchedContainedMovie.title}</strong> ({matchedContainedMovie.releaseYear})
                        </p>
                      )}
                    </div>
                    <p className="curated-card-synopsis">{series.description}</p>
                    <div className="curated-card-actions">
                      <button
                        type="button"
                        className="curated-action-btn btn-progress active"
                        onClick={() => onOpenSeriesTimeline(series)}
                      >
                        <span>🎬 Zaman Çizelgesini Aç</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. MATCHING STANDALONE MOVIES */}
      {(activeCategory === "all" || activeCategory === "movie") && matchingMovies.length > 0 && (
        <section className="search-group-section">
          <div className="search-group-header">
            <span className="search-group-badge">🍿 Kült Filmler</span>
            <span className="search-group-count">{matchingMovies.length} film eşleşti</span>
          </div>
          <div className="curated-catalog-grid">
            {matchingMovies.map((movie) => {
              const movieNorm = normalizeTitle(movie.title);
              const userItem = userItems.find(
                (u) => u.type === "movie" && normalizeTitle(u.title) === movieNorm,
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
                    <img src={movie.coverUrl} alt={movie.title} className="curated-card-cover" loading="lazy" />
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
                      <p className="curated-card-creator">{movie.director} • {movie.releaseYear}</p>
                    </div>
                    <p className="curated-card-synopsis">{movie.synopsis}</p>
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
                            <option key={r} value={r}>★ {r}/10</option>
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
      )}

      {/* 3. MATCHING TV SHOWS */}
      {(activeCategory === "all" || activeCategory === "tv") && matchingTv.length > 0 && (
        <section className="search-group-section">
          <div className="search-group-header">
            <span className="search-group-badge">📺 Diziler</span>
            <span className="search-group-count">{matchingTv.length} dizi eşleşti</span>
          </div>
          <div className="curated-catalog-grid">
            {matchingTv.map((show) => {
              const showNorm = normalizeTitle(show.title);
              const userItem = userItems.find(
                (u) => u.type === "tv" && normalizeTitle(u.title) === showNorm,
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
                    <img src={show.coverUrl} alt={show.title} className="curated-card-cover" loading="lazy" />
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
                      <p className="curated-card-creator">{show.creator} • {show.releaseYear}</p>
                    </div>
                    <p className="curated-card-synopsis">{show.synopsis}</p>
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
                            <option key={r} value={r}>★ {r}/10</option>
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
      )}

      {/* 4. MATCHING BOOKS */}
      {(activeCategory === "all" || activeCategory === "book") && matchingBooks.length > 0 && (
        <section className="search-group-section">
          <div className="search-group-header">
            <span className="search-group-badge">📚 Kitaplar</span>
            <span className="search-group-count">{matchingBooks.length} kitap eşleşti</span>
          </div>
          <div className="curated-catalog-grid">
            {matchingBooks.map((book) => {
              const bookNorm = normalizeTitle(book.title);
              const userItem = userItems.find(
                (u) => u.type === "book" && normalizeTitle(u.title) === bookNorm,
              );
              const isRead = userItem?.status === "completed";
              const isReading = userItem?.status === "in_progress";
              const isWishlist = userItem?.status === "backlog";
              const userRating = userItem?.rating;

              return (
                <div
                  key={book.id}
                  className={`curated-card book-card ${isRead ? "status-completed" : isReading ? "status-in-progress" : isWishlist ? "status-backlog" : ""}`}
                >
                  <div className="curated-card-media">
                    <img src={book.coverUrl} alt={book.title} className="curated-card-cover" loading="lazy" />
                    <div className="curated-card-pills">
                      {book.rating !== undefined && (
                        <span className="curated-rating-pill">★ {book.rating.toFixed(1)}</span>
                      )}
                      {book.totalPages !== undefined && (
                        <span className="curated-pages-pill">{book.totalPages} sf.</span>
                      )}
                    </div>
                  </div>
                  <div className="curated-card-content">
                    <div className="curated-card-header">
                      <span className="curated-category-tag">{book.category}</span>
                      <h3 className="curated-card-title">{book.title}</h3>
                      <p className="curated-card-creator">{book.author} • {book.releaseYear}</p>
                    </div>
                    <p className="curated-card-synopsis">{book.synopsis}</p>
                    <div className="curated-card-actions">
                      <button
                        type="button"
                        className={`curated-action-btn btn-complete ${isRead ? "active" : ""}`}
                        onClick={() => onToggleBook(book, "completed")}
                      >
                        <span>{isRead ? "✓ Okundu" : "Okudum"}</span>
                      </button>
                      <button
                        type="button"
                        className={`curated-action-btn btn-progress ${isReading ? "active" : ""}`}
                        onClick={() => onToggleBook(book, "in_progress")}
                      >
                        <span>{isReading ? "📖 Okunuyor" : "Okuyorum"}</span>
                      </button>
                      <button
                        type="button"
                        className={`curated-action-btn btn-backlog ${isWishlist ? "active" : ""}`}
                        onClick={() => onToggleBook(book, "backlog")}
                      >
                        <span>{isWishlist ? "★ Listemde" : "＋ Okuyacağım"}</span>
                      </button>
                    </div>
                    {isRead && (
                      <div className="curated-rating-row">
                        <span className="rating-label">Puanınız:</span>
                        <select
                          className="curated-rating-select"
                          value={userRating || ""}
                          onChange={(e) => {
                            const val = Number((e.target as HTMLSelectElement).value);
                            onToggleBook(book, "completed", val);
                          }}
                        >
                          <option value="">Puan Seç</option>
                          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>★ {r}/10</option>
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
      )}

      {/* 5. MATCHING GAMES */}
      {(activeCategory === "all" || activeCategory === "game") && matchingGames.length > 0 && (
        <section className="search-group-section">
          <div className="search-group-header">
            <span className="search-group-badge">🎮 Oyunlar</span>
            <span className="search-group-count">{matchingGames.length} oyun eşleşti</span>
          </div>
          <div className="curated-catalog-grid">
            {matchingGames.map((game) => {
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
                    <img src={game.coverUrl} alt={game.title} className="curated-card-cover" loading="lazy" />
                    <div className="curated-card-pills">
                      {game.rating !== undefined && (
                        <span className="curated-rating-pill">★ {game.rating.toFixed(1)}</span>
                      )}
                      {game.playtimeHours !== undefined && (
                        <span className="curated-pages-pill">⏱ ~{game.playtimeHours}h</span>
                      )}
                    </div>
                  </div>
                  <div className="curated-card-content">
                    <div className="curated-card-header">
                      <span className="curated-category-tag">{game.category}</span>
                      <h3 className="curated-card-title">{game.title}</h3>
                      <p className="curated-card-creator">{game.developer} • {game.releaseYear}</p>
                    </div>
                    <p className="curated-card-synopsis">{game.synopsis}</p>
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
                            <option key={r} value={r}>★ {r}/10</option>
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
      )}

      {/* 6. LIVE WEB SEARCH RESULTS SECTION */}
      {(activeCategory === "web" || (totalLocalMatches === 0 && !hasSearchedWeb)) && (
        <section className="search-web-results-section">
          <div className="search-web-cta-box">
            <div className="search-web-cta-text">
              <h3>🌐 İnternet Veritabanında Canlı Ara</h3>
              <p>
                Aradığınız film, dizi veya eser yerel katalogda yoksa, açık web API'lerinden anında aratıp tek tıkla kütüphanenize ekleyebilirsiniz.
              </p>
            </div>
            <button
              type="button"
              className="search-web-cta-btn"
              onClick={handleLiveWebSearch}
              disabled={isSearchingWeb}
            >
              {isSearchingWeb ? "🔄 İnternette Aranıyor..." : `🔎 "${searchQuery}" için Web'de Canlı Ara`}
            </button>
          </div>

          {webResults.length > 0 && (
            <div className="search-web-results-list">
              <div className="search-group-header">
                <span className="search-group-badge web-badge">🌐 İnternetten Bulunanlar</span>
                <span className="search-group-count">{webResults.length} sonuç</span>
              </div>
              <div className="curated-catalog-grid">
                {webResults.map((item) => (
                  <div key={item.id} className="curated-card web-result-card">
                    <div className="curated-card-media">
                      <img src={item.coverUrl} alt={item.title} className="curated-card-cover" loading="lazy" />
                      <div className="curated-card-pills">
                        {item.rating !== undefined && (
                          <span className="curated-rating-pill">⭐ {item.rating.toFixed(1)}</span>
                        )}
                        {item.extraInfo && <span className="curated-pages-pill">{item.extraInfo}</span>}
                      </div>
                    </div>
                    <div className="curated-card-content">
                      <div className="curated-card-header">
                        <span className="curated-category-tag">{item.category}</span>
                        <h3 className="curated-card-title">{item.title}</h3>
                        <p className="curated-card-creator">{item.creator} • {item.releaseYear}</p>
                      </div>
                      <p className="curated-card-synopsis">{item.synopsis}</p>
                      <div className="curated-card-actions">
                        <button
                          type="button"
                          className="curated-action-btn btn-complete"
                          onClick={() => {
                            if (item.rawTvItem) {
                              onToggleTv(item.rawTvItem, "completed");
                            }
                          }}
                        >
                          <span>✓ İzlendi Olarak Ekle</span>
                        </button>
                        <button
                          type="button"
                          className="curated-action-btn btn-backlog"
                          onClick={() => {
                            if (item.rawTvItem) {
                              onToggleTv(item.rawTvItem, "backlog");
                            }
                          }}
                        >
                          <span>➕ İzleme Listeme Al</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSearchedWeb && webResults.length === 0 && !isSearchingWeb && (
            <div className="search-no-web-results">
              <p>İnternet aramasında bu başlıkla eşleşen içerik bulunamadı. Lütfen farklı anahtar kelimelerle deneyin.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
