/**
 * detoxMotivationalService.ts
 * Calculates dynamic motivational achievements ("Bu Süreyle Ne Yapabilirdin?")
 * based on saved detox minutes.
 */

export interface MotivationalAchievement {
  icon: string;
  text: string;
  color?: string;
}

export function calculateMotivationalAchievements(
  durationMinutes: number,
  lang: string = "tr",
): MotivationalAchievement[] {
  const isTr = lang === "tr";

  if (durationMinutes <= 0) {
    return [
      {
        icon: "👑",
        text: isTr
          ? "Süresiz Odaklanma: Tüm hedeflerini başarmak için önünde sınırsız zaman var!"
          : "Unlimited Focus: Endless time to achieve all your goals!",
        color: "#a855f7",
      },
    ];
  }

  const mins = Math.max(1, Math.round(durationMinutes));
  const achievements: MotivationalAchievement[] = [];

  // 1. KPSS / Sınav Sorusu (Yaklaşık 1 dakikada 1 soru)
  const kpssQuestions = Math.round(mins * 0.9);
  if (kpssQuestions >= 5) {
    achievements.push({
      icon: "✍️",
      text: isTr
        ? `${kpssQuestions} KPSS / Test Sorusu Çözebilirdin`
        : `Solve ${kpssQuestions} Practice Exam Questions`,
      color: "#3b82f6",
    });
  }

  // 2. Kitap Okuma (Yaklaşık 2 dakikada 1 sayfa)
  const bookPages = Math.round(mins * 0.5);
  if (bookPages >= 3) {
    achievements.push({
      icon: "📚",
      text: isTr
        ? `${bookPages} Sayfa Kitap Okuyabilirdin`
        : `Read ${bookPages} Book Pages`,
      color: "#10b981",
    });
  }

  // 3. Pomodoro Odaklanma Seansı (25 dk per Pomodoro)
  const pomodoros = Math.round((mins / 25) * 10) / 10;
  if (pomodoros >= 0.5) {
    achievements.push({
      icon: "🎯",
      text: isTr
        ? `${pomodoros} Odaklanmış Pomodoro Tamamlayabilirdin`
        : `Complete ${pomodoros} Focused Pomodoro Sessions`,
      color: "#f59e0b",
    });
  }

  // 4. Kelime / Kart Ezberi (1 dakikada 1.5 kelime)
  const words = Math.round(mins * 1.5);
  if (words >= 10) {
    achievements.push({
      icon: "🎴",
      text: isTr
        ? `${words} İngilizce / KPSS Kelimesi Ezberleyebilirdin`
        : `Memorize ${words} Vocabulary / Flashcards`,
      color: "#ec4899",
    });
  }

  // 5. Yürüyüş / Spor (1 dakikada 80 metre)
  const distanceKm = Math.round((mins * 0.08) * 10) / 10;
  if (distanceKm >= 0.5) {
    achievements.push({
      icon: "🏃",
      text: isTr
        ? `${distanceKm} km Yürüyüş / Spor Yapabilirdin`
        : `Walk / Exercise ${distanceKm} km`,
      color: "#06b6d4",
    });
  }

  return achievements;
}
