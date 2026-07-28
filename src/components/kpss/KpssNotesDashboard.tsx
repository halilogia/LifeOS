/**
 * KpssNotesDashboard.tsx
 * KPSS Ders Notları paneli (Obsidian Studio Çift Bölmeli Not Düzenleyici).
 * Clean Architecture & Obsidian Style Split-View Editor.
 */

import { useState, useEffect } from "preact/hooks";
import { Note, Language } from "@/types/types.js";
import { renderMarkdown } from "@/utils/markdownRenderer.js";

interface KpssNotesDashboardProps {
  lang: Language;
}

export function KpssNotesDashboard({ lang }: KpssNotesDashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Active Note Editor States
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorSubject, setEditorSubject] = useState("tarih");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const loadedNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );
    const sorted = loadedNotes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setNotes(sorted);

    // Auto select first note if available
    if (sorted.length > 0 && !selectedNoteId) {
      selectNote(sorted[0]);
    }
  };

  const selectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setEditorTitle(note.title);
    setEditorContent(note.content);

    // Extract subject tag if present (#kpss/tarih, #kpss/cografya etc.)
    const tagMatch = note.content.match(/#kpss\/(tarih|cografya|vatandaslik|turkce|matematik)/i);
    if (tagMatch) {
      setEditorSubject(tagMatch[1].toLowerCase());
    }
  };

  const handleCreateNewNote = async () => {
    const defaultTag = selectedSubjectFilter === "all" ? "tarih" : selectedSubjectFilter;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: lang === "tr" ? "Yeni Ders Notu" : "New Study Note",
      content: `#kpss/${defaultTag}\n\n# ${lang === "tr" ? "Yeni Not Başlığı" : "New Note Title"}\n\nDers notlarınızı [[İç Bağlantı]] ve Markdown formatında buraya ekleyin...`,
      createdAt: new Date().toISOString(),
      type: "note",
    };

    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );

    currentNotes.unshift(newNote);
    await new Promise<void>((r) => chrome.storage.sync.set({ notes: currentNotes }, r));

    setNotes(currentNotes);
    selectNote(newNote);
  };

  const handleSaveEditor = async () => {
    if (!selectedNoteId) return;

    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );

    const idx = currentNotes.findIndex((n) => n.id === selectedNoteId);
    if (idx !== -1) {
      currentNotes[idx] = {
        ...currentNotes[idx],
        title: editorTitle.trim() || (lang === "tr" ? "Başlıksız Not" : "Untitled Note"),
        content: editorContent,
      };

      await new Promise<void>((r) => chrome.storage.sync.set({ notes: currentNotes }, r));
      setNotes([...currentNotes]);
    }
  };

  const handleDeleteSelectedNote = async () => {
    if (!selectedNoteId) return;

    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );

    const filtered = currentNotes.filter((n) => n.id !== selectedNoteId);
    await new Promise<void>((r) => chrome.storage.sync.set({ notes: filtered }, r));

    setNotes(filtered);
    if (filtered.length > 0) {
      selectNote(filtered[0]);
    } else {
      setSelectedNoteId(null);
      setEditorTitle("");
      setEditorContent("");
    }
  };

  // Filter notes tagged with #kpss or containing query/subject
  const kpssNotes = notes.filter((n) => {
    const raw = `${n.title} ${n.content} ${n.cues || ""} ${n.summary || ""}`.toLowerCase();
    const isKpss = raw.includes("kpss") || raw.includes("#kpss");
    if (!isKpss) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (!raw.includes(q)) return false;
    }

    if (selectedSubjectFilter === "all") return true;
    return raw.includes(selectedSubjectFilter);
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
      {/* Obsidian Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(168, 85, 247, 0.2)",
          borderRadius: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f8fafc" }}>
              KPSS Obsidian Ders Notu Stüdyosu
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              [[İç Bağlantı]], #kpss/tarih etiketleri ve canlı Markdown önizleme ile ders çalışın.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNewNote}
          style={{
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(168, 85, 247, 0.3)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>{lang === "tr" ? "Yeni Ders Notu" : "New Note"}</span>
        </button>
      </div>

      {/* Obsidian Split Layout Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "14px",
          minHeight: "520px",
        }}
      >
        {/* Left Sidebar Pane: Search, Folders & Note List */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              placeholder={lang === "tr" ? "Notlarda ara..." : "Search notes..."}
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "8px 10px 8px 30px",
                color: "#ffffff",
                fontSize: "0.78rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              style={{ position: "absolute", left: "10px", top: "10px" }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          {/* Subject Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {[
              { id: "all", label: "Tümü" },
              { id: "tarih", label: "Tarih" },
              { id: "cografya", label: "Coğrafya" },
              { id: "vatandaslik", label: "Vatandaşlık" },
              { id: "turkce", label: "Türkçe" },
              { id: "matematik", label: "Matematik" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedSubjectFilter(f.id)}
                style={{
                  background:
                    selectedSubjectFilter === f.id
                      ? "rgba(168, 85, 247, 0.25)"
                      : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${
                    selectedSubjectFilter === f.id ? "#a855f7" : "rgba(255, 255, 255, 0.06)"
                  }`,
                  color: selectedSubjectFilter === f.id ? "#c084fc" : "#94a3b8",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Note Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", flex: 1, maxHeight: "420px" }}>
            {kpssNotes.length === 0 ? (
              <div style={{ padding: "20px 10px", textAlign: "center", color: "#64748b", fontSize: "0.75rem" }}>
                Kayıtlı KPSS notu bulunamadı.
              </div>
            ) : (
              kpssNotes.map((n) => {
                const isSelected = n.id === selectedNoteId;
                return (
                  <div
                    key={n.id}
                    onClick={() => selectNote(n)}
                    style={{
                      padding: "9px 12px",
                      background: isSelected ? "rgba(168, 85, 247, 0.18)" : "rgba(255, 255, 255, 0.02)",
                      border: `1px solid ${isSelected ? "#a855f7" : "rgba(255, 255, 255, 0.05)"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.78rem", color: isSelected ? "#ffffff" : "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#64748b", display: "flex", justifyContent: "space-between" }}>
                      <span>{new Date(n.createdAt).toLocaleDateString("tr-TR")}</span>
                      <span style={{ color: "#c084fc", fontWeight: 600 }}>#kpss</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Pane: Obsidian Markdown Split Workspace */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {selectedNoteId ? (
            <>
              {/* Workspace Header Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingBottom: "10px",
                }}
              >
                <input
                  type="text"
                  value={editorTitle}
                  onInput={(e) => {
                    setEditorTitle((e.target as HTMLInputElement).value);
                    handleSaveEditor();
                  }}
                  placeholder={lang === "tr" ? "Not Başlığı..." : "Note Title..."}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#ffffff",
                    outline: "none",
                    flex: 1,
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* View Mode Switches */}
                  <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: "6px", padding: "2px" }}>
                    <button
                      type="button"
                      onClick={() => setViewMode("edit")}
                      style={{
                        background: viewMode === "edit" ? "var(--accent-color, #a855f7)" : "transparent",
                        border: "none",
                        color: "white",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {lang === "tr" ? "Kod" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("split")}
                      style={{
                        background: viewMode === "split" ? "var(--accent-color, #a855f7)" : "transparent",
                        border: "none",
                        color: "white",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {lang === "tr" ? "Çift Bölme" : "Split"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      style={{
                        background: viewMode === "preview" ? "var(--accent-color, #a855f7)" : "transparent",
                        border: "none",
                        color: "white",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {lang === "tr" ? "Önizleme" : "Preview"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteSelectedNote}
                    title={lang === "tr" ? "Notu Sil" : "Delete Note"}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      borderRadius: "6px",
                      padding: "4px 8px",
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

              {/* Workspace Content Body (Split / Full View) */}
              <div style={{ display: "grid", gridTemplateColumns: viewMode === "split" ? "1fr 1fr" : "1fr", gap: "14px", flex: 1, minHeight: "420px" }}>
                {(viewMode === "edit" || viewMode === "split") && (
                  <textarea
                    value={editorContent}
                    onInput={(e) => {
                      setEditorContent((e.target as HTMLTextAreaElement).value);
                      handleSaveEditor();
                    }}
                    placeholder="Markdown formatında ders notlarınızı yazın..."
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "400px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "10px",
                      padding: "12px",
                      color: "#f8fafc",
                      fontSize: "0.85rem",
                      fontFamily: "monospace",
                      lineHeight: 1.6,
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box",
                    }}
                  />
                )}

                {(viewMode === "preview" || viewMode === "split") && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "400px",
                      background: "rgba(15, 23, 42, 0.4)",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      borderRadius: "10px",
                      padding: "14px",
                      overflowY: "auto",
                      color: "#f1f5f9",
                      fontSize: "0.85rem",
                      lineHeight: 1.65,
                      boxSizing: "border-box",
                    }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(editorContent) }}
                  />
                )}
              </div>
            </>
          ) : (
            <div style={{ margin: "auto", textAlign: "center", color: "#64748b" }}>
              Sol menüden bir ders notu seçin veya "+ Yeni Ders Notu" butonuna tıklayın.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
