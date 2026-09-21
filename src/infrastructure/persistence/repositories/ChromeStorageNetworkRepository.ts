/**
 * ChromeStorageNetworkRepository
 * Infrastructure implementation of INetworkRepository using chrome.storage.local.
 * Maintains up to 20 recent diagnostic reports.
 */

import type { INetworkRepository } from "@/domain/repositories/INetworkRepository.js";
import type { NetworkDiagnosticsReport } from "@/types/network.js";
import { LOCAL_NETWORK_DIAGNOSTICS_HISTORY } from "@/infrastructure/storage/keys.js";
import { logger } from "@/utils/logger.js";

const MAX_HISTORY_ITEMS = 20;

export class ChromeStorageNetworkRepository implements INetworkRepository {
  getHistory(): Promise<NetworkDiagnosticsReport[]> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          const raw = localStorage.getItem(LOCAL_NETWORK_DIAGNOSTICS_HISTORY);
          resolve(raw ? (JSON.parse(raw) as NetworkDiagnosticsReport[]) : []);
        } catch (err) {
          logger.error("[ChromeStorageNetworkRepository] getHistory localStorage error:", err);
          resolve([]);
        }
        return;
      }

      chrome.storage.local.get([LOCAL_NETWORK_DIAGNOSTICS_HISTORY], (res) => {
        if (chrome.runtime.lastError) {
          logger.warn("[ChromeStorageNetworkRepository] getHistory lastError:", chrome.runtime.lastError);
        }
        const data = res[LOCAL_NETWORK_DIAGNOSTICS_HISTORY] as
          | NetworkDiagnosticsReport[]
          | undefined;
        resolve(Array.isArray(data) ? data : []);
      });
    });
  }

  async saveReport(report: NetworkDiagnosticsReport): Promise<void> {
    const existing = await this.getHistory();
    const updated = [report, ...existing.filter((item) => item.id !== report.id)].slice(
      0,
      MAX_HISTORY_ITEMS,
    );

    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          localStorage.setItem(
            LOCAL_NETWORK_DIAGNOSTICS_HISTORY,
            JSON.stringify(updated),
          );
        } catch (err) {
          logger.error("[ChromeStorageNetworkRepository] saveReport localStorage error:", err);
        }
        resolve();
        return;
      }

      chrome.storage.local.set(
        { [LOCAL_NETWORK_DIAGNOSTICS_HISTORY]: updated },
        () => {
          if (chrome.runtime.lastError) {
            logger.warn("[ChromeStorageNetworkRepository] saveReport lastError:", chrome.runtime.lastError);
          }
          resolve();
        },
      );
    });
  }

  clearHistory(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          localStorage.removeItem(LOCAL_NETWORK_DIAGNOSTICS_HISTORY);
        } catch (err) {
          logger.error("[ChromeStorageNetworkRepository] clearHistory localStorage error:", err);
        }
        resolve();
        return;
      }

      chrome.storage.local.remove([LOCAL_NETWORK_DIAGNOSTICS_HISTORY], () => {
        if (chrome.runtime.lastError) {
          logger.warn("[ChromeStorageNetworkRepository] clearHistory lastError:", chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }
}
