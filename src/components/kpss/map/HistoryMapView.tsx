/**
 * HistoryMapView.tsx
 * KPSS Tarih haritası — Anadolu Selçuklu ünitesi (territory / points / diagram).
 * Parçalar: MapControls, HistoryTopicSidebar, HistoryMapCanvas (harita),
 * SchemaBuilder (devlet teşkilatı şeması), useMapPlayback (ortak mantık).
 */
import { useEffect, useState } from "preact/hooks";
import {
  HISTORY_UNITS,
  type HistoryUnit,
} from "@/domain/constants/TurkeyHistoryData.js";
import { MapControls } from "@/components/kpss/map/MapControls.js";
import { HistoryTopicSidebar } from "@/components/kpss/map/HistoryTopicSidebar.js";
import { HistoryMapCanvas } from "@/components/kpss/map/HistoryMapCanvas.js";
import { SchemaBuilder } from "@/components/kpss/map/SchemaBuilder.js";
import {
  TESKILAT_OUTLINE,
  TESKILAT_TITLE,
  OSMANLI_TESKILAT_OUTLINE,
  OSMANLI_TESKILAT_TITLE,
  countOutlineLines,
} from "@/components/kpss/map/StateStructureOutline.js";
import { useMapPlayback } from "@/components/kpss/map/useMapPlayback.js";

interface HistoryMapViewProps {
  t: Record<string, string>;
}

const STEP_MS = 2200;

const ANIM_CSS = `
@keyframes historyPulse {
  0%   { opacity: 0.55; r: 6; }
  100% { opacity: 0;    r: 20; }
}
@keyframes historyTrailin {
  from { opacity: 0; stroke-dashoffset: 40; }
  to   { opacity: 0.85; stroke-dashoffset: 0; }
}
@keyframes historyFadein {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

function getDiagramOutline(unitId: string): { outline: string; title: string } {
  if (unitId === "osmanli-teskilat") {
    return { outline: OSMANLI_TESKILAT_OUTLINE, title: OSMANLI_TESKILAT_TITLE };
  }
  return { outline: TESKILAT_OUTLINE, title: TESKILAT_TITLE };
}

function getInitialRevealed(u: HistoryUnit): number {
  if (u.mode === "diagram") {
    const { outline } = getDiagramOutline(u.id);
    return countOutlineLines(outline);
  }
  return u.events?.length || 0;
}

export function HistoryMapView({ t: _t }: HistoryMapViewProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    HISTORY_UNITS[0].id,
  );
  const initialUnit =
    HISTORY_UNITS.find((u) => u.id === HISTORY_UNITS[0].id) || HISTORY_UNITS[0];
  const playback = useMapPlayback({
    initialCount: getInitialRevealed(initialUnit),
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

  const unit =
    HISTORY_UNITS.find((u) => u.id === selectedUnitId) || HISTORY_UNITS[0];
  const isDiagram = unit.mode === "diagram";
  const events = isDiagram ? [] : unit.events || [];
  const diagramData = getDiagramOutline(unit.id);
  const nextTotal = isDiagram ? countOutlineLines(diagramData.outline) : events.length;

  useEffect(() => {
    if (total !== nextTotal) {
      setTotal(nextTotal);
    }
  }, [total, nextTotal, setTotal]);

  const territoryColors = new Map<string, string>();
  if (unit.mode === "territory") {
    events.slice(0, revealedCount).forEach((ev) => {
      (ev.territory || []).forEach((name) => {
        territoryColors.set(name, ev.color || unit.color);
      });
    });
  }

  const handleUnitChangeById = (id: string) => {
    if (id === selectedUnitId) {
      return;
    }
    const next = HISTORY_UNITS.find((u) => u.id === id) || HISTORY_UNITS[0];
    setSelectedUnitId(id);
    handleUnitChange(getInitialRevealed(next));
  };

  /* ---- Bilgi kartı (sadece harita olayları için) ---- */
  const currentEv =
    !isDiagram && currentIndex >= 0 && currentIndex < total
      ? events[currentIndex]
      : null;

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
      }}
    >
      <style>{ANIM_CSS}</style>

      <MapControls
        t={_t}
        title={unit.title}
        subtitle={unit.subtitle}
        total={total}
        revealedCount={revealedCount}
        playing={playing}
        isFullscreen={isFullscreen}
        onStep={handleStep}
        onReset={() => handleReset(getInitialRevealed(unit))}
        onPlayToggle={handlePlay}
        onToggleFullscreen={toggleFullscreen}
      />

      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <HistoryTopicSidebar
          units={HISTORY_UNITS}
          selectedUnitId={selectedUnitId}
          onSelect={handleUnitChangeById}
        />

        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          {isDiagram ? (
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                height: "100%",
              }}
            >
              <SchemaBuilder
                outline={diagramData.outline}
                title={diagramData.title}
                revealedCount={revealedCount}
              />
            </div>
          ) : (
            <HistoryMapCanvas
              events={events}
              revealedCount={revealedCount}
              currentIndex={currentIndex}
              unitColor={unit.color}
              territoryColors={territoryColors}
              view={view}
              isFullscreen={isFullscreen}
              svgWrapRef={svgWrapRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onWheel={onWheel}
            />
          )}

          {currentEv && (
            <div
              style={{
                position: "absolute",
                left: 16,
                bottom: 16,
                maxWidth: 320,
                background: "rgba(28,18,14,0.93)",
                color: "#f4ead7",
                borderRadius: 12,
                padding: "14px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
                animation: "historyFadein 0.3s ease-out",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: unit.color,
                  marginBottom: 5,
                }}
              >
                {currentIndex + 1} / {total}
                {currentEv.year && (
                  <span
                    style={{ color: "#c99a3c", fontWeight: 700, marginLeft: 8 }}
                  >
                    {currentEv.year}
                  </span>
                )}
              </div>
              {currentEv.tag && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    background: "rgba(201,154,60,0.18)",
                    color: "#c99a3c",
                    border: "1px solid rgba(201,154,60,0.4)",
                    padding: "2px 8px",
                    borderRadius: 20,
                    marginBottom: 6,
                  }}
                >
                  {currentEv.tag}
                </span>
              )}
              <h3
                style={{
                  margin: "0 0 3px",
                  fontFamily: "Georgia, serif",
                  fontSize: 17,
                  color: "#fff4e4",
                }}
              >
                {currentEv.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: "#cfc3aa",
                  lineHeight: 1.45,
                }}
              >
                {currentEv.desc}
              </p>
              {currentEv.city && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: "#a99a82",
                    marginTop: 6,
                    fontStyle: "italic",
                  }}
                >
                  {currentEv.city}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
