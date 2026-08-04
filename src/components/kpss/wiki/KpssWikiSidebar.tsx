/**
 * KpssWikiSidebar.tsx
 * Presentational Left Sidebar component for search, filtering, hierarchical note tree,
 * and pinned Table of Contents / Child Notes.
 */
import { Language } from "@/types/types.js";
import type { KpssWikiNote, HeadingItem } from "@/services/kpss/kpssWikiService.js";
import { WikiSearchFilterBar } from "./WikiSearchFilterBar.js";
import { WikiNoteTree } from "./WikiNoteTree.js";
import { IconList } from "../kpssIcons.js";

interface KpssWikiSidebarProps {
  lang: Language;
  t: Record<string, string>;
  notes: KpssWikiNote[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedSubjectFilter: string;
  tableOfContents?: HeadingItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSearchChange: (q: string) => void;
  onFilterChange: (subject: string) => void;
  onSelectNote: (note: KpssWikiNote) => void;
  onCreateNewNote: () => void;
  onAddChildNote: (parent: KpssWikiNote) => void;
  onNavigateToc?: (index: number) => void;
}

export function KpssWikiSidebar({
  lang: _lang,
  t,
  notes,
  selectedNoteId,
  searchQuery,
  selectedSubjectFilter,
  tableOfContents = [],
  isCollapsed = false,
  onToggleCollapse,
  onSearchChange,
  onFilterChange,
  onSelectNote,
  onCreateNewNote,
  onAddChildNote,
  onNavigateToc,
}: KpssWikiSidebarProps) {
  if (isCollapsed) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          background: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Sol Paneli Göster"
          style={{
            background: "rgba(139, 92, 246, 0.25)",
            border: "1px solid rgba(139, 92, 246, 0.5)",
            color: "#ffffff",
            borderRadius: "10px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>
    );
  }

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
        height: "100%",
        maxHeight: "800px",
        overflowY: "auto",
      }}
    >
      {/* Üst Bar: Sol Paneli Gizle Butonu (X İkonu) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--card-border)",
          paddingBottom: "8px",
        }}
      >
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)" }}>
          {t.kpss_notes_title || "Ders Notları Studyo"}
        </span>
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Sol Paneli Kapat"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--card-border)",
            color: "var(--text-secondary)",
            borderRadius: "6px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <WikiSearchFilterBar
        t={t}
        searchQuery={searchQuery}
        selectedSubjectFilter={selectedSubjectFilter}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        onCreateNewNote={onCreateNewNote}
      />

      {/* Note Tree */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <WikiNoteTree
          t={t}
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          onAddChildNote={onAddChildNote}
        />
      </div>

      {/* Sol Paneline Sabitlenmiş İçindekiler / Alt Notlar Bloğu */}
      {tableOfContents.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--card-border)",
            paddingTop: "10px",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#c084fc",
              marginBottom: "8px",
            }}
          >
            <IconList size={15} strokeWidth={2.2} />
            <span>İçindekiler / Alt Notlar</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              maxHeight: "180px",
              overflowY: "auto",
            }}
          >
            {tableOfContents.map((item, idx) => {
              const depth = item.level - 1;
              const isSub = depth > 0;
              return (
                <a
                  key={idx}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToc?.(idx);
                  }}
                  style={{
                    color: isSub ? "var(--text-secondary)" : "#e2e8f0",
                    fontSize: isSub ? "0.74rem" : "0.78rem",
                    fontWeight: isSub ? 400 : 600,
                    textDecoration: "none",
                    paddingLeft: isSub ? `${depth * 10}px` : "2px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#c084fc")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = isSub
                      ? "var(--text-secondary)"
                      : "#e2e8f0")
                  }
                >
                  {item.text}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
