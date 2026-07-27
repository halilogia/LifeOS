/**
 * backgroundMain.ts
 * Background Service Worker for Life OS Chrome Extension.
 * Clean Architecture - Service Worker Domain Entry Point.
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
      const normalElapsed = Math.min(elapsed, 12);
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
    const stats = (res.screen_time_stats as Record<string, Record<string, number>>) || {};
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
      const normalElapsed = Math.min(elapsed, 12);
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
async function checkFreeGames(): Promise<void> {
  chrome.storage.sync.get(
    ["freeGamesNotificationsEnabled", "lang"],
    async (syncRes) => {
      const notificationsEnabled =
        (syncRes.freeGamesNotificationsEnabled as boolean) ?? true;
      if (!notificationsEnabled) {
        return;
      }

      const lang = (syncRes.lang as string) || "tr";

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
          const notifiedIds = (localRes.notified_giveaway_ids as number[]) || [];
          const newGiveaways = filtered.filter(
            (item: { id: number }) => !notifiedIds.includes(item.id),
          );

          if (newGiveaways.length === 0) {
            return;
          }

          newGiveaways.forEach((item: { id: number; title: string; worth: string }) => {
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

          const updatedIds = [
            ...notifiedIds,
            ...newGiveaways.map((item: { id: number }) => item.id),
          ];
          chrome.storage.local.set({ notified_giveaway_ids: updatedIds });
        });
      } catch (err) {
        console.error("Failed to check free games:", err);
      }
    },
  );
}

async function checkCalendarTasks(): Promise<void> {
  chrome.storage.sync.get(
    ["calendarNotificationsEnabled", "lang", "todos"],
    (syncRes) => {
      const notificationsEnabled = (syncRes.calendarNotificationsEnabled as boolean) ?? true;
      if (!notificationsEnabled) {
        return;
      }

      const lang = (syncRes.lang as string) || "tr";
      const todos = (syncRes.todos as Array<{ completed: boolean; dueDate?: string }>) || [];

      const todayStr = new Date().toLocaleDateString("sv");
      const dueToday = todos.filter(
        (t) => !t.completed && t.dueDate === todayStr,
      );

      if (dueToday.length === 0) {
        return;
      }

      chrome.storage.local.get(
        ["last_calendar_notification_date"],
        (localRes) => {
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

          chrome.storage.local.set({
            last_calendar_notification_date: todayStr,
          });
        },
      );
    },
  );
}

// Alarm Trigger Listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "check_free_games") {
    checkFreeGames();
  } else if (alarm.name === "check_calendar_tasks") {
    checkCalendarTasks();
  } else if (alarm.name === "check_bist_stock_rules") {
    checkBistStockRules();
  }
});

function isBistMarketOpen(): boolean {
  const date = new Date();
  const utcOffset = date.getTimezoneOffset() * 60000;
  const trtDate = new Date(date.getTime() + utcOffset + 3 * 3600000);
  const day = trtDate.getDay();
  if (day === 0 || day === 6) {
    return false;
  }
  const timeInMinutes = trtDate.getHours() * 60 + trtDate.getMinutes();
  return timeInMinutes >= 9 * 60 + 55 && timeInMinutes <= 18 * 60 + 15;
}

async function checkBistStockRules(): Promise<void> {
  if (!isBistMarketOpen()) {
    return;
  }

  chrome.storage.sync.get(["stockPortfolio", "stockRules"], async (res) => {
    const portfolio = (res.stockPortfolio as Array<{ symbol: string }>) || [];
    const rules = (res.stockRules as Array<{ symbol: string; isActive: boolean; ruleType: string }>) || [];
    if (portfolio.length === 0 || rules.length === 0) {
      return;
    }

    const symbols = Array.from(new Set(portfolio.map((p) => p.symbol)));
    for (const sym of symbols) {
      try {
        const fullSymbol = sym.toUpperCase().endsWith(".IS")
          ? sym.toUpperCase()
          : `${sym.toUpperCase()}.IS`;
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fullSymbol)}?interval=1d&range=1d`;
        const resp = await fetch(url);
        if (!resp.ok) {
          continue;
        }
        const json = await resp.json();
        const meta = json?.chart?.result?.[0]?.meta;
        if (!meta) {
          continue;
        }

        const price = meta.regularMarketPrice ?? 0;
        const prev = meta.previousClose ?? price;
        const changePct = prev !== 0 ? ((price - prev) / prev) * 100 : 0;
        const normSym = fullSymbol.replace(/\.IS$/, "");

        const activeRules = rules.filter(
          (r) =>
            r.symbol.replace(/\.IS$/, "").toUpperCase() === normSym &&
            r.isActive,
        );
        for (const r of activeRules) {
          let triggered = false;
          let title = "BIST Alarm Uyarısı";
          let message = "";

          if (r.ruleType === "RED_CANDLE" && changePct <= -4.0) {
            triggered = true;
            title = `⚠️ KRİZ UYARISI: ${normSym} Sert Düşüşte!`;
            message = `${normSym} %${changePct.toFixed(2)} düşüş yaşadı. Anlık fiyat: ₺${price.toFixed(2)}`;
          } else if (r.ruleType === "TAVAN_BREAK" && changePct < 8.5) {
            triggered = true;
            title = `⚡ ${normSym} Tavan Bozdu!`;
            message = `${normSym} tavan serisini bozdu. Günlük değişim: %${changePct.toFixed(2)}`;
          }

          if (triggered) {
            chrome.notifications.create(`bist-${normSym}-${Date.now()}`, {
              type: "basic",
              iconUrl: "icons/icon128.png",
              title: title,
              message: message,
              priority: 2,
            });
          }
        }
      } catch {
        // ignore background fetch errors
      }
    }
  });
}

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
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "translate_text") {
    chrome.storage.sync.get(["lang"], async (res) => {
      const targetLang = res.lang === "tr" ? "tr" : "en";
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
            const translated = data[0].map((item: string[]) => item[0]).join("");
            sendResponse({ translation: translated });
          } else {
            sendResponse({ error: "Invalid translation response" });
          }
        } else {
          sendResponse({ error: "Invalid translation response" });
        }
      } catch (err: any) {
        console.error("Translation query failed:", err);
        sendResponse({ error: err?.message || "Error" });
      }
    });
    return true;
  }
});
