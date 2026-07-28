/**
 * backgroundMain.ts
 * Background Service Worker for Life OS Chrome Extension.
 * Clean Architecture - Service Worker Domain Entry Point.
 */

import {
  createAmbientAudioEngine,
  AmbientSoundType,
} from "@/services/ambientAudioService.js";
import { callAIConfigured, getAIConfigFromStorage } from "@/services/aiChatService.js";

let bgAudioEngine = createAmbientAudioEngine();

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

  // SidePanel & Web Agent Relay Service
  if (message.type === "open_sidepanel") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "No active tab found" });
      }
    });
    return true;
  }

  if (message.type === "get_active_tab_context") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].id) {
        sendResponse({
          success: false,
          context: {
            title: "Aktif Sayfa",
            url: "",
            domain: "",
            selectedText: "",
            pageText: "",
            interactiveElements: [],
          },
        });
        return;
      }

      const tabUrl = tabs[0].url || "";
      if (
        tabUrl.startsWith("chrome://") ||
        tabUrl.startsWith("edge://") ||
        tabUrl.startsWith("chrome-extension://") ||
        tabUrl.startsWith("about:")
      ) {
        sendResponse({
          success: true,
          context: {
            title: tabs[0].title || "Sistem Sayfası",
            url: tabUrl,
            domain: "chrome",
            selectedText: "",
            pageText: `[Sistem Sayfası] ${tabs[0].title || "Chrome Sayfası"}. Güvenlik sebebiyle sistem sayfalarının içerik taranması kısıtlıdır.`,
            interactiveElements: [],
          },
        });
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { type: "agent_get_context" }, (res) => {
        if (chrome.runtime.lastError || !res) {
          sendResponse({
            success: true,
            context: {
              title: tabs[0].title || "Aktif Sayfa",
              url: tabUrl,
              domain: "",
              selectedText: "",
              pageText: `${tabs[0].title || "Aktif Sayfa"}. İçerik taranıyor veya sayfa yenilenmesi gerekebilir.`,
              interactiveElements: [],
            },
          });
        } else {
          sendResponse(res);
        }
      });
    });
    return true;
  }

  if (message.type === "execute_agent_action") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].id) {
        sendResponse({ success: false, error: "No active tab" });
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { type: "agent_execute_action", payload: message.payload }, (res) => {
        if (chrome.runtime.lastError || !res) {
          sendResponse({ success: false, message: "Failed to communicate with page." });
        } else {
          sendResponse(res);
        }
      });
    });
    return true;
  }

  if (message.type === "group_active_tab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const tabId = tabs[0].id;
        chrome.tabs.group({ tabIds: [tabId] }, (groupId) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          chrome.tabGroups.update(groupId, {
            title: "Life OS Agent",
            color: "purple",
          }, () => {
            sendResponse({ success: true, groupId });
          });
        });
      } else {
        sendResponse({ success: false, error: "No active tab" });
      }
    });
    return true;
  }

  if (message.type === "GENERATE_AI_RESPONSE") {
    getAIConfigFromStorage().then(async (aiConfig) => {
      try {
        const aiResult = await callAIConfigured({
          userPrompt: message.prompt,
          aiProvider: aiConfig.aiProvider,
          aiApiKey: aiConfig.aiApiKey,
          aiModel: aiConfig.aiModel,
          aiEndpoint: aiConfig.aiEndpoint,
          enableWebSearch: true,
        });
        sendResponse({ response: aiResult.reply });
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        sendResponse({ response: `Hata: ${errMsg}` });
      }
    });
    return true;
  }
});

// Setup Right-Click Context Menus
function setupContextMenus(): void {
  if (!chrome.contextMenus) return;
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "lifeos_copilot_root",
      title: "Life OS Copilot",
      contexts: ["page", "selection"],
    });

    chrome.contextMenus.create({
      id: "lifeos_open_copilot",
      parentId: "lifeos_copilot_root",
      title: "🚀 Life OS Yan Panelini Aç",
      contexts: ["page", "selection"],
    });

    chrome.contextMenus.create({
      id: "lifeos_summarize_page",
      parentId: "lifeos_copilot_root",
      title: "📝 Sayfayı Özetle",
      contexts: ["page"],
    });

    chrome.contextMenus.create({
      id: "lifeos_translate_page",
      parentId: "lifeos_copilot_root",
      title: "🔤 Sayfayı Türkçe'ye Çevir",
      contexts: ["page"],
    });

    chrome.contextMenus.create({
      id: "lifeos_analyze_selection",
      parentId: "lifeos_copilot_root",
      title: "💬 Seçili Metni Analiz Et / Çevir",
      contexts: ["selection"],
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }
});

chrome.runtime.onStartup.addListener(() => {
  setupContextMenus();
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "open_companion_ai" || command === "_execute_side_panel") {
    if (tab?.id) {
      chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => {});
        }
      });
    }
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab && tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });

    let autoPrompt = "";
    if (info.menuItemId === "lifeos_summarize_page") {
      autoPrompt = "Bu sayfayı 3 ana maddede özetle.";
    } else if (info.menuItemId === "lifeos_translate_page") {
      autoPrompt = "Bu sayfanın içeriğini Türkçe'ye çevir ve anlaşılır bir özet sun.";
    } else if (info.menuItemId === "lifeos_analyze_selection" && info.selectionText) {
      autoPrompt = `Şu seçili metni analiz et ve anlaşılır Türkçe açıklamasını yap:\n"${info.selectionText}"`;
    }

    if (autoPrompt) {
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: "copilot_auto_prompt", prompt: autoPrompt });
      }, 600);
    }
  }
});

async function ensureOffscreenDocument() {
  try {
    const hasDoc = await chrome.offscreen.hasDocument();
    if (!hasDoc) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: "Play persistent Pomodoro ambient background sounds",
      });
    }
  } catch {
    // Ignore error if offscreen document is already created
  }
}

// Handle Volume Booster & Offscreen Ambient Audio
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "play_ambient_sound" || message.type === "set_ambient_volume") {
    ensureOffscreenDocument().then(() => {
      chrome.runtime.sendMessage(message).catch(() => {});
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "open_sidepanel") {
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.sidePanel.open({ tabId: tabs[0].id });
        }
      });
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "set_volume_boost" && message.tabId) {
    const targetTabId = message.tabId;
    const multiplier = Number(message.volumeLevel) || 1.0;

    chrome.scripting
      .executeScript({
        target: { tabId: targetTabId },
        world: "MAIN",
        func: (boostMultiplier: number) => {
          let audioCtx = (window as any)._lifeosAudioCtx;
          let gainNode = (window as any)._lifeosGainNode;

          if (!audioCtx) {
            const AudioCtxClass =
              window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtxClass) return;
            audioCtx = new AudioCtxClass();
            gainNode = audioCtx.createGain();
            gainNode.connect(audioCtx.destination);
            (window as any)._lifeosAudioCtx = audioCtx;
            (window as any)._lifeosGainNode = gainNode;
          }

          if (audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => {});
          }

          const connectedMap =
            (window as any)._lifeosConnectedMap || new WeakMap();
          (window as any)._lifeosConnectedMap = connectedMap;

          const mediaEls = Array.from(
            document.querySelectorAll("video, audio"),
          ) as HTMLMediaElement[];

          mediaEls.forEach((el) => {
            if (!connectedMap.has(el)) {
              try {
                const source = audioCtx.createMediaElementSource(el);
                source.connect(gainNode);
                connectedMap.set(el, source);
              } catch (e) {}
            }
          });

          if (gainNode) {
            try {
              gainNode.gain.setValueAtTime(
                boostMultiplier,
                audioCtx.currentTime,
              );
            } catch (e) {}
          }
        },
        args: [multiplier],
      })
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        console.warn("[Background VolumeBoost] executeScript failed:", err);
        sendResponse({ success: false, error: String(err) });
      });

    return true;
  }
});

