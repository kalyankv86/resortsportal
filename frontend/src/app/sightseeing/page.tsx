import type { Metadata } from "next";
import Link from "next/link";
import {
  destinations,
  destinationBySlug,
  destinationImage,
  destinationImageCredits,
} from "@/content/destinations";
import { getCover } from "@/lib/media";
import { PageHero } from "@/components/page/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sightseeing",
  description:
    "Day trips from Centurion Wellness Eco Tourism into the Eastern Ghats — Mahendragiri, Gandahati Waterfall, the Gajapati palaces, a Himalayan monastery and Saura tribal villages.",
  alternates: { canonical: "/sightseeing" },
};

export default async function ExploreGajapatiPage() {
  const cover =
    destinationImage(destinationBySlug("gandahati-waterfall")!) ??
    (await getCover("forest"));
  const cards = await Promise.all(
    destinations.map(async (d) => ({
      ...d,
      img: destinationImage(d) ?? (await getCover(d.hero)),
    })),
  );

  return (
    <>
      <PageHero
        eyebrow="Eco tourism"
        title="Sightseeing"
        summary="The wellness centre sits at the foot of the Eastern Ghats, in one of Odisha's least-travelled districts. Sacred hills, forest waterfalls, royal heritage and a living tribal culture are all within a morning's drive."
        cover={cover}
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="The setting"
            title="Gajapati & the Eastern Ghats"
            description="Gajapati district rises from the coastal plain into hills of sal and semi-evergreen forest along the Odisha–Andhra border. Paralakhemundi, the old seat of the Gajapati kings, is its gateway. Every trip below is arranged with a guide and can be built around your wellness schedule."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((d, i) => (
              <Reveal key={d.slug} delay={i * 0.05}>
                <Link
                  href={`/sightseeing/${d.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-soft transition-all duration-500 ease-luxury hover:-translate-y-1 hover:shadow-lift"
                >
                  <MediaImage
                    item={d.img}
                    rounded={false}
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="aspect-[4/3] w-full"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <p className="eyebrow text-terracotta">{d.tag}</p>
                    <h3 className="mt-1.5 font-heading text-xl text-forest-800">{d.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {d.summary}
                    </p>
                    <p className="mt-4 font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {d.distanceKm} km · {d.travelTime}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-muted">
        <Container>
          <div className="rounded-card bg-forest-700 px-8 py-12 text-ivory sm:px-14 sm:py-16">
            <p className="eyebrow text-sage-200">Plan a trip</p>
            <p className="mt-3 max-w-2xl font-heading text-2xl leading-snug sm:text-3xl">
              Our team arranges transport, guides and permits so a day out sits
              lightly around your treatments.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/contact" size="lg">Ask reception</Button>
              <Button href="/experiences" variant="glass" size="lg">On-campus experiences</Button>
            </div>
          </div>

          <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
            Location photographs:{" "}
            {destinationImageCredits.map((c, i) => (
              <span key={c.name}>
                {i > 0 ? "; " : ""}
                {c.name} — {c.credit}
              </span>
            ))}
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
