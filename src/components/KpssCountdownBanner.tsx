import { Language } from "@/types/types.js";

interface KpssCountdownBannerProps {
  lang: Language;
  kpssTimeLeft: string;
  estimatedTimeLeft: string;
  remainingCount: number;
}

export function KpssCountdownBanner({
  lang,
  kpssTimeLeft,
  estimatedTimeLeft,
  remainingCount,
}: KpssCountdownBannerProps) {
  return (
    <div className="kpss-countdowns-banner">
      <div className="kpss-countdown-card">
        <span className="kpss-countdown-title">
          {lang === "tr"
            ? "KPSS Lisans Sınavına Kalan Süre"
            : "Time to KPSS Exam"}
        </span>
        <span className="kpss-countdown-time">{kpssTimeLeft}</span>
        <span className="kpss-countdown-subtitle">6 Eylül 2026 - 10:15</span>
      </div>
      <div className="kpss-countdown-card">
        <span className="kpss-countdown-title">
          {lang === "tr"
            ? "Tahmini Konuların Bitme Süresi"
            : "Estimated Study Completion Time"}
        </span>
        <span className="kpss-countdown-time">{estimatedTimeLeft}</span>
        <span className="kpss-countdown-subtitle">
          {lang === "tr"
            ? `${remainingCount} Konu Kaldı · Ortalama 2 gün/konu`
            : `${remainingCount} Topics Left · Average 2 days/topic`}
        </span>
      </div>
    </div>
  );
}
