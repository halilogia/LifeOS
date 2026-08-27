/**
 * useGovJobs.ts
 * Custom hook for Gov Jobs & Career Gateway state management.
 * Follows Clean Architecture (UI hooks layer).
 */

import { useState, useEffect, useCallback, useMemo } from "preact/hooks";
import type {
  GovJobItem,
  GovJobCategory,
  GovJobStatusFilter,
  GovJobHubShortcut,
} from "@/types/govJobs.js";
import { createGovJobsService } from "@/services/govJobsService.js";

export function useGovJobs() {
  const service = useMemo(() => createGovJobsService(), []);

  const [jobs, setJobs] = useState<GovJobItem[]>([]);
  const [hubs] = useState<GovJobHubShortcut[]>(service.getJobHubs());
  const [category, setCategory] = useState<GovJobCategory>("all");
  const [statusFilter, setStatusFilter] = useState<GovJobStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(
    async (forceFresh = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await service.fetchLiveGovJobs(forceFresh);
        setJobs(data);
      } catch (err) {
        setError("Kamu ilanları yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    },
    [service],
  );

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    return service.filterJobs(jobs, category, statusFilter, searchQuery);
  }, [service, jobs, category, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((j) => !j.isExpired).length;
    const endingSoon = jobs.filter(
      (j) => !j.isExpired && j.daysLeft >= 0 && j.daysLeft <= 3,
    ).length;
    const todayStr = new Date().toISOString().split("T")[0];
    const newToday = jobs.filter((j) => j.publishDate === todayStr).length;

    return {
      total,
      active,
      endingSoon,
      newToday,
    };
  }, [jobs]);

  return {
    jobs,
    filteredJobs,
    hubs,
    category,
    statusFilter,
    searchQuery,
    isLoading,
    error,
    stats,
    setCategory,
    setStatusFilter,
    setSearchQuery,
    refreshJobs: () => loadJobs(true),
  };
}
