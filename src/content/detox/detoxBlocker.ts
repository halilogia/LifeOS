/**
 * detoxBlocker.ts
 * Screen time detox & Pomodoro focus session website blocker.
 * Clean Architecture - Content Script Domain Module Coordinator.
 */

import { evaluateSiteLimits } from "./SiteMatcher.js";
import {
  setupBlockPage,
  showTopWarningBanner,
  removeWarningBanner,
} from "./BlockerUI.js";

export function initDetoxBlocker(): void {
  const currentHost = window.location.hostname;

  // Hiding helper (immediately inject to prevent layout flash)
  const styleEl = document.createElement("style");
  styleEl.innerHTML = "html, body { display: none !important; }";
  if (document.documentElement) {
    document.documentElement.appendChild(styleEl);
  }

  function checkScreenTimeLimits(): void {
    try {
      if (!chrome.runtime?.id) {
        return;
      }

      chrome.storage.local.get(
        [
          "detox_enabled",
          "detox_blocked_sites",
          "detox_end_time",
          "custom_quotes",
          "lang",
          "pomoBlockEnabled",
          "detox_limits",
          "detoxLimits",
        ],
        (settings) => {
          if (chrome.runtime.lastError || !chrome.runtime?.id) {
            return;
          }

          chrome.storage.local.get(
            ["pomodoro_timer_state", "screen_time_stats"],
            (localRes) => {
              if (chrome.runtime.lastError || !chrome.runtime?.id) {
                return;
              }

              const evalRes = evaluateSiteLimits(currentHost, settings, localRes);

              if (
                evalRes.isDetoxActive ||
                evalRes.isPomoActive ||
                evalRes.isLimitExceeded
              ) {
                setupBlockPage({
                  endTime: evalRes.targetEndTime,
                  customQuotes:
                    (settings.custom_quotes as Array<{ text: string }>) || [],
                  lang: (settings.lang as string) || "tr",
                  isPomo: evalRes.isPomoActive,
                  isLimitBlock: evalRes.isLimitBlock,
                  activeLimitMinutes: evalRes.activeLimitMinutes,
                  styleEl,
                });
              } else {
                if (styleEl.parentNode) {
                  styleEl.parentNode.removeChild(styleEl);
                }

                if (
                  evalRes.activeLimitMinutes > 0 &&
                  evalRes.remainingSeconds > 0 &&
                  evalRes.remainingSeconds <= 300
                ) {
                  showTopWarningBanner(
                    Math.ceil(evalRes.remainingSeconds / 60),
                    (settings.lang as string) || "tr",
                    evalRes.limitDomain,
                  );
                } else {
                  removeWarningBanner();
                }
              }
            },
          );
        },
      );
    } catch {
      // Extension context invalidated
    }
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (
      areaName === "local" &&
      (changes["pomodoro_timer_state"] || changes["screen_time_stats"])
    ) {
      checkScreenTimeLimits();
    }
    if (
      areaName === "sync" &&
      (changes["detox_enabled"] ||
        changes["detox_blocked_sites"] ||
        changes["detox_end_time"] ||
        changes["pomoBlockEnabled"] ||
        changes["detox_limits"])
    ) {
      checkScreenTimeLimits();
    }
  });

  checkScreenTimeLimits();

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      checkScreenTimeLimits();
    }
  }, 2000);
}
