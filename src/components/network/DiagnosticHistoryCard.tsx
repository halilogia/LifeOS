import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { NetworkDiagnosticsReport } from "@/types/network.js";

interface DiagnosticHistoryCardProps {
  lang: Language;
  history: NetworkDiagnosticsReport[];
  lastCopied: boolean;
  onCopyReport: (report?: NetworkDiagnosticsReport) => void;
  onClearHistory: () => void;
}

export function DiagnosticHistoryCard({
  lang,
  history,
  lastCopied,
  onCopyReport,
  onClearHistory,
}: DiagnosticHistoryCardProps) {
  const t = getTranslation(lang);

  return (
    <div className="network-card history-card">
      <div className="history-card-header">
        <div>
          <h4 className="history-card-title">{t.network_tab_history}</h4>
          <p className="history-card-subtitle">
            {t.network_history_desc || "Locally saved diagnostic sessions on your device"}
          </p>
        </div>

        <div className="history-actions">
          <button
            type="button"
            className="network-btn network-btn-secondary"
            onClick={() => onCopyReport()}
            disabled={history.length === 0}
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>{lastCopied ? t.network_btn_copied : t.network_btn_copy_report}</span>
          </button>

          {history.length > 0 && (
            <button
              type="button"
              className="network-btn network-btn-danger-outline"
              onClick={onClearHistory}
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
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>{t.network_btn_clear_history}</span>
            </button>
          )}
        </div>
      </div>

      <div className="history-list-container">
        {history.length === 0 ? (
          <div className="history-empty-state">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted, #64748b)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
            <span>{t.network_history_empty}</span>
          </div>
        ) : (
          <div className="history-items-list">
            {history.map((rep) => {
              const dateStr = new Date(rep.timestamp).toLocaleString();
              const avgPing = rep.pingResults.length
                ? Math.round(
                    rep.pingResults.reduce((sum, p) => sum + p.latencyMs, 0) /
                      rep.pingResults.length,
                  )
                : "--";
              const speedStr = rep.speedTest
                ? `${rep.speedTest.downloadSpeedMbps} Mbps`
                : "--";

              return (
                <div key={rep.id} className="history-row-item">
                  <div className="history-row-main">
                    <span
                      className={`history-status-pill pill-${rep.overallHealth}`}
                    >
                      {rep.overallHealth.toUpperCase()}
                    </span>
                    <span className="history-date">{dateStr}</span>
                  </div>

                  <div className="history-metrics-summary">
                    <span className="history-metric">
                      <strong>Ping:</strong> {avgPing} ms
                    </span>
                    <span className="history-metric">
                      <strong>{t.network_metric_speed || "Speed"}:</strong> {speedStr}
                    </span>
                    <span className="history-metric">
                      <strong>IPv6:</strong>{" "}
                      <span
                        className={
                          rep.protocolHealth.issueDetected
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {rep.protocolHealth.issueDetected ? "Anomaly" : "Stable"}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="history-copy-btn"
                    onClick={() => onCopyReport(rep)}
                    title="Bu Raporu Kopyala"
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
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
