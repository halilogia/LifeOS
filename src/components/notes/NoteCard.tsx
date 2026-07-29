import { Note, Language } from "@/types/types.js";
import {
  extractInternalLinks,
  extractTags,
  getNodeColor,
} from "@/services/zettelkastenEngine.js";
import { getTranslation } from "@/utils/i18n.js";

interface NoteCardProps {
  note: Note;
  lang: Language;
  isInlineEditing: boolean;
  inlineTitle: string;
  inlineContent: string;
  inlineCues: string;
  inlineSummary: string;
  onCardClick: (note: Note) => void;
  onSaveInlineNote: (id: string) => void;
  onCancelInlineEdit: () => void;
  onDeleteNote: (e: MouseEvent, id: string) => void;
  setInlineTitle: (val: string) => void;
  setInlineContent: (val: string) => void;
  setInlineCues: (val: string) => void;
  setInlineSummary: (val: string) => void;
  renderMarkdown: (text: string) => string;
}

export function NoteCard({
  note,
  lang,
  isInlineEditing,
  inlineTitle,
  inlineContent,
  inlineCues,
  inlineSummary,
  onCardClick,
  onSaveInlineNote,
  onCancelInlineEdit,
  onDeleteNote,
  setInlineTitle,
  setInlineContent,
  setInlineCues,
  setInlineSummary,
  renderMarkdown,
}: NoteCardProps) {
  const currentType = note.type || "note";
  const t = getTranslation(lang);
  const title = note.title || t.notes_card_untitled;

  return (
    <div
      className="note-card"
      onClick={() => onCardClick(note)}
      style={{
        cursor: isInlineEditing ? "default" : "pointer",
        height: "auto",
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {isInlineEditing ? (
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
            onInput={(e) =>
              setInlineTitle((e.target as HTMLInputElement).value)
            }
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

          {currentType === "cornell" ? (
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
                    setInlineCues((e.target as HTMLTextAreaElement).value)
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
                    setInlineContent((e.target as HTMLTextAreaElement).value)
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
                  setInlineSummary((e.target as HTMLTextAreaElement).value)
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
                setInlineContent((e.target as HTMLTextAreaElement).value)
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
              onClick={onCancelInlineEdit}
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
              onClick={() => onSaveInlineNote(note.id)}
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
      ) : (
        <>
          <div className="note-card-header" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                maxWidth: "80%",
              }}
            >
              <span className={`note-type-badge ${currentType}`}>
                {currentType === "diary"
                  ? t.notes_editor_type_diary
                  : currentType === "cornell"
                    ? t.notes_card_type_cornell
                    : t.notes_editor_type_note}
              </span>
              <h3 className="note-card-title">{title}</h3>
            </div>
            <button
              className="note-delete-btn"
              title="Delete"
              onClick={(e) => onDeleteNote(e, note.id)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          {currentType === "cornell" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div className="cornell-mini-grid" style={{ gap: "10px" }}>
                <div className="cornell-mini-column" title="Cues/Keywords">
                  <strong
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent-color)",
                    }}
                  >
                    {t.notes_card_cues_label}
                  </strong>
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "0.8rem",
                      opacity: 0.8,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(note.cues || ""),
                    }}
                  />
                </div>
                <div className="cornell-mini-column" title="Notlar:">
                  <strong
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent-color)",
                    }}
                  >
                    {t.notes_card_notes_label}
                  </strong>
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "0.8rem",
                      opacity: 0.8,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(note.content || ""),
                    }}
                  />
                </div>
              </div>
              {note.summary && (
                <div
                  className="cornell-mini-summary"
                  title="Summary"
                  style={{
                    borderTop: "1px dashed var(--card-border)",
                    paddingTop: "6px",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent-color)",
                    }}
                  >
                    {t.notes_card_summary_label}
                  </strong>
                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "0.8rem",
                      opacity: 0.8,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(note.summary || ""),
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              className="note-card-content"
              style={{
                flex: 1,
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(note.content || ""),
              }}
            />
          )}

          {/* Zettelkasten Tags & Internal Links Chips */}
          {(() => {
            const rawText = `${note.content || ""} ${note.cues || ""} ${note.summary || ""}`;
            const tags = extractTags(rawText);
            const links = extractInternalLinks(rawText);

            if (tags.length === 0 && links.length === 0) return null;

            return (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                  marginTop: "8px",
                  marginBottom: "4px",
                }}
              >
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "0.68rem",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "rgba(168, 85, 247, 0.2)",
                      color: getNodeColor([t]),
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      fontWeight: 600,
                    }}
                  >
                    #{t}
                  </span>
                ))}
                {links.map((l) => (
                  <span
                    key={l}
                    style={{
                      fontSize: "0.68rem",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "rgba(59, 130, 246, 0.15)",
                      color: "#93c5fd",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      fontWeight: 600,
                    }}
                  >
                    [[{l}]]
                  </span>
                ))}
              </div>
            );
          })()}

          <div
            className="note-card-footer"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "8px",
            }}
          >
            <span className="note-card-date">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                className="note-action-btn"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  color: "#c084fc",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  let mdText = `# ${note.title || "Not"}\n\n`;
                  if (note.type === "cornell") {
                    if (note.cues) mdText += `### İpuçları / Anahtar Kelimeler\n${note.cues}\n\n`;
                    if (note.content) mdText += `### Notlar\n${note.content}\n\n`;
                    if (note.summary) mdText += `### Özet\n${note.summary}\n\n`;
                  } else {
                    mdText += `${note.content || ""}\n\n`;
                  }
                  mdText += `---\n*Oluşturulma Tarihi: ${new Date(note.createdAt).toLocaleDateString()}*`;

                  const blob = new Blob([mdText], { type: "text/markdown;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${(note.title || "Not").replace(/[^a-zA-Z0-9_\u00C0-\u024F]/g, "_")}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                title={t.notes_card_export_md}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{t.notes_card_export_md}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
