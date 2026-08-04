/**
 * KpssWikiEditor.tsx
 * Presentational Article Editor Component.
 * Controls Title input, Subject category dropdown, Content textarea, and Save bar.
 * "Şema" modu: not içeriğinde görsel şema oluşturmak için SchemaBuilder (editable).
 * "Harita" modu: tıklayarak pin eklemek için MapBuilder (editable).
 * Bloklar "```sema" / "```harita" olarak editorContent'e işlenir.
 */

import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { SchemaBuilder } from "@/components/kpss/map/SchemaBuilder.js";
import {
  MapBuilder,
  parseHaritaBlock,
} from "@/components/kpss/map/MapBuilder.js";

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

/** "```sema" bloğundan outline metnini çıkar (başlık satırı hariç) */
function extractSemaOutline(content: string): string {
  const m = content.match(/```sema\s*\n([\s\S]*?)```/);
  if (!m) {
    return "";
  }
  const lines = m[1].split("\n");
  if (lines[0]?.trim().startsWith("#")) {
    return lines.slice(1).join("\n").trim();
  }
  return m[1].trim();
}

/** "```sema" bloğunun başlığını çıkar (# Başlık) */
function extractSemaTitle(content: string): string {
  const m = content.match(/```sema\s*\n([\s\S]*?)```/);
  if (!m) {
    return "";
  }
  const first = m[1].split("\n")[0]?.trim() || "";
  return first.startsWith("#") ? first.replace(/^#+\s*/, "").trim() : "";
}

/** "```harita" bloğunun içeriğini çıkar (başlık satırı hariç) */
function extractHaritaBlock(content: string): string {
  const m = content.match(/```harita\s*\n([\s\S]*?)```/);
  if (!m) {
    return "";
  }
  const lines = m[1].split("\n");
  if (lines[0]?.trim().startsWith("#")) {
    return lines.slice(1).join("\n").trim();
  }
  return m[1].trim();
}

/** "```harita" bloğunun başlığını çıkar (# Başlık) */
function extractHaritaTitle(content: string): string {
  const m = content.match(/```harita\s*\n([\s\S]*?)```/);
  if (!m) {
    return "";
  }
  const first = m[1].split("\n")[0]?.trim() || "";
  return first.startsWith("#") ? first.replace(/^#+\s*/, "").trim() : "";
}

/** Outline metnini "```sema" bloğu olarak content'e yerleştir (eskisini değiştirir) */
function upsertSemaOutline(
  content: string,
  outline: string,
  title: string,
): string {
  const trimmed = outline.trim();
  // Şema boşsa bloğu tamamen kaldır
  if (!trimmed && !title.trim()) {
    return (
      content
        .replace(/```sema\s*\n[\s\S]*?```/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim() + "\n"
    );
  }
  const header = title.trim() ? `# ${title.trim()}\n` : "";
  const block = "```sema\n" + header + trimmed + "\n```";
  if (/```sema\s*\n[\s\S]*?```/.test(content)) {
    return content.replace(/```sema\s*\n[\s\S]*?```/, block);
  }
  return content.trimEnd() + "\n\n" + block + "\n";
}

/** Harita bloğu metnini content'e yerleştir (eskisini değiştirir) */
function upsertHaritaBlock(
  content: string,
  block: string,
  title: string,
): string {
  const trimmed = block.trim();
  if (!trimmed && !title.trim()) {
    return (
      content
        .replace(/```harita\s*\n[\s\S]*?```/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim() + "\n"
    );
  }
  const header = title.trim() ? `# ${title.trim()}\n` : "";
  if (/```harita\s*\n[\s\S]*?```/.test(content)) {
    return content.replace(/```harita\s*\n[\s\S]*?```/, header + trimmed);
  }
  return (
    content.trimEnd() + "\n\n" + "```harita\n" + header + trimmed + "\n```\n"
  );
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
  const [mode, setMode] = useState<"write" | "sema" | "harita">("write");
  const initialSema = extractSemaOutline(editorContent);
  const [semaText, setSemaText] = useState<string>(initialSema || "");
  const [semaTitle, setSemaTitle] = useState<string>(
    extractSemaTitle(editorContent) || "",
  );
  const initialHarita = extractHaritaBlock(editorContent);
  const [haritaBlock, setHaritaBlock] = useState<string>(initialHarita || "");
  const [haritaTitle, setHaritaTitle] = useState<string>(
    extractHaritaTitle(editorContent) || "",
  );

  const switchToSema = () => {
    // Mevcut content'teki şema bloğunu kullan, yoksa mevcut outline'ı al
    const existing = extractSemaOutline(editorContent);
    if (existing) {
      setSemaText(existing);
    }
    setSemaTitle(extractSemaTitle(editorContent) || "");
    setMode("sema");
  };

  const switchToHarita = () => {
    // Mevcut harita bloğunu kullan
    const existing = extractHaritaBlock(editorContent);
    if (existing) {
      setHaritaBlock(existing);
    }
    setHaritaTitle(extractHaritaTitle(editorContent) || "");
    setMode("harita");
  };

  const switchToWrite = () => {
    // Şema ve harita bloklarını content'e işle
    let merged = editorContent;
    if (mode === "sema") {
      merged = upsertSemaOutline(merged, semaText, semaTitle);
    } else if (mode === "harita") {
      merged = upsertHaritaBlock(merged, haritaBlock, haritaTitle);
    }
    onContentChange(merged);
    setMode("write");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        flex: 1,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Article Form Controls */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={editorTitle}
          onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
          placeholder={
            t.kpss_wiki_editor_placeholder ||
            "Ders Notu Başlığı (örneğin: Çorum)..."
          }
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
            onSubjectChange(
              (e.target as HTMLSelectElement).value as
                "tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik",
            )
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

      {/* Mod seçici: Yaz / Şema / Harita */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            if (mode !== "write") {
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
        <button
          type="button"
          onClick={switchToHarita}
          style={{
            background:
              mode === "harita" ? "#c8511f" : "rgba(255,255,255,0.06)",
            color: mode === "harita" ? "#fff" : "#94a3b8",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🗺️ Harita
        </button>
      </div>

      {/* Şema / Harita başlığı — ayrı başlık, not başlığından bağımsız */}
      {(mode === "sema" || mode === "harita") && (
        <input
          type="text"
          value={mode === "sema" ? semaTitle : haritaTitle}
          onInput={(e) => {
            const v = (e.target as HTMLInputElement).value;
            if (mode === "sema") {
              setSemaTitle(v);
            } else {
              setHaritaTitle(v);
            }
          }}
          placeholder={
            mode === "sema"
              ? "Şema başlığı (isteğe bağlı — boşsa gizli)"
              : "Harita başlığı (isteğe bağlı — boşsa gizli)"
          }
          style={{
            width: "100%",
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
            color: "#ffffff",
            fontSize: "0.85rem",
            fontWeight: 600,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      )}

      {mode === "write" ? (
        <>
          {/* Content Textarea */}
          <textarea
            value={editorContent}
            onInput={(e) =>
              onContentChange((e.target as HTMLTextAreaElement).value)
            }
            placeholder={
              t.kpss_wiki_textarea_placeholder ||
              "Ders notunuzu yazın. Diğer notlarınıza bağlantı vermek için [[Çorum]] şeklinde yazabilirsiniz..."
            }
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
      ) : mode === "sema" ? (
        <SchemaBuilder
          outline={semaText}
          title={semaTitle}
          editable
          onChange={setSemaText}
        />
      ) : (
        <MapBuilder
          initialPins={parseHaritaBlock(haritaBlock)}
          onChange={(serialized) => {
            // Serialized: "```harita\n...\n```" — haritaBlock'a kaydet
            setHaritaBlock(serialized);
          }}
          editable
          title={haritaTitle}
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
            ? t.kpss_wiki_save_success ||
              "✓ Değişiklikler başarıyla kaydedildi!"
            : t.kpss_wiki_save_remind ||
              "Değişikliklerinizi kaydetmeyi unutmayın."}
        </span>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {(mode === "sema" || mode === "harita") && (
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              {mode === "sema"
                ? 'Şema, notun içine "```sema" bloğu olarak kaydedilir.'
                : 'Harita, notun içine "```harita" bloğu olarak kaydedilir.'}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (mode === "sema") {
                // Şemayı content'e işle ve state'in commit edilmesini bekle, sonra kaydet
                const merged = upsertSemaOutline(
                  editorContent,
                  semaText,
                  semaTitle,
                );
                onContentChange(merged);
                setMode("write");
                window.setTimeout(() => onSave(), 0);
              } else if (mode === "harita") {
                // Haritayı content'e işle ve state'in commit edilmesini bekle, sonra kaydet
                const merged = upsertHaritaBlock(
                  editorContent,
                  haritaBlock,
                  haritaTitle,
                );
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
