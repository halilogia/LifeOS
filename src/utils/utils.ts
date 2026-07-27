import type { Language } from "@/types/types.js";

export function updateTime(
  clockElement: HTMLDivElement,
  dateElement: HTMLDivElement,
  currentLang: Language,
): void {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  clockElement.textContent = `${hours}:${minutes}`;

  const locale = currentLang === "tr" ? "tr-TR" : "en-US";
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  dateElement.textContent = now.toLocaleDateString(locale, options);
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
