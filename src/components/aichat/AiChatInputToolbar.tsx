/**
 * AiChatInputToolbar.tsx
 * Google AI Modu Canlı Arama çipi, ek dosya/görsel ataşı, önizleme çipleri,
 * "/", "@" komut öneri menüsü ve mesaj yazma/gönderme çubuğu.
 */
import { useRef, useState } from "preact/hooks";
import type { ChatAttachment } from "@/services/aichat/types.js";
import { formatFileSize } from "@/services/aichat/fileAttachmentService.js";
import {
  CommandSuggestionMenu,
  type SuggestionItem,
} from "@/sidepanel/CommandSuggestionMenu.js";

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
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
  onToggleWebSearch: () => void;
  onAddFiles?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  onNewChat?: () => void;
  onExport?: () => void;
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
  onInputChange,
  onSendMessage,
  onToggleWebSearch,
  onAddFiles,
  onRemoveAttachment,
  onNewChat,
  onExport,
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
      onInputChange("");
      onNewChat();
      return;
    }
    if (item.key === "export" && onExport) {
      onInputChange("");
      onExport();
      return;
    }
    onInputChange(item.insertText);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`chat-input-panel ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Command & Tool Autocomplete Menu */}
      <CommandSuggestionMenu
        inputText={inputVal}
        onSelect={handleSelectSuggestion}
        onClose={() => {}}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        multiple
        accept="image/*,.pdf,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css"
      />

      {/* Attachment Previews Bar */}
      {attachments.length > 0 && (
        <div className="aichat-attachment-previews">
          {attachments.map((att) => (
            <div key={att.id} className="aichat-att-chip">
              {att.type === "image" && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="aichat-att-thumb"
                />
              ) : (
                <div className={`aichat-att-icon-badge ${att.type}`}>
                  {att.type === "pdf" ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                  )}
                </div>
              )}
              <div className="aichat-att-meta">
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
          className="chat-prompt-input"
          value={inputVal}
          onInput={(e) => onInputChange((e.target as HTMLInputElement).value)}
          onPaste={handlePaste}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="send-message-btn"
          onClick={() => onSendMessage()}
          disabled={!inputVal.trim() && attachments.length === 0}
        >
          <span>{sendLabel}</span>
          <IconSend />
        </button>
      </div>
    </div>
  );
}
