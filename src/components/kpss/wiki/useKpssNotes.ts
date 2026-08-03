/**
 * useKpssNotes.ts
 * State + CRUD mantığı hook'u — KpssNotesDashboard'ın "tuval" state'ini yönetir.
 * Storage erişimi kpssWikiService üzerinden yapılır (components → service katmanı).
 */

import { useState, useEffect } from "preact/hooks";
import {
  KpssWikiNote,
  HeadingItem,
  getKpssWikiNotes,
  saveKpssWikiNotes,
  getAutoTitleSetting,
  extractTitleFromContent,
  extractHeadings,
} from "@/services/kpss/kpssWikiService.js";

export type KpssSubject =
  | "tarih"
  | "cografya"
  | "vatandaslik"
  | "turkce"
  | "matematik";

export interface UseKpssNotesResult {
  notes: KpssWikiNote[];
  setNotes: (notes: KpssWikiNote[]) => void;
  selectedNoteId: string | null;
  viewMode: "read" | "edit";
  setViewMode: (mode: "read" | "edit") => void;
  editorTitle: string;
  setEditorTitle: (title: string) => void;
  editorSubject: KpssSubject;
  setEditorSubject: (subject: KpssSubject) => void;
  editorContent: string;
  setEditorContent: (content: string) => void;
  saveStatus: boolean;
  selectedNote: KpssWikiNote | undefined;
  tableOfContents: HeadingItem[];
  selectNote: (note: KpssWikiNote) => void;
  handleCreateNewNote: () => Promise<void>;
  handleAddChildNote: (parent: KpssWikiNote) => Promise<void>;
  handleSaveArticle: () => Promise<void>;
  handleDeleteArticle: () => Promise<void>;
  handleDownloadMarkdown: () => void;
  handleWikilinkClick: (e: MouseEvent) => void;
}

export function useKpssNotes(
  t: Record<string, string>,
  subjectFilter: string,
): UseKpssNotesResult {
  const [notes, setNotes] = useState<KpssWikiNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"read" | "edit">("read");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorSubject, setEditorSubject] = useState<KpssSubject>("tarih");
  const [editorContent, setEditorContent] = useState("");
  const [saveStatus, setSaveStatus] = useState(false);
  const [autoTitleEnabled, setAutoTitleEnabled] = useState(false);

  useEffect(() => {
    void loadNotes();
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    const enabled = await getAutoTitleSetting();
    setAutoTitleEnabled(enabled);
  };

  const loadNotes = async () => {
    const loaded = await getKpssWikiNotes();
    setNotes(loaded);
    if (loaded.length > 0) {
      selectNote(loaded[0]);
    } else {
      setSelectedNoteId(null);
      setEditorTitle("");
      setEditorContent("");
    }
  };

  const selectNote = (note: KpssWikiNote) => {
    setSelectedNoteId(note.id);
    setEditorTitle(note.title || "");
    setEditorSubject((note.subject as KpssSubject) || "tarih");
    setEditorContent(note.content || "");
    setViewMode("read");
  };

  const handleCreateNewNote = async () => {
    const subjectTag: KpssSubject =
      subjectFilter === "all" ? "tarih" : (subjectFilter as KpssSubject);
    const newNote: KpssWikiNote = {
      id: `note-${Date.now()}`,
      title: "",
      subject: subjectTag,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    await saveKpssWikiNotes(updated);

    setNotes(updated);
    setSelectedNoteId(newNote.id);
    setEditorTitle("");
    setEditorSubject(subjectTag);
    setEditorContent("");
    setViewMode("edit");
  };

  const handleAddChildNote = async (parent: KpssWikiNote) => {
    const childNote: KpssWikiNote = {
      id: `note-${Date.now()}`,
      title: "",
      subject: parent.subject,
      content: "",
      parentId: parent.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [childNote, ...notes];
    await saveKpssWikiNotes(updated);
    setNotes(updated);
    setSelectedNoteId(childNote.id);
    setEditorTitle("");
    setEditorSubject((parent.subject as KpssSubject) || "tarih");
    setEditorContent("");
    setViewMode("edit");
  };

  const handleSaveArticle = async () => {
    if (!selectedNoteId) {
      return;
    }

    let finalTitle = editorTitle.trim();

    // If auto title is enabled AND user left title empty, extract ONLY the first word
    if (autoTitleEnabled && !finalTitle && editorContent) {
      finalTitle = extractTitleFromContent(editorContent);
    }

    if (!finalTitle) {
      finalTitle = t.kpss_notes_untitled;
    }

    const updatedNotes = notes.map((n) => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: finalTitle,
          subject: editorSubject,
          content: editorContent,
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });

    await saveKpssWikiNotes(updatedNotes);
    setNotes(updatedNotes);
    setEditorTitle(finalTitle);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleDeleteArticle = async () => {
    if (!selectedNoteId) {
      return;
    }

    const filtered = notes.filter((n) => n.id !== selectedNoteId);
    await saveKpssWikiNotes(filtered);

    setNotes(filtered);
    if (filtered.length > 0) {
      selectNote(filtered[0]);
    } else {
      setSelectedNoteId(null);
      setEditorTitle("");
      setEditorContent("");
    }
  };

  const handleDownloadMarkdown = () => {
    if (!selectedNote) {
      return;
    }
    const filename = `${(selectedNote.title || "Ders-Notu").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, "_")}.md`;
    const blob = new Blob([selectedNote.content], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWikilinkClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-wiki-link]");
    if (target) {
      const rawLink = target.getAttribute("data-wiki-link");
      if (rawLink) {
        const query = rawLink.toLowerCase().trim();
        const found = notes.find((n) => {
          const title = n.title.toLowerCase().trim();
          return (
            title === query || title.includes(query) || query.includes(title)
          );
        });

        if (found) {
          selectNote(found);
        }
      }
    }
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const tableOfContents = selectedNote
    ? extractHeadings(selectedNote.content)
    : [];

  return {
    notes,
    setNotes,
    selectedNoteId,
    viewMode,
    setViewMode,
    editorTitle,
    setEditorTitle,
    editorSubject,
    setEditorSubject,
    editorContent,
    setEditorContent,
    saveStatus,
    selectedNote,
    tableOfContents,
    selectNote,
    handleCreateNewNote,
    handleAddChildNote,
    handleSaveArticle,
    handleDeleteArticle,
    handleDownloadMarkdown,
    handleWikilinkClick,
  };
}
