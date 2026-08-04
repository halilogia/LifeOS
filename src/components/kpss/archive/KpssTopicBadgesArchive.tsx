/**
 * KpssTopicBadgesArchive.tsx
 * 
 * KPSS Konu Liste Satırındaki "5 Soru" ve "%60" skor rozetlerinin arşiv dosyası.
 * Kullanıcı fikrini değiştirip rozetleri geçici olarak kaldırmak istediği için bu dosyada saklanmaktadır.
 * 
 * Sonradan tekrar eklenmek istendiğinde:
 * import { KpssTopicBadgesArchive } from "@/components/kpss/archive/KpssTopicBadgesArchive.js";
 * <KpssTopicBadgesArchive totalQuestions={progress.totalQuestions} score={progress.score} />
 */

interface KpssTopicBadgesArchiveProps {
  totalQuestions?: number;
  score?: number;
}

export function KpssTopicBadgesArchive({
  totalQuestions,
  score,
}: KpssTopicBadgesArchiveProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {/* 5 Soru Rozeti */}
      {typeof totalQuestions === "number" && totalQuestions > 0 && (
        <span className="kpss-topic-q-badge">
          {totalQuestions} Soru
        </span>
      )}

      {/* %60 / %80 Başarı Rozeti */}
      {typeof score === "number" && score > 0 && (
        <span className="kpss-topic-score-badge">
          %{score}
        </span>
      )}
    </div>
  );
}
