import { useState, useEffect, useRef } from "preact/hooks";
import { kpssService, kpssData, kpssDummyFlashcards } from "@/services/kpssService.js";
import { KpssProgress, KpssDailyStats, Language } from "@/types/types.js";
import { KpssCountdownBanner } from "@/components/KpssCountdownBanner.js";
import { storage } from "@/core/storage.js";
import { calculateSM2, prepareSRSQueue, createInitialSRSWord, SRSWordWithInfo } from "@/logic/srs.js";
import { ReviewQuality, WordReviewData } from "@/types/word.js";

// Extracted Presentational Sub-components
import { KpssNetEstimationCard } from "@/components/kpss/KpssNetEstimationCard.js";
import { KpssDailyStatsCard } from "@/components/kpss/KpssDailyStatsCard.js";
import { KpssTopicList } from "@/components/kpss/KpssTopicList.js";
import { KpssSrsCard } from "@/components/kpss/KpssSrsCard.js";

interface KpssViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
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

export function KpssView({ lang, onShowConfirm, aiProvider, aiApiKey, aiModel, aiEndpoint }: KpssViewProps) {
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
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResultScore, setQuizResultScore] = useState(0);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Countdown Banners States
  const [kpssTimeLeft, setKpssTimeLeft] = useState("");
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState("");
  const [remainingCount, setRemainingCount] = useState(0);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"progress" | "srs">("progress");

  // Sorting state for topic lists
  const [sortBy, setSortBy] = useState<"default" | "questions" | "status">("default");

  // Puan hedefi sistemi
  const [targetScore, setTargetScore] = useState(80);

  // KPSS SRS States
  const [srsLoading, setSrsLoading] = useState(true);
  const [srsQueue, setSrsQueue] = useState<WordReviewData[]>([]);
  const [srsIndex, setSrsIndex] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);
  const [srsFadeState, setSrsFadeState] = useState<"normal" | "slide-out">("normal");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    const target = await storage.getKpssTargetScore();
    setKpssProgress(progress);
    setDailyStats(stats);
    setTargetScore(target);
  };

  const handleTargetScoreChange = async (val: number) => {
    if (isNaN(val) || val < 0 || val > 100) return;
    setTargetScore(val);
    await storage.setKpssTargetScore(val);
  };

  useEffect(() => {
    loadKpssData();
  }, []);

  useEffect(() => {
    loadKpssData();
  }, [currentSubject]);

  useEffect(() => {
    drawChart();
  }, [dailyStats, chartDays, targetScore, kpssProgress]);

  // Real-time Countdown timer intervals
  useEffect(() => {
    const totalCount = Object.values(kpssData).reduce((acc, list) => acc + list.length, 0);
    const finishedCount = kpssProgress.filter(p => p.status === 2).length;
    const remaining = totalCount - finishedCount;
    setRemainingCount(remaining);

    const updateCountdown = () => {
      const now = Date.now();

      // 1. Exam countdown
      const diffKpss = kpssTargetDate - now;
      if (diffKpss <= 0) {
        setKpssTimeLeft(lang === "tr" ? "Sınav Başladı!" : "Exam Started!");
      } else {
        const days = Math.floor(diffKpss / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffKpss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diffKpss % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffKpss % (1000 * 60)) / 1000);
        setKpssTimeLeft(
          lang === "tr"
            ? `${days} Gün, ${hours} Saat, ${mins} Dk, ${secs} Sn`
            : `${days}d, ${hours}h, ${mins}m, ${secs}s`
        );
      }

      // 2. Study completion estimate (Remaining Topics * 2 days study rate)
      const estimatedRemainingDays = remaining * 2;
      const estimatedTargetDate = now + estimatedRemainingDays * 24 * 60 * 60 * 1000;
      const diffEst = estimatedTargetDate - now;

      if (remaining === 0) {
        setEstimatedTimeLeft(lang === "tr" ? "Tebrikler, bitti!" : "Completed!");
      } else {
        const days = Math.floor(diffEst / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffEst % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diffEst % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffEst % (1000 * 60)) / 1000);
        setEstimatedTimeLeft(
          lang === "tr"
            ? `${days} Gün, ${hours} Saat, ${mins} Dk, ${secs} Sn`
            : `${days}d, ${hours}h, ${mins}m, ${secs}s`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [kpssProgress, lang]);

  // Dynamic AI Fetcher
  const fetchQuizFromAI = async (subjectKey: string, topicName: string, count: number) => {
    setQuizLoading(true);
    setQuizError(null);
    setQuizStep("questions");

    const subjectName = SUBJECT_NAMES[lang][subjectKey] || subjectKey;
    const systemPrompt = `Sen KPSS Lisans düzeyinde uzman bir öğretmensin. Kullanıcının seçeceği ders ve konu hakkında çoktan seçmeli bir test hazırlayacaksın. Hazırladığın test tamamen Türkçe dilinde olmalı ve KPSS formatına uygun, zorlayıcı olmalıdır. Soruları A, B, C, D, E olmak üzere tam 5 seçenekli hazırlayacaksın. Yanıtını başka hiçbir açıklama yapmadan, SADECE geçerli bir JSON dizisi formatında döndürmelisin. Her nesne şu yapıda olmalıdır:
[
  {
    "question": "Soru metni...",
    "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği", "E seçeneği"],
    "correctAnswer": 0
  }
]
(correctAnswer 0-4 arasında doğru seçeneğin indeksidir). Kesinlikle JSON formatı dışında hiçbir açıklama, giriş veya kod bloğu dışı metin yazma. Sadece geçerli JSON döndür.`;

    const userPrompt = `${subjectName} dersinin '${topicName}' konusu hakkında tam ${count} adet soru içeren zorlayıcı bir KPSS seviye tespit testi oluştur.`;

    try {
      let responseText = "";

      if (aiProvider === "ollama") {
        const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "http://localhost:11434";
        const url = baseUrl.includes("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
        const modelName = aiModel || "llama3";
        const payload = {
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || "";
      } else if (aiProvider === "openrouter") {
        const baseUrl = aiEndpoint && aiEndpoint.trim() ? aiEndpoint.trim().replace(/\/$/, "") : "https://openrouter.ai/api/v1";
        const url = `${baseUrl}/chat/completions`;
        const modelName = aiModel || "google/gemini-2.5-flash";
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiApiKey}`,
          "HTTP-Referer": "https://github.com/halilogia/chrome-extension-todo",
          "X-Title": "ZenTodo Life OS Dashboard"
        };
        const payload = {
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        };

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
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
            responseMimeType: "application/json"
          }
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      let cleanJson = responseText.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.substring(3);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      cleanJson = cleanJson.trim();

      let parsed = JSON.parse(cleanJson);
      if (!Array.isArray(parsed) && typeof parsed === "object") {
        const keys = Object.keys(parsed);
        if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
          parsed = parsed[keys[0]];
        } else {
          throw new Error("Invalid JSON structure returned by AI.");
        }
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuizQuestions(parsed);
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(parsed.length).fill(-1));
      } else {
        throw new Error("No questions found in AI response.");
      }
    } catch (err: any) {
      console.error("AI quiz generation error:", err);
      setQuizError(lang === "tr" ? "Sınav soruları oluşturulurken yapay zekâ bir hata verdi. Lütfen tekrar deneyin." : "AI failed to generate quiz questions. Please try again.");
    } finally {
      setQuizLoading(false);
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
      await kpssService.updateTopicStatus(
        currentSubject,
        activeQuizTopic!,
        newStatus,
        scorePercentage
      );
      await loadKpssData();
    } catch (err) {
      console.error("Failed to update status on quiz completion:", err);
    }
  };

  // Render chart on HTML Canvas using 2D context
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) {
      setTimeout(() => drawChart(), 50);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Draw Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    const stats = dailyStats || [];
    const lastNDays = stats.slice(-chartDays);

    if (lastNDays.length === 0) {
      // Draw dynamic recommendation chart (empty state)
      const overallNet = getOverallNets().net;
      const estimatedScore = Math.round((45 + overallNet * 0.458) * 10) / 10;
      const scoreDiff = Math.max(0, targetScore - estimatedScore);
      const recommendedQuestions = Math.round(scoreDiff * 75);
      const recommendedVideos = Math.round(scoreDiff * 2.5);

      const barWidth = 70;
      const barGap = 50;
      const centerX = padding + chartWidth / 2;

      const xQ = centerX - barWidth - barGap / 2;
      const xV = centerX + barGap / 2;

      const hQ = chartHeight * 0.7;
      const hV = chartHeight * 0.65;

      const yQ = height - padding - hQ;
      const yV = height - padding - hV;

      // Draw Questions Bar (Slate gray / #6b7280)
      const gradQ = ctx.createLinearGradient(xQ, yQ, xQ, height - padding);
      gradQ.addColorStop(0, "#6b7280");
      gradQ.addColorStop(1, "rgba(107, 114, 128, 0.1)");
      ctx.fillStyle = gradQ;
      ctx.beginPath();
      ctx.roundRect(xQ, yQ, barWidth, hQ, [8, 8, 0, 0]);
      ctx.fill();

      // Draw Videos Bar (Blue / #3b82f6)
      const gradV = ctx.createLinearGradient(xV, yV, xV, height - padding);
      gradV.addColorStop(0, "#3b82f6");
      gradV.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      ctx.fillStyle = gradV;
      ctx.beginPath();
      ctx.roundRect(xV, yV, barWidth, hV, [8, 8, 0, 0]);
      ctx.fill();

      // Draw values on top
      ctx.fillStyle = "white";
      ctx.font = "bold 13px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`${recommendedQuestions} ${lang === "tr" ? "Soru" : "Q"}`, xQ + barWidth / 2, yQ - 10);
      ctx.fillText(`${recommendedVideos} ${lang === "tr" ? "Video" : "Vids"}`, xV + barWidth / 2, yV - 10);

      // Draw sub-labels at the bottom
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "600 10px Inter";
      ctx.fillText(lang === "tr" ? "Kalan Soru İhtiyacı" : "Questions Needed", xQ + barWidth / 2, height - padding + 18);
      ctx.fillText(lang === "tr" ? "Kalan Video İhtiyacı" : "Videos Needed", xV + barWidth / 2, height - padding + 18);

      // Draw a small subtitle at the top center
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 11px Inter";
      ctx.fillText(
        lang === "tr" 
          ? `Hedef Puan (${targetScore}) İçin Kalan Tahmini Çalışma İhtiyacınız`
          : `Estimated Study Needed For Target Score (${targetScore})`,
        centerX,
        padding - 12
      );
      return;
    }

    // Draw study progress logs
    const maxQuestions = Math.max(...lastNDays.map((s) => s.questions), 10);
    const maxVideos = Math.max(...lastNDays.map((s) => s.videos || 0), 1);

    const slotWidth = chartWidth / lastNDays.length;
    const barGap = 2; // space between the two bars of the same day
    const slotPadding = lastNDays.length > 10 ? 2 : 6;
    const barWidth = (slotWidth - slotPadding * 2 - barGap) / 2;

    lastNDays.forEach((stat, i) => {
      const slotX = padding + i * slotWidth;
      const xQ = slotX + slotPadding;
      const xV = xQ + barWidth + barGap;

      // Heights: scaled to their maxes
      const hQ = (stat.questions / maxQuestions) * (chartHeight - 20);
      const hV = (((stat.videos || 0) / maxVideos) * (chartHeight - 20));

      const yQ = height - padding - hQ;
      const yV = height - padding - hV;

      // Questions: Green (#10b981)
      const gradQ = ctx.createLinearGradient(xQ, yQ, xQ, height - padding);
      gradQ.addColorStop(0, "#10b981");
      gradQ.addColorStop(1, "rgba(16, 185, 129, 0.1)");
      ctx.fillStyle = gradQ;
      ctx.beginPath();
      if (hQ > 4) {
        ctx.roundRect(xQ, yQ, barWidth, hQ, [4, 4, 0, 0]);
      } else {
        ctx.rect(xQ, yQ, barWidth, Math.max(hQ, 2));
      }
      ctx.fill();

      // Videos: Blue (#3b82f6)
      const gradV = ctx.createLinearGradient(xV, yV, xV, height - padding);
      gradV.addColorStop(0, "#3b82f6");
      gradV.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      ctx.fillStyle = gradV;
      ctx.beginPath();
      if (hV > 4) {
        ctx.roundRect(xV, yV, barWidth, hV, [4, 4, 0, 0]);
      } else {
        ctx.rect(xV, yV, barWidth, Math.max(hV, 2));
      }
      ctx.fill();

      // Draw values on top if we have enough slot width (7-day view)
      if (lastNDays.length <= 7) {
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Inter";
        ctx.textAlign = "center";
        
        if (stat.questions > 0) {
          ctx.fillText(stat.questions.toString(), xQ + barWidth / 2, yQ - 6);
        }
        if ((stat.videos || 0) > 0) {
          ctx.fillText((stat.videos || 0).toString(), xV + barWidth / 2, yV - 6);
        }
      }

      // Draw Date labels under the slot
      if (lastNDays.length <= 7 || i % 5 === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "500 10px Inter";
        ctx.textAlign = "center";
        const dateParts = stat.date.split("-");
        const dateLabel = `${dateParts[2]}/${dateParts[1]}`;
        ctx.fillText(dateLabel, slotX + slotWidth / 2, height - padding + 18);
      }
    });
  };

  const handleToggleTopic = async (topic: string) => {
    const progressItem = kpssProgress.find(
      (p) => p.subject === currentSubject && p.topic === topic,
    );
    const currentStatus = progressItem ? progressItem.status : 0;
    const nextStatus: 0 | 1 | 2 = ((currentStatus + 1) % 3) as 0 | 1 | 2;

    await kpssService.updateTopicStatus(currentSubject, topic, nextStatus);
    loadKpssData();
  };

  const handleStartQuiz = (topic: string) => {
    setActiveQuizTopic(topic);
    setQuizStep("intro");
    setSelectedQuizCount(5);
    setQuizQuestions([]);
    setQuizError(null);
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
  const estimatedScore = Math.round((45 + overallNet * 0.458) * 10) / 10;
  const scorePercentage = Math.min(100, Math.round((estimatedScore / targetScore) * 100));
  const isTargetAchieved = estimatedScore >= targetScore;

  return (
    <div id="kpss-view" className="view-content active">
      <div className="kpss-container">
        <header className="kpss-header">
          <h2>KPSS Hazırlık</h2>
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
        </div>
        {activeTab === "progress" && (
          <>
            <KpssCountdownBanner
              lang={lang}
              kpssTimeLeft={kpssTimeLeft}
              estimatedTimeLeft={estimatedTimeLeft}
              remainingCount={remainingCount}
            />
            <KpssNetEstimationCard
              lang={lang}
              targetScore={targetScore}
              overallNet={overallNet}
              maxNet={maxNet}
              estimatedScore={estimatedScore}
              scorePercentage={scorePercentage}
              isTargetAchieved={isTargetAchieved}
              onTargetScoreChange={handleTargetScoreChange}
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
              canvasRef={canvasRef}
              onQuestionsInputChange={setQuestionsInput}
              onVideosInputChange={setVideosInput}
              onSubjectInputChange={setSubjectInput}
              onSaveStats={handleSaveStats}
              onResetStats={handleResetStats}
              onChartDaysChange={setChartDays}
              labels={labels}
              subjectsList={Object.keys(kpssData)}
            />

            <KpssTopicList
              lang={lang}
              topics={topics}
              kpssProgress={kpssProgress}
              currentSubject={currentSubject}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onToggleTopic={handleToggleTopic}
              onStartQuiz={handleStartQuiz}
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
      {activeQuizTopic && (
        <div className="settings-panel active" onClick={() => { if (!quizLoading) { setActiveQuizTopic(null); } }}>
          <div className="settings-content" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <header className="settings-header">
              <h3>{activeQuizTopic}</h3>
              <button className="close-btn" onClick={() => setActiveQuizTopic(null)} disabled={quizLoading}>
                &times;
              </button>
            </header>

            <div className="note-editor-body" style={{ padding: "24px" }}>
              {quizStep === "intro" && (
                <div>
                  <h4 style={{ marginBottom: "12px", color: "var(--accent-color)" }}>
                    {lang === "tr" ? "Seviye Tespit Sınavı" : "Proficiency Quiz"}
                  </h4>
                  <p style={{ fontSize: "0.95rem", opacity: 0.8, lineHeight: 1.5 }}>
                    {lang === "tr"
                      ? "Seçtiğiniz konu hakkında yapay zekâ tarafından hazırlanan çoktan seçmeli bir test çözerek yetkinliğinizi ölçün. Soru sayısını seçip testi başlatabilirsiniz:"
                      : "Measure your proficiency by solving a multiple-choice test prepared by AI. Choose the question count to start:"}
                  </p>

                  <div className="kpss-question-count-grid">
                    {[5, 10, 15, 20, 25].map((count) => (
                      <button
                        key={count}
                        className={`kpss-qcount-btn ${selectedQuizCount === count ? "active" : ""}`}
                        onClick={() => setSelectedQuizCount(count)}
                      >
                        {count} {lang === "tr" ? "Soru" : "Q"}
                      </button>
                    ))}
                  </div>

                  {!aiApiKey && (
                    <div className="halka-arz-fallback-notice" style={{ marginTop: "16px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {lang === "tr"
                        ? "Yapay zekâ testini başlatmak için Ayarlar panelinden bir AI API Anahtarı girmelisiniz."
                        : "You must enter an AI API Key in the Settings panel to start the AI test."}
                    </div>
                  )}

                  <div className="settings-footer" style={{ padding: "16px 0 0 0", marginTop: "24px" }}>
                    <button
                      className="settings-add-btn"
                      style={{ width: "100%" }}
                      disabled={!aiApiKey}
                      onClick={() => fetchQuizFromAI(currentSubject, activeQuizTopic, selectedQuizCount)}
                    >
                      {lang === "tr" ? "Sınavı Başlat" : "Start Test"}
                    </button>
                  </div>
                </div>
              )}

              {quizStep === "questions" && quizLoading && (
                <div className="ha-loading" style={{ minHeight: "200px" }}>
                  <div className="ha-spinner" />
                  <span style={{ fontSize: "0.95rem" }}>
                    {lang === "tr"
                      ? "Yapay Zekâ seviye tespit sorularını oluşturuyor. Lütfen bekleyin..."
                      : "AI is generating proficiency questions. Please wait..."}
                  </span>
                </div>
              )}

              {quizStep === "questions" && quizError && (
                <div className="ha-error" style={{ minHeight: "200px" }}>
                  <span>{quizError}</span>
                  <button className="ha-retry-btn" onClick={() => fetchQuizFromAI(currentSubject, activeQuizTopic, selectedQuizCount)}>
                    {lang === "tr" ? "Tekrar Dene" : "Retry"}
                  </button>
                </div>
              )}

              {quizStep === "questions" && !quizLoading && !quizError && quizQuestions.length > 0 && (
                <div>
                  <div className="kpss-quiz-progress-bar-container">
                    <div
                      className="kpss-quiz-progress-fill"
                      style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", opacity: 0.6, marginBottom: "8px" }}>
                    <span>{lang === "tr" ? `Soru ${currentQuestionIndex + 1} / ${quizQuestions.length}` : `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`}</span>
                  </div>

                  <div className="kpss-quiz-question-container">
                    <div className="kpss-quiz-question-text">
                      {quizQuestions[currentQuestionIndex].question}
                    </div>
                  </div>

                  <div className="kpss-quiz-options-grid">
                    {quizQuestions[currentQuestionIndex].options.map((opt, oIdx) => {
                      const letter = ["A", "B", "C", "D", "E"][oIdx];
                      const isSelected = selectedAnswers[currentQuestionIndex] === oIdx;
                      return (
                        <div
                          key={oIdx}
                          className={`kpss-quiz-option-card ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            const nextAnswers = [...selectedAnswers];
                            nextAnswers[currentQuestionIndex] = oIdx;
                            setSelectedAnswers(nextAnswers);
                          }}
                        >
                          <div className="kpss-quiz-option-letter">{letter}</div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button
                      className="kpss-qcount-btn"
                      style={{ flex: 1 }}
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    >
                      {lang === "tr" ? "Önceki" : "Previous"}
                    </button>
                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <button
                        className="settings-add-btn"
                        style={{ flex: 1, padding: 0 }}
                        disabled={selectedAnswers[currentQuestionIndex] === -1}
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      >
                        {lang === "tr" ? "Sonraki" : "Next"}
                      </button>
                    ) : (
                      <button
                        className="settings-add-btn"
                        style={{ flex: 1, padding: 0 }}
                        disabled={selectedAnswers[currentQuestionIndex] === -1}
                        onClick={handleFinishQuiz}
                      >
                        {lang === "tr" ? "Sınavı Bitir" : "Finish Quiz"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quizStep === "result" && (
                <div style={{ textAlign: "center", padding: "12px" }}>
                  <h4 style={{ color: "var(--accent-color)", fontSize: "1.4rem", marginBottom: "16px" }}>
                    {lang === "tr" ? "Sınav Tamamlandı!" : "Quiz Completed!"}
                  </h4>
                  <div style={{ fontSize: "3.5rem", fontWeight: 800, color: quizResultScore >= 80 ? "#10b981" : quizResultScore >= 40 ? "#ffc107" : "#ef4444", marginBottom: "12px" }}>
                    %{quizResultScore}
                  </div>
                  <p style={{ opacity: 0.8, fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
                    {lang === "tr"
                      ? `Bu konuda %${quizResultScore} oranında yetkinlik gösterdiniz.`
                      : `You demonstrated a %${quizResultScore} proficiency in this topic.`}
                    <br />
                    <span style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "8px", display: "inline-block" }}>
                      {quizResultScore >= 80
                        ? (lang === "tr" ? "Tebrikler! Konu 'Tamamlandı' olarak işaretlendi." : "Congratulations! Topic successfully marked as 'Completed'.")
                        : quizResultScore >= 40
                          ? (lang === "tr" ? "Konu 'Çalışılıyor' durumuna getirildi." : "Topic set to 'Working' status.")
                          : (lang === "tr" ? "Konu 'Çalışılmadı' olarak sıfırlandı." : "Topic reset to 'Not Started'.")}
                    </span>
                  </p>

                  <div className="settings-footer" style={{ padding: 0 }}>
                    <button className="settings-add-btn" style={{ width: "100%" }} onClick={() => setActiveQuizTopic(null)}>
                      {lang === "tr" ? "Bitir" : "Finish"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
