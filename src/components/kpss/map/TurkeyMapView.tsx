/**
 * TurkeyMapView.tsx
 * Türkiye Fiziki Haritası — konu seçici (volkanik dağlar, ovalar, göller, akarsular, platolar).
 * Video oynatıcı mantığı: ileri/geri sarma, fullscreen, başlangıçta tüm pinler görünür.
 * Veri: src/domain/constants/TurkeyGeographyData.ts + TurkeyProvincePaths.ts
 * Parçalar: MapControls, MapTopicSidebar, MapCanvas.
 */
import { useEffect, useRef, useState } from "preact/hooks";
import {
  MAP_TOPICS,
  TOPIC_PINS,
  VOLCANIC_MOUNTAINS,
  TurkeyMapTopic,
} from "@/domain/constants/TurkeyGeographyData.js";
import { MapControls } from "./MapControls.js";
import { MapTopicSidebar } from "./MapTopicSidebar.js";
import { MapCanvas } from "./MapCanvas.js";

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
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  // viewRef — wheel handler'da güncel view'a erişim
  const viewRef = useRef(view);
  viewRef.current = view;
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
  const svgWrapRef = useRef<HTMLDivElement | null>(null);

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

  // viewRef — wheel handler'da güncel view'a erişim

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
          t.kpss_map_title ||
          "Türkiye Fiziki Haritası"
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
        {/* Sol Sidebar: Konu Listesi */}
        <MapTopicSidebar
          t={t}
          selectedTopic={selectedTopic}
          onSelect={handleTopicChange}
        />

        {/* Harita Gövdesi */}
        <MapCanvas
          t={t}
          topicColor={topicColor}
          legendKey={topicMeta.legendKey}
          pins={pins}
          revealedCount={revealedCount}
          currentIndex={currentIndex}
          isFullscreen={isFullscreen}
          svgWrapRef={svgWrapRef}
          view={view}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        />
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
