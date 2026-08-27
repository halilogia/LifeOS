/**
 * GameAssetsView.tsx
 * Free Game Assets view: 2D/3D sprites, audio, UI packs, textures, and CC0 assets.
 * Implements Layout Assembly Pattern with extracted subcomponents.
 */

import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { useGameAssets } from "@/presentation/hooks/useGameAssets.js";
import { AssetHubsBar } from "@/components/gameassets/AssetHubsBar.js";
import { GameAssetsFilterBar } from "@/components/gameassets/GameAssetsFilterBar.js";
import { GameAssetCard } from "@/components/gameassets/GameAssetCard.js";

interface GameAssetsViewProps {
  lang: Language;
}

export function GameAssetsView({ lang }: GameAssetsViewProps) {
  const t = translations[lang];
  const {
    filteredAssets,
    category,
    setCategory,
    source,
    setSource,
    searchQuery,
    setSearchQuery,
    claimedIds,
    handleClaimToggle,
    loading,
    error,
    loadAssets,
    assetHubs,
    categoryCounts,
  } = useGameAssets({ lang });

  return (
    <div id="game-assets-view" className="view-content active">
      <div className="game-assets-container">
        {/* Curated Hubs Shortcuts */}
        <AssetHubsBar
          hubs={assetHubs}
          titleLabel={t.game_assets_hubs_title || "⚡ Popüler Ücretsiz Varlık Merkezleri (Quick Hubs)"}
        />

        {/* Filter and Search Bar */}
        <GameAssetsFilterBar
          category={category}
          source={source}
          searchQuery={searchQuery}
          categoryCounts={categoryCounts}
          onCategoryChange={setCategory}
          onSourceChange={setSource}
          onSearchChange={setSearchQuery}
          onRefresh={() => void loadAssets(true)}
          loading={loading}
          t={t}
        />

        {/* Loading State */}
        {loading && (
          <div className="free-games-loading">
            <div className="spinner"></div>
            <p>{t.game_assets_loading || "Ücretsiz assetler taranıyor..."}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="free-games-error">
            <p>{t.game_assets_error || "Assetler yüklenirken bir sorun oluştu."}</p>
            <button
              type="button"
              id="game-assets-retry-btn"
              onClick={() => void loadAssets(true)}
            >
              {t.retry || "Tekrar Dene"}
            </button>
          </div>
        )}

        {/* Assets Grid */}
        {!loading && !error && (
          <div className="free-games-grid game-assets-grid">
            {filteredAssets.length === 0 ? (
              <div className="free-games-empty">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: "var(--text-secondary)",
                    opacity: 0.5,
                    marginBottom: "12px",
                  }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  {t.game_assets_no_match || "Arama kriterlerine uygun asset bulunamadı."}
                </p>
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <GameAssetCard
                  key={asset.id}
                  asset={asset}
                  lang={lang}
                  claimed={claimedIds.includes(asset.id)}
                  onClaimToggle={handleClaimToggle}
                  getAssetLabel={t.game_assets_get_btn || "Varlığa Git"}
                  claimedLabel={t.game_assets_saved || "Kaydedildi"}
                  freeLabel={t.worth_free || "Ücretsiz"}
                />
              ))
            )}
          </div>
        )}

        {/* Footer Attribution */}
        <footer className="gamerpower-attribution game-assets-attribution">
          <p>
            Asset feeds provided by{" "}
            <a href="https://itch.io" target="_blank" rel="noopener noreferrer">
              Itch.io
            </a>
            ,{" "}
            <a href="https://kenney.nl" target="_blank" rel="noopener noreferrer">
              Kenney.nl (CC0)
            </a>
            ,{" "}
            <a href="https://opengameart.org" target="_blank" rel="noopener noreferrer">
              OpenGameArt.org
            </a>{" "}
            &{" "}
            <a href="https://www.gamerpower.com" target="_blank" rel="noopener noreferrer">
              GamerPower
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
