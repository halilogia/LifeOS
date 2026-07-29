import { useState } from "preact/hooks";
import { Note } from "@/types/types.js";
import { extractInternalLinks } from "@/services/zettelkastenEngine.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

export type NoteType = "note" | "diary" | "cornell";

interface NoteEditorModalProps {
  isOpen: boolean;
  lang: Language;
  noteType: NoteType;
  noteTitle: string;
  noteContent: string;
  noteCues: string;
  noteSummary: string;
  notesPlaceholder: string;
  notesContentPlaceholder: string;
  availableNotes?: Note[];
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
  availableNotes,
  onClose,
  onNoteTypeChange,
  onNoteTitleChange,
  onNoteContentChange,
  onNoteCuesChange,
  onNoteSummaryChange,
  onSave,
}: NoteEditorModalProps) {
  const [showLinkSuggestions, setShowLinkSuggestions] = useState(false);
  const [linkQuery, setLinkQuery] = useState("");

  const t = getTranslation(lang);
  if (!isOpen) {
    return null;
  }

  const backlinks =
    availableNotes && noteTitle.trim()
      ? availableNotes.filter((n) => {
          if (n.title.toLowerCase().trim() === noteTitle.toLowerCase().trim())
            return false;
          const links = extractInternalLinks(n.content || "");
          return links.some(
            (l) => l.toLowerCase().trim() === noteTitle.toLowerCase().trim(),
          );
        })
      : [];

  const filteredSuggestions = availableNotes
    ? availableNotes.filter((n) =>
        n.title.toLowerCase().includes(linkQuery.toLowerCase().trim()),
      )
    : [];

  const handleContentInput = (val: string) => {
    onNoteContentChange(val);
    const lastDoubleBracket = val.lastIndexOf("[[");
    if (lastDoubleBracket !== -1 && val.indexOf("]]", lastDoubleBracket) === -1) {
      const q = val.slice(lastDoubleBracket + 2);
      setLinkQuery(q);
      setShowLinkSuggestions(true);
    } else {
      setShowLinkSuggestions(false);
    }
  };

  const insertLink = (title: string) => {
    const lastDoubleBracket = noteContent.lastIndexOf("[[");
    if (lastDoubleBracket !== -1) {
      const newContent =
        noteContent.slice(0, lastDoubleBracket) + `[[${title}]] `;
      onNoteContentChange(newContent);
    }
    setShowLinkSuggestions(false);
  };

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
                {t.notes_editor_title_label}
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
                {(["note", "diary", "cornell"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onNoteTypeChange(type)}
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
            onInput={(e) =>
              onNoteTitleChange((e.target as HTMLInputElement).value)
            }
            placeholder={
              noteType === "diary"
                ? t.notes_editor_diary_placeholder
                : notesPlaceholder
            }
          />
        </header>

        <div className="note-editor-body" style={{ padding: "0 10px", position: "relative" }}>
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
                    {t.notes_editor_cues_label}
                  </label>
                  <textarea
                    value={noteCues}
                    onInput={(e) =>
                      onNoteCuesChange((e.target as HTMLTextAreaElement).value)
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
                    {t.notes_editor_notes_label}
                  </label>
                  <textarea
                    value={noteContent}
                    onInput={(e) =>
                      handleContentInput((e.target as HTMLTextAreaElement).value)
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
                  {t.notes_editor_summary_label}
                </label>
                <textarea
                  value={noteSummary}
                  onInput={(e) =>
                    onNoteSummaryChange((e.target as HTMLTextAreaElement).value)
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
          ) : (
            <textarea
              id="note-content-input"
              className="note-content-input"
              value={noteContent}
              onInput={(e) =>
                handleContentInput((e.target as HTMLTextAreaElement).value)
              }
              placeholder={
                noteType === "diary"
                  ? t.notes_editor_diary_content_placeholder
                  : notesContentPlaceholder
              }
            />
          )}

          {/* Autocomplete Popup when typing [[ */}
          {showLinkSuggestions && filteredSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: "50px",
                left: "20px",
                width: "280px",
                maxHeight: "180px",
                overflowY: "auto",
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid var(--accent-color, #a855f7)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                zIndex: 100,
                padding: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                  padding: "4px 8px",
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                🔗 İç Bağlantı Ekle (`[[...]]`):
              </div>
              {filteredSuggestions.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => insertLink(n.title)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 10px",
                    background: "transparent",
                    border: "none",
                    color: "#f8fafc",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.background =
                      "rgba(168, 85, 247, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.background =
                      "transparent")
                  }
                >
                  [[{n.title}]]
                </button>
              ))}
            </div>
          )}

          {/* Backlinks Panel ("🔗 Bağlantılı Notlar") */}
          {backlinks.length > 0 && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "rgba(15, 23, 42, 0.4)",
                borderRadius: "10px",
                border: "1px solid rgba(168, 85, 247, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#c084fc",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                🔗 Bağlantılı Notlar (Backlinks - {backlinks.length}):
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginTop: "6px",
                }}
              >
                {backlinks.map((b) => (
                  <span
                    key={b.id}
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "rgba(168, 85, 247, 0.15)",
                      color: "#e0e7ff",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      fontWeight: 600,
                    }}
                  >
                    [[{b.title}]]
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button
            id="save-note-btn"
            className="settings-add-btn"
            style={{ width: "auto", padding: "0 20px" }}
            onClick={onSave}
          >
            {t.notes_editor_save}
          </button>
        </div>
      </div>
    </div>
  );
}
