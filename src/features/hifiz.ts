import { HifizProgress } from "../types/types.js";
import { elements } from "../ui/dom.js";
import { storage } from "../core/storage.js";

import { INITIAL_HIFIZ_ITEMS, YETERLIKLER_DATA } from "../features/hifizData.js";
import { createCardHTML, updateHifizStats } from "../ui/hifizRender.js";

let currentCategory = "ALL";
let searchQuery = "";
let currentSubView: "memorizations" | "yeterlikler" = "memorizations";

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
        currentCategory = btn.getAttribute("data-category") || "ALL";
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

  renderHifizView();
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
    const matchesCat =
      currentCategory === "ALL" || item.category === currentCategory;
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
      if (item.url) {
        window.open(item.url, "_blank");
      }
    });

    card.addEventListener("click", () => {
      if (item.url) {
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

  YETERLIKLER_DATA.forEach((text, index) => {
    const isCompleted = completed.includes(index);
    const item = document.createElement("div");
    item.className = `yeterlik-item ${isCompleted ? "completed" : ""}`;
    item.innerHTML = `
      <div class="yeterlik-checkbox">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="yeterlik-text">${text}</div>
    `;

    item.addEventListener("click", async () => {
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

    list.appendChild(item);
  });
}

async function cycleStatus(itemId: string) {
  const progress = await storage.getHifizProgress();
  const itemIndex = progress.findIndex((p) => p.itemId === itemId);

  const statuses: HifizProgress["status"][] = [
    "not_started",
    "in_progress",
    "memorized",
  ];

  if (itemIndex === -1) {
    progress.push({
      itemId,
      status: "in_progress",
      lastUpdated: new Date().toISOString(),
    });
  } else {
    const currentStatus = progress[itemIndex].status;
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    progress[itemIndex].status = statuses[nextIndex];
    progress[itemIndex].lastUpdated = new Date().toISOString();
  }

  await storage.setHifizProgress(progress);
  renderMemorizationsGrid();
}
