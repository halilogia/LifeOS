import { GameCategory } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";

interface ArcadeHeaderProps {
  lang: Language;
  activeCategory: GameCategory;
  searchQuery: string;
  onCategoryChange: (cat: GameCategory) => void;
  onSearchChange: (q: string) => void;
  onScanFolder: () => void;
}

export function ArcadeHeader({
  lang,
  activeCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onScanFolder,
}: ArcadeHeaderProps) {
  const t = translations[lang];
  const tr = t as Record<string, string>;

  const categories: { key: GameCategory; label: string }[] = [
    { key: "all", label: tr.arcade_cat_all },
    { key: "playable", label: tr.arcade_cat_playable },
    { key: "in_progress", label: tr.arcade_cat_in_progress },
    { key: "favorites", label: tr.arcade_cat_favorites },
  ];

  return (
    <div className="arcade-header-container">
      <div className="arcade-title-section">
        <div className="arcade-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="4" />
            <path d="M6 12h4m-2-2v4m9-2h.01m3-2h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{tr.arcade_badge_title}</span>
        </div>
        <h2>{tr.arcade_main_title}</h2>
        <p className="arcade-subtitle">
          {tr.arcade_subtitle}
        </p>
      </div>

      <div className="arcade-controls-row">
        <div className="arcade-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder={tr.arcade_search_placeholder}
            value={searchQuery}
            onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
          />
        </div>

        <div className="arcade-category-chips">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`arcade-chip ${activeCategory === cat.key ? "active" : ""}`}
              onClick={() => onCategoryChange(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button className="arcade-add-btn" onClick={onScanFolder}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>{tr.arcade_scan_folder_btn}</span>
        </button>
      </div>
    </div>
  );
}
