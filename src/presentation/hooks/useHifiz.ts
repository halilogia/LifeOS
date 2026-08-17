import { useEffect } from "preact/hooks";
import {
  useHifizState,
  computeHifizStats,
  computeYeterliklerStats,
} from "@/presentation/store/hifizStore.js";
import { INITIAL_HIFIZ_ITEMS } from "@/domain/data/hifizData.js";

/**
 * Facade over useHifizState — all state + storage lives in the store.
 * Derived stats computed from store state via pure helpers.
 */
export function useHifiz() {
  const subView = useHifizState((s) => s.subView);
  const setSubView = useHifizState((s) => s.setSubView);
  const category = useHifizState((s) => s.category);
  const setCategory = useHifizState((s) => s.setCategory);
  const search = useHifizState((s) => s.search);
  const setSearch = useHifizState((s) => s.setSearch);
  const hifizProgress = useHifizState((s) => s.hifizProgress);
  const yeterlikler = useHifizState((s) => s.yeterlikler);
  const activeMushafItem = useHifizState((s) => s.activeMushafItem);
  const currentPageIndex = useHifizState((s) => s.currentPageIndex);
  const setCurrentPageIndex = useHifizState((s) => s.setCurrentPageIndex);
  const activeYeterlik = useHifizState((s) => s.activeYeterlik);
  const setActiveYeterlik = useHifizState((s) => s.setActiveYeterlik);
  const handleCycleStatus = useHifizState((s) => s.handleCycleStatus);
  const handleCyclePageStatus = useHifizState((s) => s.handleCyclePageStatus);
  const handleToggleYeterlik = useHifizState((s) => s.handleToggleYeterlik);
  const openMushaf = useHifizState((s) => s.openMushaf);
  const closeMushaf = useHifizState((s) => s.closeMushaf);

  useEffect(() => {
    void useHifizState.getState().loadData();
  }, []);

  // Derived stats
  const { memorizedCount, inProgressCount, totalCount, overallPercent } =
    computeHifizStats(hifizProgress);
  const { percent: yeterliklerPercent } = computeYeterliklerStats(yeterlikler);

  // Filter surahs/duas
  const filteredItems = INITIAL_HIFIZ_ITEMS.filter((item) => {
    const matchesCat = item.category === category;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return {
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
  };
}
