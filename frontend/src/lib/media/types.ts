/**
 * CWETR Media Library — type contract.
 *
 * Production imagery is the estate's own photography, sourced from the
 * Centurion University media library and auto-categorised. The `placeholder`
 * provider serves house-style SVGs as a fallback; swapping providers requires
 * no page-level changes.
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
