/**
 * useMapPlayback.ts
 * Harita görünümleri (TurkeyMapView / HistoryMapView) için ortak state + handler'lar.
 * Kapsar: oynat/duraklat, ileri/geri sarma, sıfırla, pan (sürükleme), zoom (tekerlek),
 * tam ekran. İki harita view'ı arasındaki kopya mantığı tek yerde toplar.
 */
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export interface MapPlaybackOptions {
  /** Başlangıçta gösterilecek öğe sayısı (genelde tümü) */
  initialCount: number;
  /** Oynat adım aralığı (ms) */
  stepMs: number;
}

export interface MapPlayback {
  revealedCount: number;
  currentIndex: number;
  playing: boolean;
  isFullscreen: boolean;
  view: { x: number; y: number; scale: number };
  containerRef: { current: HTMLDivElement | null };
  svgWrapRef: { current: HTMLDivElement | null };
  total: number;
  setTotal: (n: number) => void;
  handleUnitChange: (nextCount: number) => void;
  handlePlay: () => void;
  handleStep: (dir: 1 | -1) => void;
  handleReset: (resetToCount: number) => void;
  toggleFullscreen: () => void;
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: () => void;
  onWheel: (e: WheelEvent) => void;
}

export function useMapPlayback({
  initialCount,
  stepMs,
}: MapPlaybackOptions): MapPlayback {
  const [revealedCount, setRevealedCount] = useState(initialCount);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [total, setTotal] = useState(initialCount);

  const viewRef = useRef(view);
  viewRef.current = view;
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgWrapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const stopPlayback = useCallback(() => {
    clearTimer();
    setPlaying(false);
  }, [clearTimer]);

  const handlePlay = useCallback(() => {
    if (playing) {
      stopPlayback();
      return;
    }
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
        const n = prev + 1;
        setRevealedCount(n + 1);
        return n;
      });
    }, stepMs);
  }, [playing, stopPlayback, clearTimer, total, stepMs]);

  const handleUnitChange = useCallback(
    (nextCount: number) => {
      stopPlayback();
      setRevealedCount(nextCount);
      setCurrentIndex(-1);
      setView({ x: 0, y: 0, scale: 1 });
    },
    [stopPlayback],
  );

  const handleStep = useCallback(
    (dir: 1 | -1) => {
      stopPlayback();
      setRevealedCount((prev) => {
        const next = Math.min(total, Math.max(0, prev + dir));
        setCurrentIndex(next > 0 ? next - 1 : -1);
        return next;
      });
    },
    [stopPlayback, total],
  );

  const handleReset = useCallback(
    (resetToCount: number) => {
      stopPlayback();
      setRevealedCount(resetToCount);
      setCurrentIndex(-1);
      setView({ x: 0, y: 0, scale: 1 });
    },
    [stopPlayback],
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
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
    },
    [stopPlayback],
  );

  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) {
      return;
    }
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    setView({ x: d.originX + dx, y: d.originY + dy, scale: viewRef.current.scale });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = { ...dragRef.current, active: false };
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
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
      const ns = Math.min(5, Math.max(0.5, v.scale * factor));
      const k = ns / v.scale;
      return {
        scale: ns,
        x: px - (px - v.x) * k,
        y: py - (py - v.y) * k,
      };
    });
  }, []);

  return {
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
  };
}
