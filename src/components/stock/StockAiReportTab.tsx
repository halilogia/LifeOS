/**
 * StockAiReportTab.tsx
 * AI Borsa Raporu ve Alım/Yatırım Danışmanı bileşeni (9Router entegrasyonlu).
 */

import { useState } from "preact/hooks";
import type { StockPortfolioItem } from "@/types/stock.js";
import type { StockQuote } from "@/types/bist.js";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { analyzeStockWithAI } from "@/services/stockAiService.js";
import { getStockReportUserPrompt } from "@/services/stockPrompts.js";

interface StockAiReportTabProps {
  portfolio: StockPortfolioItem[];
  quotes: StockQuote[];
  lang: Language;
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

function IconSearch() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function StockAiReportTab({
  portfolio,
  quotes,
  lang,
}: StockAiReportTabProps) {
  const t = getTranslation(lang);
  const [subTab, setSubTab] = useState<"digest" | "advisor">("digest");
  const [reportText, setReportText] = useState<string>("");
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // Advisor form states
  const [querySymbol, setQuerySymbol] = useState<string>("");
  const [queryQuestion, setQueryQuestion] = useState<string>("");
  const [advisorResponse, setAdvisorResponse] = useState<string>("");
  const [advisorLoading, setAdvisorLoading] = useState<boolean>(false);

  // Generate Executive Summary
  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await analyzeStockWithAI({
        portfolio,
        userQuestion: getStockReportUserPrompt(lang),
      });
      setReportText(res);
    } catch {
      setReportText(t.stock_analysis_report_error);
    } finally {
      setReportLoading(false);
    }
  };

  // Run Advisor Query
  const handleAskAdvisor = async (e: Event) => {
    e.preventDefault();
    if (!querySymbol.trim()) {
      return;
    }

    setAdvisorLoading(true);
    const sym = querySymbol.trim().toUpperCase().replace(/\.IS$/, "");
    const matchedQuote = quotes.find(
      (q) => q.symbol.replace(/\.IS$/, "").toUpperCase() === sym,
    );

    try {
      const res = await analyzeStockWithAI({
        symbol: sym,
        quote: matchedQuote,
        userQuestion: queryQuestion.trim()
          ? queryQuestion.trim()
          : t.stock_analysis_prompt_advisor_default.replace("{symbol}", sym),
      });
      setAdvisorResponse(res);
    } catch {
      setAdvisorResponse(t.stock_analysis_query_error);
    } finally {
      setAdvisorLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Sub-tab Switcher */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className={`stock-btn ${subTab === "digest" ? "stock-btn-primary" : "stock-btn-secondary"}`}
          onClick={() => setSubTab("digest")}
        >
          <IconSparkles />
          <span>{t.stock_ai_report_tab_digest}</span>
        </button>
        <button
          className={`stock-btn ${subTab === "advisor" ? "stock-btn-primary" : "stock-btn-secondary"}`}
          onClick={() => setSubTab("advisor")}
        >
          <IconSearch />
          <span>{t.stock_ai_report_tab_advisor}</span>
        </button>
      </div>

      {/* Tab 1: AI Digest */}
      {subTab === "digest" && (
        <div
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc" }}>
                {t.stock_ai_report_title}
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.82rem",
                  color: "#94a3b8",
                }}
              >
                {t.stock_ai_report_desc}
              </p>
            </div>
            <button
              className="stock-btn stock-btn-ai"
              onClick={handleGenerateReport}
              disabled={reportLoading}
            >
              <IconSparkles />
              <span>
                {reportLoading
                  ? t.stock_analysis_report_generating
                  : t.stock_analysis_report_generate}
              </span>
            </button>
          </div>

          {reportLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
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
                  margin: "0 auto 12px",
                }}
              />
              <span>{t.stock_ai_report_analyzing}</span>
            </div>
          ) : reportText ? (
            <div
              style={{
                fontSize: "0.92rem",
                lineHeight: "1.65",
                color: "#e2e8f0",
                whiteSpace: "pre-wrap",
                background: "rgba(15, 23, 42, 0.6)",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {reportText}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#64748b",
                fontSize: "0.9rem",
              }}
            >
              {t.stock_ai_report_empty}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Investment Advisor */}
      {subTab === "advisor" && (
        <div
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc" }}>
              {t.stock_ai_advisor_title}
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.82rem",
                color: "#94a3b8",
              }}
            >
              {t.stock_ai_advisor_desc}
            </p>
          </div>

          <form
            onSubmit={handleAskAdvisor}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "12px",
              }}
            >
              <div className="stock-form-group">
                <label className="stock-form-label">
                  {t.stock_ai_advisor_symbol_label}
                </label>
                <input
                  type="text"
                  className="stock-input"
                  placeholder={t.stock_ai_advisor_symbol_placeholder}
                  value={querySymbol}
                  onInput={(e) =>
                    setQuerySymbol((e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div className="stock-form-group">
                <label className="stock-form-label">
                  {t.stock_ai_advisor_question_label}
                </label>
                <input
                  type="text"
                  className="stock-input"
                  placeholder={t.stock_ai_advisor_question_placeholder}
                  value={queryQuestion}
                  onInput={(e) =>
                    setQueryQuestion((e.target as HTMLInputElement).value)
                  }
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="stock-btn stock-btn-primary"
                disabled={advisorLoading}
              >
                <IconSearch />
                <span>
                  {advisorLoading
                    ? t.stock_analysis_analyzing
                    : t.stock_analysis_ask}
                </span>
              </button>
            </div>
          </form>

          {advisorLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px 0",
                color: "#94a3b8",
              }}
            >
              <span>
                {t.stock_ai_advisor_analyzing.replace(
                  "{symbol}",
                  querySymbol.toUpperCase(),
                )}
              </span>
            </div>
          ) : advisorResponse ? (
            <div
              style={{
                fontSize: "0.92rem",
                lineHeight: "1.65",
                color: "#e2e8f0",
                whiteSpace: "pre-wrap",
                background: "rgba(15, 23, 42, 0.6)",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {advisorResponse}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
