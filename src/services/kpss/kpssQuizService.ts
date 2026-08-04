/**
 * kpssQuizService.ts
 * Service module for querying local KPSS past questions archives and handling exam subsets.
 * Clean Architecture - Service Layer.
 */

import { KPSS_YEARLY_DATA } from "@/data/kpss/kpssDataRegistry.js";
import osymData from "@/data/kpss/osymHistoryQuestions.json";
import { QuizQuestion } from "@/services/kpss/kpssAiService.js";

export interface KpssPastQuizSession {
  id: string;
  date: string;
  questionCount: number;
  score: number;
  questions: QuizQuestion[];
  selectedAnswers: number[];
  mode?: "local" | "external";
}

export interface KpssPastQuiz {
  subject: string;
  topic: string;
  score: number;
  questions: QuizQuestion[];
  selectedAnswers: number[];
  date: string;
  history?: KpssPastQuizSession[];
}

/**
 * Aggregates questions for a specific topic across yearly exam archives.
 */
export function getLocalQuestionsForTopic(
  subjectKey: string,
  topicName: string,
): QuizQuestion[] {
  const aggregated: QuizQuestion[] = [];
  Object.values(KPSS_YEARLY_DATA).forEach((yearData) => {
    const list = yearData[subjectKey];
    if (Array.isArray(list)) {
      list.forEach((q: unknown) => {
        const quizQ = q as KpssPastQuiz;
        if (quizQ.topic === topicName) {
          aggregated.push(quizQ as unknown as QuizQuestion);
        }
      });
    }
  });
  return aggregated;
}

/**
 * Generates questions list for specific exam year or mixed GY-GK past exams.
 * Supports countLimit and selectedChapter filtering for Tarih Soru Arşivi (915 Q) & Karma Sınav.
 * Uses KPSS Lisans exam distribution ratios (50% History, 35% Geography, 15% Math) when All subjects selected in Mixed mode.
 */
export function getPastExamQuestions(
  year: string,
  subject: string,
  countLimit?: number,
  selectedChapter?: string,
): QuizQuestion[] {
  let questions: QuizQuestion[] = [];

  if (year === "tarih_arsivi") {
    const list = (osymData as { history?: any[] }).history || [];
    list.forEach((q) => {
      let isMatch = false;
      if (!selectedChapter || selectedChapter === "all") {
        isMatch = true;
      } else if (q.chapter) {
        const normQ = q.chapter.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, "");
        const normSel = selectedChapter.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, "");
        isMatch =
          normQ === normSel ||
          normQ.includes(normSel) ||
          normSel.includes(normQ);
      }

      if (isMatch) {
        const rawAns = (q.answer || "").trim();
        const cleanAnsLetter = rawAns.charAt(0).toUpperCase();
        const letters = ["A", "B", "C", "D", "E"];
        const correctIdx = letters.indexOf(cleanAnsLetter);

        questions.push({
          question: q.question,
          options: letters.map((l) => `${l}) ${q.options?.[l] || ""}`),
          correctAnswer: correctIdx !== -1 ? correctIdx : 0,
          solution: q.explanation
            ? `${cleanAnsLetter}) ${q.options?.[cleanAnsLetter] || ""} — ${q.explanation}`
            : `${cleanAnsLetter}) ${q.options?.[cleanAnsLetter] || ""}`,
        });
      }
    });

    // Rastgele karıştır
    questions = [...questions].sort(() => Math.random() - 0.5);
  } else if (year === "karma") {
    if (subject === "all") {
      // 🎯 KPSS Lisans Gerçek Dağılım Oranı: %50 Tarih, %35 Coğrafya, %15 Matematik
      const historyPool: QuizQuestion[] = [];
      const geoPool: QuizQuestion[] = [];
      const mathPool: QuizQuestion[] = [];

      Object.keys(KPSS_YEARLY_DATA).forEach((y) => {
        const yearData = KPSS_YEARLY_DATA[y];
        if (yearData.tarih)
          historyPool.push(...(yearData.tarih as unknown as QuizQuestion[]));
        if (yearData.cografya)
          geoPool.push(...(yearData.cografya as unknown as QuizQuestion[]));
        if (yearData.matematik)
          mathPool.push(...(yearData.matematik as unknown as QuizQuestion[]));
      });

      const totalTarget = countLimit || 20;
      const historyCount = Math.round(totalTarget * 0.5);
      const geoCount = Math.round(totalTarget * 0.35);
      const mathCount = Math.max(1, totalTarget - historyCount - geoCount);

      const shuffle = (arr: QuizQuestion[]) =>
        [...arr].sort(() => Math.random() - 0.5);

      const pickedHistory = shuffle(historyPool).slice(0, historyCount);
      const pickedGeo = shuffle(geoPool).slice(0, geoCount);
      const pickedMath = shuffle(mathPool).slice(0, mathCount);

      return shuffle([...pickedHistory, ...pickedGeo, ...pickedMath]);
    } else {
      // Tekil bir ders seçildiyse o dersin tüm yıllardaki sorularını karıştır
      Object.keys(KPSS_YEARLY_DATA).forEach((y) => {
        const yearData = KPSS_YEARLY_DATA[y];
        const list = yearData[subject];
        if (Array.isArray(list)) {
          questions.push(...(list as unknown as QuizQuestion[]));
        }
      });
      questions = [...questions].sort(() => Math.random() - 0.5);
    }
  } else {
    const yearData = KPSS_YEARLY_DATA[year];
    if (yearData) {
      if (subject === "all") {
        Object.values(yearData).forEach((list: unknown) => {
          if (Array.isArray(list)) {
            questions.push(...(list as unknown as QuizQuestion[]));
          }
        });
      } else {
        questions = (yearData[subject] || []) as unknown as QuizQuestion[];
      }
    }
  }

  // Eğer countLimit verilmişse sınırı uygula
  if (countLimit && countLimit > 0 && questions.length > countLimit) {
    return questions.slice(0, countLimit);
  }

  return questions;
}
