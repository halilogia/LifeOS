import { useState, useEffect } from 'preact/hooks';
import { storage } from '../core/storage.js';
import { calculateSM2, prepareSRSQueue, createInitialSRSWord, SRSWordWithInfo } from '../logic/srs.js';
import { getAllWords } from '../services/vocabularyService.js';
import { Word, WordReviewData, ReviewQuality } from '../types/word.js';
import { Language } from '../types/types.js';

interface SrsViewProps {
  lang: Language;
}

export function SrsView({ lang }: SrsViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wordsData, setWordsData] = useState<Word[]>([]);
  const [currentQueue, setCurrentQueue] = useState<WordReviewData[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fadeState, setFadeState] = useState<'normal' | 'slide-out'>('normal');

  useEffect(() => {
    loadSrsQueue();
  }, []);

  const loadSrsQueue = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAllWords();
      setWordsData(data);
      const progress = await storage.getSrsProgress();

      const progressMap = new Map<string, WordReviewData>();
      progress.forEach((p) => progressMap.set(p.wordId, p));

      const srsUniverse: SRSWordWithInfo[] = data.slice(0, 1500).map((w) => {
        const p = progressMap.get(w.id) || createInitialSRSWord(w.id, 'vocabulary');
        return {
          ...p,
          level: w.level || 'unknown',
          listType: 'all',
          freq: w.freq || 0,
        };
      });

      const enrichedProgress: SRSWordWithInfo[] = progress.map((p) => {
        const wInfo = data.find((w) => w.id === p.wordId);
        return {
          ...p,
          level: wInfo?.level || 'unknown',
          listType: 'all',
          freq: wInfo?.freq || 0,
        };
      });

      const queue = prepareSRSQueue(enrichedProgress, {
        dailyGoal: 10,
        isCustomMode: false,
        filters: { listType: 'all', levels: [] },
        universe: srsUniverse,
      });

      setCurrentQueue(queue);
      setCurrentWordIndex(0);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(true);
      setLoading(false);
    }
  };

  const handleReview = async (quality: ReviewQuality) => {
    const reviewData = currentQueue[currentWordIndex];
    if (!reviewData) return;

    const outcome = calculateSM2(reviewData, quality, new Date());

    const progress = await storage.getSrsProgress();
    const idx = progress.findIndex((p) => p.wordId === outcome.wordId);
    if (idx >= 0) {
      progress[idx] = outcome;
    } else {
      progress.push(outcome);
    }
    await storage.setSrsProgress(progress);

    // Run fade transition
    setFadeState('slide-out');
    setTimeout(() => {
      setCurrentWordIndex((prev) => prev + 1);
      setIsFlipped(false);
      setFadeState('normal');
    }, 400);
  };

  if (loading) {
    return (
      <div id="srs-view" className="view-content active">
        <div className="srs-container">
          <div className="srs-preparing">
            {lang === 'tr' ? 'Kelime havuzu hazırlanıyor...' : 'Preparing vocabulary pool...'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="srs-view" className="view-content active">
        <div className="srs-container">
          <div className="srs-error">
            {lang === 'tr' ? 'Kelime havuzu yüklenirken bir hata oluştu.' : 'An error occurred while loading the vocabulary pool.'}
          </div>
        </div>
      </div>
    );
  }

  const isQueueEmpty = currentQueue.length === 0 || currentWordIndex >= currentQueue.length;

  if (isQueueEmpty) {
    return (
      <div id="srs-view" className="view-content active">
        <div className="srs-container">
          <div className="srs-finished">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--success)', fontWeight: 700 }}>
              {lang === 'tr' ? 'Harika İş!' : 'Great Job!'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {lang === 'tr' ? 'Bugünkü tüm kelime tekrarlarını tamamladın.' : "You've finished all your vocabulary reviews for today."}
            </p>
            <button
              onClick={loadSrsQueue}
              className="srs-restart-btn"
            >
              {lang === 'tr' ? 'Yeniden Başla' : 'Restart'}
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
    (wordInfo.categories && wordInfo.categories.length > 0 ? wordInfo.categories[0].translations.join(', ') : '') ||
    wordInfo.definitions?.[0] ||
    (lang === 'tr' ? 'Tanım bulunamadı' : 'Definition not found');

  const wordFontSize = wordInfo.word.length > 15 ? '2.2rem' : wordInfo.word.length > 10 ? '2.6rem' : '3.2rem';
  const meaningFontSize = meaning.length > 50 ? '1.1rem' : meaning.length > 30 ? '1.3rem' : '1.6rem';

  return (
    <div id="srs-view" className="view-content active">
      <div className="srs-container">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="srs-header">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {lang === 'tr' ? 'Aralıklı Tekrar' : 'Spaced Repetition'}
            </h2>
            <div className="srs-progress">
              {currentWordIndex + 1} / {currentQueue.length}
            </div>
          </div>

          <div className="flashcard-container">
            <div
              id="flashcard-inner"
              className={`flashcard-inner ${isFlipped ? 'flipped' : ''} ${fadeState === 'slide-out' ? 'fade-out' : ''}`}
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              {/* Front Side */}
              <div className="flashcard-side flashcard-front">
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '8px', color: 'var(--accent-light)' }}>
                  {wordInfo.level || 'General'}
                </div>
                <h1 style={{ fontSize: wordFontSize, marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  {wordInfo.word}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', opacity: 0.6, marginTop: '2rem' }}>
                  {lang === 'tr' ? 'Anlamını görmek için tıklayın' : 'Click to see translation'}
                </p>
              </div>

              {/* Back Side */}
              <div className="flashcard-side flashcard-back">
                <div style={{ width: '100%', overflowY: 'auto', maxHeight: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <h2 style={{ fontSize: meaningFontSize, marginBottom: '1.5rem', color: '#fff', fontWeight: 600, lineHeight: 1.4, maxWidth: '90%' }}>
                    {meaning}
                  </h2>
                  {wordInfo.examples && wordInfo.examples.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', width: '100%' }}>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
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
                    transform: isFlipped ? 'translateY(0)' : 'translateY(10px)',
                    pointerEvents: isFlipped ? 'auto' : 'none',
                  }}
                >
                  <button
                    className="srs-btn srs-btn-hard"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('hard');
                    }}
                  >
                    {lang === 'tr' ? 'Zor' : 'Hard'}
                  </button>
                  <button
                    className="srs-btn srs-btn-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('medium');
                    }}
                  >
                    {lang === 'tr' ? 'Orta' : 'Medium'}
                  </button>
                  <button
                    className="srs-btn srs-btn-easy"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('easy');
                    }}
                  >
                    {lang === 'tr' ? 'Kolay' : 'Easy'}
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
