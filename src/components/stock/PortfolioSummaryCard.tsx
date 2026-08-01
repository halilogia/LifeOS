/**
 * PortfolioSummaryCard.tsx
 * Portföy özet metriklerini (Toplam Değer, Günlük Kar/Zarar, Aktif Kurallar) gösteren kart parçası.
 */

import { formatPrice } from "@/services/bistService.js";

interface PortfolioSummaryCardProps {
  totalValue: number;
  totalCost: number;
  dailyProfitLoss: number;
  dailyProfitLossPercent: number;
  activeRulesCount: number;
  triggeredAlertsCount: number;
  cashBalance: number;
  totalWealth: number;
  onEditCash: (e: MouseEvent) => void;
}

function IconWallet() {
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
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  );
}

function IconTrendUp() {
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
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconShield() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconBell() {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function PortfolioSummaryCard({
  totalValue,
  totalCost,
  dailyProfitLoss,
  dailyProfitLossPercent,
  activeRulesCount,
  triggeredAlertsCount,
  cashBalance,
  totalWealth,
  onEditCash,
}: PortfolioSummaryCardProps) {
  const totalProfit = totalValue - totalCost;
  const isZeroProfit = Math.abs(totalProfit) < 0.001;
  const isPositive = totalProfit > 0;
  const isDailyPositive = dailyProfitLoss >= 0;

  return (
    <div className="stock-summary-grid">
      {/* Toplam Varlık (Nakit + Hisse) */}
      <div className="stock-summary-card">
        <div
          className="stock-card-label"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <IconWallet />
          <span>Toplam Varlık</span>
        </div>
        <div className="stock-card-value">
          {totalWealth > 0 ? formatPrice(totalWealth) : "0,00 ₺"}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ minWidth: "70px" }}>Nakit</span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minWidth: "110px",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {formatPrice(cashBalance)}
              </span>
              <button
                onClick={onEditCash}
                title="Nakit ekle"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent-color)",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ minWidth: "70px" }}>Hisse Değeri</span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minWidth: "110px",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {formatPrice(totalValue)}
              </span>
              {/* Görünmez kalem — sadece hizalama için (Nakit satırıyla aynı genişlik) */}
              <span
                aria-hidden="true"
                style={{
                  width: "13px",
                  height: "13px",
                  flexShrink: 0,
                  opacity: 0,
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Günlük Kar / Zarar */}
      <div className="stock-summary-card">
        <div
          className="stock-card-label"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <IconTrendUp />
          <span>Günlük Değişim</span>
        </div>
        <div className="stock-card-value">{formatPrice(dailyProfitLoss)}</div>
        <div
          className={`stock-card-badge ${isDailyPositive ? "stock-badge-positive" : "stock-badge-negative"}`}
        >
          {isDailyPositive ? "+" : ""}
          {dailyProfitLossPercent.toFixed(2)}%
        </div>
      </div>

      {/* Alarmlar ve Bildirimler */}
      <div className="stock-summary-card">
        <div
          className="stock-card-label"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <IconShield />
          <span>Alarmlar & Takip</span>
        </div>
        <div className="stock-card-value">{activeRulesCount} Aktif Kural</div>
        <div
          className={`stock-card-badge ${
            triggeredAlertsCount > 0
              ? "stock-badge-negative"
              : "stock-badge-neutral"
          }`}
        >
          {triggeredAlertsCount > 0
            ? `${triggeredAlertsCount} Tetiklenen Bildirim`
            : "7/24 Fiyat Takibi"}
        </div>
      </div>
    </div>
  );
}
