/**
 * QuizParser.ts
 * Domain parser utility for AI quiz detection and markdown/text question parsing.
 * Security: Pure data transformation — no DOM mutations.
 */

import { contentLog } from "@/content/contentLogger.js";

export interface QuizQuestion {
  num: number;
  question: string;
  options: Array<{ letter: string; text: string; explanation?: string }>;
  correctAnswer: string | null;
  explanation?: string;
}

export const AI_SITES: Array<{ host: string; name: string }> = [
  { host: "gemini.google.com", name: "Gemini" },
  { host: "chatgpt.com", name: "ChatGPT" },
  { host: "claude.ai", name: "Claude" },
  { host: "copilot.microsoft.com", name: "Copilot" },
];

/** Flexible option marker. Tolerates "A)", "A.", "A-", "* A)", "- A)", "(A)". */
const OPTION_RE = /^(?:[•\-*]\s*)?\(?([A-Ea-e])[.)\-:]\s+(.*)$/;

/**
 * Question start — "Soru" prefix form: "Soru 1:", "Soru 1 (Orta – Öncüllü)",
 * "### **Soru 1 (Kolay – Kavram Bilgisi)**" (after normalizeLine).
 */
const QUESTION_WITH_SORU_RE =
  /^Soru\s+(\d{1,2})\s*[.):\-–]?\s*(?:\([^)]*\)\s*)?(.*)$/i;

/** Question start — bare numbered form: "1. Soru:", "1)", "1- Soru metni". */
const QUESTION_BARE_RE =
  /^(\d{1,2})\s*[.):\-–]\s*(?:Soru\s*)?[:.]*\s*(.*)$/i;

/**
 * Correct answer marker — "Doğru Cevap: A", "Cevap: A", "✓ A",
 * "✓ Doğru Cevap: A", "**✓ Doğru Cevap: A**" (after normalizeLine).
 * Group 1 = the letter.
 */
const ANSWER_RE =
  /(?:doğru\s*cevap|cevap|✓|✔)\s*[:：\-–—]?\s*([A-Ea-e])\b/i;

/** "Açıklama: ..." line — attaches explanation to the current question. */
const EXPLANATION_RE = /^açıklama\s*[:：]?\s*(.*)$/i;

/** Markdown table row: "| Soru | Cevap |", "|---|---|". */
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/;

/** Answer-key table row: "| 1 | A |" → { num: 1, letter: "A" }. */
const ANSWER_KEY_ROW_RE = /^\s*\|?\s*(\d{1,2})\s*\|\s*([A-Ea-e])\s*\|?\s*$/;

/** Metadata/summary lines to ignore: "Cevap Anahtarı", "Zorluk dağılımı:", "Not:" etc. */
const METADATA_RE =
  /^(cevap\s*anahtarı|zorluk\s*dağılımı|soru\s*tipleri?|soru\s*tipi\s*dağılımı|not\s*[:：]?)/i;

/** Dashes-only separator line: "---", "———". */
const DASH_ONLY_RE = /^[-–—\s]+$/;

/**
 * Collects visible text from the AI response area.
 * Uses innerText (not TreeWalker) — innerText preserves inline text
 * ("<strong>Soru 1:</strong> metin" stays on ONE line), while TreeWalker
 * splits text nodes at element boundaries and breaks question parsing.
 * Open shadow roots are walked too (ChatGPT/Claude/Copilot render inside them).
 */
export function collectPageText(): string {
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

/** Strips markdown decoration so matching is robust against **, ###, *, _ */
export function normalizeLine(line: string): string {
  return line
    .replace(/^[\s#>]*/, "") // leading spaces, #, >
    .replace(/[*_`~]{1,3}/g, "") // bold/italic/code markers
    .replace(/^[-–—]+\s*/, "") // leading dashes
    .trim();
}

/** Parses collected text into structured questions. */
export function parseQuestions(rawText: string): QuizQuestion[] {
  const rawLines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const lines = rawLines.map(normalizeLine);

  // User prompt templates like "Soru 1: [soru metni]" / "A) [şıkkı]"
  // are collected too (the user's own message is in the DOM). Drop them.
  const PLACEHOLDER_RE =
    /\[(?:soru\s*metni|şıkkı|şıklar|açıklaması|cevabı|question\s*text|option|answer)\]/i;

  const questions: QuizQuestion[] = [];
  const seenNumbers = new Set<number>();
  // Fallback answer key collected from a trailing "Cevap Anahtarı" table.
  const answerKey = new Map<number, string>();
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- Answer-key table: "| 1 | A |" (may appear mid-chat) ---
    if (TABLE_ROW_RE.test(line) && ANSWER_KEY_ROW_RE.test(line)) {
      const m = ANSWER_KEY_ROW_RE.exec(line);
      if (m) {
        answerKey.set(parseInt(m[1], 10), m[2].toUpperCase());
      }
      continue;
    }

    // --- New question start ---
    const qMatch =
      QUESTION_WITH_SORU_RE.exec(line) || QUESTION_BARE_RE.exec(line);
    if (qMatch) {
      const num = parseInt(qMatch[1], 10);
      // "Soru 1" appearing again = a NEW test started in the same chat.
      if (num === 1 && questions.length > 0) {
        questions.length = 0;
        seenNumbers.clear();
        answerKey.clear();
        contentLog(
          "[QuizPanel] yeni test algılandı — önceki sorular temizlendi",
        );
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

    if (current) {
      // --- Options ---
      const optMatch = OPTION_RE.exec(line);
      if (optMatch && !current.correctAnswer) {
        current.options.push({
          letter: optMatch[1].toUpperCase(),
          text: optMatch[2],
        });
        continue;
      }

      // --- Per-option explanation AFTER the answer line ---
      if (optMatch && current.correctAnswer) {
        const letter = optMatch[1].toUpperCase();
        const existing = current.options.find((o) => o.letter === letter);
        if (existing) {
          existing.explanation = optMatch[2];
        }
        continue;
      }

      // --- Correct answer ---
      const ansMatch = ANSWER_RE.exec(line);
      if (ansMatch) {
        const letter = (ansMatch[1] || ansMatch[2] || "").toUpperCase();
        if (letter) {
          current.correctAnswer = letter;
        }
        // Capture the explanation after "— Açıklama: ..." if present.
        const expl = line.split(/—|–|-/)[1]?.trim();
        if (expl && expl.length > 0) {
          current.explanation = expl.replace(/^açıklama\s*:?\s*/i, "");
        }
        continue;
      }

      // --- Explanation line: "Açıklama: ..." ---
      const explMatch = EXPLANATION_RE.exec(line);
      if (explMatch && explMatch[1]) {
        current.explanation = explMatch[1];
        continue;
      }

      // --- Metadata / separators / tables — ignore ---
      if (
        METADATA_RE.test(line) ||
        DASH_ONLY_RE.test(line) ||
        TABLE_ROW_RE.test(line)
      ) {
        continue;
      }

      // Fallback: multi-line question stems
      current.question =
        current.question.length > 0
          ? `${current.question}\n${line}`
          : line;
    }
  }

  flush();

  for (const q of questions) {
    if (!q.correctAnswer) {
      const letter = answerKey.get(q.num);
      if (letter) {
        q.correctAnswer = letter;
      }
    }
  }

  return questions.filter((q) => q.correctAnswer !== null);
}
