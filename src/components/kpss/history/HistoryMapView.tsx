/**
 * HistoryMapView.tsx
 * KPSS Tarih Haritası — kronolojik olayları haritada oynatır.
 * Desen: TurkeyMapView (coğrafya) ile aynı — pan, zoom, reset, play/step.
 * Veri: TurkeyHistoryData.ts (HISTORY_EVENTS, HISTORY_TOPICS).
 * Kaynak desen: archives/anadolu_selcuklu_devleti.html (bayrak pinleri, trail).
 */
import { useEffect, useRef, useState } from "preact/hooks";
import {
  HISTORY_CATEGORY_COLORS,
  HISTORY_EVENTS,
  HISTORY_TOPICS,
  HISTORY_VIEWBOX,
  type HistoryEvent,
  type HistoryEventCategory,
  type HistoryTopic,
} from "@/domain/constants/TurkeyHistoryData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";
import { MapControls } from "../map/MapControls.js";

interface HistoryMapViewProps {
  t: Record<string, string>;
}

const STEP_MS = 1500;

const TOPIC_TITLE_KEYS: Record<HistoryTopic, string> = {
  "anadolu-selcuklu": "kpss_history_title_selcuklu",
  "buyuk-selcuklu": "kpss_history_title_buyuk",
  "beylikler": "kpss_history_title_beylikler",
  "osmanli-kurulus": "kpss_history_title_osmanli",
  "hacli": "kpss_history_title_hacli",
};

const CATEGORY_KEYS: Record<HistoryEventCategory, string> = {
  war: "kpss_history_cat_war",
  treaty: "kpss_history_cat_treaty",
  trade: "kpss_history_cat_trade",
  culture: "kpss_history_cat_culture",
  organization: "kpss_history_cat_organization",
};

export function HistoryMapView({ t }: HistoryMapViewProps) {
  const [selectedTopic, setSelectedTopic] =
    useState<HistoryTopic>("anadolu-selcuklu");
  const [activeCategory, setActiveCategory] = useState<
    HistoryEventCategory | "all"
  >("all");
  // Başlangıçta tüm olaylar görünür — play basınca 0'dan başlar
  const [revealedCount, setRevealedCount] = useState(
    HISTORY_EVENTS["anadolu-selcuklu"].length
  );
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  // viewRef — wheel handler'da güncel view'a erişim
  const viewRef = useRef(view);
  viewRef.current = view;
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgWrapRef = useRef<HTMLDivElement | null>(null);

  const events = HISTORY_EVENTS[selectedTopic];
  const filteredEvents =
    activeCategory === "all"
      ? events
      : events.filter((ev) => ev.category === activeCategory);
  const total = filteredEvents.length;
  const topicMeta =
    HISTORY_TOPICS.find((m) => m.id === selectedTopic) || HISTORY_TOPICS[0];
  const topicColor = topicMeta.color;
  const territorySet = new Set(topicMeta.territoryProvinces);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const stopPlayback = () => {
    clearTimer();
    setPlaying(false);
    setCurrentIndex(-1);
  };

  const handleTopicChange = (topic: HistoryTopic) => {
    if (topic === selectedTopic || !topicMeta.enabled) {
      return;
    }
    stopPlayback();
    // Yeni konu da son haliyle (tüm olaylar) açılır
    setActiveCategory("all");
    setRevealedCount(HISTORY_EVENTS[topic].length);
    setSelectedTopic(topic);
    // Harita görünümünü sıfırla
    setView({ x: 0, y: 0, scale: 1 });
  };

  const handleCategoryChange = (cat: HistoryEventCategory | "all") => {
    if (cat === activeCategory) {
      return;
    }
    stopPlayback();
    setActiveCategory(cat);
    const newEvents =
      cat === "all"
        ? HISTORY_EVENTS[selectedTopic]
        : HISTORY_EVENTS[selectedTopic].filter((ev) => ev.category === cat);
    setRevealedCount(newEvents.length);
  };

  const handlePlay = () => {
    if (playing) {
      stopPlayback();
      return;
    }
    // Başlat → her zaman 0'dan başla
    setRevealedCount(0);
    setCurrentIndex(-1);
    setPlaying(true);
    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= total - 1) {
          clearTimer();
          setPlaying(false);
          return -1;
        }
        const next = prev + 1;
        setRevealedCount(next + 1);
        return next;
      });
    }, STEP_MS);
  };

  const handleReset = () => {
    stopPlayback();
    // Sıfırla → son haliyle (tüm olaylar görünür)
    setRevealedCount(total);
    // Fare kaydırma/zoom'dan oluşan konum değişikliğini de sıfırla
    setView({ x: 0, y: 0, scale: 1 });
  };

  // --- Fare sol click basılı tutarak sürükleme (Google Maps tarzı PAN) ---
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) {
      return;
    }
    const v = viewRef.current;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: v.x,
      originY: v.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    stopPlayback();
  };

  const handlePointerMove = (e: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.active) {
      return;
    }
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setView({
      ...viewRef.current,
      x: drag.originX + dx,
      y: drag.originY + dy,
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  // Wheel ile zoom — imleç merkezli
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const wrap = svgWrapRef.current;
    if (!wrap) {
      return;
    }
    const rect = wrap.getBoundingClientRect();
    const v = viewRef.current;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newScale = Math.min(5, Math.max(0.5, v.scale * factor));
    // İmleç pozisyonu harita koordinatı
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const wx = (px - v.x) / v.scale;
    const wy = (py - v.y) / v.scale;
    setView({
      scale: newScale,
      x: px - wx * newScale,
      y: py - wy * newScale,
    });
  };

  // Video oynatıcı gibi manuel ileri/geri sarma
  const handleStep = (dir: 1 | -1) => {
    stopPlayback();
    const next = Math.min(total, Math.max(0, revealedCount + dir));
    setRevealedCount(next);
    setCurrentIndex(next > 0 ? next - 1 : -1);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        ...(isFullscreen
          ? {
              height: "100vh",
              boxSizing: "border-box",
              padding: "24px",
              background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
              overflow: "auto",
            }
          : {}),
      }}
    >
      {/* Harita Başlığı + Kontroller */}
      <MapControls
        t={t}
        title={
          t[TOPIC_TITLE_KEYS[selectedTopic]] ||
          t.kpss_history_title ||
          "Türkiye Tarih Haritası"
        }
        total={total}
        revealedCount={revealedCount}
        playing={playing}
        isFullscreen={isFullscreen}
        onStep={handleStep}
        onReset={handleReset}
        onPlayToggle={handlePlay}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Konu Seçici + Harita */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "stretch",
          flex: isFullscreen ? 1 : undefined,
        }}
      >
        {/* Sol Sidebar: Devlet → Kategori → Olay slaytları */}
        <div
          style={{
            width: 200,
            flex: "0 0 200px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "14px",
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            overflowY: "auto",
            maxHeight: isFullscreen ? "calc(100vh - 120px)" : 480,
          }}
        >
          {/* Devletler */}
          {HISTORY_TOPICS.map((topic) => {
            const isActive = topic.id === selectedTopic;
            const isEnabled = topic.enabled;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicChange(topic.id)}
                disabled={!isEnabled}
                style={{
                  textAlign: "left",
                  background: isActive
                    ? "rgba(181,67,47,0.2)"
                    : "rgba(255,255,255,0.04)",
                  border: isActive
                    ? "1px solid #b5432f"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: isActive ? "#ffe4da" : "#d9d2bf",
                  padding: "10px 12px",
                  borderRadius: "9px",
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: isEnabled ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  opacity: isEnabled ? 1 : 0.4,
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: topic.color,
                    flex: "0 0 auto",
                  }}
                />
                {t[topic.titleKey] || topic.id}
                {!isEnabled && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.55rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#8f8378",
                      border: "1px solid #524540",
                      padding: "2px 5px",
                      borderRadius: 20,
                    }}
                  >
                    {t.kpss_history_soon || "Yakında"}
                  </span>
                )}
              </button>
            );
          })}

          {/* Ayraç */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.08)",
              margin: "2px 0",
            }}
          />

          {/* Kategoriler — aktif devletin altında */}
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            style={{
              textAlign: "left",
              background:
                activeCategory === "all"
                  ? "rgba(181,67,47,0.2)"
                  : "rgba(255,255,255,0.04)",
              border:
                activeCategory === "all"
                  ? "1px solid #b5432f"
                  : "1px solid rgba(255,255,255,0.08)",
              color: activeCategory === "all" ? "#ffe4da" : "#d9d2bf",
              padding: "7px 10px",
              paddingLeft: "18px",
              borderRadius: "8px",
              fontSize: "0.72rem",
              fontWeight: activeCategory === "all" ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #b5432f, #c99a3c, #2f8f5b, #7c3aed, #2563eb)",
                flex: "0 0 auto",
              }}
            />
            {t.kpss_history_filter_all || "Tümü"}
          </button>
          {(
            [
              ["war", "kpss_history_cat_war"],
              ["treaty", "kpss_history_cat_treaty"],
              ["trade", "kpss_history_cat_trade"],
              ["culture", "kpss_history_cat_culture"],
              ["organization", "kpss_history_cat_organization"],
            ] as [HistoryEventCategory, string][]
          ).map(([cat, key]) => {
            const isActive = activeCategory === cat;
            const catColor = HISTORY_CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                style={{
                  textAlign: "left",
                  background: isActive
                    ? "rgba(181,67,47,0.2)"
                    : "rgba(255,255,255,0.04)",
                  border: isActive
                    ? "1px solid #b5432f"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: isActive ? "#ffe4da" : "#d9d2bf",
                  padding: "7px 10px",
                  paddingLeft: "18px",
                  borderRadius: "8px",
                  fontSize: "0.72rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: catColor,
                    border: "1px solid rgba(0,0,0,0.2)",
                    flex: "0 0 auto",
                  }}
                />
                {t[key] || cat}
              </button>
            );
          })}

          {/* Ayraç */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.08)",
              margin: "2px 0",
            }}
          />

          {/* Olay slaytları — aktif kategorinin olayları */}
          {filteredEvents.map((ev, idx) => {
            const isCurrent = idx === currentIndex;
            const catColor = HISTORY_CATEGORY_COLORS[ev.category];
            return (
              <button
                key={`${ev.year}-${ev.title}`}
                type="button"
                onClick={() => {
                  stopPlayback();
                  setRevealedCount(idx + 1);
                  setCurrentIndex(idx);
                }}
                style={{
                  textAlign: "left",
                  background: isCurrent
                    ? "rgba(181,67,47,0.25)"
                    : "rgba(255,255,255,0.03)",
                  border: isCurrent
                    ? "1px solid #b5432f"
                    : "1px solid rgba(255,255,255,0.06)",
                  color: isCurrent ? "#ffe4da" : "#b9b2a2",
                  padding: "7px 10px",
                  paddingLeft: "26px",
                  borderRadius: "8px",
                  fontSize: "0.7rem",
                  fontWeight: isCurrent ? 700 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: "0.66rem",
                    color: catColor,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    flex: "0 0 auto",
                  }}
                >
                  {ev.year}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ev.title}
                </span>
              </button>
            );
          })}
        </div>

      {/* Harita Gövdesi */}
        <div
          ref={svgWrapRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            height: isFullscreen ? undefined : 480,
            borderRadius: "16px",
            overflow: "hidden",
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            background:
              "radial-gradient(ellipse at 30% 20%, #f4ecd8, #e6d9b8 55%, #d8c79a 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <svg
            viewBox={HISTORY_VIEWBOX}
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              maxHeight: isFullscreen ? "calc(100vh - 180px)" : undefined,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
              transformOrigin: "0 0",
              transition: "transform 0.05s linear",
            }}
          >
            {/* İl Sınırları — Selçuklu toprağı mavi, diğerleri orijinal */}
            {TURKEY_PROVINCE_PATHS.map((province) => {
              const inTerritory = territorySet.has(province.name);
              return (
                <path
                  key={province.name}
                  d={province.d}
                  fill={inTerritory ? "#3b82f6" : "#d8cba7"}
                  stroke={inTerritory ? "#1d4ed8" : "#a3906a"}
                  strokeWidth={inTerritory ? 1 : 0.7}
                  style={{ transition: "fill 0.3s" }}
                />
              );
            })}

            {/* Kronolojik olay bağlantı çizgisi */}
            {revealedCount > 1 && (
              <polyline
                points={filteredEvents
                  .slice(0, revealedCount)
                  .map((e) => `${e.x},${e.y}`)
                  .join(" ")}
                fill="none"
                stroke={topicColor}
                strokeWidth={2}
                strokeDasharray="6 5"
                strokeLinecap="round"
                opacity={0.6}
              />
            )}

            {/* Olay Pinleri (bayrak deseni) */}
            {filteredEvents.map((ev, idx) => {
              const revealed = idx < revealedCount;
              const isCurrent = idx === currentIndex;
              const catColor = HISTORY_CATEGORY_COLORS[ev.category];
              return (
                <g
                  key={`${selectedTopic}-${ev.year}`}
                  transform={`translate(${ev.x} ${ev.y})`}
                  style={{ cursor: "default" }}
                >
                  {revealed && (
                    <>
                      {/* Direk */}
                      <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={-16}
                        stroke="#3a1a12"
                        strokeWidth={1.4}
                        opacity={0.9}
                      />
                      {/* Bayrak */}
                      <path
                        d={`M 0,-16 L 11,-12 L 0,-8 Z`}
                        fill={isCurrent ? "#c99a3c" : catColor}
                        stroke="#3a1408"
                        strokeWidth={0.6}
                      />
                      {/* Çekirdek */}
                      <circle
                        r={isCurrent ? 4.2 : 3.2}
                        fill={isCurrent ? "#c99a3c" : catColor}
                        stroke="#3a1408"
                        strokeWidth={1.1}
                      />
                      {isCurrent && (
                        <circle
                          r={6}
                          fill="none"
                          stroke={catColor}
                          strokeWidth={1.5}
                          style={{
                            animation: "mapPulse 1.4s ease-out infinite",
                            transformOrigin: "center",
                          }}
                        />
                      )}
                      {/* Yıl etiketi */}
                      <text
                        y={-21}
                        textAnchor="middle"
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: 10,
                          fill: "#3a1408",
                          fontWeight: 700,
                          pointerEvents: "none",
                        }}
                      >
                        {ev.year}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Lejant — sınır + kategori renkleri */}
          <div
            style={{
              position: "absolute",
              right: 14,
              top: 12,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "0.68rem",
              color: "#5a5140",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              backdropFilter: "blur(3px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#3b82f6",
                  border: "1.5px solid #1d4ed8",
                  display: "inline-block",
                }}
              />
              {t.kpss_history_legend_territory || "Devlet sınırı"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: HISTORY_CATEGORY_COLORS.war,
                  border: "1.5px solid #3a1408",
                  display: "inline-block",
                }}
              />
              {t.kpss_history_cat_war || "Savaş / Fetih"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: HISTORY_CATEGORY_COLORS.treaty,
                  border: "1.5px solid #3a1408",
                  display: "inline-block",
                }}
              />
              {t.kpss_history_cat_treaty || "Antlaşma"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: HISTORY_CATEGORY_COLORS.trade,
                  border: "1.5px solid #3a1408",
                  display: "inline-block",
                }}
              />
              {t.kpss_history_cat_trade || "Ticaret"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: HISTORY_CATEGORY_COLORS.culture,
                  border: "1.5px solid #3a1408",
                  display: "inline-block",
                }}
              />
              {t.kpss_history_cat_culture || "Kültür / Bilim"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: HISTORY_CATEGORY_COLORS.organization,
                  border: "1.5px solid #3a1408",
                  display: "inline-block",
                }}
              />
              {t.kpss_history_cat_organization || "Teşkilat / Yönetim"}
            </div>
          </div>

        </div>
      </div>

      {/* Konu Anlatım Slaytı — harita altı, tam genişlik */}
      {currentIndex >= 0 && currentIndex < total && (
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(28,18,14,0.95), rgba(45,30,20,0.95))",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            padding: "18px 22px",
            color: "#f4ead7",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          {/* Üst satır: sıra + yıl + kategori */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#a99a82",
                fontWeight: 700,
              }}
            >
              {currentIndex + 1} / {total}
            </span>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#c99a3c",
              }}
            >
              {filteredEvents[currentIndex].year}
            </span>
            <span
              style={{
                fontSize: "0.66rem",
                padding: "2px 8px",
                borderRadius: 20,
                background: HISTORY_CATEGORY_COLORS[filteredEvents[currentIndex].category],
                color: "#fff",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {t[CATEGORY_KEYS[filteredEvents[currentIndex].category]] ||
                filteredEvents[currentIndex].category}
            </span>
          </div>
          {/* Başlık */}
          <h3
            style={{
              margin: "0 0 6px",
              fontFamily: "Georgia, serif",
              fontSize: "1.15rem",
              color: "#fff4e4",
            }}
          >
            {filteredEvents[currentIndex].title}
          </h3>
          {/* Anlatım */}
          <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.55, color: "#cfc3aa" }}>
            {filteredEvents[currentIndex].desc}
          </p>
          {/* Şehir */}
          <div
            style={{
              marginTop: 8,
              fontSize: "0.74rem",
              color: "#a99a82",
              fontStyle: "italic",
            }}
          >
            {filteredEvents[currentIndex].city}
          </div>
        </div>
      )}

      {/* @keyframes tanımı (global CSS'e eklenir) */}
      <style>{`
        @keyframes mapPulse {
          0% { opacity: 0.55; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(2.4); }
        }
      `}</style>
    </div>
  );
}
