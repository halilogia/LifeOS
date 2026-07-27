/**
 * EisenhowerQuadrantCard.tsx
 * Eisenhower matrisi çeyrek kartı (Sürükle-bırak desteği ve görev listesi).
 */

import { Todo } from "@/types/types.js";
import { ComponentChildren } from "preact";

interface EisenhowerQuadrantCardProps {
  quadId: string;
  title: string;
  headerTag: string;
  headerColor: string;
  tagBg: string;
  icon: ComponentChildren;
  tasks: Array<{ t: Todo; idx: number }>;
  emptyText: string;
  isDragOver: boolean;
  onDragOver: (e: DragEvent, quadId: string) => void;
  onDragLeave: () => void;
  onDrop: (quadId: string) => void;
  onDragStart: (idx: number) => void;
}

export function EisenhowerQuadrantCard({
  quadId,
  title,
  headerTag,
  headerColor,
  tagBg,
  icon,
  tasks,
  emptyText,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
}: EisenhowerQuadrantCardProps) {
  return (
    <div
      className={`eisenhower-quadrant ${isDragOver ? "drag-over" : ""}`}
      onDragOver={(e) => onDragOver(e, quadId)}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(quadId)}
    >
      <div className="quadrant-title" style={{ color: headerColor }}>
        {icon}
        <span>{title}</span>
        <span
          className="quadrant-header-tag"
          style={{
            background: tagBg,
            color: headerColor,
          }}
        >
          {headerTag}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
        }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              textAlign: "center",
              margin: "auto",
            }}
          >
            {emptyText}
          </div>
        ) : (
          tasks.map(({ t, idx }) => (
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
