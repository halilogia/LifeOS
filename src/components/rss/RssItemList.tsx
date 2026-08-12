/**
 * RssItemList.tsx
 * RSS item listesi — seçili feed başlığı, sil butonu, item kartları.
 * Parça: RssView tuvali props ile besler.
 */

import type { RssFeed, RssItem } from "@/domain/repositories/IRssRepository.js";

interface RssItemListProps {
  selectedFeed: RssFeed | undefined;
  items: RssItem[];
  t: Record<string, string>;
  faviconUrl: (siteUrl: string) => string;
  formatDate: (ts: number) => string;
  onRemoveFeed: (feedId: string) => void;
  onOpenItem: (item: RssItem) => void;
}

export function RssItemList({
  selectedFeed,
  items,
  t,
  faviconUrl,
  formatDate,
  onRemoveFeed,
  onOpenItem,
}: RssItemListProps) {
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
      {selectedFeed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 10px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "8px",
          }}
        >
          <img
            src={faviconUrl(selectedFeed.siteUrl)}
            alt=""
            width={22}
            height={22}
            style={{ borderRadius: "4px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span
            style={{
              flex: 1,
              color: "#f8fafc",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {selectedFeed.title}
          </span>
          {selectedFeed.lastError && (
            <span style={{ color: "#f87171", fontSize: "0.75rem" }}>
              {(t.rss_feed_error || "Son çekme hatası: {error}").replace(
                "{error}",
                selectedFeed.lastError,
              )}
            </span>
          )}
          <button
            onClick={() => {
              void onRemoveFeed(selectedFeed.id);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              background: "rgba(248, 113, 113, 0.1)",
              color: "#f87171",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t.rss_delete || "Sil"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p
          style={{
            margin: "24px 0",
            color: "#94a3b8",
            fontSize: "0.85rem",
            textAlign: "center",
          }}
        >
          {t.rss_no_items || "Bu feed'de henüz öğe yok."}
        </p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              void onOpenItem(item);
            }}
            style={{
              padding: "12px 10px",
              borderRadius: "10px",
              cursor: "pointer",
              borderLeft: item.read
                ? "3px solid transparent"
                : "3px solid #fb923c",
              background: item.read
                ? "transparent"
                : "rgba(249, 115, 22, 0.06)",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <span
                style={{
                  flex: 1,
                  color: item.read ? "#94a3b8" : "#f8fafc",
                  fontWeight: item.read ? 500 : 700,
                  fontSize: "0.88rem",
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </span>
              <span
                style={{
                  color: "#64748b",
                  fontSize: "0.7rem",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(item.pubDate)}
              </span>
            </div>
            {item.description && (
              <p
                style={{
                  margin: "4px 0 0",
                  color: "#64748b",
                  fontSize: "0.78rem",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.description}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
