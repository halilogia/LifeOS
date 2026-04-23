import { HifizProgress } from "../types/types.js";
import { elements } from "../ui/dom.js";
import { storage } from "../core/storage.js";

import { INITIAL_HIFIZ_ITEMS, YETERLIKLER_DATA } from "../features/hifizData.js";
import { createCardHTML, updateHifizStats } from "../ui/hifizRender.js";

let currentCategory = "surahs";
let searchQuery = "";
let currentSubView: "memorizations" | "yeterlikler" = "memorizations";

// Mushaf Viewer State
let activeItem: any = null;
let currentPageIndex = 0;

export async function initHifiz() {
  const hSearch = elements.hifizSearch();
  if (hSearch) {
    hSearch.addEventListener("input", (e) => {
      searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      renderMemorizationsGrid();
    });
  }
  const filterBtns = elements.hifizFilterBtns();
  if (filterBtns) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.getAttribute("data-category") || "surahs";
        renderMemorizationsGrid();
      });
    });
  }

  // Tab Switching Logic
  const tabMemorizations = elements.hifizTabMemorizations();
  const tabYeterlikler = elements.hifizTabYeterlikler();

  if (tabMemorizations && tabYeterlikler) {
    tabMemorizations.addEventListener("click", () => {
      currentSubView = "memorizations";
      updateSubViewUI();
    });

    tabYeterlikler.addEventListener("click", () => {
      currentSubView = "yeterlikler";
      updateSubViewUI();
    });
  }

  // Yeterlik Modal Listeners
  elements.yeterlikModalClose()?.addEventListener("click", () => closeYeterlikModal());
  elements.yeterlikModalOk()?.addEventListener("click", () => closeYeterlikModal());
  elements.yeterlikModal()?.addEventListener("click", (e) => {
      if (e.target === elements.yeterlikModal()) closeYeterlikModal();
  });

  // Mushaf Viewer Listeners
  elements.hifizImageClose()?.addEventListener("click", () => closeMushafViewer());
  elements.hifizPrevPage()?.addEventListener("click", () => {
      if (currentPageIndex > 0) {
          currentPageIndex--;
          updateMushafPage();
      }
  });
  elements.hifizNextPage()?.addEventListener("click", () => {
      if (activeItem && currentPageIndex < (activeItem.pages?.length || 0) - 1) {
          currentPageIndex++;
          updateMushafPage();
      }
  });
  elements.hifizImageModal()?.addEventListener("click", (e) => {
      if (e.target === elements.hifizImageModal()) closeMushafViewer();
  });

  renderHifizView();
}

function openYeterlikModal(title: string, description: string) {
    const modal = elements.yeterlikModal();
    const mTitle = elements.yeterlikModalTitle();
    const mDesc = elements.yeterlikModalDescription();

    if (modal && mTitle && mDesc) {
        mTitle.textContent = title;
        mDesc.textContent = description;
        modal.classList.add("active");
    }
}

function closeYeterlikModal() {
    elements.yeterlikModal()?.classList.remove("active");
}

/* Mushaf Viewer Functions */
function openMushafViewer(item: any) {
    if (!item.pages || item.pages.length === 0) return;
    activeItem = item;
    currentPageIndex = 0;
    
    const modal = elements.hifizImageModal();
    if (modal) modal.classList.add("active");
    
    updateMushafPage();
}

function updateMushafPage() {
    if (!activeItem || !activeItem.pages) return;
    
    const page = activeItem.pages[currentPageIndex];
    const title = elements.hifizImageTitle();
    const info = elements.hifizPageInfo();
    const img = elements.hifizMushafImg();
    const prev = elements.hifizPrevPage();
    const next = elements.hifizNextPage();
    
    if (title) title.textContent = activeItem.title;
    if (info) info.textContent = `${currentPageIndex + 1} / ${activeItem.pages.length}`;
    if (img) img.src = `data/quran_images/sayfa_${page.toString().padStart(3, '0')}.png`;
    
    if (prev) prev.disabled = currentPageIndex === 0;
    if (next) next.disabled = currentPageIndex === activeItem.pages.length - 1;
}

function closeMushafViewer() {
    elements.hifizImageModal()?.classList.remove("active");
    activeItem = null;
}

function updateSubViewUI() {
  const tabMem = elements.hifizTabMemorizations();
  const tabYet = elements.hifizTabYeterlikler();
  const viewMem = elements.hifizMainContent();
  const viewYet = elements.yeterliklerContent();

  if (currentSubView === "memorizations") {
    tabMem?.classList.add("active");
    tabYet?.classList.remove("active");
    viewMem?.classList.add("active");
    viewYet?.classList.remove("active");
    renderMemorizationsGrid();
  } else {
    tabMem?.classList.remove("active");
    tabYet?.classList.add("active");
    viewMem?.classList.remove("active");
    viewYet?.classList.add("active");
    renderYeterlikler();
  }
}

export async function renderHifizView() {
  updateSubViewUI();
}

async function renderMemorizationsGrid() {
  const progress = await storage.getHifizProgress();
  const grid = elements.hifizGrid();
  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  const filtered = INITIAL_HIFIZ_ITEMS.filter((item) => {
    const matchesCat = item.category === currentCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  filtered.forEach((item) => {
    const itemProgress = progress.find((p) => p.itemId === item.id) || {
      itemId: item.id,
      status: "not_started" as const,
      lastUpdated: new Date().toISOString(),
    };

    const card = document.createElement("div");
    card.className = "hifiz-card";
    card.innerHTML = createCardHTML(item, itemProgress);

    card
      .querySelector(".hifiz-status-badge")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        cycleStatus(item.id);
      });
    card.querySelector(".cycle-status")?.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleStatus(item.id);
    });

    card.querySelector(".open-url")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const url = (e.currentTarget as HTMLElement).getAttribute("data-url");
      if (url) {
        window.open(url, "_blank");
      }
    });

    card.querySelector(".open-mushaf")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openMushafViewer(item);
    });

    card.querySelectorAll(".hifiz-page-box").forEach((box) => {
      box.addEventListener("click", (e) => {
        e.stopPropagation();
        const pageIdx = parseInt(box.getAttribute("data-page") || "0");
        cyclePageStatus(item.id, pageIdx);
      });
    });

    card.addEventListener("click", () => {
      if (item.pages && item.pages.length > 0) {
        openMushafViewer(item);
      } else if (item.url) {
        window.open(item.url, "_blank");
      } else {
        cycleStatus(item.id);
      }
    });

    grid.appendChild(card);
  });

  updateHifizStats(progress);
}

async function renderYeterlikler() {
  const list = elements.yeterliklerList();
  if (!list) return;

  const completed = await storage.getYeterlikler();
  list.innerHTML = "";

  YETERLIKLER_DATA.forEach((itemData, index) => {
    const isCompleted = completed.includes(index);
    const item = document.createElement("div");
    item.className = `yeterlik-item ${isCompleted ? "completed" : ""}`;
    item.innerHTML = `
      <div class="yeterlik-checkbox">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="yeterlik-text">${itemData.title}</div>
      <button class="yeterlik-info-btn" title="Detay">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </button>
    `;

    item.addEventListener("click", async (e) => {
      // Don't toggle if the info button was clicked
      if ((e.target as HTMLElement).closest(".yeterlik-info-btn")) return;

      const currentCompleted = await storage.getYeterlikler();
      if (currentCompleted.includes(index)) {
        const next = currentCompleted.filter((i) => i !== index);
        await storage.setYeterlikler(next);
      } else {
        currentCompleted.push(index);
        await storage.setYeterlikler(currentCompleted);
      }
      renderYeterlikler();
    });

    item.querySelector(".yeterlik-info-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openYeterlikModal(itemData.title, itemData.description);
    });

    list.appendChild(item);
  });

  const progress = await storage.getHifizProgress();
  updateHifizStats(progress);
}

async function cycleStatus(itemId: string) {
  const progress = await storage.getHifizProgress();
  const itemIndex = progress.findIndex((p) => p.itemId === itemId);
  const itemData = INITIAL_HIFIZ_ITEMS.find(i => i.id === itemId);

  const statuses: HifizProgress["status"][] = [
    "not_started",
    "in_progress",
    "memorized",
  ];

  if (itemIndex === -1) {
    const newItem: HifizProgress = {
      itemId,
      status: "in_progress",
      lastUpdated: new Date().toISOString(),
    };
    if (itemData?.totalPages && itemData.totalPages > 1) {
        newItem.pageStatuses = new Array(itemData.totalPages).fill("not_started");
    }
    progress.push(newItem);
  } else {
    const currentStatus = progress[itemIndex].status;
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    progress[itemIndex].status = nextStatus;
    progress[itemIndex].lastUpdated = new Date().toISOString();

    // Sync page statuses if they exist
    if (progress[itemIndex].pageStatuses) {
        progress[itemIndex].pageStatuses = progress[itemIndex].pageStatuses?.map(() => nextStatus);
    }
  }

  await storage.setHifizProgress(progress);
  renderMemorizationsGrid();
}

async function cyclePageStatus(itemId: string, pageIdx: number) {
    const progress = await storage.getHifizProgress();
    const itemData = INITIAL_HIFIZ_ITEMS.find(i => i.id === itemId);
    if (!itemData) return;

    let itemProgress = progress.find(p => p.itemId === itemId);
    
    if (!itemProgress) {
        itemProgress = {
            itemId,
            status: "in_progress",
            pageStatuses: new Array(itemData.totalPages || 1).fill("not_started"),
            lastUpdated: new Date().toISOString()
        };
        progress.push(itemProgress);
    }

    if (!itemProgress.pageStatuses) {
        itemProgress.pageStatuses = new Array(itemData.totalPages || 1).fill(itemProgress.status);
    }

    const statuses: HifizProgress["status"][] = ["not_started", "in_progress", "memorized"];
    const currentStatus = itemProgress.pageStatuses[pageIdx];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    itemProgress.pageStatuses[pageIdx] = statuses[nextIndex];
    itemProgress.lastUpdated = new Date().toISOString();

    // Derived overall status
    const allMemorized = itemProgress.pageStatuses.every(s => s === "memorized");
    const anyProgress = itemProgress.pageStatuses.some(s => s !== "not_started");

    if (allMemorized) {
        itemProgress.status = "memorized";
    } else if (anyProgress) {
        itemProgress.status = "in_progress";
    } else {
        itemProgress.status = "not_started";
    }

    await storage.setHifizProgress(progress);
    renderMemorizationsGrid();
}
