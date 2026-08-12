/**
 * domAgentEngine.ts
 * Barrel re-export — Claude / Browser-Use style visual element scanning,
 * neon bounding box overlays, and form autofill engine.
 *
 * Modüller:
 *   pageContextExtractor.ts — sayfa bağlamı + element taraması
 *   elementScanner.ts      — tarama süpürme + vurgulama overlay'leri
 *   actionExecutor.ts      — eylem yürütücü + initDomAgentEngine
 */

export type { PageElementInfo, PageContext } from "./pageContextExtractor.js";
export { getPageContext } from "./pageContextExtractor.js";

export {
  showScanningSweep,
  highlightElement,
  findTargetElement,
} from "./elementScanner.js";

export type {
  AgentActionPayload,
  ExtractedPageData,
} from "./actionExecutor.js";
export { executeAgentAction, initDomAgentEngine } from "./actionExecutor.js";
