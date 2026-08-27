/**
 * GovJobsHeader.tsx
 * Top header banner with title, search input, and refresh button for Gov Jobs module.
 */

interface GovJobsHeaderProps {
  searchQuery: string;
  isLoading: boolean;
  totalCount: number;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
}

export function GovJobsHeader({
  searchQuery,
  isLoading,
  totalCount,
  onSearchChange,
  onRefresh,
}: GovJobsHeaderProps) {
  return (
    <div className="gov-jobs-header">
      <div className="gov-header-left">
        <div className="gov-header-title-row">
          <div className="gov-header-icon-box">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <h1 className="gov-title">Kamu İşe Alım & Kariyer Kapısı</h1>
            <p className="gov-subtitle">
              Kariyer Kapısı (CBİKO), ilan.gov.tr, Resmi Gazete ve İŞKUR resmi kamu personel alımları
            </p>
          </div>
        </div>
      </div>

      <div className="gov-header-right">
        {/* Search input */}
        <div className="gov-search-box">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="gov-search-input"
            placeholder="Kurum veya unvan ara (örn: Sağlık, Mühendis)..."
            value={searchQuery}
            onInput={(e) =>
              onSearchChange((e.target as HTMLInputElement).value)
            }
          />
          {searchQuery && (
            <button
              type="button"
              className="gov-search-clear-btn"
              onClick={() => onSearchChange("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Live Count & Refresh */}
        <div className="gov-header-controls">
          <div className="gov-count-badge">
            <span>{totalCount} İlan</span>
          </div>

          <button
            type="button"
            className={`gov-refresh-btn ${isLoading ? "spinning" : ""}`}
            onClick={onRefresh}
            title="İlanları Yenile"
            disabled={isLoading}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
