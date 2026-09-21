import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type {
  NetworkDiagnosticsReport,
  OverallHealth,
} from "@/types/network.js";

interface NetworkOverviewCardProps {
  lang: Language;
  report: NetworkDiagnosticsReport | null;
  isTesting: boolean;
  currentPhase: string;
  progressPercent: number;
  onRunFullTest: () => void;
  onRunQuickPing: () => void;
  onRunSpeedTest: () => void;
}

export function NetworkOverviewCard({
  lang,
  report,
  isTesting,
  currentPhase,
  progressPercent,
  onRunFullTest,
  onRunQuickPing,
  onRunSpeedTest,
}: NetworkOverviewCardProps) {
  const t = getTranslation(lang);

  const getHealthBadge = (health: OverallHealth = "good") => {
    switch (health) {
      case "excellent":
        return {
          text: t.network_health_excellent || "Excellent",
          className: "health-badge-excellent",
          color: "var(--success, #10b981)",
        };
      case "good":
        return {
          text: t.network_health_good || "Good / Stable",
          className: "health-badge-good",
          color: "var(--info, #3b82f6)",
        };
      case "fair":
        return {
          text: t.network_health_fair || "Fair / Jittery",
          className: "health-badge-fair",
          color: "var(--warning, #f59e0b)",
        };
      case "poor":
        return {
          text: t.network_health_poor || "Issues Detected",
          className: "health-badge-poor",
          color: "var(--danger, #ef4444)",
        };
      case "offline":
      default:
        return {
          text: t.network_health_offline || "Offline",
          className: "health-badge-offline",
          color: "var(--text-muted, #64748b)",
        };
    }
  };

  const currentHealth = report?.overallHealth || "good";
  const badge = getHealthBadge(currentHealth);

  const avgPing = report?.pingResults?.length
    ? Math.round(
        report.pingResults.reduce((acc, p) => acc + p.latencyMs, 0) /
          report.pingResults.length,
      )
    : "--";

  const avgJitter = report?.pingResults?.length
    ? Math.round(
        report.pingResults.reduce((acc, p) => acc + p.jitterMs, 0) /
          report.pingResults.length,
      )
    : "--";

  const downloadSpeed =
    report?.speedTest?.downloadSpeedMbps !== undefined
      ? `${report.speedTest.downloadSpeedMbps} Mbps`
      : (t.network_speed_not_tested || "Not Tested");

  const connectionType =
    report?.connectionInfo?.effectiveType?.toUpperCase() || "WI-FI / LAN";

  return (
    <div className="network-card network-hero-card">
      <div className="network-hero-top">
        <div className="network-hero-info">
          <div className="network-hero-status-row">
            <span
              className="network-status-indicator-dot"
              style={{ backgroundColor: badge.color }}
            />
            <span className={`network-health-badge ${badge.className}`}>
              {badge.text}
            </span>
            <span className="network-hero-connection-tag">
              {connectionType}
            </span>
          </div>
          <h3 className="network-hero-title">
            {report?.protocolHealth?.issueDetected
              ? report.protocolHealth.message
              : (t.network_subtitle || "Network Diagnostics Hub")}
          </h3>
        </div>

        <div className="network-hero-actions">
          <button
            type="button"
            className="network-btn network-btn-primary"
            disabled={isTesting}
            onClick={onRunFullTest}
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
            <span>{isTesting ? t.network_testing_progress : t.network_btn_full_test}</span>
          </button>

          <button
            type="button"
            className="network-btn network-btn-secondary"
            disabled={isTesting}
            onClick={onRunQuickPing}
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
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
            <span>{t.network_btn_quick_ping}</span>
          </button>

          <button
            type="button"
            className="network-btn network-btn-secondary"
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{t.network_btn_speed_test}</span>
          </button>
        </div>
      </div>

      {isTesting && (
        <div className="network-progress-bar-container">
          <div className="network-progress-info">
            <span className="network-progress-phase">
              {currentPhase === "services" && "Measuring service latency..."}
              {currentPhase === "protocol" && "Analyzing protocol anomalies..."}
              {currentPhase === "dns" && "Testing DoH DNS queries..."}
              {currentPhase === "speed" && "Measuring throughput speed..."}
              {currentPhase === "complete" && "Diagnostics completed!"}
            </span>
            <span className="network-progress-percentage">%{progressPercent}</span>
          </div>
          <div className="network-progress-track">
            <div
              className="network-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="network-metrics-grid">
        <div className="network-metric-box">
          <span className="network-metric-label">{t.network_metric_latency}</span>
          <span className="network-metric-val">
            {avgPing} <span className="network-metric-unit">ms</span>
          </span>
        </div>

        <div className="network-metric-box">
          <span className="network-metric-label">{t.network_metric_jitter}</span>
          <span className="network-metric-val">
            ±{avgJitter} <span className="network-metric-unit">ms</span>
          </span>
        </div>

        <div className="network-metric-box">
          <span className="network-metric-label">{t.network_metric_speed}</span>
          <span className="network-metric-val network-highlight-accent">
            {downloadSpeed}
          </span>
        </div>

        <div className="network-metric-box">
          <span className="network-metric-label">{t.network_protocol_title}</span>
          <span
            className={`network-metric-val ${
              report?.protocolHealth?.issueDetected
                ? "network-val-danger"
                : "network-val-success"
            }`}
          >
            {report?.protocolHealth?.issueDetected
              ? (t.network_protocol_badge_anomaly || "Anomaly Detected")
              : (t.network_protocol_badge_healthy || "Healthy")}
          </span>
        </div>
      </div>
    </div>
  );
}
