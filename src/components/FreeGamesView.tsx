import { useState, useEffect } from "preact/hooks";
import {
  gamesService,
  Giveaway,
  HistoricalEpicGame,
  ExclusionSettings,
  defaultExclusions,
} from "@/services/gamesService.js";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { GameCard } from "@/components/GameCard.js";
import { HistoryCard } from "@/components/HistoryCard.js";

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
    // 1. Exclusions check
    const site = getGiveawaySite(item.platforms, item.title);
    if (!exclusions[site]) {
      return false;
    }

    // 2. Type check
    if (item.type.toLowerCase() !== type.toLowerCase()) {
      return false;
    }

    // 3. Platform check
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

        {/* TAB 1: GIVEAWAYS */}
        {tab === "giveaways" && (
          <div id="fg-live-container">
            <header className="free-games-header">
              <h2>{t.free_games_title}</h2>
              <div className="free-games-filters">
                <div className="filter-group">
                  <label>{t.filter_platform}</label>
                  <select
                    id="free-games-platform-select"
                    className="free-games-select"
                    value={platform}
                    onChange={(e) =>
                      setPlatform((e.target as HTMLSelectElement).value)
                    }
                  >
                    <option value="all">{t.platform_all}</option>
                    <option value="pc">{t.platform_pc}</option>
                    <option value="steam">{t.platform_steam}</option>
                    <option value="epic-games-store">{t.platform_epic}</option>
                    <option value="gog">{t.platform_gog}</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>{t.filter_type}</label>
                  <select
                    id="free-games-type-select"
                    className="free-games-select"
                    value={type}
                    onChange={(e) =>
                      setType((e.target as HTMLSelectElement).value)
                    }
                  >
                    <option value="game">{t.type_game}</option>
                    <option value="loot">{t.type_loot}</option>
                    <option value="beta">{t.type_beta}</option>
                  </select>
                </div>
              </div>
            </header>

            {/* Quick Claim Shortcuts Bar */}
            <div 
              className="free-games-shortcuts" 
              style={{ 
                display: "flex", 
                gap: "10px", 
                marginBottom: "20px", 
                flexWrap: "wrap",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--card-border)",
                borderRadius: "12px",
                padding: "12px 16px",
                alignItems: "center",
                width: "100%"
              }}
            >
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginRight: "10px" }}>
                {lang === "tr" ? "Hızlı Talep Sayfaları:" : "Quick Claim Pages:"}
              </span>
              <a 
                href="https://store.epicgames.com/free-games" 
                target="_blank" 
                rel="noopener noreferrer"
                className="add-note-action-btn secondary"
                style={{ padding: "6px 14px", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
              >
                Epic Games
              </a>
              <a 
                href="https://gaming.amazon.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="add-note-action-btn secondary"
                style={{ padding: "6px 14px", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
              >
                Prime Gaming
              </a>
              <a 
                href="https://luna.amazon.com/claims/home?g=s" 
                target="_blank" 
                rel="noopener noreferrer"
                className="add-note-action-btn secondary"
                style={{ padding: "6px 14px", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", borderColor: "var(--accent-color)" }}
              >
                Amazon Luna
              </a>
              <a 
                href="https://store.steampowered.com/genre/Free%20to%20Play/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="add-note-action-btn secondary"
                style={{ padding: "6px 14px", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
              >
                Steam Free
              </a>
              <a 
                href="https://www.gog.com/partner/free_games" 
                target="_blank" 
                rel="noopener noreferrer"
                className="add-note-action-btn secondary"
                style={{ padding: "6px 14px", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
              >
                GOG Free
              </a>
            </div>

            {/* Source Exclusion Checkboxes */}
            <div className="free-games-sources">
              <span className="sources-title">{t.filter_sources}</span>
              <div className="sources-grid">
                {(
                  [
                    "steam",
                    "epic",
                    "gog",
                    "humble",
                    "indiegala",
                    "itch",
                    "other",
                  ] as const
                ).map((siteKey) => {
                  const label =
                    siteKey === "epic"
                      ? "Epic Games"
                      : siteKey === "humble"
                        ? "Humble Bundle"
                        : siteKey === "other"
                          ? lang === "tr"
                            ? "Diğer"
                            : "Other"
                          : siteKey.toUpperCase();
                  return (
                    <label key={siteKey} className="source-label">
                      <input
                        type="checkbox"
                        checked={exclusions[siteKey]}
                        onChange={() => handleExclusionChange(siteKey)}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

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
                      {lang === "tr"
                        ? "Eşleşen fırsat bulunamadı."
                        : "No matching giveaways found."}
                    </p>
                  </div>
                ) : (
                  filteredGiveaways.map((game) => {
                    const worthText = game.worth === "N/A" ? "" : game.worth;
                    const expiryText =
                      game.end_date && game.end_date !== "N/A"
                        ? `${t.ends_in} ${game.end_date}`
                        : lang === "tr"
                          ? "Kalıcı / Süresiz"
                          : "Keep Forever / Permanent";
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
          <div id="fg-was-it-free-container">
            <div className="was-it-free-search-box">
              <div className="search-input-group">
                <input
                  type="text"
                  id="was-it-free-input"
                  value={searchQuery}
                  onInput={(e) =>
                    setSearchQuery((e.target as HTMLInputElement).value)
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleHistorySearch()}
                  placeholder={t.search_game_placeholder}
                />
                <button
                  id="was-it-free-btn"
                  className="was-it-free-search-btn"
                  onClick={handleHistorySearch}
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
