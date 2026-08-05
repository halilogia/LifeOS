"use strict";
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const $ = (s, el = document) => el.querySelector(s);

// ---------- SM-2 algorithm (port of src/domain/services/SrsService.ts) ----------
function createInitialSRSWord(wordId) {
  return {
    wordId, status: "new", nextReviewDate: new Date().toISOString(),
    lastReviewDate: "", reviewCount: 0, easeFactor: 2.5, interval: 0,
    correctCount: 0, incorrectCount: 0,
  };
}
function calculateSM2(current, quality, now = new Date()) {
  let newInterval, newEaseFactor = current.easeFactor, newStatus = current.status, xpEarned = 0;
  switch (quality) {
    case "easy":
      newEaseFactor = Math.min(2.5, current.easeFactor + 0.15);
      if (current.interval === 0) newInterval = 1;
      else if (current.interval === 1) newInterval = 3;
      else newInterval = Math.round(current.interval * newEaseFactor);
      newStatus = "learned"; xpEarned = 15; break;
    case "medium":
      if (current.interval === 0) newInterval = 0.007;
      else if (current.interval < 1) newInterval = 1;
      else newInterval = Math.round(current.interval * 1.2);
      newStatus = "learning"; xpEarned = 10; break;
    case "hard":
      newInterval = 0.0007;
      newEaseFactor = Math.max(1.3, current.easeFactor - 0.2);
      newStatus = "learning"; xpEarned = 0; break;
    default: newInterval = current.interval;
  }
  const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
  return {
    ...current, interval: newInterval, easeFactor: newEaseFactor, status: newStatus,
    nextReviewDate: nextReviewDate.toISOString(), lastReviewDate: now.toISOString(),
    reviewCount: current.reviewCount + 1,
    correctCount: quality === "easy" ? current.correctCount + 1 : current.correctCount,
    incorrectCount: quality === "hard" ? current.incorrectCount + 1 : current.incorrectCount,
    xpEarned,
  };
}

// ---------- Queue (port of prepareSRSQueue, kpss-flavored) ----------
function prepareSRSQueue(allWords, universe, goal) {
  const now = new Date();
  const due = allWords.filter((w) => !w.nextReviewDate || new Date(w.nextReviewDate) <= now);
  let queue = [...due];
  if (queue.length < goal) {
    const existing = new Set(queue.map((w) => String(w.wordId).toLowerCase()));
    const candidates = universe.filter((w) => !existing.has(String(w.id).toLowerCase()));
    queue = [...queue, ...candidates.slice(0, goal - queue.length).map((c) => createInitialSRSWord(c.id))];
  }
  if (queue.length > goal) {
    for (let i = 0; i < goal; i++) {
      const j = i + Math.floor(Math.random() * (queue.length - i));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    queue = queue.slice(0, goal);
  } else {
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }
  return queue;
}

// ---------- Persistence (localStorage replaces chrome.storage.sync) ----------
const SRS_KEY = "kpss_srs_progress";
const progressMap = new Map();
function loadProgress() {
  progressMap.clear();
  try {
    const arr = JSON.parse(localStorage.getItem(SRS_KEY) || "[]");
    arr.forEach((p) => progressMap.set(p.wordId, p));
  } catch (e) { /* corrupt -> treat empty */ }
}
function saveProgress() {
  localStorage.setItem(SRS_KEY, JSON.stringify([...progressMap.values()]));
}

// ---------- Render ----------
const chapters = [...new Set(FLASHCARDS.map((c) => c.category))].sort();
let chapter = "all", queue = [], index = 0, flipped = false, loading = true;

function flashcardsForChapter() {
  if (chapter === "all") return FLASHCARDS;
  return FLASHCARDS.filter((c) => c.category === chapter);
}
function loadQueue() {
  loading = true; index = 0; flipped = false; render();
  setTimeout(() => {
    const prog = [...progressMap.values()].filter((p) =>
      flashcardsForChapter().some((c) => c.id === p.wordId)
    );
    queue = prepareSRSQueue(prog, flashcardsForChapter(), 15);
    loading = false; render();
  }, 30);
}
function currentCard() {
  const review = queue[index];
  if (!review) return null;
  return flashcardsForChapter().find((c) => c.id === review.wordId) || null;
}

function render() {
  const root = $("#root");
  const chaptersLabels = chapters.map((c) =>
    '<option value="' + c + '">' + c + "</option>"
  ).join("");
  let body;
  if (loading) {
    body = `
      <div class="state">
        <div class="spinner"></div>
        <p class="muted">Kartlar hazırlanıyor…</p>
      </div>`;
  } else if (queue.length === 0 || index >= queue.length) {
    body = `
      <div class="state">
        <div class="emoji">🎉</div>
        <h2>Harika İş!</h2>
        <p class="muted">Tüm kartlar tamamlandı.</p>
        <button class="btn accent" data-action="reload">🔄 Yeni Tekrar</button>
      </div>`;
  } else {
    const card = currentCard();
    const actions = flipped
      ? `
        <div class="actions">
          <button class="btn hard" data-action="review" data-quality="hard">😖 Zor</button>
          <button class="btn medium" data-action="review" data-quality="medium">🙂 Orta</button>
          <button class="btn easy" data-action="review" data-quality="easy">😄 Kolay</button>
        </div>`
      : `<p class="tap-hint">👆 Karta dokun, cevabı gör</p>`;
    const swipeHint = flipped
      ? `<p class="swipe-hint">← Zor · ↑ Orta · Kolay →</p>`
      : "";
    body = `
      <div class="topbar">
        <span>${card.category}</span>
        <span class="count">Kart ${index + 1} / ${queue.length}</span>
      </div>
      <div class="flashcard ${flipped ? "flipped" : ""}">
        <div class="face front"><p class="q">${card.question}</p></div>
        <div class="face back">
          <p class="a">${card.answer}</p>
          ${card.hint ? '<p class="hint">' + card.hint + "</p>" : ""}
        </div>
      </div>
      ${actions}
      ${swipeHint}`;
  }
  root.innerHTML = `
    <div class="wrap">
      <header>
        <h1>📜 KPSS Tarih — SRS</h1>
        <label class="chapters">
          <span class="muted">Ünite:</span>
          <select id="chapter">
            <option value="all"${chapter === "all" ? " selected" : ""}>Tüm Bölümler</option>
            ${chaptersLabels}
          </select>
        </label>
      </header>
      <main>${body}</main>
    </div>`;
  const sel = $("#chapter");
  if (sel) sel.value = chapter;
}

// ---------- Swipe (Tinder-style) ----------
let drag = null;
function reviewWith(quality) {
  const review = queue[index];
  const outcome = calculateSM2(review, quality);
  progressMap.set(review.wordId, outcome);
  saveProgress();
  index++; flipped = false; render();
}
function endSwipe(card, dx, dy) {
  const W = window.innerWidth;
  const threshold = Math.min(110, W * 0.22);
  let quality = null;
  if (dx > threshold) quality = "easy";       // sağa = Kolay
  else if (dx < -threshold) quality = "hard"; // sola = Zor
  else if (dy < -threshold) quality = "medium"; // yukarı = Orta
  if (quality) {
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    card.style.transform =
      "translate(" + dx * 2.4 + "px," + (dy * 2.4 - 60) + "px) rotate(" + dx * 0.12 + "deg)";
    card.style.opacity = "0";
    setTimeout(reviewWith, 220, quality);
  } else {
    card.style.transition = "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
    card.style.transform = "";
    card.style.opacity = "";
  }
  drag = null;
}
$("#root").addEventListener("pointerdown", (e) => {
  if (loading || queue.length === 0 || index >= queue.length) return;
  const card = e.target.closest(".flashcard");
  if (!card) return;
  drag = { x: e.clientX, y: e.clientY, moved: false, card };
  card.style.transition = "none";
});
window.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (Math.abs(dx) > 8 || Math.abs(dy) > 8) drag.moved = true;
  if (!drag.moved) return;
  drag.card.style.transform =
    "translate(" + dx + "px," + dy + "px) rotate(" + dx * 0.07 + "deg)";
});
window.addEventListener("pointerup", (e) => {
  if (!drag) return;
  const card = drag.card;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (drag.moved) {
    endSwipe(card, dx, dy);
  } else {
    // tap = flip
    drag = null;
    flipped = !flipped;
    render();
  }
});

// ---------- Events (event delegation) ----------
$("#root").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "reload") { loadQueue(); return; }
  if (action === "review") {
    reviewWith(el.dataset.quality);
    return;
  }
});
$("#root").addEventListener("change", (e) => {
  if (e.target.id === "chapter") {
    chapter = e.target.value;
    loadQueue();
  }
});
window.addEventListener("keydown", (e) => {
  if (e.target.id === "chapter") return;
  if (["Arrow", "Enter"].includes(e.key) && queue.length) {
    if (!flipped) { flipped = true; render(); }
    else if (e.key === "Enter") {
      const review = queue[index];
      const outcome = calculateSM2(review, "medium");
      progressMap.set(review.wordId, outcome); saveProgress();
      index++; flipped = false; render();
    }
  }
});

// ---------- Boot ----------
loadProgress();
render();
loadQueue();
