/**
 * WorldHistoryMapCanvas.tsx
 * D3.js + TopoJSON ile gerçek dünya ülke sınırlarını çizerek Osmanlı Yükselme, Duraklama, Gerileme
 * ve Dağılma dönemlerini gösteren dinamik küresel harita katmanı.
 */
import { useEffect, useState } from "preact/hooks";
import type { Ref } from "preact";
import {
  WORLD_VIEWBOX,
  WORLD_COUNTRY_PATHS,
} from "@/domain/constants/history/WorldProvincePaths.js";
import {
  loadWorldCountryFeatures,
  getIsoCodesForRegion,
  type CountryGeoFeature,
} from "@/domain/constants/history/WorldMapGeoService.js";
import {
  type HistoryEvent,
  HISTORY_PROVINCE_FILL,
  HISTORY_PROVINCE_STROKE,
} from "@/domain/constants/history/types.js";

interface WorldHistoryMapCanvasProps {
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

function getPinOffsets(events: HistoryEvent[]): Map<number, PinOffset> {
  const result = new Map<number, PinOffset>();
  const visited = new Set<number>();
  const clusters: number[][] = [];

  for (let i = 0; i < events.length; i++) {
    if (visited.has(i)) continue;
    const cluster = [i];
    visited.add(i);

    for (let j = i + 1; j < events.length; j++) {
      if (visited.has(j)) continue;
      const dist = Math.hypot(events[i].x - events[j].x, events[i].y - events[j].y);
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
    indices.forEach((idx, k) => {
      const angle = (k / count) * Math.PI * 2 - Math.PI / 2;
      const radius = 3;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      const textY = k % 2 === 0 ? -22 : k % 3 === 1 ? -38 : 18;
      result.set(idx, { dx, dy, textY });
    });
  });

  return result;
}

export function WorldHistoryMapCanvas({
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
}: WorldHistoryMapCanvasProps) {
  const [geoFeatures, setGeoFeatures] = useState<CountryGeoFeature[]>([]);

  useEffect(() => {
    loadWorldCountryFeatures().then((features) => {
      if (features && features.length > 0) {
        setGeoFeatures(features);
      }
    });
  }, []);

  // Aktif boyalı ISO kod haritası oluşturma
  const activeIsoColors = new Map<string, string>();
  territoryColors.forEach((color, regionKey) => {
    const isoCodes = getIsoCodesForRegion(regionKey);
    isoCodes.forEach((code) => activeIsoColors.set(code, color));
  });

  return (
    <div
      ref={svgWrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
      style={{
        position: "relative",
        width: "100%",
        height: isFullscreen ? "calc(100vh - 120px)" : "480px",
        background: "radial-gradient(circle at 45% 40%, #1e3a5f 0%, #0b1a2e 100%)",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        cursor: "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <svg
        viewBox={WORLD_VIEWBOX}
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "center center",
          transition: "transform 0.08s ease-out",
        }}
      >
        {/* Gerçek Dünya Ülke Sınırları (D3 TopoJSON) veya Statik Yedek Harita */}
        <g>
          {geoFeatures.length > 0
            ? geoFeatures.map((country) => {
                const activeColor =
                  activeIsoColors.get(country.id) ||
                  territoryColors.get(country.name);
                const fill = activeColor || "#c2b48d";
                return (
                  <path
                    key={`geo-${country.id}`}
                    d={country.d}
                    fill={fill}
                    stroke="#5c4d32"
                    strokeWidth={0.6}
                    style={{ transition: "fill 0.4s ease" }}
                  >
                    <title>{country.name}</title>
                  </path>
                );
              })
            : WORLD_COUNTRY_PATHS.map((country) => {
                const activeColor = territoryColors.get(country.name);
                const fill = activeColor || HISTORY_PROVINCE_FILL;
                return (
                  <path
                    key={country.id}
                    d={country.d}
                    fill={fill}
                    stroke={HISTORY_PROVINCE_STROKE}
                    strokeWidth={1}
                    style={{ transition: "fill 0.4s ease" }}
                  >
                    <title>{country.name}</title>
                  </path>
                );
              })}
        </g>

        {/* Pin katmanı */}
        <WorldPinLayer
          events={events}
          revealedCount={revealedCount}
          currentIndex={currentIndex}
          unitColor={unitColor}
        />
      </svg>
    </div>
  );
}

function WorldPinLayer({
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
            key={`world-pin-${idx}`}
            transform={`translate(${ev.x + off.dx} ${ev.y + off.dy})`}
          >
            <circle r={2.5} fill={c} />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={-16}
              stroke="#3a1408"
              strokeWidth={1.5}
            />
            <path
              d="M 0,-16 L 11,-12 L 0,-8 Z"
              fill={isCurrent ? "#c99a3c" : c}
              stroke="#3a1408"
              strokeWidth={0.6}
            />
            <circle
              r={isCurrent ? 4.5 : 3.5}
              fill={isCurrent ? "#c99a3c" : c}
              stroke="#3a1408"
              strokeWidth={1.2}
            />
            {isCurrent && (
              <circle
                r={7}
                fill="none"
                stroke={c}
                strokeWidth={1.6}
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
                fontSize: ev.year ? 10.5 : 10,
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
