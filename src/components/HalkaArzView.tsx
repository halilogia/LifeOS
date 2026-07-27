/**
 * HalkaArzView.tsx
 * Halka Arz (IPO) Takip Paneli.
 * Aktif, Yaklaşan ve Geçmiş Halka Arz Takibi Filtreleme.
 */

import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { IpoCard } from "@/components/stock/IpoCard.js";
import {
  fetchActiveIPOs,
  fetchIPOHistory,
  IPOEntry,
} from "@/services/ipoService.js";

interface HalkaArzViewProps {
  lang: Language;
}

type HalkaTabId = "active" | "history";
type ActiveSubFilter = "all" | "active_only" | "upcoming_only";

function IconRefresh() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export function HalkaArzView({ lang }: HalkaArzViewProps) {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<HalkaTabId>("active");
  const [subFilter, setSubFilter] = useState<ActiveSubFilter>("active_only");
  const [activeIPOs, setActiveIPOs] = useState<IPOEntry[]>([]);
  const [historyIPOs, setHistoryIPOs] = useState<IPOEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadIPOs = () => {
    setLoading(true);
    Promise.all([fetchActiveIPOs(), fetchIPOHistory(30)])
      .then(([act, hist]) => {
        setActiveIPOs(act.data);
        setHistoryIPOs(hist.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIPOs();
  }, []);

  // Compute counts for active vs upcoming
  const activeOnlyCount = activeIPOs.filter(
    (item) => item.status === "active",
  ).length;
  const upcomingOnlyCount = activeIPOs.filter(
    (item) => item.status === "upcoming",
  ).length;

  const displayedActiveList = activeIPOs.filter((item) => {
    if (subFilter === "active_only") return item.status === "active";
    if (subFilter === "upcoming_only") return item.status === "upcoming";
    return true;
  });

  return (
    <div className="stock-dashboard">
      {/* Üst Bar */}
      <div className="stock-action-bar">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className={`stock-btn ${activeTab === "active" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("active")}
          >
            🎯 Aktif & Yaklaşan Halka Arzlar ({activeIPOs.length})
          </button>
          <button
            className={`stock-btn ${activeTab === "history" ? "stock-btn-primary" : "stock-btn-secondary"}`}
            onClick={() => setActiveTab("history")}
          >
            📜 Halka Arz Geçmişi ({historyIPOs.length})
          </button>
        </div>

        <button
          className="stock-btn stock-btn-secondary"
          onClick={loadIPOs}
          title="Yenile"
        >
          <IconRefresh />
          <span>{loading ? "Yükleniyor..." : "Yenile"}</span>
        </button>
      </div>

      {/* Aktif vs Yakında Filtreleme Hapları (İlki Aktif, Tümü En Sağa) */}
      {activeTab === "active" && !loading && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginTop: "-6px",
            marginBottom: "6px",
          }}
        >
          <button
            onClick={() => setSubFilter("active_only")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border:
                subFilter === "active_only"
                  ? "1px solid #10b981"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              background:
                subFilter === "active_only"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(255, 255, 255, 0.03)",
              color: subFilter === "active_only" ? "#34d399" : "#94a3b8",
            }}
          >
            🟢 Talep Toplayanlar / Aktif ({activeOnlyCount})
          </button>
          <button
            onClick={() => setSubFilter("upcoming_only")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border:
                subFilter === "upcoming_only"
                  ? "1px solid #f59e0b"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              background:
                subFilter === "upcoming_only"
                  ? "rgba(245, 158, 11, 0.2)"
                  : "rgba(255, 255, 255, 0.03)",
              color: subFilter === "upcoming_only" ? "#fbbf24" : "#94a3b8",
            }}
          >
            ⏳ Yakında Başlayacaklar ({upcomingOnlyCount})
          </button>
          <button
            onClick={() => setSubFilter("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border:
                subFilter === "all"
                  ? "1px solid var(--accent-color)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              background:
                subFilter === "all"
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(255, 255, 255, 0.03)",
              color: subFilter === "all" ? "#c084fc" : "#94a3b8",
            }}
          >
            Tümü ({activeIPOs.length})
          </button>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}
        >
          <span>Halka arz verileri çekiliyor...</span>
        </div>
      ) : activeTab === "active" ? (
        displayedActiveList.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}
          >
            Seçilen filtrede gösterilecek halka arz bulunmuyor.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {displayedActiveList.map((ipo) => (
              <IpoCard key={ipo.id} ipo={ipo} lang={lang} t={t} />
            ))}
          </div>
        )
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {historyIPOs.map((ipo) => (
            <IpoCard key={ipo.id} ipo={ipo} lang={lang} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
