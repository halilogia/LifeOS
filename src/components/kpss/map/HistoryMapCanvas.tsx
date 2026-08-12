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

interface PinOffset {
  dx: number;
  dy: number;
  textY: number;
}

/**
 * Yakın koordinattaki event'leri kümeler ve her pin'e görsel ofset verir.
 * Aynı şehirde birden fazla tarihsel olay varsa (örn. Ankara'da 3, Amasya'da 2)
 * pinler üst üste binmesin diye çember üzerinde dağıtır.
 */
function getPinOffsets(events: HistoryEvent[]): Map<number, PinOffset> {
  const result = new Map<number, PinOffset>();
  const visited = new Set<number>();
  const clusters: number[][] = [];

  for (let i = 0; i < events.length; i++) {
    if (visited.has(i)) {
      continue;
    }
    const cluster = [i];
    visited.add(i);

    for (let j = i + 1; j < events.length; j++) {
      if (visited.has(j)) {
        continue;
      }
      const dist = Math.hypot(
        (events[i].x ?? 0) - (events[j].x ?? 0),
        (events[i].y ?? 0) - (events[j].y ?? 0),
      );
      if (dist < 80) {
        cluster.push(j);
        visited.add(j);
      }
    }
    clusters.push(cluster);
  }

  clusters.forEach((indices) => {
    if (indices.length === 1) {
      result.set(indices[0], { dx: 0, dy: 0, textY: -22 });
      return;
    }

    const count = indices.length;
    // Çember üzerinde daha geniş yayılma — üst üste binmeyi önler.
    indices.forEach((idx, k) => {
      const angle = (k / count) * Math.PI * 2 - Math.PI / 2;
      const radius = count > 3 ? 16 : count > 2 ? 12 : 8;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      // Etiket yüksekliklerini kademelendir — yazılar çakışmasın.
      const textY = k % 2 === 0 ? -22 : k % 3 === 1 ? -40 : 20;
      result.set(idx, { dx, dy, textY });
    });
  });

  return result;
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
        const off = offsets.get(idx) || { dx: 0, dy: 0, textY: -22 };
        return (
          <g
            key={`pin-${idx}`}
            transform={`translate(${(ev.x ?? 0) + off.dx} ${(ev.y ?? 0) + off.dy})`}
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
              y={ev.year ? -21 : off.textY}
              textAnchor="middle"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 10,
                fill: "#2b1810",
                fontWeight: 800,
                pointerEvents: "none",
                paintOrder: "stroke fill",
                stroke: "#f2e6cc",
                strokeWidth: 3,
                strokeLinejoin: "round",
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
