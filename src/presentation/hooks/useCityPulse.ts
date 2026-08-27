import { useState, useEffect, useCallback, useMemo } from "preact/hooks";
import { cityPulseService } from "@/services/cityPulseService.js";
import type {
  CityEvent,
  CityEventCategory,
  CityEventType,
  EventHubShortcut,
} from "@/types/cityPulse.js";
import { Language } from "@/types/types.js";
import { logger } from "@/utils/logger.js";

interface UseCityPulseOptions {
  lang: Language;
}

// Positive indicators and negative flags
const FREE_NEGATIVE =
  /(ücretli|ücret karşılığı|biletli|bilet satış|bilet satın|ticket required|ticketed|admission fee|paid)/i;

/**
 * City Pulse state + fetch + filter logic (AGENTS.md 6.3: presentation/hooks/).
 * View only renders composed JSX layout.
 */
export function useCityPulse({ lang }: UseCityPulseOptions) {
  const [tab, setTab] = useState<"all" | "favorites">("all");
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [categories, setCategories] = useState<CityEventCategory[]>([]);
  const [types, setTypes] = useState<CityEventType[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const hubs: EventHubShortcut[] = useMemo(
    () => cityPulseService.getEventHubs(),
    [],
  );

  const loadData = useCallback(async (forceFresh = false) => {
    setLoading(true);
    setError(false);
    try {
      const [eventList, taxonomies, favs] = await Promise.all([
        cityPulseService.fetchEvents(forceFresh),
        cityPulseService.fetchTaxonomies(),
        cityPulseService.loadFavorites(),
      ]);
      setEvents(eventList);
      setCategories(taxonomies.categories);
      setTypes(taxonomies.types);
      setFavorites(favs);
      setLoading(false);
    } catch (e) {
      logger.error("[CityPulseView] loadData:", e);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const toggleFavorite = useCallback(
    async (eventId: number) => {
      const next = favorites.includes(eventId)
        ? favorites.filter((id) => id !== eventId)
        : [...favorites, eventId];
      setFavorites(next);
      try {
        await cityPulseService.saveFavorites(next);
      } catch (e) {
        logger.error("[CityPulseView] toggleFavorite:", e);
      }
    },
    [favorites],
  );

  const isFreeEvent = useCallback((event: CityEvent): boolean => {
    const text = `${event.title} ${event.excerpt}`.toLowerCase();
    return !FREE_NEGATIVE.test(text);
  }, []);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      if (tab === "favorites" && !favorites.includes(event.id)) {
        return false;
      }
      if (
        activeCategory !== "all" &&
        !event.categoryIds.includes(Number(activeCategory))
      ) {
        return false;
      }
      if (activeType !== "all" && !event.typeIds.includes(Number(activeType))) {
        return false;
      }
      if (freeOnly && !isFreeEvent(event)) {
        return false;
      }
      if (
        query &&
        !`${event.title} ${event.excerpt}`.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [
    events,
    tab,
    favorites,
    activeCategory,
    activeType,
    freeOnly,
    searchQuery,
    isFreeEvent,
  ]);

  const categoryName = useCallback(
    (id: number): string => categories.find((c) => c.id === id)?.name || "",
    [categories],
  );

  const typeName = useCallback(
    (id: number): string => types.find((t) => t.id === id)?.name || "",
    [types],
  );

  const formatEventDate = useCallback(
    (dateStr: string): string => {
      if (!dateStr) {
        return "";
      }
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return dateStr;
        }
        const locale = lang === "tr" ? "tr-TR" : "en-US";
        return date.toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return dateStr;
      }
    },
    [lang],
  );

  return {
    tab,
    setTab,
    events,
    categories,
    types,
    favorites,
    hubs,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeType,
    setActiveType,
    freeOnly,
    setFreeOnly,
    loading,
    error,
    filteredEvents,
    loadData,
    toggleFavorite,
    categoryName,
    typeName,
    formatEventDate,
  };
}
