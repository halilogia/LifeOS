/**
 * EisenhowerView.tsx
 * Eisenhower Önceliklendirme Matrisi ve Kanban Tahtası Görünümü.
 * Layout Assembly Pattern ile parçalarına ayrıştırılmıştır.
 */

import { useState, useEffect } from "preact/hooks";
import { Todo, Language } from "@/types/types.js";
import { KanbanView } from "@/components/KanbanView.js";
import { translations } from "@/utils/i18n.js";

// Extracted Sub-components
import { EisenhowerQuadrantCard } from "@/components/eisenhower/EisenhowerQuadrantCard.js";
import { EisenhowerUnclassifiedSidePanel } from "@/components/eisenhower/EisenhowerUnclassifiedSidePanel.js";

interface EisenhowerViewProps {
  todos: Todo[];
  lang: Language;
  defaultTab?: "matrix" | "kanban";
  onUpdateTodoUrgentImportant: (
    originalIndex: number,
    urgent: any,
    important: any,
  ) => void;
  onMoveTaskStatus: (index: number, newStatus: Todo["status"]) => void;
  onMoveTaskDirection: (index: number, direction: number) => void;
}

export function EisenhowerView({
  todos,
  lang,
  defaultTab = "kanban",
  onUpdateTodoUrgentImportant,
  onMoveTaskStatus,
  onMoveTaskDirection,
}: EisenhowerViewProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<"matrix" | "kanban">(defaultTab);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverQuad, setDragOverQuad] = useState<string | null>(null);

  // Sync active tab state with sidebar selection triggers
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Divide tasks into quadrants (exclude completed tasks)
  const q1 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(
      ({ t }) => t.urgent === true && t.important === true && !t.completed,
    );

  const q2 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(
      ({ t }) => t.urgent === false && t.important === true && !t.completed,
    );

  const q3 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(
      ({ t }) => t.urgent === true && t.important === false && !t.completed,
    );

  const q4 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(
      ({ t }) => t.urgent === false && t.important === false && !t.completed,
    );

  const unclassified = todos
    .map((t, idx) => ({ t, idx }))
    .filter(
      ({ t }) =>
        (t.urgent === undefined || t.important === undefined) && !t.completed,
    );

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: DragEvent, quadId: string) => {
    e.preventDefault();
    setDragOverQuad(quadId);
  };

  const handleDragLeave = () => {
    setDragOverQuad(null);
  };

  const handleDrop = (quadId: string) => {
    setDragOverQuad(null);
    if (draggedIndex === null) {
      return;
    }

    let urgent: any = undefined;
    let important: any = undefined;

    if (quadId === "q1") {
      urgent = true;
      important = true;
    } else if (quadId === "q2") {
      urgent = false;
      important = true;
    } else if (quadId === "q3") {
      urgent = true;
      important = false;
    } else if (quadId === "q4") {
      urgent = false;
      important = false;
    }

    onUpdateTodoUrgentImportant(draggedIndex, urgent, important);
    setDraggedIndex(null);
  };

  const emptyText = t.eisenhower_drag_hint;

  return (
    <div
      className="view-content active"
      id="eisenhower-view"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "calc(100vh - 120px)",
      }}
    >
      {/* CSS Overrides specifically for Eisenhower Matrix Grid */}
      <style>{`
        .eisenhower-quadrant {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 200px;
          transition: all 0.3s ease;
          overflow-y: auto;
        }
        .eisenhower-quadrant.drag-over {
          background: rgba(139, 92, 246, 0.08);
          border-color: var(--accent-color);
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.2);
        }
        .eisenhower-task-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.82rem;
          color: var(--text-primary);
          cursor: grab;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .eisenhower-task-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }
        .eisenhower-task-card:active {
          cursor: grabbing;
        }
        .quadrant-title {
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .quadrant-header-tag {
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 800;
          text-transform: uppercase;
        }
      `}</style>

      {/* Sub-Tab Navigation Header */}
      <div
        className="pomodoro-tab-header"
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "flex-start",
          gap: "10px",
        }}
      >
        <button
          className={`pomo-tab-link ${activeTab === "matrix" ? "active" : ""}`}
          onClick={() => setActiveTab("matrix")}
        >
          {t.eisenhower_title}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "kanban" ? "active" : ""}`}
          onClick={() => setActiveTab("kanban")}
        >
          {t.eisenhower_kanban_title}
        </button>
      </div>

      {activeTab === "matrix" ? (
        <div
          style={{
            display: "flex",
            gap: "24px",
            flex: 1,
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* Eisenhower 2x2 Matrix Board */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: "16px",
            }}
          >
            {/* Q1: Urgent & Important */}
            <EisenhowerQuadrantCard
              quadId="q1"
              title={t.eisenhower_do_first}
              headerTag={t.eisenhower_urgent_important}
              headerColor="#ef4444"
              tagBg="rgba(239, 68, 68, 0.1)"
              icon={
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
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              }
              tasks={q1}
              emptyText={emptyText}
              isDragOver={dragOverQuad === "q1"}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />

            {/* Q2: Important & Not Urgent */}
            <EisenhowerQuadrantCard
              quadId="q2"
              title={t.eisenhower_schedule}
              headerTag={t.eisenhower_not_urgent_important}
              headerColor="#8b5cf6"
              tagBg="rgba(139, 92, 246, 0.1)"
              icon={
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
              tasks={q2}
              emptyText={emptyText}
              isDragOver={dragOverQuad === "q2"}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />

            {/* Q3: Urgent & Not Important */}
            <EisenhowerQuadrantCard
              quadId="q3"
              title={t.eisenhower_delegate}
              headerTag={t.eisenhower_urgent_not_important}
              headerColor="#f59e0b"
              tagBg="rgba(245, 158, 11, 0.1)"
              icon={
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              }
              tasks={q3}
              emptyText={emptyText}
              isDragOver={dragOverQuad === "q3"}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />

            {/* Q4: Not Urgent & Not Important */}
            <EisenhowerQuadrantCard
              quadId="q4"
              title={t.eisenhower_eliminate}
              headerTag={t.eisenhower_not_urgent_not_important}
              headerColor="#3b82f6"
              tagBg="rgba(59, 130, 246, 0.1)"
              icon={
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              }
              tasks={q4}
              emptyText={emptyText}
              isDragOver={dragOverQuad === "q4"}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />
          </div>

          {/* Side list of Unclassified Tasks */}
          <EisenhowerUnclassifiedSidePanel
            lang={lang}
            unclassified={unclassified}
            isDragOver={dragOverQuad === "unclassified"}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
          />
        </div>
      ) : (
        <div style={{ flex: 1, height: "100%", overflowY: "auto" }}>
          <KanbanView
            todos={todos}
            lang={lang}
            onMoveTaskStatus={onMoveTaskStatus}
            onMoveTaskDirection={onMoveTaskDirection}
          />
        </div>
      )}
    </div>
  );
}