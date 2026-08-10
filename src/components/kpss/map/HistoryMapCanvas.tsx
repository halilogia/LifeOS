/**
 * HistoryMapCanvas.tsx
 * KPSS Tarih harita katmanı — il sınırları, pin (territory + points modu).
 * Diagram (devlet teşkilatı) modu SchemaBuilder.tsx ile çizilir.
 * Tek sorumluluk: SVG harita render. Tuval: HistoryMapView.tsx.
 */
import type { Ref } from "preact";
import {
  HISTORY_VIEWBOX,
  type HistoryEvent,
} from "@/domain/constants/TurkeyHistoryData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";

interface HistoryMapCanvasProps {
  events: HistoryEvent[];
  revealedCount: number;
  currentIndex: number;
  unitColor: string;
  territoryColors: Map<string, string>;
  view: { x: number; y: number; scale: number };
  isFullscreen: boolean;
  svgWrapRef: Ref<HTMLDivElement>;
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: () => void;
  onWheel: (e: WheelEvent) => void;
}

function getPinOffsets(
  events: HistoryEvent[],
): Map<number, { dx: number; dy: number }> {
  const buckets = new Map<string, number[]>();
  events.forEach((ev, idx) => {
    const key = `${Math.round(ev.x)}-${Math.round(ev.y)}`;
    const arr = buckets.get(key) || [];
    arr.push(idx);
    buckets.set(key, arr);
  });
  const offsets = new Map<number, { dx: number; dy: number }>();
  buckets.forEach((indices) => {
    if (indices.length <= 1) {
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

export function HistoryMapCanvas({
  events,
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
}: HistoryMapCanvasProps) {
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
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        background:
          "radial-gradient(ellipse at 30% 20%, #f4ecd8, #e6d9b8 55%, #d8c79a 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <svg
        viewBox={HISTORY_VIEWBOX}
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
        {TURKEY_PROVINCE_PATHS.map((province) => {
          const c = territoryColors.get(province.name);
          return (
            <path
              key={province.name}
              d={province.d}
              fill={c || "#d8cba7"}
              stroke="#a3906a"
              strokeWidth={0.7}
              style={{ transition: "fill 0.3s" }}
            />
          );
        })}

        <PinLayer
          events={events}
          revealedCount={revealedCount}
          currentIndex={currentIndex}
          unitColor={unitColor}
        />
      </svg>


    </div>
  );
}

/* ========== Pin katmanı (territory + points modu) ========== */

function PinLayer({
  events,
  revealedCount,
  currentIndex,
  unitColor,
}: {
  events: HistoryEvent[];
  revealedCount: number;
  currentIndex: number;
  unitColor: string;
}) {
  const offsets = getPinOffsets(events);
  return (
    <>
      {events.slice(0, revealedCount).map((ev, idx) => {
        const isCurrent = idx === currentIndex;
        const c = ev.color || unitColor;
        const off = offsets.get(idx) || { dx: 0, dy: 0 };
        return (
          <g
            key={`pin-${idx}`}
            transform={`translate(${ev.x + off.dx} ${ev.y + off.dy})`}
          >
            <circle r={2} fill={c} />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={-16}
              stroke="#3a1408"
              strokeWidth={1.4}
            />
            <path
              d="M 0,-16 L 11,-12 L 0,-8 Z"
              fill={isCurrent ? "#c99a3c" : c}
              stroke="#3a1408"
              strokeWidth={0.6}
            />
            <circle
              r={isCurrent ? 4.2 : 3.2}
              fill={isCurrent ? "#c99a3c" : c}
              stroke="#3a1408"
              strokeWidth={1.1}
            />
            {isCurrent && (
              <circle
                r={6}
                fill="none"
                stroke={c}
                strokeWidth={1.5}
                style={{
                  animation: "historyPulse 1.4s ease-out infinite",
                  transformOrigin: "center",
                }}
              />
            )}
            <text
              y={ev.year ? -21 : -22}
              textAnchor="middle"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: ev.year ? 10 : 10.5,
                fill: "#3a1408",
                fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              {ev.year || ev.title}
            </text>
          </g>
        );
      })}
    </>
  );
}
