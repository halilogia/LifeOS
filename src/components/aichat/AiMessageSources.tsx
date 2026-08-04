import type { WebSearchSource } from "@/services/webSearchAgent.js";
import { IconSearch, IconGlobe, IconExternal } from "./aiChatIcons.js";

interface AiMessageSourcesProps {
  t: Record<string, string>;
  sources: WebSearchSource[];
  searchQuery?: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function AiMessageSources({
  t,
  sources,
  searchQuery,
  isVisible,
  onToggle,
}: AiMessageSourcesProps) {
  return (
    <div
      style={{
        marginBottom: "10px",
        fontSize: "0.78rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 700,
          color: "#c084fc",
          marginBottom: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <IconSearch />
          <span>
            {t.aichat_search_query.replace(
              "{query}",
              searchQuery || t.aichat_web_research,
            )}
          </span>
        </div>
        <button
          type="button"
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "0.7rem",
          }}
          onClick={onToggle}
        >
          {isVisible ? t.aichat_sources_hide : t.aichat_sources_show}
        </button>
      </div>

      {isVisible && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <IconGlobe />
            <span>
              {t.aichat_sources.replace("{count}", String(sources.length))}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "6px",
            }}
          >
            {sources.map((src, idx) => {
              let domain = "";
              try {
                domain = new URL(src.url).hostname.replace("www.", "");
              } catch {
                domain = "web";
              }
              return (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    padding: "5px 8px",
                    color: "#e2e8f0",
                    textDecoration: "none",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    transition: "all 0.15s ease",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ color: "#818cf8", fontWeight: 700 }}>
                    [{idx + 1}]
                  </span>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                    title={src.title}
                  >
                    {src.title}
                  </span>
                  <IconExternal />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
