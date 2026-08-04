/**
 * KpssNotesToolbar.tsx
 * Presentational Toolbar for KPSS Not Stüdyosu.
 * Mode tabs (read/edit) + Fullscreen + Sync (Electron) + MD download + Help + Graph + Delete.
 */
import {
  IconFullscreen,
  IconDownload,
  IconGraph,
  IconTrash,
  IconInfo,
} from "../kpssIcons.js";

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
          <IconFullscreen size={13} strokeWidth={2.2} />
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
            padding: "4px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconDownload size={14} strokeWidth={2.2} />
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
          <IconInfo size={13} strokeWidth={2.2} />
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
          <IconGraph size={14} />
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
          <IconTrash size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
