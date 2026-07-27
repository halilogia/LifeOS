import { useState, useEffect } from "preact/hooks";
import {
  INITIAL_HIFIZ_ITEMS,
  YETERLIKLER_DATA,
} from "@/domain/data/hifizData.js";

import { HifizProgress, HifizItem, Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { HifizMemorizationCard } from "@/components/hifiz/HifizMemorizationCard.js";
import { HifizYeterliklerCard } from "@/components/hifiz/HifizYeterliklerCard.js";
import { HifizMushafModal } from "@/components/hifiz/HifizMushafModal.js";
import { HifizYeterlikModal } from "@/components/hifiz/HifizYeterlikModal.js";

interface HifizViewProps {
  lang: Language;
}

export function HifizView({ lang }: HifizViewProps) {
  const t = translations[lang];

  // Tab views
  const [subView, setSubView] = useState<"memorizations" | "yeterlikler">(
    "memorizations",
  );
  const [category, setCategory] = useState<"surahs" | "duas">("surahs");
  const [search, setSearch] = useState("");

  // Storage states
  const [hifizProgress, setHifizProgress] = useState<HifizProgress[]>([]);
  const [yeterlikler, setYeterlikler] = useState<number[]>([]);

  // Mushaf Viewer Modal
  const [activeMushafItem, setActiveMushafItem] = useState<HifizItem | null>(
    null,
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Yeterlik Info Modal
  const [activeYeterlik, setActiveYeterlik] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const progress: HifizProgress[] = await new Promise((r) =>
      chrome.storage.sync.get(["hifizProgress"], (res) =>
        r((res.hifizProgress as HifizProgress[]) || []),
      ),
    );
    const completedYeterlikler: number[] = await new Promise((r) =>
      chrome.storage.sync.get(["yeterlikler"], (res) =>
        r((res.yeterlikler as number[]) || []),
      ),
    );
    setHifizProgress(progress);
    setYeterlikler(completedYeterlikler);
  };

  // Hifiz stats calculations
  const memorizedCount = hifizProgress.filter(
    (p) => p.status === "memorized",
  ).length;
  const inProgressCount = hifizProgress.filter(
    (p) => p.status === "in_progress",
  ).length;
  const totalCount = INITIAL_HIFIZ_ITEMS.length;

  let totalPages = 0;
  let memorizedPages = 0;

  INITIAL_HIFIZ_ITEMS.forEach((item) => {
    const total = item.totalPages || 1;
    totalPages += total;

    const itemProgress = hifizProgress.find((p) => p.itemId === item.id);
    if (itemProgress) {
      if (itemProgress.status === "memorized") {
        memorizedPages += total;
      } else if (itemProgress.pageStatuses) {
        memorizedPages += itemProgress.pageStatuses.filter(
          (s) => s === "memorized",
        ).length;
      }
    }
  });

  const overallPercent =
    totalPages > 0 ? Math.round((memorizedPages / totalPages) * 100) : 0;

  // Checklist stats calculations
  const completedYeterliklerCount = yeterlikler.length;
  const totalYeterliklerCount = YETERLIKLER_DATA.length;
  const yeterliklerPercent =
    totalYeterliklerCount > 0
      ? Math.round((completedYeterliklerCount / totalYeterliklerCount) * 100)
      : 0;

  // Cycle item status (not_started -> in_progress -> memorized)
  const handleCycleStatus = async (itemId: string) => {
    const itemData = INITIAL_HIFIZ_ITEMS.find((i) => i.id === itemId);
    const progress: HifizProgress[] = await new Promise((r) =>
      chrome.storage.sync.get(["hifizProgress"], (res) =>
        r((res.hifizProgress as HifizProgress[]) || []),
      ),
    );
    const idx = progress.findIndex((p) => p.itemId === itemId);
    const statuses: HifizProgress["status"][] = [
      "not_started",
      "in_progress",
      "memorized",
    ];

    if (idx === -1) {
      const newItem: HifizProgress = {
        itemId,
        status: "in_progress",
        lastUpdated: new Date().toISOString(),
      };
      if (itemData?.totalPages && itemData.totalPages > 1) {
        newItem.pageStatuses = new Array(itemData.totalPages).fill(
          "not_started",
        );
      }
      progress.push(newItem);
    } else {
      const current = progress[idx].status;
      const nextIndex = (statuses.indexOf(current) + 1) % statuses.length;
      const nextStatus = statuses[nextIndex];
      progress[idx].status = nextStatus;
      progress[idx].lastUpdated = new Date().toISOString();

      if (progress[idx].pageStatuses) {
        progress[idx].pageStatuses = progress[idx].pageStatuses?.map(
          () => nextStatus,
        );
      }
    }

    await new Promise<void>((r) =>
      chrome.storage.sync.set({ hifizProgress: progress }, r),
    );
    setHifizProgress(progress);
  };

  // Cycle individual page status within a surah
  const handleCyclePageStatus = async (itemId: string, pageIdx: number) => {
    const itemData = INITIAL_HIFIZ_ITEMS.find((i) => i.id === itemId);
    if (!itemData) {
      return;
    }

    const progress: HifizProgress[] = await new Promise((r) =>
      chrome.storage.sync.get(["hifizProgress"], (res) =>
        r((res.hifizProgress as HifizProgress[]) || []),
      ),
    );
    let itemProgress = progress.find((p) => p.itemId === itemId);

    if (!itemProgress) {
      itemProgress = {
        itemId,
        status: "in_progress",
        pageStatuses: new Array(itemData.totalPages || 1).fill("not_started"),
        lastUpdated: new Date().toISOString(),
      };
      progress.push(itemProgress);
    }

    if (!itemProgress.pageStatuses) {
      itemProgress.pageStatuses = new Array(itemData.totalPages || 1).fill(
        itemProgress.status,
      );
    }

    const statuses: HifizProgress["status"][] = [
      "not_started",
      "in_progress",
      "memorized",
    ];
    const current = itemProgress.pageStatuses[pageIdx];
    const nextIndex = (statuses.indexOf(current) + 1) % statuses.length;
    itemProgress.pageStatuses[pageIdx] = statuses[nextIndex];
    itemProgress.lastUpdated = new Date().toISOString();

    const allMemorized = itemProgress.pageStatuses.every(
      (s) => s === "memorized",
    );
    const anyProgress = itemProgress.pageStatuses.some(
      (s) => s !== "not_started",
    );

    if (allMemorized) {
      itemProgress.status = "memorized";
    } else if (anyProgress) {
      itemProgress.status = "in_progress";
    } else {
      itemProgress.status = "not_started";
    }

    await new Promise<void>((r) =>
      chrome.storage.sync.set({ hifizProgress: progress }, r),
    );
    setHifizProgress(progress);
  };

  // Yeterlik items checkbox toggle
  const handleToggleYeterlik = async (index: number) => {
    const currentCompleted: number[] = await new Promise((r) =>
      chrome.storage.sync.get(["yeterlikler"], (res) =>
        r((res.yeterlikler as number[]) || []),
      ),
    );
    const next = currentCompleted.includes(index)
      ? currentCompleted.filter((i) => i !== index)
      : [...currentCompleted, index];
    await new Promise<void>((r) =>
      chrome.storage.sync.set({ yeterlikler: next }, r),
    );
    setYeterlikler(next);
  };

  // Mushaf viewer operations
  const openMushaf = (item: HifizItem) => {
    if (!item.pages || item.pages.length === 0) {
      return;
    }
    setActiveMushafItem(item);
    setCurrentPageIndex(0);
    document.body.classList.remove("sidebar-open");
  };

  const closeMushaf = () => {
    setActiveMushafItem(null);
  };

  // Filter surahs/duas
  const filteredItems = INITIAL_HIFIZ_ITEMS.filter((item) => {
    const matchesCat = item.category === category;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
