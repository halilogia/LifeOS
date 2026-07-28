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
  getAutoTitleSetting,
  extractTitleFromContent,
  extractHeadings,
} from "@/services/kpssWikiService.js";
import { KpssWikiSidebar } from "@/components/kpss/KpssWikiSidebar.js";
import { KpssWikiReader } from "@/components/kpss/KpssWikiReader.js";
import { KpssWikiEditor } from "@/components/kpss/KpssWikiEditor.js";
import { ZettelkastenGraphModal } from "@/components/notes/ZettelkastenGraphModal.js";

interface KpssNotesDashboardProps {
  lang: Language;
}

export function KpssNotesDashboard({ lang }: KpssNotesDashboardProps) {
  const [notes, setNotes] = useState<KpssWikiNote[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoTitleEnabled, setAutoTitleEnabled] = useState<boolean>(false);
  const [showGraphModal, setShowGraphModal] = useState<boolean>(false);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"read" | "edit">("read");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorSubject, setEditorSubject] = useState<"tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik">("tarih");
  const [editorContent, setEditorContent] = useState("");
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    loadNotes();
    loadSettings();
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

    // If auto title is enabled AND user left title empty, extract ONLY the first word
    if (autoTitleEnabled && !finalTitle && editorContent) {
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

  const handleDownloadMarkdown = () => {
    if (!selectedNote) return;
    const filename = `${(selectedNote.title || "Ders-Notu").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, "_")}.md`;
    const blob = new Blob([selectedNote.content], { type: "text/markdown;charset=utf-8" });
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
      {/* Main Grid Layout (Expanded height & width, top header removed for extra space) */}
      <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: "16px", minHeight: "680px" }}>
        <KpssWikiSidebar
          lang={lang}
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          searchQuery={searchQuery}
          selectedSubjectFilter={selectedSubjectFilter}
          onSearchChange={setSearchQuery}
          onFilterChange={setSelectedSubjectFilter}
          onSelectNote={selectNote}
          onCreateNewNote={handleCreateNewNote}
        />

        <div
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {selectedNote ? (
            <>
              {/* Wikipedia Header Tab Toolbar: Mode switch + Export Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                  paddingBottom: "8px",
                  marginBottom: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setViewMode("read")}
                    style={{
                      background: "none",
                      border: "none",
                      color: viewMode === "read" ? "#ffffff" : "#94a3b8",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: viewMode === "read" ? 700 : 500,
                      borderBottom: viewMode === "read" ? "2px solid #ffffff" : "2px solid transparent",
                      paddingBottom: "8px",
                      marginBottom: "-9px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Oku
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("edit")}
                    style={{
                      background: "none",
                      border: "none",
                      color: viewMode === "edit" ? "#ffffff" : "#94a3b8",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: viewMode === "edit" ? 700 : 500,
                      borderBottom: viewMode === "edit" ? "2px solid #ffffff" : "2px solid transparent",
                      paddingBottom: "8px",
                      marginBottom: "-9px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Değiştir
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Export Action: Download Markdown */}
                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    title={lang === "tr" ? "Markdown (.md) Olarak İndir" : "Download as Markdown"}
                    style={{
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      color: "#60a5fa",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>.md İndir</span>
                  </button>

                  {/* Icon-Only Neural Graph Button */}
                  <button
                    type="button"
                    onClick={() => setShowGraphModal(true)}
                    title={lang === "tr" ? "Wikiağ / Nöral Harita" : "Knowledge Graph"}
                    style={{
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "1px solid rgba(56, 189, 248, 0.35)",
                      color: "#38bdf8",
                      borderRadius: "6px",
                      padding: "5px 9px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="6" cy="6" r="3"></circle>
                      <circle cx="18" cy="6" r="3"></circle>
                      <circle cx="12" cy="18" r="3"></circle>
                      <line x1="8.5" y1="7.5" x2="15.5" y2="7.5"></line>
                      <line x1="7.5" y1="8.5" x2="10.5" y2="15.5"></line>
                      <line x1="16.5" y1="8.5" x2="13.5" y2="15.5"></line>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteArticle}
                    title={lang === "tr" ? "Notu Sil" : "Delete Note"}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      borderRadius: "6px",
                      padding: "5px 9px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Zettelkasten Interactive 2D Neural Graph Modal */}
      {showGraphModal && (
        <ZettelkastenGraphModal
          notes={notes as any}
          onClose={() => setShowGraphModal(false)}
          onSelectNote={(n) => {
            selectNote(n as any);
            setShowGraphModal(false);
          }}
        />
      )}
    </div>
  );
}
