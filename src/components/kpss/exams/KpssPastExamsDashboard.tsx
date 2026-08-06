import { useState, useEffect } from "preact/hooks";
import { getExamSubjectCount } from "@/services/kpss/kpssQuizService.js";

interface KpssPastExamsDashboardProps {
  t: Record<string, string>;
  onStartPastExam: (
    year: string,
    subject: string,
    countLimit?: number,
    selectedChapter?: string,
  ) => void;
}

// 📜 KPSS Tarih Çıkmış Sorular PDF Tam 18 Ünite Listesi
const TARIH_CHAPTERS = [
  { id: "all", label: "Tüm Üniteler (Karma)" },
  {
    id: "İslamiyet Öncesi Türk Tarihi",
    label: "1. İslamiyet Öncesi Türk Tarihi",
  },
  {
    id: "İlk Türk İslam Devletleri ve Türkiye Tarihi",
    label: "2. İlk Türk İslam Devletleri ve Türkiye Tarihi",
  },
  {
    id: "Osmanlı Kültür ve Medeniyeti",
    label: "3. Osmanlı Kültür ve Medeniyeti",
  },
  {
    id: "Osmanlı Devleti'nde Yenileşme ve Demokratikleşme Hareketleri",
    label: "4. Osmanlı Devleti'nde Yenileşme ve Demokratikleşme Hareketleri",
  },
  {
    id: "Birinci Dünya Savaşı ve Sonuçları",
    label: "5. Birinci Dünya Savaşı ve Sonuçları",
  },
  {
    id: "Kurtuluş Savaşı Hazırlık Dönemi",
    label: "6. Kurtuluş Savaşı Hazırlık Dönemi",
  },
  { id: "TBMM'nin Açılışı", label: "7. TBMM'nin Açılışı" },
  {
    id: "Kurtuluş Savaşı - Lozan Antlaşması",
    label: "8. Kurtuluş Savaşı - Lozan Antlaşması",
  },
  { id: "Atatürk İnkılapları Siyasi", label: "9. Atatürk İnkılapları Siyasi" },
  {
    id: "Atatürk İnkılapları Ekonomik",
    label: "10. Atatürk İnkılapları Ekonomik",
  },
  { id: "Atatürk İnkılapları Eğitim", label: "11. Atatürk İnkılapları Eğitim" },
  { id: "Atatürk İnkılapları Hukuki", label: "12. Atatürk İnkılapları Hukuki" },
  {
    id: "Atatürk İnkılapları Toplumsal",
    label: "13. Atatürk İnkılapları Toplumsal",
  },
  {
    id: "Atatürk İnkılapları Kronoloji",
    label: "14. Atatürk İnkılapları Kronoloji",
  },
  {
    id: "Çok Partili Yaşama Geçiş Denemeleri",
    label: "15. Çok Partili Yaşama Geçiş Denemeleri",
  },
  { id: "Atatürk İlkeleri", label: "16. Atatürk İlkeleri" },
  { id: "Dış Politika", label: "17. Dış Politika" },
  { id: "Atatürk Sonrası Gelişmeler", label: "18. Atatürk Sonrası Gelişmeler" },
];

export function KpssPastExamsDashboard({
  t,
  onStartPastExam,
}: KpssPastExamsDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2019");
  const [selectedSubject, setSelectedSubject] = useState<string>("cografya");
  const [selectedCountLimit, setSelectedCountLimit] = useState<number>(20);
  const [selectedChapter, setSelectedChapter] = useState<string>("all");

  const years = [
    { id: "2021", label: "2021" },
    { id: "2020", label: "2020" },
    { id: "2019", label: "2019" },
    { id: "2018", label: "2018" },
    { id: "2017", label: "2017" },
    { id: "2015", label: "2015" },
    { id: "2014", label: "2014" },
    { id: "2013", label: "2013" },
    { id: "2012", label: "2012" },
    { id: "2011", label: "2011" },
    { id: "2010", label: "2010" },
    { id: "2009", label: "2009" },
    {
      id: "tarih_arsivi",
      label: t.kpss_past_exams_history_q || "Tarih Soru Arşivi (ÖSYM PDF)",
    },
    {
      id: "yanlis",
      label: t.kpss_past_exams_wrong || "❌ Yanlışlarım",
    },
    {
      id: "koleksiyon",
      label: t.kpss_koleksiyon_cap || "📥 Koleksiyonum",
    },
    {
      id: "karma",
      label: t.kpss_past_exams_mixed || "Karma Sınav (Tüm Yıllar Karışık)",
    },
  ];

  // Subject counts loaded async via service (rule 6.2 compliance)
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    const load = async () => {
      const counts: Record<string, number> = {};
      for (const sub of ["cografya", "tarih", "matematik", "all"]) {
        counts[sub] = await getExamSubjectCount(selectedYear, sub);
      }
      setSubjectCounts(counts);
    };
    load();
  }, [selectedYear]);

  const getSubjectCount = (_year: string, subject: string) => {
    return subjectCounts[subject] ?? 0;
  };

  const subjects = [
    {
      id: "cografya",
      label: t.kpss_past_exams_geography,
      count: getSubjectCount(selectedYear, "cografya"),
    },
    {
      id: "tarih",
      label: t.kpss_past_exams_history,
      count: getSubjectCount(selectedYear, "tarih"),
    },
    {
      id: "matematik",
      label: t.kpss_past_exams_math,
      count: getSubjectCount(selectedYear, "matematik"),
    },
    {
      id: "all",
      label: t.kpss_past_exams_all,
      count: getSubjectCount(selectedYear, "all"),
    },
  ];

  const handleStart = () => {
    onStartPastExam(
      selectedYear,
      selectedSubject,
      selectedCountLimit,
      selectedYear === "tarih_arsivi" ? selectedChapter : undefined,
    );
  };

  return (
    <div
      className="kpss-auto-planner-card"
      style={{
        width: "100%",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "12px",
        }}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--accent-color)",
          }}
        >
          {t.kpss_past_exams_title}
        </h3>
        <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "4px" }}>
          {t.kpss_past_exams_desc}
        </p>
      </div>

      {/* Karma Sınav Açıklama Kutusu */}
      {selectedYear === "karma" && (
        <div
          style={{
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "0.85rem",
            color: "#e2e8f0",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#c084fc" }}>
            💡 Karma Sınav Modu Nedir?
          </strong>
          <p style={{ margin: "4px 0 0 0", opacity: 0.85 }}>
            Tüm geçmiş KPSS yıllarından (2006-2021) ve seçtiğiniz derslerden
            rastgele karışık deneme testi oluşturur.
          </p>
        </div>
      )}

      {/* Soru Sayısı Limit Seçimi */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          background: "rgba(255, 255, 255, 0.02)",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid var(--card-border)",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          ⚡ Çekilecek Soru Sayısı:
        </span>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[10, 20, 27, 30, 60].map((count) => (
            <button
              key={count}
              className={`kpss-qcount-btn ${selectedCountLimit === count ? "active" : ""}`}
              onClick={() => setSelectedCountLimit(count)}
              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            >
              {count} Soru
            </button>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "4px",
            }}
          >
            <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>veya</span>
            <input
              type="number"
              min={1}
              max={915}
              value={selectedCountLimit}
              onInput={(e) => {
                const val = parseInt((e.target as HTMLInputElement).value, 10);
                if (!isNaN(val) && val > 0) {
                  setSelectedCountLimit(val);
                }
              }}
              placeholder="Örn: 27"
              style={{
                width: "75px",
                background: "#161622",
                border: "1px solid var(--accent-color)",
                borderRadius: "6px",
                color: "white",
                padding: "6px 8px",
                fontSize: "0.85rem",
                fontWeight: 700,
                textAlign: "center",
                outline: "none",
              }}
            />
            <span
              style={{ fontSize: "0.8rem", color: "#c084fc", fontWeight: 600 }}
            >
              Özel Soru
            </span>
          </div>
        </div>
      </div>

      {/* 3 Adımlı Grid Düzeni */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Adım 1: Sınav Yılını Seçin */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "8px",
              opacity: 0.9,
            }}
          >
            {t.kpss_past_exams_step1}
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {years.map((y) => (
              <div
                key={y.id}
                onClick={() => {
                  setSelectedYear(y.id);
                  if (
                    y.id === "tarih_arsivi" ||
                    y.id === "yanlis" ||
                    y.id === "koleksiyon"
                  ) {
                    setSelectedSubject("tarih");
                  }
                }}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background:
                    selectedYear === y.id
                      ? "rgba(139, 92, 246, 0.15)"
                      : "rgba(255,255,255,0.02)",
                  border:
                    selectedYear === y.id
                      ? "1px solid var(--accent-color)"
                      : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                className="past-exam-option-card"
              >
                <span style={{ fontWeight: selectedYear === y.id ? 600 : 400 }}>
                  {y.label}
                </span>
                {selectedYear === y.id && (
                  <span
                    style={{ color: "var(--accent-color)", fontSize: "0.9rem" }}
                  >
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Adım 2: Ders Seçin */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "8px",
              opacity: 0.9,
            }}
          >
            {t.kpss_past_exams_step2}
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {subjects.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background:
                    selectedSubject === sub.id
                      ? "rgba(139, 92, 246, 0.15)"
                      : "rgba(255,255,255,0.02)",
                  border:
                    selectedSubject === sub.id
                      ? "1px solid var(--accent-color)"
                      : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                className="past-exam-option-card"
              >
                <span
                  style={{ fontWeight: selectedSubject === sub.id ? 600 : 400 }}
                >
                  {sub.label}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.08)",
                    opacity: 0.8,
                  }}
                >
                  {sub.count} {t.kpss_quiz_questions}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Adım 3: Ünite Seçin */}
        {selectedYear === "tarih_arsivi" && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "8px",
                opacity: 0.9,
              }}
            >
              3. Ünite Seçin
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "520px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {TARIH_CHAPTERS.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background:
                      selectedChapter === ch.id
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(255,255,255,0.02)",
                    border:
                      selectedChapter === ch.id
                        ? "1px solid #10b981"
                        : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8rem",
                  }}
                  className="past-exam-option-card"
                >
                  <span
                    style={{
                      fontWeight: selectedChapter === ch.id ? 600 : 400,
                    }}
                  >
                    {ch.label}
                  </span>
                  {selectedChapter === ch.id && (
                    <span style={{ color: "#34d399", fontSize: "0.85rem" }}>
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "12px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "16px",
        }}
      >
        <button
          onClick={handleStart}
          className="settings-add-btn"
          style={{
            width: "auto",
            padding: "0 40px",
            height: "45px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {t.kpss_past_exams_start}
        </button>
      </div>
    </div>
  );
}
