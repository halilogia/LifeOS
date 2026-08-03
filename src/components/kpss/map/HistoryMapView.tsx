/**
 * HistoryMapView.tsx
 * KPSS Tarih Haritası — Anadolu Selçuklu ünitesi.
 * Tuval: state + handlers + layout. Alt bileşenler: HistorySidebar, HistoryMapSvg, HistoryInfoCard.
 */
import { useEffect, useRef, useState } from "preact/hooks";
import {
  HISTORY_UNITS,
  type HistoryEvent,
  type HistoryDiagramNode,
} from "@/domain/constants/TurkeyHistoryData.js";
import { MapControls } from "@/components/kpss/map/MapControls.js";
import { HistorySidebar } from "@/components/kpss/map/HistorySidebar.js";
import { HistoryMapSvg } from "@/components/kpss/map/HistoryMapSvg.js";
import { HistoryInfoCard } from "@/components/kpss/map/HistoryInfoCard.js";

interface HistoryMapViewProps {
  t: Record<string, string>;
}

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

const STEP_MS = 2200;

/* ========== Animasyon keyframes ========== */
const ANIM_CSS = `
@keyframes drop {
  0%   { transform: translateY(-14px) scale(0.4); opacity: 0; }
  100% { transform: translateY(0)      scale(1);   opacity: 1; }
}
@keyframes fadein {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0);   }
}
@keyframes pop {
  0%   { opacity: 0.55; r: 2;   }
  100% { opacity: 0;    r: 22;  }
}
@keyframes pulse {
  0%   { opacity: 0.55; r: 6;   }
  100% { opacity: 0;    r: 20;  }
}
@keyframes trailin {
  from { opacity: 0; stroke-dashoffset: 40; }
  to   { opacity: 0.85; stroke-dashoffset: 0; }
}
`;

export function HistoryMapView({ t }: HistoryMapViewProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    HISTORY_UNITS[0].id
  );
  const [revealedCount, setRevealedCount] = useState(
    HISTORY_UNITS[0].events?.length || 0
  );
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgWrapRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    viewX: number;
    viewY: number;
  } | null>(null);

  const unit =
    HISTORY_UNITS.find((u) => u.id === selectedUnitId) || HISTORY_UNITS[0];
  const isDiagram = unit.mode === "diagram";
  const events: HistoryEvent[] = unit.events || [];
  const nodes: HistoryDiagramNode[] = unit.nodes || [];
  const total = isDiagram ? nodes.length : events.length;
  const currentEv =
    currentIndex >= 0 && currentIndex < total
      ? isDiagram
        ? nodes[currentIndex]
        : events[currentIndex]
      : null;

  // Birikimli territory boyama
  const territoryColors = new Map<string, string>();
  if (unit.mode === "territory") {
    events.slice(0, revealedCount).forEach((ev) => {
      (ev.territory || []).forEach((name) => {
        territoryColors.set(name, ev.color || unit.color);
      });
    });
  }

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopPlayback = () => {
    setPlaying(false);
    clearTimer();
  };

  const handleUnitChange = (id: string) => {
    if (id === selectedUnitId) {
      return;
    }
    stopPlayback();
    const next = HISTORY_UNITS.find((u) => u.id === id);
    if (!next) {
      return;
    }
    setSelectedUnitId(id);
    setRevealedCount(
      next.mode === "diagram"
        ? next.nodes?.length || 0
        : next.events?.length || 0
    );
    setCurrentIndex(-1);
    setView({ x: 0, y: 0, scale: 1 });
  };

  const handlePlay = () => {
    if (playing) {
      stopPlayback();
      return;
    }
    if (revealedCount >= total) {
      setRevealedCount(0);
      setCurrentIndex(-1);
      setPlaying(true);
      window.setTimeout(() => {
        setRevealedCount(1);
        setCurrentIndex(0);
      }, 60);
    } else {
      setPlaying(true);
    }
  };

  useEffect(() => {
    if (!playing) {
      return;
    }
    timerRef.current = window.setInterval(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        setCurrentIndex(next - 1);
        if (next >= total) {
          stopPlayback();
        }
        return next;
      });
    }, STEP_MS);
    return () => {
      clearTimer();
    };
  }, [playing, total]);

  const handleStep = (dir: number) => {
    stopPlayback();
    const next = Math.min(total, Math.max(0, revealedCount + dir));
    setRevealedCount(next);
    setCurrentIndex(next > 0 ? next - 1 : -1);
  };

  const handleReset = () => {
    stopPlayback();
    setRevealedCount(0);
    setCurrentIndex(-1);
    setView({ x: 0, y: 0, scale: 1 });
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

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Pan
  const handlePointerDown = (e: PointerEvent) => {
    const el = svgWrapRef.current;
    if (!el) {
      return;
    }
    el.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      viewX: view.x,
      viewY: view.y,
    };
  };

  const handlePointerMove = (e: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setView((v) => ({ ...v, x: drag.viewX + dx, y: drag.viewY + dy }));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const el = svgWrapRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setView((v) => {
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newScale = Math.min(5, Math.max(0.5, v.scale * factor));
      const k = newScale / v.scale;
      return {
        scale: newScale,
        x: px - (px - v.x) * k,
        y: py - (py - v.y) * k,
      };
    });
  };

  const sidebarMaxH = isFullscreen
    ? "calc(100vh - 120px)"
    : "480px";

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
      }}
    >
      <style>{ANIM_CSS}</style>

      <MapControls
        t={t}
        title={unit.title}
        subtitle={unit.subtitle}
        total={total}
        revealedCount={revealedCount}
        playing={playing}
        isFullscreen={isFullscreen}
        onStep={handleStep}
        onReset={handleReset}
        onPlayToggle={handlePlay}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Sidebar + Harita */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "stretch",
          flex: isFullscreen ? 1 : undefined,
        }}
      >
        <HistorySidebar
          units={HISTORY_UNITS}
          selectedUnitId={selectedUnitId}
          onUnitChange={handleUnitChange}
          unitColor={unit.color}
          legend={unit.legend}
          maxHeight={sidebarMaxH}
        />

        {/* Harita + bilgi kartı container */}
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <HistoryMapSvg
            isDiagram={isDiagram}
            events={events}
            nodes={nodes}
            revealedCount={revealedCount}
            currentIndex={currentIndex}
            unitColor={unit.color}
            territoryColors={territoryColors}
            view={view}
            isFullscreen={isFullscreen}
            svgWrapRef={svgWrapRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          />

          {currentEv && (
            <HistoryInfoCard
              ev={currentEv}
              isDiagram={isDiagram}
              currentIndex={currentIndex}
              total={total}
              unitColor={unit.color}
            />
          )}
        </div>
      </div>
    </div>
  );
}
