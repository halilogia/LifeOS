/**
 * networkConstants.ts
 * Domain constants for Network Diagnostics.
 * Clean Architecture - Domain Constants Layer.
 */

import type { PingTarget } from "@/types/network.js";

export const DEFAULT_PING_TARGETS: PingTarget[] = [
  {
    id: "youtube",
    name: "YouTube CDN",
    category: "media",
    url: "https://www.youtube.com/generate_204",
    description: "Video stream metadata & content delivery",
  },
  {
    id: "google",
    name: "Google Services",
    category: "cloud",
    url: "https://www.google.com/generate_204",
    description: "Search, Workspace & Core Services",
  },
  {
    id: "cloudflare",
    name: "Cloudflare Edge",
    category: "cdn",
    url: "https://1.1.1.1/cdn-cgi/trace",
    description: "Global anycast edge routing & DNS",
  },
  {
    id: "github",
    name: "GitHub API",
    category: "developer",
    url: "https://api.github.com/zen",
    description: "Code repositories & developer webhooks",
  },
  {
    id: "gemini",
    name: "Gemini / Google AI",
    category: "ai",
    url: "https://generativelanguage.googleapis.com",
    description: "AI chat model API endpoints",
  },
];
