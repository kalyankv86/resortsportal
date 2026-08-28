/**
 * Exports the marketing-page registry (src/content/pages.ts) to the JSON the
 * backend CmsSeeder reads. Run: npx tsx scripts/dump-pages.mjs
 */
import { writeFileSync } from "node:fs";
import { PAGES } from "../src/content/pages.ts";

const slugFromHref = (href) =>
  href && href.startsWith("/") ? href.slice(1).split("/")[0] : null;

const out = Object.values(PAGES).map((p) => ({
  slug: p.slug,
  title: p.title,
  eyebrow: p.eyebrow,
  summary: p.summary,
  hero_category: p.hero,
  parent_slug: p.parent ? slugFromHref(p.parent.href) : null,
  sections: p.sections,
}));

const dest = new URL(
  "../../backend/database/data/cms-pages.json",
  import.meta.url,
);
writeFileSync(dest, JSON.stringify(out) + "\n");
console.log(`wrote ${out.length} pages -> ${dest.pathname}`);
