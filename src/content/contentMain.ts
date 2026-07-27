/**
 * contentMain.ts
 * Main entry point for Life OS Content Script.
 * Clean Architecture - Imports & initializes Detox Blocker & Universal InfoBox.
 */

import { initDetoxBlocker } from "./detox/detoxBlocker.js";
import { initUniversalInfoBox } from "./infobox/universalInfoBox.js";
import { initDomAgentEngine } from "./agent/domAgentEngine.js";

(function () {
  initDetoxBlocker();
  initUniversalInfoBox();
  initDomAgentEngine();
})();
