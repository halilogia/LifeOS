import { useState, useEffect } from "preact/hooks";
import { storage } from "../core/storage.js";
import {
  INITIAL_HIFIZ_ITEMS,
  YETERLIKLER_DATA,
} from "../features/hifizData.js";
import { HifizProgress, HifizItem, Language } from "../types/types.js";
import { translations } from "../utils/i18n.js";

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
    const progress = await storage.getHifizProgress();
    const completedYeterlikler = await storage.getYeterlikler();
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
    const progress = await storage.getHifizProgress();
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

    await storage.setHifizProgress(progress);
    setHifizProgress(progress);
  };

  // Cycle individual page status within a surah
  const handleCyclePageStatus = async (itemId: string, pageIdx: number) => {
    const itemData = INITIAL_HIFIZ_ITEMS.find((i) => i.id === itemId);
    if (!itemData) {
      return;
    }

    const progress = await storage.getHifizProgress();
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

    await storage.setHifizProgress(progress);
    setHifizProgress(progress);
  };

  // Yeterlik items checkbox toggle
  const handleToggleYeterlik = async (index: number) => {
    const currentCompleted = await storage.getYeterlikler();
    const next = currentCompleted.includes(index)
      ? currentCompleted.filter((i) => i !== index)
      : [...currentCompleted, index];
    await storage.setYeterlikler(next);
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

            {/* Stats Dashboard */}
            <div className="hifiz-stats">
              <div className="hifiz-stat-card">
                <div className="stat-icon memorized">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{t.hifiz_stat_memorized}</span>
                  <span id="hifiz-stat-memorized-count" className="stat-value">
                    {memorizedCount}
                  </span>
                </div>
              </div>

              <div className="hifiz-stat-card">
                <div className="stat-icon progress">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{t.hifiz_stat_in_progress}</span>
                  <span id="hifiz-stat-progress-count" className="stat-value">
                    {inProgressCount}
                  </span>
                </div>
              </div>

              <div className="hifiz-stat-card">
                <div className="stat-icon total">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{t.hifiz_stat_total}</span>
                  <span id="hifiz-stat-total-count" className="stat-value">
                    {totalCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="hifiz-filters">
              <button
                className={`hifiz-filter-btn ${category === "surahs" ? "active" : ""}`}
                onClick={() => setCategory("surahs")}
              >
                {t.hifiz_cat_surahs}
              </button>
              <button
                className={`hifiz-filter-btn ${category === "duas" ? "active" : ""}`}
                onClick={() => setCategory("duas")}
              >
                {t.hifiz_cat_duas}
              </button>
            </div>

            {/* Grid display */}
            <div id="hifiz-grid" className="hifiz-grid">
              {filteredItems.map((item) => {
                const itemProgress = hifizProgress.find(
                  (p) => p.itemId === item.id,
                ) || {
                  itemId: item.id,
                  status: "not_started" as const,
                  lastUpdated: new Date().toISOString(),
                };

                const totalPagesCount = item.totalPages || 1;
                const pageStatuses =
                  itemProgress.pageStatuses ||
                  new Array(totalPagesCount).fill("not_started");
                const memorizedPagesCount = pageStatuses.filter(
                  (s) => s === "memorized",
                ).length;
                const pagePercent = Math.round(
                  (memorizedPagesCount / totalPagesCount) * 100,
                );

                const statusText =
                  t[`hifiz_status_${itemProgress.status}` as keyof typeof t] ||
                  itemProgress.status;
                const catLabel =
                  t[`hifiz_cat_${item.category}` as keyof typeof t] ||
                  item.category;

                return (
                  <div
                    key={item.id}
                    className="hifiz-card"
                    onClick={() => {
                      if (item.pages && item.pages.length > 0) {
                        openMushaf(item);
                      } else if (item.url) {
                        window.open(item.url, "_blank");
                      } else {
                        handleCycleStatus(item.id);
                      }
                    }}
                  >
                    <div className="hifiz-card-top">
                      <span className="hifiz-cat-badge">{catLabel}</span>
                      <div
                        className={`hifiz-status-badge status-${itemProgress.status}`}
                        title="Status"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCycleStatus(item.id);
                        }}
                      ></div>
                    </div>

                    <div className="hifiz-card-body">
                      <h3>{item.title}</h3>
                      {item.description && (
                        <p className="hifiz-desc">{item.description}</p>
                      )}

                      {totalPagesCount > 1 && (
                        <div className="hifiz-pages-container">
                          <div className="hifiz-progress-track">
                            <div
                              className="hifiz-progress-fill"
                              style={{ width: `${pagePercent}%` }}
                            ></div>
                          </div>
                          <div className="hifiz-pages-grid">
                            {pageStatuses.map((status, idx) => (
                              <div
                                key={idx}
                                className={`hifiz-page-box status-${status}`}
                                title={`Sayfa ${idx + 1}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCyclePageStatus(item.id, idx);
                                }}
                              >
                                {idx + 1}
                              </div>
                            ))}
                          </div>
                          <div className="hifiz-progress-text">
                            {memorizedPagesCount}/{totalPagesCount}{" "}
                            {t.hifiz_progress_pages}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hifiz-card-footer">
                      <span className="status-text">{statusText}</span>
                      <div className="hifiz-actions">
                        {item.pages && item.pages.length > 0 ? (
                          <button
                            className="hifiz-action-btn open-mushaf"
                            title="Open Mushaf"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMushaf(item);
                            }}
                          >
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
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                          </button>
                        ) : (
                          item.url && (
                            <button
                              className="hifiz-action-btn open-url"
                              title="Diyanet Link"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.url, "_blank");
                              }}
                            >
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
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </button>
                          )
                        )}
                        <button
                          className="hifiz-action-btn cycle-status"
                          title="Change status"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCycleStatus(item.id);
                          }}
                        >
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
                            <path d="M23 4v6h-6"></path>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: IMAM-HATIP YETERLIKLER CHECKLIST */}
        {subView === "yeterlikler" && (
          <div id="yeterlikler-content" className="hifiz-sub-view active">
            <div className="hifiz-header">
              <h2>A. Aday Din Görevlisi (İmam-Hatip) Yeterlikleri</h2>
            </div>

            <div className="hifiz-overall-progress-container">
              <div className="hifiz-overall-info">
                <span>
                  {lang === "tr" ? "Müfredat İlerlemesi" : "Checklist Progress"}
                </span>
                <span id="yeterlikler-overall-percent">
                  {yeterliklerPercent}%
                </span>
              </div>
              <div className="hifiz-overall-bar">
                <div
                  id="yeterlikler-overall-fill"
                  className="hifiz-overall-fill"
                  style={{ width: `${yeterliklerPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="yeterlikler-list">
              {YETERLIKLER_DATA.map((item, index) => {
                const isCompleted = yeterlikler.includes(index);
                return (
                  <div
                    key={index}
                    className={`yeterlik-item ${isCompleted ? "completed" : ""}`}
                    onClick={() => handleToggleYeterlik(index)}
                  >
                    <div className="yeterlik-checkbox">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div className="yeterlik-text">{item.title}</div>
                    <button
                      className="yeterlik-info-btn"
                      title="Detay"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveYeterlik({
                          title: item.title,
                          description: item.description,
                        });
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mushaf Viewer Modal */}
      {activeMushafItem &&
        activeMushafItem.pages &&
        activeMushafItem.pages.length > 0 && (
          <div className="settings-panel active" onClick={closeMushaf}>
            <div
              className="hifiz-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="settings-header">
                <h3 id="hifiz-image-title">{activeMushafItem.title}</h3>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    marginRight: "10px",
                  }}
                >
                  <span
                    id="hifiz-page-info"
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.05)",
                      padding: "4px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    {currentPageIndex + 1} / {activeMushafItem.pages.length}
                  </span>
                  <button
                    className="close-btn"
                    onClick={closeMushaf}
                    style={{ margin: 0, fontSize: "1.8rem" }}
                  >
                    &times;
                  </button>
                </div>
              </header>
              <div className="hifiz-image-body">
                <button
                  id="hifiz-prev-page"
                  className="hifiz-nav-btn"
                  disabled={currentPageIndex === 0}
                  onClick={() =>
                    setCurrentPageIndex((prev) => Math.max(0, prev - 1))
                  }
                >
                  &lt;
                </button>
                <div className="hifiz-image-container">
                  <img
                    id="hifiz-mushaf-img"
                    src={`data/quran_images/sayfa_${String(activeMushafItem.pages[currentPageIndex]).padStart(3, "0")}.png`}
                    alt="Mushaf Sayfası"
                  />
                </div>
                <button
                  id="hifiz-next-page"
                  className="hifiz-nav-btn"
                  disabled={
                    currentPageIndex === activeMushafItem.pages.length - 1
                  }
                  onClick={() =>
                    setCurrentPageIndex((prev) =>
                      Math.min(activeMushafItem.pages!.length - 1, prev + 1),
                    )
                  }
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Yeterlik Info Detail Modal */}
      {activeYeterlik && (
        <div
          className="settings-panel active"
          onClick={() => setActiveYeterlik(null)}
        >
          <div
            className="settings-content"
            style={{ maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header">
              <h3 id="yeterlik-modal-title">{activeYeterlik.title}</h3>
              <button
                className="close-btn"
                onClick={() => setActiveYeterlik(null)}
              >
                &times;
              </button>
            </header>
            <div className="note-editor-body" style={{ padding: "24px" }}>
              <p
                id="yeterlik-modal-description"
                style={{
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                  color: "var(--text-primary)",
                }}
              >
                {activeYeterlik.description}
              </p>
            </div>
            <div className="settings-footer">
              <button
                className="settings-add-btn"
                style={{ width: "auto", padding: "0 30px" }}
                onClick={() => setActiveYeterlik(null)}
              >
                {lang === "tr" ? "Anladım" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
