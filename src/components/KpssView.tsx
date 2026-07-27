import { useState, useEffect } from "preact/hooks";
import {
  kpssService,
  kpssData,
  kpssDummyFlashcards,
} from "@/services/kpssService.js";
import { KpssProgress, KpssDailyStats, Language } from "@/types/types.js";
import { KpssCountdownBanner } from "@/components/KpssCountdownBanner.js";
import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
} from "@/domain/services/SrsService.js";
import {
  type ReviewQuality,
  type WordReviewData,
} from "@/domain/services/SrsService.js";
import {
  calculateKpssCountdown,
  calculateEstimatedCompletionTime,
} from "@/domain/services/KpssCalculatorService.js";
import { KPSS_YEARLY_DATA } from "@/data/kpss/kpssDataRegistry.js";
import {
  fetchQuestionsSubsetFromAI as fetchQuestionsSubsetFromAI_service,
  QuizQuestion,
} from "@/services/kpssAiService.js";
import {
  getSubjectNets as getSubjectNets_logic,
  getOverallNets as getOverallNets_logic,
} from "@/domain/services/KpssCalculatorService.js";

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

const getLocalQuestionsForTopic = (
  subjectKey: string,
  topicName: string,
): QuizQuestion[] => {
  const aggregated: QuizQuestion[] = [];
  Object.values(KPSS_YEARLY_DATA).forEach((yearData) => {
    const list = yearData[subjectKey];
    if (Array.isArray(list)) {
      list.forEach((q: any) => {
        if (q.topic === topicName) {
          aggregated.push(q);
        }
      });
    }
  });
  return aggregated;
};

interface KpssPastQuiz {
  subject: string;
  topic: string;
  score: number;
  questions: QuizQuestion[];
  selectedAnswers: number[];
  date: string;
}

const SUBJECT_NAMES: Record<string, Record<string, string>> = {
  tr: {
    turkce: "Türkçe",
    matematik: "Matematik",
    geometri: "Geometri",
    tarih: "Tarih",
    cografya: "Coğrafya",
    vatandaslik: "Vatandaşlık",
    progress_text: "tamamlandı",
    chart_empty: "Henüz veri yok",
    stats_title: "Günlük İlerleme",
    stat_questions: "Soru Sayısı",
    stat_subject: "Ders",
    save: "Kaydet",
    reset: "Sıfırla",
    reset_confirm: "Tüm KPSS çalışma verileriniz silinecektir. Emin misiniz?",
    details_title: "Konu Detayı",
  },
  en: {
    turkce: "Turkish",
    matematik: "Mathematics",
    geometri: "Geometry",
    tarih: "History",
    cografya: "Geography",
    vatandaslik: "Citizenship",
    progress_text: "completed",
    chart_empty: "No data yet",
    stats_title: "Daily Progress",
    stat_questions: "Question Count",
    stat_subject: "Subject",
    save: "Save",
    reset: "Reset",
    reset_confirm:
      "All your KPSS study statistics will be deleted. Are you sure?",
    details_title: "Topic Detail",
  },
};

const subjectsList = [
  "turkce",
  "matematik",
  "geometri",
  "tarih",
  "cografya",
  "vatandaslik",
];

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
  const [activeTab, setActiveTab] = useState<"progress" | "srs" | "past-exams">(
    "progress",
  );

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

  // Target date: September 6, 2026 10:15
  const kpssTargetDate = new Date("2026-09-06T10:15:00").getTime();

  const loadKpssSrsQueue = async () => {
    setSrsLoading(true);
    try {
      const progress: any[] = await new Promise((r) =>
        chrome.storage.sync.get(["kpssSrsProgress"], (res) =>
          r((res.kpssSrsProgress as any[]) || []),
        ),
      );
      const progressMap = new Map<string, WordReviewData>();
      progress.forEach((p) => progressMap.set(p.wordId, p));

      const srsUniverse: SRSWordWithInfo[] = kpssDummyFlashcards.map((w) => {
        const p =
          progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
        return {
          ...p,
          level: w.category,
          listType: "kpss",
          freq: 0,
        };
      });

      const enrichedProgress: SRSWordWithInfo[] = progress.map((p) => {
        const wInfo = kpssDummyFlashcards.find((w) => w.id === p.wordId);
        return {
          ...p,
          level: wInfo?.category || "Tarih",
          listType: "kpss",
          freq: 0,
        };
      });

      const queue = prepareSRSQueue(enrichedProgress, {
        dailyGoal: 10,
        isCustomMode: true,
        filters: { listType: "kpss", levels: [] },
        universe: srsUniverse,
      });

      setSrsQueue(queue);
      setSrsIndex(0);
      setSrsLoading(false);
    } catch (e) {
      console.error("Failed to load KPSS SRS Queue:", e);
      setSrsLoading(false);
    }
  };

  const handleKpssSrsReview = async (quality: ReviewQuality) => {
    const reviewData = srsQueue[srsIndex];
    if (!reviewData) {
      return;
    }

    const outcome = calculateSM2(reviewData, quality, new Date());

    const progress: any[] = await new Promise((r) =>
      chrome.storage.sync.get(["kpssSrsProgress"], (res) =>
        r((res.kpssSrsProgress as any[]) || []),
      ),
    );
    const idx = progress.findIndex((p: any) => p.wordId === outcome.wordId);
    if (idx >= 0) {
      progress[idx] = outcome;
    } else {
      progress.push(outcome);
    }
    await new Promise<void>((r) =>
      chrome.storage.sync.set({ kpssSrsProgress: progress }, r),
    );

    // Fade animation transition
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

    setKpssProgress(progress);
    setDailyStats(stats);
    setChartType(cType);

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
      setKpssTimeLeft(calculateKpssCountdown(kpssTargetDate, now, lang));
      setEstimatedTimeLeft(
        calculateEstimatedCompletionTime(remaining, now, lang),
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [kpssProgress, lang]);

  // Dynamic AI Fetcher with pre-fetch
  const fetchQuestionsSubsetFromAI = (
    subjectKey: string,
    topicName: string,
    count: number,
    excludeQuestions: QuizQuestion[] = [],
    fewShotExamples: QuizQuestion[] = [],
  ): Promise<QuizQuestion[]> => {
    return fetchQuestionsSubsetFromAI_service(
      subjectKey,
      topicName,
      count,
      { aiProvider, aiModel, aiApiKey, aiEndpoint, lang, SUBJECT_NAMES },
      excludeQuestions,
      fewShotExamples,
    );
  };

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

          fetchQuestionsSubsetFromAI(
            subjectKey,
            topicName,
            neededCount,
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
              console.error("Background questions pre-fetch failed:", err);
            })
            .finally(() => {
              setIsBackgroundLoading(false);
            });
        }
      } else {
        const firstList = await fetchQuestionsSubsetFromAI(
          subjectKey,
          topicName,
          1,
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
          fetchQuestionsSubsetFromAI(subjectKey, topicName, count - 1, [
            firstQuestion,
          ])
            .then((remainingQuestions) => {
              if (remainingQuestions.length > 0) {
                setQuizQuestions((prev) => {
                  const updated = [...prev, ...remainingQuestions];
                  return updated.slice(0, count);
                });
              }
            })
            .catch((err) => {
              console.error("Background questions pre-fetch failed:", err);
            })
            .finally(() => {
              setIsBackgroundLoading(false);
            });
        } else {
          setIsBackgroundLoading(false);
        }
      }
    } catch (err: any) {
      console.error("AI quiz generation error:", err);
      setQuizError(
        lang === "tr"
          ? "Sınav soruları oluşturulurken yapay zekâ bir hata verdi. Lütfen tekrar deneyin."
          : "AI failed to generate quiz questions. Please try again.",
      );
      setQuizLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const handleFinishQuiz = async () => {
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round(
      (correctCount / quizQuestions.length) * 100,
    );
    setQuizResultScore(scorePercentage);
    setQuizStep("result");

    let newStatus: 0 | 1 | 2;
    if (scorePercentage >= 80) {
      newStatus = 2;
    } else if (scorePercentage >= 40) {
      newStatus = 1;
    } else {
      newStatus = 0;
    }

    try {
      const isRegularTopic = (kpssData[currentSubject] || []).some(
        (t) => t.title === activeQuizTopic,
      );
      if (isRegularTopic) {
        await kpssService.updateTopicStatus(
          currentSubject,
          activeQuizTopic!,
          newStatus,
          scorePercentage,
        );
      }

      const quizKey = `${currentSubject}_${activeQuizTopic}`;
      const newQuizRecord: KpssPastQuiz = {
        subject: currentSubject,
        topic: activeQuizTopic!,
        score: scorePercentage,
        questions: quizQuestions,
        selectedAnswers: selectedAnswers,
        date: new Date().toISOString().split("T")[0],
      };

      const updatedPast = {
        ...pastQuizzes,
        [quizKey]: newQuizRecord,
      };
      setPastQuizzes(updatedPast);
      chrome.storage.local.set({ kpss_past_quizzes: updatedPast });

      await kpssService.saveKpssDailyStats(
        quizQuestions.length,
        0,
        currentSubject,
      );

      await loadKpssData();
    } catch (err) {
      console.error(
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
    let questions: QuizQuestion[] = [];

    if (year === "karma") {
      Object.keys(KPSS_YEARLY_DATA).forEach((y) => {
        const yearData = KPSS_YEARLY_DATA[y];
        if (subject === "all") {
          Object.values(yearData).forEach((list: any) => {
            if (Array.isArray(list)) {
              questions.push(...list);
            }
          });
        } else {
          const list = yearData[subject];
          if (Array.isArray(list)) {
            questions.push(...list);
          }
        }
      });
      questions = [...questions].sort(() => Math.random() - 0.5);
    } else {
      const yearData = KPSS_YEARLY_DATA[year];
      if (yearData) {
        if (subject === "all") {
          Object.values(yearData).forEach((list: any) => {
            if (Array.isArray(list)) {
              questions.push(...list);
            }
          });
        } else {
          questions = yearData[subject] || [];
        }
      }
    }

    if (questions.length === 0) {
      setQuizError(
        lang === "tr"
          ? "Bu kategori için çıkmış soru bulunamadı."
          : "No past questions found for this category.",
      );
      setQuizStep("questions");
      setActiveQuizTopic(lang === "tr" ? "Hata" : "Error");
      return;
    }

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setSelectedQuizCount(questions.length);
    setQuizStep("questions");

    const subjectName =
      subject === "all"
        ? lang === "tr"
          ? "GY-GK Karma"
          : "GY-GK Mixed"
        : subject === "cografya"
          ? lang === "tr"
            ? "Coğrafya"
            : "Geography"
          : subject === "tarih"
            ? lang === "tr"
              ? "Tarih"
              : "History"
            : "Matematik";

    const yearName =
      year === "karma"
        ? lang === "tr"
          ? "Karma Yıllar"
          : "Mixed Years"
        : year;

    setActiveQuizTopic(
      lang === "tr"
        ? `${yearName} KPSS Çıkmış Sorular (${subjectName})`
        : `${yearName} KPSS Past Questions (${subjectName})`,
    );
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
          title="KPSS Hazırlık"
          activeTab={activeTab}
          lang={lang}
          onTabChange={setActiveTab}
        />

        {activeTab === "progress" ? (
          <>
            <KpssCountdownBanner
              lang={lang}
              kpssTimeLeft={kpssTimeLeft}
              estimatedTimeLeft={estimatedTimeLeft}
              remainingCount={remainingCount}
            />

            <KpssAutoPlannerCard
              lang={lang}
              kpssProgress={kpssProgress}
              onStartQuiz={(subject, topicTitle) =>
                handleStartQuiz(topicTitle, subject)
              }
              labels={labels}
            />

            <KpssDailyStatsCard
              lang={lang}
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
              onChartDaysChange={setChartDays}
              onChartTypeChange={handleChartTypeChange}
              labels={labels}
              subjectsList={subjectsList}
              dailyStats={dailyStats}
              goalType={goalType}
              targetNet={targetNet}
              targetScore={targetScore}
              kpssProgress={kpssProgress}
              kpssTargetDate={kpssTargetDate}
            />

            <KpssNetEstimationCard
              lang={lang}
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
              topics={topics}
              kpssProgress={kpssProgress}
              currentSubject={currentSubject}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onStartQuiz={(topic) => handleStartQuiz(topic)}
              onShowDetail={(topic) => setActiveTopic(topic)}
            />
          </>
        ) : activeTab === "srs" ? (
          <KpssSrsCard
            lang={lang}
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
            lang={lang}
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
