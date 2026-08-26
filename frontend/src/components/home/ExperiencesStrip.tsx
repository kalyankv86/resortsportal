import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { getCover } from "@/lib/media";
import { experiences } from "@/content/home";

export async function ExperiencesStrip() {
  const items = await Promise.all(
    experiences.map(async (e) => ({ ...e, cover: await getCover(e.category) })),
  );

  return (
    <Section className="bg-surface-muted">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Eco tourism"
            title="Step outside the treatment room"
            description="Guided by resident naturalists across 120 acres of restored forest and working organic farmland."
          />
          <Button href="/experiences" variant="secondary" className="shrink-0">
            All experiences
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.05}>
              <Link
                href={item.href}
                className="group flex flex-col gap-3"
              >
                <MediaImage
                  item={item.cover}
                  sizes="(max-width: 640px) 50vw, 16vw"
                  className="aspect-[4/5] w-full transition-transform duration-500 ease-luxury group-hover:-translate-y-1"
                />
                <div>
                  <h3 className="font-heading text-lg leading-tight">
                    {item.name}
                  </h3>
                  <p className="font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {item.duration}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
