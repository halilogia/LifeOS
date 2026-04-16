import { storage } from "./storage.js";
import { calculateSM2, prepareSRSQueue, SRSWordWithInfo, createInitialSRSWord } from "./logic/srs.js";
import { getAllWords } from "./services/vocabularyService.js";
import { Word, WordReviewData, ReviewQuality } from "./types/word.js";

let wordsData: Word[] = [];
let currentQueue: WordReviewData[] = [];
let currentWordIndex = 0;
let isFlipped = false;

export async function initSrs() {
  const content = document.getElementById("srs-content");
  if (!content) return;
  
  content.innerHTML = `<div style="text-align:center; padding: 2rem;">Kelime havuzu hazırlanıyor...</div>`;

  try {
    wordsData = await getAllWords();
    const progress = await storage.getSrsProgress();

    const progressMap = new Map<string, WordReviewData>();
    progress.forEach(p => progressMap.set(p.wordId, p));

    // Limit universe to load fast initially (first 1500 words for instance, sorted by frequency if they are)
    const srsUniverse: SRSWordWithInfo[] = wordsData.slice(0, 1500).map(w => {
      const p = progressMap.get(w.id) || createInitialSRSWord(w.id, 'vocabulary');
      return {
        ...p,
        level: w.level || 'unknown',
        listType: 'all',
        freq: w.freq || 0
      };
    });

    const enrichedProgress: SRSWordWithInfo[] = progress.map(p => {
      const wInfo = wordsData.find(w => w.id === p.wordId);
      return {
        ...p,
        level: wInfo?.level || 'unknown',
        listType: 'all',
        freq: wInfo?.freq || 0
      };
    });

    currentQueue = prepareSRSQueue(enrichedProgress, {
      dailyGoal: 10,
      isCustomMode: false,
      filters: { listType: 'all', levels: [] },
      universe: srsUniverse,
    });

    currentWordIndex = 0;
    renderFlashcard();
  } catch (e) {
    content.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--danger);">Hata oluştu.</div>`;
    console.error(e);
  }
}

function renderFlashcard() {
    const content = document.getElementById("srs-content");
    if (!content) return;

    if (currentQueue.length === 0 || currentWordIndex >= currentQueue.length) {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--success);">Tebrikler!</h3>
                <p style="color: var(--text-secondary);">Bugünkü tekrarlarınızı bitirdiniz.</p>
            </div>
        `;
        return;
    }

    const reviewData = currentQueue[currentWordIndex];
    const wordInfo = wordsData.find(w => w.id === reviewData.wordId);

    if (!wordInfo) {
        currentWordIndex++;
        renderFlashcard();
        return;
    }

    isFlipped = false;

    // Use definition[0] if no explicit meaning field.
    const meaning = wordInfo.meaning || (wordInfo.categories && wordInfo.categories.length > 0 ? wordInfo.categories[0].translations.join(', ') : '') || wordInfo.definitions?.[0] || 'Tanım bulunamadı';

    content.innerHTML = `
        <div class="flashcard-container" style="
            perspective: 1000px;
            width: 100%;
            max-width: 500px;
            margin: 2rem auto;
            min-height: 280px;
        ">
            <div id="flashcard-inner" style="
                position: relative;
                width: 100%;
                height: 100%;
                text-align: center;
                transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                transform-style: preserve-3d;
                cursor: pointer;
            ">
                <!-- Front -->
                <div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--card-border);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                ">
                    <h1 style="font-size: 3rem; margin-bottom: 0.5rem; color: var(--text-primary); letter-spacing: -1px;">${wordInfo.word}</h1>
                    <p style="color: var(--text-secondary); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 2px;">Seviye: ${wordInfo.level || '-'}</p>
                    <p style="margin-top: 3rem; color: var(--accent-color); font-size: 0.85rem; opacity: 0.7; font-weight: 500;">Çevirmek için tıklayın</p>
                </div>

                <!-- Back -->
                <div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(15, 15, 20, 0.95));
                    border: 1px solid var(--accent-color);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    transform: rotateY(180deg);
                    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
                ">
                    <h2 style="font-size: 1.75rem; margin-bottom: 1rem; color: var(--text-primary);">${meaning}</h2>
                    ${wordInfo.examples && wordInfo.examples.length > 0 ? `<p style="color: var(--text-secondary); font-style: italic; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem;">"${wordInfo.examples[0]}"</p>` : ''}
                    
                    <div id="srs-actions" style="display: flex; gap: 1rem; margin-top: 1rem; opacity: 0; transition: opacity 0.4s ease 0.2s; pointer-events: none;">
                        <button class="srs-btn srs-hard" data-quality="hard" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px 24px; border-radius: 12px; cursor: pointer; font-weight: 500; transition: all 0.2s;">Zor</button>
                        <button class="srs-btn srs-medium" data-quality="medium" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 10px 24px; border-radius: 12px; cursor: pointer; font-weight: 500; transition: all 0.2s;">Orta</button>
                        <button class="srs-btn srs-easy" data-quality="easy" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 10px 24px; border-radius: 12px; cursor: pointer; font-weight: 500; transition: all 0.2s;">Kolay</button>
                    </div>
                </div>
            </div>
        </div>
        <div style="text-align: center; color: var(--text-secondary); margin-top: 1.5rem; font-size: 0.9rem; font-weight: 500; letter-spacing: 1px;">
            İLERLEME: ${currentWordIndex + 1} / ${currentQueue.length}
        </div>
    `;

    const cardInner = document.getElementById("flashcard-inner");
    if (cardInner) {
        cardInner.addEventListener("click", (e) => {
            // Prevent flipping if clicked on buttons
            if ((e.target as HTMLElement).closest('.srs-btn')) return;
            
            if (!isFlipped) {
                isFlipped = true;
                cardInner.style.transform = "rotateY(180deg)";
                const actions = document.getElementById("srs-actions");
                if (actions) {
                    actions.style.opacity = "1";
                    actions.style.pointerEvents = "auto";
                }
            }
        });
    }

    const actionBtns = document.querySelectorAll(".srs-btn");
    actionBtns.forEach(btn => {
        btn.addEventListener("mouseover", (e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
        });
        btn.addEventListener("mouseout", (e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        });
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const quality = (e.currentTarget as HTMLButtonElement).dataset.quality as ReviewQuality;
            await handleReview(quality);
        });
    });
}

async function handleReview(quality: ReviewQuality) {
    const reviewData = currentQueue[currentWordIndex];
    const outcome = calculateSM2(reviewData, quality, new Date());
    
    const progress = await storage.getSrsProgress();
    const index = progress.findIndex(p => p.wordId === outcome.wordId);
    if (index >= 0) {
        progress[index] = outcome;
    } else {
        progress.push(outcome);
    }
    await storage.setSrsProgress(progress);

    currentWordIndex++;
    
    const cardInner = document.getElementById("flashcard-inner");
    if (cardInner) {
        cardInner.style.transform = "translateX(-50px) rotateY(180deg) scale(0.9)";
        cardInner.style.opacity = "0";
        setTimeout(renderFlashcard, 300);
    } else {
        renderFlashcard();
    }
}
