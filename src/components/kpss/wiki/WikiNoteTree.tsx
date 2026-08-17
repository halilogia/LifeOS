import { useRef, useState } from "preact/hooks";
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
  onReparent: (childId: string, newParentId: string | null) => void;
}

export function WikiNoteTree({
  t,
  notes,
  selectedNoteId,
  onSelectNote,
  onAddChildNote,
  onReparent,
}: WikiNoteTreeProps) {
  // Expanded parent ids set (default: all expanded)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  // Drag sırasında state'in async güncellenmesine güvenme — ref kullan
  const dragIdRef = useRef<string | null>(null);
  const tree = buildWikiTree(notes);

  const toggleCollapse = (id: string, e?: MouseEvent) => {
    e?.stopPropagation();
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

  // Not satırına tıklayınca: notu seç VE (çocukluysa) aç/kapa
  const handleRowClick = (node: WikiTreeNode) => {
    onSelectNote(node.note);
    if (node.children.length > 0) {
      toggleCollapse(node.note.id);
    }
  };

  const handleDragStart = (id: string, e: DragEvent) => {
    e.stopPropagation();
    setDragId(id);
    dragIdRef.current = id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    }
  };

  const handleDragEnd = () => {
    setDragId(null);
    dragIdRef.current = null;
    setDropTargetId(null);
  };

  const handleDrop = (newParentId: string | null, e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const childId = e.dataTransfer?.getData("text/plain") || dragIdRef.current;
    setDragId(null);
    dragIdRef.current = null;
    setDropTargetId(null);
    if (childId) {
      onReparent(childId, newParentId);
    }
  };

  const renderNode = (node: WikiTreeNode, depth: number) => {
    const n = node.note;
    const isSelected = n.id === selectedNoteId;
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsedIds.has(n.id);
    const isDropTarget = dropTargetId === n.id;
    const displayTitle =
      n.title.trim() ||
      extractTitleFromContent(n.content) ||
      t.kpss_wiki_untitled;

    return (
      <div key={n.id} style={{ display: "flex", flexDirection: "column" }}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(n.id, e)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const dragging = dragIdRef.current;
            if (dragging && dragging !== n.id) {
              setDropTargetId(n.id);
            }
          }}
          onDragLeave={() => {
            setDropTargetId((prev) => (prev === n.id ? null : prev));
          }}
          onDrop={(e) => handleDrop(n.id, e)}
          onClick={() => handleRowClick(node)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "7px 8px",
            paddingLeft: `${8 + depth * 14}px`,
            background: isDropTarget
              ? "rgba(16, 185, 129, 0.18)"
              : isSelected
                ? "rgba(37, 99, 235, 0.2)"
                : "rgba(255, 255, 255, 0.02)",
            border: `1px solid ${
              isDropTarget ? "#10b981" : isSelected ? "#3b82f6" : "transparent"
            }`,
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: dragId === n.id ? 0.4 : 1,
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
        <>
          {/* Kök düzleme bırakma alanı — notu alt not olmaktan çıkarır */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragIdRef.current) {
                setDropTargetId("__root__");
              }
            }}
            onDragLeave={(e) => {
              // Çocuklara geçerken tetiklenmesin — sadece gerçek ayrılışta temizle
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDropTargetId((prev) => (prev === "__root__" ? null : prev));
              }
            }}
            onDrop={(e) => handleDrop(null, e)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "#64748b",
              textAlign: "center",
              border: `1px dashed ${
                dropTargetId === "__root__"
                  ? "#10b981"
                  : "rgba(255, 255, 255, 0.12)"
              }`,
              background:
                dropTargetId === "__root__"
                  ? "rgba(16, 185, 129, 0.12)"
                  : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            ↳ Alt notu çıkarmak için buraya bırak
          </div>
          {tree.map((node) => renderNode(node, 0))}
        </>
      )}
    </div>
  );
}
