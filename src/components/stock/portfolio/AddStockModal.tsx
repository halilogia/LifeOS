/**
 * AddStockModal.tsx
 * Takip edilen veya satın alınan BIST hissesi ekleme modali.
 */

import { useState, useEffect } from "preact/hooks";
import { fetchDynamicBistTickers } from "@/services/bistService.js";
import type { StockPortfolioItem } from "@/types/stock.js";

interface AddStockModalProps {
  initialSymbol?: string;
  onSave: (item: Omit<StockPortfolioItem, "id">) => void;
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

export function AddStockModal({
  initialSymbol,
  onSave,
  onClose,
}: AddStockModalProps) {
  const [selectedStock, setSelectedStock] = useState<string>("THYAO.IS");
  const [customSymbol, setCustomSymbol] = useState<string>(initialSymbol || "");
  const [useCustom, setUseCustom] = useState<boolean>(Boolean(initialSymbol));
  const [displayName, setDisplayName] = useState<string>(initialSymbol || "");
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [lotCount, setLotCount] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [tickers, setTickers] = useState<string[]>([
    "THYAO.IS",
    "GARAN.IS",
    "AKBNK.IS",
    "EREGL.IS",
    "ASELS.IS",
  ]);

  useEffect(() => {
    fetchDynamicBistTickers().then((list) => {
      if (list && list.length > 0) {
        setTickers(list);
      }
    });
  }, []);

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const rawSym = useCustom ? customSymbol.trim() : selectedStock;
    if (!rawSym) {
      return;
    }

    let fullSym = rawSym.toUpperCase();
    if (!fullSym.endsWith(".IS")) {
      fullSym += ".IS";
    }

    const finalName = displayName.trim() || fullSym.replace(".IS", "");

    onSave({
      symbol: fullSym,
      displayName: finalName,
      buyPrice: Math.max(0, buyPrice),
      lotCount: Math.max(0, lotCount),
      buyDate: new Date().toISOString().split("T")[0],
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="stock-modal-header">
          <div className="stock-modal-title">Portföye Hisse Ekle</div>
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div className="stock-form-group">
            <label className="stock-form-label">Hisse Seçimi</label>
            {!useCustom ? (
              <select
                className="stock-select"
                value={selectedStock}
                onChange={(e) =>
                  setSelectedStock((e.target as HTMLSelectElement).value)
                }
              >
                {tickers.map((sym) => (
                  <option key={sym} value={sym}>
                    {sym.replace(".IS", "")}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="stock-input"
                placeholder="Hisse Kodu (Örn: KRDMD, SASA, EREGL)"
                value={customSymbol}
                onInput={(e) =>
                  setCustomSymbol((e.target as HTMLInputElement).value)
                }
                required
              />
            )}
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#818cf8",
                fontSize: "0.78rem",
                textAlign: "left",
                cursor: "pointer",
                padding: "2px 0",
              }}
              onClick={() => setUseCustom(!useCustom)}
            >
              {useCustom
                ? "← Popüler hisselerden seç"
                : "+ Farklı BIST hisse koda sahip ol (Özel kod gir)"}
            </button>
          </div>

          <div className="stock-form-group">
            <label className="stock-form-label">
              Şirket Adı (İsteğe Bağlı)
            </label>
            <input
              type="text"
              className="stock-input"
              placeholder="Örn: Kardemir D"
              value={displayName}
              onInput={(e) =>
                setDisplayName((e.target as HTMLInputElement).value)
              }
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div className="stock-form-group">
              <label className="stock-form-label">Alış Fiyatı (TL)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="stock-input"
                placeholder="0.00"
                value={buyPrice || ""}
                onInput={(e) =>
                  setBuyPrice(
                    parseFloat((e.target as HTMLInputElement).value) || 0,
                  )
                }
              />
            </div>

            <div className="stock-form-group">
              <label className="stock-form-label">Adet / Lot</label>
              <input
                type="number"
                min="0"
                className="stock-input"
                placeholder="0"
                value={lotCount || ""}
                onInput={(e) =>
                  setLotCount(
                    parseInt((e.target as HTMLInputElement).value, 10) || 0,
                  )
                }
              />
            </div>
          </div>

          <div className="stock-form-group">
            <label className="stock-form-label">Not (İsteğe Bağlı)</label>
            <input
              type="text"
              className="stock-input"
              placeholder="Örn: Halka arz katılımı / 1. kademe alım"
              value={note}
              onInput={(e) => setNote((e.target as HTMLInputElement).value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              type="button"
              className="stock-btn stock-btn-secondary"
              onClick={onClose}
            >
              İptal
            </button>
            <button type="submit" className="stock-btn stock-btn-primary">
              Portföye Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
