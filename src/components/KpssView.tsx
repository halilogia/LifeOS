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
import { KpssAutoPlannerCard } from "@/components/kpss/KpssAutoPlannerCard.js";
import { KpssQuizModal } from "@/components/kpss/KpssQuizModal.js";

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
  const [activeTab, setActiveTab] = useState<"progress" | "srs">("progress");

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

  // Dynamic AI Fetcher with pre-fetch (1st question immediately, others in background)
  const fetchQuestionsSubsetFromAI = async (
    subjectKey: string,
    topicName: string,
    count: number,
    excludeQuestions: QuizQuestion[] = []
  ): Promise<QuizQuestion[]> => {
    const tStart = performance.now();
    console.log(`%c[AI Fetch - Start] Requesting ${count} questions for "${topicName}"`, "color: #a78bfa; font-weight: bold;");

    const subjectName = SUBJECT_NAMES[lang][subjectKey] || subjectKey;
    const systemPrompt = `Sen KPSS Lisans düzeyinde uzman bir öğretmensin. Kullanıcının seçeceği ders ve konu hakkında çoktan seçmeli bir test hazırlayacaksın. Hazırladığın test tamamen Türkçe dilinde olmalı ve KPSS formatına uygun, zorlayıcı olmalıdır. Soruları A, B, C, D, E olmak üzere tam 5 seçenekli hazırlayacaksın. Her sorunun doğru cevabını belirtirken aynı zamanda o sorunun açıklayıcı çözüm/açıklama metnini de ("solution") hazırlamalısın.
Eğer hazırladığın soru bir grafik okuma, nüfus/ekonomi istatistiği tablosu, çizgi grafik okuma veya geometri (üçgen açı/kenar, çember, paralel doğrular kesen) sorusu ise nesneye isteğe bağlı bir "chart" alanı ekle.
"chart" alanı şu formatlardan biri olmalıdır:
1. Sütun Grafiği: { "type": "bar", "title": "Grafik Başlığı", "labels": ["Oca", "Şub", "Mar"], "values": [15, 30, 25] }
2. Çizgi Grafiği: { "type": "line", "title": "Grafik Başlığı", "labels": ["1990", "2000", "2010"], "values": [120, 250, 480] }
3. Geometri Üçgen Şekli: { "type": "geometry", "shape": "triangle", "angles": { "A": "60°", "B": "x", "C": "80°" }, "sides": { "AB": "6", "BC": "8", "AC": "y" } }
4. Geometri Çember Şekli: { "type": "geometry", "shape": "circle", "sides": { "radius": "5" } }
5. Paralel Doğrular ve Açı Soruları: { "type": "geometry", "shape": "parallel_lines", "angles": { "top_right": "120°", "bottom_left": "x" } }

Eğer hazırladığın soru Türkiye Coğrafyası dersiyle ilgili ve harita bilgisi okumayı gerektiriyorsa (örn: "Haritada numaralandırılmış alanların hangisinde...", "Haritada taralı bölgelerin hangisinde..."), nesneye isteğe bağlı bir "map" alanı ekle.
"map" alanı şu yapıda olmalıdır:
{
  "highlightRegions": ["marmara" | "ege" | "akdeniz" | "karadeniz" | "ic_anadolu" | "dogu_anadolu" | "guneydogu_anadolu"], // Renklendirilecek coğrafi bölgelerin isimleri (birden fazla olabilir)
  "markers": [ // Harita üzerine yerleştirilecek işaretçiler (maksimum 5 adet). X ve Y değerleri 0-100 arasında yüzdesel koordinatlardır (Haritanın sol üst köşesi 0,0'dır)
    { "x": 18, "y": 42, "label": "I" },
    { "x": 48, "y": 78, "label": "II" }
  ]
}
Türkiye haritası koordinat ipuçları: Marmara civarı (x: 20-80, y: 15-40), Ege civarı (x: 10-60, y: 60-120), Akdeniz civarı (x: 110-220, y: 90-140), Karadeniz civarı (x: 120-330, y: 35-70), İç Anadolu (x: 120-220, y: 45-90), Doğu Anadolu (x: 220-385, y: 80-130), Güneydoğu Anadolu (x: 240-385, y: 130-160).

Yanıtını başka hiçbir açıklama yapmadan, SADECE geçerli bir JSON dizisi formatında döndürmelisin. Her nesne şu yapıda olmalıdır:
[
  {
    "question": "Soru metni...",
    "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği", "E seçeneği"],
    "correctAnswer": 0,
    "solution": "Sorunun detaylı çözümü...",
    "chart": { ... }, // İsteğe bağlı
    "map": { ... } // Coğrafya harita soruları için isteğe bağlı
  }
]
(correctAnswer 0-4 arasında doğru seçeneğin indeksidir). Kesinlikle JSON formatı dışında hiçbir açıklama, giriş veya kod bloğu dışı metin yazma. Sadece geçerli JSON döndür.`;

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
        stream: false
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
        stream: false
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
          responseMimeType: "application/json"
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
    setQuizError(null);
    setQuizStep("questions");
    setQuizQuestions([]);

    try {
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
          });
      }
    } catch (err: any) {
      console.error("AI quiz generation error:", err);
      setQuizError(lang === "tr" ? "Sınav soruları oluşturulurken yapay zekâ bir hata verdi. Lütfen tekrar deneyin." : "AI failed to generate quiz questions. Please try again.");
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
