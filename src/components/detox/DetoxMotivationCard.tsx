/**
 * DetoxMotivationCard.tsx
 * Glassmorphic Motivational Card showing "Bu Süreyle Ne Yapabilirdin?"
 */

import { calculateMotivationalAchievements } from "@/domain/services/detoxMotivationalService.js";
import { translations } from "@/utils/i18n.js";

interface DetoxMotivationCardProps {
  durationMinutes: number;
  lang: string;
}

export function DetoxMotivationCard({
  durationMinutes,
  lang,
}: DetoxMotivationCardProps) {
  const achievements = calculateMotivationalAchievements(durationMinutes, lang);

  if (achievements.length === 0) {return null;}

  const t = translations[lang as "tr" | "en"];

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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
          <line x1="9" y1="21" x2="15" y2="21"></line>
        </svg>
        <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#f8fafc" }}>
          {t.detox_what_could_you_do}
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
