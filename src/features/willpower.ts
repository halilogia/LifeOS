import { storage } from "@/core/storage.js";
import { elements } from "@/ui/dom.js";
import { WillpowerStreak } from "@/types/types.js";
import { state } from "@/core/state.js";
import { translations } from "@/utils/i18n.js";

let timerInterval: number | null = null;
let isInitialized = false;

export async function initWillpower(): Promise<void> {
  // Clear any existing interval to prevent duplicates
  if (timerInterval) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }

  // Bind event listeners only once
  if (!isInitialized) {
    const resetBtn = elements.willpowerResetBtn();
    if (resetBtn) {
      resetBtn.addEventListener("click", async () => {
        await resetStreak();
      });
    }

    const noteInput = elements.willpowerNoteInput();
    if (noteInput) {
      noteInput.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
          await resetStreak();
        }
      });
    }
    isInitialized = true;
  }

  // Load and draw UI immediately
  await updateWillpowerUI();

  // Start the ticking timer
  timerInterval = window.setInterval(async () => {
    // Self-cleanup: if the willpower view is no longer active in DOM, stop interval
    const view = elements.willpowerView();
    if (!view || !view.classList.contains("active")) {
      if (timerInterval) {
        window.clearInterval(timerInterval);
        timerInterval = null;
      }
      return;
    }
    await updateWillpowerUI();
  }, 1000);
}

export async function updateWillpowerUI(): Promise<void> {
  let data = await storage.getWillpowerStreak();

  // Initialize storage object if it doesn't exist
  if (!data) {
    data = {
      startDate: new Date().toISOString(),
      bestStreakDays: 0,
      history: [],
    };
    await storage.setWillpowerStreak(data);
  }

  // Calculate elapsed time
  const start = new Date(data.startDate).getTime();
  const now = new Date().getTime();
  const diffMs = Math.max(0, now - start);

  const diffSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSecs / 86400);
  const hours = Math.floor((diffSecs % 86400) / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  // Update dynamic numbers in DOM
  const dEl = document.getElementById("wp-days");
  const hEl = document.getElementById("wp-hours");
  const mEl = document.getElementById("wp-minutes");
  const sEl = document.getElementById("wp-seconds");

  if (dEl) dEl.textContent = String(days).padStart(2, "0");
  if (hEl) hEl.textContent = String(hours).padStart(2, "0");
  if (mEl) mEl.textContent = String(minutes).padStart(2, "0");
  if (sEl) sEl.textContent = String(seconds).padStart(2, "0");

  // Dynamic best streak calculation
  const currentBest = Math.max(data.bestStreakDays, days);
  const bestEl = elements.willpowerBestStreak();
  if (bestEl) {
    bestEl.textContent = String(currentBest);
  }

  // Determine Rank Class, Title and Description
  let rankText = "";
  let rankDesc = "";
  let rankClass = "";

  if (days < 3) {
    rankText = state.currentLang === "tr" ? "Başlangıç" : "Initiate";
    rankDesc =
      state.currentLang === "tr"
        ? "Her büyük yolculuk küçük bir adımla başlar. Zihnini koru, kararlı ol."
        : "Every great journey starts with a single step. Guard your mind, stay determined.";
    rankClass = "rank-initiate";
  } else if (days < 7) {
    rankText = state.currentLang === "tr" ? "Demir İrade" : "Iron Will";
    rankDesc =
      state.currentLang === "tr"
        ? "İlk kritik aşamayı geçtin. Zihnindeki sesleri sustur ve yoluna devam et."
        : "You passed the first critical phase. Silence the noise in your mind and keep moving forward.";
    rankClass = "rank-iron";
  } else if (days < 14) {
    rankText = state.currentLang === "tr" ? "Özdenetim" : "Self-Control";
    rankDesc =
      state.currentLang === "tr"
        ? "Bir haftalık temiz süreci geride bıraktın. Disiplinin meyvelerini vermeye başlıyor."
        : "You've left a clean week behind. Your discipline is starting to bear fruit.";
    rankClass = "rank-control";
  } else if (days < 30) {
    rankText = state.currentLang === "tr" ? "Savaşçı" : "Warrior";
    rankDesc =
      state.currentLang === "tr"
        ? "İki haftadan fazladır savaşıyorsun. Alışkanlıklar kırılıyor, gücünü hisset."
        : "You've been fighting for over two weeks. Habits are breaking, feel your strength.";
    rankClass = "rank-warrior";
  } else if (days < 90) {
    rankText = state.currentLang === "tr" ? "Şövalye" : "Knight";
    rankDesc =
      state.currentLang === "tr"
        ? "Kritik 30 günlük barajı aştın! Kararlılığın herkese ilham veriyor."
        : "You have crossed the critical 30-day mark! Your determination is inspiring.";
    rankClass = "rank-knight";
  } else {
    rankText = state.currentLang === "tr" ? "Üstat" : "Master";
    rankDesc =
      state.currentLang === "tr"
        ? "90 günden fazla süredir iradenin mutlak hakimisin. Zihnin tamamen berrak."
        : "Over 90 days of absolute willpower mastery. Your mind is completely clear.";
    rankClass = "rank-master";
  }

  const rankContainer = document.querySelector(".rank-badge-container");
  if (rankContainer) {
    rankContainer.className = `rank-badge-container ${rankClass}`;
  }
  const rTextEl = elements.willpowerRankText();
  if (rTextEl) {
    rTextEl.textContent = rankText;
  }
  const rDescEl = elements.willpowerRankDesc();
  if (rDescEl) {
    rDescEl.textContent = rankDesc;
  }

  // Update History list
  const listEl = elements.willpowerHistoryList();
  if (listEl) {
    listEl.innerHTML = "";
    if (data.history.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "history-empty";
      emptyEl.textContent =
        translations[state.currentLang].willpower_history_empty;
      listEl.appendChild(emptyEl);
    } else {
      // Show newest first
      const sortedHistory = [...data.history].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );

      sortedHistory.forEach((item) => {
        const itemEl = document.createElement("div");
        itemEl.className = "history-item";

        const startDateFormatted = new Date(item.startDate).toLocaleDateString(
          state.currentLang === "tr" ? "tr-TR" : "en-US",
        );
        const endDateFormatted = new Date(item.endDate).toLocaleDateString(
          state.currentLang === "tr" ? "tr-TR" : "en-US",
        );

        const durationVal = item.days;
        const durationUnit =
          translations[state.currentLang].willpower_clean_days.toLowerCase();
        const durationText = `${durationVal} ${durationUnit}`;

        const noteText = item.note
          ? `<span class="history-note" title="${item.note}">"${item.note}"</span>`
          : "";

        itemEl.innerHTML = `
          <div class="history-item-left">
            <span class="history-date">${startDateFormatted} - ${endDateFormatted}</span>
            ${noteText}
          </div>
          <div class="history-item-right">
            <span class="history-duration">${durationText}</span>
          </div>
        `;
        listEl.appendChild(itemEl);
      });
    }
  }
}

async function resetStreak(): Promise<void> {
  const data = await storage.getWillpowerStreak();
  if (!data) return;

  const confirmMsg = translations[state.currentLang].willpower_reset_confirm;
  if (!confirm(confirmMsg)) return;

  // Calculate streak days finished
  const start = new Date(data.startDate).getTime();
  const now = new Date().getTime();
  const diffMs = Math.max(0, now - start);
  const diffSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSecs / 86400);

  const noteInput = elements.willpowerNoteInput();
  const note = noteInput ? noteInput.value.trim() : "";

  // Append current streak to history
  data.history.push({
    startDate: data.startDate,
    endDate: new Date().toISOString(),
    days: days,
    note: note || undefined,
  });

  // Save new best streak if applicable
  data.bestStreakDays = Math.max(data.bestStreakDays, days);

  // Set start date of next streak to current time
  data.startDate = new Date().toISOString();

  await storage.setWillpowerStreak(data);

  // Reset note input field
  if (noteInput) {
    noteInput.value = "";
  }

  // Reload display
  await updateWillpowerUI();
}
