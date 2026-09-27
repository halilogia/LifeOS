/**
 * tabSuspendHandler.ts
 * Background Domain Handler — Bellek Uyutucu (RAM tasarrufu).
 *
 * Belirli süredir etkin olmayan arka plan sekmelerini `chrome.tabs.discard()`
 * ile boşaltarak tarayıcı belleğini ve CPU'yu serbest bırakır.
 *
 * Kritik tasarım kararları:
 * 1. **Karar mantığı dışarıda.** Hangi sekmenin boşaltılacağına
 *    `domain/services/tabSuspendPolicy.ts` karar verir; burada yalnızca veri
 *    toplanır ve karar uygulanır. Politika tarayıcı olmadan test edilir.
 * 2. **Varsayılan kapalı.** `discard()` geri dönüşsüzdür; kullanıcı açıkça
 *    açmadıkça hiçbir sekmeye dokunulmaz.
 * 3. **`setInterval` kullanılmaz.** MV3 servis worker'ı boşta kaldığında
 *    (~30 sn) sonlandırılır; periyodik iş `chrome.alarms` ile yapılır.
 * 4. **Geçmiş kalıcıdır.** Son erişim zamanları `chrome.storage.local`'de
 *    tutulur. Servis worker yeniden başladığında veri kaybolmaz.
 */

import {
  DEFAULT_TAB_SUSPEND_CONFIG,
  isPolicyUsable,
  planTabSuspend,
  policyFromConfig,
  type SuspendableTab,
  type TabSuspendConfig,
} from "@/domain/services/tabSuspendPolicy.js";
import { logger } from "@/utils/logger.js";

const CONFIG_KEY = "tab_suspend_config";
const LAST_ACCESS_KEY = "tab_suspend_last_access";
const LAST_SWEEP_KEY = "tab_suspend_last_sweep";
const SWEEP_ALARM = "tab_suspend_sweep";
/** Chrome alarms en küçük 0.5 dakika kabul eder; 5 dakika yeterli hassasiyet. */
const SWEEP_PERIOD_MINUTES = 5;
/** Depodaki geçmiş girdileri bu yaştan eskiyse atılır. */
const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface TabSuspendSweepResult {
  enabled: boolean;
  at: number;
  candidates: number;
  discarded: number;
  failed: number;
}

type LastAccessMap = Record<string, number>;

function storageGet<T>(keys: string[]): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res) => resolve(res as T));
  });
}

/** Depodaki ayarı okur; eksik/bozuk alanları varsayılana düzeltir. */
async function readConfig(): Promise<TabSuspendConfig> {
  const stored = await storageGet<{ tab_suspend_config?: Partial<TabSuspendConfig> }>([
    CONFIG_KEY,
  ]);
  const raw = stored[CONFIG_KEY];
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_TAB_SUSPEND_CONFIG };
  }
  return {
    enabled: raw.enabled === true,
    idleMinutes: raw.idleMinutes ?? DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes,
    extraProtectedUrls: Array.isArray(raw.extraProtectedUrls)
      ? raw.extraProtectedUrls.filter((v): v is string => typeof v === "string")
      : [],
  };
}

async function readLastAccess(): Promise<LastAccessMap> {
  const stored = await storageGet<{ tab_suspend_last_access?: LastAccessMap }>([
    LAST_ACCESS_KEY,
  ]);
  const map = stored[LAST_ACCESS_KEY];
  return map && typeof map === "object" ? map : {};
}

/**
 * Son erişim zamanlarını günceller. Yazma maliyeti düşük tutulur: her olayda
 * ayrı bir `storage.set` yerine tek bir toplu yazma yapılır.
 */
function markAccessed(tabIds: number[], at: number): void {
  if (tabIds.length === 0) {
    return;
  }
  void readLastAccess().then((map) => {
    for (const id of tabIds) {
      if (Number.isInteger(id) && id >= 0) {
        map[String(id)] = at;
      }
    }
    chrome.storage.local.set({ [LAST_ACCESS_KEY]: map });
  });
}

/** Sekmeleri politikaya uygun hale getirir. `tab.url` için `tabs` izni gerekir. */
function toSuspendableTabs(
  tabs: chrome.tabs.Tab[],
  lastAccess: LastAccessMap,
  now: number,
): SuspendableTab[] {
  const projected: SuspendableTab[] = [];
  for (const tab of tabs) {
    if (tab.id === undefined) {
      continue;
    }
    const recorded = lastAccess[String(tab.id)];
    projected.push({
      id: tab.id,
      url: tab.url ?? tab.pendingUrl ?? "",
      windowId: tab.windowId,
      active: tab.active === true,
      pinned: tab.pinned === true,
      audible: tab.audible === true,
      discarded: tab.discarded === true,
      incognito: tab.incognito === true,
      // Hiç kayıt yoksa sayfa zaten yüklenmiş olabilir; en kötü durumda
      // "şimdi" kabul et, politika yine de eşik kontrolünü uygular.
      lastAccessedAt: typeof recorded === "number" ? recorded : now,
    });
  }
  return projected;
}

/** Sekmesi kapanmış, artık gereksiz olan geçmiş girdilerini siler. */
function pruneHistory(history: LastAccessMap, openTabIds: Set<number>): void {
  const cutoff = Date.now() - HISTORY_TTL_MS;
  let changed = false;
  for (const key of Object.keys(history)) {
    const id = Number(key);
    const at = history[key];
    if (!openTabIds.has(id) || typeof at !== "number" || at < cutoff) {
      delete history[key];
      changed = true;
    }
  }
  if (changed) {
    chrome.storage.local.set({ [LAST_ACCESS_KEY]: history });
  }
}

async function runSweep(force: boolean): Promise<TabSuspendSweepResult> {
  const now = Date.now();
  const result: TabSuspendSweepResult = {
    enabled: false,
    at: now,
    candidates: 0,
    discarded: 0,
    failed: 0,
  };

  const config = await readConfig();
  if (!config.enabled && !force) {
    return result;
  }
  result.enabled = true;

  const policy = policyFromConfig(config);
  if (!isPolicyUsable(policy)) {
    logger.warn("Tab suspend: policy unusable, sweep skipped");
    return result;
  }

  const [tabs, lastAccess] = await Promise.all([
    new Promise<chrome.tabs.Tab[]>((resolve) =>
      chrome.tabs.query({}, (res) => resolve(res ?? [])),
    ),
    readLastAccess(),
  ]);

  pruneHistory(lastAccess, new Set(tabs.map((t) => t.id).filter((id): id is number => id !== undefined)));

  const plan = planTabSuspend(toSuspendableTabs(tabs, lastAccess, now), now, policy);
  result.candidates = plan.discardIds.length;

  if (plan.discardIds.length === 0) {
    chrome.storage.local.set({ [LAST_SWEEP_KEY]: result });
    return result;
  }

  // Kapatılan sekmelerin geçmiş girdileri artık anlamsız.
  const discardedSet = new Set(plan.discardIds);
  const surviving: LastAccessMap = {};
  for (const key of Object.keys(lastAccess)) {
    if (!discardedSet.has(Number(key))) {
      surviving[key] = lastAccess[key];
    }
  }

  // Sekmeler tek tek boşaltılır. İki gerekçe:
  // 1. `@types/chrome` yalnızca tek sekme imzasını modelliyor (dizi overload'u
  //    tipte yok), runtime diziyi desteklese de tip güvenliği bozulur.
  // 2. `beforeunload` uyarısı veren tek bir sekme partiyi iptal etmez; diğerleri
  //    yine boşaltılır.
  for (const tabId of plan.discardIds) {
    const ok = await discardTab(tabId);
    if (ok) {
      result.discarded += 1;
    } else {
      result.failed += 1;
    }
  }

  chrome.storage.local.set({ [LAST_SWEEP_KEY]: result, [LAST_ACCESS_KEY]: surviving });

  logger.log(
    `Tab suspend: ${result.discarded}/${result.candidates} tab boşaltıldı (eşik ${config.idleMinutes} dk)`,
  );
  return result;
}

/** Tek bir sekmeyi boşaltır. `beforeunload` vb. nedenlerle başarısız olabilir. */
function discardTab(tabId: number): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.tabs.discard(tabId, () => {
      if (chrome.runtime.lastError) {
        // Kullanıcının "sayfadan ayrılırken uyar" diyebildiği sekmeler burada
        // reddedilir; bu bir hata değil, beklenen davranıştır.
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

/**
 * Periyodik taramayı kaydeder. `chrome.alarms.create` aynı isimli alarmı
 * günceller, bu yüzden tekrar tekrar çağırmak güvenlidir — servis worker her
 * yeniden başladığında alarmın yeniden kurulması gerekir.
 */
function scheduleSweep(): void {
  chrome.alarms.create(SWEEP_ALARM, { periodInMinutes: SWEEP_PERIOD_MINUTES });
}

function handleConfigChange(
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
): void {
  if (areaName !== "local" || !(CONFIG_KEY in changes)) {
    return;
  }
  void readConfig().then((config) => {
    logger.log(`Tab suspend: ayar değişti, enabled=${config.enabled}`);
    if (config.enabled) {
      scheduleSweep();
      void runSweep(false);
    } else {
      chrome.alarms.clear(SWEEP_ALARM);
    }
  });
}

/** Ayarlar ekranının gösterdiği sonuç özeti. */
export interface TabSuspendStatus {
  enabled: boolean;
  idleMinutes: number;
  lastSweepAt: number;
  candidates: number;
  discarded: number;
  failed: number;
}

async function readStatus(): Promise<TabSuspendStatus> {
  const config = await readConfig();
  const stored = await storageGet<{ tab_suspend_last_sweep?: TabSuspendSweepResult }>([
    LAST_SWEEP_KEY,
  ]);
  const last = stored[LAST_SWEEP_KEY];
  return {
    enabled: config.enabled,
    idleMinutes: config.idleMinutes,
    lastSweepAt: last?.at ?? 0,
    candidates: last?.candidates ?? 0,
    discarded: last?.discarded ?? 0,
    failed: last?.failed ?? 0,
  };
}

/**
 * Ayar ekranı ve diğer istemciler için meselaç.
 * Dönüş tipi `TabSuspendStatus | null` olabilir: bilinmeyen mesaj → null.
 */
export async function handleTabSuspendMessage(
  message: { type?: string },
): Promise<TabSuspendStatus | { success: boolean } | null> {
  if (message.type === "tab_suspend_get_status") {
    return readStatus();
  }
  if (message.type === "tab_suspend_run_now") {
    const result = await runSweep(true);
    return { success: true, ...result };
  }
  return null;
}

/** Servis worker giriş noktasından çağrılır. */
export function initTabSuspendHandler(): void {
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    markAccessed([tabId], Date.now());
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete" || changeInfo.url) {
      markAccessed([tabId], Date.now());
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    void readLastAccess().then((map) => {
      if (tabId in map) {
        delete map[String(tabId)];
        chrome.storage.local.set({ [LAST_ACCESS_KEY]: map });
      }
    });
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === SWEEP_ALARM) {
      void runSweep(false);
    }
  });

  chrome.storage.onChanged.addListener(handleConfigChange);

  // Servis worker yeniden başladığında alarmı geri getir ve geçmişi doldur.
  // Kayıt olmayan sekmeler "şimdi" kabul edilir (politika yine de eşik uygular).
  void readConfig().then((config) => {
    if (!config.enabled) {
      return;
    }
    scheduleSweep();
    void chrome.tabs.query({}, (tabs) => {
      const missing = (tabs ?? [])
        .map((t) => t.id)
        .filter((id): id is number => id !== undefined);
      void readLastAccess().then((map) => {
        const unrecorded = missing.filter((id) => !(String(id) in map));
        markAccessed(unrecorded, Date.now());
      });
    });
  });
}
