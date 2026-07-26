/**
 * HalkaArzView.tsx
 * Halka Arz (IPO) Takip Paneli.
 * Aktif halka arzlar ve Halka arz geçmişi takibi.
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

function IconRefresh() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export function HalkaArzView({ lang }: HalkaArzViewProps) {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<HalkaTabId>("active");
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

      {/* Grid List */}
      {loading ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}
        >
          <span>Halka arz verileri çekiliyor...</span>
        </div>
      ) : activeTab === "active" ? (
        activeIPOs.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}
          >
            Şu anda aktif veya talep toplayan halka arz bulunmuyor.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {activeIPOs.map((ipo) => (
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
