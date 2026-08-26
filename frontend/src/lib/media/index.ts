import { placeholderProvider } from "./placeholder-provider";
import { libraryProvider, libraryHasItems } from "./library-provider";
import type { MediaCategory, MediaItem, MediaProvider } from "./types";

export * from "./types";

/**
 * Active media provider.
 *
 *   MEDIA_PROVIDER=library     → local library ingested from the official CUTM
 *                                Google Photos album (default when populated)
 *   MEDIA_PROVIDER=placeholder → brand SVG placeholders (offline fallback)
 *
 * Re-ingest with: node scripts/ingest-google-photos.mjs
 */
function resolveProvider(): MediaProvider {
  const name = process.env.MEDIA_PROVIDER ?? (libraryHasItems ? "library" : "placeholder");
  switch (name) {
    case "library":
      return libraryHasItems ? libraryProvider : placeholderProvider;
    case "placeholder":
      return placeholderProvider;
    default:
      return placeholderProvider;
  }
}

const provider = resolveProvider();

export function getMedia(category: MediaCategory): Promise<MediaItem[]> {
  return provider.list(category);
}

export function getCover(category: MediaCategory): Promise<MediaItem> {
  return provider.cover(category);
}

export const activeMediaProvider = provider.name;
