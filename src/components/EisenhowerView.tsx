import { useState } from "preact/hooks";
import { Todo, Language } from "../types/types.js";

interface EisenhowerViewProps {
  todos: Todo[];
  lang: Language;
  onUpdateTodoUrgentImportant: (originalIndex: number, urgent: any, important: any) => void;
}

export function EisenhowerView({
  todos,
  lang,
  onUpdateTodoUrgentImportant,
}: EisenhowerViewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverQuad, setDragOverQuad] = useState<string | null>(null);

  // Divide tasks into quadrants (exclude completed tasks)
  const q1 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.urgent === true && t.important === true && !t.completed);

  const q2 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.urgent === false && t.important === true && !t.completed);

  const q3 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.urgent === true && t.important === false && !t.completed);

  const q4 = todos
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.urgent === false && t.important === false && !t.completed);

  const unclassified = todos
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => (t.urgent === undefined || t.important === undefined) && !t.completed);

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
    if (draggedIndex === null) return;

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
    <div className="view-content active" id="eisenhower-view" style={{ display: "flex", gap: "24px", height: "calc(100vh - 200px)" }}>
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

      {/* Eisenhower 2x2 Matrix Board */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "16px" }}>
        
        {/* Q1: Urgent & Important */}
        <div
          className={`eisenhower-quadrant ${dragOverQuad === "q1" ? "drag-over" : ""}`}
          onDragOver={(e) => handleDragOver(e, "q1")}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop("q1")}
        >
          <div className="quadrant-title" style={{ color: "#ef4444" }}>
            <span>🔥 {lang === "tr" ? "Hemen Yap" : "Do First"}</span>
            <span className="quadrant-header-tag" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              {lang === "tr" ? "Acil & Önemli" : "Urgent & Important"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {q1.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", margin: "auto" }}>
                {lang === "tr" ? "Buraya görev sürükleyin" : "Drag tasks here"}
              </div>
            ) : (
              q1.map(({ t, idx }) => (
                <div key={idx} className="eisenhower-task-card" draggable onDragStart={() => handleDragStart(idx)}>
                  <span>{t.text}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{t.category}</span>
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
            <span>📅 {lang === "tr" ? "Planla" : "Schedule"}</span>
            <span className="quadrant-header-tag" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
              {lang === "tr" ? "Acil Değil & Önemli" : "Not Urgent & Important"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {q2.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", margin: "auto" }}>
                {lang === "tr" ? "Buraya görev sürükleyin" : "Drag tasks here"}
              </div>
            ) : (
              q2.map(({ t, idx }) => (
                <div key={idx} className="eisenhower-task-card" draggable onDragStart={() => handleDragStart(idx)}>
                  <span>{t.text}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{t.category}</span>
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
            <span>🙋‍♂️ {lang === "tr" ? "Delege Et" : "Delegate"}</span>
            <span className="quadrant-header-tag" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
              {lang === "tr" ? "Acil & Önemli Değil" : "Urgent & Not Important"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {q3.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", margin: "auto" }}>
                {lang === "tr" ? "Buraya görev sürükleyin" : "Drag tasks here"}
              </div>
            ) : (
              q3.map(({ t, idx }) => (
                <div key={idx} className="eisenhower-task-card" draggable onDragStart={() => handleDragStart(idx)}>
                  <span>{t.text}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{t.category}</span>
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
            <span>🗑️ {lang === "tr" ? "Ele / Ertele" : "Eliminate"}</span>
            <span className="quadrant-header-tag" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
              {lang === "tr" ? "Acil Değil & Önemli Değil" : "Not Urgent & Not Important"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {q4.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", margin: "auto" }}>
                {lang === "tr" ? "Buraya görev sürükleyin" : "Drag tasks here"}
              </div>
            ) : (
              q4.map(({ t, idx }) => (
                <div key={idx} className="eisenhower-task-card" draggable onDragStart={() => handleDragStart(idx)}>
                  <span>{t.text}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{t.category}</span>
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
        style={{ width: "280px", borderLeft: "1px solid var(--card-border)" }}
      >
        <div className="quadrant-title" style={{ color: "var(--text-primary)" }}>
          <span>📥 {lang === "tr" ? "Sınıflandırılmamış" : "Unclassified"}</span>
          <span className="quadrant-header-tag" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}>
            {unclassified.length} {lang === "tr" ? "Görev" : "Tasks"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, marginTop: "8px" }}>
          {unclassified.length === 0 ? (
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
              {lang === "tr" ? "Tüm görevler önceliklendirildi!" : "All tasks prioritized!"}
            </div>
          ) : (
            unclassified.map(({ t, idx }) => (
              <div key={idx} className="eisenhower-task-card" draggable onDragStart={() => handleDragStart(idx)}>
                <span>{t.text}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{t.category}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
