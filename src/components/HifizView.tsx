import { YETERLIKLER_DATA } from "@/domain/data/hifizData.js";

import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { useHifiz } from "@/presentation/hooks/useHifiz.js";
import { HifizMemorizationCard } from "@/components/hifiz/HifizMemorizationCard.js";
import { HifizYeterliklerCard } from "@/components/hifiz/HifizYeterliklerCard.js";
import { HifizMushafModal } from "@/components/hifiz/HifizMushafModal.js";
import { HifizYeterlikModal } from "@/components/hifiz/HifizYeterlikModal.js";

interface HifizViewProps {
  lang: Language;
}

export function HifizView({ lang }: HifizViewProps) {
  const t = translations[lang];
  const {
    subView,
    setSubView,
    category,
    setCategory,
    search,
    setSearch,
    hifizProgress,
    yeterlikler,
    activeMushafItem,
    currentPageIndex,
    setCurrentPageIndex,
    activeYeterlik,
    setActiveYeterlik,
    memorizedCount,
    inProgressCount,
    totalCount,
    overallPercent,
    yeterliklerPercent,
    filteredItems,
    handleCycleStatus,
    handleCyclePageStatus,
    handleToggleYeterlik,
    openMushaf,
    closeMushaf,
  } = useHifiz();

  return (
    <div id="hifiz-view" className="view-content active">
      <div className="hifiz-container">
        <div className="hifiz-tabs">
          <button
            className={`hifiz-tab-btn ${subView === "memorizations" ? "active" : ""}`}
            onClick={() => setSubView("memorizations")}
          >
            {t.hifiz_btn_memorizations}
          </button>
          <button
            className={`hifiz-tab-btn ${subView === "yeterlikler" ? "active" : ""}`}
            onClick={() => setSubView("yeterlikler")}
          >
            {t.hifiz_btn_yeterlikler}
          </button>
        </div>

        {/* VIEW 1: MEMORIZATIONS */}
        {subView === "memorizations" && (
          <div id="hifiz-main-content" className="hifiz-sub-view active">
            <div className="hifiz-header">
              <h2>{t.hifiz_title}</h2>
              <div className="hifiz-search-box">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  id="hifiz-search"
                  value={search}
                  onInput={(e) =>
                    setSearch((e.target as HTMLInputElement).value)
                  }
                  placeholder={t.hifiz_search_placeholder}
                />
              </div>
            </div>

            <div className="hifiz-overall-progress-container">
              <div className="hifiz-overall-info">
                <span>{t.hifiz_overall_basic_progress}</span>
                <span id="hifiz-overall-percent">{overallPercent}%</span>
              </div>
              <div className="hifiz-overall-bar">
                <div
                  id="hifiz-overall-fill"
                  className="hifiz-overall-fill"
                  style={{ width: `${overallPercent}%` }}
                ></div>
              </div>
            </div>

            <HifizMemorizationCard
              category={category}
              hifizProgress={hifizProgress}
              t={t}
              memorizedCount={memorizedCount}
              inProgressCount={inProgressCount}
              totalCount={totalCount}
              filteredItems={filteredItems}
              onSetCategory={setCategory}
              onOpenMushaf={openMushaf}
              onCycleStatus={handleCycleStatus}
              onCyclePageStatus={handleCyclePageStatus}
            />
          </div>
        )}

        {/* VIEW 2: IMAM-HATIP YETERLIKLER CHECKLIST */}
        {subView === "yeterlikler" && (
          <HifizYeterliklerCard
            lang={lang}
            yeterliklerPercent={yeterliklerPercent}
            yeterlikler={yeterlikler}
            YETERLIKLER_DATA={YETERLIKLER_DATA}
            onToggleYeterlik={handleToggleYeterlik}
            onOpenYeterlikDetail={(item) =>
              setActiveYeterlik({
                title: item.title,
                description: item.description,
              })
            }
          />
        )}
      </div>

      {/* Mushaf Viewer Modal */}
      {activeMushafItem &&
        activeMushafItem.pages &&
        activeMushafItem.pages.length > 0 && (
          <HifizMushafModal
            activeMushafItem={activeMushafItem}
            currentPageIndex={currentPageIndex}
            onCloseMushaf={closeMushaf}
            onPrevPage={() =>
              setCurrentPageIndex((prev) => Math.max(0, prev - 1))
            }
            onNextPage={() =>
              setCurrentPageIndex((prev) =>
                Math.min(activeMushafItem.pages!.length - 1, prev + 1),
              )
            }
          />
        )}

      {/* Yeterlik Info Detail Modal */}
      {activeYeterlik && (
        <HifizYeterlikModal
          lang={lang}
          activeYeterlik={activeYeterlik}
          onClose={() => setActiveYeterlik(null)}
        />
      )}
    </div>
  );
}
