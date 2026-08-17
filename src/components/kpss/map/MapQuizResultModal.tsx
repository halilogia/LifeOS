/**
 * MapQuizResultModal.tsx
 * Harita Sınavı tamamlandığında görüntülenen başarı ve istatistik dialogu.
 */

interface MapQuizResultModalProps {
  t: Record<string, string>;
  total: number;
  score: number;
  wrongCount: number;
  skippedCount: number;
  bestStreak: number;
  onRestart: () => void;
  onSwitchToStudy: () => void;
}

export function MapQuizResultModal({
  t,
  total,
  score,
  wrongCount,
  skippedCount,
  bestStreak,
  onRestart,
  onSwitchToStudy,
}: MapQuizResultModalProps) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justify: "center",
        padding: "16px",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        animation: "mapModalFade 0.2s ease-out",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background:
            "linear-gradient(145deg, rgba(30, 24, 16, 0.96) 0%, rgba(45, 36, 26, 0.98) 100%)",
          border: "1px solid rgba(244, 234, 215, 0.25)",
          borderRadius: "24px",
          padding: "28px 24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          color: "#f4ead7",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Rozet Simge */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.3) 100%)",
            border: "2px solid #eab308",
            display: "flex",
            alignItems: "center",
            justify: "center",
            fontSize: "2rem",
            boxShadow: "0 8px 24px rgba(234, 179, 8, 0.3)",
          }}
        >
          🏆
        </div>

        {/* Başlık */}
        <div>
          <h3
            style={{
              margin: "0 0 4px",
              fontFamily: "Georgia, serif",
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {t.kpss_map_quiz_completed_title || "Harita Sınavı Tamamlandı!"}
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#cfc3aa" }}>
            {t.kpss_map_quiz_completed_desc ||
              "Tüm konumları başarıyla sınadınız. İşte performans özeti:"}
          </p>
        </div>

        {/* Skor Özeti Grid */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          {/* Doğru */}
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(22, 163, 74, 0.15)",
              border: "1px solid rgba(22, 163, 74, 0.3)",
            }}
          >
            <div
              style={{ fontSize: "0.72rem", color: "#86efac", fontWeight: 700 }}
            >
              {t.kpss_map_stat_correct || "Doğru"}
            </div>
            <div
              style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}
            >
              {score} / {total}
            </div>
          </div>

          {/* Başarı Oranı */}
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(234, 179, 8, 0.15)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
            }}
          >
            <div
              style={{ fontSize: "0.72rem", color: "#fef08a", fontWeight: 700 }}
            >
              {t.kpss_map_stat_accuracy || "Başarı Oranı"}
            </div>
            <div
              style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}
            >
              %{accuracy}
            </div>
          </div>

          {/* Yanlış */}
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
            }}
          >
            <div
              style={{ fontSize: "0.72rem", color: "#fca5a5", fontWeight: 700 }}
            >
              {t.kpss_map_stat_wrong || "Yanlış Deneme"}
            </div>
            <div
              style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff" }}
            >
              {wrongCount}
            </div>
          </div>

          {/* En İyi Seri */}
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(249, 115, 22, 0.15)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
            }}
          >
            <div
              style={{ fontSize: "0.72rem", color: "#ffedd5", fontWeight: 700 }}
            >
              {t.kpss_map_stat_streak || "En İyi Seri"}
            </div>
            <div
              style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff" }}
            >
              🔥 {bestStreak}
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
            marginTop: "6px",
          }}
        >
          <button
            type="button"
            onClick={onRestart}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #c99a3c 0%, #a17826 100%)",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(201, 154, 60, 0.35)",
            }}
          >
            🔄 {t.kpss_map_quiz_restart || "Tekrar Oyna"}
          </button>
          <button
            type="button"
            onClick={onSwitchToStudy}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            📖 {t.kpss_map_quiz_to_study || "Öğrenme Modu"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes mapModalFade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
