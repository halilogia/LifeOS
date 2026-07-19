import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";

interface KpssPastExamsDashboardProps {
  lang: Language;
  labels: Record<string, string>;
  onStartPastExam: (year: string, subject: string) => void;
}

export function KpssPastExamsDashboard({
  lang,
  labels,
  onStartPastExam
}: KpssPastExamsDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2019");
  const [selectedSubject, setSelectedSubject] = useState<string>("cografya");

  const years = [
    { id: "2019", label: "2019 KPSS" },
    { id: "2020", label: "2020 KPSS" },
    { id: "2021", label: "2021 KPSS" },
    { id: "karma", label: lang === "tr" ? "Karma Sınav (Karışık)" : "Mixed Past Exam" }
  ];

  const subjects = [
    { id: "cografya", label: lang === "tr" ? "Coğrafya" : "Geography", count: selectedYear === "karma" ? 13 : (selectedYear === "2019" ? 5 : 4) },
    { id: "tarih", label: lang === "tr" ? "Tarih" : "History", count: selectedYear === "karma" ? 20 : (selectedYear === "2019" ? 4 : (selectedYear === "2020" ? 5 : 11)) },
    { id: "matematik", label: lang === "tr" ? "Matematik / Geometri" : "Math / Geometry", count: selectedYear === "karma" ? 3 : 1 },
    { id: "all", label: lang === "tr" ? "Tüm Dersler (GY-GK)" : "All Subjects (GY-GK)", count: selectedYear === "karma" ? 36 : (selectedYear === "2019" ? 10 : (selectedYear === "2020" ? 10 : 16)) }
  ];

  const handleStart = () => {
    onStartPastExam(selectedYear, selectedSubject);
  };

  return (
    <div className="kpss-auto-planner-card" style={{ width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-color)" }}>
          {lang === "tr" ? "ÖSYM Çıkmış Sorular Sınav Salonu" : "ÖSYM Past Exams Practice Room"}
        </h3>
        <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "4px" }}>
          {lang === "tr" 
            ? "Yıllara göre orijinal çıkmış KPSS Lisans sorularını veya tüm yılların karışımından oluşan karma denemeleri çözün." 
            : "Solve original past KPSS Lisans exam questions by year or practice with randomly mixed questions from all years."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        {/* Year Selection Box */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", opacity: 0.9 }}>
            {lang === "tr" ? "1. Sınav Yılını Seçin" : "1. Select Exam Year"}
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {years.map((y) => (
              <div
                key={y.id}
                onClick={() => {
                  setSelectedYear(y.id);
                  // Auto-adjust default subject if needed
                }}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: selectedYear === y.id ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.02)",
                  border: selectedYear === y.id ? "1px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                className="past-exam-option-card"
              >
                <span style={{ fontWeight: selectedYear === y.id ? 600 : 400 }}>{y.label}</span>
                {selectedYear === y.id && (
                  <span style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subject Selection Box */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", opacity: 0.9 }}>
            {lang === "tr" ? "2. Ders Seçin" : "2. Select Subject"}
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {subjects.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: selectedSubject === sub.id ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.02)",
                  border: selectedSubject === sub.id ? "1px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                className="past-exam-option-card"
              >
                <span style={{ fontWeight: selectedSubject === sub.id ? 600 : 400 }}>{sub.label}</span>
                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", opacity: 0.8 }}>
                  {sub.count} {lang === "tr" ? "Soru" : "Q"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
        <button
          onClick={handleStart}
          className="settings-add-btn"
          style={{ width: "auto", padding: "0 40px", height: "45px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {lang === "tr" ? "Sınavı Başlat" : "Start Exam"}
        </button>
      </div>
    </div>
  );
}
