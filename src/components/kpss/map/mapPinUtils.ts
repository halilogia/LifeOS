/**
 * mapPinUtils.ts
 * Map pin data model, parser, serializer, and color helpers for KPSS Harita.
 */

export type MapPinKind =
  "flag" | "mountain" | "volcano" | "lake" | "city" | "star";

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
