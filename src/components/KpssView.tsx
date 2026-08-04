import { useState, useEffect } from "preact/hooks";
import {
  kpssService,
  kpssData,
  type KpssFlashcard,
} from "@/services/kpss/kpssService.js";
import { kpssSrsService } from "@/services/kpss/kpssSrsService.js";
import { kpssOsymHistoryFlashcards } from "@/domain/constants/kpssOsymHistoryFlashcards.js";
import { KpssDailyStats, Language } from "@/types/types.js";
import { useKpssQuiz } from "@/presentation/hooks/useKpssQuiz.js";
import type { KpssProgress } from "@/domain/services/KpssCalculatorService.js";
import { getTranslation } from "@/utils/i18n.js";
import {
  type ReviewQuality,
  type WordReviewData,
} from "@/domain/services/SrsService.js";
import {
  calculateKpssCountdown,
  calculateEstimatedCompletionTime,
  formatKpssCountdown,
  getSubjectNets as getSubjectNets_logic,
  getOverallNets as getOverallNets_logic,
} from "@/domain/services/KpssCalculatorService.js";

// Domain Constants & Quiz Service
import {
  SUBJECT_NAMES,
  subjectsList,
  KPSS_TARGET_DATE,
} from "@/domain/constants/kpssConstants.js";
import { KpssPastQuiz } from "@/services/kpss/kpssQuizService.js";

// Extracted Presentational Sub-components
import { KpssHeaderBar } from "@/components/kpss/topics/KpssHeaderBar.js";
import { KpssTopicDetailModal } from "@/components/kpss/topics/KpssTopicDetailModal.js";
import { KpssProgressSection } from "@/components/kpss/topics/KpssProgressSection.js";
import { KpssSrsTab } from "@/components/kpss/topics/KpssSrsTab.js";
import { KpssQuizModal } from "@/components/kpss/quiz/KpssQuizModal.js";
import { KpssPastExamsDashboard } from "@/components/kpss/exams/KpssPastExamsDashboard.js";
import { KpssNotesDashboard } from "@/components/kpss/wiki/KpssNotesDashboard.js";
import { TurkeyMapView } from "@/components/kpss/map/TurkeyMapView.js";
import { HistoryMapView } from "@/components/kpss/map/HistoryMapView.js";
import { logger } from "@/utils/logger.js";
import { useKpssChartSettings } from "@/presentation/hooks/useKpssChartSettings.js";

interface KpssViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
}

export function KpssView({
  lang,
  onShowConfirm,
  aiProvider,
  aiApiKey,
  aiModel,
  aiEndpoint,
  goalType,
  targetNet,
  targetScore,
}: KpssViewProps) {
  const t = getTranslation(lang);
  const labels = SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr;

  const [currentSubject, setCurrentSubject] = useState("turkce");
  const [kpssProgress, setKpssProgress] = useState<KpssProgress[]>([]);
  const [dailyStats, setDailyStats] = useState<KpssDailyStats[]>([]);

  // Input states
  const [questionsInput, setQuestionsInput] = useState("");
  const [videosInput, setVideosInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("turkce");

  const [activeTopic, setActiveTopic] = useState<{
    title: string;
    description: string;
    questionsCount?: number;
  } | null>(null);

  // Quiz state ve handler'lar useKpssQuiz hook'unda yaÅŸar (aÅŸaÄŸÄ±da, baÄŸÄ±mlÄ±lÄ±klardan sonra Ã§aÄŸrÄ±lÄ±r)

  // Countdown Banners States
  const [kpssTimeLeft, setKpssTimeLeft] = useState("");
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState("");
  const [remainingCount, setRemainingCount] = useState(0);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    "progress" | "notes" | "srs" | "past-exams" | "map"
  >("progress");

  // Map sub-tab: geography | history
  const [mapSubTab, setMapSubTab] = useState<"geography" | "history">(
    "geography",
  );

  // Sorting state for topic lists
  const [sortBy, setSortBy] = useState<"default" | "questions" | "status">(
    "default",
  );

  // KPSS Hedef ve Grafik Sistemleri
  const { chartType, chartDays, saveChartType, saveChartDays } =
    useKpssChartSettings();

  // KPSS SRS States
  const [srsLoading, setSrsLoading] = useState(true);
  const [srsQueue, setSrsQueue] = useState<WordReviewData[]>([]);
  const [srsIndex, setSrsIndex] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);
  const [srsFadeState, setSrsFadeState] = useState<"normal" | "slide-out">(
    "normal",
  );
  const [flashcardsUniverse, setFlashcardsUniverse] = useState<KpssFlashcard[]>(
    kpssOsymHistoryFlashcards,
  );
  const [srsChapter, setSrsChapter] = useState<string>("all");
  const [srsChapters, setSrsChapters] = useState<string[]>([]);

  const loadKpssSrsQueue = async (chapter: string = srsChapter) => {
    setSrsLoading(true);
    try {
      const res = await kpssSrsService.loadSrsQueue(chapter);
      setSrsQueue(res.queue);
      setFlashcardsUniverse(res.universe);
      setSrsChapters(res.chapters);
      setSrsIndex(0);
      setSrsLoading(false);
    } catch (e) {
      logger.error("Failed to load KPSS SRS Queue:", e);
      setSrsLoading(false);
    }
  };

  const handleKpssSrsReview = async (quality: ReviewQuality) => {
    const reviewData = srsQueue[srsIndex];
    if (!reviewData) {
      return;
    }

    await kpssSrsService.saveSrsReview(reviewData, quality);

    setSrsFadeState("slide-out");
    setTimeout(() => {
      setSrsIndex((prev) => prev + 1);
      setSrsFlipped(false);
      setSrsFadeState("normal");
    }, 400);
  };

  useEffect(() => {
    if (activeTab === "srs") {
      loadKpssSrsQueue();
    }
  }, [activeTab]);

  const loadKpssData = async () => {
    const progress = await kpssService.getKpssProgress();
    const stats = await kpssService.getKpssDailyStats();

    setKpssProgress(progress);
    setDailyStats(stats);
  };

  useEffect(() => {
    loadKpssData();
  }, []);

  useEffect(() => {
    loadKpssData();
  }, [currentSubject]);

  // Real-time Countdown timer intervals
  useEffect(() => {
    const totalCount = Object.values(kpssData).reduce(
      (acc, list) => acc + list.length,
      0,
    );
    const finishedCount = kpssProgress.filter((p) => p.status === 2).length;
    const remaining = totalCount - finishedCount;
    setRemainingCount(remaining);

    const updateCountdown = () => {
      const now = Date.now();
      const countdown = calculateKpssCountdown(KPSS_TARGET_DATE, now);
      setKpssTimeLeft(
        countdown
          ? formatKpssCountdown(countdown, t.kpss_time_format)
          : t.kpss_exam_started,
      );
      const estimated = calculateEstimatedCompletionTime(remaining, now);
      setEstimatedTimeLeft(
        estimated
          ? formatKpssCountdown(estimated, t.kpss_time_format)
          : t.kpss_completed,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [kpssProgress, lang]);

  const aiConfig = { aiProvider, aiModel, aiApiKey, aiEndpoint, lang };

  const quiz = useKpssQuiz({
    currentSubject: () => currentSubject,
    t,
    aiConfig,
    onQuizCompleted: loadKpssData,
    onLoadPastQuizzes: () =>
      kpssService.getPastQuizzes() as Promise<Record<string, KpssPastQuiz>>,
    onSubjectChange: setCurrentSubject,
    onCloseDetail: () => setActiveTopic(null),
  });

  const handleSaveStats = async () => {
    const questions = parseInt(questionsInput, 10) || 0;
    const videos = parseInt(videosInput, 10) || 0;
    if (questions > 0 || videos > 0) {
      await kpssService.saveKpssDailyStats(questions, videos, subjectInput);
      setQuestionsInput("");
      setVideosInput("");
      loadKpssData();
    }
  };

  const handleResetStats = () => {
    onShowConfirm(labels.reset_confirm, async () => {
      await kpssService.setKpssDailyStats([]);
      loadKpssData();
    });
  };

  const handleDeleteStat = async (date: string) => {
    await kpssService.deleteKpssDailyStat(date);
    loadKpssData();
  };

  const getSubjectNets = (subKey: string) => {
    return getSubjectNets_logic(subKey, kpssData, kpssProgress);
  };

  const getOverallNets = () => {
    return getOverallNets_logic(kpssData, kpssProgress);
  };

  const getSortedTopics = () => {
    const rawTopics = [...(kpssData[currentSubject] || [])];
    if (sortBy === "questions") {
      return rawTopics.sort((a, b) => b.questionsCount - a.questionsCount);
    }
    if (sortBy === "status") {
      return rawTopics.sort((a, b) => {
        const statusA =
          kpssProgress.find(
            (p) => p.subject === currentSubject && p.topic === a.title,
          )?.status || 0;
        const statusB =
          kpssProgress.find(
            (p) => p.subject === currentSubject && p.topic === b.title,
          )?.status || 0;
        return statusB - statusA;
      });
    }
    return rawTopics;
  };

  const topics = getSortedTopics();

  const overallNetObj = getOverallNets();
  const overallNet = overallNetObj.net;
  const maxNet = overallNetObj.max;
  const estimatedScore = Math.round((40 + overallNet * 0.5) * 10) / 10;

  return (
    <div id="kpss-view" className="view-content active">
      <div className="kpss-container">
        {/* Header & Sub-Tab Navigation */}
        <KpssHeaderBar
          title={t.kpss_header_title}
          activeTab={activeTab}
          lang={lang}
          t={t}
          onTabChange={setActiveTab}
        />

        {activeTab === "progress" ? (
          <KpssProgressSection
            lang={lang}
            t={t}
            labels={labels}
            kpssTimeLeft={kpssTimeLeft}
            estimatedTimeLeft={estimatedTimeLeft}
            remainingCount={remainingCount}
            kpssProgress={kpssProgress}
            dailyStats={dailyStats}
            questionsInput={questionsInput}
            videosInput={videosInput}
            subjectInput={subjectInput}
            chartDays={chartDays}
            chartType={chartType}
            sortBy={sortBy}
            goalType={goalType}
            targetNet={targetNet}
            targetScore={targetScore}
            currentSubject={currentSubject}
            subjectsList={subjectsList}
            kpssTargetDate={KPSS_TARGET_DATE}
            overallNet={overallNet}
            maxNet={maxNet}
            estimatedScore={estimatedScore}
            getSubjectNets={getSubjectNets}
            topics={topics}
            onQuestionsInputChange={setQuestionsInput}
            onVideosInputChange={setVideosInput}
            onSubjectInputChange={setSubjectInput}
            onSaveStats={handleSaveStats}
            onResetStats={handleResetStats}
            onDeleteStat={handleDeleteStat}
            onChartDaysChange={saveChartDays}
            onChartTypeChange={saveChartType}
            onSelectSubject={setCurrentSubject}
            onSortByChange={setSortBy}
            onStartQuiz={(topic, subject) =>
              quiz.handleStartQuiz(topic, subject)
            }
            onReviewPastQuiz={(topic) => quiz.handleReviewPastQuiz(topic)}
            onShowDetail={(topic) => setActiveTopic(topic)}
            onOpenYoutube={(topic) =>
              window.open(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(
                  topic + " KPSS",
                )}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          />
        ) : activeTab === "notes" ? (
          <KpssNotesDashboard lang={lang} t={t} />
        ) : activeTab === "srs" ? (
          <KpssSrsTab
            t={t}
            srsLoading={srsLoading}
            srsQueue={srsQueue}
            srsIndex={srsIndex}
            srsFlipped={srsFlipped}
            srsFadeState={srsFadeState}
            flashcardsUniverse={flashcardsUniverse}
            srsChapter={srsChapter}
            srsChapters={srsChapters}
            onChapterChange={(ch) => {
              setSrsChapter(ch);
              loadKpssSrsQueue(ch);
            }}
            onFlipChange={(flipped) => setSrsFlipped(flipped)}
            onReviewQuality={handleKpssSrsReview}
            onReloadQueue={() => loadKpssSrsQueue(srsChapter)}
          />
        ) : activeTab === "map" ? (
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setMapSubTab("geography")}
                style={{
                  background:
                    mapSubTab === "geography"
                      ? "rgba(181,67,47,0.2)"
                      : "rgba(255,255,255,0.04)",
                  border:
                    mapSubTab === "geography"
                      ? "1px solid #b5432f"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: mapSubTab === "geography" ? "#ffe4da" : "#d9d2bf",
                  padding: "9px 18px",
                  borderRadius: "9px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {t.kpss_map_subtab_geography || "Coğrafya"}
              </button>
              <button
                type="button"
                onClick={() => setMapSubTab("history")}
                style={{
                  background:
                    mapSubTab === "history"
                      ? "rgba(181,67,47,0.2)"
                      : "rgba(255,255,255,0.04)",
                  border:
                    mapSubTab === "history"
                      ? "1px solid #b5432f"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: mapSubTab === "history" ? "#ffe4da" : "#d9d2bf",
                  padding: "9px 18px",
                  borderRadius: "9px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {t.kpss_map_subtab_history || "Tarih"}
              </button>
            </div>
            {mapSubTab === "geography" ? (
              <TurkeyMapView t={t} />
            ) : (
              <HistoryMapView t={t} />
            )}
          </div>
        ) : (
          <KpssPastExamsDashboard
            t={t}
            onStartPastExam={quiz.handleStartPastExam}
          />
        )}
      </div>

      {activeTopic && (
        <KpssTopicDetailModal
          topic={activeTopic}
          detailsTitle={labels.details_title}
          onClose={() => setActiveTopic(null)}
        />
      )}

      <KpssQuizModal
        lang={lang}
        t={t}
        currentSubject={currentSubject}
        activeQuizTopic={quiz.activeQuizTopic}
        quizStep={quiz.quizStep}
        selectedQuizCount={quiz.selectedQuizCount}
        quizLoading={quiz.quizLoading}
        isBackgroundLoading={quiz.isBackgroundLoading}
        quizQuestions={quiz.quizQuestions}
        currentQuestionIndex={quiz.currentQuestionIndex}
        selectedAnswers={quiz.selectedAnswers}
        quizResultScore={quiz.quizResultScore}
        quizError={quiz.quizError}
        cumulative={quiz.cumulative}
        aiApiKey={aiApiKey}
        aiEndpoint={aiEndpoint}
        pastQuizzes={quiz.pastQuizzes}
        onClose={() => {
          quiz.setActiveQuizTopic(null);
          quiz.setQuizStep("intro");
          quiz.setQuizLoading(false);
          quiz.setQuizQuestions([]);
          quiz.setSelectedAnswers([]);
          quiz.setQuizError(null);
        }}
        onSetSelectedQuizCount={quiz.setSelectedQuizCount}
        onStartQuiz={() =>
          quiz.fetchQuizFromAI(
            currentSubject,
            quiz.activeQuizTopic!,
            quiz.selectedQuizCount,
          )
        }
        onSelectAnswer={(oIdx) => {
          const nextAnswers = [...quiz.selectedAnswers];
          nextAnswers[quiz.currentQuestionIndex] = oIdx;
          quiz.setSelectedAnswers(nextAnswers);
        }}
        onPreviousQuestion={() =>
          quiz.setCurrentQuestionIndex(quiz.currentQuestionIndex - 1)
        }
        onNextQuestion={() =>
          quiz.setCurrentQuestionIndex(quiz.currentQuestionIndex + 1)
        }
        onFinishQuiz={quiz.handleFinishQuiz}
        onRetakeQuiz={() => quiz.setQuizStep("intro")}
        onSaveExternalResult={(correct, total) =>
          quiz.handleSaveExternalResult(correct, total)
        }
        onReviewPastQuiz={(topic) => quiz.handleReviewPastQuiz(topic)}
        subjectNames={SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr}
      />
    </div>
  );
}
