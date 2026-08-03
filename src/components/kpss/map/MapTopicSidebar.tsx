import type { TurkeyMapTopic } from "@/domain/constants/TurkeyGeographyData.js";
import { MAP_TOPICS } from "@/domain/constants/TurkeyGeographyData.js";

interface MapTopicSidebarProps {
  t: Record<string, string>;
  selectedTopic: TurkeyMapTopic;
  onSelect: (topic: TurkeyMapTopic) => void;
}

export function MapTopicSidebar({
  t,
  selectedTopic,
  onSelect,
}: MapTopicSidebarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minWidth: "150px",
        maxWidth: "170px",
        background: "rgba(15, 23, 42, 0.55)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "10px",
        alignSelf: "flex-start",
      }}
    >
      {MAP_TOPICS.map((topic) => {
        const active = selectedTopic === topic.id;
        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelect(topic.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: active ? "rgba(255,255,255,0.1)" : "transparent",
              border: active
                ? `1px solid ${topic.color}`
                : "1px solid transparent",
              borderRadius: "9px",
              padding: "8px 10px",
              color: active ? "#ffffff" : "#94a3b8",
              fontSize: "0.78rem",
              fontWeight: active ? 800 : 600,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: topic.color,
                border: "1.5px solid rgba(255,255,255,0.35)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {t[`kpss_map_topic_${topic.id}`] || topic.id}
          </button>
        );
      })}
    </div>
  );
}
