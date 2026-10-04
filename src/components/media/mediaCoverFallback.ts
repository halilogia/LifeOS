/**
 * mediaCoverFallback.ts
 * Presentation-layer cover image fallback.
 *
 * Zero Fake Data Protocol: the domain model NEVER stores an invented cover URL.
 * When an item has no real artwork (`coverUrl` is undefined), the UI renders a
 * neutral placeholder instead of persisting a synthetic image into the model.
 */

/** Neutral placeholder shown only at render time when no real cover exists. */
export const MEDIA_COVER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80";

/**
 * Resolves a render-ready cover source. Returns the real cover when present,
 * otherwise the neutral UI placeholder. Must be used at the presentation edge
 * only — never written back into the domain/storage layer.
 */
export function resolveCoverSrc(coverUrl?: string): string {
  return coverUrl && coverUrl.trim().length > 0
    ? coverUrl
    : MEDIA_COVER_PLACEHOLDER;
}
