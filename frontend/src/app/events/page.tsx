import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getCover, type MediaItem } from "@/lib/media";
import { PageHero } from "@/components/page/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Wellness talks, farm suppers, folk-music evenings and seasonal celebrations at Centurion Wellness Eco Tourism.",
  alternates: { canonical: "/events" },
};

export const revalidate = 60;

interface EventRow {
  id: number;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  media: { id: number; url: string; alt: string | null } | null;
}

async function loadEvents(): Promise<{ upcoming: EventRow[]; past: EventRow[] }> {
  let rows: EventRow[] = [];
  try {
    const res = await api<{ data: EventRow[] }>("/events", { revalidate: 60 });
    rows = res.data ?? [];
  } catch {
    rows = [];
  }
  const now = Date.now();
  return {
    upcoming: rows.filter((e) => !e.starts_at || new Date(e.starts_at).getTime() >= now),
    past: rows.filter((e) => e.starts_at && new Date(e.starts_at).getTime() < now),
  };
}

function fmt(range: { start: string | null; end: string | null }): string | null {
  if (!range.start) return null;
  const s = new Date(range.start);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const startStr = s.toLocaleDateString("en-IN", opts);
  const time = s.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const hasTime = s.getHours() !== 0 || s.getMinutes() !== 0;
  if (range.end) {
    const e = new Date(range.end);
    if (e.toDateString() !== s.toDateString()) {
      return `${startStr} – ${e.toLocaleDateString("en-IN", opts)}`;
    }
  }
  return hasTime ? `${startStr} · ${time}` : startStr;
}

function toItem(m: { id: number; url: string; alt: string | null }): MediaItem {
  return { id: `event-${m.id}`, category: "events", src: m.url, width: 1600, height: 1000, alt: m.alt ?? "Event" };
}

export default async function EventsPage() {
  const [cover, { upcoming, past }] = await Promise.all([getCover("events"), loadEvents()]);
  const total = upcoming.length + past.length;

  return (
    <>
      <PageHero
        eyebrow="Discover"
        title="Events"
        summary="Wellness talks, farm suppers, folk-music evenings and seasonal celebrations — open to resident guests."
        cover={cover}
      />

      <Section>
        <Container>
          {total === 0 ? (
            <div className="rounded-card border border-border bg-surface-muted px-6 py-16 text-center">
              <p className="font-heading text-2xl text-forest-800">No events listed yet</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Our seasonal programme of talks, suppers and celebrations will appear
                here. Resident guests also receive a weekly events sheet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {upcoming.length > 0 && (
                <div>
                  <SectionHeading eyebrow="What's on" title="Upcoming" />
                  <ul className="mt-8 flex flex-col gap-4">
                    {upcoming.map((e, i) => (
                      <EventCard key={e.id} e={e} delay={i * 0.04} />
                    ))}
                  </ul>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <SectionHeading eyebrow="Archive" title="Past events" />
                  <ul className="mt-8 flex flex-col gap-4">
                    {past.map((e, i) => (
                      <EventCard key={e.id} e={e} delay={i * 0.04} muted />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function EventCard({ e, delay, muted }: { e: EventRow; delay: number; muted?: boolean }) {
  const when = fmt({ start: e.starts_at, end: e.ends_at });
  return (
    <Reveal delay={delay}>
      <li
        className={
          "grid gap-5 overflow-hidden rounded-card border border-border bg-surface sm:grid-cols-[240px_1fr] " +
          (muted ? "opacity-80" : "")
        }
      >
        {e.media ? (
          <MediaImage item={toItem(e.media)} rounded={false} sizes="240px" className="aspect-[4/3] w-full sm:h-full" />
        ) : (
          <div className="hidden bg-sage-100 sm:block" aria-hidden />
        )}
        <div className="p-6 sm:py-7 sm:pr-7">
          {when ? (
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-terracotta-600">{when}</p>
          ) : null}
          <h3 className="mt-1.5 font-heading text-xl text-forest-800">{e.title}</h3>
          {e.location ? (
            <p className="mt-1 font-ui text-sm text-muted-foreground">{e.location}</p>
          ) : null}
          {e.description ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
          ) : null}
        </div>
      </li>
    </Reveal>
  );
}
