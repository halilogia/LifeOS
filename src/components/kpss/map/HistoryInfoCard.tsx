/**
 * HistoryInfoCard.tsx
 * Harita içi bilgi kartı — sol alt köşede.
 * Tuval: HistoryMapView.tsx
 */
import type { HistoryEvent, HistoryDiagramNode } from "@/domain/constants/TurkeyHistoryData.js";

interface HistoryInfoCardProps {
  ev: HistoryEvent | HistoryDiagramNode;
  isDiagram: boolean;
  currentIndex: number;
  total: number;
  unitColor: string;
}

export function HistoryInfoCard({
  ev,
  isDiagram,
  currentIndex,
  total,
  unitColor,
}: HistoryInfoCardProps) {
  const year =
    !isDiagram && "year" in ev && ev.year ? String(ev.year) : "";

  return (
    <div
      style={{
        position: "absolute",
        left: 26,
        bottom: 26,
        maxWidth: 320,
        background: "rgba(28,18,14,0.93)",
        color: "#f4ead7",
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.08)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: unitColor,
          marginBottom: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span>
          {currentIndex + 1} / {total}
        </span>
        {year && (
          <span style={{ color: "#c99a3c", fontWeight: 700 }}>{year}</span>
        )}
      </div>
      {"tag" in ev && ev.tag && (
        <span
          style={{
            display: "inline-block",
            fontSize: 10,
            background: "rgba(201,154,60,0.18)",
            color: "#c99a3c",
            border: "1px solid rgba(201,154,60,0.4)",
            padding: "2px 8px",
            borderRadius: 20,
            marginBottom: 6,
          }}
        >
          {ev.tag}
        </span>
      )}
      <h3
        style={{
          margin: "0 0 3px",
          fontFamily:
            "'Iowan Old Style','Palatino Linotype',Georgia,serif",
          fontSize: 17,
          color: "#fff4e4",
        }}
      >
        {isDiagram && "label" in ev
          ? ev.label
          : "title" in ev
            ? ev.title
            : ""}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 12.5,
          color: "#cfc3aa",
          lineHeight: 1.45,
        }}
      >
        {ev.desc}
      </p>
      {"city" in ev && ev.city && (
        <div
          style={{
            fontSize: 11.5,
            color: "#a99a82",
            marginTop: 6,
            fontStyle: "italic",
          }}
        >
          {ev.city}
        </div>
      )}
    </div>
  );
}
