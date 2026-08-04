/**
 * StockAiAnalysisModal.tsx
 * Hisseler için AI yorum ve analiz görüntüleme modali.
 */

import { useState, useEffect } from "preact/hooks";
import { analyzeStockWithAI } from "@/services/stock/stockAiService.js";
import type { StockQuote } from "@/types/bist.js";
import type { StockPortfolioItem } from "@/types/stock.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

interface StockAiAnalysisModalProps {
  symbol: string;
  quote?: StockQuote;
  portfolioItems?: StockPortfolioItem[];
  onClose: () => void;
  onContinueToChat?: () => void;
  lang: Language;
}

function IconX() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  );
}

export function StockAiAnalysisModal({
  symbol,
  quote,
  portfolioItems,
  onClose,
  onContinueToChat,
  lang,
}: StockAiAnalysisModalProps) {
  const t = getTranslation(lang);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const isAllPortfolio = symbol === "ALL_PORTFOLIO";

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const reqPayload =
      isAllPortfolio && portfolioItems
        ? { portfolio: portfolioItems }
        : { symbol, quote };

    analyzeStockWithAI(reqPayload).then((res) => {
      if (isMounted) {
        setAnalysisText(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [symbol, quote, portfolioItems]);

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div
        className="stock-modal-content"
        style={{ maxWidth: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stock-modal-header">
          <div
            className="stock-modal-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <IconSparkles />
            <span>
              {isAllPortfolio
                ? t.stock_analysis_morning_report
                : t.stock_analysis_for_symbol.replace(
                    "{symbol}",
                    symbol.toUpperCase(),
                  )}
            </span>
          </div>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            <IconX />
          </button>
        </div>

        <div
          style={{
            minHeight: "160px",
            maxHeight: "400px",
            overflowY: "auto",
            padding: "10px 0",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 0",
                gap: "12px",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  animation: "spin 1s linear infinite",
                  width: "24px",
                  height: "24px",
                  border: "3px solid rgba(255,255,255,0.2)",
                  borderTopColor: "#818cf8",
                  borderRadius: "50%",
                }}
              />
              <span>
                {t.stock_analysis_analyzing_symbol.replace("{symbol}", symbol)}
              </span>
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.92rem",
                lineHeight: "1.6",
                color: "#e2e8f0",
                whiteSpace: "pre-wrap",
                background: "rgba(15, 23, 42, 0.6)",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {analysisText}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "10px",
          }}
        >
          {onContinueToChat && (
            <button
              className="stock-btn stock-btn-ai"
              onClick={onContinueToChat}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>AI Chat'te Devam Et</span>
            </button>
          )}
          <button className="stock-btn stock-btn-primary" onClick={onClose}>
            {t.stock_close_btn}
          </button>
        </div>
      </div>
    </div>
  );
}
