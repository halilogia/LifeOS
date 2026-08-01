/**
 * backgroundMain.ts
 * Background Service Worker for Life OS Chrome Extension.
 * Clean Architecture - Service Worker Entry Orchestrator.
 */

import { initScreentimeTracker } from "./handlers/screentimeTracker.js";
import { initAlarmNotificationHandler } from "./handlers/alarmNotificationHandler.js";
import { initContextMenuHandler } from "./handlers/contextMenuHandler.js";
import { handleMediaAndTabMessage } from "./handlers/mediaAndTabHandler.js";
import { handleRuntimeMessage } from "./handlers/runtimeMessageHandler.js";

// Initialize Background Handlers & Listeners
initScreentimeTracker();
initAlarmNotificationHandler();
initContextMenuHandler();

// Unified Message Orchestrator
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. Dispatch media, offscreen audio, and tab volume booster events
  const handledMedia = handleMediaAndTabMessage(message, sender, sendResponse);
  if (handledMedia) {
    return true;
  }

  // 2. Dispatch translation, tab context, tab grouping, and AI generation events.
  //    Async handler — sendResponse çağrıları callback içinde tetiklenir.
  //    Kanal açık tutulur: async listener + return true, Promise resolve
  //    edince kanalı kapatır ve callback'teki sendResponse kaybolurdu
  //    (content tarafında "message port closed" → çeviri balonu sessizce ölürdü).
  void handleRuntimeMessage(message, sender, sendResponse).then((handled) => {
    if (!handled) {
      sendResponse({ ok: true });
    }
  });

  return true;
});
