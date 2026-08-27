/**
 * AiChatHistoryDrawer.tsx
 * Slide-in drawer for Newtab AI Assistant chat sessions history.
 */

import { useState } from "preact/hooks";
import type { ChatSession } from "@/services/aichat/types.js";
import {
  exportSessionAsMarkdown,
  downloadTextFile,
} from "@/services/aichat/chatSessionService.js";

interface AiChatHistoryDrawerProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string;
  t: Record<string, string>;
  onClose: () => void;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

export function AiChatHistoryDrawer({
  isOpen,
  sessions,
  currentSessionId,
  t,
  onClose,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
}: AiChatHistoryDrawerProps) {
  if (!isOpen) {
    return null;
  }

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");

  const startRename = (session: ChatSession, e: Event) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleText(session.title);
  };

  const submitRename = (sessionId: string) => {
    if (editTitleText.trim()) {
      onRenameSession(sessionId, editTitleText.trim());
    }
    setEditingSessionId(null);
  };

  const handleExport = (session: ChatSession, e: Event) => {
    e.stopPropagation();
    const md = exportSessionAsMarkdown(session);
    const safeTitle = session.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    downloadTextFile(`lifeos_aichat_${safeTitle}_${Date.now()}.md`, md);
  };

  return (
    <div className="aichat-drawer-backdrop" onClick={onClose}>
      <div
        className="aichat-drawer-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="aichat-drawer-header">
          <div className="aichat-drawer-title-wrap">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h3>{t.chat_history_title || "Sohbet Geçmişi"}</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="aichat-drawer-new-btn"
              onClick={() => {
                onNewChat();
                onClose();
              }}
              title="Yeni Sohbet Başlat"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{t.chat_history_new_chat || "+ Yeni Sohbet"}</span>
            </button>
            <button
              type="button"
              className="aichat-drawer-close-btn"
              onClick={onClose}
              title="Kapat"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Sessions list */}
        <div className="aichat-drawer-list">
          {sessions.length === 0 ? (
            <div className="aichat-drawer-empty">
              <p>{t.chat_history_empty || "Henüz kayıtlı bir sohbet geçmişi yok."}</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = editingSessionId === session.id;
              const timeStr = new Date(session.updatedAt || session.createdAt).toLocaleDateString("tr-TR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={session.id}
                  className={`aichat-session-card ${isActive ? "active" : ""}`}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectSession(session);
                      onClose();
                    }
                  }}
                >
                  <div className="aichat-session-card-body">
                    {isEditing ? (
                      <div
                        className="aichat-session-rename-form"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          className="aichat-session-rename-input"
                          value={editTitleText}
                          onInput={(e) =>
                            setEditTitleText((e.target as HTMLInputElement).value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              submitRename(session.id);
                            } else if (e.key === "Escape") {
                              setEditingSessionId(null);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="aichat-rename-save-btn"
                          onClick={() => submitRename(session.id)}
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="aichat-session-title-row">
                        <span className="aichat-session-title" title={session.title}>
                          {session.title}
                        </span>
                        {isActive && (
                          <span className="aichat-active-badge">
                            {t.chat_active_badge || "Aktif"}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="aichat-session-meta-row">
                      <span className="aichat-session-time">{timeStr}</span>
                      <span className="aichat-session-count">
                        {session.messages.length} {t.chat_messages_count || "mesaj"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="aichat-session-actions">
                    <button
                      type="button"
                      className="aichat-session-action-btn"
                      onClick={(e) => handleExport(session, e)}
                      title={t.chat_export_tooltip || "Markdown Olarak İndir"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="aichat-session-action-btn"
                      onClick={(e) => startRename(session, e)}
                      title={t.chat_rename_tooltip || "Başlığı Düzenle"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="aichat-session-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      title={t.chat_delete_tooltip || "Sohbeti Sil"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
