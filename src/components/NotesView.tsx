import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { renderMarkdown } from "@/utils/markdownRenderer.js";
import { useNotes } from "@/presentation/hooks/useNotes.js";

// Extracted Sub-components
import { NoteCard } from "@/components/notes/NoteCard.js";
import { NotesHeaderBar } from "@/components/notes/NotesHeaderBar.js";
import { NotesFilterBar } from "@/components/notes/NotesFilterBar.js";
import { CustomQuotesSection } from "@/components/notes/CustomQuotesSection.js";
import { NoteEditorModal } from "@/components/notes/NoteEditorModal.js";
import { QuoteEditorModal } from "@/components/notes/QuoteEditorModal.js";
import { ZettelkastenGraphModal } from "@/components/notes/ZettelkastenGraphModal.js";

interface NotesViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

export function NotesView({ lang, onShowConfirm }: NotesViewProps) {
  const t = getTranslation(lang);
  const {
    notes,
    quotes,
    dayScores,
    handleSetDayScore,
    filterType,
    setFilterType,
    isGraphModalOpen,
    setIsGraphModalOpen,
    isNoteModalOpen,
    setIsNoteModalOpen,
    noteType,
    setNoteType,
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    noteCues,
    setNoteCues,
    noteSummary,
    setNoteSummary,
    noteSaveStatus,
    isQuoteModalOpen,
    setIsQuoteModalOpen,
    quoteContent,
    setQuoteContent,
    quoteAuthor,
    setQuoteAuthor,
    inlineEditingId,
    setInlineEditingId,
    inlineTitle,
    setInlineTitle,
    inlineContent,
    setInlineContent,
    inlineCues,
    setInlineCues,
    inlineSummary,
    setInlineSummary,
    handleCardClick,
    handleSaveInlineNote,
    handleOpenNoteModal,
    handleSaveNote,
    handleDeleteNote,
    handleSaveQuote,
    handleDeleteQuote,
  } = useNotes({ lang, onShowConfirm });

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
        dayScores={dayScores}
        onSetDayScore={handleSetDayScore}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteTypeChange={setNoteType}
        onNoteTitleChange={setNoteTitle}
        onNoteContentChange={setNoteContent}
        onNoteCuesChange={setNoteCues}
        onNoteSummaryChange={setNoteSummary}
        noteSaveStatus={noteSaveStatus}
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
