import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { getCover } from "@/lib/media";
import { bento, type BentoItem } from "@/content/home";
import { cn } from "@/lib/cn";

const spanClasses: Record<BentoItem["span"], string> = {
  sm: "md:col-span-2 md:row-span-1",
  md: "md:col-span-3 md:row-span-1",
  lg: "md:col-span-4 md:row-span-1",
  tall: "md:col-span-2 md:row-span-2",
};

export async function BentoShowcase() {
  const items = await Promise.all(
    bento.map(async (b) => ({ ...b, cover: await getCover(b.category) })),
  );

  return (
    <Section id="explore">
      <Container>
        <SectionHeading
          eyebrow="One sanctuary, many paths"
          title="Everything your stay can hold"
          description="A residential wellness resort on the Centurion University eco-campus — Ayurveda, forest, farm and a table that follows your prescription."
        />

        <div className="mt-12 grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-6">
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.06}
              className={cn("group", spanClasses[item.span])}
            >
              <Link
                href={item.href}
                className="relative flex h-full flex-col justify-end overflow-hidden rounded-card p-6 shadow-soft transition-all duration-500 ease-luxury hover:-translate-y-1 hover:shadow-lift"
              >
                <MediaImage
                  item={item.cover}
                  rounded={false}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="absolute inset-0 h-full w-full transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/20 to-forest-900/5" />
                <div className="relative z-10 text-ivory">
                  <h3 className="font-heading text-xl sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ivory/80">
                    {item.copy}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-sage-200">
                    {item.cta}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
