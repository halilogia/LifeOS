import { useRef, useState } from "preact/hooks";
import type { ChatAttachment, QueuedMessage } from "@/services/aichat/types.js";
import { formatFileSize } from "@/services/aichat/fileAttachmentService.js";
import {
  CommandSuggestionMenu,
  type SuggestionItem,
} from "./CommandSuggestionMenu.js";
import { QueuedMessagesBar } from "@/components/aichat/QueuedMessagesBar.js";

interface SidePanelInputBarProps {
  t: Record<string, string>;
  inputText: string;
  isProcessing: boolean;
  isListening: boolean;
  attachments?: ChatAttachment[];
  enableWebSearch?: boolean;
  queue?: QueuedMessage[];
  onInputChange: (v: string) => void;
  onSend: (override?: string) => void;
  onToggleVoice: () => void;
  onAddFiles?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  onToggleWebSearch?: () => void;
  onNewChat?: () => void;
  onExport?: () => void;
  onRemoveQueuedMessage?: (id: string) => void;
  onClearQueue?: () => void;
}

export function SidePanelInputBar({
  t,
  inputText,
  isProcessing,
  isListening,
  attachments = [],
  enableWebSearch = true,
  queue = [],
  onInputChange,
  onSend,
  onToggleVoice,
  onAddFiles,
  onRemoveAttachment,
  onToggleWebSearch,
  onNewChat,
  onExport,
  onRemoveQueuedMessage = () => {},
  onClearQueue = () => {},
}: SidePanelInputBarProps) {
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
      className={`sidepanel-input-container ${isDragOver ? "drag-over" : ""}`}
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
        inputText={inputText}
        onSelect={handleSelectSuggestion}
        onClose={() => {}}
      />

      {/* Web Search & Capabilities Toolbar */}
      <div className="sidepanel-input-toolbar">
        {onToggleWebSearch && (
          <button
            type="button"
            className={`sidepanel-tool-pill ${enableWebSearch ? "active" : ""}`}
            onClick={onToggleWebSearch}
            title={
              enableWebSearch
                ? "Google Canlı Arama: AÇIK"
                : "Google Canlı Arama: KAPALI"
            }
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{enableWebSearch ? "Canlı Arama: Açık" : "Canlı Arama"}</span>
          </button>
        )}

        {attachments.length > 0 && (
          <span className="sidepanel-att-count-badge">
            📎 {attachments.length} ek
          </span>
        )}
      </div>

      {/* Uploaded File Attachments Preview Row */}
      {attachments.length > 0 && (
        <div className="sidepanel-attachments-preview">
          {attachments.map((att) => (
            <div key={att.id} className="sidepanel-att-chip">
              {att.type === "image" && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="sidepanel-att-thumb"
                />
              ) : (
                <span className="sidepanel-att-icon">
                  {att.type === "pdf" ? "📄" : "📝"}
                </span>
              )}
              <span className="sidepanel-att-name" title={att.name}>
                {att.name} ({formatFileSize(att.size)})
              </span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  className="sidepanel-att-remove"
                  onClick={() => onRemoveAttachment(att.id)}
                  title="Eki kaldır"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Action Controls */}
      <div className="sidepanel-input-row">
        {/* Paperclip Attachment Button */}
        <button
          type="button"
          className="sidepanel-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Dosya veya Resim Ekle (PDF, TXT, PNG, JPG, Kod)"
        >
          <svg
            width="16"
            height="16"
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

        {/* Voice Input Button */}
        <button
          type="button"
          className={`sidepanel-mic-btn ${isListening ? "listening" : ""}`}
          onClick={onToggleVoice}
          title={isListening ? t.listening_tooltip : t.voice_command_tooltip}
          disabled={isProcessing}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>

        {/* Input Text Box */}
        <input
          ref={inputRef}
          type="text"
          className={`sidepanel-input ${isProcessing ? "queued-input" : ""}`}
          value={inputText}
          onInput={(e) => onInputChange((e.target as HTMLInputElement).value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend();
            }
          }}
          placeholder={
            isListening
              ? t.listening_placeholder
              : isProcessing
                ? t.queue_input_placeholder || "AI çalışıyor... Mesaj yazıp kuyruğa ekleyebilirsiniz"
                : t.question_placeholder
          }
        />

        {/* Send / Queue Button */}
        <button
          type="button"
          className={`sidepanel-send-btn ${isProcessing ? "queue-btn" : ""}`}
          onClick={() => onSend()}
          disabled={!inputText.trim() && attachments.length === 0}
          title={
            isProcessing
              ? t.queue_send_tooltip || "Kuyruğa Ekle (Enter)"
              : "Gönder (Enter)"
          }
        >
          {isProcessing ? (
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
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
