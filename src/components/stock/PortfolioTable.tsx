/**
 * PortfolioTable.tsx
 * Kullanıcının sahip olduğu BIST hisselerinin canlı portföy tablosu parçası.
 * Tuval: tablo + satırlar (PortfolioRow parçası).
 */
import type { StockQuote } from "@/types/bist.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";
import { PortfolioRow } from "./PortfolioRow.js";
import { IconBriefcase } from "./portfolioIcons.js";

interface PortfolioTableProps {
  portfolio: StockPortfolioItem[];
  quotes: StockQuote[];
  rules: StockRule[];
  onOpenAddModal: () => void;
  onAddRuleClick: (symbol: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onDeleteItem: (id: string) => void;
  onSellItem: (
    id: string,
    symbol: string,
    currentLot: number,
    currentPrice: number,
  ) => void;
  onAiAnalyzeClick: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export function PortfolioTable({
  portfolio,
  quotes,
  rules,
  onAddRuleClick,
  onDeleteRule,
  onDeleteItem,
  onSellItem,
  onAiAnalyzeClick,
  onOpenChart,
}: Omit<PortfolioTableProps, "onOpenAddModal">) {
  const quoteMap = new Map<string, StockQuote>();
  for (const q of quotes) {
    quoteMap.set(q.symbol.replace(/\.IS$/, "").toUpperCase(), q);
  }

  return (
    <div className="stock-table-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <IconBriefcase />
          <span>BİST Portföy Varlıklarım ({portfolio.length})</span>
        </div>
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Hisse</th>
            <th style={{ textAlign: "right" }}>Son Fiyat</th>
            <th style={{ textAlign: "center" }}>Günlük %</th>
            <th style={{ textAlign: "right" }}>Alış Fiyatı</th>
            <th style={{ textAlign: "center" }}>Adet (Lot)</th>
            <th style={{ textAlign: "right" }}>Toplam Değer</th>
            <th style={{ textAlign: "right" }}>Kar / Zarar</th>
            <th style={{ textAlign: "left" }}>Aktif Alarmlar</th>
            <th style={{ textAlign: "right" }}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  textAlign: "center",
                  padding: "36px 20px",
                  color: "#94a3b8",
                }}
              >
                Henüz portföyünüze bir hisse eklemediniz. Yukarıdaki "+ Hisse /
                Varlık Ekle" butonuna basarak ilk alışınızı kaydedebilirsiniz.
              </td>
            </tr>
          ) : (
            portfolio.map((item) => (
              <PortfolioRow
                key={item.id}
                item={item}
                quoteMap={quoteMap}
                rules={rules}
                onAddRuleClick={onAddRuleClick}
                onDeleteRule={onDeleteRule}
                onDeleteItem={onDeleteItem}
                onSellItem={onSellItem}
                onAiAnalyzeClick={onAiAnalyzeClick}
                onOpenChart={onOpenChart}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
