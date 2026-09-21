import type { Language } from "@/types/types.js";
import type { MediaStats } from "@/types/media.js";
import { getTranslation } from "@/utils/i18n.js";

interface MediaStatsOverviewProps {
  stats: MediaStats;
  lang: Language;
}

export function MediaStatsOverview({ stats, lang }: MediaStatsOverviewProps) {
  const t = getTranslation(lang);

  return (
    <div className="media-stats-grid">
      {/* Total Items */}
      <div className="media-stat-card">
        <div className="media-stat-icon-wrapper media-stat-total">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        <div className="media-stat-info">
          <span className="media-stat-label">
            {t.media_stat_total_items || "Total Items"}
          </span>
          <span className="media-stat-value">{stats.totalItems}</span>
        </div>
      </div>

      {/* Movies Watched */}
      <div className="media-stat-card">
        <div className="media-stat-icon-wrapper media-stat-movie">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
        </div>
        <div className="media-stat-info">
          <span className="media-stat-label">
            {t.media_stat_movies_watched || "Movies Watched"}
          </span>
          <span className="media-stat-value">{stats.totalMoviesWatched}</span>
        </div>
      </div>

      {/* TV Episodes */}
      <div className="media-stat-card">
        <div className="media-stat-icon-wrapper media-stat-tv">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
        </div>
        <div className="media-stat-info">
          <span className="media-stat-label">
            {t.media_stat_episodes_watched || "Episodes Watched"}
          </span>
          <span className="media-stat-value">
            {stats.totalTvEpisodesWatched}
            <span className="media-stat-sub">
              ({stats.totalTvSeriesCompleted}{" "}
              {t.media_stat_series_completed || "completed"})
            </span>
          </span>
        </div>
      </div>

      {/* Books & Pages */}
      <div className="media-stat-card">
        <div className="media-stat-icon-wrapper media-stat-book">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div className="media-stat-info">
          <span className="media-stat-label">
            {t.media_stat_pages_read || "Pages Read"}
          </span>
          <span className="media-stat-value">
            {stats.totalBookPagesRead}
            <span className="media-stat-sub">
              ({stats.totalBooksCompleted}{" "}
              {t.media_stat_books_completed || "completed"})
            </span>
          </span>
        </div>
      </div>

      {/* Gaming Playtime */}
      <div className="media-stat-card">
        <div className="media-stat-icon-wrapper media-stat-game">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h4m-2-2v4" />
            <circle cx="17" cy="10" r="1" />
            <circle cx="15" cy="14" r="1" />
          </svg>
        </div>
        <div className="media-stat-info">
          <span className="media-stat-label">
            {t.media_stat_hours_played || "Playtime"}
          </span>
          <span className="media-stat-value">
            {stats.totalGameHoursPlayed}h
            <span className="media-stat-sub">
              ({stats.totalGamesCompleted}{" "}
              {t.media_stat_games_completed || "completed"})
            </span>
          </span>
        </div>
      </div>

      {/* Average Score */}
      <div className="media-stat-card">
        <div className="media-stat-icon-wrapper media-stat-score">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className="media-stat-info">
          <span className="media-stat-label">
            {t.media_stat_avg_rating || "Average Score"}
          </span>
          <span className="media-stat-value">
            {stats.averageRating > 0 ? `${stats.averageRating} / 10` : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
