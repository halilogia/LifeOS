import type { KapNewsItem } from "@/services/kapNewsService.js";
import { IconExternal, IconSparkles } from "./kapNewsIcons.js";

interface KapNewsListItemProps {
  t: Record<string, string>;
  item: KapNewsItem;
  aiState: { loading: boolean; text?: string } | undefined;
  onAnalyze: (item: KapNewsItem) => void;
}

export function KapNewsListItem({
  t,
  item,
  aiState,
  onAnalyze,
}: KapNewsListItemProps) {
  return (
    <div
      key={item.id}
      style={{
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
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
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "6px",
            background: "rgba(99, 102, 241, 0.2)",
            color: "#818cf8",
          }}
        >
          {item.symbol || "BIST"}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          {new Date(item.pubDate).toLocaleDateString("tr-TR")}
        </span>
      </div>
      <div
        style={{
          fontWeight: 700,
          color: "#f8fafc",
          fontSize: "0.95rem",
        }}
      >
        {item.title}
      </div>
      <div
        style={{
          fontSize: "0.85rem",
          color: "#cbd5e1",
          lineHeight: "1.4",
        }}
      >
        {item.summary}
      </div>

      {/* Actions Row: External Link & AI Analyze Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "6px",
          paddingTop: "6px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.78rem",
            color: "#818cf8",
            textDecoration: "none",
          }}
        >
          <span>{t.stock_kap_news_show_detail}</span>
          <IconExternal />
        </a>

        <button
          onClick={() => onAnalyze(item)}
          disabled={aiState?.loading}
          style={{
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            borderRadius: "6px",
            color: "#c084fc",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "4px 10px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.2s ease",
          }}
        >
          <IconSparkles />
          <span>
            {aiState?.loading
              ? t.stock_analysis_analyzing
              : t.stock_analysis_btn}
          </span>
        </button>
      </div>

      {/* Inline AI Analysis Results Box */}
      {aiState?.text && (
        <div
          style={{
            marginTop: "8px",
            padding: "10px 12px",
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            borderRadius: "8px",
            fontSize: "0.82rem",
            color: "#e9d5ff",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: "4px",
              color: "#c084fc",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <IconSparkles />
            <span>{t.stock_kap_news_ai_analysis_title}</span>
          </div>
          {aiState.text}
        </div>
      )}
    </div>
  );
}
