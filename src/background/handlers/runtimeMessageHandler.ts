import { logger } from "@/utils/logger.js";

/**
 * runtimeMessageHandler.ts
 * Clean Architecture - Background Domain Handler for Runtime Messages (Translation, Tab Context, AI Dispatching).
 */

import {
  callAIConfigured,
  getAIConfigFromStorage,
  executeAIAction,
} from "@/services/aiChatService.js";

/**
 * Main runtime message dispatcher for translation, agent actions, tab context, tab grouping, and AI response generation.
 * Returns true if message was handled asynchronously.
 */
export function handleRuntimeMessage(
  message: any,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
): boolean {
  // Translation Relay Service
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
            const translated = data[0]
              .map((item: string[]) => item[0])
              .join("");
            sendResponse({ translation: translated });
          } else {
            sendResponse({ error: "Invalid translation response" });
          }
        } else {
          sendResponse({ error: "Invalid translation response" });
        }
      } catch (err: any) {
        logger.error("Translation query failed:", err);
        sendResponse({ error: err?.message || "Error" });
      }
    });
    return true;
  }

  // Active Tab Context Service
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

      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "agent_get_context" },
        (res) => {
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
        },
      );
    });
    return true;
  }

  // Execute Agent Action Service
  if (message.type === "execute_agent_action") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].id) {
        sendResponse({ success: false, error: "No active tab" });
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "agent_execute_action", payload: message.payload },
        (res) => {
          if (chrome.runtime.lastError || !res) {
            sendResponse({
              success: false,
              message: "Failed to communicate with page.",
            });
          } else {
            sendResponse(res);
          }
        },
      );
    });
    return true;
  }

  // Tab Grouping Service
  if (message.type === "group_active_tab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const tabId = tabs[0].id;
        chrome.tabs.group({ tabIds: [tabId] }, (groupId) => {
          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }
          chrome.tabGroups.update(
            groupId,
            {
              title: "Life OS Agent",
              color: "purple",
            },
            () => {
              sendResponse({ success: true, groupId });
            },
          );
        });
      } else {
        sendResponse({ success: false, error: "No active tab" });
      }
    });
    return true;
  }

  // AI Response Generation Service
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

        // Automatically execute structured AI actions (tasks, notes, memory updates)
        await executeAIAction(aiResult);

        sendResponse({ response: aiResult.reply });
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        sendResponse({ response: `Hata: ${errMsg}` });
      }
    });
    return true;
  }

  return false;
}
