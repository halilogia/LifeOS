import { useState, useEffect } from "preact/hooks";
import { Note, CustomQuote, Language } from "../types/types.js";
import { translations } from "../utils/i18n.js";
import { NoteCard } from "@/components/notes/NoteCard.js";

interface NotesViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

function renderMarkdown(text: string): string {
  if (!text) {return "";}
  // Escape HTML first to prevent XSS injection (crucial safety audit compliance!)
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Parse Code blocks: ```javascript ... ```
  html = html.replace(/```([\s\S]+?)```/g, (_, code) => {
    return `<pre style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-family: monospace; overflow-x: auto; margin: 8px 0; border: 1px solid var(--card-border); color: #a78bfa; white-space: pre-wrap; word-break: break-all;"><code>${code.trim()}</code></pre>`;
  });

  // Parse Inline code: `code`
  html = html.replace(/`([^`]+)`/g, "<code style=\"background: rgba(139, 92, 246, 0.15); color: var(--accent-color); padding: 2px 5px; border-radius: 4px; font-family: monospace;\">$1</code>");

  // Parse Bold: **text**
  html = html.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");

  // Parse Italic: *text*
  html = html.replace(/\*([^\*]+)\*/g, "<em>$1</em>");

  // Parse Headings: #, ##, ###
  html = html.replace(/^### (.*$)/gim, "<h4 style=\"margin: 10px 0 6px 0; color: #a78bfa; font-weight: 700;\">$1</h4>");
  html = html.replace(/^## (.*$)/gim, "<h3 style=\"margin: 12px 0 8px 0; color: #a78bfa; font-weight: 700;\">$1</h3>");
  html = html.replace(/^# (.*$)/gim, "<h2 style=\"margin: 14px 0 10px 0; color: #a78bfa; font-weight: 800; border-bottom: 1px solid var(--card-border); padding-bottom: 4px;\">$1</h2>");

  // Parse Lists: - or * items
  const lines = html.split("\n");
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.substring(2);
      let prefix = "";
      if (!inList) {
        prefix = "<ul style=\"padding-left: 20px; margin: 6px 0;\">";
        inList = true;
      }
      lines[i] = `${prefix}<li style="margin: 4px 0;">${content}</li>`;
    } else {
      if (inList) {
        lines[i] = `</ul>${lines[i]}`;
        inList = false;
      }
    }
  }
  if (inList) {
    lines[lines.length - 1] = `${lines[lines.length - 1]}</ul>`;
  }
  html = lines.join("\n");

  // Convert double newlines to paragraph spacers, single to br
  html = html.replace(/\n\n/g, "</p><p style=\"margin: 8px 0;\">");
  html = html.replace(/\n/g, "<br />");

  return `<p style="margin: 0; line-height: 1.6;">${html}</p>`;
}

export function NotesView({ lang, onShowConfirm }: NotesViewProps) {
  const t = translations[lang];

  const [notes, setNotes] = useState<Note[]>([]);
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [filterType, setFilterType] = useState<"all" | "note" | "diary" | "cornell" | "quotes">("all");

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

  // Inline Note Editor States
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineContent, setInlineContent] = useState("");
  const [inlineCues, setInlineCues] = useState("");
  const [inlineSummary, setInlineSummary] = useState("");

  let clickTimer: any = null;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || []))
    );
    const loadedQuotes: CustomQuote[] = await new Promise((r) =>
      chrome.storage.sync.get(["customQuotes"], (res) => r((res.customQuotes as CustomQuote[]) || []))
    );
    setNotes(
      loadedNotes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    setQuotes(loadedQuotes);
  };

  // Inline Operations
  const startInlineEdit = (note: Note) => {
    setInlineEditingId(note.id);
    setInlineTitle(note.title);
    setInlineContent(note.content);
    setInlineCues(note.cues || "");
    setInlineSummary(note.summary || "");
  };

  const handleCardClick = (note: Note) => {
    if (inlineEditingId === note.id) {return;}
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      startInlineEdit(note);
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        handleOpenNoteModal(note);
      }, 250);
    }
  };

  const handleSaveInlineNote = async (id: string) => {
    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || []))
    );
    const idx = currentNotes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      currentNotes[idx].title = inlineTitle;
      currentNotes[idx].content = inlineContent;
      currentNotes[idx].cues = inlineCues;
      currentNotes[idx].summary = inlineSummary;
      currentNotes[idx].createdAt = new Date().toISOString();
      await new Promise<void>((r) => chrome.storage.sync.set({ notes: currentNotes }, r));
      setInlineEditingId(null);
      loadData();
    }
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

    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || []))
    );
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

    await new Promise<void>((r) => chrome.storage.sync.set({ notes: currentNotes }, r));
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
      const currentNotes: Note[] = await new Promise((r) =>
        chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || []))
      );
      const filtered = currentNotes.filter((n) => n.id !== id);
      await new Promise<void>((r) => chrome.storage.sync.set({ notes: filtered }, r));
      loadData();
    });
  };

  // Quotes Operations
  const handleSaveQuote = async () => {
    if (!quoteContent.trim()) {
      setIsQuoteModalOpen(false);
      return;
    }

    const currentQuotes: CustomQuote[] = await new Promise((r) =>
      chrome.storage.sync.get(["customQuotes"], (res) => r((res.customQuotes as CustomQuote[]) || []))
    );
    currentQuotes.push({
      text: quoteContent.trim(),
      author: quoteAuthor.trim() || undefined,
    });

    await new Promise<void>((r) => chrome.storage.sync.set({ customQuotes: currentQuotes }, r));
    setIsQuoteModalOpen(false);
    loadData();
  };

  const handleDeleteQuote = (index: number) => {
    const confirmMsg =
      lang === "tr"
        ? "Bu sözü silmek istediğinize emin misiniz?"
        : "Are you sure you want to delete this quote?";
    onShowConfirm(confirmMsg, async () => {
      const currentQuotes: CustomQuote[] = await new Promise((r) =>
        chrome.storage.sync.get(["customQuotes"], (res) => r((res.customQuotes as CustomQuote[]) || []))
      );
      currentQuotes.splice(index, 1);
      await new Promise<void>((r) => chrome.storage.sync.set({ customQuotes: currentQuotes }, r));
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
        {quotes.length > 0 && (filterType === "all" || filterType === "quotes") && (
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
          <button 
            className={`add-note-action-btn ${filterType === "quotes" ? "primary" : "secondary"}`}
            style={{ padding: "6px 12px", fontSize: "0.82rem", height: "auto" }}
            onClick={() => setFilterType("quotes")}
          >
            {lang === "tr" ? "Sözler" : "Quotes"}
          </button>
        </div>

        <div id="notes-grid" className="notes-grid">
          {notes
            .filter((n) => {
              if (filterType === "all") {return true;}
              if (filterType === "quotes") {return false;}
              return (n.type || "note") === filterType;
            })
            .map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                lang={lang}
                isInlineEditing={inlineEditingId === note.id}
                inlineTitle={inlineTitle}
                inlineContent={inlineContent}
                inlineCues={inlineCues}
                inlineSummary={inlineSummary}
                onCardClick={handleCardClick}
                onSaveInlineNote={handleSaveInlineNote}
                onCancelInlineEdit={() => setInlineEditingId(null)}
                onDeleteNote={handleDeleteNote}
                setInlineTitle={setInlineTitle}
                setInlineContent={setInlineContent}
                setInlineCues={setInlineCues}
                setInlineSummary={setInlineSummary}
                renderMarkdown={renderMarkdown}
              />
            ))}
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ fontSize: "0.82rem", opacity: 0.8, fontWeight: 600 }}>{lang === "tr" ? "Kayıt Türü:" : "Entry Type:"}</label>
                  <div style={{ 
                    display: "flex", 
                    background: "rgba(255, 255, 255, 0.03)", 
                    padding: "3px", 
                    borderRadius: "10px", 
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    gap: "4px"
                  }}>
                    {(["note", "diary", "cornell"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNoteType(t)}
                        style={{
                          background: noteType === t ? "var(--accent-color)" : "transparent",
                          border: "none",
                          color: noteType === t ? "#fff" : "rgba(255, 255, 255, 0.6)",
                          padding: "5px 12px",
                          borderRadius: "7px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: noteType === t ? "0 4px 10px rgba(139, 92, 246, 0.3)" : "none"
                        }}
                      >
                        {t === "note" 
                          ? (lang === "tr" ? "Not" : "Note") 
                          : t === "diary" 
                            ? (lang === "tr" ? "Günlük" : "Diary") 
                            : (lang === "tr" ? "Ders Notu" : "Cornell Note")}
                      </button>
                    ))}
                  </div>
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
