import { useEffect } from "preact/hooks";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { useMediaStore } from "@/presentation/store/mediaStore.js";
import { MediaStatsOverview } from "./MediaStatsOverview.js";
import { MediaToolbar } from "./MediaToolbar.js";
import { MovieSeriesHub } from "./MovieSeriesHub.js";
import { MovieSeriesTimelineModal } from "./MovieSeriesTimelineModal.js";
import { CuratedBooksHub } from "./CuratedBooksHub.js";
import { CuratedGamesHub } from "./CuratedGamesHub.js";
import { CuratedMoviesHub } from "./CuratedMoviesHub.js";
import { CuratedTvHub } from "./CuratedTvHub.js";
import { MediaSearchResultsView } from "./MediaSearchResultsView.js";

interface MediaViewProps {
  lang: Language;
}

export function MediaView({ lang }: MediaViewProps) {
  const t = getTranslation(lang);

  const items = useMediaStore((s) => s.items);
  const stats = useMediaStore((s) => s.stats);
  const activeTypeFilter = useMediaStore((s) => s.activeTypeFilter);
  const activeStatusFilter = useMediaStore((s) => s.activeStatusFilter);
  const searchQuery = useMediaStore((s) => s.searchQuery);
  const sortBy = useMediaStore((s) => s.sortBy);

  const curatedTvShows = useMediaStore((s) => s.curatedTvShows);
  const curatedMovies = useMediaStore((s) => s.curatedMovies);
  const curatedBooks = useMediaStore((s) => s.curatedBooks);
  const curatedGames = useMediaStore((s) => s.curatedGames);
  const isSyncingWeb = useMediaStore((s) => s.isSyncingWeb);
  const syncWebCatalog = useMediaStore((s) => s.syncWebCatalog);

  const selectedSeriesForTimeline = useMediaStore(
    (s) => s.selectedSeriesForTimeline,
  );
  const isSeriesTimelineOpen = useMediaStore((s) => s.isSeriesTimelineOpen);

  const loadItems = useMediaStore((s) => s.loadItems);
  const toggleSeriesItem = useMediaStore((s) => s.toggleSeriesItem);
  const batchAddSeriesToWatchlist = useMediaStore(
    (s) => s.batchAddSeriesToWatchlist,
  );
  const toggleCuratedBook = useMediaStore((s) => s.toggleCuratedBook);
  const toggleCuratedGame = useMediaStore((s) => s.toggleCuratedGame);
  const toggleCuratedMovie = useMediaStore((s) => s.toggleCuratedMovie);
  const toggleCuratedTv = useMediaStore((s) => s.toggleCuratedTv);

  const setTypeFilter = useMediaStore((s) => s.setTypeFilter);
  const setStatusFilter = useMediaStore((s) => s.setStatusFilter);
  const setSearchQuery = useMediaStore((s) => s.setSearchQuery);
  const setSortBy = useMediaStore((s) => s.setSortBy);

  const openSeriesTimeline = useMediaStore((s) => s.openSeriesTimeline);
  const closeSeriesTimeline = useMediaStore((s) => s.closeSeriesTimeline);

  useEffect(() => {
    void loadItems();
  }, []);

  return (
    <div id="media-view" className="view-content active media-view-wrapper">
      <div className="media-view-container">
        {/* Top Header */}
        <header className="media-header">
          <div className="media-header-title-row">
            <div className="media-header-left">
              <div className="media-header-icon-box">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <line x1="7" y1="2" x2="7" y2="22" />
                  <line x1="17" y1="17" x2="17" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="2" y1="7" x2="7" y2="7" />
                  <line x1="2" y1="17" x2="7" y2="17" />
                  <line x1="17" y1="17" x2="22" y2="17" />
                  <line x1="17" y1="7" x2="22" y2="7" />
                </svg>
              </div>
              <div>
                <h1 className="media-header-title">
                  {t.media_title || "Medya & Kütüphane Takibi"}
                </h1>
                <p className="media-header-subtitle">
                  {t.media_subtitle ||
                    "Film serileri, kült filmler, felsefi kitaplar ve ödüllü oyunlar kataloğu"}
                </p>
              </div>
            </div>
          </div>

          {/* Global Statistics Overview */}
          <MediaStatsOverview stats={stats} lang={lang} />
        </header>

        {/* Filter & Toolbar */}
        <MediaToolbar
          lang={lang}
          activeTypeFilter={activeTypeFilter}
          activeStatusFilter={activeStatusFilter}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          isSyncingWeb={isSyncingWeb}
          onSyncWeb={() => void syncWebCatalog(true)}
        />

        {/* Curated Catalogs & Series Hub or Global Search Results */}
        <main className="media-content-main">
          {searchQuery.trim().length > 0 ? (
            <MediaSearchResultsView
              lang={lang}
              searchQuery={searchQuery}
              userItems={items}
              curatedMovies={curatedMovies.length > 0 ? curatedMovies : undefined}
              curatedTvShows={curatedTvShows.length > 0 ? curatedTvShows : undefined}
              curatedBooks={curatedBooks.length > 0 ? curatedBooks : undefined}
              curatedGames={curatedGames.length > 0 ? curatedGames : undefined}
              onOpenSeriesTimeline={openSeriesTimeline}
              onToggleMovie={toggleCuratedMovie}
              onToggleTv={toggleCuratedTv}
              onToggleBook={toggleCuratedBook}
              onToggleGame={toggleCuratedGame}
              onClearSearch={() => setSearchQuery("")}
            />
          ) : (
            <>
              {activeTypeFilter === "series" && (
                <MovieSeriesHub
                  lang={lang}
                  userItems={items}
                  onOpenTimeline={openSeriesTimeline}
                  onBatchWatchlist={batchAddSeriesToWatchlist}
                  isStandaloneTab={true}
                  searchQuery={searchQuery}
                />
              )}

              {activeTypeFilter === "movie" && (
                <CuratedMoviesHub
                  lang={lang}
                  userItems={items}
                  movies={curatedMovies.length > 0 ? curatedMovies : undefined}
                  onToggleMovie={toggleCuratedMovie}
                  statusFilter={activeStatusFilter}
                  searchQuery={searchQuery}
                />
              )}

              {activeTypeFilter === "tv" && (
                <CuratedTvHub
                  lang={lang}
                  userItems={items}
                  tvShows={curatedTvShows.length > 0 ? curatedTvShows : undefined}
                  onToggleTv={toggleCuratedTv}
                  statusFilter={activeStatusFilter}
                  searchQuery={searchQuery}
                />
              )}

              {activeTypeFilter === "book" && (
                <CuratedBooksHub
                  lang={lang}
                  userItems={items}
                  books={curatedBooks.length > 0 ? curatedBooks : undefined}
                  onToggleBook={toggleCuratedBook}
                  statusFilter={activeStatusFilter}
                  searchQuery={searchQuery}
                />
              )}

              {activeTypeFilter === "game" && (
                <CuratedGamesHub
                  lang={lang}
                  userItems={items}
                  games={curatedGames.length > 0 ? curatedGames : undefined}
                  onToggleGame={toggleCuratedGame}
                  statusFilter={activeStatusFilter}
                  searchQuery={searchQuery}
                />
              )}

              {activeTypeFilter === "all" && (
                <div className="media-all-showcase">
                  {/* 1. Popüler Film Serileri */}
                  <MovieSeriesHub
                    lang={lang}
                    userItems={items}
                    onOpenTimeline={openSeriesTimeline}
                    onBatchWatchlist={batchAddSeriesToWatchlist}
                    isStandaloneTab={false}
                    searchQuery={searchQuery}
                  />

                  {/* 2. Kült Filmler */}
                  <CuratedMoviesHub
                    lang={lang}
                    userItems={items}
                    movies={curatedMovies.length > 0 ? curatedMovies : undefined}
                    onToggleMovie={toggleCuratedMovie}
                    statusFilter={activeStatusFilter}
                    searchQuery={searchQuery}
                  />

                  {/* 3. Efsane Diziler */}
                  <CuratedTvHub
                    lang={lang}
                    userItems={items}
                    tvShows={curatedTvShows.length > 0 ? curatedTvShows : undefined}
                    onToggleTv={toggleCuratedTv}
                    statusFilter={activeStatusFilter}
                    searchQuery={searchQuery}
                  />

                  {/* 4. Başyapıt Kitaplar (Felsefe, Politika, Distopya...) */}
                  <CuratedBooksHub
                    lang={lang}
                    userItems={items}
                    books={curatedBooks.length > 0 ? curatedBooks : undefined}
                    onToggleBook={toggleCuratedBook}
                    statusFilter={activeStatusFilter}
                    searchQuery={searchQuery}
                  />

                  {/* 5. Zirvedeki Oyunlar */}
                  <CuratedGamesHub
                    lang={lang}
                    userItems={items}
                    games={curatedGames.length > 0 ? curatedGames : undefined}
                    onToggleGame={toggleCuratedGame}
                    statusFilter={activeStatusFilter}
                    searchQuery={searchQuery}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Movie Series Interactive Timeline Modal */}
      <MovieSeriesTimelineModal
        isOpen={isSeriesTimelineOpen}
        series={selectedSeriesForTimeline}
        userItems={items}
        lang={lang}
        onToggleStatus={toggleSeriesItem}
        onBatchWatchlist={batchAddSeriesToWatchlist}
        onClose={closeSeriesTimeline}
      />
    </div>
  );
}
