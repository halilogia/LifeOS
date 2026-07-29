/**
 * FreeGamesView.tsx
 * Ücretsiz Oyun Fırsatları ve Epic Games Geçmiş Sorgulama Ekranı.
 * Layout Assembly Pattern ile parçalarına ayrıştırılmıştır.
 */

import { useState, useEffect } from "preact/hooks";
import {
  gamesService,
} from "@/services/gamesService.js";
import {
  Giveaway,
  HistoricalEpicGame,
  ExclusionSettings,
  defaultExclusions,
} from "@/types/games.js";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { GameCard } from "@/components/GameCard.js";

// Extracted Sub-components
import { FreeGamesFilterBar } from "@/components/freegames/FreeGamesFilterBar.js";
import { WasItFreeSearchTab } from "@/components/freegames/WasItFreeSearchTab.js";

interface FreeGamesViewProps {
  lang: Language;
}

export function FreeGamesView({ lang }: FreeGamesViewProps) {
  const t = translations[lang];

  // UI state
  const [tab, setTab] = useState<"giveaways" | "wasitfree">("giveaways");
  const [allGiveaways, setAllGiveaways] = useState<Giveaway[]>([]);
  const [exclusions, setExclusions] = useState<ExclusionSettings>({
    ...defaultExclusions,
  });

  // Filters
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("game");

  // History search state
  const [searchQuery, setSearchQuery] = useState("");
  const [historyResults, setHistoryResults] = useState<HistoricalEpicGame[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyEmpty, setHistoryEmpty] = useState(false);

  // Loading/Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadSettingsAndGiveaways();
  }, []);

  const loadSettingsAndGiveaways = async () => {
    setLoading(true);
    setError(false);
    try {
      const activeExclusions = await gamesService.loadExclusionSettings();
      setExclusions(activeExclusions);
      const list = await gamesService.fetchLiveGiveaways();
      setAllGiveaways(list);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(true);
      setLoading(false);
    }
  };

  const handleExclusionChange = async (siteKey: keyof ExclusionSettings) => {
    const updated = {
      ...exclusions,
      [siteKey]: !exclusions[siteKey],
    };
    setExclusions(updated);
    await gamesService.saveExclusionSettings(updated);
  };

  const handleHistorySearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    setHistoryLoading(true);
    setHistoryEmpty(false);
    setHistoryResults([]);

    try {
      const historyList = await gamesService.fetchHistoricalGiveaways();
      const matched = historyList.filter((game) =>
        game.gameTitle.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      );

      // Sort by date descending
      matched.sort(
        (a, b) =>
          new Date(b.freeDate).getTime() - new Date(a.freeDate).getTime(),
      );

      setHistoryLoading(false);
      if (matched.length === 0) {
        setHistoryEmpty(true);
      } else {
        setHistoryResults(matched);
      }
    } catch (e) {
      console.error(e);
      setHistoryLoading(false);
      setHistoryEmpty(true);
    }
  };

  const getGiveawaySite = (
    platformsStr: string,
    titleStr: string,
  ): keyof ExclusionSettings => {
    const p = platformsStr.toLowerCase();
    const title = titleStr.toLowerCase();
    if (p.includes("steam") || title.includes("steam")) {
      return "steam";
    }
    if (p.includes("epic") || title.includes("epic")) {
      return "epic";
    }
    if (p.includes("gog") || title.includes("gog")) {
      return "gog";
    }
    if (p.includes("humble") || title.includes("humble")) {
      return "humble";
    }
    if (p.includes("indiegala") || title.includes("indiegala")) {
      return "indiegala";
    }
    if (p.includes("itch") || title.includes("itch")) {
      return "itch";
    }
    return "other";
  };

  const getCleanerPlatforms = (
    platformsStr: string,
    titleStr: string,
  ): string[] => {
    const parts = platformsStr.split(",").map((p) => p.trim());
    const list: string[] = [];
    const title = titleStr.toLowerCase();

    if (title.includes("indiegala")) {
      list.push("IndieGala");
    }
    if (title.includes("itch.io") || title.includes("itch")) {
      list.push("Itch.io");
    }

    for (const part of parts) {
      if (part.toLowerCase().includes("steam")) {
        list.push("Steam");
      } else if (part.toLowerCase().includes("epic")) {
        list.push("Epic Games");
      } else if (part.toLowerCase().includes("gog")) {
        list.push("GOG");
      } else if (
        part.toLowerCase() === "pc" ||
        part.toLowerCase().includes("drm-free")
      ) {
        if (!title.includes("indiegala") && !title.includes("itch")) {
          list.push("PC");
        }
      } else if (
        part.toLowerCase().includes("playstation") ||
        part.toLowerCase() === "ps4" ||
        part.toLowerCase() === "ps5"
      ) {
        list.push("PlayStation");
      } else if (part.toLowerCase().includes("xbox")) {
        list.push("Xbox");
      } else if (part.toLowerCase().includes("switch")) {
        list.push("Switch");
      } else if (
        part.toLowerCase().includes("android") ||
        part.toLowerCase().includes("ios")
      ) {
        list.push("Mobile");
      } else {
        list.push(part);
      }
    }
    return [...new Set(list)].slice(0, 3);
  };

  const formatHistoryDate = (dateStr: string): string => {
    if (!dateStr) {
      return "";
    }
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }

      if (lang === "tr") {
        const months = [
          "Ocak",
          "Şubat",
          "Mart",
          "Nisan",
          "Mayıs",
          "Haziran",
          "Temmuz",
          "Ağustos",
          "Eylül",
          "Ekim",
          "Kasım",
          "Aralık",
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      } else {
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        return date.toLocaleDateString("en-US", options);
      }
    } catch {
      return dateStr;
    }
  };

  // Filter live giveaways based on platform, type, and source exclusion settings
  const filteredGiveaways = allGiveaways.filter((item) => {
    const site = getGiveawaySite(item.platforms, item.title);
    if (!exclusions[site]) {
      return false;
    }
    if (item.type.toLowerCase() !== type.toLowerCase()) {
      return false;
    }
    const platformsLower = item.platforms.toLowerCase();
    if (platform === "steam") {
      return platformsLower.includes("steam");
    } else if (platform === "epic-games-store") {
      return platformsLower.includes("epic");
    } else if (platform === "gog") {
      return platformsLower.includes("gog");
    } else if (platform === "pc") {
      return platformsLower.includes("pc");
    }
    return true;
  });

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
