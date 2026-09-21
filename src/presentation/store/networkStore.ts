/**
 * useNetworkStore
 * Zustand store for Network Diagnostics & Health Hub.
 * Manages active diagnostic sessions, live speedometer gauges, and history.
 */

import { create } from "zustand";
import type {
  NetworkDiagnosticsReport,
  PingResult,
  ProtocolHealth,
  SpeedTestResult,
  DnsCheckResult,
} from "@/types/network.js";
import {
  networkDiagnosticService,
  DEFAULT_PING_TARGETS,
} from "@/services/networkDiagnosticService.js";
import { ChromeStorageNetworkRepository } from "@/infrastructure/persistence/repositories/ChromeStorageNetworkRepository.js";
import { logger } from "@/utils/logger.js";

const networkRepo = new ChromeStorageNetworkRepository();

export type NetworkTab =
  | "overview"
  | "services"
  | "speed"
  | "protocol"
  | "history";

interface NetworkState {
  activeTab: NetworkTab;
  isTesting: boolean;
  currentPhase: string;
  progressPercent: number;
  speedGaugeMbps: number;
  latestReport: NetworkDiagnosticsReport | null;
  history: NetworkDiagnosticsReport[];
  lastCopied: boolean;

  setActiveTab: (tab: NetworkTab) => void;
  loadHistory: () => Promise<void>;
  runFullDiagnostic: () => Promise<void>;
  runQuickPing: () => Promise<void>;
  runSpeedTestOnly: () => Promise<void>;
  clearHistory: () => Promise<void>;
  copyMarkdownReport: (report?: NetworkDiagnosticsReport) => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  activeTab: "overview",
  isTesting: false,
  currentPhase: "idle",
  progressPercent: 0,
  speedGaugeMbps: 0,
  latestReport: null,
  history: [],
  lastCopied: false,

  setActiveTab: (activeTab: NetworkTab) => set({ activeTab }),

  loadHistory: async () => {
    try {
      const history = await networkRepo.getHistory();
      set({
        history,
        latestReport: history.length > 0 ? history[0] : get().latestReport,
      });
    } catch (err) {
      logger.error("[useNetworkStore] loadHistory error:", err);
    }
  },

  runFullDiagnostic: async () => {
    if (get().isTesting) {
      return;
    }

    set({
      isTesting: true,
      currentPhase: "services",
      progressPercent: 10,
      speedGaugeMbps: 0,
    });

    try {
      const report = await networkDiagnosticService.runFullDiagnostics(
        true,
        (phase, percent) => {
          set({ currentPhase: phase, progressPercent: percent });
        },
      );

      await networkRepo.saveReport(report);
      const history = await networkRepo.getHistory();

      set({
        isTesting: false,
        currentPhase: "complete",
        progressPercent: 100,
        latestReport: report,
        history,
        speedGaugeMbps: report.speedTest?.downloadSpeedMbps || 0,
      });
    } catch (err) {
      logger.error("[useNetworkStore] runFullDiagnostic error:", err);
      set({ isTesting: false, currentPhase: "error", progressPercent: 0 });
    }
  },

  runQuickPing: async () => {
    if (get().isTesting) {
      return;
    }

    set({
      isTesting: true,
      currentPhase: "services",
      progressPercent: 25,
    });

    try {
      const pingResults: PingResult[] = [];
      for (let i = 0; i < DEFAULT_PING_TARGETS.length; i++) {
        const target = DEFAULT_PING_TARGETS[i];
        const res = await networkDiagnosticService.pingTarget(target);
        pingResults.push(res);
        set({
          progressPercent:
            25 + Math.round(((i + 1) / DEFAULT_PING_TARGETS.length) * 50),
        });
      }

      const protocolHealth: ProtocolHealth =
        await networkDiagnosticService.checkProtocolHealth();
      const dnsChecks: DnsCheckResult[] =
        await networkDiagnosticService.runDnsResolutionCheck();
      const connectionInfo =
        networkDiagnosticService.getSystemConnectionInfo();

      const existingReport = get().latestReport;
      const report: NetworkDiagnosticsReport = {
        id: `report_${Date.now()}`,
        timestamp: Date.now(),
        overallHealth: protocolHealth.issueDetected ? "poor" : "good",
        connectionInfo,
        protocolHealth,
        pingResults,
        speedTest: existingReport?.speedTest,
        dnsChecks,
      };

      await networkRepo.saveReport(report);
      const history = await networkRepo.getHistory();

      set({
        isTesting: false,
        currentPhase: "complete",
        progressPercent: 100,
        latestReport: report,
        history,
      });
    } catch (err) {
      logger.error("[useNetworkStore] runQuickPing error:", err);
      set({ isTesting: false, currentPhase: "error", progressPercent: 0 });
    }
  },

  runSpeedTestOnly: async () => {
    if (get().isTesting) {
      return;
    }

    set({
      isTesting: true,
      currentPhase: "speed",
      progressPercent: 10,
      speedGaugeMbps: 0,
    });

    try {
      const speedRes: SpeedTestResult =
        await networkDiagnosticService.runSpeedTest((prog, mbps) => {
          set({ progressPercent: prog, speedGaugeMbps: mbps });
        });

      const current = get().latestReport;
      if (current) {
        const updatedReport: NetworkDiagnosticsReport = {
          ...current,
          speedTest: speedRes,
          timestamp: Date.now(),
        };
        await networkRepo.saveReport(updatedReport);
        const history = await networkRepo.getHistory();
        set({ latestReport: updatedReport, history });
      }

      set({
        isTesting: false,
        currentPhase: "complete",
        progressPercent: 100,
        speedGaugeMbps: speedRes.downloadSpeedMbps,
      });
    } catch (err) {
      logger.error("[useNetworkStore] runSpeedTestOnly error:", err);
      set({ isTesting: false, currentPhase: "error", progressPercent: 0 });
    }
  },

  clearHistory: async () => {
    try {
      await networkRepo.clearHistory();
      set({ history: [], latestReport: null });
    } catch (err) {
      logger.error("[useNetworkStore] clearHistory error:", err);
    }
  },

  copyMarkdownReport: async (report?: NetworkDiagnosticsReport) => {
    const target = report || get().latestReport;
    if (!target) {
      return false;
    }

    try {
      const md = networkDiagnosticService.generateMarkdownReport(target);
      await navigator.clipboard.writeText(md);
      set({ lastCopied: true });
      setTimeout(() => set({ lastCopied: false }), 3000);
      return true;
    } catch (err) {
      logger.error("[useNetworkStore] copyMarkdownReport error:", err);
      return false;
    }
  },
}));
