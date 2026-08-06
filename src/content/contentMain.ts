/**
 * contentMain.ts
 * Main entry point for Life OS Content Script.
 * Each module is isolated with try/catch so one failing module never
 * blocks the others (e.g. quiz panel must run even if InfoBox throws).
 */
import { contentError } from "./contentLogger.js";
import { initDetoxBlocker } from "./detox/detoxBlocker.js";
import { initUniversalInfoBox } from "./infobox/universalInfoBox.js";
import { initDomAgentEngine } from "./agent/domAgentEngine.js";
import { initVolumeBoosterListener } from "./volume/volumeBooster.js";
import { initWhatsappBridge } from "./whatsapp/whatsappBridge.js";
import { initTelegramBridge } from "./telegram/telegramBridge.js";
import { initQuizPanel } from "./quiz/quizPanel.js";

function safeInit(name: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    contentError(`[ContentMain] ${name} init failed:`, err);
  }
}

(function () {
  safeInit("DetoxBlocker", initDetoxBlocker);
  safeInit("UniversalInfoBox", initUniversalInfoBox);
  safeInit("DomAgentEngine", initDomAgentEngine);
  safeInit("VolumeBooster", initVolumeBoosterListener);

  // WP/Telegram köprüleri varsayılan KAPALI — Ayarlar > Genel'den açılır.
  chrome.storage.local.get(
    ["whatsappBridgeEnabled", "telegramBridgeEnabled"],
    (settings) => {
      if (settings.whatsappBridgeEnabled) {
        safeInit("WhatsappBridge", initWhatsappBridge);
      }
      if (settings.telegramBridgeEnabled) {
        safeInit("TelegramBridge", initTelegramBridge);
      }
    },
  );

  safeInit("QuizPanel", initQuizPanel);
})();
