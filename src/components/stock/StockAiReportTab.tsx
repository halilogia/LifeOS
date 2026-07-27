/**
 * StockAiReportTab.tsx
 * AI Borsa Raporu ve Alım/Yatırım Danışmanı bileşeni (9Router entegrasyonlu).
 */

import { useState } from "preact/hooks";
import { analyzeStockWithAI } from "@/services/stockAiService.js";
import type { StockPortfolioItem } from "@/types/stock.js";
import type { StockQuote } from "@/services/bistService.js";

interface StockAiReportTabProps {
  portfolio: StockPortfolioItem[];
  quotes: StockQuote[];
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

export function StockAiReportTab({ portfolio, quotes }: StockAiReportTabProps) {
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
        userQuestion:
          "Portföyümün bugünkü/bu haftaki genel durumunu, risklerini ve dikkat edilmesi gereken konuları Türkçe sade bir gazete özeti olarak çıkar.",
      });
      setReportText(res);
    } catch {
      setReportText(
        "Rapor oluşturulurken bir hata meydana geldi. Lütfen 9Router / AI ayarlarınızı kontrol edin.",
      );
    } finally {
      setReportLoading(false);
    }
  };

  // Run Advisor Query
  const handleAskAdvisor = async (e: Event) => {
    e.preventDefault();
    if (!querySymbol.trim()) {return;}

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
          : `${sym} hissesini almayı düşünüyorum. Şirketin genel seyri, riskleri ve dikkat edilmesi gereken konular hakkında ne düşünüyorsun?`,
      });
      setAdvisorResponse(res);
    } catch {
      setAdvisorResponse(
        "Danışman sorgusu yanıtlanamadı. Lütfen AI ayarlarınızı kontrol edin.",
      );
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
          <span>Günlük / Haftalık AI Borsa Özeti</span>
        </button>
        <button
          className={`stock-btn ${subTab === "advisor" ? "stock-btn-primary" : "stock-btn-secondary"}`}
          onClick={() => setSubTab("advisor")}
        >
          <IconSearch />
          <span>Yatırım & Alım Karar Asistanı</span>
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
                🤖 AI Portföy & Piyasa Sağlık Raporu
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.82rem",
                  color: "#94a3b8",
                }}
              >
                9Router AI altyapısıyla portföyünüzün genel durumunu tek tıkla
                Türkçe sade bir özet olarak alın.
              </p>
            </div>
            <button
              className="stock-btn stock-btn-ai"
              onClick={handleGenerateReport}
              disabled={reportLoading}
            >
              <IconSparkles />
              <span>
                {reportLoading ? "Rapor Hazırlanıyor..." : "Rapor Oluştur"}
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
              <span>
                9Router AI portföy verilerini ve piyasayı analiz ediyor...
              </span>
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
              Henüz rapor oluşturulmadı. Yukarıdaki "Rapor Oluştur" butonuna
              basarak anlık piyasa özetinizi alabilirsiniz.
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
              💡 Alım & Yatırım Karar Asistanı
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.82rem",
                color: "#94a3b8",
              }}
            >
              Yeni bir hisse almadan veya karar vermeden önce hisse kodunu
              yazarak 9Router AI'dan sade değerlendirme alın.
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
                <label className="stock-form-label">Hisse Sembolü</label>
                <input
                  type="text"
                  className="stock-input"
                  placeholder="Örn: KRDMD, SASA, EREGL"
                  value={querySymbol}
                  onInput={(e) =>
                    setQuerySymbol((e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div className="stock-form-group">
                <label className="stock-form-label">
                  Özel Soru (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  className="stock-input"
                  placeholder="Örn: Bu hisseyi 1 ay tutmak riskli mi?"
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
                    ? "AI Analiz Ediyor..."
                    : "AI Danışmanına Sor"}
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
                AI {querySymbol.toUpperCase()} hissesini değerlendiriyor...
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
