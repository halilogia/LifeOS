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
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: () => void;
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
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: MapCanvasProps) {
  const total = pins.length;
  return (
    <div
      ref={svgWrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",
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
          height: "auto",
          display: "block",
          maxHeight: isFullscreen ? "calc(100vh - 180px)" : undefined,
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

      {/* Lejant */}
      <div
        style={{
          position: "absolute",
          right: 14,
          top: 12,
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "10px",
          padding: "6px 12px",
          fontSize: "0.72rem",
          color: "#5a5140",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: topicColor,
            border: "1.5px solid #3a1408",
            display: "inline-block",
          }}
        />
        {t[legendKey] || t.kpss_map_legend || "Konum"}
      </div>

      {/* Bilgi Kartı */}
      {currentIndex >= 0 && currentIndex < total && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            maxWidth: 280,
            background: "rgba(30, 24, 16, 0.92)",
            color: "#f4ead7",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: topicColor,
              marginBottom: 3,
            }}
          >
            {currentIndex + 1} / {total}
          </div>
          <h4
            style={{
              margin: "0 0 3px",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              color: "#fff4e4",
            }}
          >
            {pins[currentIndex].name}
          </h4>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#cfc3aa" }}>
            {pins[currentIndex].city}
          </p>
        </div>
      )}
    </div>
  );
}
