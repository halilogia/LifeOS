import type { NoteType } from "@/components/notes/NoteEditorModal.js";

interface NoteEditorBodyProps {
  t: Record<string, string>;
  noteType: NoteType;
  noteContent: string;
  noteCues: string;
  noteSummary: string;
  notesContentPlaceholder: string;
  onContentInput: (val: string) => void;
  onCuesChange: (val: string) => void;
  onSummaryChange: (val: string) => void;
}

export function NoteEditorBody({
  t,
  noteType,
  noteContent,
  noteCues,
  noteSummary,
  notesContentPlaceholder,
  onContentInput,
  onCuesChange,
  onSummaryChange,
}: NoteEditorBodyProps) {
  if (noteType === "cornell") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "10px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              {t.notes_editor_cues_label}
            </label>
            <textarea
              value={noteCues}
              onInput={(e) =>
                onCuesChange((e.target as HTMLTextAreaElement).value)
              }
              placeholder={t.notes_editor_cues_placeholder}
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--card-border)",
                borderRadius: "10px",
                padding: "12px",
                color: "var(--text-primary, #f1f5f9)",
                fontSize: "0.85rem",
                height: "220px",
                resize: "none",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              {t.notes_editor_notes_label}
            </label>
            <textarea
              value={noteContent}
              onInput={(e) =>
                onContentInput((e.target as HTMLTextAreaElement).value)
              }
              placeholder={t.notes_editor_notes_placeholder}
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--card-border)",
                borderRadius: "10px",
                padding: "12px",
                color: "var(--text-primary, #f1f5f9)",
                fontSize: "0.85rem",
                height: "220px",
                resize: "none",
                outline: "none",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            {t.notes_editor_summary_label}
          </label>
          <textarea
            value={noteSummary}
            onInput={(e) =>
              onSummaryChange((e.target as HTMLTextAreaElement).value)
            }
            placeholder={t.notes_editor_summary_placeholder}
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid var(--card-border)",
              borderRadius: "10px",
              padding: "12px",
              color: "var(--text-primary, #f1f5f9)",
              fontSize: "0.85rem",
              height: "70px",
              resize: "none",
              outline: "none",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <textarea
      id="note-content-input"
      className="note-content-input"
      value={noteContent}
      onInput={(e) => onContentInput((e.target as HTMLTextAreaElement).value)}
      placeholder={
        noteType === "diary"
          ? t.notes_editor_diary_content_placeholder
          : notesContentPlaceholder
      }
    />
  );
}
