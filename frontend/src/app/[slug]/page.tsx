import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAGES, PAGE_SLUGS } from "@/content/pages";
import { StandardPage } from "@/components/page/StandardPage";

export function generateStaticParams() {
  return PAGE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = PAGES[slug];
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
  const def = PAGES[slug];
  if (!def) notFound();
  return <StandardPage def={def} />;
}
