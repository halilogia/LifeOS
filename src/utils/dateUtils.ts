import { Language } from "@/types/types.js";

/**
 * "YYYY-MM-DD" string'ini yerel tarih formatına çevirir.
 * ListView + CalendarView ortak kullanır.
 */
export function formatDueDate(dateStr: string, lang: Language): string {
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) {
      return dateStr;
    }
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    const locale = lang === "tr" ? "tr-TR" : "en-US";
    return dateObj.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
