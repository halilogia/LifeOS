import type { Ref } from "preact";
import {
  MAP_VIEWBOX,
  type GeoPin,
  CATEGORY_LEGEND,
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
  const currentPin =
    currentIndex >= 0 && currentIndex < total ? pins[currentIndex] : null;
  const pinCatMeta = currentPin?.category
    ? CATEGORY_LEGEND[currentPin.category]
    : null;
  const pinColor = pinCatMeta ? pinCatMeta.color : topicColor;

  // Pin setindeki tüm benzersiz kategoriler (sıra koruyarak)
  const allCatMetas = Array.from(
    new Set(pins.map((p) => p.category).filter((c): c is string => Boolean(c))),
  )
    .map((cat) => CATEGORY_LEGEND[cat])
    .filter(Boolean);
  const hasCategoryLegend = allCatMetas.length > 0;

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

        {/* Konu Pinleri — kategori varsa kendi renginde, yoksa topicColor */}
        {pins.map((pin, idx) => {
          const revealed = idx < revealedCount;
          const isCurrent = idx === currentIndex;
          const pinCat = pin.category ? CATEGORY_LEGEND[pin.category] : null;
          const fillColor = pinCat ? pinCat.color : topicColor;
          return (
            <g
              key={`${legendKey}-${pin.name}`}
              transform={`translate(${pin.x} ${pin.y})`}
              style={{ cursor: "default" }}
            >
              {revealed && (
                <circle
                  r={isCurrent ? 8 : 5}
                  fill={isCurrent ? "#c99a3c" : fillColor}
                  stroke="#3a1408"
                  strokeWidth={1.1}
                />
              )}
              {revealed && isCurrent && (
                <circle
                  r={6}
                  fill="none"
                  stroke={fillColor}
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

      {/* Sağ Üst Kategori Lejantı — tüm alt türler rengiyle */}
      <div
        style={{
          position: "absolute",
          right: 14,
          top: 12,
          background: "rgba(255,255,255,0.60)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "10px",
          padding: "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {hasCategoryLegend ? (
          allCatMetas.map((meta) => (
            <div
              key={meta.name}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: meta.color,
                  border: "1.5px solid #3a1408",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#5a5140",
                  fontWeight: 700,
                }}
              >
                {meta.name}
              </span>
            </div>
          ))
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
            <span
              style={{ fontSize: "0.72rem", color: "#5a5140", fontWeight: 700 }}
            >
              {t[legendKey] || "Konum"}
            </span>
          </div>
        )}
      </div>

      {/* Bilgi Kartı (alt sol) */}
      {currentIndex >= 0 && currentIndex < total && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            maxWidth: 360,
            background: "rgba(30, 24, 16, 0.92)",
            color: "#f4ead7",
            borderRadius: "14px",
            padding: "14px 18px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Sayaç */}
          <div
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: pinColor,
              fontWeight: 800,
            }}
          >
            {currentIndex + 1} / {total}
          </div>

          {/* Konum Adı */}
          <h4
            style={{
              margin: 0,
              fontFamily: "Georgia, serif",
              fontSize: "1.02rem",
              fontWeight: 700,
              color: "#fff4e4",
            }}
          >
            {pins[currentIndex].name}
          </h4>

          {/* İl bilgisi — SVG ikonlu */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.76rem",
              color: "#cfc3aa",
              fontWeight: 600,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {pins[currentIndex].city}
          </div>

          {/* Tür açıklaması: CATEGORY_LEGEND'dan gelen not */}
          {pinCatMeta && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.73rem",
                color: "#cbd5e1",
                lineHeight: 1.4,
                fontStyle: "italic",
              }}
            >
              {pinCatMeta.note}
            </p>
          )}

          {pins[currentIndex].examTip && (
            <div
              style={{
                marginTop: "2px",
                padding: "6px 10px",
                borderRadius: "8px",
                background: "rgba(234, 179, 8, 0.12)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                color: "#fef08a",
                fontSize: "0.72rem",
                lineHeight: 1.3,
                fontWeight: 600,
                display: "flex",
                alignItems: "flex-start",
                gap: "6px",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: "1px" }}
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
              <span>
                <span style={{ fontWeight: 800 }}>KPSS İpucu:</span>{" "}
                {pins[currentIndex].examTip}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
