/**
 * AiChatInputToolbar.tsx
 * Google AI Modu Canlı Arama çipi, ek dosya/görsel ataşı, önizleme çipleri,
 * "/", "@" komut öneri menüsü, mesaj kuyruğu çubuğu ve mesaj yazma/gönderme çubuğu.
 */
import { useRef, useState } from "preact/hooks";
import type { ChatAttachment, QueuedMessage } from "@/services/aichat/types.js";
import { formatFileSize } from "@/services/aichat/fileAttachmentService.js";
import {
  CommandSuggestionMenu,
  type SuggestionItem,
} from "@/sidepanel/CommandSuggestionMenu.js";
import { QueuedMessagesBar } from "./QueuedMessagesBar.js";

interface AiChatInputToolbarProps {
  inputVal: string;
  placeholder: string;
  sendLabel: string;
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
  enableWebSearch: boolean;
  webSearchTitle: string;
  webSearchLabel: string;
  attachments?: ChatAttachment[];
  isBotTyping?: boolean;
  queue?: QueuedMessage[];
  t?: Record<string, string>;
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
  onToggleWebSearch: () => void;
  onAddFiles?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  onNewChat?: () => void;
  onExport?: () => void;
  onRemoveQueuedMessage?: (id: string) => void;
  onClearQueue?: () => void;
}

function IconSend() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconQueue() {
  return (
    <svg
      width="16"
      height="16"
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
  );
}

function IconGlobe() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function AiChatInputToolbar({
  inputVal,
  placeholder,
  sendLabel,
  suggestion1,
  suggestion2,
  suggestion3,
  enableWebSearch,
  webSearchTitle,
  webSearchLabel,
  attachments = [],
  isBotTyping = false,
  queue = [],
  t = {},
  onInputChange,
  onSendMessage,
  onToggleWebSearch,
  onAddFiles,
  onRemoveAttachment,
  onNewChat,
  onExport,
  onRemoveQueuedMessage = () => {},
  onClearQueue = () => {},
}: AiChatInputToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && onAddFiles) {
      onAddFiles(input.files);
      input.value = "";
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files.length > 0 && onAddFiles) {
      e.preventDefault();
      onAddFiles(e.clipboardData.files);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files.length > 0 && onAddFiles) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleSelectSuggestion = (item: SuggestionItem) => {
    if (item.key === "clear" && onNewChat) {
      onNewChat();
      onInputChange("");
      return;
    }
    if (item.key === "export" && onExport) {
      onExport();
      onInputChange("");
      return;
    }
    if (item.insertText) {
      onInputChange(item.insertText);
    }
  };

  return (
    <div
      className={`chat-input-area ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,text/*,.json,.csv,.js,.ts,.tsx,.py,.html,.css,.md"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Queued Messages Bar if queue is not empty */}
      <QueuedMessagesBar
        queue={queue}
        t={t}
        onRemoveMessage={onRemoveQueuedMessage}
        onClearQueue={onClearQueue}
      />

      {/* Slash / Mention Commands Menu */}
      <CommandSuggestionMenu
        inputText={inputVal}
        onSelect={handleSelectSuggestion}
        onClose={() => {}}
      />

      {/* Uploaded File Attachments Preview Row */}
      {attachments.length > 0 && (
        <div className="aichat-attachments-preview">
          {attachments.map((att) => (
            <div key={att.id} className="aichat-att-chip">
              {att.type === "image" && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="aichat-att-thumb"
                />
              ) : (
                <span className="aichat-att-icon">
                  {att.type === "pdf" ? "📄" : "📝"}
                </span>
              )}
              <div className="aichat-att-info">
                <span className="aichat-att-name" title={att.name}>
                  {att.name}
                </span>
                <span className="aichat-att-size">
                  {formatFileSize(att.size)}
                </span>
              </div>
              {onRemoveAttachment && (
                <button
                  type="button"
                  className="aichat-att-remove"
                  onClick={() => onRemoveAttachment(att.id)}
                  title="Kaldır"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Suggestions & Google AI Mode Search Chip */}
      <div className="suggestion-chips-container">
        <button
          type="button"
          className={`chip-btn ${enableWebSearch ? "active" : ""}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: enableWebSearch
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(16, 185, 129, 0.25))"
              : "rgba(255, 255, 255, 0.04)",
            borderColor: enableWebSearch
              ? "var(--accent-color)"
              : "rgba(255, 255, 255, 0.08)",
            color: enableWebSearch ? "#34d399" : "var(--text-secondary)",
            fontWeight: 600,
          }}
          onClick={onToggleWebSearch}
          title={webSearchTitle}
        >
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <IconGlobe />
          </span>
          <span>{webSearchLabel}</span>
        </button>

        <button
          type="button"
          className="chip-btn"
          onClick={() => onSendMessage(suggestion1)}
        >
          💡 {suggestion1}
        </button>
        <button
          type="button"
          className="chip-btn"
          onClick={() => onSendMessage(suggestion2)}
        >
          💡 {suggestion2}
        </button>
        <button
          type="button"
          className="chip-btn"
          onClick={() => onSendMessage(suggestion3)}
        >
          💡 {suggestion3}
        </button>
      </div>

      {/* Main prompt input bar */}
      <div className="main-input-bar">
        <button
          type="button"
          className="aichat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Dosya veya Resim Ekle (PDF, TXT, PNG, JPG, Kod)"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          className={`chat-prompt-input ${isBotTyping ? "queued-input" : ""}`}
          value={inputVal}
          onInput={(e) => onInputChange((e.target as HTMLInputElement).value)}
          onPaste={handlePaste}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          placeholder={
            isBotTyping
              ? t.queue_input_placeholder || "AI çalışıyor... Mesaj yazıp kuyruğa ekleyebilirsiniz"
              : placeholder
          }
        />
        <button
          type="button"
          className={`send-message-btn ${isBotTyping ? "queue-btn" : ""}`}
          onClick={() => onSendMessage()}
          disabled={!inputVal.trim() && attachments.length === 0}
          title={
            isBotTyping
              ? t.queue_send_tooltip || "Kuyruğa Ekle (Enter)"
              : sendLabel
          }
        >
          <span>{isBotTyping ? (t.queue_send_btn || "Kuyruğa Ekle") : sendLabel}</span>
          {isBotTyping ? <IconQueue /> : <IconSend />}
        </button>
      </div>
    </div>
  );
}
