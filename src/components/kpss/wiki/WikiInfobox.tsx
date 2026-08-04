import type { KpssWikiNote } from "@/services/kpss/kpssWikiService.js";
import { getSubjectLabel } from "@/services/kpss/kpssWikiService.js";

interface WikiInfoboxProps {
  note: KpssWikiNote;
  displayTitle: string;
  subject: string;
  imageUrl: string | null;
  readingTimeMinutes: number;
  wordCount: number;
  updatedAt: number | string;
  outboundWikilinks: string[];
  backlinks: KpssWikiNote[];
  childNotes: KpssWikiNote[];
  onWikilinkClick: (e: MouseEvent) => void;
  onSelectNote?: (note: KpssWikiNote) => void;
}

export function WikiInfobox({
  note: _note,
  displayTitle,
  subject,
  imageUrl,
  readingTimeMinutes,
  wordCount,
  updatedAt,
  outboundWikilinks,
  backlinks,
  childNotes,
  onWikilinkClick,
  onSelectNote,
}: WikiInfoboxProps) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "6px",
        overflow: "hidden",
        height: "fit-content",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Infobox Header */}
      <div
        style={{
          background: "rgba(30, 41, 59, 0.9)",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "0.88rem",
          textAlign: "center",
          padding: "10px 12px 4px 12px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {displayTitle}
      </div>

      <div
        style={{
          background: "rgba(30, 41, 59, 0.9)",
          color: "#94a3b8",
          fontWeight: 600,
          fontSize: "0.72rem",
          textAlign: "center",
          paddingBottom: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {getSubjectLabel(subject)}
      </div>

      {/* Infobox Featured Image */}
      {imageUrl && (
        <div
          style={{
            padding: "8px",
            background: "rgba(0, 0, 0, 0.4)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <img
            src={imageUrl}
            alt={displayTitle}
            style={{
              maxWidth: "100%",
              maxHeight: "180px",
              borderRadius: "4px",
              objectFit: "cover",
              display: "block",
              margin: "0 auto",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Key-Value Stats */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          gap: "6px",
          fontSize: "0.74rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>
            Okuma Süresi
          </span>
          <span style={{ color: "#60a5fa", fontWeight: 600 }}>
            ~{readingTimeMinutes} dk
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>
            Metin Boyutu
          </span>
          <span style={{ color: "#e2e8f0" }}>{wordCount} kelime</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>
            Son Güncelleme
          </span>
          <span style={{ color: "#e2e8f0" }}>
            {new Date(updatedAt).toLocaleDateString("tr-TR")}
          </span>
        </div>
      </div>

      {/* Outbound Wikilinks */}
      {outboundWikilinks.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "0.74rem",
            background: "rgba(15, 23, 42, 0.4)",
          }}
          onClick={onWikilinkClick}
        >
          <div
            style={{
              color: "#94a3b8",
              fontWeight: 700,
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>İç Bağlantılar</span>
            <span
              style={{
                background: "rgba(59, 130, 246, 0.25)",
                color: "#60a5fa",
                padding: "1px 5px",
                borderRadius: "10px",
                fontSize: "0.65rem",
              }}
            >
              {outboundWikilinks.length}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {outboundWikilinks.map((title, idx) => (
              <span
                key={idx}
                data-wiki-link={title}
                style={{
                  color: "#60a5fa",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "0.74rem",
            background: "rgba(30, 41, 59, 0.4)",
          }}
          onClick={onWikilinkClick}
        >
          <div
            style={{
              color: "#94a3b8",
              fontWeight: 700,
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Gelen Bağlantılar</span>
            <span
              style={{
                background: "rgba(59, 130, 246, 0.25)",
                color: "#60a5fa",
                padding: "1px 5px",
                borderRadius: "10px",
                fontSize: "0.65rem",
              }}
            >
              {backlinks.length}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {backlinks.map((bl) => (
              <span
                key={bl.id}
                data-wiki-link={bl.title}
                style={{
                  color: "#60a5fa",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              >
                {bl.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Child Notes */}
      {childNotes.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "0.74rem",
            background: "rgba(15, 23, 42, 0.5)",
          }}
        >
          <div
            style={{
              color: "#94a3b8",
              fontWeight: 700,
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Alt Notlar</span>
            <span
              style={{
                background: "rgba(59, 130, 246, 0.25)",
                color: "#60a5fa",
                padding: "1px 5px",
                borderRadius: "10px",
                fontSize: "0.65rem",
              }}
            >
              {childNotes.length}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {childNotes.map((cn) => (
              <span
                key={cn.id}
                onClick={() => onSelectNote?.(cn)}
                style={{
                  color: "#60a5fa",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              >
                {cn.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
