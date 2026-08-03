/**
 * ZettelkastenGraphModal.tsx
 * Obsidian-style Interactive 2D Knowledge Graph View Modal.
 * Renders notes as interconnected glowing nodes and links as edges on an SVG canvas.
 * Tuval: state + memo'lar + GraphLegend/GraphSvgCanvas parçaları.
 */
import { useState, useMemo } from "preact/hooks";
import { Note } from "@/types/types.js";
import { buildKnowledgeGraph } from "@/services/zettelkastenEngine.js";
import { GraphLegend } from "./GraphLegend.js";
import { GraphSvgCanvas, CANVAS_WIDTH, CANVAS_HEIGHT } from "./GraphSvgCanvas.js";

interface ZettelkastenGraphModalProps {
  notes: Note[];
  onClose: () => void;
  onSelectNote: (note: Note) => void;
}

export function ZettelkastenGraphModal({
  notes,
  onClose,
  onSelectNote,
}: ZettelkastenGraphModalProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Build Graph
  const graph = useMemo(() => {
    return buildKnowledgeGraph(notes, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [notes]);

  // Filtered / Highlighted Node IDs
  const activeNodeIds = useMemo(() => {
    if (!filterQuery.trim()) {
      return null;
    }
    const q = filterQuery.toLowerCase().trim();
    const set = new Set<string>();
    graph.nodes.forEach((n) => {
      if (
        n.title.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q))
      ) {
        set.add(n.id);
      }
    });
    return set;
  }, [graph, filterQuery]);

  // Connected nodes set for hover effect
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) {
      return null;
    }
    const set = new Set<string>([hoveredNodeId]);
    graph.edges.forEach((e) => {
      if (e.source === hoveredNodeId) {
        set.add(e.target);
      }
      if (e.target === hoveredNodeId) {
        set.add(e.source);
      }
    });
    return set;
  }, [graph, hoveredNodeId]);

  return (
    <div
      className="stock-modal-overlay"
      style={{
        zIndex: 9999,
        background: "rgba(10, 15, 30, 0.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="stock-modal-content"
        style={{
          width: "92vw",
          maxWidth: "960px",
          maxHeight: "92vh",
          padding: "20px",
          background: "var(--card-bg, rgba(30, 41, 59, 0.85))",
          border: "1px solid var(--accent-color, rgba(139, 92, 246, 0.4))",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(168, 85, 247, 0.2)",
                color: "#c084fc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              🕸️
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#f8fafc",
                }}
              >
                Obsidian Zettelkasten — Düşünce Ağı (Graph View)
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                {notes.length} Not • {graph.edges.length} İç Bağlantı (`[[ ]]`)
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="text"
              className="stock-input"
              style={{
                width: "220px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                borderRadius: "10px",
              }}
              placeholder="Düğüm ara (#kpss/tarih, Başlık)..."
              value={filterQuery}
              onInput={(e) =>
                setFilterQuery((e.target as HTMLInputElement).value)
              }
            />
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "1.4rem",
                cursor: "pointer",
                fontWeight: 700,
                padding: "0 8px",
              }}
              title="Kapat"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Legend Bar */}
        <GraphLegend />

        {/* SVG Canvas Graph View */}
        <GraphSvgCanvas
          notes={notes}
          graph={graph}
          hoveredNodeId={hoveredNodeId}
          activeNodeIds={activeNodeIds}
          connectedNodeIds={connectedNodeIds}
          onHoverNode={setHoveredNodeId}
          onSelectNode={onSelectNote}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
