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

export const KPSS_TARGET_DATE: number = new Date(
  "2026-09-06T10:15:00",
).getTime();
