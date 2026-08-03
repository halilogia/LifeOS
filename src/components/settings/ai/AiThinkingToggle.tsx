interface AiThinkingToggleProps {
  t: Record<string, string>;
  aiShowThinking: boolean;
  onToggle: () => void;
}

export function AiThinkingToggle({
  t,
  aiShowThinking,
  onToggle,
}: AiThinkingToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "8px",
        paddingTop: "8px",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <label
        style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          fontWeight: 500,
        }}
      >
        {t.settings_ai_show_thinking}
      </label>
      <button
        type="button"
        onClick={onToggle}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
          color: aiShowThinking
            ? "var(--accent-color)"
            : "var(--text-secondary)",
          fontSize: "0.85rem",
          padding: "4px 8px",
        }}
      >
        {aiShowThinking ? t.enabled : t.disabled}
      </button>
    </div>
  );
}
