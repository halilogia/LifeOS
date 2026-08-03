/**
 * HistoryMapSvg.tsx
 * SVG harita katmanı — il path'leri, territory boyama, pin'ler, diagram düğümleri.
 * Tuval: HistoryMapView.tsx
 */
import { useRef, useEffect } from "preact/hooks";
import {
  HISTORY_PROVINCE_FILL,
  HISTORY_PROVINCE_STROKE,
  HISTORY_VIEWBOX,
  type HistoryEvent,
  type HistoryDiagramNode,
} from "@/domain/constants/TurkeyHistoryData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";

interface HistoryMapSvgProps {
  isDiagram: boolean;
  events: HistoryEvent[];
  nodes: HistoryDiagramNode[];
  revealedCount: number;
  currentIndex: number;
  unitColor: string;
  territoryColors: Map<string, string>;
  view: { x: number; y: number; scale: number };
  isFullscreen: boolean;
  svgWrapRef: { current: HTMLDivElement | null };
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: () => void;
  onWheel: (e: WheelEvent) => void;
}

/* ========== Render helpers (pure functions) ========== */

function computeDiagramViewBox(
  nodes: HistoryDiagramNode[],
  _revealedCount: number
): string {
  if (nodes.length === 0) {
    return "0 0 1000 422";
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    const w = Math.max(88, n.label.length * 7.2 + 18);
    const h = 40;
    minX = Math.min(minX, n.x - w / 2);
    maxX = Math.max(maxX, n.x + w / 2);
    minY = Math.min(minY, n.y - h / 2);
    maxY = Math.max(maxY, n.y + h / 2);
  });
  const padX = 40, padY = 40;
  return `${minX - padX} ${minY - padY} ${maxX - minX + padX * 2} ${maxY - minY + padY * 2}`;
}

function renderDiagramLinks(
  nodes: HistoryDiagramNode[],
  revealedCount: number
) {
  return nodes.slice(0, revealedCount).map((n, idx) => {
    if (!n.parent) {
      return null;
    }
    const parentNode = nodes.find((p) => p.id === n.parent);
    if (!parentNode) {
      return null;
    }
    if (idx >= revealedCount) {
      return null;
    }
    const midY = (parentNode.y + n.y) / 2;
    return (
      <path
        key={`link-${n.id}`}
        d={`M ${parentNode.x},${parentNode.y + 20} C ${parentNode.x},${midY} ${n.x},${midY} ${n.x},${n.y - 20}`}
        fill="none"
        stroke="#c99a3c"
        strokeWidth={1.4}
        strokeDasharray="6 5"
        style={{
          animation: "trailin 0.8s ease-out forwards",
          opacity: 0,
        }}
      />
    );
  });
}

function renderDiagramNodes(
  nodes: HistoryDiagramNode[],
  revealedCount: number,
  currentIndex: number,
  unitColor: string
) {
  return nodes.slice(0, revealedCount).map((n, idx) => {
    const isCurrent = idx === currentIndex;
    const w = Math.max(88, n.label.length * 7.2 + 18);
    const h = 40;
    return (
      <g
        key={`dnode-${n.id}`}
        transform={`translate(${n.x - w / 2} ${n.y - h / 2})`}
        style={{
          animation: idx < revealedCount ? "drop 0.45s ease-out both" : undefined,
        }}
      >
        <rect
          width={w}
          height={h}
          rx={8}
          fill={isCurrent ? "#f3dcb8" : "#fbf1de"}
          stroke={isCurrent ? "#c99a3c" : unitColor}
          strokeWidth={isCurrent ? 2 : 1.4}
        />
        <text
          x={w / 2}
          y={h / 2 + 4}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={700}
          fill="#241c14"
          style={{ fontFamily: "'Segoe UI',sans-serif" }}
        >
          {n.label}
        </text>
      </g>
    );
  });
}

function getPinOffsets(
  events: HistoryEvent[]
): Map<number, { dx: number; dy: number }> {
  const buckets = new Map<string, number[]>();
  events.forEach((ev, idx) => {
    const key = `${Math.round(ev.x * 10)}-${Math.round(ev.y * 10)}`;
    const arr = buckets.get(key) || [];
    arr.push(idx);
    buckets.set(key, arr);
  });
  const offsets = new Map<number, { dx: number; dy: number }>();
  buckets.forEach((indices) => {
    if (indices.length === 1) {
      return;
    }
    const radius = 14;
    indices.forEach((idx, i) => {
      const angle = (i / indices.length) * Math.PI * 2;
      offsets.set(idx, {
        dx: Math.cos(angle) * radius,
        dy: Math.sin(angle) * radius,
      });
    });
  });
  return offsets;
}

function renderTerritoryPins(
  events: HistoryEvent[],
  revealedCount: number,
  currentIndex: number,
  unitColor: string
) {
  const offsets = getPinOffsets(events);
  return events.slice(0, revealedCount).map((ev, idx) => {
    const isCurrent = idx === currentIndex;
    const pinColor = ev.color || unitColor;
    const off = offsets.get(idx) || { dx: 0, dy: 0 };
    return (
      <g
        key={`pin-${ev.title}-${idx}`}
        transform={`translate(${ev.x + off.dx} ${ev.y + off.dy})`}
        className={`pin${isCurrent ? " current" : " revealed"}`}
        style={{ cursor: "default" }}
      >
        {/* Halo */}
        <circle cx={0} cy={0} r={2} fill={pinColor} className="halo" />
        {/* Direk */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-16}
          stroke="#3a1a12"
          strokeWidth={1.4}
          className="flagpole"
          opacity={0.9}
        />
        {/* Bayrak */}
        <path
          d="M 0,-16 L 11,-12 L 0,-8 Z"
          fill={isCurrent ? "#c99a3c" : pinColor}
          stroke="#3a1408"
          strokeWidth={0.6}
          className="flag"
        />
        {/* Çekirdek */}
        <circle
          cx={0}
          cy={0}
          r={isCurrent ? 4.2 : 3.2}
          fill={isCurrent ? "#c99a3c" : pinColor}
          stroke="#3a1408"
          strokeWidth={1.1}
          className="core"
        />
        {isCurrent && (
          <circle
            cx={0}
            cy={0}
            r={6}
            fill="none"
            stroke={pinColor}
            strokeWidth={1.5}
            className="pulse"
          />
        )}
        {/* Yıl etiketi */}
        {ev.year && (
          <text
            y={-21}
            textAnchor="middle"
            className="lbl"
            style={{
              fontFamily: "'Iowan Old Style',Georgia,serif",
              fontSize: 10,
              fill: "#3a1408",
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            {ev.year}
          </text>
        )}
        {/* Başlık etiketi (points modu) */}
        {!ev.year && (
          <text
            y={-22}
            textAnchor="middle"
            className="lbl"
            style={{
              fontFamily: "'Iowan Old Style',Georgia,serif",
              fontSize: 10.5,
              fill: "#3a1408",
              fontWeight: 700,
              pointerEvents: "none",
              textShadow: "0 1px 2px rgba(255,255,255,0.8)",
            }}
          >
            {ev.title}
          </text>
        )}
      </g>
    );
  });
}

export function HistoryMapSvg({
  isDiagram,
  events,
  nodes,
  revealedCount,
  currentIndex,
  unitColor,
  territoryColors,
  view,
  isFullscreen,
  svgWrapRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
}: HistoryMapSvgProps) {
  return (
    <div
      ref={svgWrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        height: isFullscreen ? undefined : 480,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        background: isDiagram
          ? "#f7ecd8"
          : "linear-gradient(180deg, #bcd8e0 0%, #bcd8e0 14%, #f7ecd8 14%, #f7ecd8 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <svg
        viewBox={
          isDiagram
            ? computeDiagramViewBox(nodes, revealedCount)
            : HISTORY_VIEWBOX
        }
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          maxHeight: isFullscreen ? "calc(100vh - 180px)" : undefined,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
          transition: "transform 0.05s linear",
        }}
      >
        {/* İl Sınırları — diagram modunda gizli */}
        {!isDiagram &&
          TURKEY_PROVINCE_PATHS.map((province) => {
            const terrColor = territoryColors.get(province.name);
            return (
              <path
                key={province.name}
                d={province.d}
                fill={terrColor || HISTORY_PROVINCE_FILL}
                stroke={HISTORY_PROVINCE_STROKE}
                strokeWidth={0.7}
                style={{ transition: "fill 0.6s ease" }}
              />
            );
          })}

        {/* Diyagram bağlantıları */}
        {isDiagram && renderDiagramLinks(nodes, revealedCount)}

        {/* Pinler / DNode'lar */}
        {isDiagram
          ? renderDiagramNodes(nodes, revealedCount, currentIndex, unitColor)
          : renderTerritoryPins(events, revealedCount, currentIndex, unitColor)}
      </svg>
    </div>
  );
}
