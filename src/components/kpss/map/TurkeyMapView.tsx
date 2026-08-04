/**
 * TurkeyMapView.tsx
 * Türkiye Fiziki Haritası — konu seçici (volkanik dağlar, ovalar, göller, akarsular, platolar).
 * Video oynatıcı mantığı: ileri/geri sarma, fullscreen, başlangıçta tüm pinler görünür.
 * Veri: src/domain/constants/TurkeyGeographyData.ts + TurkeyProvincePaths.ts
 * Parçalar: MapControls, MapTopicSidebar, MapCanvas, useMapPlayback (ortak mantık).
 */
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  MAP_TOPICS,
  TOPIC_PINS,
  VOLCANIC_MOUNTAINS,
  TurkeyMapTopic,
} from "@/domain/constants/TurkeyGeographyData.js";
import { MapControls } from "./MapControls.js";
import { MapTopicSidebar } from "./MapTopicSidebar.js";
import { MapCanvas } from "./MapCanvas.js";
import { useMapPlayback } from "./useMapPlayback.js";

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
  const playback = useMapPlayback({
    initialCount: VOLCANIC_MOUNTAINS.length,
    stepMs: STEP_MS,
  });
  const {
    revealedCount,
    currentIndex,
    playing,
    isFullscreen,
    view,
    containerRef,
    svgWrapRef,
    total,
    setTotal,
    handleUnitChange,
    handlePlay,
    handleStep,
    handleReset,
    toggleFullscreen,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
  } = playback;

  const pins = TOPIC_PINS[selectedTopic];
  const topicMeta =
    MAP_TOPICS.find((m) => m.id === selectedTopic) || MAP_TOPICS[0];
  const topicColor = topicMeta.color;

  // Seçili konu değişince toplam pin sayısını senkronla
  const nextTotal = pins.length;
  useEffect(() => {
    if (total !== nextTotal) {
      setTotal(nextTotal);
    }
  }, [total, nextTotal, setTotal]);

  const handleTopicChange = (topic: TurkeyMapTopic) => {
    if (topic === selectedTopic) {
      return;
    }
    setSelectedTopic(topic);
    // Yeni konu da son haliyle (tüm pinler) açılır
    handleUnitChange(TOPIC_PINS[topic].length);
  };

  const title = useMemo(
    () =>
      t[TOPIC_TITLE_KEYS[selectedTopic]] ||
      t.kpss_map_title ||
      "Türkiye Fiziki Haritası",
    [t, selectedTopic],
  );

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
        title={title}
        total={total}
        revealedCount={revealedCount}
        playing={playing}
        isFullscreen={isFullscreen}
        onStep={handleStep}
        onReset={() => handleReset(total)}
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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
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
