/**
 * QueuedMessagesBar.tsx
 * Displays pending queued user messages when AI is busy processing another task.
 * Allows viewing, removing individual items, or clearing the entire queue.
 */

import { useState } from "preact/hooks";
import type { QueuedMessage } from "@/services/aichat/types.js";

interface QueuedMessagesBarProps {
  queue: QueuedMessage[];
  t: Record<string, string>;
  onRemoveMessage: (id: string) => void;
  onClearQueue: () => void;
}

export function QueuedMessagesBar({
  queue,
  t,
  onRemoveMessage,
  onClearQueue,
}: QueuedMessagesBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!queue || queue.length === 0) {
    return null;
  }

  return (
    <div className="queued-messages-bar">
      <div className="queued-bar-header" onClick={() => setIsExpanded((prev) => !prev)}>
        <div className="queued-bar-title-group">
          <div className="queued-pulse-dot" />
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span className="queued-bar-title">
            {t.queue_title || "Sırada Bekleyen Mesajlar"} ({queue.length})
          </span>
        </div>

        <div className="queued-bar-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="queued-clear-all-btn"
            onClick={onClearQueue}
            title={t.queue_clear_all || "Kuyruğu Temizle"}
          >
            {t.queue_clear_all || "Tümünü Temizle"}
          </button>
          <button
            type="button"
            className="queued-toggle-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? "Daralt" : "Genişlet"}
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="queued-items-list">
          {queue.map((item, idx) => (
            <div key={item.id} className="queued-item-row">
              <span className="queued-item-idx">#{idx + 1}</span>
              <div className="queued-item-body">
                <span className="queued-item-text" title={item.text}>
                  {item.text || (item.attachments && item.attachments.length > 0 ? "📎 Ekli dosya analizi" : "")}
                </span>
                {item.attachments && item.attachments.length > 0 && (
                  <span className="queued-item-att-badge">
                    📎 {item.attachments.length} dosya
                  </span>
                )}
              </div>
              <span className="queued-item-time">{item.timestamp}</span>
              <button
                type="button"
                className="queued-item-remove-btn"
                onClick={() => onRemoveMessage(item.id)}
                title={t.queue_remove_item || "Kuyruktan Kaldır"}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
