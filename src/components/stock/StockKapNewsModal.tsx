/**
 * StockKapNewsModal.tsx
 * Takip edilen BIST hisselerinin KAP ve borsa haberlerini gösteren modal parçası.
 */

import { useState, useEffect } from "preact/hooks";
import {
  fetchLatestKapNews,
  type KapNewsItem,
} from "@/services/kapNewsService.js";
import { analyzeKapNewsWithAI } from "@/services/stockAiService.js";

interface StockKapNewsModalProps {
  symbols: string[];
  onClose: () => void;
}

function IconX() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconExternal() {
  return (
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconSparkles() {
  return (
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

export function StockKapNewsModal({
  symbols,
  onClose,
}: StockKapNewsModalProps) {
  const [news, setNews] = useState<KapNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiAnalysisMap, setAiAnalysisMap] = useState<
    Record<string, { loading: boolean; text?: string }>
  >({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchLatestKapNews(symbols).then((data) => {
      if (isMounted) {
        setNews(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [symbols]);

  const handleAnalyzeNews = async (item: KapNewsItem) => {
    setAiAnalysisMap((prev) => ({
      ...prev,
      [item.id]: { loading: true },
    }));

    try {
      const result = await analyzeKapNewsWithAI({
        symbol: item.symbol,
        title: item.title,
        summary: item.summary,
      });
      setAiAnalysisMap((prev) => ({
        ...prev,
        [item.id]: { loading: false, text: result },
      }));
    } catch (e: any) {
      setAiAnalysisMap((prev) => ({
        ...prev,
        [item.id]: {
          loading: false,
          text: `⚠️ Analiz oluşturulamadı: ${e?.message || "Hata oluştu."}`,
        },
      }));
    }
  };

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div
        className="stock-modal-content"
        style={{ maxWidth: "650px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stock-modal-header">
          <div className="stock-modal-title">
            📰 KAP & BIST Şirket Haberleri
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
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            maxHeight: "440px",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}
            >
              <span>Resmi KAP haberleri yükleniyor...</span>
            </div>
          ) : news.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}
            >
              Takip ettiğiniz hisselere ait yeni bir KAP bildirimi bulunamadı.
            </div>
          ) : (
            news.map((item) => {
              const aiState = aiAnalysisMap[item.id];
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
                      <span>KAP Açıklamasını Göster</span>
                      <IconExternal />
                    </a>

                    <button
                      onClick={() => handleAnalyzeNews(item)}
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
                          ? "Analiz Ediliyor..."
                          : "AI ile Analiz Et"}
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
                        <span>AI Haber Analiz Özeti</span>
                      </div>
                      {aiState.text}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
          }}
        >
          <button className="stock-btn stock-btn-primary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
