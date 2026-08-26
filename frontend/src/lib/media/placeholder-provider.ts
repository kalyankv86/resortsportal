import type {
  MediaCategory,
  MediaItem,
  MediaProvider,
} from "./types";

/**
 * Brand placeholder provider.
 *
 * Generates deterministic, legible SVG data URIs in the CWETR palette — NOT
 * stock, Unsplash, Pexels or AI photography. Each category gets a distinct
 * duotone gradient, a botanical motif and its name rendered as a caption, so
 * every layout is reviewable and it is obvious the real photo is pending.
 * Replace with the `googlePhotos` provider once the official album is connected.
 */

interface CategoryStyle {
  from: string;
  to: string;
  ink: string; // caption colour
  label: string;
  motif: "leaf" | "wave" | "sun" | "peak" | "lotus";
}

const STYLES: Record<MediaCategory, CategoryStyle> = {
  hero: { from: "#1c6b3c", to: "#0f3f22", ink: "#f4f1e8", label: "Forest Sanctuary", motif: "peak" },
  rooms: { from: "#9fc198", to: "#5c8f56", ink: "#0a2c18", label: "Luxury Stay", motif: "leaf" },
  spa: { from: "#e2a98f", to: "#c26d4f", ink: "#3a1b10", label: "Spa & Therapies", motif: "lotus" },
  ayurveda: { from: "#7aa874", to: "#1c6b3c", ink: "#f4f1e8", label: "Ayurveda", motif: "lotus" },
  yoga: { from: "#cfe6c6", to: "#9fc198", ink: "#14532d", label: "Yoga", motif: "sun" },
  meditation: { from: "#dff5e3", to: "#a9d3b0", ink: "#14532d", label: "Meditation", motif: "lotus" },
  dining: { from: "#ecd9b0", to: "#d29b6e", ink: "#3a2410", label: "Farm to Table", motif: "leaf" },
  "organic-farm": { from: "#a9c987", to: "#5c8f56", ink: "#14311a", label: "Organic Farm", motif: "leaf" },
  forest: { from: "#3f8f5c", to: "#14532d", ink: "#f4f1e8", label: "Forest Trails", motif: "peak" },
  waterfalls: { from: "#bfe0d8", to: "#3f8f8f", ink: "#0d2f2f", label: "Waterfalls", motif: "wave" },
  drone: { from: "#2c7a52", to: "#0a2c18", ink: "#f4f1e8", label: "From Above", motif: "peak" },
  events: { from: "#e8b79c", to: "#8fae7f", ink: "#3a1b10", label: "Events & Retreats", motif: "sun" },
  gallery: { from: "#efe3c4", to: "#a9c987", ink: "#14311a", label: "Gallery", motif: "leaf" },
  "virtual-tour": { from: "#8fc7a8", to: "#c26d4f", ink: "#1a2f22", label: "Virtual Tour", motif: "sun" },
};

function motif(kind: CategoryStyle["motif"], ink: string): string {
  const o = 0.16;
  switch (kind) {
    case "wave":
      return `<path d="M0 620 C 320 540 640 700 960 610 C 1120 565 1280 640 1440 600 L1440 900 L0 900 Z" fill="${ink}" opacity="${o}"/><path d="M0 700 C 360 640 720 780 1080 690 C 1240 655 1360 710 1440 685 L1440 900 L0 900 Z" fill="${ink}" opacity="0.10"/>`;
    case "peak":
      return `<path d="M0 900 L360 470 L620 720 L900 360 L1200 760 L1440 560 L1440 900 Z" fill="${ink}" opacity="${o}"/><path d="M0 900 L520 600 L820 800 L1160 540 L1440 740 L1440 900 Z" fill="${ink}" opacity="0.10"/>`;
    case "sun":
      return `<circle cx="1120" cy="250" r="120" fill="${ink}" opacity="0.18"/><circle cx="1120" cy="250" r="200" fill="${ink}" opacity="0.08"/><circle cx="1120" cy="250" r="290" fill="${ink}" opacity="0.05"/>`;
    case "lotus":
      return `<g fill="${ink}" opacity="0.16" transform="translate(720 430)"><ellipse rx="34" ry="120"/><ellipse rx="120" ry="34"/><ellipse cx="0" cy="0" rx="86" ry="86" transform="rotate(45)" opacity="0.6"/><ellipse cx="0" cy="0" rx="86" ry="86" transform="rotate(-45)" opacity="0.6"/></g>`;
    case "leaf":
    default:
      return `<g transform="translate(690 360)" fill="${ink}"><path d="M0 220 C 0 40 180 -40 300 -40 C 300 140 160 220 0 220 Z" opacity="${o}"/><path d="M0 220 C 160 180 260 60 300 -40" stroke="${ink}" stroke-width="5" fill="none" opacity="0.28"/></g>`;
  }
}

function svg(style: CategoryStyle, index: number): string {
  const rot = (index * 41) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${rot} 0.5 0.5)">
      <stop offset="0" stop-color="${style.from}"/>
      <stop offset="1" stop-color="${style.to}"/>
    </linearGradient>
  </defs>
  <rect width="1440" height="900" fill="url(#g)"/>
  ${motif(style.motif, style.ink)}
  <g transform="translate(64 786)">
    <rect x="0" y="0" rx="14" ry="14" width="${style.label.length * 15 + 132}" height="50"
          fill="${style.ink}" opacity="0.14"/>
    <circle cx="30" cy="25" r="9" fill="${style.ink}" opacity="0.85"/>
    <text x="52" y="26" font-family="Georgia, 'Times New Roman', serif" font-size="24"
          fill="${style.ink}" dominant-baseline="middle">${style.label}</text>
    <text x="${style.label.length * 15 + 62}" y="26" font-family="Helvetica, Arial, sans-serif"
          font-size="12" letter-spacing="2" fill="${style.ink}" opacity="0.7"
          dominant-baseline="middle">PHOTO PENDING</text>
  </g>
</svg>`;
}

function toDataUri(raw: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(raw)}`;
}

const BLUR =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5"><rect width="8" height="5" fill="#7aa874"/></svg>`,
  );

const ITEMS_PER_CATEGORY = 6;

export const placeholderProvider: MediaProvider = {
  name: "placeholder",

  async list(category: MediaCategory): Promise<MediaItem[]> {
    const style = STYLES[category];
    return Array.from({ length: ITEMS_PER_CATEGORY }, (_, i) => ({
      id: `${category}-${i + 1}`,
      category,
      src: toDataUri(svg(style, i + 1)),
      blurDataURL: BLUR,
      width: 1440,
      height: 900,
      alt: `${style.label} — CWETR placeholder ${i + 1}. Awaiting official CUTM Google Photos album.`,
      sourceRef: `placeholder:${category}:${i + 1}`,
      credit: "CWETR brand placeholder",
    }));
  },

  async cover(category: MediaCategory): Promise<MediaItem> {
    const [first] = await this.list(category);
    return first;
  },
};
