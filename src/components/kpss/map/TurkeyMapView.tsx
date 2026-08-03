/**
 * TurkeyMapView.tsx
 * Türkiye Fiziki Haritası — konu seçici (volkanik dağlar, ovalar, göller, akarsular, platolar).
 * Video oynatıcı mantığı: ileri/geri sarma, fullscreen, başlangıçta tüm pinler görünür.
 * Veri: src/domain/constants/TurkeyGeographyData.ts + TurkeyProvincePaths.ts
 */
import { useEffect, useRef, useState } from "preact/hooks";
import {
  MAP_VIEWBOX,
  MAP_TOPICS,
  TOPIC_PINS,
  VOLCANIC_MOUNTAINS,
  TurkeyMapTopic,
} from "@/domain/constants/TurkeyGeographyData.js";
import { TURKEY_PROVINCE_PATHS } from "@/domain/constants/TurkeyProvincePaths.js";

interface TurkeyMapViewProps {
  t: Record<string, string>;
}

const STEP_MS = 1500;

const TOPIC_TITLE_KEYS: Record<TurkeyMapTopic, string> = {
  volcanic: "kpss_map_title_volcanic",
  plains: "kpss_map_title_plains",
  lakes: "kpss_map_title_lakes",
  rivers: "kpss_map_title_rivers",
  plateaus: "kpss_map_title_plateaus",
};

export function TurkeyMapView({ t }: TurkeyMapViewProps) {
  const [selectedTopic, setSelectedTopic] =
    useState<TurkeyMapTopic>("volcanic");
  // Başlangıçta tüm pinler görünür (göz aşinalığı) — play basınca 0'dan başlar
  const [revealedCount, setRevealedCount] = useState(VOLCANIC_MOUNTAINS.length);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pins = TOPIC_PINS[selectedTopic];
  const total = pins.length;
  const topicMeta = MAP_TOPICS.find((m) => m.id === selectedTopic) || MAP_TOPICS[0];
  const topicColor = topicMeta.color;

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

  const handleTopicChange = (topic: TurkeyMapTopic) => {
    if (topic === selectedTopic) {
      return;
    }
    stopPlayback();
    // Yeni konu da son haliyle (tüm pinler) açılır
    setRevealedCount(TOPIC_PINS[topic].length);
    setSelectedTopic(topic);
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
    // Sıfırla → son haliyle (tüm pinler görünür)
    setRevealedCount(total);
  };

  // --- Fare sol click basılı tutarak sürükleme (video oynatıcı timeline gibi) ---
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startCount: number;
  }>({ active: false, startX: 0, startCount: 0 });
  const svgWrapRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) {
      return;
    }
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startCount: revealedCount,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    stopPlayback();
  };

  const handlePointerMove = (e: PointerEvent) => {
    const drag = dragRef.current;
    const wrap = svgWrapRef.current;
    if (!drag.active || !wrap) {
      return;
    }
    const rect = wrap.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    // Sürükleme mesafesini harita genişliğine oranla → pin sayısına çevir
    const dx = e.clientX - drag.startX;
    const delta = Math.round((dx / rect.width) * total);
    const next = Math.min(total, Math.max(0, drag.startCount + delta));
    setRevealedCount(next);
    setCurrentIndex(next > 0 ? next - 1 : -1);
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "14px 18px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: "1.05rem",
              fontWeight: 800,
            }}
          >
            {t[TOPIC_TITLE_KEYS[selectedTopic]] ||
              t.kpss_map_title ||
              "Türkiye Fiziki Haritası"}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
            {total} {t.kpss_map_subtitle || "konum · sırasıyla oynat"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.78rem",
              color: "#94a3b8",
              background: "rgba(255,255,255,0.06)",
              padding: "6px 12px",
              borderRadius: "20px",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {revealedCount} / {total}
          </span>

          {/* İleri/Geri Sarma */}
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={revealedCount <= 0}
            title={t.kpss_map_prev || "Geri"}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: revealedCount <= 0 ? "#475569" : "#94a3b8",
              borderRadius: "8px",
              padding: "7px 12px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: revealedCount <= 0 ? "not-allowed" : "pointer",
              opacity: revealedCount <= 0 ? 0.5 : 1,
            }}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={revealedCount >= total}
            title={t.kpss_map_next || "İleri"}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: revealedCount >= total ? "#475569" : "#94a3b8",
              borderRadius: "8px",
              padding: "7px 12px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: revealedCount >= total ? "not-allowed" : "pointer",
              opacity: revealedCount >= total ? 0.5 : 1,
            }}
          >
            ▶
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#94a3b8",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {t.kpss_map_reset || "Sıfırla"}
          </button>
          <button
            type="button"
            onClick={handlePlay}
            style={{
              background: playing
                ? "rgba(220, 38, 38, 0.85)"
                : "linear-gradient(135deg, #c8511f, #e6773f)",
              border: "none",
              color: "#fff8ef",
              borderRadius: "8px",
              padding: "7px 16px",
              fontSize: "0.78rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            {playing ? "❚❚" : "▶"} {playing ? (t.kpss_map_stop || "Durdur") : (t.kpss_map_play || "Oynat")}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? (t.kpss_map_exit_fullscreen || "Tam Ekrandan Çık") : (t.kpss_map_fullscreen || "Tam Ekran")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#94a3b8",
              borderRadius: "8px",
              padding: "7px 12px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isFullscreen ? "⤢" : "⛶"}
          </button>
        </div>
      </div>

      {/* Konu Seçici + Harita */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "stretch",
          flex: isFullscreen ? 1 : undefined,
        }}
      >
        {/* Sol Sidebar: Konu Listesi */}
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
                onClick={() => handleTopicChange(topic.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  border: active ? `1px solid ${topic.color}` : "1px solid transparent",
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

        {/* Harita Gövdesi */}
        <div
          ref={svgWrapRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            borderRadius: "16px",
            overflow: "hidden",
            cursor: "grab",
            touchAction: "none",
            background:
              "radial-gradient(ellipse at 30% 20%, #f4ecd8, #e6d9b8 55%, #d8c79a 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <svg
            viewBox={MAP_VIEWBOX}
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              maxHeight: isFullscreen ? "calc(100vh - 180px)" : undefined,
            }}
          >
            {/* İl Sınırları */}
            {TURKEY_PROVINCE_PATHS.map((province) => (
              <path
                key={province.name}
                d={province.d}
                fill="#d8cba7"
                stroke="#a3906a"
                strokeWidth={0.7}
                style={{ transition: "fill 0.3s" }}
              />
            ))}

            {/* Konu Pinleri */}
            {pins.map((pin, idx) => {
              const revealed = idx < revealedCount;
              const isCurrent = idx === currentIndex;
              return (
                <g
                  key={`${selectedTopic}-${pin.name}`}
                  transform={`translate(${pin.x} ${pin.y})`}
                  style={{ cursor: "default" }}
                >
                  {revealed && (
                    <circle
                      r={isCurrent ? 8 : 5}
                      fill={isCurrent ? "#c99a3c" : topicColor}
                      stroke="#3a1408"
                      strokeWidth={1.1}
                    />
                  )}
                  {revealed && isCurrent && (
                    <circle
                      r={6}
                      fill="none"
                      stroke={topicColor}
                      strokeWidth={1.5}
                      style={{
                        animation: "mapPulse 1.4s ease-out infinite",
                        transformOrigin: "center",
                      }}
                    />
                  )}
                  {revealed && (
                    <text
                      y={-10}
                      textAnchor="middle"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: 13,
                        fill: "#3a1408",
                        fontWeight: 700,
                        pointerEvents: "none",
                      }}
                    >
                      {pin.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Lejant */}
          <div
            style={{
              position: "absolute",
              right: 14,
              top: 12,
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "0.72rem",
              color: "#5a5140",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: topicColor,
                border: "1.5px solid #3a1408",
                display: "inline-block",
              }}
            />
            {t[topicMeta.legendKey] || t.kpss_map_legend || "Konum"}
          </div>

          {/* Bilgi Kartı */}
          {currentIndex >= 0 && currentIndex < total && (
            <div
              style={{
                position: "absolute",
                left: 16,
                bottom: 16,
                maxWidth: 280,
                background: "rgba(30, 24, 16, 0.92)",
                color: "#f4ead7",
                borderRadius: "12px",
                padding: "12px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: topicColor,
                  marginBottom: 3,
                }}
              >
                {currentIndex + 1} / {total}
              </div>
              <h4
                style={{
                  margin: "0 0 3px",
                  fontFamily: "Georgia, serif",
                  fontSize: "1rem",
                  color: "#fff4e4",
                }}
              >
                {pins[currentIndex].name}
              </h4>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#cfc3aa" }}>
                {pins[currentIndex].city}
              </p>
            </div>
          )}
        </div>
      </div>

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
