/**
 * RssView.tsx
 * RSS Reader panel — feed list + items + read/unread + management.
 * Canvas component: state + data loading here, presentational parts inline.
 * Security: item content rendered via textContent only — no innerHTML (XSS-safe).
 * Clean Architecture - Presentation View.
 */

import { useCallback, useEffect, useState } from "preact/hooks";
import type { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { RssFeed, RssItem } from "@/domain/repositories/IRssRepository.js";
import { rssRepository } from "@/infrastructure/persistence/ChromeStorageRssRepository.js";
import { getFaviconUrl, registerFeed } from "@/services/rssService.js";

interface RssViewProps {
  lang: Language;
}

interface RssState {
  feeds: RssFeed[];
  selectedFeedId: string | null;
  items: RssItem[];
  unreadByFeed: Record<string, number>;
  loading: boolean;
}

function sendRssMessage(
  type: string,
  payload: Record<string, string> = {},
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...payload }, (res) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      const resObj = (res as { ok?: boolean; error?: string }) || {};
      resolve({ ok: resObj.ok === true, error: resObj.error });
    });
  });
}

export function RssView({ lang }: RssViewProps) {
  const t = getTranslation(lang);
  const [state, setState] = useState<RssState>({
    feeds: [],
    selectedFeedId: null,
    items: [],
    unreadByFeed: {},
    loading: true,
  });
  const [addUrl, setAddUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [notify, setNotify] = useState("");

  const loadAll = useCallback(async () => {
    const feeds = await rssRepository.getFeeds();
    const itemsByFeed: Record<string, RssItem[]> = {};
    for (const feed of feeds) {
      itemsByFeed[feed.id] = await rssRepository.getItems(feed.id);
    }
    const unreadByFeed: Record<string, number> = {};
    for (const feed of feeds) {
      unreadByFeed[feed.id] = (itemsByFeed[feed.id] || []).filter(
        (it) => !it.read,
      ).length;
    }
    setState((prev) => {
      const selectedStillExists = feeds.some(
        (f) => f.id === prev.selectedFeedId,
      );
      const selectedFeedId = prev.selectedFeedId
        ? selectedStillExists
          ? prev.selectedFeedId
          : feeds[0]?.id || null
        : feeds[0]?.id || null;
      return {
        feeds,
        selectedFeedId,
        items: selectedFeedId ? itemsByFeed[selectedFeedId] || [] : [],
        unreadByFeed,
        loading: false,
      };
    });
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectFeed = useCallback(
    async (feedId: string) => {
      setState((prev) => ({ ...prev, selectedFeedId: feedId }));
      const items = await rssRepository.getItems(feedId);
      setState((prev) => ({ ...prev, selectedFeedId: feedId, items }));
    },
    [],
  );

  const handleAddFeed = useCallback(async () => {
    if (!addUrl.trim()) {
      return;
    }
    setNotify("");
    const result = await sendRssMessage("rss_register_feed", { url: addUrl.trim() });
    if (result.ok) {
      setAddUrl("");
      setNotify(t.rss_saved || "Feed kaydedildi");
      await loadAll();
    } else {
      setNotify(
        (t.rss_save_error || "Feed kaydedilemedi: {error}").replace(
          "{error}",
          result.error || "",
        ),
      );
    }
  }, [addUrl, t, loadAll]);

  const handleSyncAll = useCallback(async () => {
    setSyncing(true);
    await sendRssMessage("rss_sync_all");
    await loadAll();
    setSyncing(false);
  }, [loadAll]);

  const handleRemoveFeed = useCallback(
    async (feedId: string) => {
      await sendRssMessage("rss_remove_feed", { feedId });
      await loadAll();
    },
    [loadAll],
  );

  const handleOpenItem = useCallback(
    async (item: RssItem) => {
      if (!item.read) {
        await sendRssMessage("rss_mark_read", { itemId: item.id });
        await loadAll();
      }
      if (item.link) {
        window.open(item.link, "_blank", "noopener,noreferrer");
      }
    },
    [loadAll],
  );

  const formatDate = (ts: number): string => {
    return new Date(ts).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalUnread = Object.values(state.unreadByFeed).reduce(
    (sum, n) => sum + n,
    0,
  );

  const selectedFeed = state.feeds.find(
    (f) => f.id === state.selectedFeedId,
  );

  // --- Styles ---
  const cardStyle: Record<string, string> = {
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(249, 115, 22, 0.15)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              color: "#fb923c",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
              {t.rss_title || "RSS Takip"}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
              {t.rss_desc || "Sevdiğiniz sitelerin RSS beslemelerini takip edin."}
              {totalUnread > 0 && (
                <span style={{ color: "#fb923c", fontWeight: 700 }}>
                  {" "}· {totalUnread}{" "}
                  {(t.rss_unread || "{count} okunmamış").replace("{count}", String(totalUnread))}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => void handleSyncAll()}
            disabled={syncing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              background: "rgba(249, 115, 22, 0.15)",
              color: "#fb923c",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {syncing ? (t.rss_loading || "Yükleniyor...") : (t.rss_refresh || "Yenile")}
          </button>
        </div>

        {/* Add feed */}
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          <input
            value={addUrl}
            onInput={(e) => setAddUrl((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleAddFeed();
              }
            }}
            placeholder={t.rss_add_placeholder || "RSS URL'si girin..."}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(2, 6, 23, 0.5)",
              color: "#f8fafc",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
          <button
            onClick={() => void handleAddFeed()}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t.rss_add_btn || "Ekle"}
          </button>
        </div>

        {notify && (
          <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: "#fb923c" }}>
            {notify}
          </p>
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
          {t.rss_auto_sync || "Otomatik senkronizasyon 30 dakikada bir çalışır."}
        </p>
      </div>

      {/* Body */}
      {state.loading ? (
        <div style={cardStyle}>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
            {t.rss_loading || "Yükleniyor..."}
          </p>
        </div>
      ) : state.feeds.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "48px 20px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style={{ margin: "0 auto 16px", display: "block" }}>
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" />
          </svg>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
            {t.rss_empty || "Henüz feed yok. Sağ tık ile RSS kaydedin veya URL ekleyin."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: "16px" }}>
          {/* Feed list */}
          <div style={{ ...cardStyle, padding: "12px", maxHeight: "60vh", overflowY: "auto" }}>
            {state.feeds.map((feed) => (
              <button
                key={feed.id}
                onClick={() => void selectFeed(feed.id)}
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
                    state.selectedFeedId === feed.id
                      ? "rgba(249, 115, 22, 0.4)"
                      : "transparent",
                  background:
                    state.selectedFeedId === feed.id
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
                  src={getFaviconUrl(feed.siteUrl)}
                  alt=""
                  width={20}
                  height={20}
                  style={{ borderRadius: "4px", flexShrink: 0 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {feed.title}
                </span>
                {feed.lastError && (
                  <span title={feed.lastError} style={{ color: "#f87171", fontSize: "0.7rem", flexShrink: 0 }}>
                    !
                  </span>
                )}
                {state.unreadByFeed[feed.id] > 0 && (
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
                    {state.unreadByFeed[feed.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Items list */}
          <div style={{ ...cardStyle, padding: "12px", maxHeight: "60vh", overflowY: "auto" }}>
            {selectedFeed && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "8px" }}>
                <img
                  src={getFaviconUrl(selectedFeed.siteUrl)}
                  alt=""
                  width={22}
                  height={22}
                  style={{ borderRadius: "4px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span style={{ flex: 1, color: "#f8fafc", fontWeight: 700, fontSize: "0.9rem" }}>
                  {selectedFeed.title}
                </span>
                {selectedFeed.lastError && (
                  <span style={{ color: "#f87171", fontSize: "0.75rem" }}>
                    {(t.rss_feed_error || "Son çekme hatası: {error}").replace("{error}", selectedFeed.lastError)}
                  </span>
                )}
                <button
                  onClick={() => void handleRemoveFeed(selectedFeed.id)}
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

            {state.items.length === 0 ? (
              <p style={{ margin: "24px 0", color: "#94a3b8", fontSize: "0.85rem", textAlign: "center" }}>
                {t.rss_no_items || "Bu feed'de henüz öğe yok."}
              </p>
            ) : (
              state.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => void handleOpenItem(item)}
                  style={{
                    padding: "12px 10px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    borderLeft: item.read ? "3px solid transparent" : "3px solid #fb923c",
                    background: item.read ? "transparent" : "rgba(249, 115, 22, 0.06)",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
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
                    <span style={{ color: "#64748b", fontSize: "0.7rem", flexShrink: 0, whiteSpace: "nowrap" }}>
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
        </div>
      )}
    </div>
  );
}
