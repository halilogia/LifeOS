/**
 * twitterCleaner.ts
 * Real-time DOM purging and MutationObserver cleaner specifically built for Twitter / X.
 * SSM tekniği: element SİLME yerine stil gizleme (mute) — React geri getirse de gizli kalır.
 */

import { DistractionSettings } from "./detoxTypes.js";

const TWEET_SELECTOR =
  "article[data-testid='tweet'], div[data-testid='cellInnerSequence']";

function hideElement(el: Element): void {
  const htmlEl = el as HTMLElement;
  // Silme YOK — stil gizleme. React yeniden render etse bile display:none korunur.
  htmlEl.style.setProperty("display", "none", "important");
  htmlEl.style.setProperty("visibility", "hidden", "important");
  htmlEl.style.setProperty("height", "0px", "important");
  htmlEl.style.setProperty("max-height", "0px", "important");
  htmlEl.style.setProperty("overflow", "hidden", "important");
}

export function cleanTwitterTimeline(currentSettings: DistractionSettings): void {
  const hostname = window.location.hostname;
  if (!hostname.includes("x.com") && !hostname.includes("twitter.com")) {
    return;
  }
  if (!currentSettings.xFeedBlock) {
    return;
  }

  // Universal DOM query for tweet articles across the entire document
  const tweets = document.querySelectorAll(TWEET_SELECTOR);
  tweets.forEach((el) => {
    hideElement(el);
    // Üst container'ları da gizle (React wrapper'ları)
    let parent = el.parentElement;
    let depth = 0;
    while (parent && depth < 4) {
      if (
        parent.getAttribute("data-testid") === "cellInnerDiv" ||
        parent.getAttribute("data-testid") === "cellInnerSequence"
      ) {
        hideElement(parent);
      }
      parent = parent.parentElement;
      depth++;
    }
  });
}
