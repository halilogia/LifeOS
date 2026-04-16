import { HifizProgress } from "../types/types.js";
import { elements } from "../ui/dom.js";
import { storage } from "../core/storage.js";

import { INITIAL_HIFIZ_ITEMS } from "../features/hifizData.js";
import { createCardHTML, updateHifizStats } from "../ui/hifizRender.js";

let currentCategory = "ALL";
let searchQuery = "";

export async function initHifiz() {
  const hSearch = elements.hifizSearch();
  if (hSearch) {
    hSearch.addEventListener("input", (e) => {
      searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      renderHifizGrid();
    });
  }
  const filterBtns = elements.hifizFilterBtns();
  if (filterBtns) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.getAttribute("data-category") || "ALL";
        renderHifizGrid();
      });
    });
  }

  renderHifizGrid();
}

export async function renderHifizGrid() {
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
  renderHifizGrid();
}
