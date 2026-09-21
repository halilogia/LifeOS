import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { SpeedTestResult } from "@/types/network.js";

interface SpeedometerCardProps {
  lang: Language;
  speedTest: SpeedTestResult | null | undefined;
  isTesting: boolean;
  liveGaugeMbps: number;
  progressPercent: number;
  onRunSpeedTest: () => void;
}

export function SpeedometerCard({
  lang,
  speedTest,
  isTesting,
  liveGaugeMbps,
  progressPercent,
  onRunSpeedTest,
}: SpeedometerCardProps) {
  const t = getTranslation(lang);

  const displayMbps = isTesting
    ? liveGaugeMbps
    : (speedTest?.downloadSpeedMbps ?? 0);

  // SVG Gauge calculations (semi-circle / 240 deg arc)
  // Max scale: 200 Mbps (or dynamically up to 1000)
  const maxScale = Math.max(100, Math.ceil(displayMbps / 50) * 50);
  const ratio = Math.min(1, displayMbps / maxScale);

  const peakMbps = isTesting
    ? Math.max(liveGaugeMbps, speedTest?.peakSpeedMbps ?? 0)
    : (speedTest?.peakSpeedMbps ?? 0);

  const totalMb = speedTest?.bytesLoaded
    ? (speedTest.bytesLoaded / (1024 * 1024)).toFixed(1)
    : "0.0";

  return (
    <div className="network-card speed-card">
      <div className="speed-card-header">
        <div>
          <h4 className="speed-card-title">{t.network_speed_gauge_title}</h4>
          <p className="speed-card-subtitle">
            {t.network_speed_gauge_desc || "Real-time download throughput across global edge nodes"}
          </p>
        </div>

        <button
          type="button"
          className="network-btn network-btn-primary"
          disabled={isTesting}
          onClick={onRunSpeedTest}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>{isTesting ? `${t.network_testing_progress} (%${progressPercent})` : t.network_btn_speed_test}</span>
        </button>
      </div>

      <div className="speedometer-container">
        <div className="speedometer-gauge-wrapper">
          <svg className="speedometer-svg" viewBox="0 0 120 120">
            {/* Background Track Arc */}
            <circle
              className="gauge-track"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="var(--card-border, rgba(255, 255, 255, 0.1))"
              strokeWidth="8"
              strokeDasharray="235.6"
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(135 60 60)"
            />
            {/* Value Arc */}
            <circle
              className="gauge-value"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="var(--accent-color, #8b5cf6)"
              strokeWidth="8"
              strokeDasharray="235.6"
              strokeDashoffset={235.6 - ratio * 235.6}
              strokeLinecap="round"
              transform="rotate(135 60 60)"
              style={{
                transition: isTesting ? "stroke-dashoffset 0.15s ease-out" : "stroke-dashoffset 0.8s ease-out",
              }}
            />
          </svg>

          <div className="speedometer-center-content">
            <span className="speedometer-number">{displayMbps}</span>
            <span className="speedometer-unit">Mbps</span>
          </div>
        </div>

        <div className="speed-stats-cards">
          <div className="speed-stat-pill">
            <span className="stat-label">{t.network_speed_gauge_peak}</span>
            <span className="stat-val">{peakMbps} Mbps</span>
          </div>

          <div className="speed-stat-pill">
            <span className="stat-label">{t.network_metric_latency}</span>
            <span className="stat-val">{speedTest?.latencyMs ?? "--"} ms</span>
          </div>

          <div className="speed-stat-pill">
            <span className="stat-label">{t.network_metric_jitter}</span>
            <span className="stat-val">±{speedTest?.jitterMs ?? 0} ms</span>
          </div>

          <div className="speed-stat-pill">
            <span className="stat-label">{t.network_speed_gauge_loaded}</span>
            <span className="stat-val">{totalMb} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
