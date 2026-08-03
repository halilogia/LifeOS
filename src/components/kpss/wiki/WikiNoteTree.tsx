import { useState } from "preact/hooks";
import type { KpssWikiNote } from "@/services/kpss/kpssWikiService.js";
import {
  extractTitleFromContent,
  buildWikiTree,
  WikiTreeNode,
} from "@/services/kpss/kpssWikiService.js";

interface WikiNoteTreeProps {
  t: Record<string, string>;
  notes: KpssWikiNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: KpssWikiNote) => void;
  onAddChildNote: (parent: KpssWikiNote) => void;
}

export function WikiNoteTree({
  t,
  notes,
  selectedNoteId,
  onSelectNote,
  onAddChildNote,
}: WikiNoteTreeProps) {
  // Expanded parent ids set (default: all expanded)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const tree = buildWikiTree(notes);

  const toggleCollapse = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderNode = (node: WikiTreeNode, depth: number) => {
    const n = node.note;
    const isSelected = n.id === selectedNoteId;
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsedIds.has(n.id);
    const displayTitle =
      n.title.trim() ||
      extractTitleFromContent(n.content) ||
      t.kpss_wiki_untitled;

    return (
      <div key={n.id} style={{ display: "flex", flexDirection: "column" }}>
        <div
          onClick={() => onSelectNote(n)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "7px 8px",
            paddingLeft: `${8 + depth * 14}px`,
            background: isSelected
              ? "rgba(37, 99, 235, 0.2)"
              : "rgba(255, 255, 255, 0.02)",
            border: `1px solid ${isSelected ? "#3b82f6" : "transparent"}`,
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={(e) => toggleCollapse(n.id, e)}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "0.6rem",
              cursor: hasChildren ? "pointer" : "default",
              width: 14,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              flexShrink: 0,
              opacity: hasChildren ? 1 : 0.2,
            }}
          >
            {hasChildren ? (isCollapsed ? "▶" : "▼") : "•"}
          </button>

          <span
            style={{
              fontWeight: isSelected ? 700 : 500,
              fontSize: "0.76rem",
              color: isSelected ? "#ffffff" : "#cbd5e1",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {displayTitle}
          </span>

          {/* Add child note button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChildNote(n);
            }}
            title={t.kpss_wiki_add_child || "Alt Not Ekle"}
            style={{
              background: "none",
              border: "none",
              color: "#60a5fa",
              fontSize: "0.85rem",
              cursor: "pointer",
              padding: "0 2px",
              opacity: isSelected ? 1 : 0,
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>

        {hasChildren && !isCollapsed && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              marginTop: "3px",
            }}
          >
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        overflowY: "auto",
        flex: 1,
        maxHeight: "560px",
      }}
    >
      {notes.length === 0 ? (
        <div
          style={{
            padding: "20px 10px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "0.75rem",
          }}
        >
          Kayıtlı ders notu bulunamadı.
        </div>
      ) : (
        tree.map((node) => renderNode(node, 0))
      )}
    </div>
  );
}
