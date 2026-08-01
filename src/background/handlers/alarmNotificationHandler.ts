import { logger } from "@/utils/logger.js";

/**
 * alarmNotificationHandler.ts
 * Clean Architecture - Background Domain Handler for Alarms and Notifications (Free Games, Calendar Tasks, BIST Stock Alerts).
 */

import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

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
      const t = getTranslation(lang as Language);

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
          const notifiedIds =
            (localRes.notified_giveaway_ids as number[]) || [];
          const newGiveaways = filtered.filter(
            (item: { id: number }) => !notifiedIds.includes(item.id),
          );

          if (newGiveaways.length === 0) {
            return;
          }

          newGiveaways.forEach(
            (item: { id: number; title: string; worth: string }) => {
              const title = t.notif_free_game_title.replace(
                "{title}",
                item.title,
              );
              const message = t.notif_free_game_msg.replace(
                "{worth}",
                item.worth,
              );

              chrome.notifications.create(String(item.id), {
                type: "basic",
                iconUrl: "icons/icon-128.png",
                title: title,
                message: message,
                priority: 2,
              });
            },
          );

          const updatedIds = [
            ...notifiedIds,
            ...newGiveaways.map((item: { id: number }) => item.id),
          ];
          chrome.storage.local.set({ notified_giveaway_ids: updatedIds });
        });
      } catch (err) {
        logger.error("Failed to check free games:", err);
      }
    },
  );
}

async function checkCalendarTasks(): Promise<void> {
  chrome.storage.sync.get(
    ["calendarNotificationsEnabled", "lang", "todos"],
    (syncRes) => {
      const notificationsEnabled =
        (syncRes.calendarNotificationsEnabled as boolean) ?? true;
      if (!notificationsEnabled) {
        return;
      }

      const lang = (syncRes.lang as string) || "tr";
      const t = getTranslation(lang as Language);
      const todos =
        (syncRes.todos as Array<{ completed: boolean; dueDate?: string }>) ||
        [];

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

          const title = t.notif_calendar_title;
          const message = t.notif_calendar_msg.replace(
            "{count}",
            String(dueToday.length),
          );

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
    const rules =
      (res.stockRules as Array<{
        symbol: string;
        isActive: boolean;
        ruleType: string;
      }>) || [];
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

/**
 * Initializes alarm listeners and notification click handlers.
 */
export function initAlarmNotificationHandler(): void {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "check_free_games") {
      checkFreeGames();
    } else if (alarm.name === "check_calendar_tasks") {
      checkCalendarTasks();
    } else if (alarm.name === "check_bist_stock_rules") {
      checkBistStockRules();
    }
  });

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
}
