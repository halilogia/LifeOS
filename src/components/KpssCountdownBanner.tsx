import { Language } from "@/types/types.js";

interface KpssCountdownBannerProps {
  lang: Language;
  t: Record<string, string>;
  kpssTimeLeft: string;
  estimatedTimeLeft: string;
  remainingCount: number;
  examDateLabel?: string;
}

export function KpssCountdownBanner({
  lang,
  t,
  kpssTimeLeft,
  estimatedTimeLeft,
  remainingCount,
  examDateLabel,
}: KpssCountdownBannerProps) {
  return (
    <div className="kpss-countdowns-banner">
      <div className="kpss-countdown-card">
        <span className="kpss-countdown-title">
          {t.kpss_countdown_exam_title}
        </span>
        <span className="kpss-countdown-time">{kpssTimeLeft}</span>
        {examDateLabel ? (
          <span className="kpss-countdown-subtitle">{examDateLabel}</span>
        ) : null}
      </div>
      <div className="kpss-countdown-card">
        <span className="kpss-countdown-title">
          {t.kpss_countdown_study_title}
        </span>
        <span className="kpss-countdown-time">{estimatedTimeLeft}</span>
        <span className="kpss-countdown-subtitle">
          {t.kpss_countdown_remaining.replace(
            "{count}",
            String(remainingCount),
          )}
        </span>
      </div>
    </div>
  );
}
