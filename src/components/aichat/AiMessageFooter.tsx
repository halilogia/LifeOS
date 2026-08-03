import type { WebSearchSource } from "@/services/webSearchAgent.js";
import { IconGlobe, IconCheck, IconCopy } from "./aiChatIcons.js";

interface AiMessageFooterProps {
  t: Record<string, string>;
  time: string;
  hasSources: boolean;
  copied: boolean;
  onCopy: () => void;
}

export function AiMessageFooter({
  t,
  time,
  hasSources,
  copied,
  onCopy,
}: AiMessageFooterProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginTop: "6px",
      }}
    >
      <span className="msg-time">{time}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {hasSources && (
          <span
            style={{
              fontSize: "0.68rem",
              color: "#34d399",
              background: "rgba(16, 185, 129, 0.12)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <IconGlobe />
            {t.aichat_verified_badge}
          </span>
        )}
        <button
          onClick={onCopy}
          title={copied ? t.aichat_copied : t.aichat_copy}
          style={{
            background: "transparent",
            border: "none",
            color: copied ? "#10b981" : "var(--text-secondary)",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.7rem",
            opacity: 0.8,
            transition: "all 0.2s ease",
          }}
        >
          {copied ? <IconCheck /> : <IconCopy />}
          <span style={{ fontSize: "0.68rem" }}>
            {copied ? t.aichat_copied : t.aichat_copy}
          </span>
        </button>
      </div>
    </div>
  );
}
