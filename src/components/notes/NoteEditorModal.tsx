/**
 * NoteEditorModal.tsx
 * Not, Günlük ve Cornell Notu oluşturma/düzenleme modali.
 */

export type NoteType = "note" | "diary" | "cornell";

interface NoteEditorModalProps {
  isOpen: boolean;
  lang: string;
  noteType: NoteType;
  noteTitle: string;
  noteContent: string;
  noteCues: string;
  noteSummary: string;
  notesPlaceholder: string;
  notesContentPlaceholder: string;
  onClose: () => void;
  onNoteTypeChange: (type: NoteType) => void;
  onNoteTitleChange: (val: string) => void;
  onNoteContentChange: (val: string) => void;
  onNoteCuesChange: (val: string) => void;
  onNoteSummaryChange: (val: string) => void;
  onSave: () => void;
}

export function NoteEditorModal({
  isOpen,
  lang,
  noteType,
  noteTitle,
  noteContent,
  noteCues,
  noteSummary,
  notesPlaceholder,
  notesContentPlaceholder,
  onClose,
  onNoteTypeChange,
  onNoteTitleChange,
  onNoteContentChange,
  onNoteCuesChange,
  onNoteSummaryChange,
  onSave,
}: NoteEditorModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-panel active" onClick={onClose}>
      <div
        className="settings-content note-modal-content"
        style={{ maxWidth: noteType === "cornell" ? "800px" : "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
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
                {lang === "tr" ? "Kayıt Türü:" : "Entry Type:"}
              </label>
              <div
                style={{
                  display: "flex",
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "3px",
                  borderRadius: "10px",
                  border:
                    "1px solid var(--card-border, rgba(255, 255, 255, 0.06))",
                  gap: "4px",
                }}
              >
                {(["note", "diary", "cornell"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onNoteTypeChange(t)}
                    style={{
                      background:
                        noteType === t ? "var(--accent-color)" : "transparent",
                      border: "none",
                      color:
                        noteType === t
                          ? "#fff"
                          : "var(--text-secondary, rgba(255, 255, 255, 0.6))",
                      padding: "5px 12px",
                      borderRadius: "7px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        noteType === t
                          ? "0 4px 10px rgba(139, 92, 246, 0.3)"
                          : "none",
                    }}
                  >
                    {t === "note"
                      ? lang === "tr"
                        ? "Not"
                        : "Note"
                      : t === "diary"
                        ? lang === "tr"
                          ? "Günlük"
                          : "Diary"
                        : lang === "tr"
                          ? "Ders Notu"
                          : "Cornell Note"}
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
            onInput={(e) =>
              onNoteTitleChange((e.target as HTMLInputElement).value)
            }
            placeholder={
              noteType === "diary"
                ? lang === "tr"
                  ? "Bugün nasıl hissediyorsun? veya Başlık..."
                  : "How do you feel today? or Title..."
                : notesPlaceholder
            }
          />
        </header>

        <div className="note-editor-body" style={{ padding: "0 10px" }}>
          {noteType === "cornell" ? (
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    {lang === "tr"
                      ? "Anahtar Kelimeler / Sorular (Cues):"
                      : "Keywords / Questions (Cues):"}
                  </label>
                  <textarea
                    value={noteCues}
                    onInput={(e) =>
                      onNoteCuesChange((e.target as HTMLTextAreaElement).value)
                    }
                    placeholder={
                      lang === "tr"
                        ? "Temel fikirler, anahtar kelimeler veya olası sınav sorularını buraya yazın..."
                        : "Write core ideas, keywords, or potential exam questions here..."
                    }
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    {lang === "tr"
                      ? "Not Alma Alanı (Notes):"
                      : "Note-taking Column (Notes):"}
                  </label>
                  <textarea
                    value={noteContent}
                    onInput={(e) =>
                      onNoteContentChange(
                        (e.target as HTMLTextAreaElement).value,
                      )
                    }
                    placeholder={
                      lang === "tr"
                        ? "Ders esnasındaki ayrıntılı notlarınızı, formülleri ve açıklamaları buraya yazın..."
                        : "Write detailed lecture notes, formulas, and explanations here..."
                    }
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {lang === "tr" ? "Özet (Summary):" : "Summary:"}
                </label>
                <textarea
                  value={noteSummary}
                  onInput={(e) =>
                    onNoteSummaryChange((e.target as HTMLTextAreaElement).value)
                  }
                  placeholder={
                    lang === "tr"
                      ? "Bu çalışma sayfasındaki bilgilerin kısa ve net bir özetini buraya yazın..."
                      : "Write a brief and clear summary of the page details here..."
                  }
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
          ) : (
            <textarea
              id="note-content-input"
              className="note-content-input"
              value={noteContent}
              onInput={(e) =>
                onNoteContentChange((e.target as HTMLTextAreaElement).value)
              }
              placeholder={
                noteType === "diary"
                  ? lang === "tr"
                    ? "Sevgili günlük, bugün..."
                    : "Dear diary, today..."
                  : notesContentPlaceholder
              }
            />
          )}
        </div>

        <div className="settings-footer">
          <button
            id="save-note-btn"
            className="settings-add-btn"
            style={{ width: "auto", padding: "0 20px" }}
            onClick={onSave}
          >
            {lang === "tr" ? "Kaydet" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
