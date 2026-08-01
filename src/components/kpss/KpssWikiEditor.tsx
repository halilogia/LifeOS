/**
 * KpssWikiEditor.tsx
 * Presentational Article Editor Component.
 * Controls Title input, Subject category dropdown, Content textarea, and Save bar.
 */

import { Language } from "@/types/types.js";
import { extractTitleFromContent } from "@/services/kpssWikiService.js";

interface KpssWikiEditorProps {
  lang: Language;
  editorTitle: string;
  editorSubject: "tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik";
  editorContent: string;
  saveStatus: boolean;
  onTitleChange: (title: string) => void;
  onSubjectChange: (
    subj: "tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik",
  ) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

export function KpssWikiEditor({
  lang,
  editorTitle,
  editorSubject,
  editorContent,
  saveStatus,
  onTitleChange,
  onSubjectChange,
  onContentChange,
  onSave,
}: KpssWikiEditorProps) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}
    >
      {/* Article Form Controls */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={editorTitle}
          onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
          placeholder="Ders Notu Başlığı (örneğin: Çorum)..."
          style={{
            flex: 1,
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "#ffffff",
            fontSize: "0.95rem",
            fontWeight: 700,
            outline: "none",
          }}
        />

        <select
          value={editorSubject}
          onChange={(e) =>
            onSubjectChange((e.target as HTMLSelectElement).value as any)
          }
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "#38bdf8",
            fontSize: "0.8rem",
            fontWeight: 700,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="tarih">Tarih</option>
          <option value="cografya">Coğrafya</option>
          <option value="vatandaslik">Vatandaşlık</option>
          <option value="turkce">Türkçe</option>
          <option value="matematik">Matematik</option>
        </select>
      </div>

      {/* Content Textarea */}
      <textarea
        value={editorContent}
        onInput={(e) =>
          onContentChange((e.target as HTMLTextAreaElement).value)
        }
        placeholder="Ders notunuzu yazın. Diğer notlarınıza bağlantı vermek için [[Çorum]] şeklinde yazabilirsiniz..."
        style={{
          width: "100%",
          flex: 1,
          minHeight: "380px",
          background: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "10px",
          padding: "14px",
          color: "#f8fafc",
          fontSize: "0.88rem",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: 1.6,
          outline: "none",
          resize: "none",
          boxSizing: "border-box",
        }}
      />

      {/* Save Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: saveStatus ? "#4ade80" : "#94a3b8",
            fontWeight: 600,
          }}
        >
          {saveStatus
            ? "✓ Değişiklikler başarıyla kaydedildi!"
            : "Değişikliklerinizi kaydetmeyi unutmayın."}
        </span>

        <button
          type="button"
          onClick={onSave}
          style={{
            background: "#16a34a",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}
