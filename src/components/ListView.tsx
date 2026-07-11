import { useState } from 'preact/hooks';
import { Todo, Language } from '../types/types.js';
import { translations } from '../utils/i18n.js';

interface ListViewProps {
  todos: Todo[];
  activeTab: 'focus' | 'routines';
  lang: Language;
  onTabChange: (tab: 'focus' | 'routines') => void;
  onToggleTodo: (index: number) => void;
  onDeleteTodo: (index: number) => void;
}

export function ListView({
  todos,
  activeTab,
  lang,
  onTabChange,
  onToggleTodo,
  onDeleteTodo,
}: ListViewProps) {
  const t = translations[lang];

  // Filter tasks based on repeating / non-repeating
  const filteredTodos = todos.map((todo, idx) => ({ todo, originalIndex: idx })).filter(({ todo }) => {
    if (activeTab === 'focus') {
      return todo.repeat === 'none';
    } else {
      return todo.repeat !== 'none';
    }
  });

  return (
    <div id="list-view" className="view-content active">

      <div className="todo-card">
        <h1 className="greeting">{t.greeting}</h1>

        <div className="todo-tabs">
          <button
            className={`todo-tab-btn ${activeTab === 'focus' ? 'active' : ''}`}
            onClick={() => onTabChange('focus')}
          >
            {t.section_tasks}
          </button>
          <button
            className={`todo-tab-btn ${activeTab === 'routines' ? 'active' : ''}`}
            onClick={() => onTabChange('routines')}
          >
            {t.section_recurring}
          </button>
        </div>

        <div className="sections-grid single-column">
          <div
            id="tasks-section"
            className={`tasks-container ${activeTab === 'focus' ? 'active' : ''}`}
          >
            <h2 className="section-title">{t.section_tasks}</h2>
            <ul id="todo-list" className="todo-list">
              {activeTab === 'focus' &&
                filteredTodos.map(({ todo, originalIndex }) => (
                  <li
                    key={originalIndex}
                    className={`todo-item ${todo.completed ? 'completed' : ''}`}
                  >
                    <div className="checkbox" onClick={() => onToggleTodo(originalIndex)}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div
                      className="todo-content"
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                      onClick={() => onToggleTodo(originalIndex)}
                    >
                      <span className="todo-text">{todo.text}</span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTodo(originalIndex);
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          <div
            id="recurring-section"
            className={`tasks-container ${activeTab === 'routines' ? 'active' : ''}`}
          >
            <h2 className="section-title">{t.section_recurring}</h2>
            <ul id="recurring-list" className="todo-list">
              {activeTab === 'routines' &&
                filteredTodos.map(({ todo, originalIndex }) => {
                  const key = `repeat_${todo.repeat}` as keyof typeof t;
                  const repeatLabel = t[key] || todo.repeat;
                  return (
                    <li
                      key={originalIndex}
                      className={`todo-item ${todo.completed ? 'completed' : ''}`}
                    >
                      <div className="checkbox" onClick={() => onToggleTodo(originalIndex)}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div
                        className="todo-content"
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                        onClick={() => onToggleTodo(originalIndex)}
                      >
                        <span className="todo-text">{todo.text}</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span className="repeat-badge">{repeatLabel}</span>
                        </div>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTodo(originalIndex);
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        <div className={`empty-state ${filteredTodos.length === 0 ? 'active' : ''}`}>
          <p>{t.empty_state}</p>
        </div>
      </div>
    </div>
  );
}
