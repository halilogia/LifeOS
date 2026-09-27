import { describe, it, expect } from "vitest";
import {
  DEFAULT_PROTECTED_URLS,
  DEFAULT_TAB_SUSPEND_CONFIG,
  IDLE_MINUTE_OPTIONS,
  isPolicyUsable,
  isValidIdleMinutes,
  planTabSuspend,
  policyFromConfig,
  type SuspendableTab,
  type SuspendSkipReason,
  type TabSuspendPolicy,
} from "@/domain/services/tabSuspendPolicy.js";

const NOW = 1_700_000_000_000;
const MINUTE = 60_000;

const POLICY: TabSuspendPolicy = {
  idleThresholdMs: 30 * MINUTE,
  protectedUrls: DEFAULT_PROTECTED_URLS,
};

const makeTab = (overrides: Partial<SuspendableTab> = {}): SuspendableTab => ({
  id: 1,
  url: "https://example.com/article",
  windowId: 10,
  active: false,
  pinned: false,
  audible: false,
  discarded: false,
  incognito: false,
  lastAccessedAt: NOW - 60 * MINUTE,
  ...overrides,
});

/**
 * Aynı pencerede ikinci bir sekme — pencerenin etkin sekmesi. "Son sekme"
 * kuralının devreye girmemesi için gereklidir; aksi halde aday tek başına
 * kalır ve testin konusu değişir.
 */
const companion = (overrides: Partial<SuspendableTab> = {}): SuspendableTab =>
  makeTab({ id: 2, url: "https://other.example/", active: true, ...overrides });

const reasonFor = (
  plan: { skipped: { id: number; reason: SuspendSkipReason }[] },
  id: number,
): SuspendSkipReason | undefined => plan.skipped.find((s) => s.id === id)?.reason;

describe("planTabSuspend — uygun sekmeler", () => {
  it("eşiğin üstünde boşta kalan arka plan sekmesini boşaltır", () => {
    const tabs = [
      makeTab({ id: 1, lastAccessedAt: NOW - 31 * MINUTE }),
      companion({ id: 2, lastAccessedAt: NOW - 5 * MINUTE }),
    ];
    const plan = planTabSuspend(tabs, NOW, POLICY);
    expect(plan.discardIds).toEqual([1]);
  });

  it("tam eşikteki sekmeyi boşaltır (>=)", () => {
    const plan = planTabSuspend(
      [makeTab({ lastAccessedAt: NOW - 30 * MINUTE }), companion()],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([1]);
  });

  it("birden çok uygun sekmeyi tek turda boşaltır", () => {
    const plan = planTabSuspend(
      [
        makeTab({ id: 1 }),
        makeTab({ id: 2, url: "https://a.example/" }),
        makeTab({ id: 3, url: "https://b.example/" }),
        companion(),
      ],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([1, 2, 3]);
  });
});

describe("planTabSuspend — güvenlik kuralları", () => {
  it("LifeOS dahil eklenti sayfalarını asla boşaltmaz", () => {
    const plan = planTabSuspend(
      [
        makeTab({ id: 1, url: "chrome-extension://abcdef/newtab.html" }),
        makeTab({ id: 2, url: "moz-extension://abcdef/page.html" }),
        companion(),
      ],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([]);
    expect(reasonFor(plan, 1)).toBe("extension-page");
    expect(reasonFor(plan, 2)).toBe("extension-page");
  });

  it("chrome://, about: ve devtools sayfalarını atlar", () => {
    const plan = planTabSuspend(
      [
        makeTab({ id: 1, url: "chrome://settings/" }),
        makeTab({ id: 2, url: "about:blank" }),
        makeTab({ id: 3, url: "devtools://devtools/bundled/inspector.html" }),
        makeTab({ id: 4, url: "view-source:https://example.com" }),
        companion(),
      ],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([]);
    expect(reasonFor(plan, 1)).toBe("browser-internal");
    expect(reasonFor(plan, 4)).toBe("browser-internal");
  });

  it("ses çalan sekmeyi atlar", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, audible: true }), companion()],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([]);
    expect(reasonFor(plan, 1)).toBe("audible");
  });

  it("sabitlenmiş sekmeyi atlar", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, pinned: true }), companion()],
      NOW,
      POLICY,
    );
    expect(reasonFor(plan, 1)).toBe("pinned");
  });

  it("pencerenin etkin sekmesini atlar", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, active: true }), companion()],
      NOW,
      POLICY,
    );
    expect(reasonFor(plan, 1)).toBe("active");
  });

  it("gizli pencere sekmesini atlar", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, incognito: true }), companion()],
      NOW,
      POLICY,
    );
    expect(reasonFor(plan, 1)).toBe("incognito");
  });

  it("penceredeki tek sekmeyi atlar — boşaltmak pencereyi kapatırdı", () => {
    const plan = planTabSuspend([makeTab({ id: 1, windowId: 99 })], NOW, POLICY);
    expect(plan.discardIds).toEqual([]);
    expect(reasonFor(plan, 1)).toBe("last-window-tab");
  });

  it("korunan URL'leri atlar (YouTube, Docs, localhost)", () => {
    const plan = planTabSuspend(
      [
        makeTab({ id: 1, url: "https://www.youtube.com/watch?v=abc" }),
        makeTab({ id: 2, url: "https://docs.google.com/document/d/1" }),
        makeTab({ id: 3, url: "http://localhost:5173/" }),
        makeTab({ id: 4, url: "http://127.0.0.1:3000/" }),
        companion(),
      ],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([]);
    for (const id of [1, 2, 3, 4]) {
      expect(reasonFor(plan, id)).toBe("protected-url");
    }
  });

  it("Chrome Web Store'u korur", () => {
    const plan = planTabSuspend(
      [
        makeTab({ id: 1, url: "https://chromewebstore.google.com/detail/abc" }),
        companion(),
      ],
      NOW,
      POLICY,
    );
    expect(reasonFor(plan, 1)).toBe("protected-url");
  });

  it("koruma listesi büyük/küçük harf duyarsızdır", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, url: "https://WWW.YouTube.COM/watch?v=abc" }), companion()],
      NOW,
      POLICY,
    );
    expect(reasonFor(plan, 1)).toBe("protected-url");
  });
});

describe("planTabSuspend — tutucu davranış", () => {
  it("zaten boşaltılmış sekmeyi tekrar boşaltmaz", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, discarded: true }), companion()],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([]);
    expect(reasonFor(plan, 1)).toBe("already-discarded");
  });

  it("eşiğin altındaki sekmeyi atlar", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, lastAccessedAt: NOW - 29 * MINUTE }), companion()],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([]);
    expect(reasonFor(plan, 1)).toBe("not-idle");
  });

  it("geçmişi bilinmeyen sekmeyi atlar — servis worker yeniden başlamış olabilir", () => {
    const plan = planTabSuspend(
      [makeTab({ id: 1, lastAccessedAt: 0 }), companion()],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([]);
    expect(reasonFor(plan, 1)).toBe("unknown-age");
  });

  it("güvenlik gerekçesini bilgilendirici gerekçeden önce raporlar", () => {
    // Hem sesli hem de yeterince boşta değil: kullanıcı gerçek nedeni görmeli.
    const plan = planTabSuspend(
      [
        makeTab({ id: 1, audible: true, lastAccessedAt: NOW - MINUTE }),
        companion(),
      ],
      NOW,
      POLICY,
    );
    expect(reasonFor(plan, 1)).toBe("audible");
  });

  it("birden çok pencereyi bağımsız değerlendirir", () => {
    // Her pencerede bir etkin + bir boşta sekme var: "son sekme" kuralı hiçbir
    // pencerede devreye girmemeli, iki boşta sekme de aday olmalı.
    const plan = planTabSuspend(
      [
        makeTab({ id: 1, windowId: 10 }),
        companion({ id: 2, windowId: 10 }),
        makeTab({ id: 3, windowId: 20 }),
        companion({ id: 4, windowId: 20 }),
      ],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([1, 3]);
  });

  it("bir penceredeki tek sekmeyi korurken diğer pencereleri etkilemez", () => {
    const plan = planTabSuspend(
      [
        makeTab({ id: 1, windowId: 10 }),
        companion({ id: 2, windowId: 10 }),
        makeTab({ id: 3, windowId: 20 }), // penceredeki tek sekme
      ],
      NOW,
      POLICY,
    );
    expect(plan.discardIds).toEqual([1]);
    expect(reasonFor(plan, 3)).toBe("last-window-tab");
  });

  it("liste boşken boş plan döndürür", () => {
    const plan = planTabSuspend([], NOW, POLICY);
    expect(plan).toEqual({ discardIds: [], skipped: [] });
  });
});

describe("isPolicyUsable", () => {
  it("geçerli eşikleri kabul eder", () => {
    expect(isPolicyUsable(POLICY)).toBe(true);
  });

  it("sıfır, negatif, NaN ve Infinity eşikleri reddeder", () => {
    expect(isPolicyUsable({ ...POLICY, idleThresholdMs: 0 })).toBe(false);
    expect(isPolicyUsable({ ...POLICY, idleThresholdMs: -1 })).toBe(false);
    expect(isPolicyUsable({ ...POLICY, idleThresholdMs: Number.NaN })).toBe(false);
    expect(isPolicyUsable({ ...POLICY, idleThresholdMs: Number.POSITIVE_INFINITY })).toBe(
      false,
    );
  });
});

describe("policyFromConfig", () => {
  it("dakikayı milisaniyeye çevirir", () => {
    const policy = policyFromConfig({
      enabled: true,
      idleMinutes: 60,
      extraProtectedUrls: [],
    });
    expect(policy.idleThresholdMs).toBe(60 * 60_000);
  });

  it("geçersiz idleMinutes'ı varsayılana düşürür", () => {
    // Depoda bozuk bir değer,Listedeki olmayan bir seçenek ya da 0 bulunabilir.
    for (const bad of [0, -30, 7, Number.NaN, null, undefined]) {
      const policy = policyFromConfig({
        enabled: true,
        idleMinutes: bad as number,
        extraProtectedUrls: [],
      });
      expect(policy.idleThresholdMs).toBe(
        DEFAULT_TAB_SUSPEND_CONFIG.idleMinutes * 60_000,
      );
      expect(isPolicyUsable(policy)).toBe(true);
    }
  });

  it("kullanıcının ek koruma URL'lerini varsayılan listeye ekler", () => {
    const policy = policyFromConfig({
      enabled: true,
      idleMinutes: 30,
      extraProtectedUrls: ["mybank.com.tr", "figma.com"],
    });
    for (const fragment of DEFAULT_PROTECTED_URLS) {
      expect(policy.protectedUrls).toContain(fragment);
    }
    expect(policy.protectedUrls).toContain("mybank.com.tr");
    expect(policy.protectedUrls).toContain("figma.com");
  });

  it("string olmayan ve boş koruma girdilerini eler", () => {
    const policy = policyFromConfig({
      enabled: true,
      idleMinutes: 30,
      extraProtectedUrls: [
        "ok.com",
        "",
        42 as unknown as string,
        null as unknown as string,
      ],
    });
    expect(policy.protectedUrls).toContain("ok.com");
    expect(policy.protectedUrls).not.toContain("");
  });

  it("protectedUrls dizi değilse yalnızca varsayılanları kullanır", () => {
    const policy = policyFromConfig({
      enabled: true,
      idleMinutes: 30,
      extraProtectedUrls: "nope" as unknown as string[],
    });
    expect(policy.protectedUrls).toEqual([...DEFAULT_PROTECTED_URLS]);
  });
});

describe("isValidIdleMinutes", () => {
  it("yalnızca sunulan seçenekleri kabul eder", () => {
    for (const minutes of IDLE_MINUTE_OPTIONS) {
      expect(isValidIdleMinutes(minutes)).toBe(true);
    }
    expect(isValidIdleMinutes(7)).toBe(false);
    expect(isValidIdleMinutes(0)).toBe(false);
    expect(isValidIdleMinutes("30")).toBe(false);
    expect(isValidIdleMinutes(undefined)).toBe(false);
  });
});
