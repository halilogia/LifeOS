/**
 * GovJobsView.tsx
 * Main dashboard view for Gov Jobs & Career Gateway (Kamu İşe Alım & Kariyer Kapısı).
 * Follows Layout Assembly Pattern: hook-driven state & modular presentational components.
 */

import { useGovJobs } from "@/presentation/hooks/useGovJobs.js";
import { GovJobsHeader } from "@/components/govjobs/GovJobsHeader.js";
import { GovJobHubsBar } from "@/components/govjobs/GovJobHubsBar.js";
import { GovJobsFilterBar } from "@/components/govjobs/GovJobsFilterBar.js";
import { GovJobCard } from "@/components/govjobs/GovJobCard.js";

export function GovJobsView() {
  const {
    filteredJobs,
    hubs,
    category,
    statusFilter,
    searchQuery,
    isLoading,
    error,
    stats,
    setCategory,
    setStatusFilter,
    setSearchQuery,
    refreshJobs,
  } = useGovJobs();

  return (
    <div className="gov-jobs-view-container">
      {/* Header Bar */}
      <GovJobsHeader
        searchQuery={searchQuery}
        isLoading={isLoading}
        totalCount={filteredJobs.length}
        onSearchChange={setSearchQuery}
        onRefresh={refreshJobs}
      />

      {/* Official Government Portals Shortcuts Bar */}
      <GovJobHubsBar hubs={hubs} />

      {/* Category & Status Filter Bar */}
      <GovJobsFilterBar
        category={category}
        statusFilter={statusFilter}
        stats={stats}
        onCategoryChange={setCategory}
        onStatusChange={setStatusFilter}
      />

      {/* Error Banner */}
      {error && (
        <div className="gov-error-banner">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button type="button" onClick={() => refreshJobs()} className="gov-retry-btn">
            Yeniden Dene
          </button>
        </div>
      )}

      {/* Loading Skeleton or Cards Grid */}
      {isLoading && filteredJobs.length === 0 ? (
        <div className="gov-loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="gov-job-card-skeleton" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="gov-empty-state">
          <div className="gov-empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.5"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h3>Aradığınız Kriterlere Uygun Kamu İlanı Bulunamadı</h3>
          <p>
            Filtreleri temizleyebilir veya arama teriminizi değiştirerek tekrar arayabilirsiniz.
          </p>
          {(category !== "all" || statusFilter !== "all" || searchQuery) && (
            <button
              type="button"
              className="gov-reset-filters-btn"
              onClick={() => {
                setCategory("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>
      ) : (
        <div className="gov-jobs-grid">
          {filteredJobs.map((job) => (
            <GovJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
export default GovJobsView;
