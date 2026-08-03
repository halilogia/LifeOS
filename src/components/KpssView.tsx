import { useState, useEffect } from "preact/hooks";
import {
  kpssService,
  kpssData,
  kpssDummyFlashcards,
} from "@/services/kpss/kpssService.js";
import { kpssSrsService } from "@/services/kpss/kpssSrsService.js";
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
import { KpssHeaderBar } from "@/components/kpss/KpssHeaderBar.js";
import { KpssTopicDetailModal } from "@/components/kpss/KpssTopicDetailModal.js";
import { KpssProgressSection } from "@/components/kpss/KpssProgressSection.js";
import { KpssSrsTab } from "@/components/kpss/KpssSrsTab.js";
import { KpssQuizModal } from "@/components/kpss/quiz/KpssQuizModal.js";
import { KpssPastExamsDashboard } from "@/components/kpss/KpssPastExamsDashboard.js";
import { KpssNotesDashboard } from "@/components/kpss/wiki/KpssNotesDashboard.js";
import { TurkeyMapView } from "@/components/kpss/map/TurkeyMapView.js";
import { logger } from "@/utils/logger.js";

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
  const [chartDays, setChartDays] = useState<7 | 30>(7);

  const [activeTopic, setActiveTopic] = useState<{
    title: string;
    description: string;
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

  // Sorting state for topic lists
  const [sortBy, setSortBy] = useState<"default" | "questions" | "status">(
    "default",
  );

  // KPSS Hedef ve Grafik Sistemleri
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // KPSS SRS States
  const [srsLoading, setSrsLoading] = useState(true);
  const [srsQueue, setSrsQueue] = useState<WordReviewData[]>([]);
  const [srsIndex, setSrsIndex] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);
  const [srsFadeState, setSrsFadeState] = useState<"normal" | "slide-out">(
    "normal",
  );
  const [srsSourceMode, setSrsSourceMode] = useState<"all" | "preset" | "notes">("all");
  const [flashcardsUniverse, setFlashcardsUniverse] = useState<any[]>(kpssDummyFlashcards);
  const [userNotesCount, setUserNotesCount] = useState<number>(0);

  const loadKpssSrsQueue = async (mode = srsSourceMode) => {
    setSrsLoading(true);
    try {
      const res = await kpssSrsService.loadSrsQueue(mode);
      const userCards = await kpssSrsService.getUserNotesFlashcards();
      setUserNotesCount(userCards.length);
      setSrsQueue(res.queue);
      setFlashcardsUniverse(res.universe);
      setSrsIndex(0);
      setSrsLoading(false);
    } catch (e) {
      logger.error("Failed to load KPSS SRS Queue:", e);
      setSrsLoading(false);
    }
  };

  const handleSourceModeChange = (mode: "all" | "preset" | "notes") => {
    setSrsSourceMode(mode);
    loadKpssSrsQueue(mode);
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
      loadKpssSrsQueue(srsSourceMode);
    }
  }, [activeTab]);

  const loadKpssData = async () => {
    const progress = await kpssService.getKpssProgress();
    const stats = await kpssService.getKpssDailyStats();
    const cType: "line" | "bar" = await new Promise((r) =>
      chrome.storage.sync.get(["kpssChartType"], (res) =>
        r((res.kpssChartType as "line" | "bar") || "line"),
      ),
    );
    const cDays: 7 | 30 = await new Promise((r) =>
      chrome.storage.sync.get(["kpssChartDays"], (res) =>
        r(res.kpssChartDays === 30 ? 30 : 7),
      ),
    );

    setKpssProgress(progress);
    setDailyStats(stats);
    setChartType(cType);
    setChartDays(cDays);
  };

  const handleChartTypeChange = async (type: "line" | "bar") => {
    setChartType(type);
    chrome.storage.sync.set({ kpssChartType: type });
  };

  const handleChartDaysChange = async (days: 7 | 30) => {
    setChartDays(days);
    chrome.storage.sync.set({ kpssChartDays: days });
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
      new Promise<Record<string, KpssPastQuiz>>((resolve) => {
        chrome.storage.local.get(["kpss_past_quizzes"], (res) => {
          const stored = res.kpss_past_quizzes as
            Record<string, KpssPastQuiz> | undefined;
          resolve(stored ?? {});
        });
      }),
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
            onChartDaysChange={handleChartDaysChange}
            onChartTypeChange={handleChartTypeChange}
            onSelectSubject={setCurrentSubject}
            onSortByChange={setSortBy}
            onStartQuiz={(topic, subject) =>
              quiz.handleStartQuiz(topic, subject)
            }
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
            srsSourceMode={srsSourceMode}
            userNotesCount={userNotesCount}
            srsLoading={srsLoading}
            srsQueue={srsQueue}
            srsIndex={srsIndex}
            srsFlipped={srsFlipped}
            srsFadeState={srsFadeState}
            flashcardsUniverse={flashcardsUniverse}
            onSourceModeChange={handleSourceModeChange}
            onFlipChange={(flipped) => setSrsFlipped(flipped)}
            onReviewQuality={handleKpssSrsReview}
            onReloadQueue={() => loadKpssSrsQueue(srsSourceMode)}
          />
        ) : activeTab === "map" ? (
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <TurkeyMapView t={t} />
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
        aiApiKey={aiApiKey}
        aiEndpoint={aiEndpoint}
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
        onRetakeQuiz={() => {
          quiz.setQuizStep("intro");
          quiz.setSelectedQuizCount(5);
          quiz.setQuizQuestions([]);
          quiz.setSelectedAnswers([]);
          quiz.setQuizError(null);
        }}
        onSaveExternalResult={quiz.handleSaveExternalResult}
        subjectNames={SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr}
      />
    </div>
  );
}
