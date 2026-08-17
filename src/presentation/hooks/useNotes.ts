import { useRef, useEffect } from "preact/hooks";
import { Language, Note } from "@/types/types.js";
import { useNotesState } from "@/presentation/store/notesStore.js";

interface UseNotesOptions {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

/**
 * Facade over useNotesState — all state + storage + auto-save lives in the store.
 * configure() is called every render to keep fresh closures (lang, onShowConfirm).
 * Click timer is kept in facade (UI timing concern).
 */
export function useNotes({ lang, onShowConfirm }: UseNotesOptions) {
  const notes = useNotesState((s) => s.notes);
  const quotes = useNotesState((s) => s.quotes);
  const dayScores = useNotesState((s) => s.dayScores);
  const filterType = useNotesState((s) => s.filterType);
  const setFilterType = useNotesState((s) => s.setFilterType);
  const isGraphModalOpen = useNotesState((s) => s.isGraphModalOpen);
  const setIsGraphModalOpen = useNotesState((s) => s.setIsGraphModalOpen);
  const isNoteModalOpen = useNotesState((s) => s.isNoteModalOpen);
  const setIsNoteModalOpen = useNotesState((s) => s.setIsNoteModalOpen);
  const noteType = useNotesState((s) => s.noteType);
  const setNoteType = useNotesState((s) => s.setNoteType);
  const noteTitle = useNotesState((s) => s.noteTitle);
  const setNoteTitle = useNotesState((s) => s.setNoteTitle);
  const noteContent = useNotesState((s) => s.noteContent);
  const setNoteContent = useNotesState((s) => s.setNoteContent);
  const noteCues = useNotesState((s) => s.noteCues);
  const setNoteCues = useNotesState((s) => s.setNoteCues);
  const noteSummary = useNotesState((s) => s.noteSummary);
  const setNoteSummary = useNotesState((s) => s.setNoteSummary);
  const noteSaveStatus = useNotesState((s) => s.noteSaveStatus);
  const isQuoteModalOpen = useNotesState((s) => s.isQuoteModalOpen);
  const setIsQuoteModalOpen = useNotesState((s) => s.setIsQuoteModalOpen);
  const quoteContent = useNotesState((s) => s.quoteContent);
  const setQuoteContent = useNotesState((s) => s.setQuoteContent);
  const quoteAuthor = useNotesState((s) => s.quoteAuthor);
  const setQuoteAuthor = useNotesState((s) => s.setQuoteAuthor);
  const inlineEditingId = useNotesState((s) => s.inlineEditingId);
  const setInlineEditingId = useNotesState((s) => s.setInlineEditingId);
  const inlineTitle = useNotesState((s) => s.inlineTitle);
  const setInlineTitle = useNotesState((s) => s.setInlineTitle);
  const inlineContent = useNotesState((s) => s.inlineContent);
  const setInlineContent = useNotesState((s) => s.setInlineContent);
  const inlineCues = useNotesState((s) => s.inlineCues);
  const setInlineCues = useNotesState((s) => s.setInlineCues);
  const inlineSummary = useNotesState((s) => s.inlineSummary);
  const setInlineSummary = useNotesState((s) => s.setInlineSummary);
  const handleSaveInlineNote = useNotesState((s) => s.handleSaveInlineNote);
  const handleOpenNoteModal = useNotesState((s) => s.handleOpenNoteModal);
  const handleSaveNote = useNotesState((s) => s.handleSaveNote);
  const handleDeleteNote = useNotesState((s) => s.handleDeleteNote);
  const handleSaveQuote = useNotesState((s) => s.handleSaveQuote);
  const handleDeleteQuote = useNotesState((s) => s.handleDeleteQuote);
  const handleSetDayScore = useNotesState((s) => s.handleSetDayScore);
  const startInlineEdit = useNotesState((s) => s.startInlineEdit);

  // CRITICAL: configure on every render (fresh closures for lang/onShowConfirm)
  useNotesState.getState().configure({ lang, onShowConfirm });

  // Click timer for double-click vs single-click distinction (UI concern)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardClick = (note: Note) => {
    if (inlineEditingId === note.id) {
      return;
    }
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      startInlineEdit(note);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        handleOpenNoteModal(note);
      }, 250);
    }
  };

  useEffect(() => {
    const cleanup = useNotesState.getState().init();
    void useNotesState.getState().loadData();
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      cleanup();
    };
  }, []);

  return {
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
  };
}
