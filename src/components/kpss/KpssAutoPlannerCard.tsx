import { useState } from "preact/hooks";
import { Language, KpssProgress } from "@/types/types.js";
import { kpssData } from "@/services/kpssService.js";

interface KpssAutoPlannerCardProps {
  lang: Language;
  kpssProgress: KpssProgress[];
  onStartQuiz: (subject: string, topicTitle: string) => void;
  labels: Record<string, string>;
}

export function KpssAutoPlannerCard({
  lang,
  kpssProgress,
  onStartQuiz,
  labels,
}: KpssAutoPlannerCardProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 1. Calculate remaining days until exam (September 6, 2026 10:15)
  const examDate = new Date("2026-09-06T10:15:00").getTime();
  const diffTime = examDate - Date.now();
  const daysRemaining = Math.max(
    1,
    Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
  );

  // 2. Map all uncompleted topics across all subjects in standard order
  const subjectsOrder = [
    "turkce",
    "matematik",
    "geometri",
    "tarih",
    "cografya",
    "vatandaslik",
  ];
  const flatUncompleted: Array<{
    subjectKey: string;
    subjectLabel: string;
    topicTitle: string;
    description: string;
    questionsCount: number;
  }> = [];

  subjectsOrder.forEach((subKey) => {
    const list = kpssData[subKey] || [];
    const subLabel = labels[subKey] || subKey;
    list.forEach((t) => {
      // Find if this topic is completed (status === 2)
      const prog = kpssProgress.find(
        (p) => p.subject === subKey && p.topic === t.title,
      );
      const isCompleted = prog ? prog.status === 2 : false;
      if (!isCompleted) {
        flatUncompleted.push({
          subjectKey: subKey,
          subjectLabel: subLabel,
          topicTitle: t.title,
          description: t.description,
          questionsCount: t.questionsCount,
        });
      }
    });
  });

  const totalUncompleted = flatUncompleted.length;
  const workloadRate = totalUncompleted / daysRemaining;

  // 3. Select today's topics: those distributed to the first day segment (dayIndex === 0)
  const todaysTopics = flatUncompleted.filter(
    (_, idx) => Math.floor((idx / totalUncompleted) * daysRemaining) === 0,
  );

  const getWorkloadWarning = () => {
    if (workloadRate > 3.0) {
      return {
        text:
          lang === "tr"
            ? "Yoğun Çalışma Gerekli (Hızlanmalısınız)"
            : "Heavy Study Required (Speed up)",
        color: "#ef4444",
      };
    }
    if (workloadRate > 1.5) {
      return {
        text: lang === "tr" ? "Orta Düzey Çalışma Hızı" : "Moderate Study Pace",
        color: "var(--accent-color)",
      };
    }
    return {
      text: lang === "tr" ? "İdeal Çalışma Hızı" : "Optimal Study Pace",
      color: "#10b981",
    };
  };

  const warning = getWorkloadWarning();

  return (
    <div
      className="mini-tool-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyBox: "space-between",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style={{ color: "var(--accent-color)" }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span style={{ fontSize: "0.95rem", fontWeight: "700" }}>
            {lang === "tr"
              ? "KPSS Günlük Konu Planlayıcı"
              : "KPSS Daily Auto-Planner"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowInfoModal(true)}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--accent-color)",
            outline: "none",
            transition: "all 0.2s ease",
          }}
          title={lang === "tr" ? "Sistem Nasıl Çalışır?" : "How does it work?"}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      </div>

      {totalUncompleted === 0 ? (
        <div
          style={{
            padding: "12px",
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            borderRadius: "10px",
            textAlign: "center",
            color: "#10b981",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          🎉{" "}
          {lang === "tr"
            ? "Tebrikler! Tüm KPSS konularını başarıyla tamamladınız."
            : "Congrats! You successfully completed all KPSS topics."}
        </div>
      ) : (
        <>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {lang === "tr"
              ? "Sınava kalan süreye ve konu yükünüze göre bugün tamamlamanız önerilen konular (Başlatmak için tıklayın):"
              : "Recommended topics to review today based on remaining time and topic density (Click to start):"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {todaysTopics.map((item, idx) => {
              const prog = kpssProgress.find(
                (p) =>
                  p.subject === item.subjectKey && p.topic === item.topicTitle,
              );
              const status = prog ? prog.status : 0;
              return (
                <div
                  key={idx}
                  onClick={() => onStartQuiz(item.subjectKey, item.topicTitle)}
                  className="kpss-topic-recommendation-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 6px",
                        background: "rgba(139, 92, 246, 0.15)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        color: "var(--accent-color)",
                        borderRadius: "4px",
                        fontWeight: "700",
                      }}
                    >
                      {item.subjectLabel}
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      {item.topicTitle}
                    </span>
                  </div>
                  <div>
                    {status === 1 ? (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: "#ffc107",
                          background: "rgba(255, 193, 7, 0.1)",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: "600",
                        }}
                      >
                        {lang === "tr" ? "Çalışılıyor" : "Working"}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.4)",
                          background: "rgba(255, 255, 255, 0.04)",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontWeight: "600",
                        }}
                      >
                        {lang === "tr" ? "Başlanmadı" : "Not Started"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Planner Stats Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              background: "rgba(255,255,255,0.01)",
              border: "1px solid var(--card-border)",
              padding: "10px 14px",
              borderRadius: "10px",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <span>
                <strong>{lang === "tr" ? "Kalan Gün:" : "Days Left:"}</strong>{" "}
                {daysRemaining}
              </span>
              <span>
                <strong>
                  {lang === "tr" ? "Kalan Konu:" : "Topics Left:"}
                </strong>{" "}
                {totalUncompleted}
              </span>
              <span>
                <strong>{lang === "tr" ? "Günlük Hız:" : "Daily Rate:"}</strong>{" "}
                {workloadRate.toFixed(1)}/gün
              </span>
            </div>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 8px",
                background: `${warning.color}15`,
                border: `1px solid ${warning.color}30`,
                color: warning.color,
                borderRadius: "50px",
                fontWeight: "700",
              }}
            >
              {warning.text}
            </span>
          </div>
        </>
      )}

      {/* Info Explanation Modal */}
      {showInfoModal && (
        <div
          onClick={() => setShowInfoModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(30, 30, 46, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              color: "#f1f5f9",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  color: "var(--accent-color)",
                }}
              >
                {lang === "tr"
                  ? "KPSS Planlayıcı Nasıl Çalışır?"
                  : "How KPSS Planner Works?"}
              </span>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: 1.6,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {lang === "tr" ? (
                <>
                  <p>
                    <strong>1. Kalan Gün Hesabı:</strong> Sınav tarihi (6 Eylül
                    2026) ile bugün arasındaki kalan gün sayısını hesaplar.
                  </p>
                  <p>
                    <strong>2. Konu Dağıtımı:</strong> Henüz tamamlanmamış
                    (durumu "Tamamlandı" olmayan) tüm konularınızı kalan gün
                    sayısına dengeli bir şekilde böler ve her güne eşit iş yükü
                    çıkarır.
                  </p>
                  <p>
                    <strong>3. Günlük Çalışma Hızı:</strong> Kalan toplam konu
                    sayısının kalan gün sayısına oranıdır (Konu/Gün). Bu oran
                    1.5'in üstündeyse mor, 3.0'ın üstündeyse kırmızı renkli
                    uyarı gösterilir.
                  </p>
                  <p>
                    <strong>4. Günlük Soru Hedefi:</strong> Ayarlarda
                    belirlediğiniz hedef nete ulaşabilmeniz için çözmeniz
                    gereken toplam soru sayısı KPSS konu ağırlıklarına göre
                    dağıtılır. Günlük soru hedefiniz: <br />
                    <code
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      (Kalan Hedef Soru / Kalan Gün Sayısı)
                    </code>{" "}
                    formülüyle dinamik olarak her gün güncellenir.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Days Left Calculation:</strong> Calculates the
                    exact days remaining until the exam date (September 6,
                    2026).
                  </p>
                  <p>
                    <strong>2. Topic Distribution:</strong> Filters all
                    uncompleted topics and spreads them evenly across the
                    remaining days to keep you on track.
                  </p>
                  <p>
                    <strong>3. Daily Study Pace:</strong> Calculated by dividing
                    remaining topics by remaining days. Rates above 1.5
                    highlight moderate pace, and above 3.0 require high
                    intensity.
                  </p>
                  <p>
                    <strong>4. Daily Question Target:</strong> Based on your
                    target net configured in settings, total required questions
                    are distributed by subject weights. Your daily target
                    updates using: <br />
                    <code
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      (Target Questions Left / Days Remaining)
                    </code>{" "}
                    dynamically each day.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              style={{
                alignSelf: "flex-end",
                background: "var(--accent-color)",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                fontWeight: "600",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
              }
            >
              {lang === "tr" ? "Kapat" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
