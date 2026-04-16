import { HifizItem, HifizProgress } from "./types.js";
import { elements } from "./dom.js";
import { state } from "./state.js";
import { translations } from "./i18n.js";
import { storage } from "./storage.js";

export const INITIAL_HIFIZ_ITEMS: HifizItem[] = [
  { id: 'ayat-1', title: 'Bakara Suresi 1-5 (Elif Lam Mim)', category: "ayat" },
  { id: 'ayat-2', title: 'Ayet-el Kürsi (Bakara 255)', category: "ayat" },
  { id: 'ayat-3', title: 'Amenerrasulü (Bakara 285-286)', category: "ayat" },
  { id: 'ayat-4', title: 'Hüvallahüllezi (Haşr 20-24)', category: "ayat" },
  { id: 'surah-1', title: 'Yasin Suresi', category: "surahs" },
  { id: 'surah-2', title: 'Fetih Suresi', category: "surahs" },
  { id: 'surah-5', title: 'Mülk Suresi (Tebareke)', category: "surahs" },
  { id: 'dua-7', title: 'Sübhaneke', category: "duas", description: 'Namaz Duası' },
  { id: 'dua-8', title: 'Ettehiyyatü', category: "duas", description: 'Namaz Duası' },
  { id: 'dua-9', title: 'Allahümme Salli & Barik', category: "duas", description: 'Namaz Duası' },
  { id: 'juz-78', title: 'Nebe Suresi (Amme)', category: "juz30" },
  { id: 'juz-93', title: 'Duha Suresi', category: "juz30" },
  { id: 'juz-94', title: 'İnşirah Suresi', category: "juz30" },
  { id: 'juz-108', title: 'Kevser Suresi', category: "juz30" },
  { id: 'juz-112', title: 'İhlas Suresi', category: "juz30" },
  { id: 'juz-113', title: 'Felak Suresi', category: "juz30" },
  { id: 'juz-114', title: 'Nas Suresi', category: "juz30" },
];

let currentCategory = "ALL";
let searchQuery = "";

export async function initHifiz() {
  const progress = await storage.getHifizProgress();
  
  // Setup Search
  elements.hifizSearch().addEventListener("input", (e) => {
    searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
    renderHifizGrid();
  });

  // Setup Filters
  elements.hifizFilterBtns().forEach(btn => {
    btn.addEventListener("click", () => {
      elements.hifizFilterBtns().forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category") || "ALL";
      renderHifizGrid();
    });
  });

  renderHifizGrid();
}

export async function renderHifizGrid() {
  const progress = await storage.getHifizProgress();
  const grid = elements.hifizGrid();
  grid.innerHTML = "";

  const filtered = INITIAL_HIFIZ_ITEMS.filter(item => {
    const matchesCat = currentCategory === "ALL" || item.category === currentCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  filtered.forEach(item => {
    const itemProgress = progress.find(p => p.itemId === item.id) || {
      itemId: item.id,
      status: "not_started" as const,
      lastUpdated: new Date().toISOString()
    };

    const card = document.createElement("div");
    card.className = "hifiz-card";
    const statusText = translations[state.currentLang][`hifiz_status_${itemProgress.status}` as keyof typeof translations.tr];
    const catLabel = translations[state.currentLang][`hifiz_cat_${item.category}` as keyof typeof translations.tr];

    card.innerHTML = `
      <div class="hifiz-card-top">
        <span class="hifiz-cat-badge">${catLabel}</span>
        <div class="hifiz-status-badge status-${itemProgress.status}"></div>
      </div>
      <h3>${item.title}</h3>
      <div class="hifiz-card-footer">
        <span>${statusText}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    `;

    card.addEventListener("click", () => {
      cycleStatus(item.id);
    });

    grid.appendChild(card);
  });

  updateStats(progress);
}

async function cycleStatus(itemId: string) {
  const progress = await storage.getHifizProgress();
  let itemIndex = progress.findIndex(p => p.itemId === itemId);
  
  const statuses: HifizProgress["status"][] = ["not_started", "in_progress", "memorized"];
  
  if (itemIndex === -1) {
    progress.push({
      itemId,
      status: "in_progress",
      lastUpdated: new Date().toISOString()
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

function updateStats(progress: HifizProgress[]) {
  const memorized = progress.filter(p => p.status === "memorized").length;
  const inProgress = progress.filter(p => p.status === "in_progress").length;
  const total = INITIAL_HIFIZ_ITEMS.length;

  elements.hifizStatMemorized().textContent = memorized.toString();
  elements.hifizStatProgress().textContent = inProgress.toString();
  elements.hifizStatTotal().textContent = total.toString();
}
