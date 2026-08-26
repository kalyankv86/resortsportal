import { placeholderProvider } from "./placeholder-provider";
import type { MediaCategory, MediaItem, MediaProvider } from "./types";

export * from "./types";

/**
 * Active media provider.
 *
 *   MEDIA_PROVIDER=placeholder   → brand SVG placeholders (default, offline)
 *   MEDIA_PROVIDER=google-photos → official CUTM Google Photos album
 *                                  (wired in a later milestone once the album
 *                                  share URL + API credentials are provided)
 */
function resolveProvider(): MediaProvider {
  const name = process.env.MEDIA_PROVIDER ?? "placeholder";
  switch (name) {
    case "placeholder":
      return placeholderProvider;
    // case "google-photos":
    //   return googlePhotosProvider;
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
