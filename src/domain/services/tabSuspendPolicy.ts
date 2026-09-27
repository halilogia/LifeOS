/**
 * tabSuspendPolicy.ts
 * Domain katmanı — sekme uyutma kararının **saf** kısmı.
 *
 * Burada hiçbir `chrome.*` çağrısı yoktur. Girdi düz bir sekme listesi, çıktı
 * düz bir karar listesidir. Bu sayede tüm güvenlik kuralları tarayıcı olmadan
 * `tests/tabSuspendPolicy.test.ts` içinde doğrulanabilir.
 *
 * Neden saf? `chrome.tabs.discard()` bir sekmenin belleğini boşaltır ve sayfadaki
 * JS durumunu (form girdileri, çalışan zamanlayıcılar) yok eder. Yanlış bir
 * karar kullanıcının verisini siler. Karar mantığı bu yüzden veriden ayrı,
 * test edilebilir ve gözden geçirilebilir bir yerde tutulur.
 */

/** Politikaya verilen, sekme durumunun minimal projeksiyonu. */
export interface SuspendableTab {
  id: number;
  url: string;
  windowId: number;
  /** Sekme kendi penceresinde etkin mi? */
  active: boolean;
  pinned: boolean;
  /** Sesi açık, çalan bir sekme mi? */
  audible: boolean;
  /** Zaten belleği boşaltılmış mı? */
  discarded: boolean;
  incognito: boolean;
  /** Son etkinleştirildiği zaman (epoch ms). 0 = hiç görülmedi. */
  lastAccessedAt: number;
}

export type SuspendSkipReason =
  /** Eklenti sayfası (LifeOS new tab dahil) — asla boşaltma. */
  | "extension-page"
  /** `chrome://`, `about:`, devtools, Web Store vb. */
  | "browser-internal"
  /** Gizli pencere. */
  | "incognito"
  /** Sesi çalıyor — müzik/video kesilmemeli. */
  | "audible"
  /** Sabitlenmiş sekme. */
  | "pinned"
  /** Pencerenin etkin sekmesi. */
  | "active"
  /** Korunan liste (YouTube, Google Docs, localhost...). */
  | "protected-url"
  /** Penceredeki tek sekme — boşaltmak pencereyi kapatır. */
  | "last-window-tab"
  /** Zaten boşaltılmış. */
  | "already-discarded"
  /** Henüz eşik kadar boşta kalmamış. */
  | "not-idle"
  /** Son kullanım bilgisi yok (servis worker yeniden başlamış olabilir). */
  | "unknown-age";

export interface TabSuspendPolicy {
  /** Bu süreden uzun süredir etkin olmayan sekmeler aday olur. */
  idleThresholdMs: number;
  /** Alt dize eşleşmesi ile korunacak URL parçaları. */
  protectedUrls: readonly string[];
}

/**
 * `chrome.storage.local` üzerinde saklanan kullanıcı ayarı.
 *
 * `enabled` varsayılan olarak **kapalıdır.** Çünkü `chrome.tabs.discard()`
 * geri dönüşü olmayan bir işlemdir: sekmenin belleğini boşaltır ve sayfadaki
 * JS durumunu yok eder. Kullanıcı açıkça izin vermedikçe hiçbir sekmeye
 * dokunulmaz.
 */
export interface TabSuspendConfig {
  enabled: boolean;
  /** Boşta kalma eşiği (dakika). Seçenekler `IDLE_MINUTE_OPTIONS`'tadır. */
  idleMinutes: number;
  /** Kullanıcının koruma listesine eklediği URL parçaları. */
  extraProtectedUrls: string[];
}

/** Ayarlarda sunulan eşik seçenekleri (dakika). */
export const IDLE_MINUTE_OPTIONS: readonly number[] = [5, 15, 30, 60, 120, 240];

/** Depoda tutulacak ayarın güvenli varsayılanı. */
export const DEFAULT_TAB_SUSPEND_CONFIG: TabSuspendConfig = {
  enabled: false,
  idleMinutes: 30,
  extraProtectedUrls: [],
};

export function isValidIdleMinutes(value: unknown): value is number {
  return (
    typeof value === "number" && IDLE_MINUTE_OPTIONS.includes(value)
  );
}

export interface TabSuspendSkip {
  id: number;
  reason: SuspendSkipReason;
}

export interface TabSuspendPlan {
  /** Boşaltılacak sekme id'leri. */
  discardIds: number[];
  /** Neden boşaltılmayacakları, gerekçesiyle. */
  skipped: TabSuspendSkip[];
}

/**
 * Varsayılan koruma listesi. Gerekçeleri:
 * - `youtube`, `netflix`, `twitch`, `spotify`: oynatma durumu sunucuda saklanır ama
 *   sayfa durumu (playlist, video konumu) kaybolur; ayrıca bunlar en büyük bellek
 *   tüketicileridir, kullanıcı bunları bilerek açık tutmak ister.
 * - `docs.google`, `mail.google`, `web.whatsapp`, `web.telegram`: **kaydedilmemiş
 *   metin** riski. Boşaltmak taslakları yok eder.
 * - `localhost`, `127.0.0.1`: Arcade modülü yerel geliştirme sunucularını iframe
 *   içinde çalıştırır; boşaltmak geliştirme oturumunu kırar.
 */
export const DEFAULT_PROTECTED_URLS: readonly string[] = [
  "youtube.com",
  "youtu.be",
  "netflix.com",
  "twitch.tv",
  "open.spotify.com",
  "docs.google.com",
  "mail.google.com",
  "web.whatsapp.com",
  "web.telegram.org",
  "localhost",
  "127.0.0.1",
];

const BROWSER_INTERNAL_PREFIXES = [
  "chrome://",
  "devtools://",
  "edge://",
  "about:",
  "view-source:",
  "chrome-extension-error:",
];

const EXTENSION_PREFIXES = ["chrome-extension://", "moz-extension://", "extension://"];

const PROTECTED_EXTENSIONS = ["chromewebstore.google.com", "chrome.google.com/webstore"];

function classifyProtectedUrl(
  url: string,
  protectedUrls: readonly string[],
): boolean {
  const lower = url.toLowerCase();
  if (PROTECTED_EXTENSIONS.some((host) => lower.includes(host))) {
    return true;
  }
  return protectedUrls.some((fragment) => lower.includes(fragment));
}

function isBrowserInternal(url: string): boolean {
  const lower = url.toLowerCase();
  return BROWSER_INTERNAL_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function isExtensionPage(url: string): boolean {
  const lower = url.toLowerCase();
  return EXTENSION_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

/**
 * Bir sekme listesinden boşaltma planı üretir.
 *
 * Değerlendirme sırası kasıtlıdır: **güvenlik gerekçeleri bilgilendirici
 * gerekçelerden önce gelir.** Böylece `not-idle` yerine `audible` raporlanır;
 * kullanıcı "neden boşaltılmadı?" sorusunda gerçek nedeni görür.
 */
export function planTabSuspend(
  tabs: readonly SuspendableTab[],
  now: number,
  policy: TabSuspendPolicy,
): TabSuspendPlan {
  // Bir pencerede tek sekme kaldıysa onu korumak için pencere bazında say.
  const tabsPerWindow = new Map<number, number>();
  for (const tab of tabs) {
    tabsPerWindow.set(tab.windowId, (tabsPerWindow.get(tab.windowId) ?? 0) + 1);
  }

  const discardIds: number[] = [];
  const skipped: TabSuspendSkip[] = [];

  for (const tab of tabs) {
    const skip = (reason: SuspendSkipReason) => skipped.push({ id: tab.id, reason });

    if (isExtensionPage(tab.url)) {
      skip("extension-page");
      continue;
    }
    if (isBrowserInternal(tab.url)) {
      skip("browser-internal");
      continue;
    }
    if (tab.incognito) {
      skip("incognito");
      continue;
    }
    if (tab.audible) {
      skip("audible");
      continue;
    }
    if (tab.pinned) {
      skip("pinned");
      continue;
    }
    if (tab.active) {
      skip("active");
      continue;
    }
    if (classifyProtectedUrl(tab.url, policy.protectedUrls)) {
      skip("protected-url");
      continue;
    }
    if ((tabsPerWindow.get(tab.windowId) ?? 0) <= 1) {
      skip("last-window-tab");
      continue;
    }
    if (tab.discarded) {
      skip("already-discarded");
      continue;
    }
    if (tab.lastAccessedAt <= 0) {
      // Servis worker yeniden başladığında geçmiş boştur. Yaşı bilinmeyen
      // sekmeyi boşaltmak tahmin yürütmektir; atla.
      skip("unknown-age");
      continue;
    }
    if (now - tab.lastAccessedAt < policy.idleThresholdMs) {
      skip("not-idle");
      continue;
    }

    discardIds.push(tab.id);
  }

  return { discardIds, skipped };
}

/**
 * Karar verilemeyen durumlarda varsayılan olarak **hiçbir şekilde işlem yapma**
 * çıktısı. Politika geçersizse (eşik negatif, NaN, sıfır) yanlışlıkla tüm
 * sekmelerin boşaltılmasını engeller.
 */
export function isPolicyUsable(policy: TabSuspendPolicy): boolean {
  return (
    Number.isFinite(policy.idleThresholdMs) && policy.idleThresholdMs > 0
  );
}

/**
 * Kullanıcı ayarını çalıştırılabilir politikaya çevirir.
 *
 * Depodaki değerler doğrulanmadan buraya girmez: geçersiz `idleMinutes`
 * varsayılana düşer, `extraProtectedUrls` string olmayan girdilerden arınır.
 */
export function policyFromConfig(
  config: TabSuspendConfig,
): TabSuspendPolicy {
  const minutes = isValidIdleMinutes(config.idleMinutes)
    ? config.idleMinutes
    : DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes;
  const extra = Array.isArray(config.extraProtectedUrls)
    ? config.extraProtectedUrls.filter(
        (fragment): fragment is string => typeof fragment === "string" && fragment.length > 0,
      )
    : [];

  return {
    idleThresholdMs: minutes * 60_000,
    protectedUrls: [...DEFAULT_PROTECTED_URLS, ...extra],
  };
}
