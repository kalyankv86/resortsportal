import Link from "next/link";
import { getCover, getMedia, type MediaItem } from "@/lib/media";
import type { PageDef, Section } from "@/content/pages";
import { Container, Section as Band, SectionHeading } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { StatRow } from "@/components/ui/Stat";
import { PageHero } from "./PageHero";
import { FaqAccordion } from "./FaqAccordion";
import { ContactForm, LoginForm } from "./LeadForms";
import { BookingWidget } from "@/components/layout/BookingWidget";
import { site } from "@/content/site";

/** Media pre-resolved for a section, keyed by index. */
type Resolved = Record<number, MediaItem[]>;

async function resolveMedia(sections: Section[]): Promise<Resolved> {
  const out: Resolved = {};
  await Promise.all(
    sections.map(async (s, i) => {
      if (s.kind === "cards") out[i] = await getMedia(s.category);
      else if (s.kind === "gallery") out[i] = await getMedia(s.category);
    }),
  );
  return out;
}

export async function StandardPage({ def }: { def: PageDef }) {
  const [cover, media] = await Promise.all([
    getCover(def.hero),
    resolveMedia(def.sections),
  ]);

  return (
    <>
      <PageHero
        eyebrow={def.eyebrow}
        title={def.title}
        summary={def.summary}
        cover={cover}
        parent={def.parent}
      />
      {def.sections.map((section, i) => (
        <SectionRenderer key={i} section={section} media={media[i]} alt={i % 2 === 1} />
      ))}
    </>
  );
}

function SectionRenderer({
  section,
  media,
  alt,
}: {
  section: Section;
  media?: MediaItem[];
  alt: boolean;
}) {
  const bandClass = alt ? "bg-surface-muted" : undefined;

  switch (section.kind) {
    case "intro":
      return (
        <Band className={bandClass}>
          <Container>
            <div className="max-w-3xl">
              {section.heading ? (
                <h2 className="text-3xl sm:text-4xl">{section.heading}</h2>
              ) : null}
              <div className="mt-4 flex flex-col gap-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {section.body.map((p, k) => (
                  <p key={k}>{p}</p>
                ))}
              </div>
            </div>
          </Container>
        </Band>
      );

    case "features":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} description={section.body} />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((f, k) => (
                <Reveal key={f.title} delay={k * 0.05}>
                  <div className="h-full rounded-card border border-border bg-surface p-6">
                    <div className="mb-3 h-9 w-9 rounded-xl bg-sage-100" aria-hidden />
                    <h3 className="font-heading text-lg text-forest-800">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {f.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Band>
      );

    case "cards":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} description={section.body} />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((c, k) => {
                const img = media?.[k % (media?.length || 1)];
                const inner = (
                  <div className="group h-full overflow-hidden rounded-card border border-border bg-surface shadow-soft transition-all duration-500 ease-luxury hover:-translate-y-1 hover:shadow-lift">
                    {img ? (
                      <MediaImage
                        item={img}
                        rounded={false}
                        sizes="(max-width:640px) 100vw, 33vw"
                        className="aspect-[4/3] w-full"
                      />
                    ) : null}
                    <div className="p-6">
                      <h3 className="font-heading text-lg text-forest-800">{c.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {c.text}
                      </p>
                      {c.href ? (
                        <span className="mt-3 inline-flex items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-[0.14em] text-terracotta-600">
                          Learn more →
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
                return (
                  <Reveal key={c.title} delay={k * 0.05}>
                    {c.href ? <Link href={c.href}>{inner}</Link> : inner}
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </Band>
      );

    case "gallery":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} description={section.body} />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(media ?? []).map((img, k) => (
                <Reveal key={img.id} delay={k * 0.04}>
                  <MediaImage
                    item={img}
                    sizes="(max-width:640px) 50vw, 25vw"
                    className={k % 5 === 0 ? "aspect-square" : "aspect-[3/4]"}
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </Band>
      );

    case "stats":
      return (
        <Band className={bandClass}>
          <Container>
            {section.heading ? (
              <SectionHeading title={section.heading} className="mb-10" />
            ) : null}
            <div className="rounded-card border border-border bg-surface px-6 py-12 shadow-soft sm:px-12">
              <StatRow items={section.items} />
            </div>
          </Container>
        </Band>
      );

    case "steps":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} description={section.body} />
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.items.map((s, k) => (
                <Reveal key={s.title} delay={k * 0.06}>
                  <li className="h-full rounded-card border border-border bg-surface p-6">
                    <span className="font-heading text-3xl text-sage-300">
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-heading text-lg text-forest-800">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {s.text}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </Container>
        </Band>
      );

    case "pricing":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} description={section.body} />
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {section.items.map((p) => (
                <div
                  key={p.name}
                  className={
                    "flex h-full flex-col rounded-card border p-7 " +
                    (p.featured
                      ? "border-forest-700 bg-forest-700 text-ivory shadow-lift"
                      : "border-border bg-surface")
                  }
                >
                  <h3 className="font-heading text-xl">{p.name}</h3>
                  <p className="mt-2 font-heading text-3xl">
                    {p.price}
                    {p.cadence ? (
                      <span className={"ml-1 text-sm " + (p.featured ? "text-ivory/70" : "text-muted-foreground")}>
                        {p.cadence}
                      </span>
                    ) : null}
                  </p>
                  <ul className={"mt-5 flex flex-1 flex-col gap-2 text-sm " + (p.featured ? "text-ivory/85" : "text-muted-foreground")}>
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span aria-hidden>·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href={p.href}
                    variant={p.featured ? "glass" : "primary"}
                    className="mt-6"
                  >
                    Choose {p.name.split(" — ")[0]}
                  </Button>
                </div>
              ))}
            </div>
          </Container>
        </Band>
      );

    case "faq":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} />
            <div className="mt-10 max-w-3xl">
              <FaqAccordion items={section.items} />
            </div>
          </Container>
        </Band>
      );

    case "contact":
      return (
        <Band className={bandClass}>
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <SectionHeading title={section.heading} />
                <dl className="mt-6 flex flex-col gap-4 text-sm">
                  <div>
                    <dt className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Reservations & enquiries</dt>
                    <dd className="mt-1 text-forest-800">
                      {site.contactName}
                      <br />
                      <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
                      <br />
                      <a href={`mailto:${site.email}`}>{site.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Address</dt>
                    <dd className="mt-1 text-forest-800">
                      {site.address}
                      <br />
                      <a
                        href={site.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terracotta-600"
                      >
                        Open in Google Maps →
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
              <ContactForm />
            </div>
          </Container>
        </Band>
      );

    case "booking":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} description={section.body} />
            <div className="mt-8">
              <BookingWidget variant="hero" />
            </div>
          </Container>
        </Band>
      );

    case "login":
      return (
        <Band className={bandClass}>
          <Container>
            <SectionHeading title={section.heading} align="center" className="mb-10" />
            <LoginForm />
          </Container>
        </Band>
      );

    case "cta":
      return (
        <Band className={bandClass}>
          <Container>
            <div className="rounded-card bg-forest-700 px-8 py-12 text-ivory sm:px-14 sm:py-16">
              <p className="eyebrow text-sage-200">{section.heading}</p>
              <p className="mt-3 max-w-2xl font-heading text-2xl leading-snug sm:text-3xl">
                {section.body}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={section.primary.href} size="lg">
                  {section.primary.label}
                </Button>
                {section.secondary ? (
                  <Button href={section.secondary.href} variant="glass" size="lg">
                    {section.secondary.label}
                  </Button>
                ) : null}
              </div>
            </div>
          </Container>
        </Band>
      );

    default:
      return null;
  }
}
