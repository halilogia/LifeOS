/**
 * KpssNotesDashboard.tsx
 * Main Container ("Tuval") for KPSS Ders Notları Stüdyosu.
 * Clean Architecture & SRP compliance: delegating storage and UI rendering to modules.
 * State yönetimi useKpssNotes hook'unda, görsel parçalar alt bileşenlerde.
 */

import { useState, useEffect, useRef, useMemo } from "preact/hooks";
import { Language, Note } from "@/types/types.js";
import {
  KpssWikiNote,
  saveKpssWikiNotes,
} from "@/services/kpss/kpssWikiService.js";
import { KpssWikiSidebar } from "@/components/kpss/wiki/KpssWikiSidebar.js";
import { KpssWikiReader } from "@/components/kpss/wiki/KpssWikiReader.js";
import { KpssWikiEditor } from "@/components/kpss/wiki/KpssWikiEditor.js";
import { KpssNotesHeader } from "@/components/kpss/wiki/KpssNotesHeader.js";
import { KpssNotesToolbar } from "@/components/kpss/wiki/KpssNotesToolbar.js";
import { KpssHelpModal } from "@/components/kpss/wiki/KpssHelpModal.js";
import { useKpssNotes } from "@/components/kpss/wiki/useKpssNotes.js";
import { useKpssWikiSidebar as useWikiSidebarState } from "@/presentation/hooks/useKpssWikiSidebar.js";
import { ZettelkastenGraphModal } from "@/components/notes/ZettelkastenGraphModal.js";

interface KpssNotesDashboardProps {
  lang: Language;
  t: Record<string, string>;
}

export function KpssNotesDashboard({ lang, t }: KpssNotesDashboardProps) {
  const notesRootRef = useRef<HTMLDivElement | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] =
    useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showGraphModal, setShowGraphModal] = useState<boolean>(false);
  const [showInfoboxHelp, setShowInfoboxHelp] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string>("");

  const {
    notes,
    setNotes,
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
    handleSaveArticle,
    handleDeleteArticle,
    handleDownloadMarkdown,
    handleWikilinkClick,
  } = useKpssNotes(t, selectedSubjectFilter);

  const parentIdMap = useMemo(() => {
    const map = new Map<string, string>();
    notes.forEach((n) => {
      if (n.parentId) {
        map.set(n.id, n.parentId);
      }
    });
    return map;
  }, [notes]);

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

  const handleExportNotes = async () => {
    const notesJson = JSON.stringify(notes);
    const res = await window.mindvaultSync!.exportToFile(notesJson);
    if (res && res.ok) {
      setSyncMsg("Dışa aktarıldı: " + res.filePath);
    } else if (res && res.canceled) {
      setSyncMsg("");
    }
  };

  const handleImportNotes = async () => {
    const res = await window.mindvaultSync!.importFromFile();
    if (res && res.ok && res.data) {
      try {
        const imported = JSON.parse(res.data);
        if (Array.isArray(imported)) {
          await saveKpssWikiNotes(imported);
          setNotes(imported);
          setSyncMsg("İçe aktarıldı: " + imported.length + " not");
        }
      } catch {
        setSyncMsg("Geçersiz dosya formatı");
      }
    } else if (res && res.canceled) {
      setSyncMsg("");
    }
  };

  const handleFullscreen = () => {
    const el = notesRootRef.current;
    if (!el) {
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  const { sidebarCollapsed, toggleSidebar } = useWikiSidebarState();

  return (
    <div
      ref={notesRootRef}
      className="kpss-notes-fullscreen"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        marginTop: "14px",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <KpssNotesHeader t={t} syncMsg={syncMsg} />

      {/* Main Grid Layout (Dynamic Collapsible Sidebar for Full Screen Mode) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sidebarCollapsed ? "38px 1fr" : "270px 1fr",
          gap: "16px",
          minHeight: "680px",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          transition:
            "grid-template-columns 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <KpssWikiSidebar
          lang={lang}
          t={t}
          notes={filteredNotes}
          selectedNoteId={selectedNote?.id ?? null}
          searchQuery={searchQuery}
          selectedSubjectFilter={selectedSubjectFilter}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
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
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {selectedNote ? (
            <>
              <KpssNotesToolbar
                t={t}
                viewMode={viewMode}
                onModeChange={setViewMode}
                onFullscreen={handleFullscreen}
                onDownloadMarkdown={handleDownloadMarkdown}
                onExport={handleExportNotes}
                onImport={handleImportNotes}
                onShowHelp={() => setShowInfoboxHelp(true)}
                onShowGraph={() => setShowGraphModal(true)}
                onDelete={handleDeleteArticle}
              />

              {viewMode === "read" ? (
                <KpssWikiReader
                  lang={lang}
                  t={t}
                  note={selectedNote}
                  allNotes={notes}
                  onWikilinkClick={handleWikilinkClick}
                  onSelectNote={selectNote}
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
          notes={notes as unknown as Note[]}
          parentIdMap={parentIdMap}
          onClose={() => setShowGraphModal(false)}
          onSelectNote={(n) => {
            selectNote(n as unknown as KpssWikiNote);
            setShowGraphModal(false);
          }}
        />
      )}

      {/* KPSS Not Alma Rehberi Modal Popup */}
      {showInfoboxHelp && (
        <KpssHelpModal t={t} onClose={() => setShowInfoboxHelp(false)} />
      )}
    </div>
  );
}
