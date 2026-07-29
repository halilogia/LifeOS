/**
 * useAppTodoInput Hook
 * Manages todo input state (text, repeat, dueDate) and related handlers.
 * Extracted from App.tsx to reduce monolith size.
 */

import { useState, useCallback } from "preact/hooks";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Language } from "@/domain/value-objects/Language.js";
import type { ChangeEvent, KeyboardEvent } from "preact";

interface UseAppTodoInputProps {
  lang: Language;
  onAddTodo: (text: string, repeat: Todo["repeat"], dueDate: string) => void;
  activeTab: "focus" | "routines";
  setActiveTab: (tab: "focus" | "routines") => void;
  setActiveView: (view: string) => void;
  handleTabChangeUI: (tab: "focus" | "routines") => void;
}

export function useAppTodoInput({
  lang,
  onAddTodo,
  activeTab,
  setActiveTab,
  setActiveView,
  handleTabChangeUI,
}: UseAppTodoInputProps) {
  const [todoText, setTodoText] = useState("");
  const [todoRepeat, setTodoRepeat] = useState<Todo["repeat"]>("none");
  const [todoDueDate, setTodoDueDate] = useState("");

  const handleAddTodoClick = useCallback(() => {
    if (todoText.trim()) {
      onAddTodo(todoText.trim(), todoRepeat, todoDueDate);
      setTodoText("");
      setTodoDueDate("");
    }
  }, [todoText, todoRepeat, todoDueDate, onAddTodo]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && todoText.trim()) {
        onAddTodo(todoText.trim(), todoRepeat, todoDueDate);
        setTodoText("");
        setTodoDueDate("");
      }
    },
    [todoText, todoRepeat, todoDueDate, onAddTodo]
  );

  const handleRepeatChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value as Todo["repeat"];
      setTodoRepeat(val);
      setActiveTab(val === "none" ? "focus" : "routines");
    },
    [setActiveTab]
  );

  const handleTabChange = useCallback(
    (tabVal: "focus" | "routines") => {
      setActiveView("list");
      setActiveTab(tabVal);
      setTodoRepeat(tabVal === "focus" ? "none" : "daily");
      handleTabChangeUI(tabVal);
    },
    [setActiveView, setActiveTab, handleTabChangeUI]
  );

  return {
      todoText,
      setTodoText,
      todoRepeat,
      todoDueDate,
      setTodoDueDate,
      handleAddTodoClick,
      handleKeyPress,
      handleRepeatChange,
      handleTabChange,
    }
}