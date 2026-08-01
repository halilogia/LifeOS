/**
 * quizPanel.ts
 * Content Script Domain Module — External AI sites quiz overlay panel.
 * Detects AI quiz responses in Gemini/ChatGPT/Claude/Copilot, shows a small
 * "Quiz Mode" trigger button, and opens an isolated Shadow DOM overlay with
 * clickable option cards, navigation, and a score summary.
 *
 * Clean Architecture - Content Script Module.
 * Security: createElement + textContent only — NO innerHTML (AGENTS.md 4.4).
 */
import { contentLog, contentError } from "@/content/contentLogger.js";

const AI_SITES: Array<{ host: string; name: string }> = [
  { host: "gemini.google.com", name: "Gemini" },
  { host: "chatgpt.com", name: "ChatGPT" },
  { host: "claude.ai", name: "Claude" },
  { host: "copilot.microsoft.com", name: "Copilot" },
];

/** Flexible option marker: "A." "A)" "* A)" "**A)**" etc. */
const OPTION_RE = /^\s*[*_]*([A-E])[.)]\s*(.*)$/i;

/** Question start marker: "Soru 1:", "**1. Soru:**", "1.", "1)", "1-)" etc. */
const QUESTION_RE =
  /^\s*[*_#]*\s*(?:Soru\s*)?(\d{1,2})\s*[.):\-–]?\s*(?:Soru\s*)?[:*_#]*\s*(.*)$/i;

/** Correct answer marker: "Doğru Cevap: X", "✓ X", "Cevap: X". */
const ANSWER_RE = /(?:doğru\s*cevap|✓|cevap)\s*[:*\-–]?\s*([A-E])/i;

const STORAGE_KEY = "lifos_quiz_stats";

interface QuizQuestion {
  num: number;
  question: string;
  options: Array<{ letter: string; text: string }>;
  correctAnswer: string | null;
  explanation?: string;
}

interface QuizStats {
  completedTests: number;
  totalQuestions: number;
  correctAnswers: number;
  lastDate: string;
}

let panelHost: HTMLElement | null = null;
let triggerButton: HTMLElement | null = null;
let collectedText = "";
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let parsedQuestions: QuizQuestion[] = [];
let currentIndex = 0;
let selectedAnswers: Record<number, string> = {};

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
  // MutationObserver only fires on CHANGES, so scan once on load.
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

/**
 * Collects visible text from the AI response area.
 * Uses innerText (not TreeWalker) — innerText preserves inline text
 * ("<strong>Soru 1:</strong> metin" stays on ONE line), while TreeWalker
 * splits text nodes at element boundaries and breaks question parsing.
 * Open shadow roots are walked too (ChatGPT/Claude/Copilot render inside them).
 */
function collectPageText(): string {
  const parts: string[] = [];
  const seen = new Set<Node>();

  const walk = (root: ParentNode) => {
    const text = (root as HTMLElement).innerText ?? root.textContent ?? "";
    if (text.trim()) {
      parts.push(text.trim());
    }
    root.querySelectorAll("*").forEach((el) => {
      const shadow = (el as HTMLElement).shadowRoot as ShadowRoot | null;
      if (shadow && shadow.mode === "open" && !seen.has(shadow)) {
        seen.add(shadow);
        walk(shadow);
      }
    });
  };

  walk(document.body);
  return parts.join("\n");
}

/** Parses collected text into structured questions. */
function parseQuestions(rawText: string): QuizQuestion[] {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // User prompt templates like "Soru 1: [soru metni]" / "A) [şıkkı]"
  // are collected too (the user's own message is in the DOM). Drop them.
  const PLACEHOLDER_RE =
    /\[(?:soru\s*metni|şıkkı|şıklar|açıklaması|cevabı|question\s*text|option|answer)\]/i;

  const questions: QuizQuestion[] = [];
  const seenNumbers = new Set<number>();
  let current: QuizQuestion | null = null;

  const flush = () => {
    if (current && current.options.length >= 2) {
      // Drop user-template questions (placeholder text).
      const hasPlaceholder =
        PLACEHOLDER_RE.test(current.question) ||
        current.options.some((o) => PLACEHOLDER_RE.test(o.text));
      if (!hasPlaceholder) {
        questions.push(current);
      }
    }
    current = null;
  };

  for (const line of lines) {
    const qMatch = QUESTION_RE.exec(line);
    if (qMatch && qMatch[1]) {
      const num = parseInt(qMatch[1], 10);
      // "Soru 1" appearing again = a NEW test started in the same chat.
      // The user's template questions (with [soru metni] placeholders) are
      // never pushed, so a real "Soru 1" only comes from an AI answer.
      if (num === 1 && questions.length > 0) {
        questions.length = 0;
        seenNumbers.clear();
        contentLog("[QuizPanel] yeni test algılandı — önceki sorular temizlendi");
      }
      flush();
      seenNumbers.add(num);
      current = {
        num,
        question: qMatch[2] || line,
        options: [],
        correctAnswer: null,
      };
      continue;
    }

    const optMatch = OPTION_RE.exec(line);
    if (optMatch && current) {
      current.options.push({
        letter: optMatch[1].toUpperCase(),
        text: optMatch[2],
      });
      continue;
    }

    const ansMatch = ANSWER_RE.exec(line);
    if (ansMatch && current) {
      current.correctAnswer = ansMatch[1].toUpperCase();
      // Capture the explanation after "— Açıklama: ..." if present.
      const expl = line.split(/—|–|-/)[1]?.trim();
      if (expl && expl.length > 0) {
        current.explanation = expl.replace(/^açıklama\s*:?\s*/i, "");
      }
      continue;
    }

    // Fallback: a paragraph line that matches nothing (multi-line question
    // stems, ÖSYM-style long questions) gets appended to the current
    // question text instead of being dropped.
    if (current) {
      current.question =
        current.question.length > 0
          ? `${current.question}\n${line}`
          : line;
    }
  }

  flush();
  return questions;
}

function tryParse(): void {
  const raw = collectPageText();
  if (!raw || raw === collectedText) {
    return;
  }
  collectedText = raw;

  // Freeze parsing while the overlay panel is open — the user is mid-quiz.
  if (document.getElementById("lifos-quiz-panel-host")) {
    return;
  }

  const questions = parseQuestions(raw);
  contentLog(
    `[QuizPanel] parse: ${questions.length} soru bulundu (raw ${raw.length} karakter)`,
  );
  if (questions.length < 2) {
    // No usable quiz detected — hide trigger if shown.
    hideTrigger();
    return;
  }

  // Replace the parsed set on every valid parse. A second test in the
  // same chat has the SAME question numbers (1-5), so a "grew" check
  // (questions.length > previous) would compare 5 > 5 = false and keep
  // the OLD test. Duplicate-number filtering in parseQuestions already
  // drops the first test's questions in favor of the newer ones.
  parsedQuestions = questions;
  currentIndex = 0;
  selectedAnswers = {};
  showTrigger();
}

/** Shows the small floating trigger button (bottom-right). */
function showTrigger(): void {
  if (triggerButton && triggerButton.isConnected) {
    return;
  }

  const host = document.createElement("div");
  host.id = "lifos-quiz-trigger-host";
  host.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483646;
  `;

  const shadow = host.attachShadow({ mode: "open" });

  const btn = document.createElement("button");
  btn.textContent = "Quiz Moduna Geç";
  btn.style.cssText = `
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  `;
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.05)";
    btn.style.boxShadow = "0 12px 32px rgba(139, 92, 246, 0.55)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "0 8px 24px rgba(139, 92, 246, 0.4)";
  });
  btn.addEventListener("click", () => {
    openPanel();
  });

  shadow.appendChild(btn);
  document.body.appendChild(host);
  triggerButton = btn;
  panelHost = host;
}

function hideTrigger(): void {
  if (panelHost && panelHost.isConnected) {
    panelHost.remove();
  }
  panelHost = null;
  triggerButton = null;
}

/** Opens the full overlay quiz panel in its own Shadow DOM. */
function openPanel(): void {
  if (!panelHost) {
    return;
  }

  const overlayHost = document.createElement("div");
  overlayHost.id = "lifos-quiz-panel-host";
  overlayHost.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
  `;

  const shadow = overlayHost.attachShadow({ mode: "open" });
  renderPanel(shadow);

  document.body.appendChild(overlayHost);

  // ESC to close.
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      overlayHost.remove();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

/** Closes the overlay panel. Works from inside shadow DOM —
 *  closest() cannot cross the shadow boundary, so we remove
 *  the host element directly. */
function closePanel(): void {
  document.getElementById("lifos-quiz-panel-host")?.remove();
}

/** Renders the quiz panel content into the shadow root. */
function renderPanel(shadow: ShadowRoot): void {
  shadow.innerHTML = ""; // Clear (we control this root — safe).

  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      font-family: system-ui, -apple-system, sans-serif;
      color: #f8fafc;
    }
    .panel {
      background: linear-gradient(160deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      width: min(720px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(90deg, #a78bfa, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .counter {
      font-size: 14px;
      color: #94a3b8;
    }
    .close-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #f8fafc;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
    }
    .close-btn:hover { background: rgba(255, 255, 255, 0.25); }
    .question-text {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
      color: #e2e8f0;
    }
    .option {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      margin-bottom: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .option:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.4);
    }
    .option.selected {
      background: rgba(139, 92, 246, 0.25);
      border-color: #8b5cf6;
    }
    .option.correct {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
    }
    .option.wrong {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
    }
    .option-letter {
      font-weight: 700;
      color: #a78bfa;
      min-width: 20px;
    }
    .option-text { color: #e2e8f0; line-height: 1.5; }
    .explanation {
      margin-top: 28px;
      padding: 14px 16px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      color: #d1fae5;
      font-size: 14px;
      line-height: 1.6;
    }
    .explanation strong { color: #6ee7b7; }
    .nav {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      gap: 12px;
    }
    .nav-btn {
      padding: 10px 20px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .nav-btn.prev {
      background: rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }
    .nav-btn.next {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: #fff;
    }
    .result {
      text-align: center;
      padding: 40px 0;
    }
    .result-score {
      font-size: 48px;
      font-weight: 800;
      background: linear-gradient(90deg, #a78bfa, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .result-detail {
      color: #94a3b8;
      margin-top: 12px;
      font-size: 16px;
    }
  `;
  shadow.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  shadow.appendChild(overlay);

  const panel = document.createElement("div");
  panel.className = "panel";
  overlay.appendChild(panel);

  renderQuestionView(panel);
}

/** Renders the current question into the panel. */
function renderQuestionView(panel: HTMLElement): void {
  panel.innerHTML = "";

  // Clamp index in case questions were re-parsed while panel was open.
  if (currentIndex < 0) {
    currentIndex = 0;
  }
  if (currentIndex >= parsedQuestions.length) {
    currentIndex = Math.max(0, parsedQuestions.length - 1);
  }

  const q = parsedQuestions[currentIndex];
  if (!q) {
    // No questions at all — show empty state instead of a blank panel.
    const empty = document.createElement("div");
    empty.className = "result";
    empty.textContent = "Soru bulunamadı — panel kapatılıyor.";
    panel.appendChild(empty);
    contentLog("[QuizPanel] renderQuestionView: no questions available");
    return;
  }

  // Header
  const header = document.createElement("div");
  header.className = "header";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = "KPSS Quiz";

  const counter = document.createElement("div");
  counter.className = "counter";
  counter.textContent = `${currentIndex + 1} / ${parsedQuestions.length}`;

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    closePanel();
  });

  header.appendChild(title);
  header.appendChild(counter);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Question text
  const qText = document.createElement("div");
  qText.className = "question-text";
  qText.appendChild(renderRichText(q.question));
  panel.appendChild(qText);

  // Options — after the user picks, show correct (green) + wrong (red)
  // on EVERY question immediately, not just the last one.
  const hasSelected = selectedAnswers[currentIndex] !== undefined;
  const showResult = hasSelected && q.correctAnswer !== null;

  q.options.forEach((opt) => {
    const optEl = document.createElement("div");
    optEl.className = "option";

    const selected = selectedAnswers[currentIndex] === opt.letter;

    if (showResult) {
      if (opt.letter === q.correctAnswer) {
        optEl.classList.add("correct");
      } else if (selected) {
        optEl.classList.add("wrong");
      }
    } else if (selected) {
      optEl.classList.add("selected");
    }

    const letter = document.createElement("div");
    letter.className = "option-letter";
    letter.textContent = opt.letter;

    const text = document.createElement("div");
    text.className = "option-text";
    text.appendChild(renderRichText(opt.text));

    optEl.appendChild(letter);
    optEl.appendChild(text);

    optEl.addEventListener("click", () => {
      // Lock once answered — no re-picking after seeing the answer.
      if (showResult) {
        return;
      }
      selectedAnswers[currentIndex] = opt.letter;
      renderQuestionView(panel);
    });

    panel.appendChild(optEl);
  });

  // Explanation box — shown AFTER the options, once answered.
  if (showResult && q.explanation) {
    const explanationEl = document.createElement("div");
    explanationEl.className = "explanation";
    const label = document.createElement("strong");
    label.textContent = "Açıklama: ";
    explanationEl.appendChild(label);
    explanationEl.appendChild(renderRichText(q.explanation));
    panel.appendChild(explanationEl);
  }

  // Nav
  const nav = document.createElement("div");
  nav.className = "nav";

  const prevBtn = document.createElement("button");
  prevBtn.className = "nav-btn prev";
  prevBtn.textContent = "← Geri";
  prevBtn.disabled = currentIndex === 0;
  prevBtn.addEventListener("click", () => {
    currentIndex--;
    renderQuestionView(panel);
  });

  const nextBtn = document.createElement("button");
  nextBtn.className = "nav-btn next";

  const isFinished = currentIndex === parsedQuestions.length - 1;

  if (isFinished) {
    nextBtn.textContent = "Bitir";
    nextBtn.addEventListener("click", () => {
      renderResultView(panel);
    });
  } else {
    nextBtn.textContent = "İleri →";
    nextBtn.addEventListener("click", () => {
      currentIndex++;
      renderQuestionView(panel);
    });
  }

  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);
  panel.appendChild(nav);
}

/** Renders the final score view. */
function renderResultView(panel: HTMLElement): void {
  panel.innerHTML = "";

  let correct = 0;
  let total = 0;

  parsedQuestions.forEach((q, idx) => {
    if (q.correctAnswer === null) {
      return; // Skip questions without known answer.
    }
    total++;
    if (selectedAnswers[idx] === q.correctAnswer) {
      correct++;
    }
  });

  const result = document.createElement("div");
  result.className = "result";

  const score = document.createElement("div");
  score.className = "result-score";
  score.textContent =
    total > 0 ? `${Math.round((correct / total) * 100)}%` : "—";

  const detail = document.createElement("div");
  detail.className = "result-detail";
  detail.textContent =
    total > 0
      ? `${correct} / ${total} doğru`
      : "Doğru cevap bilgisi bulunamadı";

  result.appendChild(score);
  result.appendChild(detail);

  const closeBtn = document.createElement("button");
  closeBtn.className = "nav-btn next";
  closeBtn.textContent = "Kapat";
  closeBtn.style.marginTop = "24px";
  closeBtn.addEventListener("click", () => {
    closePanel();
  });

  result.appendChild(closeBtn);
  panel.appendChild(result);

  // Save stats.
  if (total > 0) {
    void saveStats(correct, total);
  }
}

/**
 * Renders text with `$...$` LaTeX-ish segments styled as inline math.
 * Pure DOM building — no innerHTML.
 */
function renderRichText(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const parts = text.split(/(\$[^$]+\$)/g);

  parts.forEach((part) => {
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const math = document.createElement("span");
      math.style.cssText = `
        font-family: 'Courier New', monospace;
        font-style: italic;
        color: #c4b5fd;
        background: rgba(139, 92, 246, 0.1);
        padding: 2px 6px;
        border-radius: 6px;
      `;
      math.textContent = part.slice(1, -1);
      frag.appendChild(math);
    } else if (part) {
      frag.appendChild(document.createTextNode(part));
    }
  });

  return frag;
}

/** Saves quiz statistics to chrome.storage.local. */
async function saveStats(correct: number, total: number): Promise<void> {
  try {
    const res = await chrome.storage.local.get(STORAGE_KEY);
    const existing = (res[STORAGE_KEY] as QuizStats | undefined) ?? {
      completedTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      lastDate: new Date().toISOString().split("T")[0],
    };

    const today = new Date().toISOString().split("T")[0];
    const stats: QuizStats = {
      completedTests: existing.completedTests + 1,
      totalQuestions: existing.totalQuestions + total,
      correctAnswers: existing.correctAnswers + correct,
      lastDate: today,
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: stats });
    contentLog(`[QuizPanel] Stats saved: ${correct}/${total}`);
  } catch (err) {
    contentError("[QuizPanel] saveStats error:", err);
  }
}
