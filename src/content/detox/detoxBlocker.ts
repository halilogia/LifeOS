/**
 * detoxBlocker.ts
 * Screen time detox & Pomodoro focus session website blocker.
 * Clean Architecture - Content Script Domain Module.
 */

import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

export function initDetoxBlocker(): void {
  const currentHost = window.location.hostname;

  // Hiding helper (immediately inject to prevent layout flash)
  const styleEl = document.createElement("style");
  styleEl.innerHTML = "html, body { display: none !important; }";
  if (document.documentElement) {
    document.documentElement.appendChild(styleEl);
  }

  function checkScreenTimeLimits(): void {
    try {
      if (!chrome.runtime?.id) {
        return;
      }

      chrome.storage.sync.get(
        [
          "detox_enabled",
          "detox_blocked_sites",
          "detox_end_time",
          "custom_quotes",
          "lang",
          "pomoBlockEnabled",
          "detox_limits",
          "detoxLimits",
        ],
        (settings) => {
          if (chrome.runtime.lastError || !chrome.runtime?.id) {
            return;
          }

          chrome.storage.local.get(
            ["pomodoro_timer_state", "screen_time_stats"],
            (localRes) => {
              if (chrome.runtime.lastError || !chrome.runtime?.id) {
                return;
              }

              const enabled = (settings.detox_enabled as boolean) || false;
              const blockedSites =
                (settings.detox_blocked_sites as string[]) || [];
              const endTime = (settings.detox_end_time as number) || 0;
              const lang = (settings.lang as string) || "tr";
              const pomoBlockEnabled = settings.pomoBlockEnabled ?? true;
              const pomoState =
                (localRes.pomodoro_timer_state as {
                  running?: boolean;
                  mode?: string;
                  endTime?: number;
                }) || {};

              const isBlockedHost = blockedSites.some((site) =>
                currentHost.includes(site),
              );

              const defaultSites = [
                "instagram.com",
                "facebook.com",
                "youtube.com",
                "tiktok.com",
                "x.com",
                "twitter.com",
              ];
              const isPomoBlockedHost =
                blockedSites.some((site) => currentHost.includes(site)) ||
                defaultSites.some((site) => currentHost.includes(site));

              const isTimeActive = endTime === -1 || endTime > Date.now();

              const isDetoxActive = enabled && isBlockedHost && isTimeActive;
              const isPomoActive =
                pomoBlockEnabled &&
                isPomoBlockedHost &&
                pomoState.running &&
                pomoState.mode === "focus";

              const detoxLimits =
                (settings.detoxLimits as Record<string, number>) ||
                (settings.detox_limits as Record<string, number>) ||
                {};
              const cleanHost = currentHost.replace("www.", "");
              const limitDomain = Object.keys(detoxLimits).find((domain) => {
                const cleanDomain = domain.replace("www.", "");
                return (
                  cleanHost.includes(cleanDomain) ||
                  cleanDomain.includes(cleanHost)
                );
              });
              const activeLimitMinutes = limitDomain
                ? detoxLimits[limitDomain]
                : 0;

              let isLimitExceeded = false;
              let remainingSeconds = 999999;
              if (activeLimitMinutes > 0 && limitDomain) {
                const todayStr = new Date().toLocaleDateString("sv");
                const dailyStats = localRes.screen_time_stats?.[todayStr] || {};
                const cleanLimitDomain = limitDomain.replace("www.", "");

                let spentSeconds = 0;
                for (const statDomain in dailyStats) {
                  const cleanStatDomain = statDomain.replace("www.", "");
                  if (
                    cleanStatDomain.includes(cleanLimitDomain) ||
                    cleanLimitDomain.includes(cleanStatDomain)
                  ) {
                    spentSeconds += dailyStats[statDomain];
                  }
                }

                const limitSeconds = activeLimitMinutes * 60;
                isLimitExceeded = spentSeconds >= limitSeconds;
                remainingSeconds = limitSeconds - spentSeconds;
              }

              if (isDetoxActive || isPomoActive || isLimitExceeded) {
                const targetEndTime = isPomoActive
                  ? pomoState.endTime
                  : isLimitExceeded
                    ? -1
                    : endTime;
                const isLimitBlock =
                  isLimitExceeded && !isDetoxActive && !isPomoActive;

                setupBlockPage(
                  targetEndTime || -1,
                  (settings.custom_quotes as Array<{ text: string }>) || [],
                  lang,
                  Boolean(isPomoActive),
                  isLimitBlock,
                  activeLimitMinutes,
                  styleEl,
                );
              } else {
                if (styleEl.parentNode) {
                  styleEl.parentNode.removeChild(styleEl);
                }

                if (
                  activeLimitMinutes > 0 &&
                  remainingSeconds > 0 &&
                  remainingSeconds <= 300
                ) {
                  showTopWarningBanner(
                    Math.ceil(remainingSeconds / 60),
                    lang,
                    limitDomain || "",
                  );
                } else {
                  removeWarningBanner();
                }
              }
            },
          );
        },
      );
    } catch {
      // Ignore extension context invalidation on extension reload
    }
  }

  // Real-time listener for Pomodoro timer start/stop, screen time, or settings changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (
      areaName === "local" &&
      (changes["pomodoro_timer_state"] || changes["screen_time_stats"])
    ) {
      checkScreenTimeLimits();
    }
    if (
      areaName === "sync" &&
      (changes["detox_enabled"] ||
        changes["detox_blocked_sites"] ||
        changes["detox_end_time"] ||
        changes["pomoBlockEnabled"] ||
        changes["detox_limits"])
    ) {
      checkScreenTimeLimits();
    }
  });

  checkScreenTimeLimits();

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      checkScreenTimeLimits();
    }
  }, 2000);
}

function showTopWarningBanner(
  minutesLeft: number,
  lang: string,
  domain: string,
): void {
  if (sessionStorage.getItem("detox_warning_dismissed") === "true") {
    return;
  }

  if (!document.body) {
    return;
  }

  let banner: HTMLElement | null = null;
  let host = document.getElementById("detox-warning-banner-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "detox-warning-banner-host";
    host.style.position = "fixed";
    host.style.top = "16px";
    host.style.left = "50%";
    host.style.transform = "translateX(-50%)";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "auto";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.id = "detox-warning-banner";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "12px";
    wrapper.style.background = "rgba(15, 15, 20, 0.85)";
    wrapper.style.backdropFilter = "blur(12px)";
    (wrapper.style as unknown as Record<string, string>)[
      "webkitBackdropFilter"
    ] = "blur(12px)";
    wrapper.style.border = "1px solid rgba(239, 68, 68, 0.4)";
    wrapper.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
    wrapper.style.borderRadius = "12px";
    wrapper.style.padding = "10px 18px";
    wrapper.style.color = "#fff";
    wrapper.style.fontFamily =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    wrapper.style.fontSize = "13px";
    wrapper.style.fontWeight = "600";

    const textSpan = document.createElement("span");
    textSpan.id = "detox-warning-text";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.color = "rgba(255, 255, 255, 0.6)";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "12px";
    closeBtn.style.padding = "2px 6px";
    closeBtn.addEventListener("click", () => {
      sessionStorage.setItem("detox_warning_dismissed", "true");
      if (host) {
        host.remove();
      }
    });

    wrapper.appendChild(textSpan);
    wrapper.appendChild(closeBtn);
    shadow.appendChild(wrapper);

    banner = textSpan;
  } else if (host.shadowRoot) {
    banner = host.shadowRoot.getElementById("detox-warning-text");
  }

  if (banner) {
    const siteLabel = domain.replace(".com", "").toUpperCase();
    const t = getTranslation(lang as Language);
    banner.textContent = t.social_media_limit_warning
      .replace("{site}", siteLabel)
      .replace("{minutes}", String(minutesLeft));
  }
}

function removeWarningBanner(): void {
  const host = document.getElementById("detox-warning-banner-host");
  if (host) {
    host.remove();
  }
}

function setupBlockPage(
  endTime: number,
  customQuotes: Array<{ text: string }>,
  lang: string,
  isPomo: boolean,
  isLimitBlock: boolean,
  activeLimitMinutes: number,
  styleEl: HTMLStyleElement,
): void {
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }

  let styleTag = document.getElementById("detox-block-style");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "detox-block-style";
    styleTag.innerHTML = `
      html, body {
        overflow: hidden !important;
        height: 100vh !important;
        width: 100vw !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #09090d !important;
      }
      body > :not(#detox-block-overlay) {
        display: none !important;
      }
      #detox-block-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0d0d12 100%) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Inter', sans-serif !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 16px !important;
      }
    `;
    if (document.head) {
      document.head.appendChild(styleTag);
    }
  }

  if (document.head) {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }

  const defaultQuotes: Record<string, string[]> = {
    tr: [
      '"Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır."',
      '"Gelecek, bugünden ona hazırlananlara aittir."',
      '"Zorluklar, başarının değerini artıran süslerdir."',
      '"En büyük zaferimiz hiç düşmemek değil, her düştüğümüzde tekrar ayağa kalkabilmektir."',
    ],
    en: [
      '"The way to get started is to quit talking and begin doing."',
      '"The future belongs to those who prepare for it today."',
      '"Difficulties strengthen the mind, as labor does the body."',
      '"Our greatest glory is not in never falling, but in rising every time we fall."',
    ],
  };

  function escapeHtml(str: string): string {
    if (!str) {
      return "";
    }
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const quotesPool =
    customQuotes.length > 0
      ? customQuotes.map((q) => `"${escapeHtml(q.text)}"`)
      : defaultQuotes[lang] || defaultQuotes.tr;
  const randomQuote = quotesPool[Math.floor(Math.random() * quotesPool.length)];

  const t = getTranslation(lang as Language);
  let titleText = t.focus_time;
  let descText = t.detox_blocked_default_desc;

  if (isPomo) {
    titleText = t.pomo_focus_session;
    descText = t.pomo_blocked_desc;
  } else if (isLimitBlock) {
    titleText = t.daily_limit_reached;
    descText = t.daily_limit_desc.replace(
      "{minutes}",
      String(activeLimitMinutes),
    );
  }

  const buttonText = t.go_to_dashboard;
  const timeRemainingLabel = isPomo ? t.remaining_focus_time : t.detox_duration;
  const permanentLabel = isLimitBlock
    ? t.daily_limit_expired
    : t.permanent_block;

  const blockHtml = `
    <div id="detox-block-card" style="
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      animation: fadeInUp 0.8s ease-out;
    ">
      <div style="
        width: 64px;
        height: 64px;
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
      ">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #f8fafc; font-family: 'Inter', sans-serif;">${titleText}</h1>
      <p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin: 0; font-family: 'Inter', sans-serif;">${descText}</p>

      <div style="
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        padding: 1rem;
        margin: 0.5rem 0;
        font-style: italic;
        font-size: 0.85rem;
        color: #94a3b8;
        border-left: 3px solid #8b5cf6;
        width: 100%;
        font-family: 'Inter', sans-serif;
      ">
        ${randomQuote}
      </div>

      <div style="
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 14px;
        padding: 12px 16px;
        width: 100%;
        text-align: left;
        box-sizing: border-box;
      ">
        <div style="font-weight: 700; font-size: 0.82rem; color: #c084fc; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>💡</span>
          <span>${t.detox_you_could_achieve}</span>
        </div>
        <div style="font-size: 0.78rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px; line-height: 1.4;">
          <span>• ✍️ ${t.detox_kpss_solve}</span>
          <span>• 📚 ${t.detox_read_pages}</span>
          <span>• 🎯 ${t.detox_pomodoro_complete}</span>
        </div>
      </div>

      <div id="detox-timer-badge" style="
        font-size: 0.8rem;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        padding: 6px 14px;
        border-radius: 50px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: 'Inter', sans-serif;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span id="detox-timer-text">--:--</span>
      </div>

      <a href="chrome://newtab" style="
        margin-top: 0.5rem;
        background: #8b5cf6;
        color: white;
        text-decoration: none;
        padding: 10px 24px;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.3s ease;
        width: 100%;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        font-family: 'Inter', sans-serif;
      " onmouseover="this.style.background='#7c3aed'" onmouseout="this.style.background='#8b5cf6'">
        ${buttonText}
      </a>
    </div>
  `;

  if (document.head && !document.getElementById("detox-anim-style")) {
    const animStyle = document.createElement("style");
    animStyle.id = "detox-anim-style";
    animStyle.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(animStyle);
  }

  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const setupDOMAndTimer = () => {
    if (!document.body) {
      return;
    }

    let overlay = document.getElementById("detox-block-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "detox-block-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = blockHtml;

    const timerText = document.getElementById("detox-timer-text");

    if (timerInterval) {
      clearInterval(timerInterval);
    }

    if (endTime === -1) {
      if (timerText) {
        timerText.textContent = permanentLabel;
      }
    } else {
      const updateTimer = () => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          window.location.reload();
          return;
        }

        const hrs = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);

        let timeString = "";
        if (hrs > 0) {
          timeString += `${hrs.toString().padStart(2, "0")}:`;
        }
        timeString += `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

        const currentTimerText = document.getElementById("detox-timer-text");
        if (currentTimerText) {
          currentTimerText.textContent = `${timeRemainingLabel}: ${timeString}`;
        }
      };

      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    }
  };

  setupDOMAndTimer();

  if (document.body) {
    const observer = new MutationObserver(() => {
      if (!document.getElementById("detox-block-overlay")) {
        observer.disconnect();
        setupDOMAndTimer();
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
