/**
 * kpssOsymHistoryFlashcards.ts
 * KPSS SRS — Tarih Çıkmış Sorular kaynağı.
 * Kaynak: ÖSYM çıkmış questions.json (915 tarih sorusu).
 * Sorular KpssFlashcard formatına çevrilir:
 *  - chapter → category (bölüm)
 *  - header (yıl/sınav) → hint
 *  - doğru şık + açıklama → answer
 */

import osymData from "@/data/kpss/osymHistoryQuestions.json";

export interface KpssFlashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  category: string;
}

interface OsymQuestion {
  id: string;
  subject: string;
  chapter?: string;
  header?: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  explanation?: string;
}

export const kpssOsymHistoryFlashcards: KpssFlashcard[] = (
  (osymData as { history?: OsymQuestion[] }).history || []
).map((q) => {
  const answerText = q.options[q.answer] || "";
  const answerParts = [`${q.answer}) ${answerText}`.trim()];
  if (q.explanation) {
    answerParts.push(q.explanation.trim());
  }
  return {
    id: `osym_hist_${q.id}`,
    question: q.question,
    answer: answerParts.join(" — "),
    hint: q.header || "",
    category: q.chapter || "Tarih",
  };
});
