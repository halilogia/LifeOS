import { useState, useEffect, useRef } from "preact/hooks";
import { WillpowerStreak, Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

interface WillpowerViewProps {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

export function WillpowerView({ lang, onShowConfirm }: WillpowerViewProps) {
  const t = getTranslation(lang);

  const [data, setData] = useState<WillpowerStreak | null>(null);
  const [note, setNote] = useState("");

  // Elapsed countdown states
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    const result = await new Promise<any>((resolve) =>
      chrome.storage.sync.get(["willpowerStreak"], (res) =>
        resolve(res.willpowerStreak),
      ),
    );
    let streakData = result;
    if (!streakData) {
      streakData = {
        startDate: new Date().toISOString(),
        bestStreakDays: 0,
        history: [],
      };
      chrome.storage.sync.set({ willpowerStreak: streakData });
    }
    setData(streakData);
    calculateTime(streakData.startDate);

    // Setup active countdown timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      calculateTime(streakData!.startDate);
    }, 1000);
  };

  const calculateTime = (startDateStr: string) => {
    const start = new Date(startDateStr).getTime();
    const now = new Date().getTime();
    const diffMs = Math.max(0, now - start);

    const diffSecs = Math.floor(diffMs / 1000);
    setDays(Math.floor(diffSecs / 86400));
    setHours(Math.floor((diffSecs % 86400) / 3600));
    setMinutes(Math.floor((diffSecs % 3600) / 60));
    setSeconds(diffSecs % 60);
  };

  const handleReset = () => {
    if (!data) {
      return;
    }

    const confirmMsg = t.willpower_reset_confirm;
    onShowConfirm(confirmMsg, async () => {
      // Calculate elapsed days
      const start = new Date(data.startDate).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);
      const diffSecs = Math.floor(diffMs / 1000);
      const finalDays = Math.floor(diffSecs / 86400);

      const nowStr = new Date().toISOString();

      // Push new history item
      const historyItem = {
        startDate: data.startDate,
        endDate: nowStr,
        days: finalDays,
        note: note.trim() || undefined,
      };

      const updatedData: WillpowerStreak = {
        startDate: nowStr,
        bestStreakDays: Math.max(data.bestStreakDays, finalDays),
        history: [...data.history, historyItem],
      };

      await new Promise<void>((resolve) =>
        chrome.storage.sync.set({ willpowerStreak: updatedData }, resolve),
      );
      setNote("");
      setData(updatedData);
      calculateTime(nowStr);

      // Restart timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        calculateTime(nowStr);
      }, 1000);
    });
  };

  const handleClearHistory = () => {
    if (!data) {return;}
    const confirmMsg = t.willpower_clear_history_confirm;
    onShowConfirm(confirmMsg, async () => {
      const updatedData: WillpowerStreak = {
        ...data,
        history: [],
      };
      await new Promise<void>((resolve) =>
        chrome.storage.sync.set({ willpowerStreak: updatedData }, resolve),
      );
      setData(updatedData);
    });
  };

  // Determine Rank Metadata
  let rankKey: string;
  if (days < 3) {
    rankKey = "initiate";
  } else if (days < 7) {
    rankKey = "iron";
  } else if (days < 14) {
    rankKey = "control";
  } else if (days < 30) {
    rankKey = "warrior";
  } else if (days < 90) {
    rankKey = "knight";
  } else {
    rankKey = "master";
  }

  const rankText = t[`willpower_rank_${rankKey}` as keyof typeof t] || rankKey;
  const rankDesc = t[`willpower_rank_${rankKey}_desc` as keyof typeof t] || "";
  const rankClass = `rank-${rankKey}`;

  const currentBest = data ? Math.max(data.bestStreakDays, days) : days;
  const historyList = data ? data.history : [];

  return (
    <div id="willpower-view" className="view-content active">
      <div className="willpower-container">
        <div className="willpower-header">
          <h2>{t.willpower_title}</h2>
          <div className="best-streak-badge">
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
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>{t.willpower_best_streak}</span>: <span>{currentBest}</span>{" "}
            <span>{t.willpower_clean_days}</span>
          </div>
        </div>

        {/* Counter Dashboard */}
        <div className="willpower-card main-counter-card">
          <div id="willpower-current-streak" className="willpower-countdown">
            <div className="time-block">
              <span id="wp-days" className="time-val">
                {String(days).padStart(2, "0")}
              </span>
              <span className="time-label">{t.willpower_clean_days}</span>
            </div>
            <div className="time-colon">:</div>
            <div className="time-block">
              <span id="wp-hours" class="time-val">
                {String(hours).padStart(2, "0")}
              </span>
              <span className="time-label">{t.willpower_hours}</span>
            </div>
            <div className="time-colon">:</div>
            <div className="time-block">
              <span id="wp-minutes" class="time-val">
                {String(minutes).padStart(2, "0")}
              </span>
              <span className="time-label">{t.willpower_minutes}</span>
            </div>
            <div className="time-colon">:</div>
            <div className="time-block">
              <span id="wp-seconds" class="time-val">
                {String(seconds).padStart(2, "0")}
              </span>
              <span className="time-label">{t.willpower_seconds}</span>
            </div>
          </div>
        </div>

        {/* Rank Card */}
        <div className="willpower-card rank-card">
          <div className={`rank-badge-container ${rankClass}`}>
            <div className="rank-icon-wrapper">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="rank-info">
              <div className="rank-header">
                <span className="rank-title-label">
                  {t.willpower_level_label}:
                </span>
                <span id="willpower-rank-text" className="rank-value">
                  {rankText}
                </span>
              </div>
              <p id="willpower-rank-desc" className="rank-desc">
                {rankDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Reset Input & Button */}
        <div className="willpower-card control-card">
          <div className="control-input-group">
            <input
              type="text"
              id="willpower-note-input"
              className="willpower-note-input"
              value={note}
              onInput={(e) => setNote((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => e.key === "Enter" && handleReset()}
              placeholder={t.willpower_note_placeholder}
              autocomplete="off"
            />
            <button
              id="willpower-reset-btn"
              className="willpower-reset-btn"
              onClick={handleReset}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <polyline points="3 3 3 8 8 8"></polyline>
              </svg>
              <span>{t.willpower_reset_btn}</span>
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="willpower-card history-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3 className="history-title" style={{ margin: 0 }}>
              {t.willpower_history}
            </h3>
            {historyList.length > 0 && (
              <button
                onClick={handleClearHistory}
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                title="Süreç Geçmişini Temizle"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Temizle</span>
              </button>
            )}
          </div>
          <div id="willpower-history-list" className="history-list">
            {historyList.length === 0 ? (
              <div className="history-empty">{t.willpower_history_empty}</div>
            ) : (
              [...historyList]
                .sort(
                  (a, b) =>
                    new Date(b.startDate).getTime() -
                    new Date(a.startDate).getTime(),
                )
                .map((item, idx) => {
                  const startDateFormatted = new Date(
                    item.startDate,
                  ).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US");
                  const endDateFormatted = new Date(
                    item.endDate,
                  ).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US");
                  const durationText = `${item.days} ${t.willpower_clean_days.toLowerCase()}`;
                  return (
                    <div key={idx} className="history-item">
                      <div className="history-item-left">
                        <span className="history-date">
                          {startDateFormatted} - {endDateFormatted}
                        </span>
                        {item.note && (
                          <span className="history-note" title={item.note}>
                            "{item.note}"
                          </span>
                        )}
                      </div>
                      <div className="history-item-right">
                        <span className="history-duration">{durationText}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
