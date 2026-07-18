import { Language, HifizProgress, HifizItem } from "@/types/types.js";

interface HifizMemorizationCardProps {
  lang: Language;
  category: "surahs" | "duas";
  hifizProgress: HifizProgress[];
  t: any;
  memorizedCount: number;
  inProgressCount: number;
  totalCount: number;
  filteredItems: HifizItem[];
  onSetCategory: (cat: "surahs" | "duas") => void;
  onOpenMushaf: (item: HifizItem) => void;
  onCycleStatus: (itemId: string) => void;
  onCyclePageStatus: (itemId: string, pageIdx: number) => void;
}

export function HifizMemorizationCard({
  lang,
  category,
  hifizProgress,
  t,
  memorizedCount,
  inProgressCount,
  totalCount,
  filteredItems,
  onSetCategory,
  onOpenMushaf,
  onCycleStatus,
  onCyclePageStatus,
}: HifizMemorizationCardProps) {
  return (
    <div id="memorization-content" className="hifiz-sub-view active">
      {/* Stats row */}
      <div className="hifiz-stats-row">
        <div className="hifiz-stat-card">
          <div className="stat-icon memorized">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">{t.hifiz_stat_memorized}</span>
            <span id="hifiz-stat-memorized-count" className="stat-value">
              {memorizedCount}
            </span>
          </div>
        </div>

        <div className="hifiz-stat-card">
          <div className="stat-icon progress">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">{t.hifiz_stat_in_progress}</span>
            <span id="hifiz-stat-progress-count" className="stat-value">
              {inProgressCount}
            </span>
          </div>
        </div>

        <div className="hifiz-stat-card">
          <div className="stat-icon total">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">{t.hifiz_stat_total}</span>
            <span id="hifiz-stat-total-count" className="stat-value">
              {totalCount}
            </span>
          </div>
        </div>
      </div>

      <div className="hifiz-filters">
        <button
          className={`hifiz-filter-btn ${category === "surahs" ? "active" : ""}`}
          onClick={() => onSetCategory("surahs")}
        >
          {t.hifiz_cat_surahs}
        </button>
        <button
          className={`hifiz-filter-btn ${category === "duas" ? "active" : ""}`}
          onClick={() => onSetCategory("duas")}
        >
          {t.hifiz_cat_duas}
        </button>
      </div>

      {/* Grid display */}
      <div id="hifiz-grid" className="hifiz-grid">
        {filteredItems.map((item) => {
          const itemProgress = hifizProgress.find(
            (p) => p.itemId === item.id,
          ) || {
            itemId: item.id,
            status: "not_started" as const,
            lastUpdated: new Date().toISOString(),
          };

          const totalPagesCount = item.totalPages || 1;
          const pageStatuses =
            itemProgress.pageStatuses ||
            new Array(totalPagesCount).fill("not_started");
          const memorizedPagesCount = pageStatuses.filter(
            (s) => s === "memorized",
          ).length;
          const pagePercent = Math.round(
            (memorizedPagesCount / totalPagesCount) * 100,
          );

          const statusText =
            t[`hifiz_status_${itemProgress.status}` as keyof typeof t] ||
            itemProgress.status;
          const catLabel =
            t[`hifiz_cat_${item.category}` as keyof typeof t] ||
            item.category;

          return (
            <div
              key={item.id}
              className="hifiz-card"
              onClick={() => {
                if (item.pages && item.pages.length > 0) {
                  onOpenMushaf(item);
                } else if (item.url) {
                  window.open(item.url, "_blank");
                } else {
                  onCycleStatus(item.id);
                }
              }}
            >
              <div className="hifiz-card-top">
                <span className="hifiz-cat-badge">{catLabel}</span>
                <div
                  className={`hifiz-status-badge status-${itemProgress.status}`}
                  title="Status"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCycleStatus(item.id);
                  }}
                ></div>
              </div>

              <div className="hifiz-card-body">
                <h3>{item.title}</h3>
                {item.description && (
                  <p className="hifiz-desc">{item.description}</p>
                )}

                {totalPagesCount > 1 && (
                  <div className="hifiz-pages-container">
                    <div className="hifiz-progress-track">
                      <div
                        className="hifiz-progress-fill"
                        style={{ width: `${pagePercent}%` }}
                      ></div>
                    </div>
                    <div className="hifiz-pages-grid">
                      {pageStatuses.map((status, idx) => (
                        <div
                          key={idx}
                          className={`hifiz-page-box status-${status}`}
                          title={`Sayfa ${idx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCyclePageStatus(item.id, idx);
                          }}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                    <div className="hifiz-progress-text">
                      {memorizedPagesCount}/{totalPagesCount}{" "}
                      {t.hifiz_progress_pages}
                    </div>
                  </div>
                )}
              </div>

              <div className="hifiz-card-footer">
                <span className="status-text">{statusText}</span>
                <div className="hifiz-actions">
                  {item.pages && item.pages.length > 0 ? (
                    <button
                      className="hifiz-action-btn open-mushaf"
                      title="Open Mushaf"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMushaf(item);
                      }}
                    >
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
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </button>
                  ) : (
                    item.url && (
                      <button
                        className="hifiz-action-btn open-url"
                        title="Diyanet Link"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, "_blank");
                        }}
                      >
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
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </button>
                    )
                  )}
                  <button
                    className="hifiz-action-btn cycle-status"
                    title="Change status"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCycleStatus(item.id);
                    }}
                  >
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
                      <path d="M23 4v6h-6"></path>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
