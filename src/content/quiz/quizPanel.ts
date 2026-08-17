/**
 * quizPanel.ts
 * Content Script Domain Module — External AI sites quiz overlay panel coordinator.
 * Detects AI quiz responses in Gemini/ChatGPT/Claude/Copilot, shows a small
 * "Quiz Mode" trigger button, and opens an isolated Shadow DOM overlay.
 *
 * Clean Architecture - Content Script Orchestrator.
 * Security: Safe DOM APIs only — NO innerHTML for user content (AGENTS.md 4.4).
 */

import { contentLog } from "@/content/contentLogger.js";
import { AI_SITES, collectPageText, parseQuestions } from "./QuizParser.js";
import {
  isPanelOpen,
  setQuizState,
  showTrigger,
  hideTrigger,
} from "./QuizRenderer.js";

let collectedText = "";
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function initQuizPanel(): void {
  const host = window.location.hostname;
  const matchedSite = AI_SITES.find(
    (entry) => host === entry.host || host.endsWith("." + entry.host),
  );

  if (!matchedSite) {
    return;
  }

  contentLog(`[QuizPanel] Active on ${matchedSite.name} (${host})`);

  const start = () => {
    const observer = new MutationObserver(() => {
      scheduleParse();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }

  // Initial scan — a past chat may already be in the DOM.
  setTimeout(() => {
    tryParse();
  }, 1200);
}

/** Debounced parse — runs 1.8s after the last DOM change (AI finished typing). */
function scheduleParse(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    tryParse();
  }, 1800);
}

function tryParse(): void {
  const raw = collectPageText();
  if (!raw || raw === collectedText) {
    return;
  }
  collectedText = raw;

  // Freeze parsing while the overlay panel is open
  if (isPanelOpen()) {
    return;
  }

  const questions = parseQuestions(raw);
  contentLog(
    `[QuizPanel] parse: ${questions.length} soru bulundu (raw ${raw.length} karakter)`,
  );
  if (questions.length < 2) {
    hideTrigger();
    return;
  }

  setQuizState(questions);
  showTrigger();
}
