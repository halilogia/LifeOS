import { useState, useEffect, useRef } from "preact/hooks";
import { kpssService, kpssData } from "../services/kpssService.js";
import { KpssProgress, KpssDailyStats, Language } from "../types/types.js";

interface KpssViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
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

export function KpssView({ lang, onShowConfirm }: KpssViewProps) {
  const labels = SUBJECT_NAMES[lang] || SUBJECT_NAMES.tr;

  const [currentSubject, setCurrentSubject] = useState("turkce");
  const [kpssProgress, setKpssProgress] = useState<KpssProgress[]>([]);
  const [dailyStats, setDailyStats] = useState<KpssDailyStats[]>([]);

  // Input states
  const [questionsInput, setQuestionsInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("turkce");

  // Detail Modal
  const [activeTopic, setActiveTopic] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadKpssData();
  }, []);

  useEffect(() => {
    loadKpssData();
  }, [currentSubject]);

  useEffect(() => {
    drawChart();
  }, [dailyStats]);

  const loadKpssData = async () => {
    const progress = await kpssService.getKpssProgress();
    const stats = await kpssService.getKpssDailyStats();
    setKpssProgress(progress);
    setDailyStats(stats);
  };

  // Render chart on HTML Canvas using 2D context
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const stats = dailyStats;
    const last7Days = stats.slice(-7);
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

    const maxQuestions = Math.max(...last7Days.map((s) => s.questions), 10);

    ctx.clearRect(0, 0, width, height);

    if (last7Days.length === 0) {
      return;
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    const barGap = 15;
    const barWidth =
      (chartWidth - barGap * (last7Days.length - 1)) / last7Days.length;

    last7Days.forEach((stat, i) => {
      const x = padding + i * (barWidth + barGap);
      const barHeight = (stat.questions / maxQuestions) * chartHeight;
      const y = height - padding - barHeight;

      const accentColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-color")
          .trim() || "#8b5cf6";

      // Draw rounded bar
      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, accentColor);
      gradient.addColorStop(1, "rgba(139, 92, 246, 0.1)");
      ctx.fillStyle = gradient;

      const radius = 6;
      ctx.beginPath();
      if (barHeight > radius) {
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, Math.max(barHeight, 2));
      }
      ctx.fill();

      // Draw date labels
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "500 10px Inter";
      ctx.textAlign = "center";
      const dateParts = stat.date.split("-");
      const dateLabel = `${dateParts[2]}/${dateParts[1]}`;
      ctx.fillText(dateLabel, x + barWidth / 2, height - padding + 18);

      // Draw values
      ctx.fillStyle = "white";
      ctx.font = "bold 11px Inter";
      ctx.fillText(stat.questions.toString(), x + barWidth / 2, y - 8);
    });
  };

  // Log progress updates
  const handleToggleTopic = async (topic: string) => {
    const progressItem = kpssProgress.find(
      (p) => p.subject === currentSubject && p.topic === topic,
    );
    const currentStatus = progressItem ? progressItem.status : 0;
    const nextStatus: 0 | 1 | 2 = ((currentStatus + 1) % 3) as 0 | 1 | 2;

    await kpssService.updateTopicStatus(currentSubject, topic, nextStatus);
    loadKpssData();
  };

  // Add daily studies count
  const handleSaveStats = async () => {
    const questions = parseInt(questionsInput, 10);
    if (questions > 0) {
      await kpssService.saveKpssDailyStats(questions, subjectInput);
      setQuestionsInput("");
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

  const topics = kpssData[currentSubject] || [];

  // Subject progress percentage
  const completedTopicsCount = kpssProgress.filter(
    (p) => p.subject === currentSubject && p.status === 2,
  ).length;
  const inProgressTopicsCount = kpssProgress.filter(
    (p) => p.subject === currentSubject && p.status === 1,
  ).length;

  const totalTopics = topics.length;
  const progressPercentage =
    totalTopics > 0
      ? Math.round(
          ((completedTopicsCount + inProgressTopicsCount * 0.5) / totalTopics) *
            100,
        )
      : 0;

  const last7DaysData = dailyStats.slice(-7);
  const showChartPlaceholder = last7DaysData.length === 0;

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

        {/* Dashboard Stat Progress Inputs and Charts */}
        <div className="kpss-daily-stats-section">
          <div className="kpss-daily-input">
            <h3>{labels.stats_title}</h3>
            <div className="kpss-stats-inputs">
              <div className="kpss-input-group">
                <label for="kpss-questions-input">
                  {labels.stat_questions}
                </label>
                <input
                  type="number"
                  id="kpss-questions-input"
                  value={questionsInput}
                  onInput={(e) =>
                    setQuestionsInput((e.target as HTMLInputElement).value)
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="kpss-input-group">
                <label for="kpss-subject-select">{labels.stat_subject}</label>
                <select
                  id="kpss-subject-select"
                  value={subjectInput}
                  onChange={(e) =>
                    setSubjectInput((e.target as HTMLSelectElement).value)
                  }
                >
                  {Object.keys(kpssData).map((subKey) => (
                    <option key={subKey} value={subKey}>
                      {labels[subKey] || subKey}
                    </option>
                  ))}
                </select>
              </div>
              <div className="kpss-action-btns">
                <button id="kpss-save-stats-btn" onClick={handleSaveStats}>
                  {labels.save}
                </button>
                <button
                  id="kpss-reset-stats-btn"
                  className="secondary"
                  onClick={handleResetStats}
                >
                  {labels.reset}
                </button>
              </div>
            </div>
          </div>

          <div className="kpss-chart-container">
            <canvas
              ref={canvasRef}
              id="kpss-history-chart"
              style={{ display: showChartPlaceholder ? "none" : "block" }}
            ></canvas>
            {showChartPlaceholder && (
              <div id="kpss-chart-placeholder" className="chart-placeholder">
                <p>{labels.chart_empty}</p>
              </div>
            )}
          </div>
        </div>

        {/* Topic checklist details */}
        <div className="kpss-content">
          <div id="kpss-topic-list" className="kpss-topic-list">
            {topics.map((t) => {
              const progress = kpssProgress.find(
                (p) => p.subject === currentSubject && p.topic === t.title,
              );
              const status = progress ? progress.status : 0;
              return (
                <div
                  key={t.title}
                  className="kpss-topic-item"
                  data-status={status.toString()}
                  onClick={() => handleToggleTopic(t.title)}
                >
                  <div className="kpss-status-indicator">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="kpss-topic-name">{t.title}</span>
                  <button
                    className="kpss-info-btn"
                    title="Detay"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTopic({
                        title: t.title,
                        description: t.description,
                      });
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress tracker metrics */}
        <div className="kpss-progress-bar-container">
          <div className="kpss-progress-info">
            <span id="kpss-subject-title">
              {labels[currentSubject] || currentSubject}
            </span>
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
      </div>

      {/* Details Description Modal */}
      {activeTopic && (
        <div
          className="settings-panel active"
          onClick={() => setActiveTopic(null)}
        >
          <div
            className="settings-content"
            style={{ maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header">
              <h3>{labels.details_title}</h3>
              <button
                className="close-btn"
                onClick={() => setActiveTopic(null)}
              >
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
    </div>
  );
}
