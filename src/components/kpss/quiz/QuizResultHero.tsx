/**
 * QuizResultHero.tsx
 * KPSS Sınav Sonuç ve Konu İlerleme Kartı.
 *
 * Özellikler:
 * - Soru Sayısı Hedefi (100 Soru Barajı) İlerleme Çubuğu
 * - Birikimli Başarı Oranı (%80 Şartı) İlerleme Çubuğu
 * - Çözülen Sınav Skoru (eğer soru çözüldüyse)
 * - Sıfır karmaşa, sıfır "0/0 Soru" yazısı, gereksiz metinler kaldırılmıştır.
 */

interface QuizResultHeroProps {
  t: Record<string, string>;
  score: number;
  correctCount: number;
  totalQuestions: number;
  cumulative: { totalQuestions: number; totalCorrect: number };
  targetQuestions: number;
}

export function QuizResultHero({
  t,
  score,
  correctCount,
  totalQuestions,
  cumulative,
  targetQuestions,
}: QuizResultHeroProps) {
  // Birikimli (Konu Genel) İstatistikleri
  const cumTotal = cumulative?.totalQuestions ?? 0;
  const cumCorrect = cumulative?.totalCorrect ?? 0;
  const cumPercent =
    cumTotal > 0
      ? Math.round((cumCorrect / cumTotal) * 100)
      : score > 0
        ? score
        : 0;

  // Baraj Hesapları
  const questionTargetPct = Math.min(
    100,
    Math.round((cumTotal / targetQuestions) * 100),
  );
  const successTargetPct = Math.min(100, cumPercent);
  const isCompleted = cumTotal >= targetQuestions && cumPercent >= 80;

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(20, 20, 30, 0.7)",
        border: `1px solid ${isCompleted ? "rgba(16, 185, 129, 0.4)" : "var(--card-border)"}`,
        borderRadius: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "10px",
      }}
    >
      {/* Üst Bar: Sonuç Rozeti ve Durum etiketleri */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
              display: "block",
            }}
          >
            Konu Durumu
          </span>
          <strong
            style={{
              fontSize: "1.1rem",
              color: isCompleted ? "#34d399" : "#f3f4f6",
            }}
          >
            {isCompleted ? "✓ Tamamlandı" : "Devam Ediyor"}
          </strong>
        </div>

        {totalQuestions > 0 && (
          <div
            style={{
              textAlign: "right",
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              padding: "6px 12px",
              borderRadius: "8px",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                display: "block",
              }}
            >
              Son Sınav
            </span>
            <strong style={{ fontSize: "0.95rem", color: "#c084fc" }}>
              {correctCount}/{totalQuestions} Doğru (%{score})
            </strong>
          </div>
        )}
      </div>

      {/* ── BAR 1: 100 Soru Barajı İlerlemesi ── */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            fontWeight: "700",
            marginBottom: "6px",
            color: "#e2e8f0",
          }}
        >
          <span>🎯 Soru Sayısı Hedefi</span>
          <span style={{ color: "var(--accent-color)" }}>
            {cumTotal} / {targetQuestions} Soru
          </span>
        </div>
        <div
          style={{
            height: "8px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${questionTargetPct}%`,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              borderRadius: "4px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* ── BAR 2: %80 Başarı Şartı İlerlemesi ── */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            fontWeight: "700",
            marginBottom: "6px",
            color: "#e2e8f0",
          }}
        >
          <span>🏆 Birikimli Başarı Oranı</span>
          <span style={{ color: cumPercent >= 80 ? "#34d399" : "#f59e0b" }}>
            %{cumPercent} Başarı (Hedef: %80)
          </span>
        </div>
        <div
          style={{
            height: "8px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${successTargetPct}%`,
              background:
                cumPercent >= 80
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #f59e0b, #fbbf24)",
              borderRadius: "4px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
