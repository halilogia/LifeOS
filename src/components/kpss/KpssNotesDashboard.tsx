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
  t: Record<string, string>;
}

export function KpssNotesDashboard({ lang, t }: KpssNotesDashboardProps) {
  const [notes, setNotes] = useState<KpssWikiNote[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoTitleEnabled, setAutoTitleEnabled] = useState<boolean>(false);
  const [showGraphModal, setShowGraphModal] = useState<boolean>(false);
  const [showInfoboxHelp, setShowInfoboxHelp] = useState<boolean>(false);

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
    if (!selectedNoteId) {return;}

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
    if (!selectedNoteId) {return;}

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
    if (!selectedNote) {return;}
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
    if (selectedSubjectFilter !== "all" && n.subject !== selectedSubjectFilter) {return false;}
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
          t={t}
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
                    title={t.kpss_notes_download_md}
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
                    title={t.kpss_notes_knowledge_graph}
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
                    title={t.kpss_notes_delete}
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
                  t={t}
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

      {/* Infobox Help Guide Modal Popup */}
      {showInfoboxHelp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setShowInfoboxHelp(false)}
        >
          <div
            style={{
              background: "#0f172a",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "14px",
              padding: "24px",
              maxWidth: "460px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              color: "#f1f5f9",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: "#38bdf8", fontSize: "1.05rem", fontWeight: 800 }}>
                ℹ️ Dinamik Bilgi Kutusu Nasıl Çalışır?
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoboxHelp(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.84rem", lineHeight: 1.6 }}>
              <div>
                <strong style={{ color: "#60a5fa" }}>🖼️ 1. Kapak Görseli:</strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  Notunuza yapıştırdığınız resim adresi (örneğin Google Görsel linki) metin içinden gizlenir ve otomatik olarak Bilgi Kutusu'nun en üstüne yerleştirilir. 2. ve 3. görseller metin içinde kalır.
                </p>
              </div>

              <div>
                <strong style={{ color: "#60a5fa" }}>📌 2. Dinamik Özet Satırları:</strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  Notunuzda <code>Başlık : Açıklama</code> (örneğin <code>Zeytin : Akdeniz ikliminin en net kanıtıdır</code>) formatında yazdığınız tanımlar otomatik taranıp Bilgi Kutusu'na özet olarak çekilir.
                </p>
              </div>

              <div>
                <strong style={{ color: "#60a5fa" }}>🔗 3. Gelen Bağlantılar (Backlinks):</strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  Diğer notlarda bu notun adı geçtiğinde otomatik bağlantı kurulur ve kutunun altında listelenir.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoboxHelp(false)}
              style={{
                marginTop: "18px",
                width: "100%",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                border: "none",
                color: "white",
                padding: "9px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
