import { useState, useEffect } from "preact/hooks";
import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
  type WordReviewData,
  type ReviewQuality,
} from "@/domain/services/SrsService.js";
import { getAllWords } from "@/services/vocabularyService.js";
import { Word } from "@/types/word.js";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { logger } from "@/utils/logger.js";

interface SrsViewProps {
  lang: Language;
}

export function SrsView({ lang }: SrsViewProps) {
  const t = getTranslation(lang);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wordsData, setWordsData] = useState<Word[]>([]);
  const [currentQueue, setCurrentQueue] = useState<WordReviewData[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fadeState, setFadeState] = useState<"normal" | "slide-out">("normal");

  useEffect(() => {
    loadSrsQueue();
  }, []);

  const loadSrsQueue = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAllWords();
      setWordsData(data);
      const progress: any[] = await new Promise((resolve) =>
        chrome.storage.sync.get(["srsProgress"], (res) =>
          resolve((res.srsProgress as any[]) || []),
        ),
      );

      const progressMap = new Map<string, WordReviewData>();
      progress.forEach((p) => progressMap.set(p.wordId, p));

      const srsUniverse: SRSWordWithInfo[] = data.slice(0, 1500).map((w) => {
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
        const wInfo = data.find((w) => w.id === p.wordId);
        return {
          ...p,
          level: wInfo?.level || "unknown",
          listType: "all",
          freq: wInfo?.freq || 0,
        };
      });

      const queue = prepareSRSQueue(enrichedProgress, {
        dailyGoal: 10,
        isCustomMode: false,
        filters: { listType: "all", levels: [] },
        universe: srsUniverse,
      });

      setCurrentQueue(queue);
      setCurrentWordIndex(0);
      setLoading(false);
    } catch (e) {
      logger.error(e);
      setError(true);
      setLoading(false);
    }
  };

  const handleReview = async (quality: ReviewQuality) => {
    const reviewData = currentQueue[currentWordIndex];
    if (!reviewData) {
      return;
    }

    const outcome = calculateSM2(reviewData, quality, new Date());

    const progress: any[] = await new Promise((resolve) =>
      chrome.storage.sync.get(["srsProgress"], (res) =>
        resolve((res.srsProgress as any[]) || []),
      ),
    );

    const idx = progress.findIndex((p: any) => p.wordId === outcome.wordId);
    if (idx >= 0) {
      progress[idx] = outcome;
    } else {
      progress.push(outcome);
    }
    await new Promise<void>((resolve) =>
      chrome.storage.sync.set({ srsProgress: progress }, resolve),
    );
    setFadeState("slide-out");
    setTimeout(() => {
      setCurrentWordIndex((prev) => prev + 1);
      setIsFlipped(false);
      setFadeState("normal");
    }, 400);
  };

  if (loading) {
    return (
      <div id="srs-view" className="view-content active">
        <div className="srs-container">
          <div className="srs-preparing">{t.srs_preparing}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="srs-view" className="view-content active">
        <div className="srs-container">
          <div className="srs-error">{t.srs_error_loading}</div>
        </div>
      </div>
    );
  }

  const isQueueEmpty =
    currentQueue.length === 0 || currentWordIndex >= currentQueue.length;

  if (isQueueEmpty) {
    return (
      <div id="srs-view" className="view-content active">
        <div className="srs-container">
          <div className="srs-finished">
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h3
              style={{
                fontSize: "1.8rem",
                marginBottom: "0.5rem",
                color: "var(--success)",
                fontWeight: 700,
              }}
            >
              {t.srs_great_job}
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              {t.srs_finished_message}
            </p>
            <button onClick={loadSrsQueue} className="srs-restart-btn">
              {t.srs_restart}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reviewData = currentQueue[currentWordIndex];
  const wordInfo = wordsData.find((w) => w.id === reviewData.wordId);

  if (!wordInfo) {
    // Skip words with missing details
    setTimeout(() => setCurrentWordIndex((prev) => prev + 1), 0);
    return null;
  }

  const meaning =
    wordInfo.meaning ||
    (wordInfo.categories && wordInfo.categories.length > 0
      ? wordInfo.categories[0].translations.join(", ")
      : "") ||
    wordInfo.definitions?.[0] ||
    t.srs_def_missing;

  const wordFontSize =
    wordInfo.word.length > 15
      ? "2.2rem"
      : wordInfo.word.length > 10
        ? "2.6rem"
        : "3.2rem";
  const meaningFontSize =
    meaning.length > 50 ? "1.1rem" : meaning.length > 30 ? "1.3rem" : "1.6rem";

  return (
    <div id="srs-view" className="view-content active">
      <div className="srs-container">
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="srs-header">
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {t.srs_spaced_repetition}
            </h2>
            <div className="srs-progress">
              {currentWordIndex + 1} / {currentQueue.length}
            </div>
          </div>

          <div className="flashcard-container">
            <div
              id="flashcard-inner"
              className={`flashcard-inner ${isFlipped ? "flipped" : ""} ${fadeState === "slide-out" ? "fade-out" : ""}`}
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              {/* Front Side */}
              <div className="flashcard-side flashcard-front">
                <div
                  style={{
                    position: "absolute",
                    top: "2rem",
                    right: "2rem",
                    fontSize: "0.8rem",
                    background: "rgba(255,255,255,0.1)",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    color: "var(--accent-light)",
                  }}
                >
                  {wordInfo.level || "General"}
                </div>
                <h1
                  style={{
                    fontSize: wordFontSize,
                    marginBottom: "1rem",
                    color: "var(--text-primary)",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {wordInfo.word}
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    opacity: 0.6,
                    marginTop: "2rem",
                  }}
                >
                  {t.srs_click_to_see}
                </p>
              </div>

              {/* Back Side */}
              <div className="flashcard-side flashcard-back">
                <div
                  style={{
                    width: "100%",
                    overflowY: "auto",
                    maxHeight: "250px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize: meaningFontSize,
                      marginBottom: "1.5rem",
                      color: "#fff",
                      fontWeight: 600,
                      lineHeight: 1.4,
                      maxWidth: "90%",
                    }}
                  >
                    {meaning}
                  </h2>
                  {wordInfo.examples && wordInfo.examples.length > 0 && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "1rem 1.5rem",
                        borderRadius: "16px",
                        marginBottom: "1.5rem",
                        width: "100%",
                      }}
                    >
                      <p
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontStyle: "italic",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        "{wordInfo.examples[0]}"
                      </p>
                    </div>
                  )}
                </div>

                <div
                  id="srs-actions"
                  className="srs-actions"
                  style={{
                    opacity: isFlipped ? 1 : 0,
                    transform: isFlipped ? "translateY(0)" : "translateY(10px)",
                    pointerEvents: isFlipped ? "auto" : "none",
                  }}
                >
                  <button
                    className="srs-btn srs-btn-hard"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview("hard");
                    }}
                  >
                    {t.srs_hard}
                  </button>
                  <button
                    className="srs-btn srs-btn-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview("medium");
                    }}
                  >
                    {t.srs_medium}
                  </button>
                  <button
                    className="srs-btn srs-btn-easy"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview("easy");
                    }}
                  >
                    {t.srs_easy}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
