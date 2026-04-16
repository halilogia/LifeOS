import { HifizItem, HifizProgress } from "./types.js";
import { translations } from "./i18n.js";
import { state } from "./state.js";
import { elements } from "./dom.js";
import { INITIAL_HIFIZ_ITEMS } from "./hifizData.js";

export function createCardHTML(item: HifizItem, itemProgress: HifizProgress): string {
  const statusText =
    translations[state.currentLang][
      `hifiz_status_${itemProgress.status}` as keyof typeof translations.tr
    ];
  const catLabel =
    translations[state.currentLang][
      `hifiz_cat_${item.category}` as keyof typeof translations.tr
    ];

  return `
    <div class="hifiz-card-top">
      <span class="hifiz-cat-badge">${catLabel}</span>
      <div class="hifiz-status-badge status-${itemProgress.status}" title="Durumu Değiştir"></div>
    </div>
    <div class="hifiz-card-body">
      <h3>${item.title}</h3>
      ${item.description ? `<p class="hifiz-desc">${item.description}</p>` : ""}
    </div>
    <div class="hifiz-card-footer">
      <span class="status-text">${statusText}</span>
      <div class="hifiz-actions">
        ${
          item.url
            ? `
          <button class="hifiz-action-btn open-url" title="Diyanet'te Aç">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </button>
        `
            : ""
        }
        <button class="hifiz-action-btn cycle-status" title="Durumu Değiştir">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
      </div>
    </div>
  `;
}

export function updateHifizStats(progress: HifizProgress[]) {
  const memorizedCount = progress.filter(
    (p) => p.status === "memorized",
  ).length;
  const inProgressCount = progress.filter(
    (p) => p.status === "in_progress",
  ).length;
  const totalCount = INITIAL_HIFIZ_ITEMS.length;

  const sMem = elements.hifizStatMemorized();
  const sProg = elements.hifizStatProgress();
  const sTotal = elements.hifizStatTotal();

  if (sMem) {
    sMem.textContent = memorizedCount.toString();
  }
  if (sProg) {
    sProg.textContent = inProgressCount.toString();
  }
  if (sTotal) {
    sTotal.textContent = totalCount.toString();
  }
}
