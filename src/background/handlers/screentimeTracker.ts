/**
 * screentimeTracker.ts
 * Clean Architecture - Background Domain Handler for Screen Time Statistics.
 */

let currentDomain: string | null = null;
let domainStartTime: number = Date.now();
let screenTimeBuffer: Record<string, number> = {};

function saveBufferToStorage(): void {
  const activeDomain = currentDomain;
  const now = Date.now();

  if (activeDomain) {
    const elapsed = Math.round((now - domainStartTime) / 1000);
    if (elapsed > 0) {
      const normalElapsed = Math.min(elapsed, 60);
      screenTimeBuffer[activeDomain] =
        (screenTimeBuffer[activeDomain] || 0) + normalElapsed;
      domainStartTime = now;
    }
  }

  if (Object.keys(screenTimeBuffer).length === 0) {
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
    });
  });
}

function handleDomainChange(newDomain: string | null): void {
  const now = Date.now();
  if (currentDomain) {
    const elapsed = Math.round((now - domainStartTime) / 1000);
    if (elapsed > 0) {
      const normalElapsed = Math.min(elapsed, 60);
      screenTimeBuffer[currentDomain] =
        (screenTimeBuffer[currentDomain] || 0) + normalElapsed;
    }
  }

  currentDomain = newDomain;
  domainStartTime = now;
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
          } catch {
            handleDomainChange(null);
          }
        } else {
          handleDomainChange(null);
        }
      } else {
        handleDomainChange(null);
      }
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

  // Trigger flushing accumulator to local storage every 10 seconds
  setInterval(saveBufferToStorage, 10000);
}
