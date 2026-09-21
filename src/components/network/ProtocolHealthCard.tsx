import { useState } from "preact/hooks";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { ProtocolHealth } from "@/types/network.js";

interface ProtocolHealthCardProps {
  lang: Language;
  protocolHealth: ProtocolHealth | null;
}

export function ProtocolHealthCard({
  lang,
  protocolHealth,
}: ProtocolHealthCardProps) {
  const t = getTranslation(lang);
  const [guideExpanded, setGuideExpanded] = useState<boolean>(
    protocolHealth?.issueDetected ?? false,
  );

  const ipv4Ms = protocolHealth?.ipv4LatencyMs ?? 0;
  const ipv6Ms = protocolHealth?.ipv6LatencyMs;
  const issueDetected = protocolHealth?.issueDetected ?? false;

  return (
    <div className={`network-card protocol-card ${issueDetected ? "protocol-alert-mode" : ""}`}>
      <div className="protocol-card-header">
        <div className="protocol-card-title-group">
          <div className="protocol-icon-badge">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <div>
            <h4 className="protocol-card-title">{t.network_protocol_title}</h4>
            <p className="protocol-card-subtitle">
              {protocolHealth?.message || t.network_protocol_why_slow}
            </p>
          </div>
        </div>

        <span
          className={`protocol-status-badge ${
            issueDetected ? "badge-danger" : "badge-success"
          }`}
        >
          {issueDetected
            ? (t.network_protocol_badge_anomaly || "IPv6 Routing Anomaly")
            : (t.network_protocol_badge_healthy || "Protocols Healthy")}
        </span>
      </div>

      <div className="protocol-comparison-grid">
        {/* IPv4 Box */}
        <div className="protocol-stat-box ipv4-box">
          <div className="protocol-stat-header">
            <span className="protocol-badge-pill">IPv4 (Standard)</span>
            <span className="protocol-speed-tag tag-fast">Stable</span>
          </div>
          <div className="protocol-stat-body">
            <span className="protocol-latency-number">{ipv4Ms || "--"}</span>
            <span className="protocol-latency-unit">ms</span>
          </div>
          <p className="protocol-stat-desc">
            {t.network_protocol_ipv4_desc || "Direct edge connection responsive without latency."}
          </p>
        </div>

        {/* IPv6 Box */}
        <div className={`protocol-stat-box ipv6-box ${issueDetected ? "box-warning" : ""}`}>
          <div className="protocol-stat-header">
            <span className="protocol-badge-pill">IPv6 / Dual Stack</span>
            <span
              className={`protocol-speed-tag ${
                issueDetected ? "tag-danger" : "tag-ok"
              }`}
            >
              {ipv6Ms === null
                ? "Timeout"
                : issueDetected
                  ? "High Latency"
                  : "Active"}
            </span>
          </div>
          <div className="protocol-stat-body">
            <span
              className={`protocol-latency-number ${
                issueDetected ? "text-danger" : ""
              }`}
            >
              {ipv6Ms === null ? "TIMEOUT" : `${ipv6Ms} ms`}
            </span>
          </div>
          <p className="protocol-stat-desc">
            {protocolHealth?.details ||
              t.network_protocol_ipv6_desc ||
              "Dual-stack routing status to Google, YouTube and CDN services."}
          </p>
        </div>
      </div>

      {issueDetected && (
        <div className="protocol-anomaly-banner">
          <div className="anomaly-banner-content">
            <svg
              className="anomaly-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <h5 className="anomaly-title">{t.network_protocol_why_slow}</h5>
              <p className="anomaly-explanation">
                {t.network_protocol_anomaly_desc ||
                  "Even though IPv6 is enabled by your ISP, packets to Google/YouTube are stalling or dropping. Because browsers prefer IPv6 by default, pages and video players hang for 10-15 seconds."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="protocol-guide-toggle-btn"
            onClick={() => setGuideExpanded(!guideExpanded)}
          >
            <span>{t.network_protocol_fix_guide}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style={{
                transform: guideExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {guideExpanded && (
            <div className="protocol-steps-list">
              <div className="protocol-step-item">
                <span className="step-num">1</span>
                <span>{t.network_protocol_step_1}</span>
              </div>
              <div className="protocol-step-item">
                <span className="step-num">2</span>
                <span>{t.network_protocol_step_2}</span>
              </div>
              <div className="protocol-step-item">
                <span className="step-num">3</span>
                <span>{t.network_protocol_step_3}</span>
              </div>
              <div className="protocol-step-item">
                <span className="step-num">4</span>
                <span>{t.network_protocol_step_4}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
