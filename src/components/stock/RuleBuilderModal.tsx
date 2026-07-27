/**
 * RuleBuilderModal.tsx
 * Hisseler için kural tanımlama modal parçası.
 */

import { useState } from "preact/hooks";
import type { StockRule, StockRuleType } from "@/types/stock.js";

interface RuleBuilderModalProps {
  initialSymbol?: string;
  availableSymbols: string[];
  onSave: (rule: Omit<StockRule, "id" | "createdAt">) => void;
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

export function RuleBuilderModal({
  initialSymbol = "THYAO",
  availableSymbols,
  onSave,
  onClose,
}: RuleBuilderModalProps) {
  const [symbol, setSymbol] = useState<string>(initialSymbol.toUpperCase());
  const [ruleType, setRuleType] = useState<StockRuleType>("PRICE_ABOVE");
  const [targetValue, setTargetValue] = useState<number>(100);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!symbol.trim()) {
      return;
    }
    onSave({
      symbol: symbol.trim().toUpperCase(),
      ruleType,
      targetValue: [
        "PRICE_ABOVE",
        "PRICE_BELOW",
        "STOP_LOSS",
        "TAKE_PROFIT",
        "TRAILING_STOP",
      ].includes(ruleType)
        ? targetValue
        : undefined,
      isActive: true,
    });
    onClose();
  };

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="stock-modal-header">
          <div className="stock-modal-title">Fiyat Alarmı Ekle</div>
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
            <label className="stock-form-label">Hisse Sembolü</label>
            {availableSymbols.length > 0 ? (
              <select
                className="stock-select"
                value={symbol}
                onChange={(e) =>
                  setSymbol((e.target as HTMLSelectElement).value)
                }
              >
                {availableSymbols.map((s) => (
                  <option key={s} value={s.toUpperCase()}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="stock-input"
                value={symbol}
                onInput={(e) => setSymbol((e.target as HTMLInputElement).value)}
                placeholder="Örn: THYAO"
                required
              />
            )}
          </div>

          <div className="stock-form-group">
            <label className="stock-form-label">Alarm / Kural Tipi</label>
            <select
              className="stock-select"
              value={ruleType}
              onChange={(e) => {
                const nextType = (e.target as HTMLSelectElement).value as StockRuleType;
                setRuleType(nextType);
                if (["PRICE_ABOVE", "PRICE_BELOW"].includes(nextType)) {
                  setTargetValue(100);
                } else if (["STOP_LOSS", "TAKE_PROFIT", "TRAILING_STOP"].includes(nextType)) {
                  setTargetValue(5);
                }
              }}
            >
              <option value="PRICE_ABOVE">
                🟢 Fiyat Belirtilen TL Üstüne Çıkınca Bildir (Örn: 100 TL Üstü)
              </option>
              <option value="PRICE_BELOW">
                🔻 Fiyat Belirtilen TL Altına İnince Bildir (Örn: 80 TL Altı)
              </option>
              <option value="STOP_LOSS">
                📉 Stop-Loss (Maliyetin % X Altına Düşerse Uyar)
              </option>
              <option value="TAKE_PROFIT">
                📈 Kar-Al (Maliyetin % X Üstüne Çıkarsa Uyar)
              </option>
              <option value="RED_CANDLE">
                🔴 Kırmızı Mum (Günü Eksiye Geçerse Uyar)
              </option>
              <option value="TAVAN_BREAK">
                ⚡ Tavan Bozdu (%10 Altına Düşerse Uyar)
              </option>
              <option value="TRAILING_STOP">
                🎯 İzleyen Stop (Zirveden % X Düşüşte Uyar)
              </option>
            </select>
          </div>

          {["PRICE_ABOVE", "PRICE_BELOW"].includes(ruleType) ? (
            <div className="stock-form-group">
              <label className="stock-form-label">Hedef Fiyat (TL)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="stock-input"
                placeholder="Örn: 150.00"
                value={targetValue}
                onInput={(e) =>
                  setTargetValue(
                    parseFloat((e.target as HTMLInputElement).value) || 0,
                  )
                }
                required
              />
            </div>
          ) : ["STOP_LOSS", "TAKE_PROFIT", "TRAILING_STOP"].includes(ruleType) ? (
            <div className="stock-form-group">
              <label className="stock-form-label">Yüzde Oranı (%)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                className="stock-input"
                value={targetValue}
                onInput={(e) =>
                  setTargetValue(
                    parseFloat((e.target as HTMLInputElement).value) || 1,
                  )
                }
                required
              />
            </div>
          ) : null}

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
              Alarmı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
