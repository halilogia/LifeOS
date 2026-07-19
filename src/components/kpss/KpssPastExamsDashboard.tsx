import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";

import exam2021 from "@/data/kpss/exam2021.json";
import exam2020 from "@/data/kpss/exam2020.json";
import exam2019 from "@/data/kpss/exam2019.json";
import exam2018 from "@/data/kpss/exam2018.json";
import exam2017 from "@/data/kpss/exam2017.json";
import exam2015 from "@/data/kpss/exam2015.json";
import exam2014 from "@/data/kpss/exam2014.json";
import exam2013 from "@/data/kpss/exam2013.json";
import exam2012 from "@/data/kpss/exam2012.json";
import exam2011 from "@/data/kpss/exam2011.json";
import exam2010 from "@/data/kpss/exam2010.json";
import exam2009 from "@/data/kpss/exam2009.json";
import examTarihArsivi from "@/data/kpss/exam_tarih_arsivi.json";

const KPSS_YEARLY_DATA: Record<string, any> = {
  "2021": exam2021,
  "2020": exam2020,
  "2019": exam2019,
  "2018": exam2018,
  "2017": exam2017,
  "2015": exam2015,
  "2014": exam2014,
  "2013": exam2013,
  "2012": exam2012,
  "2011": exam2011,
  "2010": exam2010,
  "2009": exam2009,
  "tarih_arsivi": examTarihArsivi
};

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
    { id: "2021", label: "2021 KPSS" },
    { id: "2020", label: "2020 KPSS" },
    { id: "2019", label: "2019 KPSS" },
    { id: "2018", label: "2018 KPSS" },
    { id: "2017", label: "2017 KPSS" },
    { id: "2015", label: "2015 KPSS" },
    { id: "2014", label: "2014 KPSS" },
    { id: "2013", label: "2013 KPSS" },
    { id: "2012", label: "2012 KPSS" },
    { id: "2011", label: "2011 KPSS" },
    { id: "2010", label: "2010 KPSS" },
    { id: "2009", label: "2009 KPSS" },
    { id: "tarih_arsivi", label: lang === "tr" ? "Tarih Soru Arşivi" : "History Q Archive" },
    { id: "karma", label: lang === "tr" ? "Karma Sınav (Karışık)" : "Mixed Past Exam" }
  ];

  const getSubjectCount = (year: string, subject: string) => {
    if (year === "karma") {
      let sum = 0;
      Object.entries(KPSS_YEARLY_DATA).forEach(([yKey, yData]) => {
        if (yKey !== "tarih_arsivi") {
          if (subject === "all") {
            sum += (yData.tarih?.length || 0) + (yData.cografya?.length || 0) + (yData.matematik?.length || 0);
          } else if (yData[subject]) {
            sum += yData[subject].length;
          }
        }
      });
      return sum;
    }
    
    const data = KPSS_YEARLY_DATA[year];
    if (!data) return 0;
    
    if (subject === "all") {
      return (data.tarih?.length || 0) + (data.cografya?.length || 0) + (data.matematik?.length || 0);
    }
    
    return data[subject]?.length || 0;
  };

  const subjects = [
    { id: "cografya", label: lang === "tr" ? "Coğrafya" : "Geography", count: getSubjectCount(selectedYear, "cografya") },
    { id: "tarih", label: lang === "tr" ? "Tarih" : "History", count: getSubjectCount(selectedYear, "tarih") },
    { id: "matematik", label: lang === "tr" ? "Matematik / Geometri" : "Math / Geometry", count: getSubjectCount(selectedYear, "matematik") },
    { id: "all", label: lang === "tr" ? "Tüm Dersler (GY-GK)" : "All Subjects (GY-GK)", count: getSubjectCount(selectedYear, "all") }
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
