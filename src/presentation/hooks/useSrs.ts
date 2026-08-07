import { useEffect } from "preact/hooks";
import { useSrsState } from "@/presentation/store/srsStore.js";

/**
 * Facade over useSrsState — all state + storage lives in the store.
 * Consumer components are untouched.
 */
export function useSrs() {
  const loading = useSrsState((s) => s.loading);
  const error = useSrsState((s) => s.error);
  const wordsData = useSrsState((s) => s.wordsData);
  const currentQueue = useSrsState((s) => s.currentQueue);
  const currentWordIndex = useSrsState((s) => s.currentWordIndex);
  const setCurrentWordIndex = useSrsState((s) => s.setCurrentWordIndex);
  const isFlipped = useSrsState((s) => s.isFlipped);
  const setIsFlipped = useSrsState((s) => s.setIsFlipped);
  const fadeState = useSrsState((s) => s.fadeState);
  const loadSrsQueue = useSrsState((s) => s.loadSrsQueue);
  const handleReview = useSrsState((s) => s.handleReview);

  useEffect(() => {
    void useSrsState.getState().loadSrsQueue();
  }, []);

  return {
    loading,
    error,
    wordsData,
    currentQueue,
    currentWordIndex,
    setCurrentWordIndex,
    isFlipped,
    setIsFlipped,
    fadeState,
    loadSrsQueue,
    handleReview,
  };
}
