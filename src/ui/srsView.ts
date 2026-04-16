import { storage } from "../core/storage.js";
import {
  calculateSM2,
  prepareSRSQueue,
  SRSWordWithInfo,
  createInitialSRSWord,
} from "../logic/srs.js";
import { getAllWords } from "../services/vocabularyService.js";
import { Word, WordReviewData, ReviewQuality } from "../types/word.js";

let wordsData: Word[] = [];
let currentQueue: WordReviewData[] = [];
let currentWordIndex = 0;
let isFlipped = false;

export async function initSrs() {
  const content = document.getElementById("srs-content");
  if (!content) {
    return;
  }

  content.innerHTML = `<div style="text-align:center; padding: 4rem; color: var(--text-secondary); animation: pulse 1.5s infinite;">Kelime havuzu hazırlanıyor...</div>`;

  try {
    wordsData = await getAllWords();
    const progress = await storage.getSrsProgress();

    const progressMap = new Map<string, WordReviewData>();
    progress.forEach((p) => progressMap.set(p.wordId, p));

    const srsUniverse: SRSWordWithInfo[] = wordsData.slice(0, 1500).map((w) => {
      const p =
        progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
      return {
        ...p,
        level: w.level || "unknown",
        listType: "all",
        freq: w.freq || 0,
      };
    });

    const enrichedProgress: SRSWordWithInfo[] = progress.map((p) => {
      const wInfo = wordsData.find((w) => w.id === p.wordId);
      return {
        ...p,
        level: wInfo?.level || "unknown",
        listType: "all",
        freq: wInfo?.freq || 0,
      };
    });

    currentQueue = prepareSRSQueue(enrichedProgress, {
      dailyGoal: 10,
      isCustomMode: false,
      filters: { listType: "all", levels: [] },
      universe: srsUniverse,
    });

    currentWordIndex = 0;
    renderFlashcard();
  } catch (e) {
    content.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--danger);">Kelime havuzu yüklenirken bir hata oluştu.</div>`;
    console.error(e);
  }
}

function renderFlashcard() {
  const content = document.getElementById("srs-content");
  if (!content) {
    return;
  }

  if (currentQueue.length === 0 || currentWordIndex >= currentQueue.length) {
    content.innerHTML = `
            <div style="text-align: center; padding: 5rem 2rem; background: rgba(255,255,255,0.03); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h3 style="font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--success); font-weight: 700;">Harika İş!</h3>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">Bugünkü tüm kelime tekrarlarını tamamladın.</p>
                <button onclick="location.reload()" style="margin-top: 2rem; background: var(--accent-color); color: white; border: none; padding: 12px 30px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: transform 0.2s;">Yeniden Başla</button>
            </div>
        `;
    return;
  }

  const reviewData = currentQueue[currentWordIndex];
  const wordInfo = wordsData.find((w) => w.id === reviewData.wordId);

  if (!wordInfo) {
    currentWordIndex++;
    renderFlashcard();
    return;
  }

  isFlipped = false;

  const meaning =
    wordInfo.meaning ||
    (wordInfo.categories && wordInfo.categories.length > 0
      ? wordInfo.categories[0].translations.join(", ")
      : "") ||
    wordInfo.definitions?.[0] ||
    "Tanım bulunamadı";

  // Auto-font-size for word
  const wordFontSize =
    wordInfo.word.length > 15
      ? "2.2rem"
      : wordInfo.word.length > 10
        ? "2.6rem"
        : "3.2rem";
  // Auto-font-size for meaning
  const meaningFontSize =
    meaning.length > 50 ? "1.1rem" : meaning.length > 30 ? "1.3rem" : "1.6rem";

  content.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 0 1rem;">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">Aralıklı Tekrar</h2>
                <div style="background: rgba(255,255,255,0.08); padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; letter-spacing: 1px;">
                    ${currentWordIndex + 1} / ${currentQueue.length}
                </div>
            </div>

            <div class="flashcard-container" style="
                perspective: 1200px;
                width: 100%;
                height: 380px;
                margin-bottom: 2rem;
            ">
                <div id="flashcard-inner" style="
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
                    transform-style: preserve-3d;
                    cursor: pointer;
                ">
                    <!-- Front Side -->
                    <div style="
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        backface-visibility: hidden;
                        background: rgba(255, 255, 255, 0.04);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 32px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 3rem;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                        backdrop-filter: blur(10px);
                    ">
                        <div style="position: absolute; top: 2rem; right: 2rem; font-size: 0.8rem; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 8px; color: var(--accent-light);">
                            ${wordInfo.level || "General"}
                        </div>
                        <h1 style="font-size: ${wordFontSize}; margin-bottom: 1rem; color: var(--text-primary); font-weight: 800; letter-spacing: -0.5px;">${wordInfo.word}</h1>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; opacity: 0.6; margin-top: 2rem;">Anlamını görmek için tıklayın</p>
                    </div>

                    <!-- Back Side -->
                    <div style="
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        backface-visibility: hidden;
                        background: linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(15, 23, 42, 0.95));
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        border-radius: 32px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 2.5rem;
                        transform: rotateY(180deg);
                        box-shadow: 0 25px 50px rgba(139, 92, 246, 0.15);
                        backdrop-filter: blur(15px);
                    ">
                        <div style="width: 100%; overflow-y: auto; max-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                             <h2 style="font-size: ${meaningFontSize}; margin-bottom: 1.5rem; color: #fff; font-weight: 600; line-height: 1.4; max-width: 90%;">
                                ${meaning}
                             </h2>
                             ${
                               wordInfo.examples && wordInfo.examples.length > 0
                                 ? `
                                <div style="background: rgba(255,255,255,0.05); padding: 1rem 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; width: 100%;">
                                    <p style="color: rgba(255,255,255,0.7); font-style: italic; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                                        "${wordInfo.examples[0]}"
                                    </p>
                                </div>
                             `
                                 : ""
                             }
                        </div>
                        
                        <div id="srs-actions" style="display: flex; gap: 0.8rem; margin-top: 1rem; opacity: 0; transform: translateY(10px); transition: all 0.4s ease 0.3s; pointer-events: none;">
                            <button class="srs-btn" data-quality="hard" style="background: #ef4444; color: white;">Zor</button>
                            <button class="srs-btn" data-quality="medium" style="background: #f59e0b; color: white;">Orta</button>
                            <button class="srs-btn" data-quality="easy" style="background: #10b981; color: white;">Kolay</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .srs-btn {
                    padding: 12px 28px;
                    border-radius: 14px;
                    border: none;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.95rem;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .srs-btn:hover {
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
                }
                .srs-btn:active {
                    transform: translateY(0) scale(0.95);
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
            </style>
        </div>
    `;

  const cardInner = document.getElementById("flashcard-inner");
  if (cardInner) {
    cardInner.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".srs-btn")) {
        return;
      }

      isFlipped = !isFlipped;
      cardInner.style.transform = isFlipped
        ? "rotateY(180deg)"
        : "rotateY(0deg)";

      const actions = document.getElementById("srs-actions");
      if (actions) {
        if (isFlipped) {
          actions.style.opacity = "1";
          actions.style.transform = "translateY(0)";
          actions.style.pointerEvents = "auto";
        } else {
          actions.style.opacity = "0";
          actions.style.transform = "translateY(10px)";
          actions.style.pointerEvents = "none";
        }
      }
    });
  }

  const actionBtns = document.querySelectorAll(".srs-btn");
  actionBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const quality = (e.currentTarget as HTMLButtonElement).dataset
        .quality as ReviewQuality;
      await handleReview(quality);
    });
  });
}

async function handleReview(quality: ReviewQuality) {
  const reviewData = currentQueue[currentWordIndex];
  if (!reviewData) {
    return;
  }

  const outcome = calculateSM2(reviewData, quality, new Date());

  const progress = await storage.getSrsProgress();
  const index = progress.findIndex((p) => p.wordId === outcome.wordId);
  if (index >= 0) {
    progress[index] = outcome;
  } else {
    progress.push(outcome);
  }
  await storage.setSrsProgress(progress);

  currentWordIndex++;

  const cardInner = document.getElementById("flashcard-inner");
  if (cardInner) {
    cardInner.style.transform = "translateX(-80px) rotateY(180deg) scale(0.85)";
    cardInner.style.opacity = "0";
    setTimeout(renderFlashcard, 400);
  } else {
    renderFlashcard();
  }
}
