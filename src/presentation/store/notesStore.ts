/**
 * useNotes store
 * Zustand singleton — notes + custom quotes + day scores + auto-save + inline edit.
 * All chrome.storage + auto-save + visibility listeners live here.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import type { Note, CustomQuote, DayScores, Language, NoteType, NoteFilterType } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { SYNC_DAY_SCORES } from "@/infrastructure/storage/keys.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const NOTES_KEY = "notes";
const QUOTES_KEY = "customQuotes";

interface NotesCallbacks {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

let cb: NotesCallbacks | null = null;

interface NotesState {
  // Data
  notes: Note[];
  quotes: CustomQuote[];
  dayScores: DayScores;
  
  // UI state
  filterType: NoteFilterType;
  setFilterType: (f: NoteFilterType) => void;
  isGraphModalOpen: boolean;
  setIsGraphModalOpen: (v: boolean) => void;
  
  // Note Modal
  isNoteModalOpen: boolean;
  setIsNoteModalOpen: (v: boolean) => void;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  noteTitle: string;
  setNoteTitle: (t: string) => void;
  noteContent: string;
  setNoteContent: (c: string) => void;
  noteType: NoteType;
  setNoteType: (t: NoteType) => void;
  noteCues: string;
  setNoteCues: (c: string) => void;
  noteSummary: string;
  setNoteSummary: (s: string) => void;
  noteSaveStatus: boolean;
  setNoteSaveStatus: (v: boolean) => void;
  
  // Quote Modal
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (v: boolean) => void;
  quoteContent: string;
  setQuoteContent: (c: string) => void;
  quoteAuthor: string;
  setQuoteAuthor: (a: string) => void;
  
  // Inline Editor
  inlineEditingId: string | null;
  setInlineEditingId: (id: string | null) => void;
  inlineTitle: string;
  setInlineTitle: (t: string) => void;
  inlineContent: string;
  setInlineContent: (c: string) => void;
  inlineCues: string;
  setInlineCues: (c: string) => void;
  inlineSummary: string;
  setInlineSummary: (s: string) => void;
  
  // Refs for auto-save (stored in state to persist across renders)
  _noteModalOpenRef: boolean;
  _editingNoteIdRef: string | null;
  _noteFieldsRef: { title: string; content: string; cues: string; summary: string };
  
  configure: (c: NotesCallbacks) => void;
  init: () => () => void;
  loadData: () => Promise<void>;
  
  // Actions
  startInlineEdit: (note: Note) => void;
  handleCardClick: (note: Note) => void;
  handleSaveInlineNote: (id: string) => Promise<void>;
  handleOpenNoteModal: (note?: Note) => void;
  handleSaveNote: () => Promise<void>;
  handleDeleteNote: (id: string) => Promise<void>;
  handleSaveQuote: () => Promise<void>;
  handleDeleteQuote: (index: number) => Promise<void>;
  handleSetDayScore: (dateKey: string, score: number) => Promise<void>;
  autoSaveNote: () => Promise<void>;
}

export const useNotesState = create<NotesState>()((set, get) => ({
  // Data
  notes: [],
  quotes: [],
  dayScores: {},
  
  // UI
  filterType: "all",
  setFilterType: (f) => set({ filterType: f }),
  isGraphModalOpen: false,
  setIsGraphModalOpen: (v) => set({ isGraphModalOpen: v }),
  
  // Note Modal
  isNoteModalOpen: false,
  setIsNoteModalOpen: (v) => set({ isNoteModalOpen: v }),
  editingNoteId: null,
  setEditingNoteId: (id) => set({ editingNoteId: id }),
  noteTitle: "",
  setNoteTitle: (t) => set({ noteTitle: t }),
  noteContent: "",
  setNoteContent: (c) => set({ noteContent: c }),
  noteType: "note",
  setNoteType: (t) => set({ noteType: t }),
  noteCues: "",
  setNoteCues: (c) => set({ noteCues: c }),
  noteSummary: "",
  setNoteSummary: (s) => set({ noteSummary: s }),
  noteSaveStatus: false,
  setNoteSaveStatus: (v) => set({ noteSaveStatus: v }),
  
  // Quote Modal
  isQuoteModalOpen: false,
  setIsQuoteModalOpen: (v) => set({ isQuoteModalOpen: v }),
  quoteContent: "",
  setQuoteContent: (c) => set({ quoteContent: c }),
  quoteAuthor: "",
  setQuoteAuthor: (a) => set({ quoteAuthor: a }),
  
  // Inline Editor
  inlineEditingId: null,
  setInlineEditingId: (id) => set({ inlineEditingId: id }),
  inlineTitle: "",
  setInlineTitle: (t) => set({ inlineTitle: t }),
  inlineContent: "",
  setInlineContent: (c) => set({ inlineContent: c }),
  inlineCues: "",
  setInlineCues: (c) => set({ inlineCues: c }),
  inlineSummary: "",
  setInlineSummary: (s) => set({ inlineSummary: s }),
  
  // Refs
  _noteModalOpenRef: false,
  _editingNoteIdRef: null,
  _noteFieldsRef: { title: "", content: "", cues: "", summary: "" },
  
  configure: (c) => {
    cb = c;
  },
  
  init: () => {
    const flush = () => {
      if (document.visibilityState === "hidden") {
        get().autoSaveNote();
      }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  },
  
  loadData: async () => {
    const [loadedNotes, loadedQuotes, loadedScores] = await Promise.all([
      new Promise<Note[]>((r) => chrome.storage.local.get([NOTES_KEY], (res) => r((res[NOTES_KEY] as Note[]) || []))),
      new Promise<CustomQuote[]>((r) => chrome.storage.local.get([QUOTES_KEY], (res) => r((res[QUOTES_KEY] as CustomQuote[]) || []))),
      new Promise<DayScores>((r) => chrome.storage.local.get([SYNC_DAY_SCORES], (res) => r((res[SYNC_DAY_SCORES] as DayScores) || {}))),
    ]);
    
    set({
      notes: loadedNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      quotes: loadedQuotes,
      dayScores: loadedScores,
    });
  },
  
  // Auto-save
  autoSaveNote: async () => {
    const { _noteModalOpenRef, _editingNoteIdRef, _noteFieldsRef, noteType } = get();
    if (!_noteModalOpenRef) {
      return;
    }
    const { title, content, cues, summary } = _noteFieldsRef;
    if (!title.trim() && !content.trim() && !cues.trim() && !summary.trim()) {
      return;
    }
    
    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.local.get([NOTES_KEY], (res) => r((res[NOTES_KEY] as Note[]) || [])),
    );
    
    const id = _editingNoteIdRef;
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
      set({ editingNoteId: newId, _editingNoteIdRef: newId });
    }
    
    await new Promise<void>((r) => chrome.storage.local.set({ [NOTES_KEY]: currentNotes }, r));
    
    set({
      notes: currentNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      noteSaveStatus: true,
    });
    setTimeout(() => set({ noteSaveStatus: false }), 2000);
  },
  
  // Actions
  startInlineEdit: (note) => {
    set({
      inlineEditingId: note.id,
      inlineTitle: note.title,
      inlineContent: note.content,
      inlineCues: note.cues || "",
      inlineSummary: note.summary || "",
    });
  },
  
  handleCardClick: (note) => {
    const { inlineEditingId, clickTimerRef } = get();
    if (inlineEditingId === note.id) {
      return;
    }
    // We can't use useRef in store, so we handle click timer differently
    // The facade will handle click timing
    get().startInlineEdit(note);
  },
  
  handleSaveInlineNote: async (id) => {
    const { inlineTitle, inlineContent, inlineCues, inlineSummary } = get();
    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.local.get([NOTES_KEY], (res) => r((res[NOTES_KEY] as Note[]) || [])),
    );
    const idx = currentNotes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      currentNotes[idx].title = inlineTitle;
      currentNotes[idx].content = inlineContent;
      currentNotes[idx].cues = inlineCues;
      currentNotes[idx].summary = inlineSummary;
      currentNotes[idx].createdAt = new Date().toISOString();
      await new Promise<void>((r) => chrome.storage.local.set({ [NOTES_KEY]: currentNotes }, r));
      set({ inlineEditingId: null });
      get().loadData();
    }
  },
  
  handleOpenNoteModal: (note?: Note) => {
    if (note) {
      set({
        editingNoteId: note.id,
        noteTitle: note.title,
        noteContent: note.content,
        noteType: note.type || "note",
        noteCues: note.cues || "",
        noteSummary: note.summary || "",
        _editingNoteIdRef: note.id,
        _noteFieldsRef: {
          title: note.title,
          content: note.content,
          cues: note.cues || "",
          summary: note.summary || "",
        },
      });
    } else {
      set({
        editingNoteId: null,
        noteTitle: "",
        noteContent: "",
        noteType: "note",
        noteCues: "",
        noteSummary: "",
        _editingNoteIdRef: null,
        _noteFieldsRef: { title: "", content: "", cues: "", summary: "" },
      });
    }
    set({ isNoteModalOpen: true, _noteModalOpenRef: true });
  },
  
  handleSaveNote: async () => {
    const { noteTitle, noteContent, noteCues, noteSummary, editingNoteId, noteType } = get();
    if (
      !noteTitle.trim() &&
      !noteContent.trim() &&
      !noteCues.trim() &&
      !noteSummary.trim()
    ) {
      set({ isNoteModalOpen: false, _noteModalOpenRef: false });
      return;
    }
    
    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.local.get([NOTES_KEY], (res) => r((res[NOTES_KEY] as Note[]) || [])),
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
    
    await new Promise<void>((r) => chrome.storage.local.set({ [NOTES_KEY]: currentNotes }, r));
    set({
      isNoteModalOpen: false,
      _noteModalOpenRef: false,
      noteSaveStatus: true,
      editingNoteId: null,
      _editingNoteIdRef: null,
      _noteFieldsRef: { title: "", content: "", cues: "", summary: "" },
    });
    setTimeout(() => set({ noteSaveStatus: false }), 2000);
    get().loadData();
    scheduleCloudBackup();
  },
  
  handleDeleteNote: async (id) => {
    const c = cb;
    if (!c) return;
    const t = getTranslation(c.lang);
    c.onShowConfirm(t.delete_confirm_note, async () => {
      const currentNotes: Note[] = await new Promise((r) =>
        chrome.storage.local.get([NOTES_KEY], (res) => r((res[NOTES_KEY] as Note[]) || [])),
      );
      const filtered = currentNotes.filter((n) => n.id !== id);
      await new Promise<void>((r) => chrome.storage.local.set({ [NOTES_KEY]: filtered }, r));
      get().loadData();
      scheduleCloudBackup();
    });
  },
  
  handleSaveQuote: async () => {
    const { quoteContent, quoteAuthor } = get();
    if (!quoteContent.trim()) {
      set({ isQuoteModalOpen: false });
      return;
    }
    
    const currentQuotes: CustomQuote[] = await new Promise((r) =>
      chrome.storage.local.get([QUOTES_KEY], (res) => r((res[QUOTES_KEY] as CustomQuote[]) || [])),
    );
    currentQuotes.push({
      text: quoteContent.trim(),
      author: quoteAuthor.trim() || undefined,
    });
    
    await new Promise<void>((r) => chrome.storage.local.set({ [QUOTES_KEY]: currentQuotes }, r));
    set({ isQuoteModalOpen: false, quoteContent: "", quoteAuthor: "" });
    get().loadData();
    scheduleCloudBackup();
  },
  
  handleDeleteQuote: async (index) => {
    const c = cb;
    if (!c) return;
    const t = getTranslation(c.lang);
    c.onShowConfirm(t.delete_confirm_quote, async () => {
      const currentQuotes: CustomQuote[] = await new Promise((r) =>
        chrome.storage.local.get([QUOTES_KEY], (res) => r((res[QUOTES_KEY] as CustomQuote[]) || [])),
      );
      currentQuotes.splice(index, 1);
      await new Promise<void>((r) => chrome.storage.local.set({ [QUOTES_KEY]: currentQuotes }, r));
      get().loadData();
      scheduleCloudBackup();
    });
  },
  
  handleSetDayScore: async (dateKey, score) => {
    const currentScores: DayScores = await new Promise((r) =>
      chrome.storage.local.get([SYNC_DAY_SCORES], (res) => r((res[SYNC_DAY_SCORES] as DayScores) || {})),
    );
    const next: DayScores = { ...currentScores };
    if (score <= 0) {
      delete next[dateKey];
    } else {
      next[dateKey] = score;
    }
    await new Promise<void>((r) => chrome.storage.local.set({ [SYNC_DAY_SCORES]: next }, r));
    set({ dayScores: next });
    scheduleCloudBackup();
  },
}));

// Auto-save effect: modal open + field changes -> debounced save
// This runs in store context via subscribe
useNotesState.subscribe((state, prev) => {
  if (
    state.isNoteModalOpen &&
    (state.noteTitle !== prev.noteTitle ||
      state.noteContent !== prev.noteContent ||
      state.noteCues !== prev.noteCues ||
      state.noteSummary !== prev.noteSummary)
  ) {
    // Update refs
    useNotesState.setState({
      _noteFieldsRef: {
        title: state.noteTitle,
        content: state.noteContent,
        cues: state.noteCues,
        summary: state.noteSummary,
      },
    });
    // Debounced auto-save
    setTimeout(() => {
      const s = useNotesState.getState();
      if (s.isNoteModalOpen) {
        s.autoSaveNote();
      }
    }, 1200);
  }
});