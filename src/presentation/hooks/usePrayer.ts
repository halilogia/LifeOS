import { useEffect } from "preact/hooks";
import { usePrayerState } from "@/presentation/store/prayerStore.js";

/**
 * Facade over usePrayerState — all state + storage + fetch lives in the store.
 * Consumer components are untouched.
 */
export function usePrayer() {
  const loading = usePrayerState((s) => s.loading);
  const error = usePrayerState((s) => s.error);
  const city = usePrayerState((s) => s.city);
  const setCity = usePrayerState((s) => s.setCity);
  const times = usePrayerState((s) => s.times);
  const isFormOpen = usePrayerState((s) => s.isFormOpen);
  const setIsFormOpen = usePrayerState((s) => s.setIsFormOpen);
  const currentPrayerIdx = usePrayerState((s) => s.currentPrayerIdx);
  const handleSaveCity = usePrayerState((s) => s.handleSaveCity);

  useEffect(() => {
    if (!times && !loading && !error) {
      void usePrayerState.getState().loadPrayers();
    }
  }, [times, loading, error]);

  return {
    loading,
    error,
    city,
    setCity,
    times,
    isFormOpen,
    setIsFormOpen,
    currentPrayerIdx,
    handleSaveCity,
  };
}
