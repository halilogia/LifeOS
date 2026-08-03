/**
 * KpssWikiSidebar.tsx
 * Presentational Left Sidebar component for search, filtering, and hierarchical note tree.
 * Notion-style: parent notes expandable, child notes (parentId) nested with indent.
 * Tuval: SUBJECT_FILTERS + dış kutu + WikiSearchFilterBar/WikiNoteTree parçaları.
 */
import { Language } from "@/types/types.js";
import type { KpssWikiNote } from "@/services/kpss/kpssWikiService.js";
import { WikiSearchFilterBar } from "./WikiSearchFilterBar.js";
import { WikiNoteTree } from "./WikiNoteTree.js";

interface KpssWikiSidebarProps {
  lang: Language;
  t: Record<string, string>;
  notes: KpssWikiNote[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedSubjectFilter: string;
  onSearchChange: (q: string) => void;
  onFilterChange: (subject: string) => void;
  onSelectNote: (note: KpssWikiNote) => void;
  onCreateNewNote: () => void;
  onAddChildNote: (parent: KpssWikiNote) => void;
}

export function KpssWikiSidebar({
  lang,
  t,
  notes,
  selectedNoteId,
  searchQuery,
  selectedSubjectFilter,
  onSearchChange,
  onFilterChange,
  onSelectNote,
  onCreateNewNote,
  onAddChildNote,
}: KpssWikiSidebarProps) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <WikiSearchFilterBar
        t={t}
        searchQuery={searchQuery}
        selectedSubjectFilter={selectedSubjectFilter}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        onCreateNewNote={onCreateNewNote}
      />

      {/* Note Tree */}
      <WikiNoteTree
        t={t}
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={onSelectNote}
        onAddChildNote={onAddChildNote}
      />
    </div>
  );
}
