let currentDomain = null;
let domainStartTime = Date.now();
let screenTimeBuffer = {};

function saveBufferToStorage() {
  const activeDomain = currentDomain;
  const now = Date.now();
  
  // Save current active domain elapsed seconds since startTime
  if (activeDomain) {
    const elapsed = Math.round((now - domainStartTime) / 1000);
    if (elapsed > 0) {
      screenTimeBuffer[activeDomain] = (screenTimeBuffer[activeDomain] || 0) + elapsed;
      domainStartTime = now; // reset start time to prevent double counting
    }
  }

  if (Object.keys(screenTimeBuffer).length === 0) return;

  // Svenska (sv) locale returns YYYY-MM-DD format reliably
  const todayStr = new Date().toLocaleDateString('sv');

  chrome.storage.local.get(['screen_time_stats'], (res) => {
    const stats = res.screen_time_stats || {};
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
      // Clear buffered values on success
      screenTimeBuffer = {};
    });
  });
}

function handleDomainChange(newDomain) {
  const now = Date.now();
  if (currentDomain) {
    const elapsed = Math.round((now - domainStartTime) / 1000);
    if (elapsed > 0) {
      screenTimeBuffer[currentDomain] = (screenTimeBuffer[currentDomain] || 0) + elapsed;
    }
  }

  currentDomain = newDomain;
  domainStartTime = now;
}

function updateActiveTab() {
  chrome.windows.getLastFocused({ populate: false }, (window) => {
    if (!window.focused) {
      handleDomainChange(null);
      return;
    }

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const urlString = tabs[0].url || tabs[0].pendingUrl;
        if (urlString && urlString.startsWith('http')) {
          try {
            const url = new URL(urlString);
            const domain = url.hostname.replace('www.', '');
            handleDomainChange(domain);
          } catch (e) {
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

// Register Listeners for tab changes, URL navigation, and windows focus
chrome.tabs.onActivated.addListener(updateActiveTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateActiveTab();
  }
});
chrome.windows.onFocusChanged.addListener(updateActiveTab);

// Trigger flushing accumulator to local storage every 10 seconds
setInterval(saveBufferToStorage, 10000);
