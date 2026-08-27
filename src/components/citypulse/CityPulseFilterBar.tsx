/**
 * CityPulseFilterBar.tsx
 * Modern search, category chips, venue filters, and free-only toggle for City Pulse.
 */

import type { CityEventCategory, CityEventType } from "@/types/cityPulse.js";

interface CityPulseFilterBarProps {
  t: Record<string, string>;
  categories: CityEventCategory[];
  types: CityEventType[];
  searchQuery: string;
  activeCategory: string;
  activeType: string;
  freeOnly: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onFreeOnlyChange: (value: boolean) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function CityPulseFilterBar({
  t,
  categories,
  types,
  searchQuery,
  activeCategory,
  activeType,
  freeOnly,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onFreeOnlyChange,
  onRefresh,
  isLoading = false,
}: CityPulseFilterBarProps) {
  // Common quick category types to show as interactive chips
  const popularTypes = types.filter((ty) => ty.count > 0).slice(0, 8);

  return (
    <header className="city-pulse-header">
      {/* Top Search & Dropdown Filters Bar */}
      <div className="city-pulse-filters-top">
        <div className="city-pulse-search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="city-pulse-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="city-pulse-search-input"
            className="city-pulse-input"
            type="text"
            placeholder={t.cp_search_placeholder || "Etkinlik adı, sanatçı veya mekan ara..."}
            value={searchQuery}
            onInput={(e) =>
              onSearchChange((e.target as HTMLInputElement).value)
            }
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              title="Aramayı Temizle"
            >
              &times;
            </button>
          )}
        </div>

        <select
          id="city-pulse-category-select"
          className="city-pulse-select"
          value={activeCategory}
          onChange={(e) =>
            onCategoryChange((e.target as HTMLSelectElement).value)
          }
          aria-label={t.cp_filter_category}
        >
          <option value="all">
            🏛️ {t.cp_filter_category || "Mekan / İlçe"}: {t.cp_filter_all || "Tümü"}
          </option>
          {categories
            .filter((c) => c.count > 0)
            .map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name} ({c.count})
              </option>
            ))}
        </select>

        <div className="city-pulse-actions-group">
          <button
            id="city-pulse-free-chip"
            className={`city-pulse-chip ${freeOnly ? "active" : ""}`}
            onClick={() => onFreeOnlyChange(!freeOnly)}
            title={t.cp_free_only_label}
          >
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
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {t.cp_free_chip || "Ücretsiz"}
          </button>

          {onRefresh && (
            <button
              className={`city-pulse-refresh-btn ${isLoading ? "spinning" : ""}`}
              onClick={onRefresh}
              disabled={isLoading}
              title={t.cp_refresh_btn || "Yenile"}
            >
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
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quick Event Type Chips Bar */}
      {popularTypes.length > 0 && (
        <div className="city-pulse-type-chips">
          <button
            className={`type-chip-btn ${activeType === "all" ? "active" : ""}`}
            onClick={() => onTypeChange("all")}
          >
            {t.cp_filter_all || "Tüm Türler"}
          </button>
          {popularTypes.map((ty) => (
            <button
              key={ty.id}
              className={`type-chip-btn ${activeType === String(ty.id) ? "active" : ""}`}
              onClick={() => onTypeChange(activeType === String(ty.id) ? "all" : String(ty.id))}
            >
              {ty.name}
              <span className="type-chip-count">{ty.count}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
