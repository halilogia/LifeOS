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
      // Capped to a maximum of 12 seconds to filter out periods when computer is in sleep or locked
      const normalElapsed = Math.min(elapsed, 12);
      screenTimeBuffer[activeDomain] =
        (screenTimeBuffer[activeDomain] || 0) + normalElapsed;
      domainStartTime = now; // reset start time to prevent double counting
    }
  }

  if (Object.keys(screenTimeBuffer).length === 0) {
    return;
  }

  // Svenska (sv) locale returns YYYY-MM-DD format reliably
  const todayStr = new Date().toLocaleDateString("sv");

  chrome.storage.local.get(["screen_time_stats"], (res) => {
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
      const normalElapsed = Math.min(elapsed, 12);
      screenTimeBuffer[currentDomain] =
        (screenTimeBuffer[currentDomain] || 0) + normalElapsed;
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

// Register Listeners for tab changes, URL navigation, and windows focus
chrome.tabs.onActivated.addListener(updateActiveTab);
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, _tab) => {
  if (changeInfo.url) {
    updateActiveTab();
  }
});
chrome.windows.onFocusChanged.addListener(updateActiveTab);

// Trigger flushing accumulator to local storage every 10 seconds
setInterval(saveBufferToStorage, 10000);

// --- Steam, Epic Games, GOG Free Giveaway Checking System ---
async function checkFreeGames() {
  chrome.storage.sync.get(
    ["freeGamesNotificationsEnabled", "lang"],
    async (syncRes) => {
      const notificationsEnabled =
        syncRes.freeGamesNotificationsEnabled ?? true;
      if (!notificationsEnabled) {
        return;
      }

      const lang = syncRes.lang || "tr";

      try {
        const response = await fetch(
          "https://www.gamerpower.com/api/giveaways",
        );
        if (!response.ok) {
          return;
        }
        const giveaways = await response.json();
        if (!Array.isArray(giveaways)) {
          return;
        }

        // Filter for Steam, Epic Games, GOG only
        const targetPlatforms = ["steam", "epic games store", "gog"];
        const filtered = giveaways.filter((item) => {
          if (!item.platforms) {
            return false;
          }
          const platformsLower = item.platforms.toLowerCase();
          return targetPlatforms.some((plat) => platformsLower.includes(plat));
        });

        if (filtered.length === 0) {
          return;
        }

        chrome.storage.local.get(["notified_giveaway_ids"], (localRes) => {
          const notifiedIds = localRes.notified_giveaway_ids || [];
          const newGiveaways = filtered.filter(
            (item) => !notifiedIds.includes(item.id),
          );

          if (newGiveaways.length === 0) {
            return;
          }

          // Notify user for each new giveaway
          newGiveaways.forEach((item) => {
            const title =
              lang === "tr"
                ? `Ücretsiz Oyun: ${item.title}`
                : `Free Game: ${item.title}`;
            const message =
              lang === "tr"
                ? `Değeri: ${item.worth}. Almak için tıkla!`
                : `Worth: ${item.worth}. Click to claim!`;

            chrome.notifications.create(String(item.id), {
              type: "basic",
              iconUrl: "icons/icon-128.png",
              title: title,
              message: message,
              priority: 2,
            });
          });

          // Save updated notified IDs list
          const updatedIds = [
            ...notifiedIds,
            ...newGiveaways.map((item) => item.id),
          ];
          chrome.storage.local.set({ notified_giveaway_ids: updatedIds });
        });
      } catch (err) {
        console.error("Failed to check free games:", err);
      }
    },
  );
}

async function checkCalendarTasks() {
  chrome.storage.sync.get(
    ["calendarNotificationsEnabled", "lang", "todos"],
    (syncRes) => {
      const notificationsEnabled = syncRes.calendarNotificationsEnabled ?? true;
      if (!notificationsEnabled) {
        return;
      }

      const lang = syncRes.lang || "tr";
      const todos = syncRes.todos || [];

      // sv locale returns YYYY-MM-DD format reliably
      const todayStr = new Date().toLocaleDateString("sv");
      const dueToday = todos.filter((t) => !t.completed && t.dueDate === todayStr);

      if (dueToday.length === 0) {
        return;
      }

      chrome.storage.local.get(["last_calendar_notification_date"], (localRes) => {
        const lastDate = localRes.last_calendar_notification_date;
        if (lastDate === todayStr) {
          return;
        }

        const title =
          lang === "tr"
            ? "Bugün Yapılacak Görevleriniz Var"
            : "You Have Tasks Due Today";
        const message =
          lang === "tr"
            ? `Bugün tamamlamanız gereken ${dueToday.length} adet görev bulunuyor. Görmek için tıklayın!`
            : `You have ${dueToday.length} tasks to complete today. Click to view!`;

        chrome.notifications.create("calendar_tasks_due_today", {
          type: "basic",
          iconUrl: "icons/icon-128.png",
          title: title,
          message: message,
          priority: 2,
        });

        chrome.storage.local.set({ last_calendar_notification_date: todayStr });
      });
    },
  );
}

// Alarm Trigger Listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "check_free_games") {
    checkFreeGames();
  } else if (alarm.name === "check_calendar_tasks") {
    checkCalendarTasks();
  }
});

// Register Alarms on installation and browser startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("check_free_games", { periodInMinutes: 60 });
  chrome.alarms.create("check_calendar_tasks", { periodInMinutes: 30 });
  checkFreeGames();
  checkCalendarTasks();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("check_free_games", { periodInMinutes: 60 });
  chrome.alarms.create("check_calendar_tasks", { periodInMinutes: 30 });
  checkCalendarTasks();
});

// Listen for notification clicks to open the giveaway claim links or newtab page
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "calendar_tasks_due_today") {
    chrome.tabs.create({ url: "chrome://newtab" });
    return;
  }
  const giveawayId = parseInt(notificationId, 10);
  if (!isNaN(giveawayId)) {
    chrome.tabs.create({
      url: `https://www.gamerpower.com/open/${giveawayId}`,
    });
  }
});

// Translation Relay Service
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "translate_text") {
    chrome.storage.sync.get(["lang"], async (res) => {
      let targetLang = res.lang === "tr" ? "tr" : "en";
      try {
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          message.text,
        )}`;
        let response = await fetch(url);
        if (!response.ok) {
          sendResponse({ error: "Translation fetch failed" });
          return;
        }
        let data = await response.json();
        if (data && data[0]) {
          const detectedLang = data[2];
          // Auto-swap target language if input language matches target language
          if (detectedLang === targetLang) {
            const swappedLang = targetLang === "tr" ? "en" : "tr";
            url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${swappedLang}&dt=t&q=${encodeURIComponent(
              message.text,
            )}`;
            response = await fetch(url);
            if (response.ok) {
              data = await response.json();
            }
          }

          if (data && data[0]) {
            const translated = data[0].map((item) => item[0]).join("");
            sendResponse({ translation: translated });
          } else {
            sendResponse({ error: "Invalid translation response" });
          }
        } else {
          sendResponse({ error: "Invalid translation response" });
        }
      } catch (err) {
        console.error("Translation query failed:", err);
        sendResponse({ error: err.message });
      }
    });
    return true; // Keeps the message channel open for asynchronous sendResponse
  }
});
