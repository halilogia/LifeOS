/**
 * CityPulseView.tsx
 * Şehir Etkinlikleri (Culture, Arts & City Events) Dashboard.
 * Layout Assembly Pattern: tuval (hook state) + parçalar (EventHubsBar, FilterBar, EventCard).
 */

import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { useCityPulse } from "@/presentation/hooks/useCityPulse.js";

import { EventHubsBar } from "@/components/citypulse/EventHubsBar.js";
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
    hubs,
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
        {/* Top Hubs Bar: Quick Portals to Culture & Ticketing Sites */}
        <EventHubsBar hubs={hubs} t={t} />

        {/* Tab & View Mode Selection */}
        <div className="city-pulse-tabs">
          <button
            className={`cp-tab-btn ${tab === "all" ? "active" : ""}`}
            onClick={() => setTab("all")}
          >
            {t.cp_tab_all || "Tüm Etkinlikler"}
            {filteredEvents.length > 0 && tab === "all" && (
              <span className="cp-tab-badge">{filteredEvents.length}</span>
            )}
          </button>
          <button
            className={`cp-tab-btn ${tab === "favorites" ? "active" : ""}`}
            onClick={() => setTab("favorites")}
          >
            {t.cp_tab_favorites || "Favorilerim"}
            {favorites.length > 0 && (
              <span className="cp-tab-badge">{favorites.length}</span>
            )}
          </button>
        </div>

        {/* Filters Bar: Search, Category Chips & Venue Select */}
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
          onRefresh={() => void loadData(true)}
          isLoading={loading}
        />

        {/* Loading Spinner State */}
        {loading && (
          <div id="city-pulse-loading" className="city-pulse-loading">
            <div className="spinner"></div>
            <p>{t.cp_loading || "Şehir etkinlikleri yükleniyor..."}</p>
          </div>
        )}

        {/* Error Retry State */}
        {error && (
          <div id="city-pulse-error" className="city-pulse-error">
            <p>{t.cp_error || "Etkinlikler yüklenirken bir hata oluştu."}</p>
            <button
              id="city-pulse-retry-btn"
              onClick={() => void loadData(true)}
            >
              {t.cp_retry || "Tekrar Dene"}
            </button>
          </div>
        )}

        {/* Visual Event Grid */}
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
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                  }}
                >
                  {tab === "favorites" ? (t.cp_empty_favorites || "Henüz favori etkinlik eklemediniz.") : (t.cp_empty || "Aradığınız kriterlere uygun etkinlik bulunamadı.")}
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
            <p>{t.cp_attribution || "Etkinlik verileri İBB Kültür Sanat Açık Veri servisi tarafından sağlanmaktadır."}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
