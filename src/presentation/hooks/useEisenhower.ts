import { useState, useEffect, useCallback } from "preact/hooks";
import { Todo } from "@/types/types.js";

interface UseEisenhowerOptions {
  todos: Todo[];
  defaultTab?: "matrix" | "kanban";
  onUpdateTodoUrgentImportant: (
    originalIndex: number,
    urgent: boolean | undefined,
    important: boolean | undefined,
  ) => void;
}

/**
 * Eisenhower matris state + drag-drop + quadrant bölme mantığı.
 * (AGENTS.md 6.3: presentation/hooks/) — View sadece JSX render eder.
 */
export function useEisenhower({
  todos,
  defaultTab = "kanban",
  onUpdateTodoUrgentImportant,
}: UseEisenhowerOptions) {
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

  const handleDragStart = useCallback((idx: number) => {
    setDraggedIndex(idx);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, quadId: string) => {
    e.preventDefault();
    setDragOverQuad(quadId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverQuad(null);
  }, []);

  const handleDrop = useCallback(
    (quadId: string) => {
      setDragOverQuad(null);
      if (draggedIndex === null) {
        return;
      }

      let urgent: boolean | undefined = undefined;
      let important: boolean | undefined = undefined;

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
    },
    [draggedIndex, onUpdateTodoUrgentImportant],
  );

  return {
    activeTab,
    setActiveTab,
    draggedIndex,
    dragOverQuad,
    q1,
    q2,
    q3,
    q4,
    unclassified,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
