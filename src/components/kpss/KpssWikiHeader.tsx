/**
 * KpssWikiHeader.tsx
 * Presentational Header Bar component for KPSS Notes Dashboard.
 */

import { Language } from "@/types/types.js";

interface KpssWikiHeaderProps {
  lang: Language;
  t: Record<string, string>;
  onCreateNewNote: () => void;
}

export function KpssWikiHeader({ lang, t, onCreateNewNote }: KpssWikiHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
        borderRadius: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <path d="M12 6v7"></path>
            <path d="M9 9h6"></path>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>KPSS DERS NOTLARI STÜDYOSU</span>
            <span style={{ fontSize: "0.68rem", color: "#38bdf8", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "1px 8px", borderRadius: "20px", fontWeight: 700 }}>
              Kişisel Çalışma Arşivi
            </span>
          </div>
          <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: "2px" }}>
            [[İç Bağlantı]] ve otomatik ders notu linkleri ile konular arasında gezinin.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateNewNote}
        style={{
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "0.8rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
          transition: "all 0.2s ease",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>{t.kpss_wiki_new_note}</span>
      </button>
    </div>
  );
}
