/**
 * GoogleAuthApi
 * Infrastructure implementation of Google OAuth authentication.
 * Wraps the existing googleSyncService for auth operations.
 */

import { googleSyncService } from "../../services/googleSyncService.js";

export class GoogleAuthApi {
    async getAuthToken(interactive: boolean = false): Promise<string> {
        return googleSyncService.getAuthToken(interactive);
    }

    async removeCachedAuthToken(token: string): Promise<void> {
        return googleSyncService.removeCachedAuthToken(token);
    }

    async getUserEmail(token: string): Promise<string> {
        const info = await googleSyncService.getUserInfo(token);
        return info.email;
    }
}