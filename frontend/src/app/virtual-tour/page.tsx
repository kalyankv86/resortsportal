import type { Metadata } from "next";
import { getCover } from "@/lib/media";
import { PageHero } from "@/components/page/PageHero";
import { Container, Section } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Virtual Tour",
  description: "A 360° walk-through of Centurion Wellness Eco Tourism — coming soon.",
  alternates: { canonical: "/virtual-tour" },
};

export default async function VirtualTourPage() {
  const cover = await getCover("virtual-tour");

  return (
    <>
      <PageHero
        eyebrow="Discover"
        title="Virtual Tour"
        summary="A 360° walk-through of the wellness centre, the rooms, the dining hall and the lake deck."
        cover={cover}
      />

      <Section>
        <Container>
          <div className="rounded-card border border-border bg-surface-muted px-6 py-16 text-center">
            <p className="font-heading text-2xl text-forest-800">Coming soon</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              We are producing a 360° tour of the campus. In the meantime, the
              gallery has photographs from across the estate.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href="/gallery">Open the gallery</Button>
              <Button href="/contact" variant="secondary">Ask a question</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
