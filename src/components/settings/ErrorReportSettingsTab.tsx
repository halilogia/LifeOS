import { useEffect, useState } from "preact/hooks";
import {
  getLogEntries,
  clearLogs,
  downloadLogsMd,
} from "@/services/errorReportService.js";
import type { LogEntry } from "@/utils/logger.js";

interface ErrorReportSettingsTabProps {
  t: Record<string, string>;
  onNotify: (message: string) => void;
}

export function ErrorReportSettingsTab({
  t,
  onNotify,
}: ErrorReportSettingsTabProps) {
  const [logCount, setLogCount] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLogEntries().then((entries: LogEntry[]) => {
      if (!cancelled) {
        setLogCount(entries.length);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadLogsMd();
    } catch (err) {
      console.error("[ErrorReport] Download failed:", err);
      onNotify(String(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      await clearLogs();
      setLogCount(0);
      onNotify(t.settings_error_reporting_cleared);
    } catch (err) {
      console.error("[ErrorReport] Clear failed:", err);
      onNotify(String(err));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="settings-group">
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
            opacity: 0.8,
          }}
        >
          {t.settings_error_reporting_title}
        </h3>
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {t.settings_error_reporting_desc}
        </p>
        <div className="settings-actions">
          {/* Log Counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--card-border)",
              borderRadius: "10px",
            }}
          >
            <span
              style={{ fontSize: "0.85rem", fontWeight: "600", color: "white" }}
            >
              {t.settings_error_reporting_title}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color:
                  logCount > 0
                    ? "var(--accent-color)"
                    : "var(--text-secondary)",
              }}
            >
              {logCount > 0
                ? t.settings_error_reporting_count.replace(
                    "{count}",
                    String(logCount),
                  )
                : t.settings_error_reporting_empty}
            </span>
          </div>

          {/* Download Logs */}
          <button
            className="settings-action-btn"
            onClick={handleDownload}
            disabled={downloading || logCount === 0}
            style={{
              opacity: downloading || logCount === 0 ? 0.5 : 1,
              cursor: downloading || logCount === 0 ? "not-allowed" : "pointer",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>
              {downloading ? "..." : t.settings_error_reporting_download}
            </span>
          </button>

          {/* Clear Logs */}
          <button
            className="settings-action-btn"
            onClick={handleClear}
            disabled={clearing || logCount === 0}
            style={{
              opacity: clearing || logCount === 0 ? 0.5 : 1,
              cursor: clearing || logCount === 0 ? "not-allowed" : "pointer",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>{clearing ? "..." : t.settings_error_reporting_clear}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
