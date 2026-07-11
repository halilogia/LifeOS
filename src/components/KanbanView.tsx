import { useState } from 'preact/hooks';
import { Todo, Language } from '../types/types.js';
import { translations } from '../utils/i18n.js';

interface KanbanViewProps {
  todos: Todo[];
  lang: Language;
  onMoveTaskStatus: (index: number, newStatus: Todo['status']) => void;
  onMoveTaskDirection: (index: number, direction: number) => void;
}

export function KanbanView({
  todos,
  lang,
  onMoveTaskStatus,
  onMoveTaskDirection,
}: KanbanViewProps) {
  const t = translations[lang];
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const columns: { status: Todo['status']; label: string }[] = [
    { status: 'todo', label: t.kanban_todo || 'Yapılacak' },
    { status: 'in-progress', label: t.kanban_in_progress || 'Yapılıyor' },
    { status: 'done', label: t.kanban_done || 'Bitti' },
  ];

  const handleDragStart = (e: DragEvent, originalIndex: number) => {
    e.dataTransfer?.setData('text/plain', originalIndex.toString());
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleDragEnd = (e: DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
  };

  const handleDragOver = (e: DragEvent, colStatus: string) => {
    e.preventDefault();
    setDragOverCol(colStatus);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: DragEvent, newStatus: Todo['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const indexStr = e.dataTransfer?.getData('text/plain');
    if (indexStr !== undefined) {
      const originalIndex = parseInt(indexStr, 10);
      if (!isNaN(originalIndex)) {
        onMoveTaskStatus(originalIndex, newStatus);
      }
    }
  };

  return (
    <div id="kanban-view" className="view-content active">
      <div className="kanban-board">
        {columns.map((col) => {
          const colTodos = todos
            .map((todo, idx) => ({ todo, originalIndex: idx }))
            .filter(({ todo }) => (todo.status || 'todo') === col.status);

          return (
            <div
              key={col.status}
              className={`kanban-column ${dragOverCol === col.status ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <h3 className="kanban-title">{col.label}</h3>
              <div className="kanban-list">
                {colTodos.map(({ todo, originalIndex }) => (
                  <div
                    key={originalIndex}
                    className="kanban-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalIndex)}
                    onDragEnd={handleDragEnd}
                  >
                    <div
                      className="kanban-item-content"
                      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      <div className="kanban-item-text">{todo.text}</div>
                    </div>
                    <div className="kanban-controls">
                      <button
                        className="move-btn move-left"
                        title={lang === 'tr' ? 'Sola Taşı' : 'Move Left'}
                        disabled={col.status === 'todo'}
                        onClick={() => onMoveTaskDirection(originalIndex, -1)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button
                        className="move-btn move-right"
                        title={lang === 'tr' ? 'Sağa Taşı' : 'Move Right'}
                        disabled={col.status === 'done'}
                        onClick={() => onMoveTaskDirection(originalIndex, 1)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
