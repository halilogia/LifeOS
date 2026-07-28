/**
 * DetoxMotivationCard.tsx
 * Glassmorphic Motivational Card showing "Bu Süreyle Ne Yapabilirdin?"
 */

import { calculateMotivationalAchievements } from "@/domain/services/detoxMotivationalService.js";

interface DetoxMotivationCardProps {
  durationMinutes: number;
  lang: string;
}

export function DetoxMotivationCard({
  durationMinutes,
  lang,
}: DetoxMotivationCardProps) {
  const achievements = calculateMotivationalAchievements(durationMinutes, lang);

  if (achievements.length === 0) return null;

  const isTr = lang === "tr";

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(139, 92, 246, 0.25)",
        borderRadius: "16px",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "1.2rem" }}>💡</span>
        <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#f8fafc" }}>
          {isTr ? "Bu Süreyle Ne Yapabilirdin?" : "What Could You Achieve With This Time?"}
        </h4>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {achievements.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${item.color || "rgba(255, 255, 255, 0.08)"}`,
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#e2e8f0",
              transition: "transform 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)";
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
