/**
 * EisenhowerUnclassifiedSidePanel.tsx
 * Eisenhower matrisi henüz sınıflandırılmamış görevler yan paneli.
 */

import { Todo } from "@/types/types.js";

interface EisenhowerUnclassifiedSidePanelProps {
  lang: string;
  unclassified: Array<{ t: Todo; idx: number }>;
  isDragOver: boolean;
  onDragOver: (e: DragEvent, quadId: string) => void;
  onDragLeave: () => void;
  onDrop: (quadId: string) => void;
  onDragStart: (idx: number) => void;
}

export function EisenhowerUnclassifiedSidePanel({
  lang,
  unclassified,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
}: EisenhowerUnclassifiedSidePanelProps) {
  return (
    <div
      className={`eisenhower-quadrant ${isDragOver ? "drag-over" : ""}`}
      onDragOver={(e) => onDragOver(e, "unclassified")}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop("unclassified")}
      style={{
        width: "280px",
        borderLeft: "1px solid var(--card-border)",
      }}
    >
      <div className="quadrant-title" style={{ color: "var(--text-primary)" }}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
        <span>{lang === "tr" ? "Sınıflandırılmamış" : "Unclassified"}</span>
        <span
          className="quadrant-header-tag"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-secondary)",
          }}
        >
          {unclassified.length} {lang === "tr" ? "Görev" : "Tasks"}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
          marginTop: "8px",
        }}
      >
        {unclassified.length === 0 ? (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              textAlign: "center",
              padding: "20px",
            }}
          >
            {lang === "tr"
              ? "Tüm görevler önceliklendirildi!"
              : "All tasks prioritized!"}
          </div>
        ) : (
          unclassified.map(({ t, idx }) => (
            <div
              key={idx}
              className="eisenhower-task-card"
              draggable
              onDragStart={() => onDragStart(idx)}
            >
              <span>{t.text}</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                }}
              >
                {t.category}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
