import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  destinations,
  destinationBySlug,
  destinationImage,
} from "@/content/destinations";
import { getCover, getMedia } from "@/lib/media";
import { PageHero } from "@/components/page/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) return {};
  return {
    title: `${d.name} · Sightseeing`,
    description: d.summary,
    alternates: { canonical: `/sightseeing/${slug}` },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) notFound();

  const cover = destinationImage(d) ?? (await getCover(d.hero));
  const gallery = (await getMedia(d.hero)).slice(0, 4);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${d.coords.lat},${d.coords.lng}`;

  return (
    <>
      <PageHero
        eyebrow="Sightseeing"
        title={d.name}
        summary={d.summary}
        cover={cover}
        parent={{ label: "Sightseeing", href: "/sightseeing" }}
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <SectionHeading eyebrow={d.tag} title="History & the visit" />
              <div className="mt-4 flex flex-col gap-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {d.history.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <h3 className="mt-8 font-heading text-lg text-forest-800">What you can do</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.activities.map((a) => (
                  <li
                    key={a}
                    className="rounded-pill bg-sage-100 px-3 py-1.5 font-ui text-xs font-semibold text-forest-700"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="h-fit rounded-card border border-border bg-surface p-6">
              <dl className="flex flex-col gap-4 text-sm">
                <Row label="From the wellness centre" value={`${d.distanceKm} km`} />
                <Row label="Travel time" value={`about ${d.travelTime} by road`} />
                <Row label="Best season" value={d.bestSeason} />
              </dl>
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-border bg-surface px-4 py-3 text-center font-ui text-sm font-semibold text-forest-700 hover:border-sage"
                >
                  Open in Maps
                </a>
                <Button href="/contact">Book a guided visit</Button>
              </div>
            </aside>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((img, i) => (
              <Reveal key={img.id} delay={i * 0.05}>
                <MediaImage item={img} sizes="(max-width:640px) 50vw, 25vw" className="aspect-[3/4] w-full" />
              </Reveal>
            ))}
          </div>

          {d.image ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Location photograph: {d.image.credit}.
            </p>
          ) : null}
        </Container>
      </Section>

      <Section className="bg-surface-muted">
        <Container>
          <SectionHeading eyebrow="Nearby" title="More of Gajapati" />
          <div className="mt-8 flex flex-wrap gap-2">
            {destinations
              .filter((x) => x.slug !== d.slug)
              .map((x) => (
                <Link
                  key={x.slug}
                  href={`/sightseeing/${x.slug}`}
                  className="rounded-pill border border-border bg-surface px-4 py-2 font-ui text-sm font-semibold text-forest-700 hover:border-sage"
                >
                  {x.name}
                </Link>
              ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-forest-800">{value}</dd>
    </div>
  );
}
