import type { Language } from "@/types/types.js";
import type {
  MediaTypeFilter,
  MediaStatusFilter,
  MediaSortBy,
} from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";

interface MediaToolbarProps {
  lang: Language;
  activeTypeFilter: MediaTypeFilter;
  activeStatusFilter: MediaStatusFilter;
  searchQuery: string;
  sortBy: MediaSortBy;
  onTypeChange: (type: MediaTypeFilter) => void;
  onStatusChange: (status: MediaStatusFilter) => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: MediaSortBy) => void;
}

export function MediaToolbar({
  lang,
  activeTypeFilter,
  activeStatusFilter,
  searchQuery,
  sortBy,
  onTypeChange,
  onStatusChange,
  onSearchChange,
  onSortChange,
}: MediaToolbarProps) {
  const t = getTranslation(lang);

  const categories: { key: MediaTypeFilter; label: string; icon: string }[] = [
    { key: "all", label: t.media_tab_all || "Tümü", icon: "🌟" },
    { key: "series", label: t.media_tab_series || "Film Serileri", icon: "🎬" },
    { key: "movie", label: t.media_tab_movie || "Kült Filmler", icon: "🍿" },
    { key: "book", label: t.media_tab_book || "Kitaplar", icon: "📚" },
    { key: "game", label: t.media_tab_game || "Oyunlar", icon: "🎮" },
  ];

  const statuses: { key: MediaStatusFilter; label: string }[] = [
    { key: "all", label: t.media_status_all || "Tümü" },
    { key: "completed", label: "✓ " + (t.media_status_completed || "Tamamlananlar") },
    { key: "in_progress", label: "⏳ " + (t.media_status_in_progress || "Devam Edenler") },
    { key: "backlog", label: "➕ " + (t.media_status_backlog || "İstek Listem") },
  ];

  return (
    <div className="media-toolbar-container">
      {/* Category Tabs */}
      <div className="media-toolbar-top-row">
        <div className="media-category-tabs" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.key}
              role="tab"
              aria-selected={activeTypeFilter === cat.key}
              className={`media-category-tab ${activeTypeFilter === cat.key ? "active" : ""}`}
              onClick={() => onTypeChange(cat.key)}
            >
              <span className="tab-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Chips, Search, & Sort Bar */}
      <div className="media-filter-bar">
        {/* Status Chips */}
        <div className="media-status-chips">
          {statuses.map((st) => (
            <button
              key={st.key}
              type="button"
              className={`media-status-chip ${activeStatusFilter === st.key ? "active" : ""}`}
              onClick={() => onStatusChange(st.key)}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="media-search-sort-group">
          <div className="media-search-input-wrapper">
            <svg
              className="media-search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="media-search-input"
              value={searchQuery}
              placeholder={
                t.media_search_placeholder ||
                "Başlık, yazar, stüdyo veya tür ara..."
              }
              onInput={(e) =>
                onSearchChange((e.target as HTMLInputElement).value)
              }
            />
            {searchQuery && (
              <button
                type="button"
                className="media-search-clear"
                onClick={() => onSearchChange("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="media-sort-wrapper">
            <label htmlFor="media-sort-select" className="media-sort-label">
              {t.media_sort_label || "Sırala"}:
            </label>
            <select
              id="media-sort-select"
              className="media-sort-select"
              value={sortBy}
              onChange={(e) =>
                onSortChange(
                  (e.target as HTMLSelectElement).value as MediaSortBy,
                )
              }
            >
              <option value="rating_desc">
                {t.media_sort_rating_desc || "En Yüksek Puan"}
              </option>
              <option value="title">
                {t.media_sort_title || "İsim (A-Z)"}
              </option>
              <option value="updated">
                {t.media_sort_updated || "Son Güncellenen"}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
