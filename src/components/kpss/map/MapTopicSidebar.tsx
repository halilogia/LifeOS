import { useState } from "preact/hooks";
import type {
  TurkeyMapCategory,
  TurkeyMapTopic,
} from "@/domain/constants/TurkeyGeographyData.js";
import {
  MAP_CATEGORIES,
  MAP_TOPICS,
  TOPIC_PINS,
} from "@/domain/constants/TurkeyGeographyData.js";

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
  // Track collapsed status of categories
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<TurkeyMapCategory, boolean>
  >({
    fiziki: false,
    beseri: false,
    ekonomik: false,
    general: false,
  });

  const toggleCategory = (catId: TurkeyMapCategory) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minWidth: "180px",
        maxWidth: "210px",
        maxHeight: "520px",
        overflowY: "auto",
        background: "rgba(15, 23, 42, 0.65)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "10px",
        alignSelf: "flex-start",
        backdropFilter: "blur(8px)",
      }}
    >
      {MAP_CATEGORIES.map((cat) => {
        const catTopics = MAP_TOPICS.filter((tp) => tp.category === cat.id);
        if (catTopics.length === 0) {
          return null;
        }
        const isCollapsed = collapsedCategories[cat.id];

        return (
          <div
            key={cat.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {/* Kategori Başlığı */}
            <button
              type="button"
              onClick={() => toggleCategory(cat.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                color: cat.color,
                fontSize: "0.74rem",
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>{cat.icon}</span>
                <span>{t[cat.titleKey] || cat.id}</span>
              </div>
              <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>
                {isCollapsed ? "►" : "▼"}
              </span>
            </button>

            {/* Kategori Konu Butonları */}
            {!isCollapsed && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  paddingLeft: "4px",
                }}
              >
                {catTopics.map((topic) => {
                  const active = selectedTopic === topic.id;
                  const pinCount = (TOPIC_PINS[topic.id] || []).length;

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => onSelect(topic.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "6px",
                        background: active
                          ? "rgba(255,255,255,0.12)"
                          : "transparent",
                        border: active
                          ? `1px solid ${topic.color}`
                          : "1px solid transparent",
                        borderRadius: "8px",
                        padding: "6px 8px",
                        color: active ? "#ffffff" : "#94a3b8",
                        fontSize: "0.74rem",
                        fontWeight: active ? 800 : 600,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: topic.color,
                            border: "1px solid rgba(255,255,255,0.35)",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t[`kpss_map_topic_${topic.id}`] || topic.id}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          padding: "1px 5px",
                          borderRadius: "10px",
                          background: active
                            ? topic.color
                            : "rgba(255,255,255,0.06)",
                          color: active ? "#ffffff" : "#64748b",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {pinCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
