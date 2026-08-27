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
    <div id="gov-jobs-view" className="view-content active">
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
                stroke="var(--accent-color, #8b5cf6)"
                strokeWidth="1.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Doğrulanmış Resmi Kamu Portalları</h3>
            <p>
              Kamu işe alım ilanları (Kariyer Kapısı / CBİKO, Resmi Gazete, ilan.gov.tr, İŞKUR) e-Devlet kimlik doğrulama duvarı arkasında yer aldığından, sahte ve güncel olmayan haberlerin önüne geçmek amacıyla tüm başvurularınızı yukarıdaki doğrulanmış resmi devlet portallarından doğrudan gerçekleştirebilirsiniz.
            </p>
            <div className="gov-verified-actions">
              <a
                href="https://kariyerkapisi.gov.tr/isealim"
                target="_blank"
                rel="noopener noreferrer"
                className="gov-official-btn primary"
              >
                Kariyer Kapısı'nda İlanları Gör
              </a>
              <a
                href="https://www.turkiye.gov.tr/cumhurbaskanligi-kamu-ise-alim"
                target="_blank"
                rel="noopener noreferrer"
                className="gov-official-btn secondary"
              >
                e-Devlet Kamu İşe Alım
              </a>
            </div>
          </div>
        ) : (
          <div className="gov-jobs-grid">
            {filteredJobs.map((job) => (
              <GovJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default GovJobsView;
