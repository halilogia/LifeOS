/**
 * MapQuizCanvas.tsx
 * İnteraktif Harita Sınavı Tuvali.
 * Türkiye haritası üzerindeki nokta pinlerini etkileşimli hedef olarak çizer.
 */

import type { Ref } from "preact";
import { useState } from "preact/hooks";
import { MAP_VIEWBOX, GeoPin } from "@/domain/constants/TurkeyGeographyData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";

interface MapQuizCanvasProps {
  t: Record<string, string>;
  topicColor: string;
  allTopicPins: GeoPin[];
  currentTarget: GeoPin | null;
  solvedPinNames: Set<string>;
  showHint: boolean;
  wrongAttemptPin: GeoPin | null;
  isFullscreen: boolean;
  svgWrapRef: Ref<HTMLDivElement>;
  view: { x: number; y: number; scale: number };
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: () => void;
  onWheel: (e: WheelEvent) => void;
  onGuessPin: (pin: GeoPin) => void;
}

export function MapQuizCanvas({
  t,
  topicColor,
  allTopicPins,
  currentTarget,
  solvedPinNames,
  showHint,
  wrongAttemptPin,
  isFullscreen,
  svgWrapRef,
  view,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onGuessPin,
}: MapQuizCanvasProps) {
  const [hoveredPinName, setHoveredPinName] = useState<string | null>(null);

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
        height: isFullscreen ? undefined : 520,
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        background:
          "radial-gradient(ellipse at 30% 20%, #f4ecd8, #e6d9b8 55%, #d8c79a 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <svg
        viewBox={MAP_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          maxHeight: isFullscreen ? "calc(100vh - 200px)" : undefined,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
          transition: "transform 0.05s linear",
        }}
      >
        {/* İl Sınırları */}
        {TURKEY_PROVINCE_PATHS.map((province) => (
          <path
            key={province.name}
            d={province.d}
            fill="#d8cba7"
            stroke="#a3906a"
            strokeWidth={0.7}
            style={{ transition: "fill 0.3s" }}
          />
        ))}

        {/* İnteraktif Hedef Düğümleri (Target Nodes) */}
        {allTopicPins.map((pin, idx) => {
          const isSolved = solvedPinNames.has(pin.name);
          const isTarget = currentTarget?.name === pin.name;
          const isWrongAttempt = wrongAttemptPin?.name === pin.name;
          const isHovered = hoveredPinName === pin.name;
          const isHinted = isTarget && showHint;

          return (
            <g
              key={`quiz-node-${idx}-${pin.name}`}
              transform={`translate(${pin.x} ${pin.y})`}
              // Tıklama: pointerdown'da yakala — üstteki drag handler'ı
              // setPointerCapture yaptığı için click event'i pin'e ulaşmıyordu.
              onPointerDown={(e) => {
                e.stopPropagation();
                onGuessPin(pin);
              }}
              onPointerOver={() => setHoveredPinName(pin.name)}
              onPointerOut={() => setHoveredPinName(null)}
              style={{ cursor: "pointer" }}
            >
              {/* İpucu Yanıp Sönen Sarı Halka (SVG native animate) */}
              {isHinted && (
                <circle r={0} fill="none" stroke="#eab308" strokeWidth={2.5}>
                  <animate
                    attributeName="r"
                    values="10;20"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Yanlış Tıklama Kırmızı Titreşim Halkası */}
              {isWrongAttempt && (
                <circle
                  r={14}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth={2}
                  style={{
                    animation: "mapQuizShake 0.4s ease-in-out",
                  }}
                />
              )}

              {/* Düğüm Dış Çerçevesi (Hover / Active) */}
              <circle
                r={isHovered ? 10 : isSolved ? 7 : 6}
                fill={
                  isSolved
                    ? "#16a34a"
                    : isWrongAttempt
                      ? "#dc2626"
                      : isHovered
                        ? "#f59e0b"
                        : topicColor
                }
                stroke="#2a1208"
                strokeWidth={isHovered ? 2 : 1.2}
                style={{
                  transition: "all 0.15s ease",
                  filter: isHovered
                    ? "drop-shadow(0 0 6px rgba(0,0,0,0.4))"
                    : undefined,
                }}
              />

              {/* Çözülen Konumlar İçin Yeşil İç Simge */}
              {isSolved && (
                <text
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: 8,
                    fill: "#ffffff",
                    fontWeight: 900,
                    pointerEvents: "none",
                  }}
                >
                  ✓
                </text>
              )}

              {/* Çözülen Konumların İsim Etiketi */}
              {isSolved && (
                <text
                  y={-10}
                  textAnchor="middle"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 11,
                    fill: "#14532d",
                    fontWeight: 800,
                    pointerEvents: "none",
                  }}
                >
                  {pin.name}
                </text>
              )}

              {/* Hover Durumunda Konum İpucu (İl ismi) */}
              {isHovered && !isSolved && (
                <g transform="translate(0, -14)">
                  <rect
                    x={-40}
                    y={-14}
                    width={80}
                    height={16}
                    rx={4}
                    fill="rgba(30, 24, 16, 0.9)"
                    stroke="rgba(255,255,255,0.2)"
                  />
                  <text
                    y={-4}
                    textAnchor="middle"
                    style={{
                      fontSize: 9,
                      fill: "#fef08a",
                      fontWeight: 700,
                      pointerEvents: "none",
                    }}
                  >
                    {pin.city || "?"}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Keyframe Stilleri */}
      <style>{`
        @keyframes mapQuizShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        @keyframes mapFeedbackPop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
