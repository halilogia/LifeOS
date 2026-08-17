import {
  loadExamYearData,
  loadAllExamData,
  AVAILABLE_EXAM_YEARS,
} from "@/services/kpss/data/kpssDataRegistry.js";
import { QuizQuestion } from "@/services/kpss/kpssAiService.js";

// In-memory cache — loaded once, reused across calls
let _cachedAllData: Record<string, Record<string, unknown[]>> | null = null;

async function getAllData(): Promise<
  Record<string, Record<string, unknown[]>>
> {
  if (!_cachedAllData) {
    _cachedAllData = await loadAllExamData();
  }
  return _cachedAllData;
}

function clearDataCache(): void {
  _cachedAllData = null;
}

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
export async function getLocalQuestionsForTopic(
  subjectKey: string,
  topicName: string,
): Promise<QuizQuestion[]> {
  const allData = await getAllData();
  const aggregated: QuizQuestion[] = [];
  Object.values(allData).forEach((yearData) => {
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
export async function getPastExamQuestions(
  year: string,
  subject: string,
  countLimit?: number,
  selectedChapter?: string,
): Promise<QuizQuestion[]> {
  let questions: QuizQuestion[] = [];

  if (year === "tarih_arsivi") {
    const osymData = (
      await import("@/services/kpss/data/osymHistoryQuestions.json")
    ).default;
    const rawHistory = (osymData as { history?: unknown[] }).history || [];
    type HistoryItem = {
      chapter?: string;
      question?: string;
      answer?: string;
      options?: Record<string, string>;
      explanation?: string;
    };
    const list = rawHistory as HistoryItem[];
    list.forEach((q) => {
      let isMatch = false;
      if (!selectedChapter || selectedChapter === "all") {
        isMatch = true;
      } else if (q.chapter) {
        const normQ = q.chapter.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, "");
        const normSel = selectedChapter
          .toLowerCase()
          .replace(/[^a-z0-9çğıöşü]/g, "");
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
          question: q.question || "",
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
  } else if (year === "tarih_arsivi54") {
    // SON 54 YILIN TARİH SORULARI (OCR'dan parse edilen, 2026-08)
    const osym54Data = (
      await import("@/services/kpss/data/osymHistoryQuestions54.json")
    ).default;
    const rawHistory = (osym54Data as { history?: unknown[] }).history || [];
    type History54Item = {
      chapter?: string;
      question?: string;
      answer?: string;
      options?: Record<string, string>;
      explanation?: string;
    };
    const list = rawHistory as History54Item[];
    list.forEach((q) => {
      // sadece 5 şıklı soruları al (OCR şık kaybı olanlar quiz'de bozuk görünür)
      if (!q.options || Object.keys(q.options).length !== 5) {
        return;
      }
      let isMatch = false;
      if (!selectedChapter || selectedChapter === "all") {
        isMatch = true;
      } else if (q.chapter) {
        const normQ = q.chapter.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, "");
        const normSel = selectedChapter
          .toLowerCase()
          .replace(/[^a-z0-9çğıöşü]/g, "");
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
          question: q.question || "",
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

      const allData = await getAllData();
      Object.keys(allData).forEach((y) => {
        const yearData = allData[y];
        if (yearData.tarih) {
          historyPool.push(...(yearData.tarih as unknown as QuizQuestion[]));
        }
        if (yearData.cografya) {
          geoPool.push(...(yearData.cografya as unknown as QuizQuestion[]));
        }
        if (yearData.matematik) {
          mathPool.push(...(yearData.matematik as unknown as QuizQuestion[]));
        }
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
      const allData2 = await getAllData();
      Object.keys(allData2).forEach((y) => {
        const yearData = allData2[y];
        const list = yearData[subject];
        if (Array.isArray(list)) {
          questions.push(...(list as unknown as QuizQuestion[]));
        }
      });
      questions = [...questions].sort(() => Math.random() - 0.5);
    }
  } else {
    const allData3 = await getAllData();
    const yearData = allData3[year];
    if (yearData) {
      if (subject === "all") {
        Object.values(yearData).forEach((list: unknown[]) => {
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

/**
 * Returns question count for a given exam year and subject.
 * Used by KpssPastExamsDashboard to display counts without importing data directly.
 */
export async function getExamSubjectCount(
  year: string,
  subject: string,
): Promise<number> {
  if (year === "tarih_arsivi") {
    return subject === "tarih" || subject === "all" ? 915 : 0;
  }
  if (year === "tarih_arsivi54") {
    // sadece 5 şıklı sorular (OCR şık kaybı olanlar quiz'de bozuk görünür)
    const osym54Data = (
      await import("@/services/kpss/data/osymHistoryQuestions54.json")
    ).default;
    const rawHistory = (osym54Data as { history?: unknown[] }).history || [];
    const count = rawHistory.filter(
      (q) =>
        (q as { options?: Record<string, string> }).options &&
        Object.keys((q as { options: Record<string, string> }).options)
          .length === 5,
    ).length;
    return subject === "tarih" || subject === "all" ? count : 0;
  }
  if (year === "karma") {
    const allData = await getAllData();
    let sum = 0;
    Object.entries(allData).forEach(([yKey, yData]) => {
      if (yKey !== "tarih_arsivi") {
        if (subject === "all") {
          sum +=
            (yData.tarih?.length || 0) +
            (yData.cografya?.length || 0) +
            (yData.matematik?.length || 0);
        } else if (yData[subject]) {
          sum += (yData[subject] as unknown[]).length;
        }
      }
    });
    return sum;
  }

  const yearData = await loadExamYearData(year);
  if (!yearData) {
    return 0;
  }

  if (subject === "all") {
    return (
      (yearData.tarih?.length || 0) +
      (yearData.cografya?.length || 0) +
      (yearData.matematik?.length || 0)
    );
  }

  return (yearData[subject] as unknown[] | undefined)?.length || 0;
}

export { AVAILABLE_EXAM_YEARS };
