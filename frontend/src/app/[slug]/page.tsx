import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAGES, PAGE_SLUGS, type PageDef, type Section } from "@/content/pages";
import { StandardPage } from "@/components/page/StandardPage";
import { api, ApiError } from "@/lib/api";

export function generateStaticParams() {
  return PAGE_SLUGS.map((slug) => ({ slug }));
}

// Allow CMS-authored pages that aren't in the static registry.
export const dynamicParams = true;
export const revalidate = 60;

interface CmsSection {
  kind: string;
  position: number;
  data: Record<string, unknown> | null;
}
interface CmsPage {
  slug: string;
  title: string;
  eyebrow: string | null;
  summary: string | null;
  hero_category: string | null;
  parent_slug: string | null;
  status: string;
  sections: CmsSection[];
}

/** DB page → the PageDef shape StandardPage renders. */
function fromCms(cms: CmsPage): PageDef {
  const registry = PAGES[cms.slug];
  const sections: Section[] =
    cms.sections.length > 0
      ? cms.sections
          .sort((a, b) => a.position - b.position)
          .map((s) => ({ kind: s.kind, ...(s.data ?? {}) }) as Section)
      : (registry?.sections ?? []);

  return {
    slug: cms.slug,
    title: cms.title,
    eyebrow: cms.eyebrow ?? registry?.eyebrow ?? "",
    summary: cms.summary ?? registry?.summary ?? "",
    hero: (cms.hero_category as PageDef["hero"]) ?? registry?.hero ?? "gallery",
    parent: registry?.parent,
    sections,
  };
}

async function resolvePage(slug: string): Promise<PageDef | null> {
  try {
    const res = await api<{ data: CmsPage }>(`/pages/${encodeURIComponent(slug)}`, {
      revalidate: 60,
    });
    if (res.data?.status === "published") return fromCms(res.data);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) {
      // API down / unexpected — fall back to the static registry below.
    }
  }
  return PAGES[slug] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = await resolvePage(slug);
  if (!def) return {};
  return {
    title: def.title,
    description: def.summary,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: def.title, description: def.summary, url: `/${slug}` },
  };
}

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = await resolvePage(slug);
  if (!def) notFound();
  return <StandardPage def={def} />;
}
