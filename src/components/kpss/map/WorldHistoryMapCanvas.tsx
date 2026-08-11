/**
 * WorldHistoryMapCanvas.tsx
 * D3.js + TopoJSON ile gerçek dünya ülke sınırlarını çizerek Osmanlı Yükselme, Duraklama, Gerileme
 * ve Dağılma dönemlerini gösteren dinamik küresel harita katmanı.
 */
import { useState } from "preact/hooks";
import type { Ref } from "preact";
import { WORLD_VIEWBOX } from "@/domain/constants/history/WorldProvincePaths.js";
import {
  getWorldFeaturesSync,
  getIsoCodesForRegion,
  geoToSvgCoords,
  type CountryGeoFeature,
} from "@/domain/constants/history/WorldMapGeoService.js";
import type { HistoryEvent } from "@/domain/constants/history/types.js";

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
  onPointerUp: (e: PointerEvent) => void;
  onWheel: (e: WheelEvent) => void;
}

interface PinOffset {
  dx: number;
  dy: number;
  textY: number;
}

function getEventCoords(ev: HistoryEvent): { x: number; y: number } {
  if (ev.lon !== undefined && ev.lat !== undefined) {
    return geoToSvgCoords(ev.lon, ev.lat);
  }
  return { x: ev.x, y: ev.y };
}

function getPinOffsets(events: HistoryEvent[]): Map<number, PinOffset> {
  const result = new Map<number, PinOffset>();
  const coordsList = events.map(getEventCoords);

  for (let i = 0; i < events.length; i++) {
    // Çakışan/yakın olan diğer pin sayılarını tespit edelim
    const neighbors: number[] = [];
    for (let j = 0; j < events.length; j++) {
      if (i === j) {
        continue;
      }
      const dist = Math.hypot(coordsList[i].x - coordsList[j].x, coordsList[i].y - coordsList[j].y);
      if (dist < 80) {
        neighbors.push(j);
      }
    }

    // Yakın komşu varsa yazıları yukarı/aşağı kısa mesafeli dağıt
    if (neighbors.length > 0) {
      const yOffsets = [-14, 15, -24, 26, -34];
      const textY = yOffsets[i % yOffsets.length];
      const dx = (i % 2 === 0 ? 1 : -1) * (i % 3) * 4;
      result.set(i, { dx, dy: 0, textY });
    } else {
      result.set(i, { dx: 0, dy: 0, textY: -14 });
    }
  }

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
  // Anında (0ms) senkron harita özellikleri yüklemesi
  const [geoFeatures] = useState<CountryGeoFeature[]>(() => getWorldFeaturesSync());

  // Aktif boyalı ISO kod haritası oluşturma
  const activeIsoColors = new Map<string, string>();
  territoryColors.forEach((color, regionKey) => {
    const isoCodes = getIsoCodesForRegion(regionKey);
    isoCodes.forEach((code) => activeIsoColors.set(code, color));
  });

  const pinOffsets = getPinOffsets(events);
  const activeEvents = events.slice(0, revealedCount);

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
        {/* Gerçek Dünya Ülke Sınırları (0ms Anında Render) */}
        <g>
          {geoFeatures.map((country) => {
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
          })}
        </g>

        {/* Pinler ve Olay İşaretçileri */}
        <g>
          {activeEvents.map((ev, index) => {
            const isCurrent = index === currentIndex;
            const offset = pinOffsets.get(index) || { dx: 0, dy: 0, textY: -14 };
            const baseCoords = getEventCoords(ev);
            const pinX = baseCoords.x + offset.dx;
            const pinY = baseCoords.y + offset.dy;
            const pinColor = ev.color || unitColor;

            // Yazı genişliğine göre kibar koyu rozet arka planı
            const textLength = ev.title.length;
            const rectWidth = textLength * 5.8 + 8;
            const rectHeight = 15;

            return (
              <g
                key={`event-pin-${ev.year || index}-${index}`}
                transform={`translate(${pinX}, ${pinY})`}
                style={{ cursor: "pointer" }}
              >
                {/* Vurgulu Olay Dairesi Halesi */}
                {isCurrent && (
                  <circle
                    r={13}
                    fill="none"
                    stroke={pinColor}
                    strokeWidth={1.5}
                    style={{ animation: "historyPulse 1.6s infinite" }}
                  />
                )}

                {/* Küçültülmüş Kibar Pin İkon Noktası */}
                <circle
                  r={isCurrent ? 6.5 : 4.5}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* Yazı Arka Plan Rozeti (Kısaltılmış Mesafeli Kibar Rozet) */}
                <g transform={`translate(0, ${offset.textY - 7})`}>
                  <rect
                    x={-rectWidth / 2}
                    y={-8.5}
                    width={rectWidth}
                    height={rectHeight}
                    rx={4}
                    ry={4}
                    fill={isCurrent ? "#0f172a" : "rgba(15, 23, 42, 0.82)"}
                    stroke={isCurrent ? pinColor : "rgba(255, 255, 255, 0.2)"}
                    strokeWidth={isCurrent ? 1.2 : 0.6}
                  />

                  {/* Etiket Yazısı (Kibar Boyut) */}
                  <text
                    y={2.5}
                    textAnchor="middle"
                    fill={isCurrent ? "#fbbf24" : "#ffffff"}
                    fontSize={isCurrent ? 10.5 : 9.5}
                    fontWeight={isCurrent ? "700" : "500"}
                    style={{
                      pointerEvents: "none",
                    }}
                  >
                    {ev.title}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
