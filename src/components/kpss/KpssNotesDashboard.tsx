/**
 * KpssNotesDashboard.tsx
 * KPSS Ders Notları paneli (Obsidian Zettelkasten Entegrasyonu).
 * KPSS etiketli (#kpss/tarih, #kpss/cografya vb.) notları süzme, sıralama ve yeni ders notu oluşturma ekranı.
 */

import { useState, useEffect } from "preact/hooks";
import { Note, Language } from "@/types/types.js";
import { NoteCard } from "@/components/notes/NoteCard.js";
import { NoteEditorModal, NoteType } from "@/components/notes/NoteEditorModal.js";
import { ZettelkastenGraphModal } from "@/components/notes/ZettelkastenGraphModal.js";
import { renderMarkdown } from "@/utils/markdownRenderer.js";

interface KpssNotesDashboardProps {
  lang: Language;
}

export function KpssNotesDashboard({ lang }: KpssNotesDashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  // Note Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("cornell");
  const [noteCues, setNoteCues] = useState("");
  const [noteSummary, setNoteSummary] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const loadedNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );
    setNotes(
      loadedNotes.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  };

  const handleOpenModal = (note?: Note, defaultTag = "#kpss/tarih") => {
    if (note) {
      setEditingNoteId(note.id);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteType(note.type || "cornell");
      setNoteCues(note.cues || "");
      setNoteSummary(note.summary || "");
    } else {
      setEditingNoteId(null);
      setNoteTitle("");
      setNoteContent(`\n\n${defaultTag}`);
      setNoteType("cornell");
      setNoteCues("");
      setNoteSummary("");
    }
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );

    if (editingNoteId) {
      const idx = currentNotes.findIndex((n) => n.id === editingNoteId);
      if (idx !== -1) {
        currentNotes[idx] = {
          ...currentNotes[idx],
          title: noteTitle.trim() || (lang === "tr" ? "Başlıksız Not" : "Untitled Note"),
          content: noteContent,
          type: noteType,
          cues: noteCues,
          summary: noteSummary,
        };
      }
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: noteTitle.trim() || (lang === "tr" ? "Yeni KPSS Notu" : "New KPSS Note"),
        content: noteContent,
        createdAt: new Date().toISOString(),
        type: noteType,
        cues: noteCues,
        summary: noteSummary,
      };
      currentNotes.unshift(newNote);
    }

    await new Promise<void>((r) =>
      chrome.storage.sync.set({ notes: currentNotes }, r),
    );

    setIsNoteModalOpen(false);
    loadNotes();
  };

  const handleDeleteNote = async (e: MouseEvent | undefined, id: string) => {
    if (e) e.stopPropagation();
    const currentNotes: Note[] = await new Promise((r) =>
      chrome.storage.sync.get(["notes"], (res) => r((res.notes as Note[]) || [])),
    );
    const updated = currentNotes.filter((n) => n.id !== id);
    await new Promise<void>((r) =>
      chrome.storage.sync.set({ notes: updated }, r),
    );
    loadNotes();
  };

  // Filter notes tagged with #kpss or matching subject filter
  const kpssNotes = notes.filter((n) => {
    const raw = `${n.title} ${n.content} ${n.cues} ${n.summary}`.toLowerCase();
    const isKpss = raw.includes("kpss");
    if (!isKpss) return false;

    if (selectedSubjectFilter === "all") return true;
    return raw.includes(selectedSubjectFilter);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
      {/* Header & Controls Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          background: "rgba(15, 23, 42, 0.5)",
          padding: "14px 18px",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3rem" }}>📚</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f8fafc" }}>
              KPSS Obsidian Zettelkasten Ders Notları
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Ders notlarınızı [[bağlantı]] ve #kpss/tarih etiketleriyle interaktif olarak düzenleyin.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="stock-btn"
            onClick={() => setIsGraphModalOpen(true)}
            style={{
              background: "rgba(168, 85, 247, 0.2)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#c084fc",
              padding: "8px 14px",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            🕸️ Düşünce Ağı (Graph View)
          </button>
          <button
            type="button"
            className="stock-btn stock-btn-primary"
            onClick={() => handleOpenModal(undefined, `#kpss/${selectedSubjectFilter === "all" ? "tarih" : selectedSubjectFilter}`)}
            style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600 }}
          >
            + Yeni KPSS Notu
          </button>
        </div>
      </div>

      {/* Subject Filter Chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "Tüm KPSS Notları" },
          { id: "tarih", label: "🟣 Tarih" },
          { id: "cografya", label: "🟢 Coğrafya" },
          { id: "vatandaslik", label: "🔵 Vatandaşlık" },
          { id: "turkce", label: "🟠 Türkçe" },
          { id: "matematik", label: "🔴 Matematik" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip-btn ${selectedSubjectFilter === f.id ? "active" : ""}`}
            style={{
              background:
                selectedSubjectFilter === f.id
                  ? "rgba(168, 85, 247, 0.25)"
                  : "rgba(255, 255, 255, 0.04)",
              borderColor:
                selectedSubjectFilter === f.id
                  ? "var(--accent-color, #a855f7)"
                  : "rgba(255, 255, 255, 0.08)",
              color: selectedSubjectFilter === f.id ? "#c084fc" : "#94a3b8",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
            onClick={() => setSelectedSubjectFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* KPSS Notes Grid */}
      {kpssNotes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 16px",
            background: "rgba(15, 23, 42, 0.3)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            color: "#94a3b8",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✍️</div>
          <p style={{ margin: 0, fontWeight: 600 }}>Henüz KPSS ders notu eklenmemiş.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
            "+ Yeni KPSS Notu" butonuna basarak ilk #kpss/tarih notunuzu ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {kpssNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              lang={lang}
              isInlineEditing={false}
              inlineTitle=""
              inlineContent=""
              inlineCues=""
              inlineSummary=""
              onCardClick={() => handleOpenModal(note)}
              onSaveInlineNote={() => {}}
              onCancelInlineEdit={() => {}}
              onDeleteNote={handleDeleteNote}
              setInlineTitle={() => {}}
              setInlineContent={() => {}}
              setInlineCues={() => {}}
              setInlineSummary={() => {}}
              renderMarkdown={renderMarkdown}
            />
          ))}
        </div>
      )}

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNoteModalOpen}
        lang={lang}
        noteType={noteType}
        noteTitle={noteTitle}
        noteContent={noteContent}
        noteCues={noteCues}
        noteSummary={noteSummary}
        notesPlaceholder="Örn: Amasya Genelgesi Maddeleri ve Önemi"
        notesContentPlaceholder="Ders notlarınızı, [[İç Bağlantı]] ve #kpss/tarih etiketlerinizi buraya yazın..."
        availableNotes={notes}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteTypeChange={setNoteType}
        onNoteTitleChange={setNoteTitle}
        onNoteContentChange={setNoteContent}
        onNoteCuesChange={setNoteCues}
        onNoteSummaryChange={setNoteSummary}
        onSave={handleSaveNote}
      />

      {/* Zettelkasten 2D Graph View Modal */}
      {isGraphModalOpen && (
        <ZettelkastenGraphModal
          notes={notes}
          onClose={() => setIsGraphModalOpen(false)}
          onSelectNote={(note) => handleOpenModal(note)}
        />
      )}
    </div>
  );
}
