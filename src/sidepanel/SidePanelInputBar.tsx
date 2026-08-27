import { useRef, useState } from "preact/hooks";
import type { ChatAttachment } from "@/services/aichat/types.js";
import { formatFileSize } from "@/services/aichat/fileAttachmentService.js";

interface SidePanelInputBarProps {
  t: Record<string, string>;
  inputText: string;
  isProcessing: boolean;
  isListening: boolean;
  attachments?: ChatAttachment[];
  enableWebSearch?: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onToggleVoice: () => void;
  onAddFiles?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  onToggleWebSearch?: () => void;
}

export function SidePanelInputBar({
  t,
  inputText,
  isProcessing,
  isListening,
  attachments = [],
  enableWebSearch = true,
  onInputChange,
  onSend,
  onToggleVoice,
  onAddFiles,
  onRemoveAttachment,
  onToggleWebSearch,
}: SidePanelInputBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div
      className={`sidepanel-input-container ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
        <div className="sidepanel-attachment-previews">
          {attachments.map((att) => (
            <div key={att.id} className="sidepanel-att-chip">
              {att.type === "image" && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="sidepanel-att-thumb"
                />
              ) : (
                <div className={`sidepanel-att-icon-badge ${att.type}`}>
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
              <div className="sidepanel-att-meta">
                <span className="sidepanel-att-name" title={att.name}>
                  {att.name}
                </span>
                <span className="sidepanel-att-size">
                  {formatFileSize(att.size)}
                </span>
              </div>
              {onRemoveAttachment && (
                <button
                  className="sidepanel-att-remove"
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

      {/* Main Input Row */}
      <div className="sidepanel-input-row">
        {/* Web Search Quick Toggle */}
        {onToggleWebSearch && (
          <button
            type="button"
            className={`sidepanel-web-search-toggle ${enableWebSearch ? "active" : ""}`}
            onClick={onToggleWebSearch}
            title={
              enableWebSearch
                ? "Canlı İnternet Araması: AÇIK"
                : "Canlı İnternet Araması: KAPALI"
            }
          >
            <svg
              width="14"
              height="14"
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
          </button>
        )}

        {/* Paperclip Attachment Button */}
        <button
          type="button"
          className="sidepanel-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Dosya veya Resim Ekle (PDF, TXT, PNG, JPG, Kod)"
          disabled={isProcessing}
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
          type="text"
          className="sidepanel-input"
          value={inputText}
          onInput={(e) => onInputChange((e.target as HTMLInputElement).value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend();
            }
          }}
          placeholder={
            isListening ? t.listening_placeholder : t.question_placeholder
          }
          disabled={isProcessing}
        />

        {/* Send Button */}
        <button
          type="button"
          className="sidepanel-send-btn"
          onClick={onSend}
          disabled={isProcessing || (!inputText.trim() && attachments.length === 0)}
          title="Gönder (Enter)"
        >
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
        </button>
      </div>
    </div>
  );
}
