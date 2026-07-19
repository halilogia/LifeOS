import { useState, useEffect, useRef } from "preact/hooks";
import { kpssService, kpssData, kpssDummyFlashcards } from "@/services/kpssService.js";
import { KpssProgress, KpssDailyStats, Language } from "@/types/types.js";
import { KpssCountdownBanner } from "@/components/KpssCountdownBanner.js";
import { storage } from "@/core/storage.js";
import { calculateSM2, prepareSRSQueue, createInitialSRSWord, SRSWordWithInfo } from "@/logic/srs.js";
import { ReviewQuality, WordReviewData } from "@/types/word.js";
import { getKpssSystemPrompt } from "@/services/kpssPrompts.js";
import { calculateKpssCountdown, calculateEstimatedCompletionTime } from "@/logic/kpssCalculator.js";
import kpss2019 from "@/data/kpss/kpss2019.json";
import kpss2020 from "@/data/kpss/kpss2020.json";
import kpss2021 from "@/data/kpss/kpss2021.json";

import exam2019 from "@/data/kpss/exams/exam2019.json";
import exam2020 from "@/data/kpss/exams/exam2020.json";
import exam2021 from "@/data/kpss/exams/exam2021.json";

const KPSS_YEARLY_DATA: Record<string, any> = {
  "2019": exam2019,
  "2020": exam2020,
  "2021": exam2021
};

// Extracted Presentational Sub-components
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

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  solution: string;
  chart?: {
    type: "bar" | "line" | "geometry";
    title?: string;
    labels?: string[];
    values?: (number | string)[];
    shape?: "triangle" | "circle" | "parallel_lines";
    angles?: Record<string, string>;
    sides?: Record<string, string>;
  };
  map?: {
    highlightRegions?: string[];
    markers?: Array<{ x: number; y: number; label: string }>;
  };
}

const KPSS_AI_TEMPLATES: Record<string, any> = {
  "2019": kpss2019,
  "2020": kpss2020,
  "2021": kpss2021
};

const getLocalQuestionsForTopic = (subjectKey: string, topicName: string): QuizQuestion[] => {
  const aggregated: QuizQuestion[] = [];
  Object.values(KPSS_AI_TEMPLATES).forEach((yearData) => {
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
    reset_confirm: "All your KPSS study statistics will be deleted. Are you sure?",
    details_title: "Topic Detail",
  },
};

export function KpssView({ lang, onShowConfirm, aiProvider, aiApiKey, aiModel, aiEndpoint, goalType, targetNet, targetScore }: KpssViewProps) {
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
  const [quizStep, setQuizStep] = useState<"intro" | "questions" | "result">("intro");
  const [selectedQuizCount, setSelectedQuizCount] = useState(5);
  const [quizLoading, setQuizLoading] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResultScore, setQuizResultScore] = useState(0);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [pastQuizzes, setPastQuizzes] = useState<Record<string, KpssPastQuiz>>({});

  // Countdown Banners States
  const [kpssTimeLeft, setKpssTimeLeft] = useState("");
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState("");
  const [remainingCount, setRemainingCount] = useState(0);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"progress" | "srs" | "past-exams">("progress");

  // Sorting state for topic lists
  const [sortBy, setSortBy] = useState<"default" | "questions" | "status">("default");

  // KPSS Hedef ve Grafik Sistemleri
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // KPSS SRS States
  const [srsLoading, setSrsLoading] = useState(true);
  const [srsQueue, setSrsQueue] = useState<WordReviewData[]>([]);
  const [srsIndex, setSrsIndex] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);
  const [srsFadeState, setSrsFadeState] = useState<"normal" | "slide-out">("normal");



  // Target date: September 6, 2026 10:15
  const kpssTargetDate = new Date("2026-09-06T10:15:00").getTime();

  const loadKpssSrsQueue = async () => {
    setSrsLoading(true);
    try {
      const progress = await storage.getKpssSrsProgress();
      const progressMap = new Map<string, WordReviewData>();
      progress.forEach((p) => progressMap.set(p.wordId, p));

      const srsUniverse: SRSWordWithInfo[] = kpssDummyFlashcards.map((w) => {
        const p = progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
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

    const progress = await storage.getKpssSrsProgress();
    const idx = progress.findIndex((p) => p.wordId === outcome.wordId);
    if (idx >= 0) {
      progress[idx] = outcome;
    } else {
      progress.push(outcome);
    }
    await storage.setKpssSrsProgress(progress);

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
    const cType = await storage.getKpssChartType();
    
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
    await storage.setKpssChartType(type);
  };

  useEffect(() => {
    loadKpssData();
  }, []);

  useEffect(() => {
    loadKpssData();
  }, [currentSubject]);



  // Real-time Countdown timer intervals
  useEffect(() => {
    const totalCount = Object.values(kpssData).reduce((acc, list) => acc + list.length, 0);
    const finishedCount = kpssProgress.filter(p => p.status === 2).length;
    const remaining = totalCount - finishedCount;
    setRemainingCount(remaining);

    const updateCountdown = () => {
      const now = Date.now();
      setKpssTimeLeft(calculateKpssCountdown(kpssTargetDate, now, lang));
      setEstimatedTimeLeft(calculateEstimatedCompletionTime(remaining, now, lang));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [kpssProgress, lang]);

  // Dynamic AI Fetcher with pre-fetch (1st question immediately, others in background)
  const fetchQuestionsSubsetFromAI = async (
    subjectKey: string,
    topicName: string,
    count: number,
    excludeQuestions: QuizQuestion[] = [],
    fewShotExamples: QuizQuestion[] = []
  ): Promise<QuizQuestion[]> => {
    const tStart = performance.now();
    console.log(`%c[AI Fetch - Start] Requesting ${count} questions for "${topicName}"`, "color: #a78bfa; font-weight: bold;");

    const subjectName = SUBJECT_NAMES[lang][subjectKey] || subjectKey;
    const systemPrompt = getKpssSystemPrompt(subjectKey, lang, fewShotExamples);

    let userPrompt = `${subjectName} dersinin '${topicName}' konusu hakkında tam ${count} adet soru içeren zorlayıcı bir KPSS seviye tespit testi oluştur.`;
    if (excludeQuestions.length > 0) {
      userPrompt += ` Üreteceğin sorular şu sorulardan tamamen farklı olmalıdır: ${JSON.stringify(excludeQuestions.map(q => q.question))}`;
    }

    let responseText = "";
    const tNetworkStart = performance.now();

    if (aiProvider === "ollama") {
      const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "http://localhost:11434";
      const url = baseUrl.includes("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
      const modelName = aiModel || "llama3";
      const payload = {
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: 0.2
        }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const tNetworkEnd = performance.now();
      console.log(`[AI Fetch - Network] Ollama HTTP status ${res.status} in ${Math.round(tNetworkEnd - tNetworkStart)} ms`);

      if (!res.ok) {
        let errBody = "";
        try {
          errBody = await res.text();
        } catch (_) {}
        throw new Error(`HTTP error! status: ${res.status}: ${errBody || res.statusText}`);
      }

      const tReadStart = performance.now();
      const data = await res.json();
      const tReadEnd = performance.now();
      console.log(`[AI Fetch - Parse JSON Payload] Read body in ${Math.round(tReadEnd - tReadStart)} ms`);
      responseText = data.choices?.[0]?.message?.content || "";
    } else if (aiProvider === "openrouter") {
      const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "https://openrouter.ai/api/v1";
      const url = `${baseUrl}/chat/completions`;
      const modelName = aiModel || "google/gemini-2.5-flash";
      const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (aiApiKey && aiApiKey.trim()) {
        headers["Authorization"] = `Bearer ${aiApiKey}`;
      }

      if (!isLocal) {
        headers["HTTP-Referer"] = "https://github.com/halilogia/chrome-extension-todo";
        headers["X-Title"] = "ZenTodo Life OS Dashboard";
      }

      const payload = {
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
        temperature: 0.2
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const tNetworkEnd = performance.now();
      console.log(`[AI Fetch - Network] 9Router/OpenRouter HTTP status ${res.status} in ${Math.round(tNetworkEnd - tNetworkStart)} ms`);

      if (!res.ok) {
        let errBody = "";
        try {
          errBody = await res.text();
        } catch (_) {}
        throw new Error(`HTTP error! status: ${res.status}: ${errBody || res.statusText}`);
      }

      const tReadStart = performance.now();
      const data = await res.json();
      const tReadEnd = performance.now();
      console.log(`[AI Fetch - Parse JSON Payload] Read body in ${Math.round(tReadEnd - tReadStart)} ms`);
      responseText = data.choices?.[0]?.message?.content || "";
    } else {
      // Gemini provider (default)
      const modelName = aiModel || "gemini-1.5-flash";
      const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "https://generativelanguage.googleapis.com/v1beta";
      const url = `${baseUrl}/models/${modelName}:generateContent?key=${aiApiKey}`;
      const payload = {
        contents: [{
          parts: [{
            text: systemPrompt + "\n\n" + userPrompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const tNetworkEnd = performance.now();
      console.log(`[AI Fetch - Network] Gemini API HTTP status ${res.status} in ${Math.round(tNetworkEnd - tNetworkStart)} ms`);

      if (!res.ok) {
        let errBody = "";
        try {
          errBody = await res.text();
        } catch (_) {}
        throw new Error(`HTTP error! status: ${res.status}: ${errBody || res.statusText}`);
      }

      const tReadStart = performance.now();
      const data = await res.json();
      const tReadEnd = performance.now();
      console.log(`[AI Fetch - Parse JSON Payload] Read body in ${Math.round(tReadEnd - tReadStart)} ms`);
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    const tCleanStart = performance.now();
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    cleaned = cleaned
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");
    
    let isObject = false;
    let startIdx = -1;
    
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      isObject = true;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      isObject = false;
    }
    
    if (startIdx !== -1) {
      const openChar = isObject ? "{" : "[";
      const closeChar = isObject ? "}" : "]";
      
      let braceCount = 0;
      let endIdx = -1;
      let inString = false;
      let escape = false;
      
      for (let i = startIdx; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === "\\") {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === openChar) {
            braceCount++;
          } else if (char === closeChar) {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }
        }
      }
      
      if (endIdx !== -1) {
        cleaned = cleaned.substring(startIdx, endIdx + 1);
      }
    }
    
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (firstErr) {
      try {
        let patched = cleaned
          .replace(/,\s*([\]}])/g, "$1")
          .replace(/(["\d])\s*\n\s*"/g, '$1,\n"');
        parsed = JSON.parse(patched);
      } catch (secErr) {
        console.warn("[KpssView JSON parse Fallback] Failed twice. Substring was:", cleaned);
        parsed = [];
      }
    }
    if (!Array.isArray(parsed) && typeof parsed === "object") {
      const keys = Object.keys(parsed);
      if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
        parsed = parsed[keys[0]];
      } else {
        throw new Error("Invalid JSON structure returned by AI.");
      }
    }

    const tCleanEnd = performance.now();
    console.log(`[AI Fetch - Clean & Parse] Extract JSON in ${Math.round(tCleanEnd - tCleanStart)} ms`);

    const tTotal = performance.now() - tStart;
    console.log(`%c[AI Fetch - Complete] Successfully loaded ${count} questions in ${Math.round(tTotal)} ms`, "color: #10b981; font-weight: bold;");

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as QuizQuestion[];
    }
    return [];
  };

  const fetchQuizFromAI = async (subjectKey: string, topicName: string, count: number) => {
    setQuizLoading(true);
    setIsBackgroundLoading(false);
    setQuizError(null);
    setQuizStep("questions");
    setQuizQuestions([]);

    try {
      // Check if we have verified questions in our local question bank
      const localQuestions = getLocalQuestionsForTopic(subjectKey, topicName);

      if (localQuestions.length > 0) {
        if (localQuestions.length >= count) {
          // Case 1: We have enough local questions, load all instantly!
          setQuizQuestions(localQuestions.slice(0, count));
          setCurrentQuestionIndex(0);
          setSelectedAnswers(new Array(count).fill(-1));
          setQuizLoading(false);
          setIsBackgroundLoading(false);
          console.log(`[KPSS Question Bank] Loaded ${count} questions instantly from local bank.`);
        } else {
          // Case 2: We have some local questions, load them and fetch the rest in background
          setQuizQuestions(localQuestions);
          setCurrentQuestionIndex(0);
          setSelectedAnswers(new Array(count).fill(-1));
          setQuizLoading(false); // Let user start immediately!
          setIsBackgroundLoading(true);

          const neededCount = count - localQuestions.length;
          console.log(`[KPSS Question Bank] Loaded ${localQuestions.length} questions instantly. Fetching remaining ${neededCount} from AI.`);

          fetchQuestionsSubsetFromAI(subjectKey, topicName, neededCount, localQuestions, localQuestions)
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
        // Case 3: No local questions available, generate all via AI
        // 1. Get first question immediately
        const firstList = await fetchQuestionsSubsetFromAI(subjectKey, topicName, 1);
        if (firstList.length === 0) {
          throw new Error("Soru üretilemedi.");
        }

        const firstQuestion = firstList[0];
        setQuizQuestions([firstQuestion]);
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(count).fill(-1));
        setQuizLoading(false); // First question loaded, let user start!

        // 2. Pre-fetch remaining count - 1 questions in the background
        if (count > 1) {
          setIsBackgroundLoading(true);
          fetchQuestionsSubsetFromAI(subjectKey, topicName, count - 1, [firstQuestion])
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
      setQuizError(lang === "tr" ? "Sınav soruları oluşturulurken yapay zekâ bir hata verdi. Lütfen tekrar deneyin." : "AI failed to generate quiz questions. Please try again.");
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

    const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizResultScore(scorePercentage);
    setQuizStep("result");

    // Automatically map score to checklist status
    let newStatus: 0 | 1 | 2 = 0;
    if (scorePercentage >= 80) {
      newStatus = 2; // Finished
    } else if (scorePercentage >= 40) {
      newStatus = 1; // Working
    } else {
      newStatus = 0; // Not Started
    }

    try {
      const isRegularTopic = (kpssData[currentSubject] || []).some((t) => t.title === activeQuizTopic);
      if (isRegularTopic) {
        await kpssService.updateTopicStatus(
          currentSubject,
          activeQuizTopic!,
          newStatus,
          scorePercentage
        );
      }

      // Save past quiz results
      const quizKey = `${currentSubject}_${activeQuizTopic}`;
      const newQuizRecord: KpssPastQuiz = {
        subject: currentSubject,
        topic: activeQuizTopic!,
        score: scorePercentage,
        questions: quizQuestions,
        selectedAnswers: selectedAnswers,
        date: new Date().toISOString().split("T")[0]
      };

      const updatedPast = {
        ...pastQuizzes,
        [quizKey]: newQuizRecord
      };
      setPastQuizzes(updatedPast);
      chrome.storage.local.set({ kpss_past_quizzes: updatedPast });

      // Automatically add solved test questions count to progress chart
      await kpssService.saveKpssDailyStats(quizQuestions.length, 0, currentSubject);

      await loadKpssData();
    } catch (err) {
      console.error("Failed to update status and save stats on quiz completion:", err);
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
      // Aggregate questions from all years
      Object.keys(KPSS_YEARLY_DATA).forEach((y) => {
        const yearData = KPSS_YEARLY_DATA[y];
        if (subject === "all") {
          // Add all subjects
          Object.values(yearData).forEach((list: any) => {
            if (Array.isArray(list)) questions.push(...list);
          });
        } else {
          const list = yearData[subject];
          if (Array.isArray(list)) questions.push(...list);
        }
      });
      // Shuffle the aggregated questions
      questions = [...questions].sort(() => Math.random() - 0.5);
    } else {
      // Load specific year
      const yearData = KPSS_YEARLY_DATA[year];
      if (yearData) {
        if (subject === "all") {
          Object.values(yearData).forEach((list: any) => {
            if (Array.isArray(list)) questions.push(...list);
          });
        } else {
          questions = yearData[subject] || [];
        }
      }
    }

    if (questions.length === 0) {
      setQuizError(lang === "tr" ? "Bu kategori için çıkmış soru bulunamadı." : "No past questions found for this category.");
      setQuizStep("questions");
      setActiveQuizTopic(lang === "tr" ? "Hata" : "Error");
      return;
    }

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setSelectedQuizCount(questions.length);
    setQuizStep("questions");

    const subjectName = subject === "all" 
      ? (lang === "tr" ? "GY-GK Karma" : "GY-GK Mixed")
      : (subject === "cografya" ? (lang === "tr" ? "Coğrafya" : "Geography") : (subject === "tarih" ? (lang === "tr" ? "Tarih" : "History") : "Matematik"));
    
    const yearName = year === "karma" 
      ? (lang === "tr" ? "Karma Yıllar" : "Mixed Years")
      : year;

    setActiveQuizTopic(lang === "tr" ? `${yearName} KPSS Çıkmış Sorular (${subjectName})` : `${yearName} KPSS Past Questions (${subjectName})`);
    setQuizLoading(false);
    setIsBackgroundLoading(false);
  };

  // Add daily studies count
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

  // Clear study history stats
  const handleResetStats = () => {
    onShowConfirm(labels.reset_confirm, async () => {
      await kpssService.setKpssDailyStats([]);
      loadKpssData();
    });
  };

  const getSubjectNets = (subKey: string) => {
    const tList = kpssData[subKey] || [];
    let totalNet = 0;
    let totalQuestions = 0;

    tList.forEach((t) => {
      totalQuestions += t.questionsCount;
      const prog = kpssProgress.find((p) => p.subject === subKey && p.topic === t.title);
      if (prog) {
        if (prog.score !== undefined) {
          totalNet += (prog.score / 100) * t.questionsCount;
        } else if (prog.status === 2) {
          totalNet += 0.8 * t.questionsCount;
        } else if (prog.status === 1) {
          totalNet += 0.4 * t.questionsCount;
        }
      }
    });
    return { net: Math.round(totalNet * 10) / 10, max: totalQuestions };
  };

  const getOverallNets = () => {
    let totalNet = 0;
    let totalMax = 0;
    Object.keys(kpssData).forEach((subKey) => {
      const { net, max } = getSubjectNets(subKey);
      totalNet += net;
      totalMax += max;
    });
    return { net: Math.round(totalNet * 10) / 10, max: totalMax };
  };

  const getSortedTopics = () => {
    const rawTopics = [...(kpssData[currentSubject] || [])];
    if (sortBy === "questions") {
      return rawTopics.sort((a, b) => b.questionsCount - a.questionsCount);
    }
    if (sortBy === "status") {
      return rawTopics.sort((a, b) => {
        const statusA = kpssProgress.find((p) => p.subject === currentSubject && p.topic === a.title)?.status || 0;
        const statusB = kpssProgress.find((p) => p.subject === currentSubject && p.topic === b.title)?.status || 0;
        return statusB - statusA;
      });
    }
    return rawTopics;
  };

  const topics = getSortedTopics();

  // Subject progress percentage
  const completedTopicsCount = kpssProgress.filter(
    (p) => p.subject === currentSubject && p.status === 2,
  ).length;
  const inProgressTopicsCount = kpssProgress.filter(
    (p) => p.subject === currentSubject && p.status === 1,
  ).length;

  const totalTopics = (kpssData[currentSubject] || []).length;
  const progressPercentage =
    totalTopics > 0
      ? Math.round(((completedTopicsCount + inProgressTopicsCount * 0.5) / totalTopics) * 100)
      : 0;

  const last7DaysData = dailyStats.slice(-7);
  const showChartPlaceholder = last7DaysData.length === 0;

  const overallNetObj = getOverallNets();
  const overallNet = overallNetObj.net;
  const maxNet = overallNetObj.max;
  const estimatedScore = Math.round((40 + overallNet * 0.5) * 10) / 10;

  return (
    <div id="kpss-view" className="view-content active">
      <div className="kpss-container">
        <header className="kpss-header">
          <h2>KPSS Hazırlık</h2>
        </header>

        {/* Sub-Tab Navigation Header */}
        <div className="pomodoro-tab-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-start", gap: "10px" }}>
          <button
            className={`pomo-tab-link ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            {lang === "tr" ? "Konular & İlerleme" : "Topics & Progress"}
          </button>
          <button
            className={`pomo-tab-link ${activeTab === "srs" ? "active" : ""}`}
            onClick={() => setActiveTab("srs")}
          >
            {lang === "tr" ? "Aralıklı Tekrar (Kartlar)" : "Spaced Repetition (Cards)"}
          </button>
          <button
            className={`pomo-tab-link ${activeTab === "past-exams" ? "active" : ""}`}
            onClick={() => setActiveTab("past-exams")}
          >
            {lang === "tr" ? "Çıkmış Sorular (ÖSYM)" : "Past Exams (ÖSYM)"}
          </button>
        </div>
        {activeTab === "progress" && (
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
              onStartQuiz={handleStartQuiz}
              labels={labels}
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
              subjectsList={Object.keys(kpssData)}
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
              subjectsList={Object.keys(kpssData)}
              dailyStats={dailyStats}
              goalType={goalType}
              targetNet={targetNet}
              targetScore={targetScore}
              kpssProgress={kpssProgress}
              kpssTargetDate={kpssTargetDate}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "32px", marginBottom: "16px" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)" }}>
                {lang === "tr" ? "Ders Seçimi:" : "Select Subject:"}
              </div>
              <nav className="kpss-subject-nav">
                {Object.keys(kpssData).map((subKey) => (
                  <button
                    key={subKey}
                    className={`kpss-subject-btn ${currentSubject === subKey ? "active" : ""}`}
                    onClick={() => setCurrentSubject(subKey)}
                  >
                    {labels[subKey] || subKey}
                  </button>
                ))}
              </nav>
            </div>

            <KpssTopicList
              lang={lang}
              topics={topics}
              kpssProgress={kpssProgress}
              currentSubject={currentSubject}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onStartQuiz={handleStartQuiz}
              onShowDetail={setActiveTopic}
              labels={labels}
            />

            {/* Progress tracker metrics */}
            <div className="kpss-progress-bar-container">
              <div className="kpss-progress-info">
                <span id="kpss-subject-title">{labels[currentSubject] || currentSubject}</span>
                <span id="kpss-progress-text">
                  %{progressPercentage} {labels.progress_text}
                </span>
              </div>
              <div className="kpss-progress-track">
                <div
                  id="kpss-progress-fill"
                  className="kpss-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </>
        )}

        {activeTab === "srs" && (
          <div className="kpss-srs-deck-container" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
            <KpssSrsCard
              lang={lang}
              srsLoading={srsLoading}
              srsQueue={srsQueue}
              srsIndex={srsIndex}
              srsFlipped={srsFlipped}
              srsFadeState={srsFadeState}
              onFlipChange={setSrsFlipped}
              onReviewQuality={handleKpssSrsReview}
              kpssDummyFlashcards={kpssDummyFlashcards}
              onReloadQueue={loadKpssSrsQueue}
            />
          </div>
        )}

        {activeTab === "past-exams" && (
          <KpssPastExamsDashboard
            lang={lang}
            labels={labels}
            onStartPastExam={handleStartPastExam}
          />
        )}
      </div>

      {/* Details Description Modal */}
      {activeTopic && (
        <div className="settings-panel active" onClick={() => setActiveTopic(null)}>
          <div
            className="settings-content"
            style={{ maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header">
              <h3>{labels.details_title}</h3>
              <button className="close-btn" onClick={() => setActiveTopic(null)}>
                &times;
              </button>
            </header>
            <div className="note-editor-body" style={{ padding: "24px" }}>
              <h4
                style={{
                  fontSize: "1.2rem",
                  color: "var(--accent-color)",
                  marginBottom: "10px",
                }}
              >
                {activeTopic.title}
              </h4>
              <p
                style={{
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                  color: "var(--text-primary)",
                }}
              >
                {activeTopic.description}
              </p>
            </div>
            <div className="settings-footer">
              <button
                className="settings-add-btn"
                style={{ width: "auto", padding: "0 30px" }}
                onClick={() => setActiveTopic(null)}
              >
                {lang === "tr" ? "Anladım" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Modal */}
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
        onStartQuiz={() => fetchQuizFromAI(currentSubject, activeQuizTopic!, selectedQuizCount)}
        onSelectAnswer={(oIdx) => {
          const nextAnswers = [...selectedAnswers];
          nextAnswers[currentQuestionIndex] = oIdx;
          setSelectedAnswers(nextAnswers);
        }}
        onPreviousQuestion={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
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
