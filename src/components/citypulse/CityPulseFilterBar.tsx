/**
 * CityPulseFilterBar.tsx
 * Search, venue/type selects, and the "Free only" chip for City Pulse.
 * Pure presentational component — receives state + callbacks via props.
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
}: CityPulseFilterBarProps) {
  return (
    <header className="city-pulse-header">
      <div className="city-pulse-filters">
        <div className="city-pulse-search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="city-pulse-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="city-pulse-search-input"
            className="city-pulse-input"
            type="text"
            placeholder={t.cp_search_placeholder}
            value={searchQuery}
            onInput={(e) =>
              onSearchChange((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <select
          id="city-pulse-category-select"
          className="city-pulse-select"
          value={activeCategory}
          onChange={(e) =>
            onCategoryChange((e.target as HTMLSelectElement).value)
          }
        >
          <option value="all">
            {t.cp_filter_category}: {t.cp_filter_all}
          </option>
          {categories
            .filter((c) => c.count > 0)
            .slice(0, 40)
            .map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
        </select>

        <select
          id="city-pulse-type-select"
          className="city-pulse-select"
          value={activeType}
          onChange={(e) => onTypeChange((e.target as HTMLSelectElement).value)}
        >
          <option value="all">
            {t.cp_filter_type}: {t.cp_filter_all}
          </option>
          {types
            .filter((ty) => ty.count > 0)
            .slice(0, 40)
            .map((ty) => (
              <option key={ty.id} value={String(ty.id)}>
                {ty.name}
              </option>
            ))}
        </select>
      </div>

      <div className="city-pulse-chips">
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
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {t.cp_free_chip}
        </button>
      </div>
    </header>
  );
}
