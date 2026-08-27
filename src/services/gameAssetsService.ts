/**
 * gameAssetsService
 * Service layer for the Free Game Assets module.
 * Aggregates free game development assets from Itch.io, Kenney.nl,
 * OpenGameArt.org, and GamerPower Loot APIs with caching and offline fallback.
 */

import type {
  GameAssetItem,
  AssetCategory,
  AssetHubShortcut,
} from "@/types/gameAssets.js";
import type { IGameAssetsCacheRepository } from "@/domain/repositories/IGameAssetsCacheRepository.js";
import { ChromeStorageGameAssetsRepository } from "@/infrastructure/persistence/repositories/ChromeStorageGameAssetsRepository.js";
import { logger } from "@/utils/logger.js";

const ASSETS_CACHE_EXPIRY = 20 * 60 * 1000; // 20 minutes

/**
 * Curated Quick Hubs for free game assets
 */
export const ASSET_HUBS: AssetHubShortcut[] = [
  {
    name: "Kenney CC0",
    url: "https://kenney.nl/assets",
    description: "Thousands of public domain (CC0) 2D, 3D, and audio assets",
    badge: "CC0",
    category: "all",
  },
  {
    name: "Itch.io Free",
    url: "https://itch.io/game-assets/free",
    description: "Indie game assets, sprites, music, and tools",
    badge: "Free",
    category: "all",
  },
  {
    name: "OpenGameArt",
    url: "https://opengameart.org/",
    description: "Open source community art, music, 3D, and sprites",
    badge: "Open Source",
    category: "all",
  },
  {
    name: "Poly Pizza",
    url: "https://poly.pizza/",
    description: "Thousands of free low-poly 3D models with CC0 license",
    badge: "3D CC0",
    category: "3d",
  },
  {
    name: "Quaternius",
    url: "https://quaternius.com/",
    description: "Modular low-poly 3D models and animated characters",
    badge: "3D CC0",
    category: "3d",
  },
  {
    name: "Game-Icons.net",
    url: "https://game-icons.net/",
    description: "Over 4,000 free SVG/PNG RPG and UI vector icons",
    badge: "Icons CC-BY",
    category: "ui",
  },
  {
    name: "AmbientCG",
    url: "https://ambientcg.com/",
    description: "Public domain (CC0) PBR materials, textures, and HDRI",
    badge: "PBR CC0",
    category: "textures",
  },
  {
    name: "Epic Fab Free",
    url: "https://www.fab.com/",
    description: "Unreal Engine & Fab official free marketplace content",
    badge: "Fab Free",
    category: "all",
  },
  {
    name: "Unity Free Assets",
    url: "https://assetstore.unity.com/?category=2d%7C3d%7Caudio&free=true",
    description: "Free 2D, 3D, and audio packages on Unity Asset Store",
    badge: "Unity",
    category: "all",
  },
  {
    name: "Mixamo",
    url: "https://www.mixamo.com/",
    description: "Free 3D character rigging and thousands of mocap animations",
    badge: "Mocap 3D",
    category: "3d",
  },
  {
    name: "Freesound",
    url: "https://freesound.org/",
    description: "Collaborative database of Creative Commons audio snippets",
    badge: "SFX",
    category: "audio",
  },
];

function inferCategoryFromText(text: string): AssetCategory {
  const lower = text.toLowerCase();
  if (
    lower.includes("3d") ||
    lower.includes("model") ||
    lower.includes("mesh") ||
    lower.includes("low poly") ||
    lower.includes("gltf") ||
    lower.includes("fbx") ||
    lower.includes("obj")
  ) {
    return "3d";
  }
  if (
    lower.includes("audio") ||
    lower.includes("sound") ||
    lower.includes("music") ||
    lower.includes("sfx") ||
    lower.includes("ost") ||
    lower.includes("track") ||
    lower.includes("voice")
  ) {
    return "audio";
  }
  if (
    lower.includes("ui") ||
    lower.includes("gui") ||
    lower.includes("icon") ||
    lower.includes("hud") ||
    lower.includes("font") ||
    lower.includes("button")
  ) {
    return "ui";
  }
  if (
    lower.includes("texture") ||
    lower.includes("material") ||
    lower.includes("pbr") ||
    lower.includes("shader") ||
    lower.includes("seamless") ||
    lower.includes("hdri")
  ) {
    return "textures";
  }
  if (
    lower.includes("loot") ||
    lower.includes("dlc") ||
    lower.includes("pack") ||
    lower.includes("giveaway")
  ) {
    return "loot";
  }
  return "2d";
}

function cleanHtmlDescription(rawHtml: string): string {
  if (!rawHtml) return "";
  return rawHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function parseXmlUsingDomOrRegex(xmlText: string): Array<{
  title: string;
  link: string;
  guid: string;
  image: string;
  description: string;
  category?: string;
  pubDate?: string;
  author?: string;
  price?: string;
}> {
  const results: Array<{
    title: string;
    link: string;
    guid: string;
    image: string;
    description: string;
    category?: string;
    pubDate?: string;
    author?: string;
    price?: string;
  }> = [];

  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const items = xmlDoc.querySelectorAll("item");
      items.forEach((item) => {
        const title =
          item.querySelector("plainTitle")?.textContent?.trim() ||
          item.querySelector("title")?.textContent?.trim() ||
          "";
        const link = item.querySelector("link")?.textContent?.trim() || "";
        const guid = item.querySelector("guid")?.textContent?.trim() || link;
        let image =
          item.querySelector("imageurl")?.textContent?.trim() ||
          item.querySelector("enclosure")?.getAttribute("url") ||
          "";
        const rawDesc =
          item.querySelector("description")?.textContent?.trim() || "";

        // If no imageurl, try extracting <img> src from description
        if (!image && rawDesc) {
          const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch) {
            image = imgMatch[1];
          }
        }

        const category =
          item.querySelector("category")?.textContent?.trim() || undefined;
        const pubDate =
          item.querySelector("pubDate")?.textContent?.trim() || undefined;
        const author =
          item.querySelector("creator")?.textContent?.trim() ||
          item.querySelector("author")?.textContent?.trim() ||
          undefined;
        const price =
          item.querySelector("price")?.textContent?.trim() || undefined;

        if (title && link) {
          results.push({
            title,
            link,
            guid,
            image,
            description: cleanHtmlDescription(rawDesc),
            category,
            pubDate,
            author,
            price,
          });
        }
      });
      return results;
    } catch (e) {
      logger.warn("DOMParser failed, falling back to regex parser", e);
    }
  }

  // Regex fallback
  const itemMatches = xmlText.match(/<item[\s\S]*?>[\s\S]*?<\/item>/gi) || [];
  for (const itemXml of itemMatches) {
    const getTag = (tag: string) => {
      const m = itemXml.match(
        new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
      );
      if (!m) return "";
      return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
    };
    const getAttr = (tag: string, attr: string) => {
      const m = itemXml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, "i"));
      return m ? m[1] : "";
    };

    const title = getTag("plainTitle") || getTag("title");
    const link = getTag("link");
    const guid = getTag("guid") || link;
    let image = getTag("imageurl") || getAttr("enclosure", "url");
    const rawDesc = getTag("description");
    if (!image && rawDesc) {
      const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) image = imgMatch[1];
    }
    const category = getTag("category") || undefined;
    const pubDate = getTag("pubDate") || undefined;
    const author = getTag("creator") || getTag("author") || undefined;
    const price = getTag("price") || undefined;

    if (title && link) {
      results.push({
        title,
        link,
        guid,
        image,
        description: cleanHtmlDescription(rawDesc),
        category,
        pubDate,
        author,
        price,
      });
    }
  }

  return results;
}

export function createGameAssetsService(
  cacheRepo: IGameAssetsCacheRepository,
) {
  return {
    /**
     * Fetches free assets from Itch.io RSS feeds
     */
    async fetchItchAssets(): Promise<GameAssetItem[]> {
      try {
        const feeds = [
          "https://itch.io/game-assets/free.xml",
          "https://itch.io/game-assets/on-sale.xml",
          "https://itch.io/game-assets/free/tag-2d.xml",
          "https://itch.io/game-assets/free/tag-3d.xml",
          "https://itch.io/game-assets/free/tag-audio.xml",
        ];

        const responses = await Promise.allSettled(
          feeds.map((url) =>
            fetch(url, { headers: { "User-Agent": "Mozilla/5.0 LifeOS" } }).then(
              (r) => (r.ok ? r.text() : ""),
            ),
          ),
        );

        const items: GameAssetItem[] = [];
        const seenUrls = new Set<string>();

        for (const res of responses) {
          if (res.status === "fulfilled" && res.value) {
            const parsed = parseXmlUsingDomOrRegex(res.value);
            for (const p of parsed) {
              if (seenUrls.has(p.link)) continue;
              seenUrls.add(p.link);

              const category = p.category
                ? (p.category.toLowerCase() as AssetCategory)
                : inferCategoryFromText(p.title + " " + p.description);

              items.push({
                id: `itch-${p.guid || p.link}`,
                title: p.title,
                link: p.link,
                thumbnail:
                  p.image ||
                  "https://img.itch.zone/aW1hZ2UyL2phbS80MTM1ODIvMjUyNDU0MTEucG5n/original/elNgTZ.png",
                description: p.description,
                source: "itch",
                category,
                license: p.price ? `Free (${p.price})` : "Free Asset",
                publishedDate: p.pubDate,
                price: p.price || "$0.00",
                isPermanent: true,
              });
            }
          }
        }
        return items;
      } catch (err) {
        logger.error("gameAssetsService: Failed to fetch Itch assets:", err);
        return [];
      }
    },

    /**
     * Fetches CC0 assets from Kenney.nl official feed
     */
    async fetchKenneyAssets(): Promise<GameAssetItem[]> {
      try {
        const res = await fetch("https://kenney.nl/feed", {
          headers: { "User-Agent": "Mozilla/5.0 LifeOS" },
        });
        if (!res.ok) return [];
        const text = await res.text();
        const parsed = parseXmlUsingDomOrRegex(text);

        return parsed.map((p) => {
          let cat: AssetCategory = "2d";
          if (p.category) {
            const cLower = p.category.toLowerCase();
            if (cLower.includes("3d")) cat = "3d";
            else if (cLower.includes("audio")) cat = "audio";
            else if (cLower.includes("ui")) cat = "ui";
          } else {
            cat = inferCategoryFromText(p.title + " " + p.description);
          }

          return {
            id: `kenney-${p.guid || p.link}`,
            title: p.title,
            link: p.link,
            thumbnail:
              p.image ||
              "https://kenney.nl/assets/logo.png",
            description: p.description,
            source: "kenney",
            category: cat,
            license: "CC0 1.0 Universal (Public Domain)",
            author: "Kenney",
            publishedDate: p.pubDate,
            price: "Free (CC0)",
            isPermanent: true,
          };
        });
      } catch (err) {
        logger.error("gameAssetsService: Failed to fetch Kenney assets:", err);
        return [];
      }
    },

    /**
     * Fetches open source assets from OpenGameArt.org
     */
    async fetchOpenGameArtAssets(): Promise<GameAssetItem[]> {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch("https://opengameart.org/rss.xml", {
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 LifeOS" },
        });
        clearTimeout(timeout);
        if (!res.ok) return [];
        const text = await res.text();
        const parsed = parseXmlUsingDomOrRegex(text);

        return parsed.map((p) => ({
          id: `oga-${p.guid || p.link}`,
          title: p.title,
          link: p.link,
          thumbnail:
            p.image ||
            "https://opengameart.org/sites/default/files/OGA_Logo_Icon_small.png",
          description: p.description,
          source: "opengameart",
          category: inferCategoryFromText(p.title + " " + p.description),
          license: "Open Source / CC",
          author: p.author || "OpenGameArt Community",
          publishedDate: p.pubDate,
          price: "Free",
          isPermanent: true,
        }));
      } catch (err) {
        logger.warn("gameAssetsService: OpenGameArt fetch skipped or timed out:", err);
        return [];
      }
    },

    /**
     * Fetches loot, DLCs and game sound/asset giveaways from GamerPower
     */
    async fetchGamerPowerLoot(): Promise<GameAssetItem[]> {
      try {
        const res = await fetch(
          "https://www.gamerpower.com/api/giveaways?type=loot",
        );
        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];

        return data.slice(0, 30).map((item: Record<string, unknown>) => ({
          id: `gp-${item.id}`,
          title: (item.title as string) || "Free Loot Pack",
          link:
            (item.open_giveaway_url as string) ||
            (item.gamerpower_url as string) ||
            "https://www.gamerpower.com",
          thumbnail:
            (item.thumbnail as string) ||
            (item.image as string) ||
            "",
          description:
            (item.description as string) ||
            (item.instructions as string) ||
            "",
          source: "gamerpower",
          category: "loot",
          license: (item.worth as string) || "Free Promo",
          publishedDate: (item.published_date as string) || undefined,
          price: (item.worth as string) || "Free",
          isPermanent: false,
        }));
      } catch (err) {
        logger.error("gameAssetsService: Failed to fetch GamerPower loot:", err);
        return [];
      }
    },

    /**
     * Master fetch with cache and multi-source aggregation
     */
    async fetchAllAssets(forceFresh = false): Promise<GameAssetItem[]> {
      if (!forceFresh) {
        const cached = await cacheRepo.getAssetsCache();
        if (
          cached &&
          Date.now() - cached.timestamp < ASSETS_CACHE_EXPIRY &&
          cached.data.length > 0
        ) {
          return cached.data;
        }
      }

      try {
        const [itchRes, kenneyRes, ogaRes, gpRes] = await Promise.allSettled([
          this.fetchItchAssets(),
          this.fetchKenneyAssets(),
          this.fetchOpenGameArtAssets(),
          this.fetchGamerPowerLoot(),
        ]);

        const allItems: GameAssetItem[] = [];
        if (itchRes.status === "fulfilled") allItems.push(...itchRes.value);
        if (kenneyRes.status === "fulfilled") allItems.push(...kenneyRes.value);
        if (ogaRes.status === "fulfilled") allItems.push(...ogaRes.value);
        if (gpRes.status === "fulfilled") allItems.push(...gpRes.value);

        // Deduplicate by URL/ID
        const uniqueMap = new Map<string, GameAssetItem>();
        for (const item of allItems) {
          if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        }
        const merged = Array.from(uniqueMap.values());

        if (merged.length > 0) {
          await cacheRepo.setAssetsCache(merged);
          return merged;
        }

        // Fallback to expired cache if fetch yielded 0 items
        const cached = await cacheRepo.getAssetsCache();
        if (cached && cached.data.length > 0) {
          return cached.data;
        }

        return [];
      } catch (err) {
        logger.error("gameAssetsService: Failed to fetch all assets:", err);
        const cached = await cacheRepo.getAssetsCache();
        if (cached && cached.data.length > 0) {
          return cached.data;
        }
        throw err;
      }
    },

    /**
     * Claimed assets management
     */
    loadClaimedAssetIds(): Promise<string[]> {
      return cacheRepo.loadClaimedAssetIds();
    },

    saveClaimedAssetIds(ids: string[]): Promise<void> {
      return cacheRepo.saveClaimedAssetIds(ids);
    },

    getAssetHubs(): AssetHubShortcut[] {
      return ASSET_HUBS;
    },
  };
}

export type GameAssetsService = ReturnType<typeof createGameAssetsService>;

const _defaultCacheRepo = new ChromeStorageGameAssetsRepository();
export const gameAssetsService = createGameAssetsService(_defaultCacheRepo);
