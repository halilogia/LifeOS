/**
 * RssFeedList.tsx
 * RSS feed sidebar — feed butonları, favicon, okunmamış sayısı.
 * Parça: RssView tuvali props ile besler.
 */

import type { RssFeed } from "@/domain/repositories/IRssRepository.js";

interface RssFeedListProps {
  feeds: RssFeed[];
  selectedFeedId: string | null;
  unreadByFeed: Record<string, number>;
  faviconUrl: (siteUrl: string) => string;
  onSelect: (feedId: string) => void;
}

export function RssFeedList({
  feeds,
  selectedFeedId,
  unreadByFeed,
  faviconUrl,
  onSelect,
}: RssFeedListProps) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "12px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        maxHeight: "60vh",
        overflowY: "auto",
      }}
    >
      {feeds.map((feed) => (
        <button
          key={feed.id}
          onClick={() => {
            void onSelect(feed.id);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "10px 12px",
            marginBottom: "6px",
            borderRadius: "10px",
            border: "1px solid",
            borderColor:
              selectedFeedId === feed.id
                ? "rgba(249, 115, 22, 0.4)"
                : "transparent",
            background:
              selectedFeedId === feed.id
                ? "rgba(249, 115, 22, 0.1)"
                : "transparent",
            color: "#e2e8f0",
            fontSize: "0.83rem",
            fontWeight: 600,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <img
            src={faviconUrl(feed.siteUrl)}
            alt=""
            width={20}
            height={20}
            style={{ borderRadius: "4px", flexShrink: 0 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {feed.title}
          </span>
          {feed.lastError && (
            <span
              title={feed.lastError}
              style={{ color: "#f87171", fontSize: "0.7rem", flexShrink: 0 }}
            >
              !
            </span>
          )}
          {unreadByFeed[feed.id] > 0 && (
            <span
              style={{
                background: "rgba(249, 115, 22, 0.9)",
                color: "#fff",
                borderRadius: "10px",
                padding: "1px 8px",
                fontSize: "0.7rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {unreadByFeed[feed.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
