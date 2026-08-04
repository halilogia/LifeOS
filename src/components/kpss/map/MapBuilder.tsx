/**
 * MapBuilder.tsx
 * KPSS Harita Oluşturucu — tıklayarak Türkiye haritasına pin ekler.
 * Şema oluşturucuya paralel çalışır:
 *  - Haritaya tıkla → pin düşer, isim/şehir girersin
 *  - Pin'ler "```harita" bloğu olarak dışa aktarılır (okuma modunda canlı render)
 * Koordinat sistemi: MAP_VIEWBOX (1000x422) — TurkeyProvincePaths ile birebir.
 */
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { MAP_VIEWBOX } from "@/domain/constants/TurkeyGeographyData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";

const VIEWBOX = MAP_VIEWBOX.split(" ").map(Number); // [0, 0, 1000, 421.99]
const VB_W = VIEWBOX[2];
const VB_H = VIEWBOX[3];

/** Pin tipleri — haritada farklı ikonlarla gösterilir */
export type MapPinKind = "flag" | "mountain" | "volcano" | "lake" | "city" | "star";

export const PIN_KINDS: { id: MapPinKind; label: string; icon: string }[] = [
  { id: "flag", label: "Bayrak", icon: "🚩" },
  { id: "city", label: "Şehir", icon: "🏙️" },
  { id: "mountain", label: "Dağ", icon: "⛰️" },
  { id: "volcano", label: "Volkan", icon: "🌋" },
  { id: "lake", label: "Göl", icon: "💧" },
  { id: "star", label: "Önemli", icon: "⭐" },
];

/** Harita oluşturucu pin'i — konum + isteğe bağlı açıklama + tip */
export interface MapPin {
  name: string;
  kind: MapPinKind;
  desc: string;
  x: number;
  y: number;
}

/** "```harita" bloğunu MapPin dizisine çevir (format: İsim|Tip|Açıklama|x|y) */
export function parseHaritaBlock(content: string): MapPin[] {
  const m = content.match(/```harita\s*\n([\s\S]*?)```/);
  if (!m) {
    return [];
  }
  const pins: MapPin[] = [];
  m[1].split("\n").forEach((line) => {
    const parts = line.split("|").map((s) => s.trim());
    if (parts.length >= 4) {
      const x = parseFloat(parts[parts.length - 2]);
      const y = parseFloat(parts[parts.length - 1]);
      if (!isNaN(x) && !isNaN(y)) {
        const kind = (parts[1] as MapPinKind) || "flag";
        pins.push({
          name: parts[0] || "",
          kind: PIN_KINDS.some((k) => k.id === kind) ? kind : "flag",
          desc: parts.length >= 5 ? parts[2] || "" : "",
          x,
          y,
        });
      }
    }
  });
  return pins;
}

/** MapPin dizisini "```harita" bloğu metnine çevir */
export function serializeHaritaBlock(pins: MapPin[]): string {
  if (pins.length === 0) {
    return "";
  }
  const lines = pins.map((p) => `${p.name}|${p.kind}|${p.desc}|${p.x}|${p.y}`);
  return "```harita\n" + lines.join("\n") + "\n```";
}

/** Pin tipine göre renk */
export function pinKindColor(kind: MapPinKind): string {
  switch (kind) {
    case "mountain":
      return "#6b4226";
    case "volcano":
      return "#c8511f";
    case "lake":
      return "#2563eb";
    case "city":
      return "#0ea5e9";
    case "star":
      return "#c99a3c";
    default:
      return "#8c2a1f";
  }
}

interface MapBuilderProps {
  /** Başlangıç pin'leri (```harita bloğundan çözülmüş) */
  initialPins?: MapPin[];
  /** Dışa aktarma bloğu (```harita) — kaydetmede kullanılır */
  onChange?: (serialized: string) => void;
  /** Pin düzenlemesine izin ver (editör modu) */
  editable?: boolean;
  /** Harita başlığı (opsiyonel — boşsa gizli) */
  title?: string;
}

export function MapBuilder({ initialPins = [], onChange, editable = true, title }: MapBuilderProps) {
  const [pins, setPins] = useState<MapPin[]>(initialPins);
  const [editingIdx, setEditingIdx] = useState<number>(-1);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<MapPinKind>("flag");
  const [desc, setDesc] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setPins(initialPins);
  }, [initialPins]);

  // SVG üzerindeki tıklamayı viewBox koordinatına çevir
  const handleClick = (e: MouseEvent) => {
    if (!editable || editingIdx >= 0) {
      return;
    }
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const x = (px / rect.width) * VB_W;
    const y = (py / rect.height) * VB_H;
    // Başlık girilmediyse boş kalsın — "Pin N" otomatik adı yok
    setPins((prev) => [...prev, { name: "", kind: "flag", desc: "", x, y }]);
    setEditingIdx(pins.length);
    setName("");
    setKind("flag");
    setDesc("");
  };

  const saveEdit = () => {
    if (editingIdx < 0) {
      return;
    }
    setPins((prev) => {
      const next = [...prev];
      next[editingIdx] = {
        ...next[editingIdx],
        name: name.trim(),
        kind,
        desc: desc.trim(),
      };
      return next;
    });
    setEditingIdx(-1);
  };

  const removePin = (idx: number) => {
    setPins((prev) => prev.filter((_, i) => i !== idx));
    setEditingIdx(-1);
  };

  const movePin = (idx: number, dir: -1 | 1) => {
    setPins((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // Dışa aktar: her değişiklikte bloğu bildir
  useEffect(() => {
    onChange?.(serializeHaritaBlock(pins));
  }, [pins]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        minWidth: 0,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Harita başlığı — boşsa gizli */}
      {title && title.trim() && (
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 14,
            color: "#7a1414",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 6,
            padding: "6px 14px",
          }}
        >
          {title}
        </div>
      )}

      {/* Harita tuvali */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 320,
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          overflow: "auto",
          background:
            "radial-gradient(ellipse at 30% 20%, #f4ecd8, #e6d9b8 55%, #d8c79a 100%)",
          borderRadius: 12,
          padding: 12,
          boxSizing: "border-box",
          cursor: editable && editingIdx < 0 ? "crosshair" : "default",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={MAP_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleClick}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {TURKEY_PROVINCE_PATHS.map((province) => (
            <path
              key={province.name}
              d={province.d}
              fill="#d8cba7"
              stroke="#a3906a"
              strokeWidth={0.7}
              style={{ pointerEvents: "none" }}
            />
          ))}

          {/* Pin'ler */}
          {pins.map((pin, idx) => (
            <g key={`pin-${idx}`} transform={`translate(${pin.x} ${pin.y})`}>
              <circle
                r={7}
                fill={pinKindColor(pin.kind)}
                stroke="#3a1408"
                strokeWidth={1.2}
                opacity={0.85}
              />
              <text
                y={1}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: 9,
                  pointerEvents: "none",
                }}
              >
                {PIN_KINDS.find((k) => k.id === pin.kind)?.icon || "🚩"}
              </text>
              {pin.name && (
                <text
                  y={-12}
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
      </div>

      {/* Pin düzenleme paneli */}
      {editingIdx >= 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: 8,
            flexWrap: "wrap",
          }}
        >
          <input
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder="Pin adı (ör. Erciyes Dağı)"
            style={{
              flex: 1,
              minWidth: 120,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "6px 10px",
              color: "#fff",
              fontSize: "0.8rem",
              outline: "none",
            }}
          />
          {/* Pin tipi seçici: bayrak / şehir / dağ / volkan / göl / önemli */}
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {PIN_KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                title={k.label}
                style={{
                  background:
                    kind === k.id ? "rgba(200,81,31,0.4)" : "rgba(255,255,255,0.06)",
                  border:
                    kind === k.id
                      ? "1px solid #c8511f"
                      : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                {k.icon}
              </button>
            ))}
          </div>
          <input
            value={desc}
            onInput={(e) => setDesc((e.target as HTMLInputElement).value)}
            placeholder="Açıklama (isteğe bağlı)"
            style={{
              flex: 2,
              minWidth: 180,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "6px 10px",
              color: "#fff",
              fontSize: "0.8rem",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={saveEdit}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ✓ Kaydet
          </button>
          <button
            type="button"
            onClick={() => setEditingIdx(-1)}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#94a3b8",
              border: "none",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            Vazgeç
          </button>
        </div>
      )}

      {/* Pin listesi */}
      {pins.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            maxHeight: 160,
            overflowY: "auto",
          }}
        >
          {pins.map((pin, idx) => (
            <div
              key={`row-${idx}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: "0.78rem",
                color: "#e2e8f0",
              }}
            >
              <span style={{ fontWeight: 700, color: "#c8511f" }}>{idx + 1}.</span>
              <span style={{ fontSize: "0.8rem" }}>
                {PIN_KINDS.find((k) => k.id === pin.kind)?.icon || "🚩"}
              </span>
              <span style={{ fontWeight: 600 }}>{pin.name}</span>
              {pin.desc && (
                <span
                  style={{
                    color: "#64748b",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 200,
                  }}
                >
                  · {pin.desc}
                </span>
              )}
              <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "0.7rem" }}>
                ({Math.round(pin.x)}, {Math.round(pin.y)})
              </span>
              <button
                type="button"
                onClick={() => movePin(idx, -1)}
                title="Yukarı taşı"
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => movePin(idx, 1)}
                title="Aşağı taşı"
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removePin(idx)}
                title="Sil"
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Yardım */}
      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
        Haritaya tıklayarak pin ekle. Pin'i seçip isim/şehir gir, kaydet. Pin'ler "```harita"
        bloğu olarak nota gömülür — okuma modunda canlı harita olarak görünür.
      </div>
    </div>
  );
}

/* ---------- Harita bloğunu render eden bileşen (okuma modu) ---------- */

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
        style={{ width: "100%", height: "auto", display: "block", cursor: "pointer" }}
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

      {/* Açıklama kartı — pin'e tıklanınca (tarih haritasındaki gibi) */}
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
              {PIN_KINDS.find((k) => k.id === pins[selected].kind)?.icon || "🚩"}{" "}
              {pins[selected].name}
            </div>
          )}
          {pins[selected].desc && (
            <div style={{ color: "#cfc3aa" }}>{pins[selected].desc}</div>
          )}
          {!pins[selected].name && !pins[selected].desc && (
            <div style={{ color: "#a99a82" }}>
              {PIN_KINDS.find((k) => k.id === pins[selected].kind)?.icon || "🚩"} (
              {Math.round(pins[selected].x)}, {Math.round(pins[selected].y)})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
