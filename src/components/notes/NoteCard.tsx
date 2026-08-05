import { Note, Language } from "@/types/types.js";
import { useState } from "preact/hooks";
import {
  extractInternalLinks,
  extractTags,
  getNodeColor,
} from "@/services/zettelkastenEngine.js";
import { getTranslation } from "@/utils/i18n.js";
import { NoteCardInlineEditor } from "./NoteCardInlineEditor.js";

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
  const [copied, setCopied] = useState(false);

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
        <NoteCardInlineEditor
          t={t}
          type={currentType}
          inlineTitle={inlineTitle}
          inlineContent={inlineContent}
          inlineCues={inlineCues}
          inlineSummary={inlineSummary}
          onTitleChange={setInlineTitle}
          onContentChange={setInlineContent}
          onCuesChange={setInlineCues}
          onSummaryChange={setInlineSummary}
          onSave={() => onSaveInlineNote(note.id)}
          onCancel={onCancelInlineEdit}
        />
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

            if (tags.length === 0 && links.length === 0) {
              return null;
            }

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
                {tags.map((tName) => (
                  <span
                    key={tName}
                    style={{
                      fontSize: "0.68rem",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "rgba(168, 85, 247, 0.2)",
                      color: getNodeColor([tName]),
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      fontWeight: 600,
                    }}
                  >
                    #{tName}
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
              {/* Copy Markdown button */}
              <button
                className="note-action-btn"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  color: "#93c5fd",
                  borderRadius: "6px",
                  padding: "4px 7px",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  void navigator.clipboard
                    .writeText(note.content || "")
                    .then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1400);
                    });
                }}
                title={t.notes_card_copy}
              >
                {copied ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
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
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
              <button
                className="note-action-btn"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  color: "#c084fc",
                  borderRadius: "6px",
                  padding: "4px 7px",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  let mdText = `# ${note.title || "Not"}\n\n`;
                  if (note.type === "cornell") {
                    if (note.cues) {
                      mdText += `### İpuçları / Anahtar Kelimeler\n${note.cues}\n\n`;
                    }
                    if (note.content) {
                      mdText += `### Notlar\n${note.content}\n\n`;
                    }
                    if (note.summary) {
                      mdText += `### Özet\n${note.summary}\n\n`;
                    }
                  } else {
                    mdText += `${note.content || ""}\n\n`;
                  }
                  mdText += `---\n*Oluşturulma Tarihi: ${new Date(note.createdAt).toLocaleDateString()}*`;

                  const blob = new Blob([mdText], {
                    type: "text/markdown;charset=utf-8;",
                  });
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
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
