/**
 * contentMain.ts
 * Main entry point for Life OS Content Script.
 * Clean Architecture - Imports & initializes all content modules.
 */
import { initDetoxBlocker } from "./detox/detoxBlocker.js";
import { initUniversalInfoBox } from "./infobox/universalInfoBox.js";
import { initDomAgentEngine } from "./agent/domAgentEngine.js";
import { initVolumeBoosterListener } from "./volume/volumeBooster.js";
import { initWhatsappBridge } from "./whatsapp/whatsappBridge.js";
import { initTelegramBridge } from "./telegram/telegramBridge.js";

(function () {
  initDetoxBlocker();
  initUniversalInfoBox();
  initDomAgentEngine();
  initVolumeBoosterListener();
  initWhatsappBridge();
  initTelegramBridge();
})();
