import { useState } from "preact/hooks";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { PingResult, PingTarget } from "@/types/network.js";
import {
  DEFAULT_PING_TARGETS,
  networkDiagnosticService,
} from "@/services/networkDiagnosticService.js";

interface ServiceRadarGridProps {
  lang: Language;
  pingResults: PingResult[];
}

export function ServiceRadarGrid({
  lang,
  pingResults,
}: ServiceRadarGridProps) {
  const t = getTranslation(lang);
  const [singleTesting, setSingleTesting] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<string, PingResult>>({});

  const handleTestTarget = async (target: PingTarget) => {
    setSingleTesting(target.id);
    try {
      const res = await networkDiagnosticService.pingTarget(target, 2);
      setLocalOverrides((prev) => ({ ...prev, [target.id]: res }));
    } finally {
      setSingleTesting(null);
    }
  };

  const getStatusColor = (status: PingResult["status"]) => {
    switch (status) {
      case "fast":
        return "var(--success, #10b981)";
      case "moderate":
        return "var(--warning, #f59e0b)";
      case "slow":
        return "var(--danger, #ef4444)";
      case "offline":
      default:
        return "var(--text-muted, #64748b)";
    }
  };

  const getStatusLabel = (status: PingResult["status"]) => {
    switch (status) {
      case "fast":
        return t.network_status_fast || "Fast";
      case "moderate":
        return t.network_status_moderate || "Moderate";
      case "slow":
        return t.network_status_slow || "Slow";
      case "offline":
      default:
        return t.network_status_offline || "Offline";
    }
  };

  return (
    <div className="network-card radar-card">
      <div className="radar-card-header">
        <div>
          <h4 className="radar-card-title">{t.network_services_title}</h4>
          <p className="radar-card-subtitle">{t.network_services_desc}</p>
        </div>
      </div>

      <div className="radar-services-grid">
        {DEFAULT_PING_TARGETS.map((target) => {
          const result =
            localOverrides[target.id] ||
            pingResults.find((p) => p.targetId === target.id);
          const isTargetTesting = singleTesting === target.id;
          const status = result?.status || "fast";
          const statusColor = getStatusColor(status);
          const latencyMs = result?.latencyMs ?? "--";
          const jitterMs = result?.jitterMs ?? 0;

          return (
            <div key={target.id} className="radar-item-card">
              <div className="radar-item-top">
                <div className="radar-item-info">
                  <span
                    className="radar-status-dot"
                    style={{ backgroundColor: statusColor }}
                  />
                  <h5 className="radar-item-name">{target.name}</h5>
                </div>
                <span className="radar-item-category">{target.category.toUpperCase()}</span>
              </div>

              <div className="radar-item-metrics">
                <div className="radar-item-latency">
                  <span className="radar-latency-number">
                    {isTargetTesting ? "..." : latencyMs}
                  </span>
                  <span className="radar-latency-unit">ms</span>
                </div>
                <div className="radar-item-status-pill">
                  <span>{getStatusLabel(status)}</span>
                  {jitterMs > 0 && !isTargetTesting && (
                    <span className="radar-jitter-tag">±{jitterMs}ms</span>
                  )}
                </div>
              </div>

              <div className="radar-item-footer">
                <span className="radar-item-desc">{target.description}</span>
                <button
                  type="button"
                  className="radar-ping-btn"
                  disabled={isTargetTesting}
                  onClick={() => handleTestTarget(target)}
                  title="Yeniden Test Et"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
