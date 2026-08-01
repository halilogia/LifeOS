/**
 * detoxMotivationalService.ts
 * Calculates dynamic motivational achievements ("Bu Süreyle Ne Yapabilirdin?")
 * based on saved detox minutes.
 *
 * Domain layer — pure function, no external dependencies.
 * Returns raw data without translations. Caller handles formatting.
 */

export type AchievementType =
  | "kpss_questions"
  | "book_pages"
  | "pomodoro"
  | "vocabulary"
  | "exercise"
  | "unlimited_focus";

export interface MotivationalAchievement {
  icon: string;
  type: AchievementType;
  /** Calculated count (questions, pages, etc.) */
  count: number;
  color?: string;
}

/**
 * Calculates motivational achievements based on detox duration.
 * Pure function — no external dependencies.
 * Returns raw achievement data; formatting is left to the presentation layer.
 */
export function calculateMotivationalAchievements(
  durationMinutes: number,
): MotivationalAchievement[] {
  const mins = Math.max(1, Math.round(durationMinutes));
  const achievements: MotivationalAchievement[] = [];

  if (durationMinutes <= 0) {
    return [
      {
        icon: "👑",
        type: "unlimited_focus",
        count: 0,
        color: "#a855f7",
      },
    ];
  }

  // 1. KPSS / Sınav Sorusu (Yaklaşık 1 dakikada 1 soru)
  const kpssQuestions = Math.round(mins * 0.9);
  if (kpssQuestions >= 5) {
    achievements.push({
      icon: "✍️",
      type: "kpss_questions",
      count: kpssQuestions,
      color: "#3b82f6",
    });
  }

  // 2. Kitap Okuma (Yaklaşık 2 dakikada 1 sayfa)
  const bookPages = Math.round(mins * 0.5);
  if (bookPages >= 3) {
    achievements.push({
      icon: "📚",
      type: "book_pages",
      count: bookPages,
      color: "#10b981",
    });
  }

  // 3. Pomodoro Odaklanma Seansı (25 dk per Pomodoro)
  const pomodoros = Math.round((mins / 25) * 10) / 10;
  if (pomodoros >= 0.5) {
    achievements.push({
      icon: "🎯",
      type: "pomodoro",
      count: pomodoros,
      color: "#f59e0b",
    });
  }

  // 4. Kelime / Kart Ezberi (1 dakikada 1.5 kelime)
  const words = Math.round(mins * 1.5);
  if (words >= 10) {
    achievements.push({
      icon: "🎴",
      type: "vocabulary",
      count: words,
      color: "#ec4899",
    });
  }

  // 5. Yürüyüş / Spor (1 dakikada 80 metre)
  const distanceKm = Math.round(mins * 0.08 * 10) / 10;
  if (distanceKm >= 0.5) {
    achievements.push({
      icon: "🏃",
      type: "exercise",
      count: distanceKm,
      color: "#06b6d4",
    });
  }

  return achievements;
}
