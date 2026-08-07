/**
 * HaritaBlockView.tsx
 * Presentational component for rendering "```harita" blocks in reading mode.
 */

import { useState } from "preact/hooks";
import type { JSX } from "preact";
import { MAP_VIEWBOX } from "@/domain/constants/TurkeyGeographyData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";
import {
  parseHaritaBlock,
  pinKindColor,
  PIN_KINDS,
} from "./mapPinUtils.js";

interface HaritaBlockProps {
  content: string;
  title?: string;
}

export function HaritaBlock({ content, title }: HaritaBlockProps): JSX.Element {
  const pins = parseHaritaBlock(content);
  const [selected, setSelected] = useState<number>(-1);

  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #f4ecd8, #e6d9b8 55%, #d8c79a 100%)",
        borderRadius: 12,
        padding: 16,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      {title && (
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 13,
            color: "#7a1414",
            marginBottom: 10,
          }}
        >
          {title}
        </div>
      )}
      <svg
        viewBox={MAP_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          cursor: "pointer",
        }}
      >
        {TURKEY_PROVINCE_PATHS.map((province) => (
          <path
            key={province.name}
            d={province.d}
            fill="#d8cba7"
            stroke="#a3906a"
            strokeWidth={0.7}
          />
        ))}
        {pins.map((pin, idx) => (
          <g
            key={`pin-${idx}`}
            transform={`translate(${pin.x} ${pin.y})`}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(selected === idx ? -1 : idx);
            }}
            style={{ cursor: "pointer" }}
          >
            <circle
              r={selected === idx ? 8 : 6}
              fill={pinKindColor(pin.kind)}
              stroke="#3a1408"
              strokeWidth={1.2}
            />
            <text
              y={1}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: 9, pointerEvents: "none" }}
            >
              {PIN_KINDS.find((k) => k.id === pin.kind)?.icon || "🚩"}
            </text>
            {pin.name && (
              <text
                y={-11}
                textAnchor="middle"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 11,
                  fill: "#3a1408",
                  fontWeight: 700,
                  pointerEvents: "none",
                }}
              >
                {pin.name}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Açıklama kartı */}
      {selected >= 0 && selected < pins.length && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            maxWidth: 300,
            background: "rgba(28,18,14,0.93)",
            color: "#f4ead7",
            borderRadius: 12,
            padding: "12px 14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {pins[selected].name && (
            <div style={{ fontWeight: 700, color: "#fff4e4", marginBottom: 3 }}>
              {PIN_KINDS.find((k) => k.id === pins[selected].kind)?.icon ||
                "🚩"}{" "}
              {pins[selected].name}
            </div>
          )}
          {pins[selected].desc && (
            <div style={{ color: "#cfc3aa" }}>{pins[selected].desc}</div>
          )}
          {!pins[selected].name && !pins[selected].desc && (
            <div style={{ color: "#a99a82" }}>
              {PIN_KINDS.find((k) => k.id === pins[selected].kind)?.icon ||
                "🚩"}{" "}
              ({Math.round(pins[selected].x)}, {Math.round(pins[selected].y)})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
