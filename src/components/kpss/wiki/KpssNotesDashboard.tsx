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
} from "@/services/kpss/kpssWikiService.js";
import { KpssWikiSidebar } from "@/components/kpss/wiki/KpssWikiSidebar.js";
import { KpssWikiReader } from "@/components/kpss/wiki/KpssWikiReader.js";
import { KpssWikiEditor } from "@/components/kpss/wiki/KpssWikiEditor.js";
import { ZettelkastenGraphModal } from "@/components/notes/ZettelkastenGraphModal.js";

interface KpssNotesDashboardProps {
  lang: Language;
  t: Record<string, string>;
}

export function KpssNotesDashboard({ lang, t }: KpssNotesDashboardProps) {
  const [notes, setNotes] = useState<KpssWikiNote[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] =
    useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoTitleEnabled, setAutoTitleEnabled] = useState<boolean>(false);
  const [showGraphModal, setShowGraphModal] = useState<boolean>(false);
  const [showInfoboxHelp, setShowInfoboxHelp] = useState<boolean>(false);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"read" | "edit">("read");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorSubject, setEditorSubject] = useState<
    "tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik"
  >("tarih");
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
    const subjectTag = (
      selectedSubjectFilter === "all" ? "tarih" : selectedSubjectFilter
    ) as any;
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
    setEditorSubject(parent.subject);
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
    if (
      selectedSubjectFilter !== "all" &&
      n.subject !== selectedSubjectFilter
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const tableOfContents = selectedNote
    ? extractHeadings(selectedNote.content)
    : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        marginTop: "14px",
      }}
    >
      {/* Başlık + MindVault ikonu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 4px",
        }}
      >
        <img
          src="icons/mindvault.png"
          alt="MindVault"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(124, 58, 237, 0.4)",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#e2e8f0",
            background: "linear-gradient(90deg, #c084fc, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t.kpss_notes_title || "KPSS Ders Notları Stüdyosu"}
        </h2>
      </div>

      {/* Main Grid Layout (Expanded height & width, top header removed for extra space) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "270px 1fr",
          gap: "16px",
          minHeight: "680px",
        }}
      >
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
          onAddChildNote={handleAddChildNote}
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
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
                      borderBottom:
                        viewMode === "read"
                          ? "2px solid #ffffff"
                          : "2px solid transparent",
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
                      borderBottom:
                        viewMode === "edit"
                          ? "2px solid #ffffff"
                          : "2px solid transparent",
                      paddingBottom: "8px",
                      marginBottom: "-9px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Değiştir
                  </button>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {/* Tam Ekran Modu */}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.documentElement;
                      if (document.fullscreenElement) {
                        void document.exitFullscreen();
                      } else {
                        void el.requestFullscreen();
                      }
                    }}
                    title="Tam Ekran"
                    style={{
                      background: "rgba(124, 58, 237, 0.15)",
                      border: "1px solid rgba(124, 58, 237, 0.35)",
                      color: "#c084fc",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                    <span>{t.kpss_notes_open_app || "Tam Ekran"}</span>
                  </button>

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

                  {/* Info Guide Button: KPSS not alma kılavuzu popup'ı */}
                  <button
                    type="button"
                    onClick={() => setShowInfoboxHelp(true)}
                    title={t.kpss_notes_help_title || "KPSS Not Alma Rehberi"}
                    style={{
                      background: "rgba(168, 85, 247, 0.15)",
                      border: "1px solid rgba(168, 85, 247, 0.35)",
                      color: "#c084fc",
                      borderRadius: "6px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    !
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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
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
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
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
            <div
              style={{ margin: "auto", textAlign: "center", color: "#64748b" }}
            >
              Sol menüden bir ders notu seçin veya "Yeni Ders Notu Ekle"
              butonuna tıklayın.
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

      {/* KPSS Not Alma Rehberi Modal Popup */}
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
              border: "1px solid rgba(168, 85, 247, 0.4)",
              borderRadius: "14px",
              padding: "24px",
              maxWidth: "540px",
              width: "92%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              color: "#f1f5f9",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "10px",
                marginBottom: "14px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#c084fc",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                }}
              >
                {t.kpss_notes_help_title || "KPSS Not Alma Rehberi"}
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoboxHelp(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                fontSize: "0.84rem",
                lineHeight: 1.6,
              }}
            >
              <div>
                <strong style={{ color: "#c084fc" }}>
                  1. Ana Başlık → Alt Başlık Yapısı:
                </strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  Önce ana not oluştur (ör.{" "}
                  <code style={{ color: "#a78bfa" }}>Büyük Selçuklu</code>).
                  Notun üzerine gelip{" "}
                  <code style={{ color: "#60a5fa" }}>+</code> butonuyla alt not
                  ekle (ör. <code style={{ color: "#a78bfa" }}>Devlet Teşkilatı</code>).
                  Alt notlara da <code style={{ color: "#60a5fa" }}>+</code> ile
                  devam et — iç içe hiyerarşi oluşur.
                </p>
              </div>

              <div>
                <strong style={{ color: "#c084fc" }}>
                  2. Kısa Metin, Net Bilgi:
                </strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  Her alt başlığa 1-3 cümlelik özet yaz. KPSS'de ezber yerine
                  kavram netliği önemli. Örnek:{" "}
                  <em>
                    "Vezir-i Azam: Büyük Selçuklu'da başkent yönetiminden sorumlu,
                    Nizamülmülk en meşhur örneğidir."
                  </em>
                </p>
              </div>

              <div>
                <strong style={{ color: "#c084fc" }}>
                  3. Tanım Satırları (Bilgi Kutusu):
                </strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  <code style={{ color: "#a78bfa" }}>Terim : Açıklama</code>{" "}
                  formatında yazdığın satırlar notun sağındaki Bilgi Kutusu'na
                  otomatik özet olarak çekilir.
                </p>
              </div>

              <div>
                <strong style={{ color: "#c084fc" }}>
                  4. Notlar Arası Bağlantı (Wikilink):
                </strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  <code style={{ color: "#a78bfa" }}>[[Not Adı]]</code> yazarsan
                  tıklanabilir bağlantı olur. Ağaç butonuyla notlar arası grafik
                  bağlantıları görürsün.
                </p>
              </div>

              <div>
                <strong style={{ color: "#c084fc" }}>
                  5. Başlık Otomatik Doldurma:
                </strong>
                <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                  Başlık boş bırakılırsa ilk satırdan otomatik alınır. Manuel
                  başlık yazarsan ona asla dokunulmaz.
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
