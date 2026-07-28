/**
 * KpssNotesDashboard.tsx
 * Main Container ("Tuval") for KPSS Ders Notları Stüdyosu.
 * Clean Architecture & SRP compliance: delegating storage and UI rendering to modules.
 */

import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import {
  KpssWikiNote,
  getKpssWikiNotes,
  saveKpssWikiNotes,
  extractTitleFromContent,
  extractHeadings,
} from "@/services/kpssWikiService.js";
import { KpssWikiHeader } from "@/components/kpss/KpssWikiHeader.js";
import { KpssWikiSidebar } from "@/components/kpss/KpssWikiSidebar.js";
import { KpssWikiReader } from "@/components/kpss/KpssWikiReader.js";
import { KpssWikiEditor } from "@/components/kpss/KpssWikiEditor.js";

interface KpssNotesDashboardProps {
  lang: Language;
}

export function KpssNotesDashboard({ lang }: KpssNotesDashboardProps) {
  const [notes, setNotes] = useState<KpssWikiNote[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"read" | "edit">("read");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorSubject, setEditorSubject] = useState<"tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik">("tarih");
  const [editorContent, setEditorContent] = useState("");
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

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
    setEditorTitle(note.title || extractTitleFromContent(note.content) || "");
    setEditorSubject(note.subject || "tarih");
    setEditorContent(note.content || "");
    setViewMode("read");
  };

  const handleCreateNewNote = async () => {
    const subjectTag = (selectedSubjectFilter === "all" ? "tarih" : selectedSubjectFilter) as any;
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

  const handleSaveArticle = async () => {
    if (!selectedNoteId) return;

    let finalTitle = editorTitle.trim();
    if (!finalTitle && editorContent) {
      finalTitle = extractTitleFromContent(editorContent);
    }
    if (!finalTitle) {
      finalTitle = lang === "tr" ? "Başlıksız Ders Notu" : "Untitled Note";
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
    if (!selectedNoteId) return;

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

  const handleWikilinkClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-wiki-link]");
    if (target) {
      const rawLink = target.getAttribute("data-wiki-link");
      if (rawLink) {
        const query = rawLink.toLowerCase().trim();
        const found = notes.find((n) => {
          const t = n.title.toLowerCase().trim();
          return t === query || t.includes(query) || query.includes(t);
        });

        if (found) {
          selectNote(found);
        }
      }
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (selectedSubjectFilter !== "all" && n.subject !== selectedSubjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const tableOfContents = selectedNote ? extractHeadings(selectedNote.content) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
      <KpssWikiHeader lang={lang} onCreateNewNote={handleCreateNewNote} />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "14px", minHeight: "540px" }}>
        <KpssWikiSidebar
          lang={lang}
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          searchQuery={searchQuery}
          selectedSubjectFilter={selectedSubjectFilter}
          onSearchChange={setSearchQuery}
          onFilterChange={setSelectedSubjectFilter}
          onSelectNote={selectNote}
        />

        <div
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {selectedNote ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                  paddingBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#38bdf8", borderBottom: "2px solid #38bdf8", paddingBottom: "10px", marginBottom: "-11px" }}>
                    Ders Notu
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", background: "rgba(0, 0, 0, 0.4)", borderRadius: "6px", padding: "2px" }}>
                    <button
                      type="button"
                      onClick={() => setViewMode("read")}
                      style={{
                        background: viewMode === "read" ? "#2563eb" : "transparent",
                        border: "none",
                        color: "#ffffff",
                        padding: "5px 12px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Oku
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("edit")}
                      style={{
                        background: viewMode === "edit" ? "#2563eb" : "transparent",
                        border: "none",
                        color: "#ffffff",
                        padding: "5px 12px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Değiştir
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteArticle}
                    title={lang === "tr" ? "Notu Sil" : "Delete Note"}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      borderRadius: "6px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {viewMode === "read" ? (
                <KpssWikiReader
                  lang={lang}
                  note={selectedNote}
                  allNotes={notes}
                  tableOfContents={tableOfContents}
                  onWikilinkClick={handleWikilinkClick}
                />
              ) : (
                <KpssWikiEditor
                  lang={lang}
                  editorTitle={editorTitle}
                  editorSubject={editorSubject}
                  editorContent={editorContent}
                  saveStatus={saveStatus}
                  onTitleChange={setEditorTitle}
                  onSubjectChange={setEditorSubject}
                  onContentChange={setEditorContent}
                  onSave={handleSaveArticle}
                />
              )}
            </>
          ) : (
            <div style={{ margin: "auto", textAlign: "center", color: "#64748b" }}>
              Sol menüden bir ders notu seçin veya "Yeni Ders Notu Ekle" butonuna tıklayın.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
