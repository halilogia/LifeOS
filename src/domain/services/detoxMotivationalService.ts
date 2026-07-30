/**
 * detoxMotivationalService.ts
 * Calculates dynamic motivational achievements ("Bu Süreyle Ne Yapabilirdin?")
 * based on saved detox minutes.
 */

import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

export interface MotivationalAchievement {
  icon: string;
  text: string;
  color?: string;
}

export function calculateMotivationalAchievements(
  durationMinutes: number,
  lang: string = "tr",
): MotivationalAchievement[] {
  const t = getTranslation(lang as Language);
  const mins = Math.max(1, Math.round(durationMinutes));
  const achievements: MotivationalAchievement[] = [];

  if (durationMinutes <= 0) {
    return [
      {
        icon: "👑",
        text: t.detox_motiv_unlimited_focus,
        color: "#a855f7",
      },
    ];
  }

  // 1. KPSS / Sınav Sorusu (Yaklaşık 1 dakikada 1 soru)
  const kpssQuestions = Math.round(mins * 0.9);
  if (kpssQuestions >= 5) {
    achievements.push({
      icon: "✍️",
      text: t.detox_motiv_kpss_questions.replace("$count", String(kpssQuestions)),
      color: "#3b82f6",
    });
  }

  // 2. Kitap Okuma (Yaklaşık 2 dakikada 1 sayfa)
  const bookPages = Math.round(mins * 0.5);
  if (bookPages >= 3) {
    achievements.push({
      icon: "📚",
      text: t.detox_motiv_book_pages.replace("$count", String(bookPages)),
      color: "#10b981",
    });
  }

  // 3. Pomodoro Odaklanma Seansı (25 dk per Pomodoro)
  const pomodoros = Math.round((mins / 25) * 10) / 10;
  if (pomodoros >= 0.5) {
    achievements.push({
      icon: "🎯",
      text: t.detox_motiv_pomodoro.replace("$count", String(pomodoros)),
      color: "#f59e0b",
    });
  }

  // 4. Kelime / Kart Ezberi (1 dakikada 1.5 kelime)
  const words = Math.round(mins * 1.5);
  if (words >= 10) {
    achievements.push({
      icon: "🎴",
      text: t.detox_motiv_vocabulary.replace("$count", String(words)),
      color: "#ec4899",
    });
  }

  // 5. Yürüyüş / Spor (1 dakikada 80 metre)
  const distanceKm = Math.round((mins * 0.08) * 10) / 10;
  if (distanceKm >= 0.5) {
    achievements.push({
      icon: "🏃",
      text: t.detox_motiv_exercise.replace("$count", String(distanceKm)),
      color: "#06b6d4",
    });
  }

  return achievements;
}
