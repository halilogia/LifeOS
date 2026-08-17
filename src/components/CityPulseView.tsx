/**
 * CityPulseView.tsx
 * Şehir Etkinlikleri (İstanbul free & cultural events) Dashboard.
 * Layout Assembly Pattern: tuval (hook state) + parçalar (filter bar, event cards).
 */

import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { useCityPulse } from "@/presentation/hooks/useCityPulse.js";

import { CityPulseFilterBar } from "@/components/citypulse/CityPulseFilterBar.js";
import { CityEventCard } from "@/components/citypulse/CityEventCard.js";

interface CityPulseViewProps {
  lang: Language;
}

export function CityPulseView({ lang }: CityPulseViewProps) {
  const t = translations[lang];
  const {
    tab,
    setTab,
    categories,
    types,
    favorites,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeType,
    setActiveType,
    freeOnly,
    setFreeOnly,
    loading,
    error,
    filteredEvents,
    loadData,
    toggleFavorite,
    categoryName,
    typeName,
    formatEventDate,
  } = useCityPulse({ lang });

  return (
    <div id="city-pulse-view" className="view-content active">
      <div className="city-pulse-container">
        <div className="city-pulse-tabs">
          <button
            className={`cp-tab-btn ${tab === "all" ? "active" : ""}`}
            onClick={() => setTab("all")}
          >
            {t.cp_tab_all}
          </button>
          <button
            className={`cp-tab-btn ${tab === "favorites" ? "active" : ""}`}
            onClick={() => setTab("favorites")}
          >
            {t.cp_tab_favorites}
            {favorites.length > 0 && (
              <span className="cp-tab-badge">{favorites.length}</span>
            )}
          </button>
        </div>

        <CityPulseFilterBar
          t={t}
          categories={categories}
          types={types}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          activeType={activeType}
          freeOnly={freeOnly}
          onSearchChange={setSearchQuery}
          onCategoryChange={setActiveCategory}
          onTypeChange={setActiveType}
          onFreeOnlyChange={setFreeOnly}
        />

        {loading && (
          <div id="city-pulse-loading" className="city-pulse-loading">
            <div className="spinner"></div>
            <p>{t.cp_loading}</p>
          </div>
        )}

        {error && (
          <div id="city-pulse-error" className="city-pulse-error">
            <p>{t.cp_error}</p>
            <button
              id="city-pulse-retry-btn"
              onClick={() => void loadData(true)}
            >
              {t.cp_retry}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div id="city-pulse-grid" className="city-pulse-grid">
            {filteredEvents.length === 0 ? (
              <div className="city-pulse-empty">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style={{
                    color: "var(--text-secondary)",
                    opacity: 0.5,
                    marginBottom: "12px",
                  }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                  }}
                >
                  {tab === "favorites" ? t.cp_empty_favorites : t.cp_empty}
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <CityEventCard
                  key={event.id}
                  event={event}
                  t={t}
                  isFavorite={favorites.includes(event.id)}
                  onToggleFavorite={() => void toggleFavorite(event.id)}
                  categoryName={categoryName}
                  typeName={typeName}
                  formatEventDate={formatEventDate}
                />
              ))
            )}
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <footer className="city-pulse-attribution">
            <p>{t.cp_attribution}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
