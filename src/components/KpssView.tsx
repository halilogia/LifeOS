import { useState, useEffect } from "preact/hooks";
import {
  kpssService,
  kpssData,
  kpssDummyFlashcards,
} from "@/services/kpssService.js";
import { kpssSrsService } from "@/services/kpssSrsService.js";
import { kpssQuizFlowService } from "@/services/kpssQuizFlowService.js";
import { KpssProgress, KpssDailyStats, Language } from "@/types/types.js";
import { KpssCountdownBanner } from "@/components/KpssCountdownBanner.js";
import { getTranslation } from "@/utils/i18n.js";
import { type ReviewQuality, type WordReviewData } from "@/domain/services/SrsService.js";
import {
  calculateKpssCountdown,
  calculateEstimatedCompletionTime,
  getSubjectNets as getSubjectNets_logic,
  getOverallNets as getOverallNets_logic,
} from "@/domain/services/KpssCalculatorService.js";
import { QuizQuestion } from "@/services/kpssAiService.js";

// Domain Constants & Quiz Service
import {
  SUBJECT_NAMES,
  subjectsList,
  KPSS_TARGET_DATE,
} from "@/domain/constants/kpssConstants.js";
import {
  getLocalQuestionsForTopic,
  getPastExamQuestions,
  KpssPastQuiz,
} from "@/services/kpssQuizService.js";

// Extracted Presentational Sub-components
import { KpssHeaderBar } from "@/components/kpss/KpssHeaderBar.js";
import { KpssTopicDetailModal } from "@/components/kpss/KpssTopicDetailModal.js";
import { KpssNetEstimationCard } from "@/components/kpss/KpssNetEstimationCard.js";
import { KpssDailyStatsCard } from "@/components/kpss/KpssDailyStatsCard.js";
import { KpssTopicList } from "@/components/kpss/KpssTopicList.js";
import { KpssSrsCard } from "@/components/kpss/KpssSrsCard.js";
import { KpssAutoPlannerCard } from "@/components/kpss/KpssAutoPlannerCard.js";
import { KpssQuizModal } from "@/components/kpss/KpssQuizModal.js";
import { KpssPastExamsDashboard } from "@/components/kpss/KpssPastExamsDashboard.js";
import { KpssNotesDashboard } from "@/components/kpss/KpssNotesDashboard.js";
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

  // Detail Modal
  const [activeTopic, setActiveTopic] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Quiz States
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState<"intro" | "questions" | "result">(
    "intro",
  );
  const [selectedQuizCount, setSelectedQuizCount] = useState(5);
  const [quizLoading, setQuizLoading] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResultScore, setQuizResultScore] = useState(0);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [pastQuizzes, setPastQuizzes] = useState<Record<string, KpssPastQuiz>>(
    {},
  );

  // Countdown Banners States
  const [kpssTimeLeft, setKpssTimeLeft] = useState("");
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState("");
  const [remainingCount, setRemainingCount] = useState(0);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    "progress" | "notes" | "srs" | "past-exams"
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

  const loadKpssSrsQueue = async () => {
    setSrsLoading(true);
    try {
      const queue = await kpssSrsService.loadSrsQueue();
      setSrsQueue(queue);
      setSrsIndex(0);
      setSrsLoading(false);
    } catch (e) {
      logger.error("Failed to load KPSS SRS Queue:", e);
      setSrsLoading(false);
    }
  };

  const handleKpssSrsReview = async (quality: ReviewQuality) => {
    const reviewData = srsQueue[srsIndex];
    if (!reviewData) {return;}

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

    chrome.storage.local.get(["kpss_past_quizzes"], (res) => {
      if (res.kpss_past_quizzes) {
        setPastQuizzes(res.kpss_past_quizzes as Record<string, KpssPastQuiz>);
      }
    });
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
      setKpssTimeLeft(calculateKpssCountdown(KPSS_TARGET_DATE, now, lang));
      setEstimatedTimeLeft(
        calculateEstimatedCompletionTime(remaining, now, lang),
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [kpssProgress, lang]);

  const aiConfig = { aiProvider, aiModel, aiApiKey, aiEndpoint, lang };

  const fetchQuizFromAI = async (
    subjectKey: string,
    topicName: string,
    count: number,
  ) => {
    setQuizLoading(true);
    setIsBackgroundLoading(false);
    setQuizError(null);
    setQuizStep("questions");
    setQuizQuestions([]);

    try {
      const localQuestions = getLocalQuestionsForTopic(subjectKey, topicName);

      if (localQuestions.length > 0) {
        if (localQuestions.length >= count) {
          setQuizQuestions(localQuestions.slice(0, count));
          setCurrentQuestionIndex(0);
          setSelectedAnswers(new Array(count).fill(-1));
          setQuizLoading(false);
          setIsBackgroundLoading(false);
        } else {
          setQuizQuestions(localQuestions);
          setCurrentQuestionIndex(0);
          setSelectedAnswers(new Array(count).fill(-1));
          setQuizLoading(false);
          setIsBackgroundLoading(true);

          const neededCount = count - localQuestions.length;

          kpssQuizFlowService
            .fetchQuestionsSubsetFromAI(
              subjectKey,
              topicName,
              neededCount,
              aiConfig,
              localQuestions,
              localQuestions,
            )
            .then((remainingQuestions) => {
              if (remainingQuestions.length > 0) {
                setQuizQuestions((prev) => {
                  const updated = [...prev, ...remainingQuestions];
                  return updated.slice(0, count);
                });
              }
            })
            .catch((err) => {
              logger.error("Background questions pre-fetch failed:", err);
            })
            .finally(() => {
              setIsBackgroundLoading(false);
            });
        }
      } else {
        const firstList = await kpssQuizFlowService.fetchQuestionsSubsetFromAI(
          subjectKey,
          topicName,
          1,
          aiConfig,
        );
        if (firstList.length === 0) {
          throw new Error("Soru üretilemedi.");
        }

        const firstQuestion = firstList[0];
        setQuizQuestions([firstQuestion]);
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(count).fill(-1));
        setQuizLoading(false);

        if (count > 1) {
          setIsBackgroundLoading(true);
          kpssQuizFlowService
            .fetchQuestionsSubsetFromAI(
              subjectKey,
              topicName,
              count - 1,
              aiConfig,
              [firstQuestion],
            )
            .then((remainingQuestions) => {
              if (remainingQuestions.length > 0) {
                setQuizQuestions((prev) => {
                  const updated = [...prev, ...remainingQuestions];
                  return updated.slice(0, count);
                });
              }
            })
            .catch((err) => {
              logger.error("Background questions pre-fetch failed:", err);
            })
            .finally(() => {
              setIsBackgroundLoading(false);
            });
        } else {
          setIsBackgroundLoading(false);
        }
      }
    } catch (err: any) {
      logger.error("AI quiz generation error:", err);
      setQuizError(t.kpss_quiz_error);
      setQuizLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const handleFinishQuiz = async () => {
    try {
      const { scorePercentage, updatedPastQuizzes } =
        await kpssQuizFlowService.evaluateAndSaveQuizResult({
          currentSubject,
          activeQuizTopic: activeQuizTopic!,
          quizQuestions,
          selectedAnswers,
          pastQuizzes,
        });

      setQuizResultScore(scorePercentage);
      setQuizStep("result");
      setPastQuizzes(updatedPastQuizzes);
      await loadKpssData();
    } catch (err) {
      logger.error(
        "Failed to update status and save stats on quiz completion:",
        err,
      );
    }
  };

  const handleStartQuiz = (topic: string, subject?: string) => {
    const targetSubject = subject || currentSubject;
    if (subject && subject !== currentSubject) {
      setCurrentSubject(subject);
    }
    setActiveQuizTopic(topic);
    const quizKey = `${targetSubject}_${topic}`;
    const pastQuiz = pastQuizzes[quizKey];
    if (pastQuiz) {
      setQuizQuestions(pastQuiz.questions);
      setSelectedAnswers(pastQuiz.selectedAnswers);
      setQuizResultScore(pastQuiz.score);
      setQuizStep("result");
    } else {
      setQuizStep("intro");
      setSelectedQuizCount(5);
      setQuizQuestions([]);
      setSelectedAnswers([]);
      setQuizError(null);
    }
  };

  const handleStartPastExam = (year: string, subject: string) => {
    const questions = getPastExamQuestions(year, subject);

    if (questions.length === 0) {
      setQuizError(t.kpss_quiz_no_past);
      setQuizStep("questions");
      setActiveQuizTopic(t.kpss_quiz_error_title);
      return;
    }

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setSelectedQuizCount(questions.length);
    setQuizStep("questions");

    const subjectName =
      subject === "all"
        ? t.kpss_subject_mixed
        : subject === "cografya"
          ? t.kpss_subject_geography
          : subject === "tarih"
            ? t.kpss_subject_history
            : "Matematik";

    const yearName =
      year === "karma"
        ? t.kpss_exam_mixed_years
        : year;

    setActiveQuizTopic(`${yearName} KPSS Past Questions (${subjectName})`);
    setQuizLoading(false);
    setIsBackgroundLoading(false);
  };

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
          <>
            <KpssCountdownBanner
              lang={lang}
              t={t}
              kpssTimeLeft={kpssTimeLeft}
              estimatedTimeLeft={estimatedTimeLeft}
              remainingCount={remainingCount}
            />

            <KpssAutoPlannerCard
              t={t}
              kpssProgress={kpssProgress}
              onStartQuiz={(subject, topicTitle) =>
                handleStartQuiz(topicTitle, subject)
              }
              labels={labels}
            />

            <KpssDailyStatsCard
              lang={lang}
              t={t}
              questionsInput={questionsInput}
              videosInput={videosInput}
              subjectInput={subjectInput}
              chartDays={chartDays}
              chartType={chartType}
              onQuestionsInputChange={setQuestionsInput}
              onVideosInputChange={setVideosInput}
              onSubjectInputChange={setSubjectInput}
              onSaveStats={handleSaveStats}
              onResetStats={handleResetStats}
              onDeleteStat={handleDeleteStat}
              onChartDaysChange={handleChartDaysChange}
              onChartTypeChange={handleChartTypeChange}
              labels={labels}
              subjectsList={subjectsList}
              dailyStats={dailyStats}
              goalType={goalType}
              targetNet={targetNet}
              targetScore={targetScore}
              kpssProgress={kpssProgress}
              kpssTargetDate={KPSS_TARGET_DATE}
            />

            <KpssNetEstimationCard
              t={t}
              goalType={goalType}
              targetNet={targetNet}
              targetScore={targetScore}
              overallNet={overallNet}
              maxNet={maxNet}
              estimatedScore={estimatedScore}
              getSubjectNets={getSubjectNets}
              labels={labels}
              subjectsList={subjectsList}
              selectedSubject={currentSubject}
              onSelectSubject={setCurrentSubject}
            />

            <KpssTopicList
              lang={lang}
              t={t}
              topics={topics}
              kpssProgress={kpssProgress}
              currentSubject={currentSubject}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onStartQuiz={(topic) => handleStartQuiz(topic)}
              onShowDetail={(topic) => setActiveTopic(topic)}
            />
          </>
        ) : activeTab === "notes" ? (
          <KpssNotesDashboard lang={lang} t={t} />
        ) : activeTab === "srs" ? (
          <KpssSrsCard
            t={t}
            srsLoading={srsLoading}
            srsQueue={srsQueue}
            srsIndex={srsIndex}
            srsFlipped={srsFlipped}
            srsFadeState={srsFadeState}
            onFlipChange={(flipped) => setSrsFlipped(flipped)}
            onReviewQuality={handleKpssSrsReview}
            kpssDummyFlashcards={kpssDummyFlashcards}
            onReloadQueue={loadKpssSrsQueue}
          />
        ) : (
          <KpssPastExamsDashboard
            t={t}
            onStartPastExam={handleStartPastExam}
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
        activeQuizTopic={activeQuizTopic}
        quizStep={quizStep}
        selectedQuizCount={selectedQuizCount}
        quizLoading={quizLoading}
        isBackgroundLoading={isBackgroundLoading}
        quizQuestions={quizQuestions}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswers={selectedAnswers}
        quizResultScore={quizResultScore}
        quizError={quizError}
        aiApiKey={aiApiKey}
        aiEndpoint={aiEndpoint}
        onClose={() => {
          setActiveQuizTopic(null);
          setQuizStep("intro");
          setQuizLoading(false);
          setQuizQuestions([]);
          setSelectedAnswers([]);
          setQuizError(null);
        }}
        onSetSelectedQuizCount={setSelectedQuizCount}
        onStartQuiz={() =>
          fetchQuizFromAI(currentSubject, activeQuizTopic!, selectedQuizCount)
        }
        onSelectAnswer={(oIdx) => {
          const nextAnswers = [...selectedAnswers];
          nextAnswers[currentQuestionIndex] = oIdx;
          setSelectedAnswers(nextAnswers);
        }}
        onPreviousQuestion={() =>
          setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
        onNextQuestion={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
        onFinishQuiz={handleFinishQuiz}
        onRetakeQuiz={() => {
          setQuizStep("intro");
          setSelectedQuizCount(5);
          setQuizQuestions([]);
          setSelectedAnswers([]);
          setQuizError(null);
        }}
        subjectNames={SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr}
      />
    </div>
  );
}
