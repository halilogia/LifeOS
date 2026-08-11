import type { Ref } from "preact";
import {
  MAP_VIEWBOX,
  type GeoPin,
} from "@/domain/constants/TurkeyGeographyData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";

interface MapCanvasProps {
  t: Record<string, string>;
  topicColor: string;
  legendKey: string;
  pins: GeoPin[];
  revealedCount: number;
  currentIndex: number;
  isFullscreen: boolean;
  svgWrapRef: Ref<HTMLDivElement>;
  view: { x: number; y: number; scale: number };
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: () => void;
  onWheel: (e: WheelEvent) => void;
}

export function MapCanvas({
  t,
  topicColor,
  legendKey,
  pins,
  revealedCount,
  currentIndex,
  isFullscreen,
  svgWrapRef,
  view,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
}: MapCanvasProps) {
  const total = pins.length;
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
        viewBox={MAP_VIEWBOX}
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

        {/* Konu Pinleri */}
        {pins.map((pin, idx) => {
          const revealed = idx < revealedCount;
          const isCurrent = idx === currentIndex;
          return (
            <g
              key={`${legendKey}-${pin.name}`}
              transform={`translate(${pin.x} ${pin.y})`}
              style={{ cursor: "default" }}
            >
              {revealed && (
                <circle
                  r={isCurrent ? 8 : 5}
                  fill={isCurrent ? "#c99a3c" : topicColor}
                  stroke="#3a1408"
                  strokeWidth={1.1}
                />
              )}
              {revealed && isCurrent && (
                <circle
                  r={6}
                  fill="none"
                  stroke={topicColor}
                  strokeWidth={1.5}
                  style={{
                    animation: "mapPulse 1.4s ease-out infinite",
                    transformOrigin: "center",
                  }}
                />
              )}
              {revealed && (
                <text
                  y={-10}
                  textAnchor="middle"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 13,
                    fill: "#3a1408",
                    fontWeight: 700,
                    pointerEvents: "none",
                  }}
                >
                  {pin.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Bilgi Kartı */}
      {currentIndex >= 0 && currentIndex < total && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            maxWidth: 320,
            background: "rgba(15, 23, 42, 0.94)",
            color: "#f4ead7",
            borderRadius: "14px",
            padding: "12px 16px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: topicColor,
              fontWeight: 800,
            }}
          >
            <span>{t[legendKey] || "Konum Bilgisi"}</span>
            <span>
              {currentIndex + 1} / {total}
            </span>
          </div>
          <h4
            style={{
              margin: 0,
              fontFamily: "Georgia, serif",
              fontSize: "0.98rem",
              fontWeight: 700,
              color: "#fff4e4",
            }}
          >
            {pins[currentIndex].name}
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "0.76rem",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            📍 {pins[currentIndex].city}
          </p>

          {pins[currentIndex].description && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.75rem",
                color: "#e2e8f0",
                lineHeight: 1.35,
              }}
            >
              {pins[currentIndex].description}
            </p>
          )}

          {pins[currentIndex].examTip && (
            <div
              style={{
                marginTop: "4px",
                padding: "6px 8px",
                borderRadius: "8px",
                background: "rgba(234, 179, 8, 0.12)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                color: "#fef08a",
                fontSize: "0.72rem",
                lineHeight: 1.3,
                fontWeight: 600,
              }}
            >
              💡 <span style={{ fontWeight: 800 }}>KPSS İpucu:</span>{" "}
              {pins[currentIndex].examTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
