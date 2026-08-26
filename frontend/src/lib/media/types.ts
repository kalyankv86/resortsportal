/**
 * CWETR Media Library — type contract.
 *
 * Per the master prompt, production imagery is sourced ONLY from the official
 * CUTM Google Photos album and auto-categorised. No stock / Unsplash / Pexels /
 * AI imagery is permitted. Until the album URL is supplied, the `placeholder`
 * provider serves procedurally-generated brand SVGs so every page can be built
 * and reviewed. Swapping providers requires no page-level changes.
 */

export const MEDIA_CATEGORIES = [
  "hero",
  "rooms",
  "spa",
  "ayurveda",
  "yoga",
  "meditation",
  "dining",
  "organic-farm",
  "forest",
  "waterfalls",
  "drone",
  "events",
  "gallery",
  "virtual-tour",
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export interface MediaItem {
  id: string;
  category: MediaCategory;
  /** Optimised display URL (WebP/AVIF where the provider supports it). */
  src: string;
  /** Low-res blurred placeholder for progressive loading. */
  blurDataURL?: string;
  width: number;
  height: number;
  alt: string;
  /** Original filename / Google Photos media key, for the CMS media manager. */
  sourceRef?: string;
  credit?: string;
}

export interface MediaProvider {
  readonly name: string;
  /** All items in a category, newest first. */
  list(category: MediaCategory): Promise<MediaItem[]>;
  /** A single representative item (first in category). */
  cover(category: MediaCategory): Promise<MediaItem>;
}
