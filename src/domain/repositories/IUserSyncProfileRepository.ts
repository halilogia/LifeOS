/**
 * IUserSyncProfileRepository Interface
 * Repository pattern for cross-device user profile keys (prayer city, willpower
 * streak, detox limits, detox config). Persisted to chrome.storage.sync so a freshly
 * installed PC restores the user's profile.
 *
 * Domain layer - no external dependencies, pure interface.
 */

export interface UserSyncProfile {
  prayerCity?: string;
  prayerCountry?: string;
  willpowerStreak?: unknown;
  detoxLimits?: Record<string, number>;
  detoxLimitsLegacy?: Record<string, number>;
  // Detox config (enabled, blocked sites, end time) for cross-PC continuity.
  detoxEnabled?: boolean;
  detoxBlockedSites?: string[];
  detoxEndTime?: number;
  detoxDistractionSettings?: unknown;
}

export interface IUserSyncProfileRepository {
  getProfile(): Promise<UserSyncProfile>;
  saveProfile(profile: UserSyncProfile): Promise<void>;
}
