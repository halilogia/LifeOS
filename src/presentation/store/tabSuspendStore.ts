/**
 * tabSuspendStore.ts
 * Zustand singleton — Bellek Uyutucu ayarı + durum bilgisi.
 *
 * Arka plan servis worker'ı ayarı doğrudan `chrome.storage.local`'den okur
 * (ayrı bir JS bağlamı olduğu için zustand store'u paylaşılamaz). Tek doğruluk
 * kaynağı depodaki `tab_suspend_config` girdisidir; store yalnızca UI için
 * bir görünüm + yazma yoludur.
 *
 * Ayar değiştiğinde servis worker `chrome.storage.onChanged` ile uyarılır ve
 * alarmı kendisi günceller — buradan mesaj göndermeye gerek yoktur.
 */

import { create } from "zustand";
import {
  DEFAULT_TAB_SUSPEND_CONFIG,
  IDLE_MINUTE_OPTIONS,
  isValidIdleMinutes,
  type TabSuspendConfig,
} from "@/domain/services/tabSuspendPolicy.js";

const CONFIG_KEY = "tab_suspend_config";

export interface TabSuspendStatus {
  enabled: boolean;
  idleMinutes: number;
  lastSweepAt: number;
  candidates: number;
  discarded: number;
  failed: number;
}

const EMPTY_STATUS: TabSuspendStatus = {
  enabled: false,
  idleMinutes: DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes,
  lastSweepAt: 0,
  candidates: 0,
  discarded: 0,
  failed: 0,
};

interface TabSuspendState {
  enabled: boolean;
  idleMinutes: number;
  status: TabSuspendStatus;
  loading: boolean;
  load: () => Promise<void>;
  setEnabled: (value: boolean) => Promise<void>;
  setIdleMinutes: (minutes: number) => Promise<void>;
  refreshStatus: () => Promise<void>;
  runNow: () => Promise<void>;
}

async function writeConfig(patch: Partial<TabSuspendConfig>): Promise<void> {
  const current = await new Promise<Partial<TabSuspendConfig>>((resolve) =>
    chrome.storage.local.get([CONFIG_KEY], (res) =>
      resolve((res[CONFIG_KEY] as Partial<TabSuspendConfig>) ?? {}),
    ),
  );
  const merged: TabSuspendConfig = {
    enabled: current.enabled === true,
    idleMinutes: isValidIdleMinutes(current.idleMinutes)
      ? current.idleMinutes
      : DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes,
    extraProtectedUrls: Array.isArray(current.extraProtectedUrls)
      ? current.extraProtectedUrls
      : [],
    ...patch,
  };
  await chrome.storage.local.set({ [CONFIG_KEY]: merged });
}

export const useTabSuspendStore = create<TabSuspendState>()((set, get) => ({
  enabled: DEFAULT_TAB_SUSPEND_CONFIG.enabled,
  idleMinutes: DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes,
  status: EMPTY_STATUS,
  loading: true,

  load: async () => {
    set({ loading: true });
    await get().refreshStatus();
    set({ loading: false });
  },

  refreshStatus: async () => {
    try {
      const res = await chrome.runtime.sendMessage({
        type: "tab_suspend_get_status",
      });
      if (res && typeof res === "object") {
        const status = res as TabSuspendStatus;
        set({
          enabled: status.enabled === true,
          idleMinutes: isValidIdleMinutes(status.idleMinutes)
            ? status.idleMinutes
            : DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes,
          status: { ...EMPTY_STATUS, ...status },
        });
        return;
      }
    } catch {
      // Servis worker henüz uyanmamış olabilir; depodaki değere düş.
    }
    const stored = await new Promise<Partial<TabSuspendConfig>>((resolve) =>
      chrome.storage.local.get([CONFIG_KEY], (res) =>
        resolve((res[CONFIG_KEY] as Partial<TabSuspendConfig>) ?? {}),
      ),
    );
    set({
      enabled: stored.enabled === true,
      idleMinutes: isValidIdleMinutes(stored.idleMinutes)
        ? stored.idleMinutes
        : DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes,
    });
  },

  setEnabled: async (value) => {
    set({ enabled: value });
    await writeConfig({ enabled: value });
    await get().refreshStatus();
  },

  setIdleMinutes: async (minutes) => {
    if (!isValidIdleMinutes(minutes)) {
      return;
    }
    set({ idleMinutes: minutes });
    await writeConfig({ idleMinutes: minutes });
  },

  runNow: async () => {
    await chrome.runtime.sendMessage({ type: "tab_suspend_run_now" });
    await get().refreshStatus();
  },
}));

/** Ayar bileşeninde seçim kutusunu doldurmak için. */
export { IDLE_MINUTE_OPTIONS };
