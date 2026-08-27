/**
 * GovJobsFilterBar.tsx
 * Category tabs and status filters bar for Gov Jobs module.
 */

import type {
  GovJobCategory,
  GovJobStatusFilter,
} from "@/types/govJobs.js";

interface GovJobsFilterBarProps {
  category: GovJobCategory;
  statusFilter: GovJobStatusFilter;
  stats: {
    total: number;
    active: number;
    endingSoon: number;
    newToday: number;
  };
  onCategoryChange: (c: GovJobCategory) => void;
  onStatusChange: (s: GovJobStatusFilter) => void;
}

export function GovJobsFilterBar({
  category,
  statusFilter,
  stats,
  onCategoryChange,
  onStatusChange,
}: GovJobsFilterBarProps) {
  const categories: Array<{ id: GovJobCategory; label: string }> = [
    { id: "all", label: "Tüm İlanlar" },
    { id: "kpss", label: "KPSS / Memur" },
    { id: "sozlesmeli", label: "4/B Sözleşmeli" },
    { id: "surekli_isci", label: "Sürekli İşçi" },
    { id: "akademik", label: "Akademik & Ar-Ge" },
    { id: "askeri", label: "Askeri / Emniyet" },
  ];

  const statuses: Array<{
    id: GovJobStatusFilter;
    label: string;
    count: number;
  }> = [
    { id: "all", label: "Tümü", count: stats.total },
    { id: "active", label: "Aktif Başvurular", count: stats.active },
    {
      id: "ending_soon",
      label: "Son 3 Gün (Acil)",
      count: stats.endingSoon,
    },
    { id: "new_today", label: "Bugün Eklenenler", count: stats.newToday },
  ];

  return (
    <div className="gov-filters-container">
      {/* Category Horizontal Filter Tabs */}
      <div className="gov-cat-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`gov-cat-tab ${category === cat.id ? "active" : ""}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Status Secondary Filter Pills */}
      <div className="gov-status-pills">
        {statuses.map((st) => (
          <button
            key={st.id}
            type="button"
            className={`gov-status-pill ${statusFilter === st.id ? "active" : ""}`}
            onClick={() => onStatusChange(st.id)}
          >
            <span>{st.label}</span>
            <span className="pill-count">{st.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
