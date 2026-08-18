/**
 * FreeGamesView.tsx
 * Ücretsiz Oyun Fırsatları ve Epic Games Geçmiş Sorgulama Ekranı.
 * Layout Assembly Pattern ile parçalarına ayrıştırılmıştır.
 */

import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { GameCard } from "@/components/GameCard.js";
import { useFreeGames } from "@/presentation/hooks/useFreeGames.js";

// Extracted Sub-components
import { FreeGamesFilterBar } from "@/components/freegames/FreeGamesFilterBar.js";
import { WasItFreeSearchTab } from "@/components/freegames/WasItFreeSearchTab.js";

interface FreeGamesViewProps {
  lang: Language;
}

export function FreeGamesView({ lang }: FreeGamesViewProps) {
  const t = translations[lang];
  const {
    tab,
    setTab,
    exclusions,
    platform,
    setPlatform,
    type,
    setType,
    searchQuery,
    setSearchQuery,
    historyResults,
    historyLoading,
    historyEmpty,
    loading,
    error,
    filteredGiveaways,
    claimedIds,
    handleClaimToggle,
    loadSettingsAndGiveaways,
    handleExclusionChange,
    handleHistorySearch,
    getCleanerPlatforms,
    formatHistoryDate,
  } = useFreeGames({ lang });

  return (
    <div id="free-games-view" className="view-content active">
      <div className="free-games-container">
        {/* Navigation Tabs */}
        <div className="free-games-tabs">
          <button
            className={`fg-tab-btn ${tab === "giveaways" ? "active" : ""}`}
            onClick={() => setTab("giveaways")}
          >
            {t.fg_tab_giveaways}
          </button>
          <button
            className={`fg-tab-btn ${tab === "wasitfree" ? "active" : ""}`}
            onClick={() => setTab("wasitfree")}
          >
            {t.fg_tab_wasitfree}
          </button>
        </div>

        {/* TAB 1: LIVE GIVEAWAYS */}
        {tab === "giveaways" && (
          <div id="fg-live-container">
            <FreeGamesFilterBar
              t={t}
              platform={platform}
              type={type}
              exclusions={exclusions}
              onPlatformChange={setPlatform}
              onTypeChange={setType}
              onExclusionChange={handleExclusionChange}
            />

            {loading && (
              <div id="free-games-loading" className="free-games-loading">
                <div className="spinner"></div>
                <p>{t.loading_games}</p>
              </div>
            )}

            {error && (
              <div id="free-games-error" className="free-games-error">
                <p>{t.error_games}</p>
                <button
                  id="free-games-retry-btn"
                  onClick={loadSettingsAndGiveaways}
                >
                  {t.retry}
                </button>
              </div>
            )}

            {!loading && !error && (
              <div id="free-games-grid" className="free-games-grid">
                {filteredGiveaways.length === 0 ? (
                  <div className="free-games-empty">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      style={{
                        color: "var(--text-secondary)",
                        opacity: 0.5,
                        marginBottom: "12px",
                      }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.95rem",
                      }}
                    >
                      {t.free_games_no_match}
                    </p>
                  </div>
                ) : (
                  filteredGiveaways.map((game) => {
                    const worthText = game.worth === "N/A" ? "" : game.worth;
                    const expiryText =
                      game.end_date && game.end_date !== "N/A"
                        ? `${t.ends_in} ${game.end_date}`
                        : t.free_games_permanent;
                    const displayPlatforms = getCleanerPlatforms(
                      game.platforms,
                      game.title,
                    );

                    return (
                      <GameCard
                        key={game.id}
                        game={game}
                        lang={lang}
                        worthText={worthText}
                        expiryText={expiryText}
                        displayPlatforms={displayPlatforms}
                        getGameLabel={t.get_game}
                        worthFreeLabel={t.worth_free}
                        claimed={claimedIds.includes(game.id)}
                        claimedLabel={t.fg_claimed}
                        onClaimToggle={handleClaimToggle}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EPIC HISTORICAL LOOKUP */}
        {tab === "wasitfree" && (
          <WasItFreeSearchTab
            lang={lang}
            t={t}
            searchQuery={searchQuery}
            historyLoading={historyLoading}
            historyEmpty={historyEmpty}
            historyResults={historyResults}
            onSearchQueryChange={setSearchQuery}
            onSearchSubmit={handleHistorySearch}
            formatHistoryDate={formatHistoryDate}
          />
        )}

        <footer className="gamerpower-attribution">
          <p>
            Live data provided by{" "}
            <a
              href="https://www.gamerpower.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GamerPower API
            </a>
            . History data by{" "}
            <a
              href="https://github.com/josephmate/EpicFreeGamesList"
              target="_blank"
              rel="noopener noreferrer"
            >
              EpicFreeGamesList
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
