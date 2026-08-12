/**
 * ChromeStorageUserSyncProfileRepository
 * Infrastructure implementation of IUserSyncProfileRepository using chrome.storage.sync
 * for cross-device user profile persistence (prayer city, willpower streak, detox limits,
 * detox config). Singleton instance is exported for presentation-layer consumers.
 */

import type {
  IUserSyncProfileRepository,
  UserSyncProfile,
} from "@/domain/repositories/IUserSyncProfileRepository.js";

const PRAYER_CITY_KEY = "prayerCity";
const PRAYER_COUNTRY_KEY = "prayerCountry";
const WILLPOWER_KEY = "willpowerStreak";
const DETOX_LIMITS_KEY = "detoxLimits";
const DETOX_LIMITS_LEGACY_KEY = "detox_limits";
const DETOX_ENABLED_KEY = "detox_enabled";
const DETOX_SITES_KEY = "detox_blocked_sites";
const DETOX_END_KEY = "detox_end_time";
const DETOX_DISTRACTION_KEY = "detox_distraction_settings";

export class ChromeStorageUserSyncProfileRepository
  implements IUserSyncProfileRepository
{
  async getProfile(): Promise<UserSyncProfile> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        [
          PRAYER_CITY_KEY,
          PRAYER_COUNTRY_KEY,
          WILLPOWER_KEY,
          DETOX_LIMITS_KEY,
          DETOX_LIMITS_LEGACY_KEY,
          DETOX_ENABLED_KEY,
          DETOX_SITES_KEY,
          DETOX_END_KEY,
          DETOX_DISTRACTION_KEY,
        ],
        (result) => resolve(result as UserSyncProfile),
      );
    });
  }

  async saveProfile(profile: UserSyncProfile): Promise<void> {
    return new Promise((resolve) => {
      const payload: Record<string, unknown> = {};
      if (profile.prayerCity !== undefined) {
        payload[PRAYER_CITY_KEY] = profile.prayerCity;
      }
      if (profile.prayerCountry !== undefined) {
        payload[PRAYER_COUNTRY_KEY] = profile.prayerCountry;
      }
      if (profile.willpowerStreak !== undefined) {
        payload[WILLPOWER_KEY] = profile.willpowerStreak;
      }
      if (profile.detoxLimits !== undefined) {
        payload[DETOX_LIMITS_KEY] = profile.detoxLimits;
        payload[DETOX_LIMITS_LEGACY_KEY] =
          profile.detoxLimitsLegacy ?? profile.detoxLimits;
      }
      if (profile.detoxEnabled !== undefined) {
        payload[DETOX_ENABLED_KEY] = profile.detoxEnabled;
      }
      if (profile.detoxBlockedSites !== undefined) {
        payload[DETOX_SITES_KEY] = profile.detoxBlockedSites;
      }
      if (profile.detoxEndTime !== undefined) {
        payload[DETOX_END_KEY] = profile.detoxEndTime;
      }
      if (profile.detoxDistractionSettings !== undefined) {
        payload[DETOX_DISTRACTION_KEY] = profile.detoxDistractionSettings;
      }
      chrome.storage.sync.set(payload, () => resolve());
    });
  }
}

/** Singleton — presentation stores import this instead of touching chrome.storage.sync. */
export const userSyncProfileRepo = new ChromeStorageUserSyncProfileRepository();
