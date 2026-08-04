interface AiMemoryEditorProps {
  t: Record<string, string>;
  userMemory: string;
  memorySavedSuccess: boolean;
  onMemoryChange: (v: string) => void;
  onSaveMemory: () => void;
}

export function AiMemoryEditor({
  t: _t,
  userMemory,
  memorySavedSuccess,
  onMemoryChange,
  onSaveMemory,
}: AiMemoryEditorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "16px",
        paddingTop: "14px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Kişisel AI Hafızası (memory.md)</span>
        </label>
        {memorySavedSuccess && (
          <span
            style={{
              fontSize: "0.75rem",
              background: "rgba(52, 211, 153, 0.15)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              color: "#34d399",
              padding: "3px 10px",
              borderRadius: "12px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ✓ Hafıza Kaydedildi!
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          lineHeight: 1.4,
        }}
      >
        Yapay zeka asistanınızın sizi her sohbet seansında tanıması, kişisel
        tercihlerinizi, mesleğinizi ve hedeflerinizi hatırlaması için bu alana
        özel notlarınızı yazabilirsiniz.
      </span>
      <textarea
        value={userMemory}
        onInput={(e) => onMemoryChange((e.target as HTMLTextAreaElement).value)}
        rows={7}
        style={{
          width: "100%",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          borderRadius: "10px",
          padding: "10px 12px",
          color: "#f1f5f9",
          fontSize: "0.82rem",
          fontFamily: "Fira Code, monospace",
          lineHeight: 1.5,
          outline: "none",
          resize: "vertical",
        }}
        placeholder="# Kişisel Hafıza notlarınızı buraya yazın..."
      />
      <button
        type="button"
        onClick={onSaveMemory}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "9px 18px",
          fontSize: "0.82rem",
          fontWeight: 600,
          borderRadius: "8px",
          color: "#ffffff",
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          width: "100%",
          marginTop: "4px",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        <span>Kişisel Hafızayı Kaydet (memory.md)</span>
      </button>
    </div>
  );
}
