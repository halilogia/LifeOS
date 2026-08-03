import { useState } from "preact/hooks";
import { formatPrice } from "@/services/bistService.js";

interface CashBalanceModalProps {
  currentAmount: number;
  /** Called with the NEW total (current + added). */
  onAdd: (newAmount: number) => void;
  onClose: () => void;
}

export function CashBalanceModal({
  currentAmount,
  onAdd,
  onClose,
}: CashBalanceModalProps) {
  const [addAmount, setAddAmount] = useState(0);

  const newTotal = currentAmount + (addAmount || 0);

  return (
    <div
      className="settings-panel active"
      onClick={onClose}
      style={{ zIndex: 1002 }}
    >
      <div
        className="settings-content"
        style={{ maxWidth: "360px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>Nakit Ekle</h2>
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
          {/* Mevcut bakiye */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--card-border)",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              Mevcut Nakit
            </span>
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {formatPrice(currentAmount)}
            </span>
          </div>

          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Eklenecek tutarı gir. Hisse alımlarında düşülür, satışlarda otomatik
            eklenir.
          </p>

          <input
            type="number"
            step="0.01"
            min={0}
            value={addAmount || ""}
            placeholder="0,00 ₺"
            onInput={(e) => {
              const val = parseFloat((e.target as HTMLInputElement).value);
              setAddAmount(isNaN(val) ? 0 : val);
            }}
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid var(--card-border)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "var(--text-primary)",
              fontSize: "1.1rem",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          {/* Yeni toplam önizleme */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              Yeni Toplam
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "var(--accent-color)",
              }}
            >
              {formatPrice(newTotal)}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
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
              onClick={() => onAdd(newTotal)}
              disabled={addAmount <= 0}
              style={{
                flex: 1,
                background: "var(--accent-color)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: addAmount > 0 ? "pointer" : "not-allowed",
                opacity: addAmount > 0 ? 1 : 0.5,
              }}
            >
              Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
