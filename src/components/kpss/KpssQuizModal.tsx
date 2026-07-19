import { useState } from "preact/hooks";
import { KpssQuestionCanvas } from "@/components/kpss/KpssQuestionCanvas.js";
import { KpssQuestionMap } from "@/components/kpss/KpssQuestionMap.js";
import { MathRenderer } from "@/components/kpss/MathRenderer.js";

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

interface KpssQuizModalProps {
  lang: string;
  currentSubject: string;
  activeQuizTopic: string | null;
  quizStep: "intro" | "questions" | "result";
  selectedQuizCount: number;
  quizLoading: boolean;
  isBackgroundLoading: boolean;
  quizQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswers: number[];
  quizResultScore: number;
  quizError: string | null;
  aiApiKey: string;
  aiEndpoint: string;
  onClose: () => void;
  onSetSelectedQuizCount: (count: number) => void;
  onStartQuiz: () => void;
  onSelectAnswer: (oIdx: number) => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onFinishQuiz: () => void;
  onRetakeQuiz: () => void;
  subjectNames: Record<string, string>;
}

export function KpssQuizModal({
  lang,
  currentSubject,
  activeQuizTopic,
  quizStep,
  selectedQuizCount,
  quizLoading,
  isBackgroundLoading,
  quizQuestions,
  currentQuestionIndex,
  selectedAnswers,
  quizResultScore,
  quizError,
  aiApiKey,
  aiEndpoint,
  onClose,
  onSetSelectedQuizCount,
  onStartQuiz,
  onSelectAnswer,
  onPreviousQuestion,
  onNextQuestion,
  onFinishQuiz,
  onRetakeQuiz,
  subjectNames,
}: KpssQuizModalProps) {
  if (!activeQuizTopic) return null;

  const totalQuizLength = isBackgroundLoading ? selectedQuizCount : quizQuestions.length;

  return (
    <div className="settings-panel active" onClick={onClose}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", width: "95%" }}>
        <div className="settings-header">
          <h3>{activeQuizTopic}</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-body" style={{ padding: "20px" }}>
          {quizStep === "intro" && (
            <div style={{ textAlign: "center", padding: "12px" }}>
              <h4 style={{ color: "var(--accent-color)", marginBottom: "12px" }}>
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
                    onClick={() => onSetSelectedQuizCount(count)}
                  >
                    {count} {lang === "tr" ? "Soru" : "Q"}
                  </button>
                ))}
              </div>

              {!(aiApiKey || (aiEndpoint && (aiEndpoint.includes("localhost") || aiEndpoint.includes("127.0.0.1")))) && (
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
                  disabled={!(aiApiKey || (aiEndpoint && (aiEndpoint.includes("localhost") || aiEndpoint.includes("127.0.0.1"))))}
                  onClick={onStartQuiz}
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
              <button className="ha-retry-btn" onClick={onStartQuiz}>
                {lang === "tr" ? "Tekrar Dene" : "Retry"}
              </button>
            </div>
          )}

          {quizStep === "questions" && !quizLoading && !quizError && quizQuestions.length > 0 && (
            <div>
              <div className="kpss-quiz-progress-bar-container">
                <div
                  className="kpss-quiz-progress-fill"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuizLength) * 100}%` }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", opacity: 0.6, marginBottom: "8px" }}>
                <span>{lang === "tr" ? `Soru ${currentQuestionIndex + 1} / ${totalQuizLength}` : `Question ${currentQuestionIndex + 1} / ${totalQuizLength}`}</span>
              </div>

              {quizQuestions[currentQuestionIndex].chart && (
                <KpssQuestionCanvas chart={quizQuestions[currentQuestionIndex].chart} />
              )}

              {quizQuestions[currentQuestionIndex].map && (
                <KpssQuestionMap map={quizQuestions[currentQuestionIndex].map} />
              )}

              <div className="kpss-quiz-question-container">
                <div className="kpss-quiz-question-text">
                  <MathRenderer text={quizQuestions[currentQuestionIndex].question} />
                </div>
              </div>

              <div className="kpss-quiz-options-grid">
                {quizQuestions[currentQuestionIndex].options.map((opt, oIdx) => {
                  const letter = ["A", "B", "C", "D", "E"][oIdx];
                  const isAnswered = selectedAnswers[currentQuestionIndex] !== -1;
                  const isSelected = selectedAnswers[currentQuestionIndex] === oIdx;
                  const isCorrect = oIdx === quizQuestions[currentQuestionIndex].correctAnswer;
                  
                  let cardStyle: any = {
                    transition: "all 0.2s ease",
                  };
                  
                  if (isAnswered) {
                    if (isCorrect) {
                      cardStyle = {
                        ...cardStyle,
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        background: "rgba(16, 185, 129, 0.08)",
                        color: "#34d399",
                        cursor: "default"
                      };
                    } else if (isSelected) {
                      cardStyle = {
                        ...cardStyle,
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "#f87171",
                        cursor: "default"
                      };
                    } else {
                      cardStyle = {
                        ...cardStyle,
                        opacity: 0.4,
                        cursor: "default"
                      };
                    }
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`kpss-quiz-option-card ${isSelected && !isAnswered ? "selected" : ""}`}
                      style={cardStyle}
                      onClick={() => onSelectAnswer(oIdx)}
                    >
                      <div
                        className="kpss-quiz-option-letter"
                        style={isAnswered && isCorrect ? { background: "#10b981", color: "white" } : (isAnswered && isSelected ? { background: "#ef4444", color: "white" } : {})}
                      >
                        {letter}
                      </div>
                      <span><MathRenderer text={opt} /></span>
                    </div>
                  );
                })}
              </div>

              {/* Solution display box */}
              {selectedAnswers[currentQuestionIndex] !== -1 && (
                <div style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderLeft: "4px solid var(--accent-color)",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                  color: "rgba(255, 255, 255, 0.7)",
                  textAlign: "left"
                }}>
                  <div style={{ fontWeight: "700", color: "var(--accent-color)", marginBottom: "4px" }}>
                    {lang === "tr" ? "Çözüm Açıklaması:" : "Solution & Explanation:"}
                  </div>
                  <MathRenderer text={quizQuestions[currentQuestionIndex].solution || (lang === "tr" ? "Çözüm bilgisi bulunmuyor." : "No solution provided.")} />
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  className="kpss-qcount-btn"
                  style={{ flex: 1 }}
                  disabled={currentQuestionIndex === 0}
                  onClick={onPreviousQuestion}
                >
                  {lang === "tr" ? "Önceki" : "Previous"}
                </button>
                {currentQuestionIndex < totalQuizLength - 1 ? (
                  <button
                    className={`settings-add-btn ${currentQuestionIndex >= quizQuestions.length - 1 ? "loading" : ""}`}
                    style={{ flex: 1, padding: 0 }}
                    disabled={selectedAnswers[currentQuestionIndex] === -1 || currentQuestionIndex >= quizQuestions.length - 1}
                    onClick={onNextQuestion}
                  >
                    {currentQuestionIndex >= quizQuestions.length - 1 ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <span className="kpss-btn-loader" />
                        {lang === "tr" ? "Sonraki (Yükleniyor...)" : "Next (Loading...)"}
                      </span>
                    ) : (
                      lang === "tr" ? "Sonraki" : "Next"
                    )}
                  </button>
                ) : (
                  <button
                    className="settings-add-btn"
                    style={{ flex: 1, padding: 0 }}
                    disabled={selectedAnswers[currentQuestionIndex] === -1}
                    onClick={onFinishQuiz}
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
              <p style={{ opacity: 0.8, fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "20px" }}>
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

              {/* Scrollable Questions Review list */}
              <div style={{
                maxHeight: "220px",
                overflowY: "auto",
                textAlign: "left",
                marginBottom: "24px",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "12px",
                padding: "12px",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                <h5 style={{ margin: "0 0 12px 0", fontSize: "0.88rem", color: "var(--accent-color)", fontWeight: "600" }}>
                  {lang === "tr" ? "Soruları İncele:" : "Review Questions:"}
                </h5>
                {quizQuestions.map((q, qIdx) => {
                  const userAns = selectedAnswers[qIdx];
                  const isCorrect = userAns === q.correctAnswer;
                  return (
                    <div key={qIdx} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: qIdx < quizQuestions.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none" }}>
                      <p style={{ margin: "0 0 8px 0", fontWeight: "600", fontSize: "0.82rem", color: "#ffffff" }}>
                        {qIdx + 1}. <MathRenderer text={q.question} />
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "8px", marginBottom: "8px" }}>
                        {q.options.map((opt, oIdx) => {
                          const letter = ["A", "B", "C", "D", "E"][oIdx];
                          const isCorrectOpt = oIdx === q.correctAnswer;
                          const isSelectedOpt = userAns === oIdx;
                          let color = "var(--text-secondary)";
                          let weight = "normal";
                          if (isCorrectOpt) {
                            color = "#10b981";
                            weight = "600";
                          } else if (isSelectedOpt) {
                            color = "#ef4444";
                            weight = "600";
                          }
                          return (
                            <span key={oIdx} style={{ fontSize: "0.78rem", color, fontWeight: weight }}>
                              {letter}) <MathRenderer text={opt} /> {isSelectedOpt && (lang === "tr" ? " (Sizin Cevabınız)" : " (Your Answer)")} {isCorrectOpt && (lang === "tr" ? " (Doğru Cevap)" : " (Correct Answer)")}
                            </span>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.65)", background: "rgba(255, 255, 255, 0.02)", padding: "8px", borderRadius: "6px", borderLeft: "3px solid var(--accent-color)" }}>
                        <strong>{lang === "tr" ? "Çözüm: " : "Solution: "}</strong> <MathRenderer text={q.solution || (lang === "tr" ? "Çözüm bilgisi bulunmuyor." : "No solution provided.")} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="settings-footer" style={{ padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button
                    className="kpss-qcount-btn"
                    style={{ flex: 1 }}
                    onClick={onRetakeQuiz}
                  >
                    {lang === "tr" ? "Seviyeni Tekrar Çöz" : "Re-take Test"}
                  </button>
                  <button
                    className="kpss-qcount-btn"
                    style={{ flex: 1 }}
                    onClick={() => {
                      let text = `KPSS Sınav Raporu\n`;
                      text += `Ders: ${subjectNames[currentSubject] || currentSubject}\n`;
                      text += `Konu: ${activeQuizTopic}\n`;
                      text += `Skor: %${quizResultScore}\n`;
                      text += `Tarih: ${new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}\n`;
                      text += `=========================================\n\n`;

                      quizQuestions.forEach((q, idx) => {
                        const userAnsIdx = selectedAnswers[idx];
                        const correctAnsIdx = q.correctAnswer;
                        const letters = ["A", "B", "C", "D", "E"];
                        
                        text += `Soru ${idx + 1}: ${q.question}\n`;
                        q.options.forEach((opt, oIdx) => {
                          text += `${letters[oIdx]}) ${opt}\n`;
                        });
                        text += `-----------------------------------------\n`;
                        text += `Sizin Cevabınız: ${userAnsIdx !== -1 ? letters[userAnsIdx] : "Boş"}\n`;
                        text += `Doğru Cevap: ${letters[correctAnsIdx]}\n`;
                        text += `Çözüm: ${q.solution || "Açıklama bulunmuyor."}\n`;
                        text += `=========================================\n\n`;
                      });

                      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `KPSS_Sinav_${currentSubject}_${activeQuizTopic?.replace(/\s+/g, "_")}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    {lang === "tr" ? "Dışarı Aktar" : "Export"}
                  </button>
                </div>
                <button className="settings-add-btn" style={{ width: "100%", padding: 0 }} onClick={onClose}>
                  {lang === "tr" ? "Kapat" : "Close"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
