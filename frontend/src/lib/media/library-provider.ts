import manifest from "./library.manifest.json";
import { MEDIA_CATEGORIES, type MediaCategory, type MediaItem, type MediaProvider } from "./types";

/**
 * Local media library provider.
 *
 * Source: the official CUTM Google Photos album, ingested to
 * /opt/resorts/media/library/ by scripts/ingest-google-photos.mjs and served
 * by Nginx at /media/library/<id>.jpg. This provider reads the committed
 * manifest (id + category + dimensions) — no network, no cloud dependency.
 *
 * Images without an explicit category are spread across the still-thin
 * categories so every page gets real photography while the CMS assigns the
 * rest.
 */

interface ManifestItem {
  id: string;
  file: string;
  width: number;
  height: number;
  category: MediaCategory | null;
  alt?: string;
}

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE ?? "/media/library";

const items = (manifest.items ?? []) as ManifestItem[];

function toMediaItem(m: ManifestItem, category: MediaCategory): MediaItem {
  return {
    id: m.id,
    category,
    src: `${MEDIA_BASE}/${m.file}`,
    width: m.width || 2560,
    height: m.height || 1707,
    alt: m.alt ?? "Centurion Wellness Eco Tourism Resorts",
    sourceRef: `google-photos:${m.id}`,
    credit: "Centurion University",
  };
}

/** Build category → items, filling gaps round-robin from the unassigned pool. */
function bucketise(): Record<MediaCategory, MediaItem[]> {
  const buckets = Object.fromEntries(
    MEDIA_CATEGORIES.map((c) => [c, [] as MediaItem[]]),
  ) as Record<MediaCategory, MediaItem[]>;

  const pool: ManifestItem[] = [];
  for (const m of items) {
    if (m.category && buckets[m.category]) {
      buckets[m.category].push(toMediaItem(m, m.category));
    } else {
      pool.push(m);
    }
  }

  // round-robin the unassigned pool across every category
  let i = 0;
  for (const m of pool) {
    for (let step = 0; step < MEDIA_CATEGORIES.length; step++) {
      const cat = MEDIA_CATEGORIES[(i + step) % MEDIA_CATEGORIES.length];
      if (buckets[cat].length < 4) {
        buckets[cat].push(toMediaItem(m, cat));
        i++;
        break;
      }
      if (step === MEDIA_CATEGORIES.length - 1) {
        buckets[MEDIA_CATEGORIES[i % MEDIA_CATEGORIES.length]].push(toMediaItem(m, cat));
        i++;
      }
    }
  }

  // guarantee every category has at least one image (reuse if truly empty)
  const any = items[0];
  for (const c of MEDIA_CATEGORIES) {
    if (buckets[c].length === 0 && any) buckets[c].push(toMediaItem(any, c));
  }
  return buckets;
}

const BUCKETS = bucketise();

export const libraryProvider: MediaProvider = {
  name: "library",
  async list(category: MediaCategory) {
    return BUCKETS[category] ?? [];
  },
  async cover(category: MediaCategory) {
    const list = BUCKETS[category] ?? [];
    return list[0];
  },
};

export const libraryHasItems = items.length > 0;
