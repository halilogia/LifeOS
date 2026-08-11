/**
 * twitterCleaner.ts
 * Real-time DOM purging and MutationObserver cleaner specifically built for Twitter / X.
 */

import { DistractionSettings } from "./detoxTypes.js";

export function cleanTwitterTimeline(currentSettings: DistractionSettings): void {
  const hostname = window.location.hostname;
  if (!hostname.includes("x.com") && !hostname.includes("twitter.com")) {
    return;
  }
  if (!currentSettings.xFeedBlock) {
    return;
  }

  // Universal DOM query for tweet articles across the entire document
  const tweets = document.querySelectorAll(
    "article[data-testid='tweet'], div[data-testid='cellInnerSequence']",
  );
  tweets.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
}
