import { Note, Language } from "@/types/types.js";

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
  const title = note.title || (lang === "tr" ? "Başlıksız" : "Untitled");

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
        justifyContent: "space-between"
      }}
    >
      {isInlineEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }} onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={inlineTitle}
            onInput={(e) => setInlineTitle((e.target as HTMLInputElement).value)}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid var(--card-border)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              outline: "none"
            }}
            placeholder={lang === "tr" ? "Başlık..." : "Title..."}
          />
          
          {currentType === "cornell" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <textarea
                  value={inlineCues}
                  onInput={(e) => setInlineCues((e.target as HTMLTextAreaElement).value)}
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
                    outline: "none"
                  }}
                  placeholder={lang === "tr" ? "Anahtar Kelimeler..." : "Cues..."}
                />
                <textarea
                  value={inlineContent}
                  onInput={(e) => setInlineContent((e.target as HTMLTextAreaElement).value)}
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
                    outline: "none"
                  }}
                  placeholder={lang === "tr" ? "Notlar (Markdown)..." : "Notes (Markdown)..."}
                />
              </div>
              <textarea
                value={inlineSummary}
                onInput={(e) => setInlineSummary((e.target as HTMLTextAreaElement).value)}
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
                  outline: "none"
                }}
                placeholder={lang === "tr" ? "Özet..." : "Summary..."}
              />
            </>
          ) : (
            <textarea
              value={inlineContent}
              onInput={(e) => setInlineContent((e.target as HTMLTextAreaElement).value)}
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
                outline: "none"
              }}
              placeholder={lang === "tr" ? "Not içeriği (Markdown)..." : "Content (Markdown)..."}
            />
          )}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
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
                cursor: "pointer"
              }}
            >
              {lang === "tr" ? "İptal" : "Cancel"}
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
                cursor: "pointer"
              }}
            >
              {lang === "tr" ? "Kaydet" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="note-card-header" style={{ width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "80%" }}>
              <span className={`note-type-badge ${currentType}`}>
                {currentType === "diary" 
                  ? (lang === "tr" ? "Günlük" : "Diary") 
                  : currentType === "cornell" 
                    ? (lang === "tr" ? "Cornell Notu" : "Cornell Note") 
                    : (lang === "tr" ? "Not" : "Note")}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflow: "hidden", width: "100%" }}>
              <div className="cornell-mini-grid" style={{ gap: "10px" }}>
                <div className="cornell-mini-column" title="Cues/Keywords">
                  <strong style={{ fontSize: "0.75rem", color: "var(--accent-color)" }}>{lang === "tr" ? "İpuçları:" : "Cues:"}</strong>
                  <div style={{ marginTop: "4px", fontSize: "0.8rem", opacity: 0.8 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(note.cues || "") }} />
                </div>
                <div className="cornell-mini-column" title="Notlar:">
                  <strong style={{ fontSize: "0.75rem", color: "var(--accent-color)" }}>{lang === "tr" ? "Notlar:" : "Notes:"}</strong>
                  <div style={{ marginTop: "4px", fontSize: "0.8rem", opacity: 0.8 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content || "") }} />
                </div>
              </div>
              {note.summary && (
                <div className="cornell-mini-summary" title="Summary" style={{ borderTop: "1px dashed var(--card-border)", paddingTop: "6px" }}>
                  <strong style={{ fontSize: "0.75rem", color: "var(--accent-color)" }}>{lang === "tr" ? "Özet:" : "Summary:"}</strong>
                  <div style={{ marginTop: "2px", fontSize: "0.8rem", opacity: 0.8 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(note.summary || "") }} />
                </div>
              )}
            </div>
          ) : (
            <div className="note-card-content" style={{ flex: 1, width: "100%", overflow: "hidden", textOverflow: "ellipsis" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content || "") }} />
          )}

          <div className="note-card-footer" style={{ width: "100%" }}>
            <span className="note-card-date">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
