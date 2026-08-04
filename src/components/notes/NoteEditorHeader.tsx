import type { NoteType } from "@/components/notes/NoteEditorModal.js";

interface NoteEditorHeaderProps {
  t: Record<string, string>;
  noteType: NoteType;
  noteTitle: string;
  notesPlaceholder: string;
  onTypeChange: (type: NoteType) => void;
  onTitleChange: (val: string) => void;
  onClose: () => void;
}

export function NoteEditorHeader({
  t,
  noteType,
  noteTitle,
  notesPlaceholder,
  onTypeChange,
  onTitleChange,
  onClose,
}: NoteEditorHeaderProps) {
  return (
    <header
      className="settings-header"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label
            style={{
              fontSize: "0.82rem",
              opacity: 0.8,
              fontWeight: 600,
            }}
          >
            {t.notes_editor_title_label}
          </label>
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid var(--card-border, rgba(255, 255, 255, 0.06))",
              gap: "4px",
            }}
          >
            {(["note", "diary", "cornell"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onTypeChange(type)}
                style={{
                  background:
                    noteType === type ? "var(--accent-color)" : "transparent",
                  color:
                    noteType === type
                      ? "#fff"
                      : "var(--text-secondary, #94a3b8)",
                  border: "none",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow:
                    noteType === type
                      ? "0 4px 10px rgba(139, 92, 246, 0.3)"
                      : "none",
                }}
              >
                {type === "note"
                  ? t.notes_editor_type_note
                  : type === "diary"
                    ? t.notes_editor_type_diary
                    : t.notes_editor_type_cornell}
              </button>
            ))}
          </div>
        </div>
        <button
          className="close-btn"
          onClick={onClose}
          style={{ margin: 0, padding: "0 6px", fontSize: "1.5rem" }}
        >
          &times;
        </button>
      </div>
      <input
        type="text"
        id="note-title-input"
        className="note-title-input"
        value={noteTitle}
        onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
        placeholder={
          noteType === "diary"
            ? t.notes_editor_diary_placeholder
            : notesPlaceholder
        }
      />
    </header>
  );
}
