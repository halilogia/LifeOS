import { IconInfoCircle } from "./aiChatIcons.js";

interface AiThinkingCardProps {
  t: Record<string, string>;
  thinking: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function AiThinkingCard({
  t,
  thinking,
  isOpen,
  onToggle,
}: AiThinkingCardProps) {
  return (
    <div
      style={{
        marginBottom: "8px",
        fontSize: "0.78rem",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontWeight: 600,
          color: "var(--text-secondary)",
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <IconInfoCircle />
          {t.aichat_thinking_process}
        </span>
        <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </div>
      {isOpen && (
        <div
          style={{
            marginTop: "6px",
            lineHeight: 1.4,
            color: "var(--text-muted, rgba(255, 255, 255, 0.6))",
            whiteSpace: "pre-wrap",
            borderTop: "1px solid var(--card-border)",
            paddingTop: "6px",
            fontStyle: "italic",
          }}
        >
          {thinking}
        </div>
      )}
    </div>
  );
}
