/**
 * keys.ts
 * Centralized storage key definitions for chrome.storage.sync and chrome.storage.local.
 * All persistence implementations MUST import keys from here, never hardcode strings.
 *
 * Convention: SYNC_ prefix = chrome.storage.sync, LOCAL_ prefix = chrome.storage.local
 */

// ============================================================
// chrome.storage.sync keys
// ============================================================
export const SYNC_TODOS = "todos";
export const SYNC_NOTES = "notes";
export const SYNC_SIDEBAR_ORDER = "sidebarOrder";
export const SYNC_LANG = "lang";
export const SYNC_SIDEBAR_OPEN = "sidebarOpen";
export const SYNC_FREE_GAMES_NOTIFICATIONS = "freeGamesNotificationsEnabled";
export const SYNC_CALENDAR_NOTIFICATIONS = "calendarNotificationsEnabled";
export const SYNC_POMO_BLOCK_ENABLED = "pomoBlockEnabled";
export const SYNC_UNIVERSAL_INFOBOX_ENABLED = "universalInfoBoxEnabled";
export const SYNC_UNIVERSAL_INFOBOX_HOTKEY = "universalInfoBoxHotkey";
export const SYNC_SETTINGS = "syncSettings";
export const SYNC_AI_PROVIDER = "aiProvider";
export const SYNC_AI_API_KEY = "aiApiKey";
export const SYNC_GEMINI_API_KEY = "geminiApiKey";
export const SYNC_AI_MODEL = "aiModel";
export const SYNC_AI_ENDPOINT = "aiEndpoint";
export const SYNC_AI_SHOW_THINKING = "aiShowThinking";
export const SYNC_KPSS_PROGRESS = "kpssProgress";
export const SYNC_KPSS_DAILY_STATS = "kpssDailyStats";
export const SYNC_KPSS_SRS = "kpssSrsProgress";
export const SYNC_KPSS_WIKI_NOTES = "kpss_wiki_notes";
export const SYNC_KPSS_AUTO_TITLE = "kpss_auto_title_enabled";
export const SYNC_AI_USER_MEMORY = "aiUserMemory";
export const SYNC_ALARMS = "alarms";
export const SYNC_STOCK_PORTFOLIO = "stockPortfolio";
export const SYNC_STOCK_RULES = "stockRules";
export const SYNC_STOCK_ALERT_LOGS = "stockAlertLogs";
export const SYNC_STOCK_WATCHLISTS = "stockWatchlists";
export const SYNC_STOCK_TRADE_HISTORY = "stockTradeHistory";

/** All AI-config keys for batch reads. */
export const SYNC_AI_KEYS = [
  SYNC_AI_PROVIDER,
  SYNC_AI_API_KEY,
  SYNC_GEMINI_API_KEY,
  SYNC_AI_MODEL,
  SYNC_AI_ENDPOINT,
  SYNC_AI_SHOW_THINKING,
] as const;

/** All settings-related sync keys used by ChromeStorageSettingsRepository. */
export const SYNC_SETTINGS_KEYS = [
  SYNC_LANG,
  SYNC_SIDEBAR_OPEN,
  SYNC_FREE_GAMES_NOTIFICATIONS,
  SYNC_CALENDAR_NOTIFICATIONS,
  SYNC_POMO_BLOCK_ENABLED,
  SYNC_UNIVERSAL_INFOBOX_ENABLED,
  SYNC_UNIVERSAL_INFOBOX_HOTKEY,
] as const;

/** Master list of all sync keys for migration purposes. */
export const SYNC_ALL_KEYS = [
  SYNC_TODOS,
  SYNC_NOTES,
  "hifizProgress",
  "srsProgress",
  "customCategories",
  SYNC_KPSS_PROGRESS,
  SYNC_KPSS_SRS,
  "customQuotes",
  "yeterlikler",
  SYNC_KPSS_DAILY_STATS,
  SYNC_LANG,
  SYNC_SIDEBAR_OPEN,
  "prayerCity",
  "prayerCountry",
  "willpowerStreak",
  SYNC_FREE_GAMES_NOTIFICATIONS,
  SYNC_CALENDAR_NOTIFICATIONS,
  SYNC_POMO_BLOCK_ENABLED,
  "pomoCustomTimes",
  "kpssTargetScore",
  "kpssGoalType",
  "kpssTargetNet",
  "kpssChartType",
  "kpssChartDays",
  "kpss_chart_metric_mode",
  SYNC_UNIVERSAL_INFOBOX_ENABLED,
  SYNC_UNIVERSAL_INFOBOX_HOTKEY,
  "pomodoroHistory",
  SYNC_SETTINGS,
  SYNC_GEMINI_API_KEY,
  SYNC_AI_PROVIDER,
  SYNC_AI_MODEL,
  SYNC_AI_ENDPOINT,
  SYNC_SIDEBAR_ORDER,
  "detox_limits",
  SYNC_AI_SHOW_THINKING,
  SYNC_STOCK_PORTFOLIO,
  SYNC_STOCK_RULES,
  SYNC_STOCK_ALERT_LOGS,
  SYNC_ALARMS,
  SYNC_STOCK_WATCHLISTS,
  SYNC_STOCK_TRADE_HISTORY,
  SYNC_AI_USER_MEMORY,
];

// ============================================================
// chrome.storage.local keys
// ============================================================
export const LOCAL_BIST_CACHE = "bistStockCache";
export const LOCAL_KAP_NEWS_CACHE = "kapNewsCache";
export const LOCAL_FREE_GAMES_CACHE = "free_games_cache";
export const LOCAL_EPIC_HISTORY_CACHE = "epic_history_cache";
export const LOCAL_FG_EXCLUSIONS = "fg_exclusions";
export const LOCAL_ARCADE_GAMES = "lifeos_arcade_games_v1";
export const LOCAL_POMO_STATE = "pomoState";
export const LOCAL_STOPWATCH_STATE = "stopwatchState";
export const LOCAL_KPSS_PAST_QUIZZES = "kpss_past_quizzes";

/** Template for prayer calendar keys: `prayer_calendar_{city}_{year}_{month}`. */
export const PRAYER_CALENDAR_PREFIX = "prayer_calendar_";

/** Build a prayer calendar storage key dynamically. */
export function prayerCalendarKey(
  city: string,
  year: number,
  month: number,
): string {
  return `${PRAYER_CALENDAR_PREFIX}${city.toLowerCase()}_${year}_${month}`;
}
