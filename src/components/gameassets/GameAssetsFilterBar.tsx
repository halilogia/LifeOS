/**
 * GameAssetsFilterBar.tsx
 * Filter bar for game assets: category tabs, source selection, search input, and refresh button.
 */

import { AssetCategory, AssetSource } from "@/types/gameAssets.js";

interface GameAssetsFilterBarProps {
  category: AssetCategory;
  source: AssetSource;
  searchQuery: string;
  categoryCounts: Record<AssetCategory, number>;
  onCategoryChange: (cat: AssetCategory) => void;
  onSourceChange: (src: AssetSource) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
  t: Record<string, string>;
}

export function GameAssetsFilterBar({
  category,
  source,
  searchQuery,
  categoryCounts,
  onCategoryChange,
  onSourceChange,
  onSearchChange,
  onRefresh,
  loading,
  t,
}: GameAssetsFilterBarProps) {
  const categories: Array<{ id: AssetCategory; label: string }> = [
    { id: "all", label: t.game_assets_cat_all || "Tümü" },
    { id: "2d", label: t.game_assets_cat_2d || "2D Sprite & Art" },
    { id: "3d", label: t.game_assets_cat_3d || "3D Modeller" },
    { id: "audio", label: t.game_assets_cat_audio || "Ses & Müzik" },
    { id: "ui", label: t.game_assets_cat_ui || "UI & İkonlar" },
    { id: "textures", label: t.game_assets_cat_textures || "Kaplama & Doku" },
    { id: "loot", label: t.game_assets_cat_loot || "DLC & Paketler" },
  ];

  return (
    <div className="game-assets-filter-section">
      <div className="game-assets-header-row">
        <div>
          <h2 className="game-assets-title">
            {t.game_assets_title || "Ücretsiz Oyun Assetleri"}
          </h2>
          <p className="game-assets-subtitle">
            {t.game_assets_subtitle ||
              "Oyun projeleriniz için 2D, 3D, ses, UI ve CC0 kamu malı varlıklar"}
          </p>
        </div>

        <div className="game-assets-top-actions">
          <div className="game-assets-search-wrap">
            <svg
              className="search-icon"
              width="16"
              height="16"
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
              className="game-assets-search-input"
              placeholder={
                t.game_assets_search_placeholder || "Asset veya etiket ara..."
              }
              value={searchQuery}
              onInput={(e) =>
                onSearchChange((e.target as HTMLInputElement).value)
              }
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange("")}
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className={`game-assets-refresh-btn ${loading ? "spinning" : ""}`}
            onClick={onRefresh}
            disabled={loading}
            title={t.refresh || "Yenile"}
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
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="game-assets-category-tabs">
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              type="button"
              className={`asset-cat-btn ${category === cat.id ? "active" : ""}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="cat-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Source selector filter */}
      <div className="game-assets-source-bar">
        <span className="source-label-text">
          {t.filter_sources || "Kaynaklar"}:
        </span>
        <div className="source-chips">
          {(
            [
              { id: "all", label: t.platform_all || "Tümü" },
              { id: "itch", label: "Itch.io" },
              { id: "kenney", label: "Kenney CC0" },
              { id: "opengameart", label: "OpenGameArt" },
              { id: "gamerpower", label: "GamerPower" },
            ] as const
          ).map((src) => (
            <button
              key={src.id}
              type="button"
              className={`source-chip ${source === src.id ? "active" : ""}`}
              onClick={() => onSourceChange(src.id)}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
