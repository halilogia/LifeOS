import { useState } from "preact/hooks";
import type { StockWatchlist } from "@/types/stock.js";
import { IconCheck } from "./exploreIcons.js";

interface ExploreWatchlistModalProps {
  t: Record<string, string>;
  watchlists: StockWatchlist[];
  symbol: string;
  onToggle: (watchlistId: string, symbol: string) => void;
  onClose: () => void;
}

export function ExploreWatchlistModal({
  t,
  watchlists,
  symbol,
  onToggle,
  onClose,
}: ExploreWatchlistModalProps) {
  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div
        className="stock-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "400px" }}
      >
        <div className="stock-modal-header">
          <div className="stock-modal-title">
            {t.stock_watchlist_add_title.replace(
              "{symbol}",
              symbol.toUpperCase(),
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "1.2rem",
              fontWeight: 700,
              cursor: "pointer",
              padding: "4px 8px",
            }}
            title={t.stock_close_btn}
          >
            &times;
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {watchlists.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "16px 8px",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              {t.stock_no_watchlist}
            </div>
          ) : (
            watchlists.map((wl) => {
              const isAdded = wl.symbols.some(
                (s) =>
                  s.replace(".IS", "").toUpperCase() === symbol.toUpperCase(),
              );
              return (
                <button
                  key={wl.id}
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: isAdded
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${isAdded ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                    color: isAdded ? "#e0e7ff" : "#f1f5f9",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    onToggle(wl.id, symbol);
                  }}
                >
                  <span>
                    {t.stock_watchlist_asset_count
                      .replace("{name}", wl.name)
                      .replace("{count}", String(wl.symbols.length))}
                  </span>
                  {isAdded && (
                    <span
                      style={{
                        color: "#818cf8",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <IconCheck />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
