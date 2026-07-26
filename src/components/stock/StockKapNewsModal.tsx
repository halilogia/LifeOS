/**
 * StockKapNewsModal.tsx
 * Takip edilen BIST hisselerinin KAP ve borsa haberlerini gösteren modal parçası.
 */

import { useState, useEffect } from "preact/hooks";
import {
  fetchLatestKapNews,
  type KapNewsItem,
} from "@/services/kapNewsService.js";

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
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
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
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function StockKapNewsModal({
  symbols,
  onClose,
}: StockKapNewsModalProps) {
  const [news, setNews] = useState<KapNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div
        className="stock-modal-content"
        style={{ maxWidth: "600px" }}
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
            gap: "10px",
            maxHeight: "400px",
            overflowY: "auto",
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
            news.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
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
                    marginTop: "4px",
                    textDecoration: "none",
                  }}
                >
                  <span>KAP Açıklamasını Göster</span>
                  <IconExternal />
                </a>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "10px",
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
