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
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', animation: 'pulse 1.5s infinite' }}>
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
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
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
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--success)', fontWeight: 700 }}>
              {lang === 'tr' ? 'Harika İş!' : 'Great Job!'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {lang === 'tr' ? 'Bugünkü tüm kelime tekrarlarını tamamladın.' : "You've finished all your vocabulary reviews for today."}
            </p>
            <button
              onClick={loadSrsQueue}
              style={{ marginTop: '2rem', background: 'var(--accent-color)', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, transition: 'transform 0.2s' }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {lang === 'tr' ? 'Aralıklı Tekrar' : 'Spaced Repetition'}
            </h2>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>
              {currentWordIndex + 1} / {currentQueue.length}
            </div>
          </div>

          <div
            className="flashcard-container"
            style={{
              perspective: '1200px',
              width: '100%',
              height: '380px',
              marginBottom: '2rem',
            }}
          >
            <div
              id="flashcard-inner"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease, filter 0.4s ease',
                transformStyle: 'preserve-3d',
                cursor: 'pointer',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                opacity: fadeState === 'slide-out' ? 0 : 1,
                filter: fadeState === 'slide-out' ? 'blur(5px)' : 'none',
              }}
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              {/* Front Side */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
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
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(15, 23, 42, 0.95))',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem',
                  transform: 'rotateY(180deg)',
                  boxShadow: '0 25px 50px rgba(139, 92, 246, 0.15)',
                  backdropFilter: 'blur(15px)',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
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
                  style={{
                    display: 'flex',
                    gap: '0.8rem',
                    marginTop: '1rem',
                    opacity: isFlipped ? 1 : 0,
                    transform: isFlipped ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.4s ease 0.3s',
                    pointerEvents: isFlipped ? 'auto' : 'none',
                  }}
                >
                  <button
                    className="srs-btn"
                    style={{ background: '#ef4444', color: 'white' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('hard');
                    }}
                  >
                    {lang === 'tr' ? 'Zor' : 'Hard'}
                  </button>
                  <button
                    className="srs-btn"
                    style={{ background: '#f59e0b', color: 'white' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('medium');
                    }}
                  >
                    {lang === 'tr' ? 'Orta' : 'Medium'}
                  </button>
                  <button
                    className="srs-btn"
                    style={{ background: '#10b981', color: 'white' }}
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

      <style>{`
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
      `}</style>
    </div>
  );
}
