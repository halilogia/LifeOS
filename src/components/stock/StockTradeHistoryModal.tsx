import type { StockTradeHistory } from "@/types/stock.js";

interface StockTradeHistoryModalProps {
  trades: StockTradeHistory[];
  onClose: () => void;
}

export function StockTradeHistoryModal({
  trades,
  onClose,
}: StockTradeHistoryModalProps) {
  const totalProfit = trades.reduce((acc, t) => acc + t.realizedProfit, 0);
  const isTotalProfit = totalProfit >= 0;

  return (
    <div
      className="settings-panel active"
      onClick={onClose}
      style={{ zIndex: 1002 }}
    >
      <div
        className="settings-content"
        style={{ maxWidth: "560px", maxHeight: "70vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>Satış Geçmişi</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Toplam gerçekleşen kâr/zarar özeti */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            margin: "8px 0 16px",
            borderRadius: "12px",
            background: isTotalProfit
              ? "rgba(16, 185, 129, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${
              isTotalProfit ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"
            }`,
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            Toplam Gerçekleşen Kâr/Zarar
          </span>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: isTotalProfit
                ? "var(--stock-up, #10b981)"
                : "var(--stock-down, #ef4444)",
            }}
          >
            {isTotalProfit ? "+" : ""}
            {totalProfit.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })}{" "}
            TL
          </span>
        </div>

        {trades.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
            }}
          >
            Henüz satış işlemi yapılmadı.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {trades.map((t) => {
              const isProfit = t.realizedProfit >= 0;
              return (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--card-border)",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      minWidth: "120px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.symbol.replace(/\.IS$/i, "")}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {new Date(t.soldAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      · {t.lotCount.toLocaleString("tr-TR")} lot
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      alignItems: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Alış {t.buyPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}{" "}
                      → Satış {t.sellPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: isProfit
                          ? "var(--stock-up, #10b981)"
                          : "var(--stock-down, #ef4444)",
                      }}
                    >
                      {isProfit ? "+" : ""}
                      {t.realizedProfit.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      TL ({isProfit ? "+" : ""}
                      {t.realizedProfitPercent.toLocaleString("tr-TR", {
                        maximumFractionDigits: 1,
                      })}
                      %)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
