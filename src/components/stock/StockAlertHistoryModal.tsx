/**
 * StockAlertHistoryModal.tsx
 * Tetiklenen alarmların geçmiş kaydı modali.
 */

import type { StockAlertLog } from "@/types/stock.js";

interface StockAlertHistoryModalProps {
  logs: StockAlertLog[];
  onClearLogs: () => void;
  onClose: () => void;
}

function IconX() {
  return (
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconTrash() {
  return (
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
  );
}

export function StockAlertHistoryModal({
  logs,
  onClearLogs,
  onClose,
}: StockAlertHistoryModalProps) {
  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div
        className="stock-modal-content"
        style={{ maxWidth: "560px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stock-modal-header">
          <div className="stock-modal-title">Bildirim & Alarm Geçmişi</div>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            <IconX />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "360px",
            overflowY: "auto",
          }}
        >
          {logs.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}
            >
              Henüz tetiklenen bir borsa alarmı bulunmuyor.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#f8fafc" }}>
                    {log.symbol}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {new Date(log.timestamp).toLocaleString("tr-TR")}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#e2e8f0" }}>
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          {logs.length > 0 && (
            <button
              className="stock-btn stock-btn-secondary"
              onClick={onClearLogs}
              style={{ color: "#f87171" }}
            >
              <IconTrash />
              <span>Geçmişi Temizle</span>
            </button>
          )}
          <button
            className="stock-btn stock-btn-primary"
            onClick={onClose}
            style={{ marginLeft: "auto" }}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
