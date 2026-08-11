import type { DistractionSettings } from "@/presentation/store/detoxStore.js";
import type { Language } from "@/types/types.js";
import { DetoxPlatformSection, ToggleRow } from "@/components/detox/DetoxPlatformSection.js";

interface DetoxDistractionCardProps {
  lang: Language;
  t: Record<string, string>;
  distractionSettings: DistractionSettings;
  onUpdateDistractionSettings: (
    updater: Partial<DistractionSettings> | ((prev: DistractionSettings) => DistractionSettings),
  ) => void;
}

export function DetoxDistractionCard({
  t,
  distractionSettings,
  onUpdateDistractionSettings,
}: DetoxDistractionCardProps) {
  const handleToggle = (key: keyof DistractionSettings) => {
    onUpdateDistractionSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "#60a5fa",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "#f8fafc",
            }}
          >
            {t.detox_distraction_title || "Sosyal Medya Temizlik & Anti-Doomscrolling"}
          </h3>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.78rem",
              color: "#94a3b8",
            }}
          >
            {t.detox_distraction_desc ||
              "Shorts, Reels, sonsuz kaydırma akışlarını gizleyerek odaklanmanızı artırın."}
          </p>
        </div>
      </div>

      {/* Grid of Platform Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "12px",
        }}
      >
        {/* YouTube Box */}
        <DetoxPlatformSection
          title="YouTube"
          color="#ef4444"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
            </svg>
          }
        >
          <ToggleRow
            label={t.detox_yt_shorts || "Shorts Butonunu & Raflarını Gizle"}
            checked={distractionSettings.ytShortsBlock}
            onChange={() => handleToggle("ytShortsBlock")}
          />
          <ToggleRow
            label={t.detox_yt_feed || "Ana Sayfa Akışını Gizle (İlham Kartı Göster)"}
            checked={distractionSettings.ytFeedBlock}
            onChange={() => handleToggle("ytFeedBlock")}
          />
          <ToggleRow
            label={t.detox_yt_comments || "Yorumlar Bölümünü Gizle"}
            checked={distractionSettings.ytCommentsBlock}
            onChange={() => handleToggle("ytCommentsBlock")}
          />
          <ToggleRow
            label={t.detox_yt_subscriptions || "Abonelikler Butonunu Gizle"}
            checked={distractionSettings.ytSubscriptionsBlock}
            onChange={() => handleToggle("ytSubscriptionsBlock")}
          />
        </DetoxPlatformSection>

        {/* Instagram Box */}
        <DetoxPlatformSection
          title="Instagram"
          color="#ec4899"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          }
        >
          <ToggleRow
            label={t.detox_ig_reels || "Reels Sekmesini & Akışını Gizle"}
            checked={distractionSettings.igReelsBlock}
            onChange={() => handleToggle("igReelsBlock")}
          />
          <ToggleRow
            label={t.detox_ig_explore || "Keşfet Sekmesini Gizle"}
            checked={distractionSettings.igExploreBlock}
            onChange={() => handleToggle("igExploreBlock")}
          />
          <ToggleRow
            label={t.detox_ig_feed || "Ana Sayfa Akışını Gizle"}
            checked={distractionSettings.igFeedBlock}
            onChange={() => handleToggle("igFeedBlock")}
          />
        </DetoxPlatformSection>

        {/* Facebook Box */}
        <DetoxPlatformSection
          title="Facebook"
          color="#3b82f6"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          }
        >
          <ToggleRow
            label={t.detox_fb_reels || "Reels & Kısa Videoları Gizle"}
            checked={distractionSettings.fbReelsBlock}
            onChange={() => handleToggle("fbReelsBlock")}
          />
          <ToggleRow
            label={t.detox_fb_feed || "Ana Sayfa Akışını Gizle"}
            checked={distractionSettings.fbFeedBlock}
            onChange={() => handleToggle("fbFeedBlock")}
          />
        </DetoxPlatformSection>

        {/* TikTok Box */}
        <DetoxPlatformSection
          title="TikTok"
          color="#14b8a6"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          }
        >
          <ToggleRow
            label={t.detox_tt_feed || "Kaydırma (Feed) Engelleme"}
            checked={distractionSettings.ttFeedBlock}
            onChange={() => handleToggle("ttFeedBlock")}
          />
        </DetoxPlatformSection>

        {/* Twitter / X Box */}
        <DetoxPlatformSection
          title="Twitter / X"
          color="#38bdf8"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </svg>
          }
        >
          <ToggleRow
            label={t.detox_x_feed || "Ana Sayfa Akışını Gizle"}
            checked={distractionSettings.xFeedBlock}
            onChange={() => handleToggle("xFeedBlock")}
          />
          <ToggleRow
            label={t.detox_x_explore || "Keşfet & Gündemdekileri Gizle"}
            checked={distractionSettings.xExploreBlock}
            onChange={() => handleToggle("xExploreBlock")}
          />
        </DetoxPlatformSection>
      </div>
    </div>
  );
}
