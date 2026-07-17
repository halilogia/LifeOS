import { useState, useEffect } from "preact/hooks";
import { storage } from "../core/storage.js";
import { Note, CustomQuote, Language } from "../types/types.js";
import { translations } from "../utils/i18n.js";

interface NotesViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

export function NotesView({ lang, onShowConfirm }: NotesViewProps) {
  const t = translations[lang];

  const [notes, setNotes] = useState<Note[]>([]);
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [filterType, setFilterType] = useState<"all" | "note" | "diary" | "cornell">("all");

  // Note Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<"note" | "diary" | "cornell">("note");
  const [noteCues, setNoteCues] = useState("");
  const [noteSummary, setNoteSummary] = useState("");

  // Quote Modal States
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteContent, setQuoteContent] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedNotes = await storage.getNotes();
    const loadedQuotes = await storage.getCustomQuotes();
    setNotes(
      loadedNotes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    setQuotes(loadedQuotes);
  };

  // Notes Operations
  const handleOpenNoteModal = (note?: Note) => {
    if (note) {
      setEditingNoteId(note.id);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteType(note.type || "note");
      setNoteCues(note.cues || "");
      setNoteSummary(note.summary || "");
    } else {
      setEditingNoteId(null);
      setNoteTitle("");
      setNoteContent("");
      setNoteType("note");
      setNoteCues("");
      setNoteSummary("");
    }
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim() && !noteCues.trim() && !noteSummary.trim()) {
      setIsNoteModalOpen(false);
      return;
    }

    const currentNotes = await storage.getNotes();
    if (editingNoteId) {
      const idx = currentNotes.findIndex((n) => n.id === editingNoteId);
      if (idx !== -1) {
        currentNotes[idx].title = noteTitle;
        currentNotes[idx].content = noteContent;
        currentNotes[idx].type = noteType;
        currentNotes[idx].cues = noteCues;
        currentNotes[idx].summary = noteSummary;
        currentNotes[idx].createdAt = new Date().toISOString();
      }
    } else {
      currentNotes.push({
        id: crypto.randomUUID(),
        title: noteTitle,
        content: noteContent,
        type: noteType,
        cues: noteCues,
        summary: noteSummary,
        createdAt: new Date().toISOString(),
      });
    }

    await storage.setNotes(currentNotes);
    setIsNoteModalOpen(false);
    loadData();
  };

  const handleDeleteNote = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmMsg =
      lang === "tr"
        ? "Bu notu silmek istediğinize emin misiniz?"
        : "Are you sure you want to delete this note?";
    onShowConfirm(confirmMsg, async () => {
      const currentNotes = await storage.getNotes();
      const filtered = currentNotes.filter((n) => n.id !== id);
      await storage.setNotes(filtered);
      loadData();
    });
  };

  // Quotes Operations
  const handleSaveQuote = async () => {
    if (!quoteContent.trim()) {
      setIsQuoteModalOpen(false);
      return;
    }

    const currentQuotes = await storage.getCustomQuotes();
    currentQuotes.push({
      text: quoteContent.trim(),
      author: quoteAuthor.trim() || undefined,
    });

    await storage.setCustomQuotes(currentQuotes);
    setIsQuoteModalOpen(false);
    loadData();
  };

  const handleDeleteQuote = (index: number) => {
    const confirmMsg =
      lang === "tr"
        ? "Bu sözü silmek istediğinize emin misiniz?"
        : "Are you sure you want to delete this quote?";
    onShowConfirm(confirmMsg, async () => {
      const currentQuotes = await storage.getCustomQuotes();
      currentQuotes.splice(index, 1);
      await storage.setCustomQuotes(currentQuotes);
      loadData();
    });
  };

  return (
    <div id="notes-view" className="view-content active">
      <div className="notes-container">
        <div className="notes-header">
          <h2>{t.notes_title}</h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              id="add-quote-btn"
              className="add-note-action-btn secondary"
              onClick={() => setIsQuoteModalOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{lang === "tr" ? "Yeni Söz" : "New Quote"}</span>
            </button>
            <button
              id="add-note-btn"
              className="add-note-action-btn primary"
              onClick={() => handleOpenNoteModal()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{lang === "tr" ? "Yeni Not" : "New Note"}</span>
            </button>
          </div>
        </div>

        {/* Display Custom Quotes in a Small Sub-Section */}
        {quotes.length > 0 && (
          <div className="quotes-sub-section" style={{ marginBottom: "20px" }}>
            <h3
              style={{
                fontSize: "0.9rem",
                opacity: 0.6,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              {lang === "tr" ? "Eklediğim Sözler" : "My Custom Quotes"}
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {quotes.map((q, idx) => (
                <div
                  key={idx}
                  className="settings-list-item"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "10px 14px",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontStyle: "italic" }}>"{q.text}"</span>
                    {q.author && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          opacity: 0.5,
                          marginTop: "2px",
                        }}
                      >
                        — {q.author}
                      </span>
                    )}
                  </div>
                  <button
                    className="settings-del-btn"
                    onClick={() => handleDeleteQuote(idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtering buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button 
            className={`add-note-action-btn ${filterType === "all" ? "primary" : "secondary"}`}
            style={{ padding: "6px 12px", fontSize: "0.82rem", height: "auto" }}
            onClick={() => setFilterType("all")}
          >
            {lang === "tr" ? "Hepsi" : "All"}
          </button>
          <button 
            className={`add-note-action-btn ${filterType === "note" ? "primary" : "secondary"}`}
            style={{ padding: "6px 12px", fontSize: "0.82rem", height: "auto" }}
            onClick={() => setFilterType("note")}
          >
            {lang === "tr" ? "Notlar" : "Notes"}
          </button>
          <button 
            className={`add-note-action-btn ${filterType === "diary" ? "primary" : "secondary"}`}
            style={{ padding: "6px 12px", fontSize: "0.82rem", height: "auto" }}
            onClick={() => setFilterType("diary")}
          >
            {lang === "tr" ? "Günlükler" : "Diary"}
          </button>
          <button 
            className={`add-note-action-btn ${filterType === "cornell" ? "primary" : "secondary"}`}
            style={{ padding: "6px 12px", fontSize: "0.82rem", height: "auto" }}
            onClick={() => setFilterType("cornell")}
          >
            {lang === "tr" ? "Cornell Notları" : "Cornell Notes"}
          </button>
        </div>

        <div id="notes-grid" className="notes-grid">
          {notes
            .filter((n) => {
              if (filterType === "all") return true;
              return (n.type || "note") === filterType;
            })
            .map((note) => {
              const title = note.title || (lang === "tr" ? "Başlıksız" : "Untitled");
              const currentType = note.type || "note";
              
              return (
                <div
                  key={note.id}
                  className="note-card"
                  onClick={() => handleOpenNoteModal(note)}
                >
                  <div className="note-card-header">
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
                      onClick={(e) => handleDeleteNote(e, note.id)}
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflow: "hidden" }}>
                      <div className="cornell-mini-grid">
                        <div className="cornell-mini-column" title="Cues/Keywords">
                          <strong>{lang === "tr" ? "İpuçları:" : "Cues:"}</strong><br/>
                          {note.cues || "—"}
                        </div>
                        <div className="cornell-mini-column" title="Notlar:">
                          <strong>{lang === "tr" ? "Notlar:" : "Notes:"}</strong><br/>
                          {note.content || "—"}
                        </div>
                      </div>
                      {note.summary && (
                        <div className="cornell-mini-summary" title="Summary">
                          <strong>{lang === "tr" ? "Özet:" : "Summary:"}</strong> {note.summary}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="note-card-content">
                      {note.content}
                    </div>
                  )}

                  <div className="note-card-footer">
                    <span className="note-card-date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Note Editor Modal */}
      {isNoteModalOpen && (
        <div
          className="settings-panel active"
          onClick={() => setIsNoteModalOpen(false)}
        >
          <div
            className="settings-content note-modal-content"
            style={{ maxWidth: noteType === "cornell" ? "800px" : "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", opacity: 0.7 }}>{lang === "tr" ? "Tür:" : "Type:"}</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType((e.target as HTMLSelectElement).value as any)}
                    style={{
                      background: "#1e1e24",
                      color: "#f1f5f9",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "0.85rem",
                      outline: "none"
                    }}
                  >
                    <option value="note">{lang === "tr" ? "Not" : "Note"}</option>
                    <option value="diary">{lang === "tr" ? "Günlük Yazısı" : "Diary Entry"}</option>
                    <option value="cornell">{lang === "tr" ? "Ders Notu (Cornell)" : "Cornell Study Note"}</option>
                  </select>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setIsNoteModalOpen(false)}
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
                  setNoteTitle((e.target as HTMLInputElement).value)
                }
                placeholder={noteType === "diary" ? (lang === "tr" ? "Bugün nasıl hissediyorsun? veya Başlık..." : "How do you feel today? or Title...") : t.notes_placeholder}
              />
            </header>
            
            <div className="note-editor-body" style={{ padding: "0 10px" }}>
              {noteType === "cornell" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {lang === "tr" ? "Anahtar Kelimeler / Sorular (Cues):" : "Keywords / Questions (Cues):"}
                      </label>
                      <textarea
                        value={noteCues}
                        onInput={(e) => setNoteCues((e.target as HTMLTextAreaElement).value)}
                        placeholder={lang === "tr" ? "Temel fikirler, anahtar kelimeler veya olası sınav sorularını buraya yazın..." : "Write core ideas, keywords, or potential exam questions here..."}
                        style={{
                          background: "rgba(0, 0, 0, 0.2)",
                          border: "1px solid var(--card-border)",
                          borderRadius: "10px",
                          padding: "12px",
                          color: "#f1f5f9",
                          fontSize: "0.85rem",
                          height: "220px",
                          resize: "none",
                          outline: "none"
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {lang === "tr" ? "Not Alma Alanı (Notes):" : "Note-taking Column (Notes):"}
                      </label>
                      <textarea
                        value={noteContent}
                        onInput={(e) => setNoteContent((e.target as HTMLTextAreaElement).value)}
                        placeholder={lang === "tr" ? "Ders esnasındaki ayrıntılı notlarınızı, formülleri ve açıklamaları buraya yazın..." : "Write detailed lecture notes, formulas, and explanations here..."}
                        style={{
                          background: "rgba(0, 0, 0, 0.2)",
                          border: "1px solid var(--card-border)",
                          borderRadius: "10px",
                          padding: "12px",
                          color: "#f1f5f9",
                          fontSize: "0.85rem",
                          height: "220px",
                          resize: "none",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      {lang === "tr" ? "Özet (Summary):" : "Summary:"}
                    </label>
                    <textarea
                      value={noteSummary}
                      onInput={(e) => setNoteSummary((e.target as HTMLTextAreaElement).value)}
                      placeholder={lang === "tr" ? "Bu çalışma sayfasındaki bilgilerin kısa ve net bir özetini buraya yazın..." : "Write a brief and clear summary of the page details here..."}
                      style={{
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid var(--card-border)",
                        borderRadius: "10px",
                        padding: "12px",
                        color: "#f1f5f9",
                        fontSize: "0.85rem",
                        height: "70px",
                        resize: "none",
                        outline: "none"
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
                    setNoteContent((e.target as HTMLTextAreaElement).value)
                  }
                  placeholder={noteType === "diary" ? (lang === "tr" ? "Sevgili günlük, bugün..." : "Dear diary, today...") : t.notes_content_placeholder}
                ></textarea>
              )}
            </div>
            
            <div className="settings-footer">
              <button
                id="save-note-btn"
                className="settings-add-btn"
                style={{ width: "auto", padding: "0 20px" }}
                onClick={handleSaveNote}
              >
                {lang === "tr" ? "Kaydet" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {isQuoteModalOpen && (
        <div
          className="settings-panel active"
          onClick={() => setIsQuoteModalOpen(false)}
        >
          <div
            className="settings-content"
            style={{ maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header">
              <h3>{lang === "tr" ? "Yeni Özlü Söz" : "New Quote"}</h3>
              <button
                className="close-btn"
                onClick={() => setIsQuoteModalOpen(false)}
              >
                &times;
              </button>
            </header>
            <div className="note-editor-body" style={{ padding: "20px" }}>
              <textarea
                id="quote-content-input"
                className="note-content-input"
                style={{ height: "120px", fontStyle: "italic" }}
                value={quoteContent}
                onInput={(e) =>
                  setQuoteContent((e.target as HTMLTextAreaElement).value)
                }
                placeholder={
                  lang === "tr"
                    ? "Özlü sözü buraya yazın..."
                    : "Write the quote here..."
                }
              ></textarea>
              <input
                type="text"
                id="quote-author-input"
                className="note-title-input"
                style={{ marginTop: "10px", fontSize: "0.9rem" }}
                value={quoteAuthor}
                onInput={(e) =>
                  setQuoteAuthor((e.target as HTMLInputElement).value)
                }
                placeholder={
                  lang === "tr" ? "Yazar (Opsiyonel)" : "Author (Optional)"
                }
              />
            </div>
            <div className="settings-footer">
              <button
                id="save-quote-btn"
                className="settings-add-btn"
                style={{ width: "auto", padding: "0 20px" }}
                onClick={handleSaveQuote}
              >
                {lang === "tr" ? "Ekle" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
