import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { Note, CustomQuote, DayScores, Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { NoteFilterType } from "@/components/notes/NotesFilterBar.js";
import { NoteType } from "@/components/notes/NoteEditorModal.js";
import { SYNC_DAY_SCORES } from "@/infrastructure/storage/keys.js";

interface UseNotesOptions {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

/**
 * Notes + custom quotes state & storage mantığı (AGENTS.md 6.3: presentation/hooks/).
 * View sadece JSX render eder.
 */
export function useNotes({ lang, onShowConfirm }: UseNotesOptions) {
  const t = getTranslation(lang);

  const [notes, setNotes] = useState<Note[]>([]);
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [dayScores, setDayScores] = useState<DayScores>({});
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
  const [noteSaveStatus, setNoteSaveStatus] = useState(false);

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

  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Otomatik kayıt sırasında en güncel değerleri oku
  const noteModalOpenRef = useRef(false);
  noteModalOpenRef.current = isNoteModalOpen;
  const editingNoteIdRef = useRef<string | null>(null);
  editingNoteIdRef.current = editingNoteId;
  const noteFieldsRef = useRef({ title: "", content: "", cues: "", summary: "" });
  noteFieldsRef.current = {
    title: noteTitle,
    content: noteContent,
    cues: noteCues,
    summary: noteSummary,
  };

  /** Otomatik kayıt — modal açıkken alanlar değişince debounce'la kaydet */
  const autoSaveNote = useCallback(async () => {
    if (!noteModalOpenRef.current) {
      return;
    }
    const { title, content, cues, summary } = noteFieldsRef.current;
    if (!title.trim() && !content.trim() && !cues.trim() && !summary.trim()) {
      return;
    }
    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.local.get(["notes"], (res) =>
        r((res.notes as Note[]) || []),
      ),
    );
    const id = editingNoteIdRef.current;
    if (id) {
      const idx = currentNotes.findIndex((n) => n.id === id);
      if (idx !== -1) {
        currentNotes[idx].title = title;
        currentNotes[idx].content = content;
        currentNotes[idx].type = noteType;
        currentNotes[idx].cues = cues;
        currentNotes[idx].summary = summary;
        currentNotes[idx].createdAt = new Date().toISOString();
      }
    } else {
      // Yeni not — ilk otomatik kayıtta oluştur, editingNoteId'yi bağla
      const newId = crypto.randomUUID();
      currentNotes.push({
        id: newId,
        title,
        content,
        type: noteType,
        cues,
        summary,
        createdAt: new Date().toISOString(),
      });
      setEditingNoteId(newId);
      editingNoteIdRef.current = newId;
    }
    await new Promise<void>((r) =>
      chrome.storage.local.set({ notes: currentNotes }, r),
    );
    setNotes(
      currentNotes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    setNoteSaveStatus(true);
    if (autoSaveStatusTimerRef.current) {
      clearTimeout(autoSaveStatusTimerRef.current);
    }
    autoSaveStatusTimerRef.current = setTimeout(
      () => setNoteSaveStatus(false),
      2000,
    );
  }, [noteType]);

  // Otomatik kayıt: modal açıkken alanlar değişince 1.2s debounce
  useEffect(() => {
    if (!isNoteModalOpen) {
      return;
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      void autoSaveNote();
    }, 1200);
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    isNoteModalOpen,
    noteTitle,
    noteContent,
    noteCues,
    noteSummary,
    autoSaveNote,
  ]);

  // Sayfa gizlenirken / sekme değişirken anında kaydet (kayıp önleme)
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden") {
        void autoSaveNote();
      }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [autoSaveNote]);

  const loadData = useCallback(async () => {
    const loadedNotes: Note[] = await new Promise((r) =>
      chrome.storage.local.get(["notes"], (res) =>
        r((res.notes as Note[]) || []),
      ),
    );
    const loadedQuotes: CustomQuote[] = await new Promise((r) =>
      chrome.storage.local.get(["customQuotes"], (res) =>
        r((res.customQuotes as CustomQuote[]) || []),
      ),
    );
    const loadedScores: DayScores = await new Promise((r) =>
      chrome.storage.local.get([SYNC_DAY_SCORES], (res) =>
        r((res[SYNC_DAY_SCORES] as DayScores) || {}),
      ),
    );
    setNotes(
      loadedNotes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    setQuotes(loadedQuotes);
    setDayScores(loadedScores);
  }, []);

  useEffect(() => {
    loadData();
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, [loadData]);

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

  const handleSaveInlineNote = async (id: string) => {
    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.local.get(["notes"], (res) =>
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
        chrome.storage.local.set({ notes: currentNotes }, r),
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
      chrome.storage.local.get(["notes"], (res) =>
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
      chrome.storage.local.set({ notes: currentNotes }, r),
    );
    setIsNoteModalOpen(false);
    setNoteSaveStatus(true);
    if (autoSaveStatusTimerRef.current) {
      clearTimeout(autoSaveStatusTimerRef.current);
    }
    autoSaveStatusTimerRef.current = setTimeout(
      () => setNoteSaveStatus(false),
      2000,
    );
    loadData();
  };

  const handleDeleteNote = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmMsg = t.delete_confirm_note;
    onShowConfirm(confirmMsg, async () => {
      const currentNotes: Note[] = await new Promise((r) =>
        chrome.storage.local.get(["notes"], (res) =>
          r((res.notes as Note[]) || []),
        ),
      );
      const filtered = currentNotes.filter((n) => n.id !== id);
      await new Promise<void>((r) =>
        chrome.storage.local.set({ notes: filtered }, r),
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
      chrome.storage.local.get(["customQuotes"], (res) =>
        r((res.customQuotes as CustomQuote[]) || []),
      ),
    );
    currentQuotes.push({
      text: quoteContent.trim(),
      author: quoteAuthor.trim() || undefined,
    });

    await new Promise<void>((r) =>
      chrome.storage.local.set({ customQuotes: currentQuotes }, r),
    );
    setIsQuoteModalOpen(false);
    loadData();
  };

  const handleDeleteQuote = (index: number) => {
    const confirmMsg = t.delete_confirm_quote;
    onShowConfirm(confirmMsg, async () => {
      const currentQuotes: CustomQuote[] = await new Promise((r) =>
        chrome.storage.local.get(["customQuotes"], (res) =>
          r((res.customQuotes as CustomQuote[]) || []),
        ),
      );
      currentQuotes.splice(index, 1);
      await new Promise<void>((r) =>
        chrome.storage.local.set({ customQuotes: currentQuotes }, r),
      );
      loadData();
    });
  };

  // Day Score (Mood Tracker) Operations
  const handleSetDayScore = async (dateKey: string, score: number) => {
    const currentScores: DayScores = await new Promise((r) =>
      chrome.storage.local.get([SYNC_DAY_SCORES], (res) =>
        r((res[SYNC_DAY_SCORES] as DayScores) || {}),
      ),
    );
    const next: DayScores = { ...currentScores };
    if (score <= 0) {
      delete next[dateKey];
    } else {
      next[dateKey] = score;
    }
    await new Promise<void>((r) =>
      chrome.storage.local.set({ [SYNC_DAY_SCORES]: next }, r),
    );
    setDayScores(next);
  };

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
