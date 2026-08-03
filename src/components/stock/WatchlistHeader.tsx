import { IconEye, IconSparkles } from "./portfolioIcons.js";

interface WatchlistHeaderProps {
  listTitle: string;
  symbolCount: number;
  symbolsToAnalyze: string;
  onAiAnalyze: (targetSymbols: string) => void;
}

export function WatchlistHeader({
  listTitle,
  symbolCount,
  symbolsToAnalyze,
  onAiAnalyze,
}: WatchlistHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px",
        paddingBottom: "10px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "1rem",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <IconEye />
        <span>
          BİST {listTitle} Takip Listesi ({symbolCount})
        </span>
      </div>
      {symbolCount > 0 && (
        <button
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            border: "none",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
          }}
          onClick={() => onAiAnalyze(symbolsToAnalyze || "ALL_PORTFOLIO")}
        >
          <IconSparkles />
          <span>✦ Seans Açılış Öncesi Strateji & Açılış Tahmini Al</span>
        </button>
      )}
    </div>
  );
}
