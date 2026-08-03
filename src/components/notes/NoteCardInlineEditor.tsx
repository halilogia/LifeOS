import type { NoteType } from "@/components/notes/NoteEditorModal.js";

interface NoteCardInlineEditorProps {
  t: Record<string, string>;
  type: NoteType;
  inlineTitle: string;
  inlineContent: string;
  inlineCues: string;
  inlineSummary: string;
  onTitleChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onCuesChange: (val: string) => void;
  onSummaryChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function NoteCardInlineEditor({
  t,
  type,
  inlineTitle,
  inlineContent,
  inlineCues,
  inlineSummary,
  onTitleChange,
  onContentChange,
  onCuesChange,
  onSummaryChange,
  onSave,
  onCancel,
}: NoteCardInlineEditorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        value={inlineTitle}
        onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
        style={{
          width: "100%",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--card-border)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "0.85rem",
          fontWeight: "bold",
          outline: "none",
        }}
        placeholder={t.notes_card_title_placeholder}
      />

      {type === "cornell" ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <textarea
              value={inlineCues}
              onInput={(e) =>
                onCuesChange((e.target as HTMLTextAreaElement).value)
              }
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--card-border)",
                color: "#fff",
                padding: "8px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                height: "100px",
                resize: "none",
                outline: "none",
              }}
              placeholder={t.notes_card_cues_placeholder}
            />
            <textarea
              value={inlineContent}
              onInput={(e) =>
                onContentChange((e.target as HTMLTextAreaElement).value)
              }
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--card-border)",
                color: "#fff",
                padding: "8px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                height: "100px",
                resize: "none",
                outline: "none",
              }}
              placeholder={t.notes_card_content_notes_placeholder}
            />
          </div>
          <textarea
            value={inlineSummary}
            onInput={(e) =>
              onSummaryChange((e.target as HTMLTextAreaElement).value)
            }
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid var(--card-border)",
              color: "#fff",
              padding: "8px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              height: "60px",
              resize: "none",
              outline: "none",
            }}
            placeholder={t.notes_card_summary_placeholder}
          />
        </>
      ) : (
        <textarea
          value={inlineContent}
          onInput={(e) =>
            onContentChange((e.target as HTMLTextAreaElement).value)
          }
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--card-border)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.82rem",
            height: "120px",
            resize: "none",
            outline: "none",
          }}
          placeholder={t.notes_card_content_placeholder}
        />
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          marginTop: "4px",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--card-border)",
            color: "var(--text-secondary)",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.72rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {t.notes_card_cancel}
        </button>
        <button
          type="button"
          onClick={onSave}
          style={{
            background: "var(--accent-color)",
            border: "none",
            color: "white",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.72rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {t.notes_card_save}
        </button>
      </div>
    </div>
  );
}
