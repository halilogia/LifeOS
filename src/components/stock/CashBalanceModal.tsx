import { useState } from "preact/hooks";

interface CashBalanceModalProps {
  initialAmount: number;
  onSave: (amount: number) => void;
  onClose: () => void;
}

export function CashBalanceModal({
  initialAmount,
  onSave,
  onClose,
}: CashBalanceModalProps) {
  const [amount, setAmount] = useState(initialAmount || 0);

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
          <h2>Nakit Bakiyesi</h2>
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
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Hisse alımlarında düşülür, satışlarda eklenir. Bankadaki mevcut
            bakiyeni buraya girebilirsin.
          </p>

          <input
            type="number"
            step="0.01"
            min={0}
            value={amount}
            onInput={(e) => {
              const val = parseFloat((e.target as HTMLInputElement).value);
              if (!isNaN(val)) {
                setAmount(val);
              }
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
              onClick={() => onSave(amount)}
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
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
