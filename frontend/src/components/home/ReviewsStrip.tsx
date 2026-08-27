import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { reviews } from "@/content/home";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-terracotta" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4">
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8L10 1.6z" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsStrip() {
  return (
    <Section>
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Guest stories"
          title="4.9 average across 600+ verified stays"
          description="A few words from guests who came for a residential programme or a short restorative stay."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col gap-4 rounded-card border border-border bg-surface p-7 shadow-soft">
                <Stars n={r.rating} />
                <blockquote className="font-heading text-lg leading-snug text-forest-800">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-auto font-ui text-sm text-muted-foreground">
                  <span className="font-semibold text-forest-700">{r.name}</span>
                  {" · "}
                  {r.origin}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
