import type { Note } from "@/types/types.js";
import {
  buildKnowledgeGraph,
} from "@/services/zettelkastenEngine.js";

export const CANVAS_WIDTH = 850;
export const CANVAS_HEIGHT = 520;

interface GraphSvgCanvasProps {
  notes: Note[];
  graph: ReturnType<typeof buildKnowledgeGraph>;
  hoveredNodeId: string | null;
  activeNodeIds: Set<string> | null;
  connectedNodeIds: Set<string> | null;
  onHoverNode: (id: string | null) => void;
  onSelectNode: (note: Note) => void;
  onClose: () => void;
}

export function GraphSvgCanvas({
  notes,
  graph,
  hoveredNodeId,
  activeNodeIds,
  connectedNodeIds,
  onHoverNode,
  onSelectNode,
  onClose,
}: GraphSvgCanvasProps) {
  const noteMap = new Map<string, Note>();
  notes.forEach((n) => noteMap.set(n.id, n));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: `${CANVAS_HEIGHT}px`,
        background:
          "radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)",
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
            Yeni not oluştururken [[Not Adı]] ve #kpss/tarih etiketleri
            ekleyerek bağlantı ağınızı kurabilirsiniz.
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
            if (!sourceNode || !targetNode) {
              return null;
            }

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
                style={{
                  transition: "stroke 0.2s ease, stroke-width 0.2s ease",
                }}
              />
            );
          })}

          {/* Render Nodes (Glowing Spheres & Titles) */}
          {graph.nodes.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodeIds?.has(node.id);
            const isFiltered = activeNodeIds
              ? activeNodeIds.has(node.id)
              : true;

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
                onMouseEnter={() => onHoverNode(node.id)}
                onMouseLeave={() => onHoverNode(null)}
                onClick={() => {
                  const n = noteMap.get(node.id);
                  if (n) {
                    onSelectNode(n);
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
      {hoveredNodeId &&
        (() => {
          const hNode = graph.nodes.find((n) => n.id === hoveredNodeId);
          if (!hNode) {
            return null;
          }
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
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: hNode.color,
                }}
              >
                {hNode.title}
              </div>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "0.75rem",
                  marginTop: "2px",
                }}
              >
                {hNode.linksCount} Bağlantı •{" "}
                {hNode.tags.length > 0 ? hNode.tags.join(", ") : "Etiketsiz"}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
