/**
 * kpssOsymHistoryFlashcards.ts
 * KPSS SRS — Tarih Çıkmış Sorular kaynağı.
 * Kaynak: ÖSYM çıkmış questions.json (915 tarih sorusu).
 *
 * Kart Arka Yüzü Sadece Doğru Cevap + Temiz İpucu gösterecek biçimde biçimlendirilmiştir.
 */

import osymData from "@/services/kpss/data/osymHistoryQuestions.json";

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
  // answer harfini temizle (örn. "A", " Yanıt A", "A 2" -> "A")
  const rawAns = (q.answer || "").trim();
  const cleanAnsLetter = rawAns.charAt(0).toUpperCase();
  const optionText = q.options?.[cleanAnsLetter] || q.options?.[rawAns] || "";

  // Arka yüzde SADECE Doğru Şık Harfi + Cevap Metni gösterilir
  const answerDisplay = optionText
    ? `${cleanAnsLetter}) ${optionText}`
    : rawAns
      ? `Cevap: ${rawAns}`
      : "Açıklamaya bakınız";

  const hintText = [q.header || "", q.explanation || ""]
    .filter(Boolean)
    .join(" — ");

  return {
    id: `osym_hist_${q.id}`,
    question: q.question,
    answer: answerDisplay,
    hint: hintText,
    category: q.chapter || "Tarih",
  };
});
