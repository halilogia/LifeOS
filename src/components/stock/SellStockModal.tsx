import { useState } from "preact/hooks";

interface SellStockModalProps {
  symbol: string;
  currentLot: number;
  currentPrice: number;
  buyPrice: number;
  onConfirm: (lotToSell: number, sellPrice: number) => void;
  onClose: () => void;
}

export function SellStockModal({
  symbol,
  currentLot,
  currentPrice,
  buyPrice,
  onConfirm,
  onClose,
}: SellStockModalProps) {
  const [lotToSell, setLotToSell] = useState(currentLot);
  const [sellPrice, setSellPrice] = useState(currentPrice);

  const previewProfit = (sellPrice - buyPrice) * lotToSell;
  const previewPercent =
    buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;
  const isProfit = previewProfit >= 0;

  return (
    <div
      className="settings-panel active"
      onClick={onClose}
      style={{ zIndex: 1002 }}
    >
      <div
        className="settings-content"
        style={{ maxWidth: "400px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>Satış İşlemi — {symbol}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "8px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              padding: "8px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
            }}
          >
            <span>Mevcut Lot</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {currentLot.toLocaleString("tr-TR")}
            </span>
          </div>

          <label
            style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
          >
            Satılacak Lot Adedi
          </label>
          <input
            type="number"
            min={1}
            max={currentLot}
            value={lotToSell}
            onInput={(e) => {
              const val = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(val)) {
                setLotToSell(Math.min(val, currentLot));
              }
            }}
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid var(--card-border)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "var(--text-primary)",
              fontSize: "1rem",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
          >
            Satış Fiyatı (TL)
          </label>
          <input
            type="number"
            step="0.01"
            min={0.01}
            value={sellPrice}
            onInput={(e) => {
              const val = parseFloat((e.target as HTMLInputElement).value);
              if (!isNaN(val)) {
                setSellPrice(val);
              }
            }}
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid var(--card-border)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "var(--text-primary)",
              fontSize: "1rem",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          {/* Kâr/Zarar Önizleme */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "12px",
              borderRadius: "12px",
              background: isProfit
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${
                isProfit ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>Alış Fiyatı</span>
              <span style={{ color: "var(--text-primary)" }}>
                {buyPrice.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                TL
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>Satış Fiyatı</span>
              <span style={{ color: "var(--text-primary)" }}>
                {sellPrice.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                TL
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "4px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontWeight: 700,
              }}
            >
              <span>Tahmini Kâr/Zarar</span>
              <span
                style={{
                  color: isProfit
                    ? "var(--stock-up, #10b981)"
                    : "var(--stock-down, #ef4444)",
                }}
              >
                {isProfit ? "+" : ""}
                {previewProfit.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                TL ({isProfit ? "+" : ""}
                {previewPercent.toLocaleString("tr-TR", {
                  maximumFractionDigits: 1,
                })}
                %)
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <button
              className="text-btn"
              onClick={onClose}
              style={{
                flex: 1,
                justifyContent: "center",
                padding: "12px",
                fontSize: "0.9rem",
                border: "1px solid var(--card-border)",
              }}
            >
              İptal
            </button>
            <button
              onClick={() => onConfirm(lotToSell, sellPrice)}
              style={{
                flex: 1,
                background: "var(--accent-color)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Satışı Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
