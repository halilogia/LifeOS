/**
 * kpssConstants.ts
 * Domain constants, subject name dictionary, and target dates for KPSS Module.
 * Clean Architecture - Domain Constants Layer.
 */

export const SUBJECT_NAMES: Record<string, Record<string, string>> = {
  tr: {
    turkce: "Türkçe",
    matematik: "Matematik",
    geometri: "Geometri",
    tarih: "Tarih",
    cografya: "Coğrafya",
    vatandaslik: "Vatandaşlık",
    progress_text: "tamamlandı",
    chart_empty: "Henüz veri yok",
    stats_title: "Günlük İlerleme",
    stat_questions: "Soru Sayısı",
    stat_subject: "Ders",
    save: "Kaydet",
    reset: "Sıfırla",
    reset_confirm: "Tüm KPSS çalışma verileriniz silinecektir. Emin misiniz?",
    details_title: "Konu Detayı",
  },
  en: {
    turkce: "Turkish",
    matematik: "Mathematics",
    geometri: "Geometry",
    tarih: "History",
    cografya: "Geography",
    vatandaslik: "Citizenship",
    progress_text: "completed",
    chart_empty: "No data yet",
    stats_title: "Daily Progress",
    stat_questions: "Question Count",
    stat_subject: "Subject",
    save: "Save",
    reset: "Reset",
    reset_confirm:
      "All your KPSS study statistics will be deleted. Are you sure?",
    details_title: "Topic Detail",
  },
};

export const subjectsList: string[] = [
  "turkce",
  "matematik",
  "geometri",
  "tarih",
  "cografya",
  "vatandaslik",
];

export interface KpssExamCycle {
  id: string;
  name: string;
  targetDate: number;
}

export const KPSS_EXAM_CYCLES: KpssExamCycle[] = [
  {
    id: "kpss_2026",
    name: "2026 KPSS Lisans",
    targetDate: new Date("2026-09-06T10:15:00").getTime(),
  },
  {
    id: "kpss_2027",
    name: "2027 KPSS",
    targetDate: new Date("2027-09-05T10:15:00").getTime(),
  },
  {
    id: "kpss_2028",
    name: "2028 KPSS Lisans",
    targetDate: new Date("2028-09-03T10:15:00").getTime(),
  },
];

export interface ActiveKpssCycleInfo {
  cycle: KpssExamCycle;
  isPast: boolean;
  daysRemaining: number;
}

export function getActiveKpssCycle(now: number = Date.now()): ActiveKpssCycleInfo {
  const upcoming = KPSS_EXAM_CYCLES.find((c) => c.targetDate > now);
  if (upcoming) {
    const diff = upcoming.targetDate - now;
    return {
      cycle: upcoming,
      isPast: false,
      daysRemaining: Math.ceil(diff / (1000 * 60 * 60 * 24)),
    };
  }
  const last = KPSS_EXAM_CYCLES[KPSS_EXAM_CYCLES.length - 1];
  return {
    cycle: last,
    isPast: true,
    daysRemaining: 0,
  };
}

export const KPSS_TARGET_DATE: number = getActiveKpssCycle().cycle.targetDate;
