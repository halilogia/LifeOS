/**
 * rssSyncHandler.ts
 * Background handler: periodic RSS sync via chrome.alarms + runtime messages.
 * Clean Architecture - Background Domain Handler.
 */

import { registerFeed, syncAllFeeds } from "@/services/rssService.js";
import { rssRepository } from "@/infrastructure/persistence/ChromeStorageRssRepository.js";
import { logger } from "@/utils/logger.js";

const RSS_ALARM = "rss_sync_alarm";
const RSS_SYNC_PERIOD_MINUTES = 30;

interface RssMessage {
  type: string;
  url?: string;
  feedId?: string;
  itemId?: string;
}

export function initRssSyncHandler(): void {
  // Periyodik alarm — extension kurulumunda + her açılışta garanti et
  const ensureAlarm = () => {
    chrome.alarms.get(RSS_ALARM, (alarm) => {
      if (!alarm) {
        chrome.alarms.create(RSS_ALARM, {
          periodInMinutes: RSS_SYNC_PERIOD_MINUTES,
        });
      }
    });
  };
  chrome.runtime.onInstalled.addListener(ensureAlarm);
  chrome.runtime.onStartup.addListener(ensureAlarm);

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === RSS_ALARM) {
      void syncAllFeeds();
    }
  });

  chrome.runtime.onMessage.addListener((message: RssMessage, _sender, sendResponse) => {
    if (!message || typeof message.type !== "string") {
      return false;
    }

    if (message.type === "rss_register_feed") {
      void (async () => {
        const result = await registerFeed(message.url || "");
        sendResponse(result);
      })();
      return true; // async response
    }

    if (message.type === "rss_sync_all") {
      void (async () => {
        await syncAllFeeds();
        sendResponse({ ok: true });
      })();
      return true;
    }

    if (message.type === "rss_remove_feed") {
      void (async () => {
        if (message.feedId) {
          await rssRepository.removeFeed(message.feedId);
          sendResponse({ ok: true });
        } else {
          sendResponse({ ok: false, error: "feedId eksik" });
        }
      })();
      return true;
    }

    if (message.type === "rss_mark_read") {
      void (async () => {
        if (message.itemId) {
          await rssRepository.markItemRead(message.itemId);
          sendResponse({ ok: true });
        } else {
          sendResponse({ ok: false, error: "itemId eksik" });
        }
      })();
      return true;
    }

    return false;
  });

  logger.info("[RssSyncHandler] başlatıldı (30 dk periyot)");
}
