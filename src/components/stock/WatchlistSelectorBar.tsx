/**
 * WatchlistSelectorBar.tsx
 * Midas Tarzı Çoklu Takip Listesi Seçim ve Yönetim Barı.
 * Kullanıcıların özel listeler oluşturmasını, listeler arası geçiş yapmasını ve yönetmesini sağlar.
 */

import { useState } from "preact/hooks";
import type { StockWatchlist } from "@/types/stock.js";

interface WatchlistSelectorBarProps {
  watchlists: StockWatchlist[];
  activeWatchlistId: string; // "all" veya watchlist.id
  totalPortfolioCount: number;
  onSelectWatchlist: (id: string) => void;
  onCreateWatchlist: (name: string) => void;
  onDeleteWatchlist: (id: string) => void;
}

function IconPlus() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function WatchlistSelectorBar({
  watchlists,
  activeWatchlistId,
  totalPortfolioCount,
  onSelectWatchlist,
  onCreateWatchlist,
  onDeleteWatchlist,
}: WatchlistSelectorBarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleCreateSubmit = (e: Event) => {
    e.preventDefault();
    if (!newListName.trim()) {return;}
    onCreateWatchlist(newListName.trim());
    setNewListName("");
    setShowAddForm(false);
  };

  return (
    <div className="watchlist-selector-container">
      <div className="watchlist-selector-scroll">
        {/* All Portfolio Tab */}
        <button
          type="button"
          className={`watchlist-tab-chip ${activeWatchlistId === "all" ? "active" : ""}`}
          onClick={() => onSelectWatchlist("all")}
        >
          <IconEye />
          <span>Tüm Portföyim & Takip</span>
          <span className="watchlist-chip-count">{totalPortfolioCount}</span>
        </button>

        {/* Custom Watchlists */}
        {watchlists.map((wl) => (
          <div
            key={wl.id}
            className={`watchlist-tab-chip-wrapper ${activeWatchlistId === wl.id ? "active" : ""}`}
          >
            <button
              type="button"
              className={`watchlist-tab-chip ${activeWatchlistId === wl.id ? "active" : ""}`}
              onClick={() => onSelectWatchlist(wl.id)}
            >
              <span>{wl.name}</span>
              <span className="watchlist-chip-count">{wl.symbols.length} varlık</span>
            </button>
            {activeWatchlistId === wl.id && (
              <button
                type="button"
                className="watchlist-delete-btn"
                title="Listeyi Sil"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteWatchlist(wl.id);
                }}
              >
                <IconTrash />
              </button>
            )}
          </div>
        ))}

        {/* Add List Button / Inline Form */}
        {!showAddForm ? (
          <button
            type="button"
            className="watchlist-tab-chip watchlist-add-chip"
            onClick={() => setShowAddForm(true)}
          >
            <IconPlus />
            <span>Liste Ekle</span>
          </button>
        ) : (
          <form className="watchlist-add-form" onSubmit={handleCreateSubmit}>
            <input
              type="text"
              className="watchlist-add-input"
              placeholder="Liste Adı (ör. Temettü)..."
              value={newListName}
              onInput={(e) => setNewListName((e.target as HTMLInputElement).value)}
              autoFocus
            />
            <button type="submit" className="watchlist-add-submit-btn">
              Ekle
            </button>
            <button
              type="button"
              className="watchlist-add-cancel-btn"
              onClick={() => setShowAddForm(false)}
            >
              Vazgeç
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
