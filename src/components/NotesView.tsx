import { useState, useEffect } from "preact/hooks";
import { Note, CustomQuote, Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { renderMarkdown } from "@/utils/markdownRenderer.js";

// Extracted Sub-components
import { NoteCard } from "@/components/notes/NoteCard.js";
import { NotesHeaderBar } from "@/components/notes/NotesHeaderBar.js";
import {
  NotesFilterBar,
  NoteFilterType,
} from "@/components/notes/NotesFilterBar.js";
import { CustomQuotesSection } from "@/components/notes/CustomQuotesSection.js";
import {
  NoteEditorModal,
  NoteType,
} from "@/components/notes/NoteEditorModal.js";
import { QuoteEditorModal } from "@/components/notes/QuoteEditorModal.js";
import { ZettelkastenGraphModal } from "@/components/notes/ZettelkastenGraphModal.js";

interface NotesViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

export function NotesView({ lang, onShowConfirm }: NotesViewProps) {
  const t = translations[lang];

  const [notes, setNotes] = useState<Note[]>([]);
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [filterType, setFilterType] = useState<NoteFilterType>("all");
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  // Note Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("note");
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
      chrome.storage.sync.get(["notes"], (res) =>
        r((res.notes as Note[]) || []),
      ),
    );
    const loadedQuotes: CustomQuote[] = await new Promise((r) =>
      chrome.storage.sync.get(["customQuotes"], (res) =>
        r((res.customQuotes as CustomQuote[]) || []),
      ),
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
    if (inlineEditingId === note.id) {
      return;
    }
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
      chrome.storage.sync.get(["notes"], (res) =>
        r((res.notes as Note[]) || []),
      ),
    );
    const idx = currentNotes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      currentNotes[idx].title = inlineTitle;
      currentNotes[idx].content = inlineContent;
      currentNotes[idx].cues = inlineCues;
      currentNotes[idx].summary = inlineSummary;
      currentNotes[idx].createdAt = new Date().toISOString();
      await new Promise<void>((r) =>
        chrome.storage.sync.set({ notes: currentNotes }, r),
      );
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
    if (
      !noteTitle.trim() &&
      !noteContent.trim() &&
      !noteCues.trim() &&
      !noteSummary.trim()
    ) {
      setIsNoteModalOpen(false);
      return;
    }

    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) =>
        r((res.notes as Note[]) || []),
      ),
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

    await new Promise<void>((r) =>
      chrome.storage.sync.set({ notes: currentNotes }, r),
    );
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
        chrome.storage.sync.get(["notes"], (res) =>
          r((res.notes as Note[]) || []),
        ),
      );
      const filtered = currentNotes.filter((n) => n.id !== id);
      await new Promise<void>((r) =>
        chrome.storage.sync.set({ notes: filtered }, r),
      );
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
      chrome.storage.sync.get(["customQuotes"], (res) =>
        r((res.customQuotes as CustomQuote[]) || []),
      ),
    );
    currentQuotes.push({
      text: quoteContent.trim(),
      author: quoteAuthor.trim() || undefined,
    });

    await new Promise<void>((r) =>
      chrome.storage.sync.set({ customQuotes: currentQuotes }, r),
    );
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
        chrome.storage.sync.get(["customQuotes"], (res) =>
          r((res.customQuotes as CustomQuote[]) || []),
        ),
      );
      currentQuotes.splice(index, 1);
      await new Promise<void>((r) =>
        chrome.storage.sync.set({ customQuotes: currentQuotes }, r),
      );
      loadData();
    });
  };

  return (
    <div id="notes-view" className="view-content active">
      <div className="notes-container">
        {/* Header Bar */}
        <NotesHeaderBar
          title={t.notes_title}
          lang={lang}
          onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          onOpenNoteModal={() => handleOpenNoteModal()}
        />

        {/* Custom Quotes List */}
        {quotes.length > 0 &&
          (filterType === "all" || filterType === "quotes") && (
            <CustomQuotesSection
              quotes={quotes}
              lang={lang}
              onDeleteQuote={handleDeleteQuote}
            />
          )}

        {/* Filter Chips Bar */}
        <NotesFilterBar
          filterType={filterType}
          lang={lang}
          onFilterChange={setFilterType}
        />

        {/* Notes Cards Grid */}
        <div id="notes-grid" className="notes-grid">
          {notes
            .filter((n) => {
              if (filterType === "all") {
                return true;
              }
              if (filterType === "quotes") {
                return false;
              }
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
      <NoteEditorModal
        isOpen={isNoteModalOpen}
        lang={lang}
        noteType={noteType}
        noteTitle={noteTitle}
        noteContent={noteContent}
        noteCues={noteCues}
        noteSummary={noteSummary}
        notesPlaceholder={t.notes_placeholder}
        notesContentPlaceholder={t.notes_content_placeholder}
        availableNotes={notes}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteTypeChange={setNoteType}
        onNoteTitleChange={setNoteTitle}
        onNoteContentChange={setNoteContent}
        onNoteCuesChange={setNoteCues}
        onNoteSummaryChange={setNoteSummary}
        onSave={handleSaveNote}
      />

      {/* Quote Editor Modal */}
      <QuoteEditorModal
        isOpen={isQuoteModalOpen}
        lang={lang}
        quoteContent={quoteContent}
        quoteAuthor={quoteAuthor}
        onClose={() => setIsQuoteModalOpen(false)}
        onQuoteContentChange={setQuoteContent}
        onQuoteAuthorChange={setQuoteAuthor}
        onSave={handleSaveQuote}
      />

      {/* Obsidian Zettelkasten Interactive Graph View Modal */}
      {isGraphModalOpen && (
        <ZettelkastenGraphModal
          notes={notes}
          onClose={() => setIsGraphModalOpen(false)}
          onSelectNote={(note) => handleOpenNoteModal(note)}
        />
      )}
    </div>
  );
}
