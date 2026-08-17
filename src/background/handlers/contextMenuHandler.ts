/**
 * contextMenuHandler.ts
 * Clean Architecture - Background Domain Handler for Right-Click Context Menus and Extension Commands.
 */

import { registerFeed } from "@/services/rssService.js";

function setupContextMenus(): void {
  if (!chrome.contextMenus) {
    return;
  }
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

    // RSS kaydet — herhangi bir sayfa/link üzerinde
    chrome.contextMenus.create({
      id: "lifeos_rss_save",
      title: "📡 RSS Kaydet",
      contexts: ["page", "link", "selection"],
    });
  });
}

/**
 * Initializes context menus, extension startup listeners, hotkeys, and context menu click actions.
 */
export function initContextMenuHandler(): void {
  chrome.runtime.onInstalled.addListener(() => {
    setupContextMenus();
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: false })
        .catch(() => {});
    }
  });

  chrome.runtime.onStartup.addListener(() => {
    setupContextMenus();
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: false })
        .catch(() => {});
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
    // RSS Kaydet — önce content script'ten sayfadaki <link rel="alternate"> feed URL'sini
    // keşfetmeyi dene; yoksa link href'i ya da sayfa URL'i kullanılır.
    if (info.menuItemId === "lifeos_rss_save") {
      const fallbackUrl = info.linkUrl || (tab && tab.url) || "";
      if (!fallbackUrl) {
        return;
      }
      void (async () => {
        let feedUrl = fallbackUrl;
        let discovered = false;
        if (tab && tab.id !== undefined) {
          try {
            const found = await chrome.tabs.sendMessage(tab.id, {
              type: "rss_discover_feed",
            });
            if (
              found &&
              typeof found.url === "string" &&
              found.url.startsWith("http")
            ) {
              feedUrl = found.url;
              discovered = true;
            }
          } catch {
            // Content script yüklü değil (örn. chrome:// sayfası) — fallback kullanılır
          }
        }
        const result = await registerFeed(feedUrl);
        const status = result.ok
          ? discovered
            ? "✅ RSS feed bulundu ve kaydedildi"
            : "✅ RSS feed kaydedildi"
          : `❌ ${result.error || "Kaydedilemedi"}`;
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon-128.png",
          title: "Life OS — RSS",
          message: status,
        });
      })();
      return;
    }

    if (tab && tab.id) {
      chrome.sidePanel.open({ tabId: tab.id });

      let autoPrompt = "";
      if (info.menuItemId === "lifeos_summarize_page") {
        autoPrompt = "Bu sayfayı 3 ana maddede özetle.";
      } else if (info.menuItemId === "lifeos_translate_page") {
        autoPrompt =
          "Bu sayfanın içeriğini Türkçe'ye çevir ve anlaşılır bir özet sun.";
      } else if (
        info.menuItemId === "lifeos_analyze_selection" &&
        info.selectionText
      ) {
        autoPrompt = `Şu seçili metni analiz et ve anlaşılır Türkçe açıklamasını yap:\n"${info.selectionText}"`;
      }

      if (autoPrompt) {
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: "copilot_auto_prompt",
            prompt: autoPrompt,
          });
        }, 600);
      }
    }
  });
}
