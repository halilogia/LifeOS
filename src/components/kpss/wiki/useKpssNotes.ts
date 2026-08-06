/**
 * useKpssNotes.ts
 * State + CRUD mantığı hook'u — KpssNotesDashboard'ın "tuval" state'ini yönetir.
 * Storage erişimi kpssWikiService üzerinden yapılır (components → service katmanı).
 */

import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import {
  KpssWikiNote,
  getKpssWikiNotes,
  saveKpssWikiNotes,
  getAutoTitleSetting,
  extractTitleFromContent,
} from "@/services/kpss/kpssWikiService.js";

export type KpssSubject =
  "tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik";

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
  selectNote: (note: KpssWikiNote) => void;
  handleCreateNewNote: () => Promise<void>;
  handleAddChildNote: (parent: KpssWikiNote) => Promise<void>;
  handleReparentNote: (
    childId: string,
    newParentId: string | null,
  ) => Promise<void>;
  handleSaveArticle: () => Promise<void>;
  handleDeleteArticle: () => Promise<void>;
  handleDownloadMarkdown: () => void;
  handleWikilinkClick: (e: MouseEvent) => void;
}

export function useKpssNotes(
  _t: Record<string, string>,
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
  // Otomatik kayıt için gerekli ref'ler (debounce timer + en son değerler)
  const autoSaveTimer = useRef<number | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const selectedNoteIdRef = useRef(selectedNoteId);
  selectedNoteIdRef.current = selectedNoteId;
  const editorRef = useRef({ title: "", subject: editorSubject, content: "" });
  editorRef.current = {
    title: editorTitle,
    subject: editorSubject,
    content: editorContent,
  };

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

  const handleReparentNote = async (
    childId: string,
    newParentId: string | null,
  ) => {
    if (!childId || newParentId === childId) {
      return;
    }
    // Döngü koruması: yeni parent, child'ın kendisi veya bir alt notu olamaz
    // (kök düzleme bırakma — newParentId null — bu kontrolden geçer)
    if (newParentId) {
      const isDescendant = (ancestorId: string, targetId: string): boolean => {
        const parentMap = new Map<string, string>();
        notes.forEach((n) => {
          if (n.parentId) {
            parentMap.set(n.id, n.parentId);
          }
        });
        let cur = targetId;
        while (cur) {
          const p = parentMap.get(cur);
          if (!p) {
            return false;
          }
          if (p === ancestorId) {
            return true;
          }
          cur = p;
        }
        return false;
      };
      if (isDescendant(childId, newParentId)) {
        return;
      }
    }

    const updated = notes.map((n) =>
      n.id === childId
        ? { ...n, parentId: newParentId, updatedAt: new Date().toISOString() }
        : n,
    );
    await saveKpssWikiNotes(updated);
    setNotes(updated);
  };

  const persistArticle = useCallback(
    async (opts?: { silent?: boolean }) => {
      const id = selectedNoteIdRef.current;
      if (!id) {
        return;
      }
      const { title, subject, content } = editorRef.current;
      let finalTitle = title.trim();

      // If auto title is enabled AND user left title empty, extract ONLY the first word
      if (autoTitleEnabled && !finalTitle && content) {
        finalTitle = extractTitleFromContent(content);
      }

      // Boş başlığı "Başlıksız Ders Notu" ile doldurma — boş kalsın
      if (!finalTitle) {
        finalTitle = "";
      }

      const updatedNotes = notesRef.current.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            title: finalTitle,
            subject,
            content,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });

      await saveKpssWikiNotes(updatedNotes);
      setNotes(updatedNotes);
      if (finalTitle !== editorRef.current.title) {
        setEditorTitle(finalTitle);
      }
      if (!opts?.silent) {
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2000);
      }
    },
    [autoTitleEnabled],
  );

  const handleSaveArticle = useCallback(async () => {
    await persistArticle();
  }, [persistArticle]);

  // Otomatik kaydetme: editör değerleri değişince 1.5s bekleyip kaydet
  useEffect(() => {
    if (autoSaveTimer.current !== null) {
      window.clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = window.setTimeout(() => {
      void persistArticle({ silent: true });
    }, 1500);
    return () => {
      if (autoSaveTimer.current !== null) {
        window.clearTimeout(autoSaveTimer.current);
      }
    };
  }, [editorTitle, editorSubject, editorContent, persistArticle]);

  // Sayfa gizlendiğinde / sekme değiştirilirken beklemeden anında kaydet.
  // Bu, kullanıcı direkt "Kaydet"e basmadan başka sekmeye geçip / sayfa
  // açılıp ders notlarına geri döndüğünde 1.5s debounce beklemeden kaybı önler.
  useEffect(() => {
    const flushOnHide = () => {
      if (document.visibilityState === "hidden") {
        void persistArticle({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", flushOnHide);
    window.addEventListener("pagehide", flushOnHide);
    return () => {
      document.removeEventListener("visibilitychange", flushOnHide);
      window.removeEventListener("pagehide", flushOnHide);
    };
  }, [persistArticle]);

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
    selectNote,
    handleCreateNewNote,
    handleAddChildNote,
    handleReparentNote,
    handleSaveArticle,
    handleDeleteArticle,
    handleDownloadMarkdown,
    handleWikilinkClick,
  };
}
