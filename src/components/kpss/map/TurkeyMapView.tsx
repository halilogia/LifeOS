/**
 * TurkeyMapView.tsx
 * Türkiye Fiziki Haritası — İki Modlu Yönetici Bileşen.
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

import { useMapQuiz } from "./useMapQuiz.js";
import { MapQuizCanvas } from "./MapQuizCanvas.js";
import { MapQuizTargetBar } from "./MapQuizTargetBar.js";
import { MapQuizResultModal } from "./MapQuizResultModal.js";

interface TurkeyMapViewProps {
  t: Record<string, string>;
}

const STEP_MS = 1500;
type ViewMode = "study" | "quiz";

const TOPIC_TITLE_KEYS: Record<TurkeyMapTopic, string> = {
  mountains: "kpss_map_title_mountains",
  passes: "kpss_map_title_passes",
  gates: "kpss_map_title_gates",
  gulfs: "kpss_map_title_gulfs",
  unesco: "kpss_map_title_unesco",
  kivrim: "kpss_map_title_kivrim",
  kirik: "kpss_map_title_kirik",
  volcanic: "kpss_map_title_volcanic",
  plains: "kpss_map_title_plains",
  lakes: "kpss_map_title_lakes",
  rivers: "kpss_map_title_rivers",
  plateaus: "kpss_map_title_plateaus",
  coasts: "kpss_map_title_coasts",
  karst: "kpss_map_title_karst",
  climate_rain: "kpss_map_title_climate_rain",
  population: "kpss_map_title_population",
  dwellings: "kpss_map_title_dwellings",
  development_projects: "kpss_map_title_development_projects",
  agriculture: "kpss_map_title_agriculture",
  livestock: "kpss_map_title_livestock",
  mines: "kpss_map_title_mines",
  energy: "kpss_map_title_energy",
  industry: "kpss_map_title_industry",
  transport_borders: "kpss_map_title_transport_borders",
  tourism_unesco: "kpss_map_title_tourism_unesco",
  all: "kpss_map_title_all",
};

export function TurkeyMapView({ t }: TurkeyMapViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("study");
  const [selectedTopic, setSelectedTopic] = useState<TurkeyMapTopic>("kivrim");

  const playback = useMapPlayback({
    initialCount: (TOPIC_PINS[selectedTopic] || VOLCANIC_MOUNTAINS).length,
    stepMs: STEP_MS,
  });
  const {
    revealedCount,
    currentIndex: studyCurrentIndex,
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

  const quiz = useMapQuiz(selectedTopic);
  const { state: quizState, actions: quizActions } = quiz;

  const currentPins = TOPIC_PINS[selectedTopic] || TOPIC_PINS.kivrim;
  const topicMeta =
    MAP_TOPICS.find((m) => m.id === selectedTopic) || MAP_TOPICS[0];
  const topicColor = topicMeta.color;

  useEffect(() => {
    if (total !== currentPins.length) {
      setTotal(currentPins.length);
    }
  }, [total, currentPins.length, setTotal]);

  const handleTopicChange = (topic: TurkeyMapTopic) => {
    if (topic === selectedTopic) return;
    setSelectedTopic(topic);
    handleUnitChange(TOPIC_PINS[topic]?.length || 0);
    quizActions.setTopic(topic);
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
        height: isFullscreen ? "100vh" : undefined,
        boxSizing: "border-box",
        padding: isFullscreen ? "20px" : "0",
        background: isFullscreen
          ? "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)"
          : "transparent",
        overflow: isFullscreen ? "auto" : "visible",
      }}
    >
      {/* Mod seçici + skor barı */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: "rgba(15, 23, 42, 0.65)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "8px 12px",
          backdropFilter: "blur(8px)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setViewMode("study")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border:
                viewMode === "study"
                  ? "1px solid rgba(201, 154, 60, 0.5)"
                  : "1px solid transparent",
              background:
                viewMode === "study"
                  ? "linear-gradient(135deg, rgba(201, 154, 60, 0.25) 0%, rgba(161, 120, 38, 0.3) 100%)"
                  : "transparent",
              color: viewMode === "study" ? "#fff4e4" : "#94a3b8",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t.kpss_map_mode_study || "Öğrenme & Oynatma"}
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("quiz");
              if (isFullscreen) toggleFullscreen();
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border:
                viewMode === "quiz"
                  ? "1px solid rgba(34, 197, 94, 0.6)"
                  : "1px solid transparent",
              background:
                viewMode === "quiz"
                  ? "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.35) 100%)"
                  : "transparent",
              color: viewMode === "quiz" ? "#ffffff" : "#94a3b8",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t.kpss_map_mode_quiz || "İnteraktif Konum Oyunu"}
          </button>
        </div>
      </div>

      {/* MapControls: study → tüm kontroller, quiz → sadece fullscreen + skor */}
      <MapControls
        t={t}
        title={title}
        total={total}
        revealedCount={revealedCount}
        playing={playing}
        isFullscreen={isFullscreen}
        onStep={handleStep}
        onReset={() => handleReset(0)}
        onPlayToggle={handlePlay}
        onToggleFullscreen={toggleFullscreen}
        viewMode={viewMode}
        quizScore={quizState.score}
      />

      {/* Ana gövde: sidebar + harita */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "stretch",
          flex: 1,
          position: "relative",
        }}
      >
        <MapTopicSidebar
          t={t}
          selectedTopic={selectedTopic}
          onSelect={handleTopicChange}
        />

        {viewMode === "study" ? (
          <MapCanvas
            t={t}
            topicColor={topicColor}
            legendKey={topicMeta.legendKey}
            pins={currentPins}
            revealedCount={revealedCount}
            currentIndex={studyCurrentIndex}
            isFullscreen={isFullscreen}
            svgWrapRef={svgWrapRef}
            view={view}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={onWheel}
          />
        ) : (
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <MapQuizCanvas
              t={t}
              topicColor={topicColor}
              allTopicPins={currentPins}
              currentTarget={quizState.currentTarget}
              solvedPinNames={quizState.solvedPinNames}
              showHint={quizState.showHint}
              wrongAttemptPin={quizState.wrongAttemptPin}
              isFullscreen={isFullscreen}
              svgWrapRef={svgWrapRef}
              view={view}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onWheel={onWheel}
              onGuessPin={quizActions.handleGuess}
            />
            <MapQuizTargetBar
              t={t}
              currentTarget={quizState.currentTarget}
              currentIndex={quizState.currentIndex}
              total={quizState.targets.length}
              score={quizState.score}
              streak={quizState.streak}
              onSkip={quizActions.handleSkip}
              onHint={quizActions.handleHint}
              showHint={quizState.showHint}
              lastFeedback={quizState.lastFeedback}
            />
          </div>
        )}
      </div>

      {viewMode === "quiz" && quizState.isCompleted && (
        <MapQuizResultModal
          t={t}
          total={quizState.targets.length}
          score={quizState.score}
          wrongCount={quizState.wrongCount}
          skippedCount={quizState.skippedCount}
          bestStreak={quizState.bestStreak}
          onRestart={quizActions.handleRestart}
          onSwitchToStudy={() => setViewMode("study")}
        />
      )}
    </div>
  );
}
