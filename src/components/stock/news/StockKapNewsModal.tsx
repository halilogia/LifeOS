/**
 * StockKapNewsModal.tsx
 * Takip edilen BIST hisselerinin KAP ve borsa haberlerini gösteren modal parçası.
 * Tuval: state + fetch + AI analiz handler + KapNewsListItem listesi.
 */
import { useState, useEffect } from "preact/hooks";
import {
  fetchLatestKapNews,
  type KapNewsItem,
} from "@/services/kapNewsService.js";
import { analyzeKapNewsWithAI } from "@/services/stock/stockAiService.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";
import { KapNewsListItem } from "./KapNewsListItem.js";
import { IconX } from "./kapNewsIcons.js";

interface StockKapNewsModalProps {
  symbols: string[];
  lang: Language;
  onClose: () => void;
}

export function StockKapNewsModal({
  symbols,
  lang,
  onClose,
}: StockKapNewsModalProps) {
  const t = getTranslation(lang);
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
    } catch (e: unknown) {
      setAiAnalysisMap((prev) => ({
        ...prev,
        [item.id]: {
          loading: false,
          text: t.stock_kap_news_analysis_error.replace(
            "{message}",
            e instanceof Error
              ? e?.message || t.stock_error_occurred
              : String(e),
          ),
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
          <div className="stock-modal-title">{t.stock_kap_news_title}</div>
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
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#94a3b8",
              }}
            >
              <span>{t.stock_kap_news_loading}</span>
            </div>
          ) : news.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#94a3b8",
              }}
            >
              {t.stock_kap_news_empty}
            </div>
          ) : (
            news.map((item) => (
              <KapNewsListItem
                key={item.id}
                t={t}
                item={item}
                aiState={aiAnalysisMap[item.id]}
                onAnalyze={handleAnalyzeNews}
              />
            ))
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
            {t.stock_close_btn}
          </button>
        </div>
      </div>
    </div>
  );
}
