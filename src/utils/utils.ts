import { Language } from "../types/types.js";
import { translations } from "./i18n.js";

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

import { storage } from "../core/storage.js";

export async function setRandomQuote(
  quoteElement: HTMLParagraphElement,
  currentLang: Language,
): Promise<void> {
  const customQuotes = await storage.getCustomQuotes();
  const defaultQuoteCount = 7;
  
  const poolSize = defaultQuoteCount + customQuotes.length;
  const randomIndex = Math.floor(Math.random() * poolSize);

  if (randomIndex < defaultQuoteCount) {
    const quoteKeys = [
      "quote_1",
      "quote_2",
      "quote_3",
      "quote_4",
      "quote_5",
      "quote_6",
      "quote_7",
    ];
    const randomKey = quoteKeys[randomIndex] as keyof (typeof translations)["tr"];
    quoteElement.textContent = translations[currentLang][randomKey];
  } else {
    const custom = customQuotes[randomIndex - defaultQuoteCount];
    quoteElement.textContent = custom.author 
      ? `"${custom.text}" - ${custom.author}` 
      : `"${custom.text}"`;
  }
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
