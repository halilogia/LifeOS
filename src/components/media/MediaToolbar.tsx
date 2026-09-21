import { useRef } from "preact/hooks";
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
  onAddClick: () => void;
  onLoadSamples: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
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
  onAddClick,
  onLoadSamples,
  onExport,
  onImport,
}: MediaToolbarProps) {
  const t = getTranslation(lang);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: { key: MediaTypeFilter; label: string }[] = [
    { key: "all", label: t.media_tab_all || "All" },
    { key: "movie", label: t.media_tab_movie || "Movies" },
    { key: "tv", label: t.media_tab_tv || "TV Series" },
    { key: "book", label: t.media_tab_book || "Books" },
    { key: "game", label: t.media_tab_game || "Games" },
  ];

  const statuses: { key: MediaStatusFilter; label: string }[] = [
    { key: "all", label: t.media_status_all || "All Statuses" },
    { key: "in_progress", label: t.media_status_in_progress || "In Progress" },
    { key: "completed", label: t.media_status_completed || "Completed" },
    { key: "backlog", label: t.media_status_backlog || "Backlog / Watchlist" },
    { key: "dropped", label: t.media_status_dropped || "Dropped" },
  ];

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      onImport(input.files[0]);
      input.value = "";
    }
  };

  return (
    <div className="media-toolbar-container">
      {/* Category Tabs & Action Buttons Row */}
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
              {cat.label}
            </button>
          ))}
        </div>

        <div className="media-toolbar-actions">
          <button
            type="button"
            className="media-btn-secondary"
            title={t.media_btn_sample_data || "Load Samples"}
            onClick={onLoadSamples}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>{t.media_btn_sample_data || "Load Samples"}</span>
          </button>

          <button
            type="button"
            className="media-btn-secondary"
            title={t.media_btn_export || "Export (JSON)"}
            onClick={onExport}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{t.media_btn_export || "Export"}</span>
          </button>

          <button
            type="button"
            className="media-btn-secondary"
            title={t.media_btn_import || "Import JSON"}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{t.media_btn_import || "Import"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className="media-btn-primary"
            onClick={onAddClick}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{t.media_btn_add || "Add Media"}</span>
          </button>
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
                "Search by title, creator, genre..."
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
              {t.media_sort_label || "Sort"}:
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
              <option value="updated">
                {t.media_sort_updated || "Recently Updated"}
              </option>
              <option value="rating_desc">
                {t.media_sort_rating_desc || "Highest Rated"}
              </option>
              <option value="rating_asc">
                {t.media_sort_rating_asc || "Lowest Rated"}
              </option>
              <option value="title">
                {t.media_sort_title || "Title (A-Z)"}
              </option>
              <option value="progress">
                {t.media_sort_progress || "Progress %"}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
