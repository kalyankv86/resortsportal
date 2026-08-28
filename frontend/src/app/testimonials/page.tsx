import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getCover } from "@/lib/media";
import { PageHero } from "@/components/page/PageHero";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "In guests' own words — reviews from residential programmes and short stays.",
  alternates: { canonical: "/testimonials" },
};

export const revalidate = 60;

interface Testimonial {
  id: number;
  name: string;
  origin: string | null;
  quote: string;
  rating: number | null;
}

async function loadTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await api<{ data: Testimonial[] }>("/testimonials", { revalidate: 60 });
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function TestimonialsPage() {
  const [cover, items] = await Promise.all([getCover("meditation"), loadTestimonials()]);

  return (
    <>
      <PageHero
        eyebrow="Discover"
        title="Testimonials"
        summary="In guests' own words — from residential programmes and short stays."
        cover={cover}
      />

      <Section>
        <Container>
          {items.length === 0 ? (
            <div className="rounded-card border border-border bg-surface-muted px-6 py-16 text-center">
              <p className="font-heading text-2xl text-forest-800">Guest stories coming soon</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                We are gathering reviews from recent guests and will publish them here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t, i) => (
                <Reveal key={t.id} delay={(i % 6) * 0.05}>
                  <figure className="flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-soft">
                    {t.rating ? (
                      <div className="text-terracotta-600" aria-label={`${t.rating} out of 5`}>
                        {"★".repeat(Math.max(1, Math.min(5, t.rating)))}
                      </div>
                    ) : null}
                    <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-forest-800">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 font-ui text-sm font-semibold text-muted-foreground">
                      {t.name}
                      {t.origin ? ` · ${t.origin}` : ""}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
