import { kpssData } from "@/domain/constants/kpssCurriculum.js";

interface KpssStatsInputFormProps {
  t: Record<string, string>;
  labels: Record<string, string>;
  videosInput: string;
  subjectInput: string;
  statsTopicInput: string;
  statsCorrectInput: string;
  statsWrongInput: string;
  subjectsList: string[];
  onVideosInputChange: (val: string) => void;
  onSubjectInputChange: (val: string) => void;
  onStatsTopicInputChange: (val: string) => void;
  onStatsCorrectInputChange: (val: string) => void;
  onStatsWrongInputChange: (val: string) => void;
  onSaveStats: () => void;
  onResetStats: () => void;
}

export function KpssStatsInputForm({
  t,
  labels,
  videosInput,
  subjectInput,
  statsTopicInput,
  statsCorrectInput,
  statsWrongInput,
  subjectsList,
  onVideosInputChange,
  onSubjectInputChange,
  onStatsTopicInputChange,
  onStatsCorrectInputChange,
  onStatsWrongInputChange,
  onSaveStats,
  onResetStats,
}: KpssStatsInputFormProps) {
  const correct = parseInt(statsCorrectInput, 10) || 0;
  const wrong = parseInt(statsWrongInput, 10) || 0;
  const total = correct + wrong;
  const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Konu listesi — seçilen derse göre filtre
  const topicOptions = (kpssData[subjectInput] || []).map((tp) => tp.title);

  const scoreColor =
    scorePercent >= 80
      ? "#10b981"
      : scorePercent >= 40
        ? "#f59e0b"
        : scorePercent > 0
          ? "#ef4444"
          : "var(--text-secondary)";

  const scoreLabel =
    scorePercent >= 80
      ? "Mükemmel"
      : scorePercent >= 60
        ? "İyi"
        : scorePercent >= 40
          ? "Geliştirilmeli"
          : scorePercent > 0
            ? "Tekrar Et"
            : "—";

  // Skor çarkı
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scorePercent / 100) * circumference;

  const handleSubjectChange = (val: string) => {
    onSubjectInputChange(val);
    onStatsTopicInputChange(""); // ders değişince konu sıfırlanır
  };

  return (
    <div className="kpss-daily-input">
      <h3>{labels.stats_title}</h3>
      <div className="kpss-stats-inputs">
        <div className="kpss-input-group">
          <label htmlFor="kpss-subject-select">{labels.stat_subject}</label>
          <select
            id="kpss-subject-select"
            value={subjectInput}
            onChange={(e) =>
              handleSubjectChange((e.target as HTMLSelectElement).value)
            }
          >
            {subjectsList.map((subKey) => (
              <option key={subKey} value={subKey}>
                {labels[subKey] || subKey}
              </option>
            ))}
          </select>
        </div>

        <div className="kpss-input-group">
          <label htmlFor="kpss-topic-select">{t.kpss_stats_topic}</label>
          <select
            id="kpss-topic-select"
            value={statsTopicInput}
            onChange={(e) =>
              onStatsTopicInputChange((e.target as HTMLSelectElement).value)
            }
          >
            <option value="">{t.kpss_stats_topic_placeholder}</option>
            {topicOptions.map((topicTitle) => (
              <option key={topicTitle} value={topicTitle}>
                {topicTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Konu seçildiyse doğru/yanlış girişi + canlı skor gösterimi */}
        {statsTopicInput && (
          <div className="kpss-book-result">
            <div className="kpss-ext-result__main">
              <div className="kpss-ext-result__ring-wrap">
                <svg className="kpss-ext-result__ring" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    stroke-width="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={
                      scorePercent > 0 ? scoreColor : "rgba(255,255,255,0.06)"
                    }
                    stroke-width="8"
                    stroke-linecap="round"
                    stroke-dasharray={circumference}
                    stroke-dashoffset={dashOffset}
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "50% 50%",
                      transition:
                        "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease",
                    }}
                  />
                  <text
                    x="50"
                    y="44"
                    text-anchor="middle"
                    font-size="18"
                    font-weight="800"
                    fill={
                      scorePercent > 0 ? scoreColor : "rgba(255,255,255,0.3)"
                    }
                    font-family="inherit"
                  >
                    {scorePercent > 0 ? `%${scorePercent}` : "—"}
                  </text>
                  <text
                    x="50"
                    y="60"
                    text-anchor="middle"
                    font-size="7.5"
                    font-weight="600"
                    fill="rgba(255,255,255,0.45)"
                    font-family="inherit"
                  >
                    {scoreLabel}
                  </text>
                </svg>
              </div>

              <div className="kpss-ext-result__fields">
                <div className="kpss-ext-result__field">
                  <label
                    className="kpss-ext-result__label"
                    style={{ color: "#10b981" }}
                  >
                    {t.kpss_stats_correct}
                  </label>
                  <div className="kpss-ext-result__input-wrap">
                    <input
                      type="number"
                      className="kpss-ext-result__input kpss-ext-result__input--correct"
                      value={statsCorrectInput}
                      min={0}
                      onInput={(e) =>
                        onStatsCorrectInputChange(
                          (e.target as HTMLInputElement).value,
                        )
                      }
                    />
                    <span className="kpss-ext-result__input-unit">✓</span>
                  </div>
                </div>
                <div className="kpss-ext-result__field">
                  <label
                    className="kpss-ext-result__label"
                    style={{ color: "#ef4444" }}
                  >
                    {t.kpss_stats_wrong}
                  </label>
                  <div className="kpss-ext-result__input-wrap">
                    <input
                      type="number"
                      className="kpss-ext-result__input kpss-ext-result__input--wrong"
                      value={statsWrongInput}
                      min={0}
                      onInput={(e) =>
                        onStatsWrongInputChange(
                          (e.target as HTMLInputElement).value,
                        )
                      }
                    />
                    <span
                      className="kpss-ext-result__input-unit"
                      style={{ color: "#ef4444" }}
                    >
                      ✗
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doğru/yanlış dağılım barı */}
            <div className="kpss-ext-result__bar-wrap">
              <div
                className="kpss-ext-result__bar-fill"
                style={{
                  width: `${scorePercent}%`,
                  background: `linear-gradient(90deg, ${scoreColor}bb, ${scoreColor})`,
                }}
              />
              <div
                className="kpss-ext-result__bar-fill kpss-ext-result__bar-fill--wrong"
                style={{
                  width: `${total > 0 ? (wrong / total) * 100 : 0}%`,
                  marginLeft: `${scorePercent}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="kpss-input-group">
          <label htmlFor="kpss-videos-input">{t.kpss_videos_watched}</label>
          <input
            type="number"
            id="kpss-videos-input"
            value={videosInput}
            onInput={(e) =>
              onVideosInputChange((e.target as HTMLInputElement).value)
            }
            placeholder="0"
            min="0"
          />
        </div>

        <div className="kpss-action-btns">
          <button id="kpss-save-stats-btn" onClick={onSaveStats}>
            {labels.save}
          </button>
          <button
            id="kpss-reset-stats-btn"
            className="secondary"
            onClick={onResetStats}
          >
            {labels.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
