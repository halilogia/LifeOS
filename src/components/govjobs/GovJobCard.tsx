/**
 * GovJobCard.tsx
 * Presentational glassmorphic card component for a single government job announcement.
 */

import { useState } from "preact/hooks";
import type { GovJobItem } from "@/types/govJobs.js";

interface GovJobCardProps {
  job: GovJobItem;
}

export function GovJobCard({ job }: GovJobCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(job.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDaysLeftClass = () => {
    if (job.isExpired) return "status-expired";
    if (job.daysLeft <= 3) return "status-urgent";
    if (job.daysLeft <= 7) return "status-warning";
    return "status-normal";
  };

  const getCategoryBadgeLabel = () => {
    switch (job.category) {
      case "kpss":
        return "KPSS & Memur";
      case "sozlesmeli":
        return "4/B Sözleşmeli";
      case "surekli_isci":
        return "Sürekli İşçi";
      case "akademik":
        return "Akademik & Ar-Ge";
      case "askeri":
        return "Askeri / Güvenlik";
      case "memur":
        return "Memur";
      default:
        return "Kamu İlanı";
    }
  };

  return (
    <div className={`gov-job-card ${getDaysLeftClass()}`}>
      <div className="gov-card-header">
        <div className="gov-inst-badge-wrap">
          <span className="gov-inst-badge">{job.institution}</span>
          <span className={`gov-cat-badge cat-${job.category}`}>
            {getCategoryBadgeLabel()}
          </span>
        </div>

        <div className={`gov-days-badge ${getDaysLeftClass()}`}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            {job.isExpired
              ? "Başvuru Kapandı"
              : job.daysLeft === 0
                ? "Son Gün!"
                : `${job.daysLeft} Gün Kaldı`}
          </span>
        </div>
      </div>

      <h3 className="gov-job-title">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          title={job.title}
        >
          {job.title}
        </a>
      </h3>

      {job.summary && <p className="gov-job-summary">{job.summary}</p>}

      <div className="gov-job-meta-grid">
        {job.city && (
          <div className="gov-meta-item">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{job.city}</span>
          </div>
        )}

        {job.kpssScoreType && (
          <div className="gov-meta-item">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="gov-kpss-highlight">{job.kpssScoreType}</span>
          </div>
        )}

        {job.positionCount && (
          <div className="gov-meta-item">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{job.positionCount.toLocaleString()} Kontenjan</span>
          </div>
        )}

        <div className="gov-meta-item">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Son Tarih: {job.deadline}</span>
        </div>
      </div>

      <div className="gov-card-actions">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="gov-apply-btn"
        >
          <span>İlana Git / Başvur</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        <button
          type="button"
          onClick={handleCopyLink}
          className="gov-icon-action-btn"
          title={copied ? "Bağlantı Kopyalandı!" : "İlan Bağlantısını Kopyala"}
        >
          {copied ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
