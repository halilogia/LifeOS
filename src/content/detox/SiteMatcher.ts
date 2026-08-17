/**
 * SiteMatcher.ts
 * Domain matching, screen time limits evaluation, and Pomodoro focus session site status.
 */

export interface ScreenTimeLimitsResult {
  isDetoxActive: boolean;
  isPomoActive: boolean;
  isLimitExceeded: boolean;
  activeLimitMinutes: number;
  remainingSeconds: number;
  limitDomain: string;
  targetEndTime: number;
  isLimitBlock: boolean;
}

export function evaluateSiteLimits(
  currentHost: string,
  settings: Record<string, unknown>,
  localRes: Record<string, unknown>,
): ScreenTimeLimitsResult {
  const enabled = (settings.detox_enabled as boolean) || false;
  const blockedSites = (settings.detox_blocked_sites as string[]) || [];
  const endTime = (settings.detox_end_time as number) || 0;
  const pomoBlockEnabled = (settings.pomoBlockEnabled as boolean) ?? true;
  const pomoState =
    (localRes.pomodoro_timer_state as {
      running?: boolean;
      mode?: string;
      endTime?: number;
    }) || {};

  const isBlockedHost = blockedSites.some((site) => currentHost.includes(site));

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
    Boolean(pomoState.running) &&
    pomoState.mode === "focus";

  const detoxLimits =
    (settings.detoxLimits as Record<string, number>) ||
    (settings.detox_limits as Record<string, number>) ||
    {};
  const cleanHost = currentHost.replace("www.", "");
  const limitDomain =
    Object.keys(detoxLimits).find((domain) => {
      const cleanDomain = domain.replace("www.", "");
      return cleanHost.includes(cleanDomain) || cleanDomain.includes(cleanHost);
    }) || "";
  const activeLimitMinutes = limitDomain ? detoxLimits[limitDomain] : 0;

  let isLimitExceeded = false;
  let remainingSeconds = 999999;
  if (activeLimitMinutes > 0 && limitDomain) {
    const todayStr = new Date().toLocaleDateString("sv");
    const dailyStats =
      (localRes.screen_time_stats as Record<string, Record<string, number>>)?.[
        todayStr
      ] || {};
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

  const targetEndTime = isPomoActive
    ? pomoState.endTime || -1
    : isLimitExceeded
      ? -1
      : endTime;
  const isLimitBlock = isLimitExceeded && !isDetoxActive && !isPomoActive;

  return {
    isDetoxActive,
    isPomoActive,
    isLimitExceeded,
    activeLimitMinutes,
    remainingSeconds,
    limitDomain,
    targetEndTime,
    isLimitBlock,
  };
}
