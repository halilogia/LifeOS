import { elements } from "../ui/dom.js";
import { state } from "../core/state.js";
import { translations } from "../utils/i18n.js";

export interface Giveaway {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  platforms: string;
  end_date: string;
  type: string;
  status: string;
}

interface CachedData {
  timestamp: number;
  data: Giveaway[];
}

interface HistoricalEpicGame {
  gameTitle: string;
  freeDate: string;
  epicStoreLink?: string;
  metacriticScore?: number;
  metacriticUrl?: string;
  steamDBRating?: number;
  steamUrl?: string;
}

interface HistoryCache {
  timestamp: number;
  data: HistoricalEpicGame[];
}

interface ExclusionSettings {
  steam: boolean;
  epic: boolean;
  gog: boolean;
  humble: boolean;
  indiegala: boolean;
  itch: boolean;
  other: boolean;
}

const CACHE_KEY = "free_games_cache";
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes

const HISTORY_CACHE_KEY = "epic_history_cache";
const HISTORY_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

let allGiveaways: Giveaway[] = [];
let isInitialized = false;
let currentTab: "giveaways" | "wasitfree" = "giveaways";

const defaultExclusions: ExclusionSettings = {
  steam: true,
  epic: true,
  gog: true,
  humble: true,
  indiegala: true,
  itch: true,
  other: true,
};

let currentExclusions: ExclusionSettings = { ...defaultExclusions };

export async function initFreeGames(): Promise<void> {
  // Load saved exclusions from local storage
  currentExclusions = await loadExclusionSettings();

  if (isInitialized) {
    applyExclusionsToCheckboxes();
    if (currentTab === "giveaways") {
      loadFreeGames();
    }
    return;
  }

  // Setup tab listeners
  elements.fgTabGiveaways()?.addEventListener("click", () => switchFreeGamesTab("giveaways"));
  elements.fgTabWasItFree()?.addEventListener("click", () => switchFreeGamesTab("wasitfree"));

  // Setup listeners for select element changes
  elements.freeGamesPlatformSelect()?.addEventListener("change", () => {
    renderFreeGames();
  });

  elements.freeGamesTypeSelect()?.addEventListener("change", () => {
    renderFreeGames();
  });

  // Setup retry listener
  elements.freeGamesRetryBtn()?.addEventListener("click", () => {
    loadFreeGames(true); // force fresh fetch
  });

  // Setup checkboxes change listeners
  setupCheckboxListeners();

  // Setup "Was It Free" search lookup listeners
  elements.wasItFreeBtn()?.addEventListener("click", () => {
    performHistorySearch();
  });

  elements.wasItFreeInput()?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performHistorySearch();
    }
  });

  isInitialized = true;
  applyExclusionsToCheckboxes();
  loadFreeGames();
}

function setupCheckboxListeners(): void {
  const checkboxIds: { id: keyof ExclusionSettings; el: () => HTMLInputElement | null }[] = [
    { id: "steam", el: elements.filterSiteSteam },
    { id: "epic", el: elements.filterSiteEpic },
    { id: "gog", el: elements.filterSiteGog },
    { id: "humble", el: elements.filterSiteHumble },
    { id: "indiegala", el: elements.filterSiteIndiegala },
    { id: "itch", el: elements.filterSiteItch },
    { id: "other", el: elements.filterSiteOther },
  ];

  checkboxIds.forEach(({ id, el }) => {
    el()?.addEventListener("change", (e) => {
      currentExclusions[id] = (e.target as HTMLInputElement).checked;
      saveExclusionSettings(currentExclusions);
      renderFreeGames();
    });
  });
}

function applyExclusionsToCheckboxes(): void {
  const checkboxIds: { id: keyof ExclusionSettings; el: () => HTMLInputElement | null }[] = [
    { id: "steam", el: elements.filterSiteSteam },
    { id: "epic", el: elements.filterSiteEpic },
    { id: "gog", el: elements.filterSiteGog },
    { id: "humble", el: elements.filterSiteHumble },
    { id: "indiegala", el: elements.filterSiteIndiegala },
    { id: "itch", el: elements.filterSiteItch },
    { id: "other", el: elements.filterSiteOther },
  ];

  checkboxIds.forEach(({ id, el }) => {
    const input = el();
    if (input) {
      input.checked = currentExclusions[id];
    }
  });
}

function switchFreeGamesTab(tab: "giveaways" | "wasitfree"): void {
  currentTab = tab;
  const isGiveaways = tab === "giveaways";

  elements.fgTabGiveaways()?.classList.toggle("active", isGiveaways);
  elements.fgTabWasItFree()?.classList.toggle("active", !isGiveaways);

  elements.fgLiveContainer()?.classList.toggle("hidden", !isGiveaways);
  elements.fgWasItFreeContainer()?.classList.toggle("hidden", isGiveaways);

  if (isGiveaways) {
    loadFreeGames();
  } else {
    // Clear search results and input on switch
    const input = elements.wasItFreeInput();
    if (input) input.value = "";
    const results = elements.wasItFreeResults();
    if (results) results.innerHTML = "";
    showHistoryEmpty(false);
  }
}

async function loadFreeGames(forceFresh = false): Promise<void> {
  showLoading(true);
  showError(false);

  try {
    if (!forceFresh) {
      const cached = await getCachedGames();
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        allGiveaways = cached.data;
        renderFreeGames();
        showLoading(false);
        return;
      }
    }

    // Fetch fresh data
    const response = await fetch("https://www.gamerpower.com/api/giveaways");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.ok ? await response.json() : [];
    if (Array.isArray(data)) {
      allGiveaways = data;
    } else {
      allGiveaways = [];
    }

    // Save to cache
    await setCachedGames(allGiveaways);
    renderFreeGames();
  } catch (error) {
    console.error("Failed to fetch giveaways from GamerPower API:", error);
    // If fetch failed but we have stale cache, let's use it as a fallback
    const cached = await getCachedGames();
    if (cached && cached.data.length > 0) {
      allGiveaways = cached.data;
      renderFreeGames();
      console.log("Using expired cache as fallback due to network failure.");
    } else {
      showError(true);
    }
  } finally {
    showLoading(false);
  }
}

function getGiveawaySite(platforms: string, title: string): keyof ExclusionSettings {
  const p = platforms.toLowerCase();
  const t = title.toLowerCase();
  if (p.includes("steam") || t.includes("steam")) return "steam";
  if (p.includes("epic") || t.includes("epic")) return "epic";
  if (p.includes("gog") || t.includes("gog")) return "gog";
  if (p.includes("humble") || t.includes("humble")) return "humble";
  if (p.includes("indiegala") || t.includes("indiegala")) return "indiegala";
  if (p.includes("itch") || t.includes("itch")) return "itch";
  return "other";
}

function renderFreeGames(): void {
  const grid = elements.freeGamesGrid();
  if (!grid) return;

  grid.innerHTML = "";

  const platformFilter = elements.freeGamesPlatformSelect()?.value || "all";
  const typeFilter = elements.freeGamesTypeSelect()?.value || "game";
  const lang = state.currentLang;

  // Filter giveaways
  const filtered = allGiveaways.filter((item) => {
    // 1. Filter by site exclusions
    const site = getGiveawaySite(item.platforms, item.title);
    if (!currentExclusions[site]) {
      return false;
    }

    // 2. Filter by type
    if (item.type.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }

    // 3. Filter by platform dropdown
    const platformsLower = item.platforms.toLowerCase();
    if (platformFilter === "steam") {
      return platformsLower.includes("steam");
    } else if (platformFilter === "epic-games-store") {
      return platformsLower.includes("epic");
    } else if (platformFilter === "gog") {
      return platformsLower.includes("gog");
    } else if (platformFilter === "pc") {
      return platformsLower.includes("pc");
    }

    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="free-games-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); opacity: 0.5; margin-bottom: 12px;"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">${
          lang === "tr" ? "Eşleşen fırsat bulunamadı." : "No matching giveaways found."
        }</p>
      </div>
    `;
    return;
  }

  filtered.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    const worthText = game.worth === "N/A" ? "" : game.worth;
    const worthLabel = worthText
      ? `<span class="game-worth-badge">${worthText}</span>`
      : `<span class="game-worth-badge free">${translations[lang].worth_free}</span>`;

    // Try to format end date beautifully
    let expiryText = "";
    if (game.end_date && game.end_date !== "N/A") {
      expiryText = `${translations[lang].ends_in} ${game.end_date}`;
    } else {
      expiryText = lang === "tr" ? "Kalıcı / Süresiz" : "Keep Forever / Permanent";
    }

    // Extract cleaner platform names for badges
    const displayPlatforms = getCleanerPlatforms(game.platforms, game.title);

    card.innerHTML = `
      <div class="game-card-image" style="background-image: url('${game.image}')">
        <div class="game-badges">
          ${worthLabel}
        </div>
      </div>
      <div class="game-card-content">
        <div class="game-platforms-container">
          ${displayPlatforms.map(p => `<span class="game-platform-badge ${p.toLowerCase().replace(/\./g, '-').replace(/\s+/g, '-')}" title="${game.platforms}">${p}</span>`).join("")}
        </div>
        <h3 class="game-title" title="${game.title}">${game.title}</h3>
        <p class="game-description" title="${game.description}">${game.description}</p>
        <div class="game-card-footer">
          <span class="game-expiry" title="${expiryText}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style="display: inline-block; vertical-align: middle;">${expiryText}</span>
          </span>
          <a href="${game.open_giveaway_url}" target="_blank" rel="noopener noreferrer" class="game-claim-btn">
            ${translations[lang].get_game}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; display: inline-block; vertical-align: middle;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </a>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

async function performHistorySearch(): Promise<void> {
  const query = elements.wasItFreeInput()?.value.trim();
  const resultsGrid = elements.wasItFreeResults();
  if (!resultsGrid) return;

  resultsGrid.innerHTML = "";
  showHistoryEmpty(false);

  if (!query) {
    return;
  }

  showHistoryLoading(true);

  try {
    const historyList = await fetchEpicHistoryData();
    const lang = state.currentLang;

    // Filter games
    const matched = historyList.filter((game) =>
      game.gameTitle.toLowerCase().includes(query.toLowerCase())
    );

    // Sort by date descending
    matched.sort((a, b) => new Date(b.freeDate).getTime() - new Date(a.freeDate).getTime());

    showHistoryLoading(false);

    if (matched.length === 0) {
      showHistoryEmpty(true);
      return;
    }

    matched.forEach((game) => {
      const card = document.createElement("div");
      card.className = "history-card";

      // Formatted date
      const dateFormatted = formatHistoryDate(game.freeDate, lang);

      // Meta and SteamDB scores
      const metaHtml = game.metacriticScore
        ? `<div class="rating-item metacritic" title="Metacritic score"><span class="rating-label">${translations[lang].metacritic_score}</span> <span class="rating-val">${game.metacriticScore}</span></div>`
        : "";
      const steamHtml = game.steamDBRating
        ? `<div class="rating-item steamdb" title="SteamDB rating"><span class="rating-label">${translations[lang].steamdb_score}</span> <span class="rating-val">%${game.steamDBRating}</span></div>`
        : "";

      const storeLinkHtml = game.epicStoreLink
        ? `<a href="${game.epicStoreLink}" target="_blank" class="history-link-btn" rel="noopener noreferrer">
            Epic Games
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; display: inline-block; vertical-align: middle;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
           </a>`
        : "";

      card.innerHTML = `
        <div class="history-card-header">
          <div class="history-check-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="history-card-title-group">
            <h3 class="history-title">${game.gameTitle}</h3>
            <span class="history-success-label">${translations[lang].was_free_success}</span>
          </div>
        </div>
        <div class="history-card-body">
          <div class="history-info-row">
            <span class="history-label">${translations[lang].was_free_on}</span>
            <span class="history-value">${dateFormatted}</span>
          </div>
          ${metaHtml || steamHtml ? `<div class="history-ratings">${metaHtml}${steamHtml}</div>` : ""}
        </div>
        <div class="history-card-footer">
          ${storeLinkHtml}
        </div>
      `;

      resultsGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Epic Games history search failed:", error);
    showHistoryLoading(false);
    showHistoryEmpty(true);
  }
}

async function fetchEpicHistoryData(): Promise<HistoricalEpicGame[]> {
  const cached = await getHistoryCache();
  if (cached && Date.now() - cached.timestamp < HISTORY_CACHE_EXPIRY) {
    return cached.data;
  }

  // Fetch from raw content josephmate/EpicFreeGamesList
  const url = "https://raw.githubusercontent.com/josephmate/EpicFreeGamesList/master/epic_free_games.json";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load Epic Games Store history: ${response.statusText}`);
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    const mapped: HistoricalEpicGame[] = data.map((item: any) => ({
      gameTitle: item.gameTitle || "",
      freeDate: item.freeDate || "",
      epicStoreLink: item.epicStoreLink || undefined,
      metacriticScore: item.metacriticScore || undefined,
      metacriticUrl: item.metacriticUrl || undefined,
      steamDBRating: item.steamDBRating || undefined,
      steamUrl: item.steamUrl || undefined,
    }));
    await setHistoryCache(mapped);
    return mapped;
  }

  return [];
}

function formatHistoryDate(dateStr: string, lang: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    if (lang === "tr") {
      const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    }
  } catch (e) {
    return dateStr;
  }
}

function getCleanerPlatforms(platformsStr: string, title: string): string[] {
  const parts = platformsStr.split(",").map(p => p.trim());
  const list: string[] = [];
  const t = title.toLowerCase();

  // If title has IndieGala or Itch.io, add it
  if (t.includes("indiegala")) {
    list.push("IndieGala");
  }
  if (t.includes("itch.io") || t.includes("itch")) {
    list.push("Itch.io");
  }

  for (const part of parts) {
    if (part.toLowerCase().includes("steam")) {
      list.push("Steam");
    } else if (part.toLowerCase().includes("epic")) {
      list.push("Epic Games");
    } else if (part.toLowerCase().includes("gog")) {
      list.push("GOG");
    } else if (part.toLowerCase() === "pc" || part.toLowerCase().includes("drm-free")) {
      if (!t.includes("indiegala") && !t.includes("itch")) {
        list.push("PC");
      }
    } else if (part.toLowerCase().includes("playstation") || part.toLowerCase() === "ps4" || part.toLowerCase() === "ps5") {
      list.push("PlayStation");
    } else if (part.toLowerCase().includes("xbox")) {
      list.push("Xbox");
    } else if (part.toLowerCase().includes("switch")) {
      list.push("Switch");
    } else if (part.toLowerCase().includes("android") || part.toLowerCase().includes("ios")) {
      list.push("Mobile");
    } else {
      list.push(part);
    }
  }

  // Deduplicate and return max 3
  return [...new Set(list)].slice(0, 3);
}

function showLoading(show: boolean): void {
  const spinner = elements.freeGamesLoading();
  if (spinner) {
    spinner.classList.toggle("hidden", !show);
  }
}

function showError(show: boolean): void {
  const errorPanel = elements.freeGamesError();
  if (errorPanel) {
    errorPanel.classList.toggle("hidden", !show);
  }
}

function showHistoryLoading(show: boolean): void {
  const spinner = elements.wasItFreeLoading();
  if (spinner) {
    spinner.classList.toggle("hidden", !show);
  }
}

function showHistoryEmpty(show: boolean): void {
  const emptyPanel = elements.wasItFreeEmpty();
  if (emptyPanel) {
    emptyPanel.classList.toggle("hidden", !show);
  }
}

function getCachedGames(): Promise<CachedData | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([CACHE_KEY], (res) => {
      resolve((res[CACHE_KEY] as CachedData) || null);
    });
  });
}

function setCachedGames(data: Giveaway[]): Promise<void> {
  return new Promise((resolve) => {
    const cacheVal: CachedData = {
      timestamp: Date.now(),
      data,
    };
    chrome.storage.local.set({ [CACHE_KEY]: cacheVal }, resolve);
  });
}

function getHistoryCache(): Promise<HistoryCache | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_CACHE_KEY], (res) => {
      resolve((res[HISTORY_CACHE_KEY] as HistoryCache) || null);
    });
  });
}

function setHistoryCache(data: HistoricalEpicGame[]): Promise<void> {
  return new Promise((resolve) => {
    const cacheVal: HistoryCache = {
      timestamp: Date.now(),
      data,
    };
    chrome.storage.local.set({ [HISTORY_CACHE_KEY]: cacheVal }, resolve);
  });
}

function loadExclusionSettings(): Promise<ExclusionSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["fg_exclusions"], (res) => {
      resolve((res.fg_exclusions as ExclusionSettings) || { ...defaultExclusions });
    });
  });
}

function saveExclusionSettings(settings: ExclusionSettings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ fg_exclusions: settings }, resolve);
  });
}
