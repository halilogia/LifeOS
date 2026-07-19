/**
 * GoogleAuthApi
 * Infrastructure implementation of Google OAuth authentication.
 * Directly uses Chrome Identity API and Google OAuth2 endpoints.
 */

export interface GoogleUserInfo {
    email: string;
}

export class GoogleAuthApi {
    async getAuthToken(interactive: boolean = false): Promise<string> {
        return new Promise((resolve, reject) => {
            if (typeof chrome === "undefined" || !chrome.identity) {
                return reject(new Error("Chrome Identity API is not available."));
            }
            chrome.identity.getAuthToken({ interactive }, (result) => {
                if (chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message));
                }
                if (!result) {
                    return reject(new Error("Failed to retrieve token."));
                }
                const token = typeof result === "string" ? result : (result as any).token;
                if (!token) {
                    return reject(new Error("No token returned in auth result."));
                }
                resolve(token);
            });
        });
    }

    async removeCachedAuthToken(token: string): Promise<void> {
        return new Promise((resolve) => {
            if (typeof chrome !== "undefined" && chrome.identity) {
                chrome.identity.removeCachedAuthToken({ token }, () => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    async getUserEmail(token: string): Promise<string> {
        const response = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        if (!response.ok) {
            throw new Error("Failed to fetch Google user info.");
        }
        const info: GoogleUserInfo = await response.json();
        return info.email;
    }
}