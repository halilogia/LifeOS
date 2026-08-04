/**
 * KpssNotesToolbar.tsx
 * Presentational Toolbar for KPSS Not Stüdyosu.
 * Mode tabs (read/edit) + Fullscreen + Sync (Electron) + MD download + Help + Graph + Delete.
 */

interface KpssNotesToolbarProps {
  t: Record<string, string>;
  viewMode: "read" | "edit";
  onModeChange: (mode: "read" | "edit") => void;
  onFullscreen: () => void;
  onDownloadMarkdown: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowHelp: () => void;
  onShowGraph: () => void;
  onDelete: () => void;
}

export function KpssNotesToolbar({
  t,
  viewMode,
  onModeChange,
  onFullscreen,
  onDownloadMarkdown,
  onExport,
  onImport,
  onShowHelp,
  onShowGraph,
  onDelete,
}: KpssNotesToolbarProps) {
  const tabBtn = (mode: "read" | "edit", label: string) => (
    <button
      type="button"
      onClick={() => onModeChange(mode)}
      style={{
        background: "none",
        border: "none",
        color: viewMode === mode ? "#ffffff" : "#94a3b8",
        fontSize: "0.8rem",
        cursor: "pointer",
        fontWeight: viewMode === mode ? 700 : 500,
        borderBottom:
          viewMode === mode ? "2px solid #ffffff" : "2px solid transparent",
        paddingBottom: "8px",
        marginBottom: "-9px",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        paddingBottom: "8px",
        marginBottom: "4px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {tabBtn("read", "Oku")}
        {tabBtn("edit", "Değiştir")}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Tam Ekran Modu — container'ı tam ekran yapar, tarayıcıyı değil */}
        <button
          type="button"
          onClick={onFullscreen}
          title="Tam Ekran"
          style={{
            background: "rgba(124, 58, 237, 0.15)",
            border: "1px solid rgba(124, 58, 237, 0.35)",
            color: "#c084fc",
            borderRadius: "6px",
            padding: "4px 10px",
            fontSize: "0.72rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>

        {/* Export Action: Download Markdown */}
        <button
          type="button"
          onClick={onDownloadMarkdown}
          title={t.kpss_notes_download_md}
          style={{
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "#60a5fa",
            borderRadius: "6px",
            padding: "4px 10px",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>.md İndir</span>
        </button>

        {/* Masaüstü Senkronizasyonu (yalnızca Electron exe'de görünür) */}
        {typeof window !== "undefined" &&
          typeof window.mindvaultSync !== "undefined" && (
            <>
              <button
                type="button"
                onClick={onExport}
                title="Notları JSON dosyasına yedekle (eklentiye aktarmak için)"
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  color: "#34d399",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⇩ Yedekle
              </button>
              <button
                type="button"
                onClick={onImport}
                title="JSON dosyasından notları içe aktar"
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  color: "#fbbf24",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⇧ Yükle
              </button>
            </>
          )}

        {/* Info Guide Button: KPSS not alma kılavuzu popup'ı */}
        <button
          type="button"
          onClick={onShowHelp}
          title={t.kpss_notes_help_title || "KPSS Not Alma Rehberi"}
          style={{
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.35)",
            color: "#c084fc",
            borderRadius: "6px",
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          !
        </button>

        {/* Icon-Only Neural Graph Button */}
        <button
          type="button"
          onClick={onShowGraph}
          title={t.kpss_notes_knowledge_graph}
          style={{
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            color: "#38bdf8",
            borderRadius: "6px",
            padding: "5px 9px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="6" cy="6" r="3"></circle>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="12" cy="18" r="3"></circle>
            <line x1="8.5" y1="7.5" x2="15.5" y2="7.5"></line>
            <line x1="7.5" y1="8.5" x2="10.5" y2="15.5"></line>
            <line x1="16.5" y1="8.5" x2="13.5" y2="15.5"></line>
          </svg>
        </button>

        <button
          type="button"
          onClick={onDelete}
          title={t.kpss_notes_delete}
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            borderRadius: "6px",
            padding: "5px 9px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
