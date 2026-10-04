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

export type KpssDateStatus = "official" | "estimated" | "unannounced";

export interface KpssExamCycle {
  id: string;
  name: string;
  year: number;
  targetDate?: number;
  dateStatus: KpssDateStatus;
}

export const KPSS_EXAM_CYCLES: KpssExamCycle[] = [
  {
    id: "kpss_2026",
    name: "2026 KPSS Lisans",
    year: 2026,
    targetDate: new Date("2026-09-06T10:15:00").getTime(),
    dateStatus: "official",
  },
  {
    id: "kpss_2027",
    name: "2027 KPSS",
    year: 2027,
    // ÖSYM 2027 sınav takvimini henüz resmi olarak duyurmadı
    dateStatus: "unannounced",
  },
];

export interface ActiveKpssCycleInfo {
  cycle: KpssExamCycle;
  isPast: boolean;
  daysRemaining?: number;
  statusLabel: string;
}

export function getActiveKpssCycle(now: number = Date.now()): ActiveKpssCycleInfo {
  const kpss2026 = KPSS_EXAM_CYCLES[0];
  if (kpss2026.targetDate && now <= kpss2026.targetDate) {
    const diff = kpss2026.targetDate - now;
    return {
      cycle: kpss2026,
      isPast: false,
      daysRemaining: Math.ceil(diff / (1000 * 60 * 60 * 24)),
      statusLabel: "Resmi Sınav Tarihi",
    };
  }

  // 2026 sınavı tamamlandı; bir sonraki döngü 2027 KPSS
  const kpss2027 = KPSS_EXAM_CYCLES[1];
  return {
    cycle: kpss2027,
    isPast: false,
    daysRemaining: undefined,
    statusLabel: "ÖSYM Sınav Takvimi Henüz Açıklanmadı",
  };
}

export const KPSS_TARGET_DATE: number =
  getActiveKpssCycle().cycle.targetDate ?? new Date("2026-09-06T10:15:00").getTime();
