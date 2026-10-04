/**
 * ActionApprovalCard.tsx
 * Security Boundary UI: Intercepts mutating browser agent actions
 * and requires explicit user confirmation before executing on the DOM.
 */

import type { PendingActionApproval } from "@/sidepanel/ChatMessage.js";

interface ActionApprovalCardProps {
  approval: PendingActionApproval;
  t: Record<string, string>;
  onApprove: () => void;
  onReject: () => void;
}

export function ActionApprovalCard({
  approval,
  t: _t,
  onApprove,
  onReject,
}: ActionApprovalCardProps) {
  if (approval.status === "approved") {
    return (
      <div
        style={{
          marginTop: "10px",
          padding: "10px 12px",
          borderRadius: "8px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8rem",
          color: "#34d399",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Eylem kullanıcı tarafından onaylandı ve uygulandı.</span>
      </div>
    );
  }

  if (approval.status === "rejected") {
    return (
      <div
        style={{
          marginTop: "10px",
          padding: "10px 12px",
          borderRadius: "8px",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8rem",
          color: "#f87171",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span>Eylem kullanıcı tarafından iptal edildi.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: "rgba(15, 23, 42, 0.85)",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#fbbf24",
          fontSize: "0.85rem",
          fontWeight: "600",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Güvenlik Sınırı: Sayfada Eylem İzni İsteniyor</span>
      </div>

      <div style={{ fontSize: "0.78rem", color: "#cbd5e1", lineHeight: "1.4" }}>
        Asistan, açık web sayfasında aşağıdaki eylemleri gerçekleştirmek için onayınızı bekliyor:
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          background: "rgba(0, 0, 0, 0.3)",
          padding: "8px 10px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontFamily: "monospace",
        }}
      >
        {approval.actions.map((act, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "6px",
              color: "#e2e8f0",
            }}
          >
            <span
              style={{
                background:
                  act.actionType === "click"
                    ? "rgba(59, 130, 246, 0.3)"
                    : "rgba(168, 85, 247, 0.3)",
                color: act.actionType === "click" ? "#93c5fd" : "#d8b4fe",
                padding: "1px 5px",
                borderRadius: "4px",
                fontWeight: "700",
                fontSize: "0.7rem",
              }}
            >
              {act.actionType.toUpperCase()}
            </span>
            <span style={{ wordBreak: "break-all" }}>
              {act.actionType === "type"
                ? `"${act.textValue || ""}" ➔ ${act.targetText || act.selector || "Alan"}`
                : `${act.targetText || act.selector || "Öğe"}`}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
        <button
          type="button"
          onClick={onApprove}
          style={{
            flex: "1",
            padding: "6px 12px",
            borderRadius: "6px",
            background: "var(--accent-color, #8b5cf6)",
            border: "none",
            color: "#ffffff",
            fontSize: "0.78rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            transition: "opacity 0.2s ease",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Onayla ve Çalıştır</span>
        </button>

        <button
          type="button"
          onClick={onReject}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#94a3b8",
            fontSize: "0.78rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          İptal Et
        </button>
      </div>
    </div>
  );
}
