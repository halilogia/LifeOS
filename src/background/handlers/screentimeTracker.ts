/**
 * screentimeTracker.ts
 * Clean Architecture - Background Domain Handler for Screen Time Statistics.
 *
 * Accuracy rules:
 * - Count ONLY while the Chrome window is focused AND the tab is active.
 * - Never count sleep/suspend time (gap > 90s = machine was asleep or
 *   the service worker was suspended — that time is NOT browsing time).
 * - Single counter path: all time is added in ONE place (tick), tab/focus
 *   changes only update the active domain + last tick timestamp.
 */

let currentDomain: string | null = null;
let lastTickTime: number = Date.now();
let screenTimeBuffer: Record<string, number> = {};
/** Tracks the last persisted session start to avoid double counting on wake. */
let lastPersistAt: number = Date.now();

const TICK_MS = 10000; // persist every 10s
const MAX_GAP_MS = 90000; // gaps > 90s = sleep/suspend, do NOT count
const MAX_SESSION_MS = 5 * 60 * 1000; // single counting session cap (5 min)

/**
 * Adds elapsed wall-clock time to the buffer for the CURRENT domain.
 * Shared by both the interval tick and tab/focus changes — this is the
 * ONLY place where seconds are added to screenTimeBuffer.
 */
function accumulateToBuffer(now: number): void {
  if (!currentDomain) {
    lastTickTime = now;
    return;
  }

  let elapsedMs = now - lastTickTime;

  // Machine asleep or worker suspended → discard the gap entirely.
  if (elapsedMs > MAX_GAP_MS) {
    lastTickTime = now;
    return;
  }

  // Defensive cap: even without sleep, never credit more than 5 min per
  // interval (should never happen, but protects against stray events).
  elapsedMs = Math.min(elapsedMs, MAX_SESSION_MS);

  if (elapsedMs > 0) {
    const elapsedSec = Math.round(elapsedMs / 1000);
    screenTimeBuffer[currentDomain] =
      (screenTimeBuffer[currentDomain] || 0) + elapsedSec;
  }
  lastTickTime = now;
}

function saveBufferToStorage(): void {
  const now = Date.now();

  // Only credit time that actually elapsed since the last persist.
  // If the worker just woke from suspension, lastPersistAt is stale —
  // the gap is discarded by the MAX_GAP_MS check in accumulateToBuffer.
  if (now - lastPersistAt > MAX_GAP_MS) {
    // Worker slept: reset the session clock so we don't credit sleep time.
    lastTickTime = now;
  }
  accumulateToBuffer(now);

  if (Object.keys(screenTimeBuffer).length === 0) {
    lastPersistAt = now;
    return;
  }

  const todayStr = new Date().toLocaleDateString("sv");

  chrome.storage.local.get(["screen_time_stats"], (res) => {
    const stats =
      (res.screen_time_stats as Record<string, Record<string, number>>) || {};
    if (!stats[todayStr]) {
      stats[todayStr] = {};
    }

    for (const domain in screenTimeBuffer) {
      if (!stats[todayStr][domain]) {
        stats[todayStr][domain] = 0;
      }
      stats[todayStr][domain] += screenTimeBuffer[domain];
    }

    chrome.storage.local.set({ screen_time_stats: stats }, () => {
      screenTimeBuffer = {};
      lastPersistAt = Date.now();
    });
  });
}

function handleDomainChange(newDomain: string | null): void {
  const now = Date.now();
  accumulateToBuffer(now);
  currentDomain = newDomain;
}

function updateActiveTab(): void {
  chrome.windows.getLastFocused({ populate: false }, (window) => {
    if (!window.focused) {
      handleDomainChange(null);
      return;
    }

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const urlString = tabs[0].url || tabs[0].pendingUrl;
        if (urlString && urlString.startsWith("http")) {
          try {
            const url = new URL(urlString);
            const domain = url.hostname.replace("www.", "");
            handleDomainChange(domain);
            return;
          } catch {
            handleDomainChange(null);
            return;
          }
        }
      }
      handleDomainChange(null);
    });
  });
}

/**
 * Initializes listeners and interval timer for tracking user domain screen time.
 */
export function initScreentimeTracker(): void {
  chrome.tabs.onActivated.addListener(updateActiveTab);
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, _tab) => {
    if (changeInfo.url) {
      updateActiveTab();
    }
  });
  chrome.windows.onFocusChanged.addListener(updateActiveTab);
  chrome.idle?.onStateChanged?.addListener((state) => {
    // Chrome's own idle detector — when the machine is idle/locked,
    // stop counting. This is more reliable than focus heuristics.
    if (state === "active") {
      // Woke from idle: re-sync the clock so no idle time is credited.
      lastTickTime = Date.now();
      updateActiveTab();
    } else {
      handleDomainChange(null);
    }
  });

  // Trigger flushing accumulator to local storage every 10 seconds
  setInterval(saveBufferToStorage, TICK_MS);
}
