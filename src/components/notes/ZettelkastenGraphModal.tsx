/**
 * ZettelkastenGraphModal.tsx
 * Obsidian-style Interactive 2D Knowledge Graph View Modal.
 * Renders notes as interconnected glowing nodes and links as edges on an SVG canvas.
 */

import { useState, useMemo } from "preact/hooks";
import { Note } from "@/types/types.js";
import {
  buildKnowledgeGraph,
  GraphNode,
} from "@/services/zettelkastenEngine.js";

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

  const CANVAS_WIDTH = 850;
  const CANVAS_HEIGHT = 520;

  // Build Graph
  const graph = useMemo(() => {
    return buildKnowledgeGraph(notes, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [notes]);

  // ID to Note map
  const noteMap = useMemo(() => {
    const map = new Map<string, Note>();
    notes.forEach((n) => map.set(n.id, n));
    return map;
  }, [notes]);

  // Filtered / Highlighted Node IDs
  const activeNodeIds = useMemo(() => {
    if (!filterQuery.trim()) return null;
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
    if (!hoveredNodeId) return null;
    const set = new Set<string>([hoveredNodeId]);
    graph.edges.forEach((e) => {
      if (e.source === hoveredNodeId) set.add(e.target);
      if (e.target === hoveredNodeId) set.add(e.source);
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "0.75rem",
            color: "#cbd5e1",
            flexWrap: "wrap",
            padding: "4px 8px",
            background: "rgba(15, 23, 42, 0.4)",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontWeight: 600, color: "#94a3b8" }}>Kategoriler:</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#a855f7" }}></span>
            KPSS Tarih
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }}></span>
            KPSS Coğrafya
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }}></span>
            KPSS Vatandaşlık
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }}></span>
            KPSS Türkçe
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }}></span>
            KPSS Matematik
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1" }}></span>
            Genel Notlar
          </span>
        </div>

        {/* SVG Canvas Graph View */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: `${CANVAS_HEIGHT}px`,
            background: "radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {notes.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#94a3b8",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "2.5rem" }}>🕸️</div>
              <p style={{ margin: 0 }}>Henüz not eklenmemiş.</p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Yeni not oluştururken [[Not Adı]] ve #kpss/tarih etiketleri ekleyerek bağlantı ağınızı kurabilirsiniz.
              </p>
            </div>
          ) : (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              style={{ cursor: "grab" }}
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Edges (Connecting Lines) */}
              {graph.edges.map((edge, idx) => {
                const sourceNode = graph.nodes.find((n) => n.id === edge.source);
                const targetNode = graph.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isConnectedToHover =
                  hoveredNodeId &&
                  (edge.source === hoveredNodeId || edge.target === hoveredNodeId);

                const strokeColor = isConnectedToHover
                  ? "#a855f7"
                  : "rgba(148, 163, 184, 0.25)";
                const strokeWidth = isConnectedToHover ? 2.5 : 1.2;

                return (
                  <line
                    key={`edge-${idx}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isConnectedToHover ? "none" : "4 2"}
                    style={{ transition: "stroke 0.2s ease, stroke-width 0.2s ease" }}
                  />
                );
              })}

              {/* Render Nodes (Glowing Spheres & Titles) */}
              {graph.nodes.map((node) => {
                const isHovered = hoveredNodeId === node.id;
                const isConnected = connectedNodeIds?.has(node.id);
                const isFiltered = activeNodeIds ? activeNodeIds.has(node.id) : true;

                const opacity =
                  activeNodeIds || hoveredNodeId
                    ? isHovered || isConnected || isFiltered
                      ? 1
                      : 0.2
                    : 1;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{
                      cursor: "pointer",
                      opacity,
                      transition: "opacity 0.25s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => {
                      const n = noteMap.get(node.id);
                      if (n) {
                        onSelectNote(n);
                        onClose();
                      }
                    }}
                  >
                    {/* Glowing outer circle on hover */}
                    {(isHovered || isFiltered) && (
                      <circle
                        r={node.radius + 6}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        opacity="0.6"
                        filter="url(#glow)"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={node.radius}
                      fill={node.color}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2.5 : 1}
                      filter={isHovered ? "url(#glow)" : undefined}
                    />

                    {/* Node Title Text */}
                    <text
                      y={node.radius + 14}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight={isHovered ? "700" : "500"}
                      style={{
                        pointerEvents: "none",
                        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      {node.title.length > 20
                        ? `${node.title.slice(0, 18)}...`
                        : node.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Hover Tooltip Overlay */}
          {hoveredNodeId && (() => {
            const hNode = graph.nodes.find((n) => n.id === hoveredNodeId);
            if (!hNode) return null;
            return (
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  background: "rgba(15, 23, 42, 0.9)",
                  border: `1px solid ${hNode.color}`,
                  borderRadius: "12px",
                  padding: "10px 14px",
                  color: "#f8fafc",
                  fontSize: "0.8rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: hNode.color }}>
                  {hNode.title}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "2px" }}>
                  {hNode.linksCount} Bağlantı • {hNode.tags.length > 0 ? hNode.tags.join(", ") : "Etiketsiz"}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
