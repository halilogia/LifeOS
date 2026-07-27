/**
 * WasItFreeSearchTab.tsx
 * Epic Games geçmiş ücretsiz oyun sorgulama sekmesi (Arama girdisi, yüklenme/boş durumları ve HistoryCard listesi).
 */

import { HistoricalEpicGame } from "@/services/gamesService.js";
import { HistoryCard } from "@/components/HistoryCard.js";

interface WasItFreeSearchTabProps {
  lang: string;
  t: Record<string, string>;
  searchQuery: string;
  historyLoading: boolean;
  historyEmpty: boolean;
  historyResults: HistoricalEpicGame[];
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: () => void;
  formatHistoryDate: (dateStr: string) => string;
}

export function WasItFreeSearchTab({
  t,
  searchQuery,
  historyLoading,
  historyEmpty,
  historyResults,
  onSearchQueryChange,
  onSearchSubmit,
  formatHistoryDate,
}: WasItFreeSearchTabProps) {
  return (
    <div id="fg-was-it-free-container">
      <div className="was-it-free-search-box">
        <div className="search-input-group">
          <input
            type="text"
            id="was-it-free-input"
            value={searchQuery}
            onInput={(e) =>
              onSearchQueryChange((e.target as HTMLInputElement).value)
            }
            onKeyPress={(e) => e.key === "Enter" && onSearchSubmit()}
            placeholder={t.search_game_placeholder}
          />
          <button
            id="was-it-free-btn"
            className="was-it-free-search-btn"
            onClick={onSearchSubmit}
          >
            <span>{t.search_btn}</span>
          </button>
        </div>
      </div>

      {historyLoading && (
        <div id="was-it-free-loading" className="free-games-loading">
          <div className="spinner"></div>
          <p>{t.loading_history}</p>
        </div>
      )}

      {historyEmpty && (
        <div id="was-it-free-empty" className="free-games-empty">
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
            {t.was_not_free}
          </p>
        </div>
      )}

      {!historyLoading && historyResults.length > 0 && (
        <div id="was-it-free-results" className="was-it-free-results">
          {historyResults.map((game, idx) => (
            <HistoryCard
              key={idx}
              game={game}
              formattedDate={formatHistoryDate(game.freeDate)}
              wasFreeSuccessLabel={t.was_free_success}
              wasFreeOnLabel={t.was_free_on}
              metaScoreLabel={t.metacritic_score}
              steamScoreLabel={t.steamdb_score}
            />
          ))}
        </div>
      )}
    </div>
  );
}
