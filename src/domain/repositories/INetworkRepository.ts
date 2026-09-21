/**
 * INetworkRepository Interface
 * Pure contract for persisting and retrieving network diagnostic session history.
 */

import type { NetworkDiagnosticsReport } from "@/types/network.js";

export interface INetworkRepository {
  getHistory(): Promise<NetworkDiagnosticsReport[]>;
  saveReport(report: NetworkDiagnosticsReport): Promise<void>;
  clearHistory(): Promise<void>;
}
