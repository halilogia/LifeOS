import { useState, useEffect } from "preact/hooks";
import { Todo, Language } from "../types/types.js";
import { KanbanView } from "./KanbanView.js";

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
          {lang === "tr" ? "Eisenhower Matrisi" : "Eisenhower Matrix"}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "kanban" ? "active" : ""}`}
          onClick={() => setActiveTab("kanban")}
        >
          {lang === "tr" ? "Kanban Tahtası" : "Kanban Board"}
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
            <div
              className={`eisenhower-quadrant ${dragOverQuad === "q1" ? "drag-over" : ""}`}
              onDragOver={(e) => handleDragOver(e, "q1")}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop("q1")}
            >
              <div className="quadrant-title" style={{ color: "#ef4444" }}>
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
                <span>{lang === "tr" ? "Hemen Yap" : "Do First"}</span>
                <span
                  className="quadrant-header-tag"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                  }}
                >
                  {lang === "tr" ? "Acil & Önemli" : "Urgent & Important"}
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
                {q1.length === 0 ? (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    {lang === "tr"
                      ? "Buraya görev sürükleyin"
                      : "Drag tasks here"}
                  </div>
                ) : (
                  q1.map(({ t, idx }) => (
                    <div
                      key={idx}
                      className="eisenhower-task-card"
                      draggable
                      onDragStart={() => handleDragStart(idx)}
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

            {/* Q2: Important & Not Urgent */}
            <div
              className={`eisenhower-quadrant ${dragOverQuad === "q2" ? "drag-over" : ""}`}
              onDragOver={(e) => handleDragOver(e, "q2")}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop("q2")}
            >
              <div className="quadrant-title" style={{ color: "#8b5cf6" }}>
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
                <span>{lang === "tr" ? "Planla" : "Schedule"}</span>
                <span
                  className="quadrant-header-tag"
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    color: "#8b5cf6",
                  }}
                >
                  {lang === "tr"
                    ? "Acil Değil & Önemli"
                    : "Not Urgent & Important"}
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
                {q2.length === 0 ? (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    {lang === "tr"
                      ? "Buraya görev sürükleyin"
                      : "Drag tasks here"}
                  </div>
                ) : (
                  q2.map(({ t, idx }) => (
                    <div
                      key={idx}
                      className="eisenhower-task-card"
                      draggable
                      onDragStart={() => handleDragStart(idx)}
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

            {/* Q3: Urgent & Not Important */}
            <div
              className={`eisenhower-quadrant ${dragOverQuad === "q3" ? "drag-over" : ""}`}
              onDragOver={(e) => handleDragOver(e, "q3")}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop("q3")}
            >
              <div className="quadrant-title" style={{ color: "#f59e0b" }}>
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
                <span>{lang === "tr" ? "Delege Et" : "Delegate"}</span>
                <span
                  className="quadrant-header-tag"
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    color: "#f59e0b",
                  }}
                >
                  {lang === "tr"
                    ? "Acil & Önemli Değil"
                    : "Urgent & Not Important"}
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
                {q3.length === 0 ? (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    {lang === "tr"
                      ? "Buraya görev sürükleyin"
                      : "Drag tasks here"}
                  </div>
                ) : (
                  q3.map(({ t, idx }) => (
                    <div
                      key={idx}
                      className="eisenhower-task-card"
                      draggable
                      onDragStart={() => handleDragStart(idx)}
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

            {/* Q4: Not Urgent & Not Important */}
            <div
              className={`eisenhower-quadrant ${dragOverQuad === "q4" ? "drag-over" : ""}`}
              onDragOver={(e) => handleDragOver(e, "q4")}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop("q4")}
            >
              <div className="quadrant-title" style={{ color: "#3b82f6" }}>
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
                <span>{lang === "tr" ? "Ele / Ertele" : "Eliminate"}</span>
                <span
                  className="quadrant-header-tag"
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    color: "#3b82f6",
                  }}
                >
                  {lang === "tr"
                    ? "Acil Değil & Önemli Değil"
                    : "Not Urgent & Not Important"}
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
                {q4.length === 0 ? (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    {lang === "tr"
                      ? "Buraya görev sürükleyin"
                      : "Drag tasks here"}
                  </div>
                ) : (
                  q4.map(({ t, idx }) => (
                    <div
                      key={idx}
                      className="eisenhower-task-card"
                      draggable
                      onDragStart={() => handleDragStart(idx)}
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
          </div>

          {/* Side list of Unclassified Tasks */}
          <div
            className={`eisenhower-quadrant ${dragOverQuad === "unclassified" ? "drag-over" : ""}`}
            onDragOver={(e) => handleDragOver(e, "unclassified")}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop("unclassified")}
            style={{
              width: "280px",
              borderLeft: "1px solid var(--card-border)",
            }}
          >
            <div
              className="quadrant-title"
              style={{ color: "var(--text-primary)" }}
            >
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
              <span>
                {lang === "tr" ? "Sınıflandırılmamış" : "Unclassified"}
              </span>
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
                    onDragStart={() => handleDragStart(idx)}
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
