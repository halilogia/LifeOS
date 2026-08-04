/**
 * KpssWikiEditor.tsx
 * Presentational Article Editor Component.
 * Controls Title input, Subject category dropdown, Content textarea, and Save bar.
 * "Şema" modu: not içeriğinde görsel şema oluşturmak için SchemaBuilder (editable).
 * Şema outline'ı "```sema\n...\n```" bloğu olarak editorContent'e işlenir.
 */

import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { SchemaBuilder } from "@/components/kpss/map/SchemaBuilder.js";

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

/** "```sema" bloğundan outline metnini çıkar */
function extractSemaOutline(content: string): string {
  const m = content.match(/```sema\s*\n([\s\S]*?)```/);
  return m ? m[1].trim() : "";
}

/** Outline metnini "```sema" bloğu olarak content'e yerleştir (eskisini değiştirir) */
function upsertSemaOutline(content: string, outline: string): string {
  const trimmed = outline.trim();
  // Şema boşsa bloğu tamamen kaldır
  if (!trimmed) {
    return content.replace(/```sema\s*\n[\s\S]*?```/g, "").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }
  const block = "```sema\n" + trimmed + "\n```";
  if (/```sema\s*\n[\s\S]*?```/.test(content)) {
    return content.replace(/```sema\s*\n[\s\S]*?```/, block);
  }
  return content.trimEnd() + "\n\n" + block + "\n";
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
  const t = getTranslation(lang);
  const [mode, setMode] = useState<"write" | "sema">("write");
  const initialSema = extractSemaOutline(editorContent);
  const [semaText, setSemaText] = useState<string>(initialSema || "");

  const switchToSema = () => {
    // Mevcut content'teki şema bloğunu kullan, yoksa mevcut outline'ı al
    const existing = extractSemaOutline(editorContent);
    if (existing) {
      setSemaText(existing);
    }
    setMode("sema");
  };

  const switchToWrite = () => {
    onContentChange(upsertSemaOutline(editorContent, semaText));
    setMode("write");
  };

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
          placeholder={t.kpss_wiki_editor_placeholder || "Ders Notu Başlığı (örneğin: Çorum)..."}
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

      {/* Mod seçici: Yaz / Şema */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={() => {
            if (mode === "sema") {
              switchToWrite();
            } else {
              setMode("write");
            }
          }}
          style={{
            background: mode === "write" ? "#38bdf8" : "rgba(255,255,255,0.06)",
            color: mode === "write" ? "#0f172a" : "#94a3b8",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✍️ Yaz
        </button>
        <button
          type="button"
          onClick={switchToSema}
          style={{
            background: mode === "sema" ? "#c99a3c" : "rgba(255,255,255,0.06)",
            color: mode === "sema" ? "#2b2320" : "#94a3b8",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🧩 Şema
        </button>
      </div>

      {mode === "write" ? (
        <>
          {/* Content Textarea */}
          <textarea
            value={editorContent}
            onInput={(e) =>
              onContentChange((e.target as HTMLTextAreaElement).value)
            }
            placeholder={t.kpss_wiki_textarea_placeholder || "Ders notunuzu yazın. Diğer notlarınıza bağlantı vermek için [[Çorum]] şeklinde yazabilirsiniz..."}
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
        </>
      ) : (
        <SchemaBuilder
          outline={semaText}
          title={editorTitle || "ŞEMA"}
          editable
          onChange={setSemaText}
        />
      )}

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
            ? (t.kpss_wiki_save_success || "✓ Değişiklikler başarıyla kaydedildi!")
            : (t.kpss_wiki_save_remind || "Değişikliklerinizi kaydetmeyi unutmayın.")}
        </span>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {mode === "sema" && (
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              Şema, notun içine "```sema" bloğu olarak kaydedilir.
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (mode === "sema") {
                // Şemayı content'e işle ve state'in commit edilmesini bekle, sonra kaydet
                const merged = upsertSemaOutline(editorContent, semaText);
                onContentChange(merged);
                setMode("write");
                window.setTimeout(() => onSave(), 0);
              } else {
                onSave();
              }
            }}
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
            {t.kpss_wiki_save_btn || "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
