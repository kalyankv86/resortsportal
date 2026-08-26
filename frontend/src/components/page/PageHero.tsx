import Link from "next/link";
import type { MediaItem } from "@/lib/media";
import { MediaImage } from "@/components/ui/MediaImage";
import { Container } from "@/components/ui/primitives";

export function PageHero({
  eyebrow,
  title,
  summary,
  cover,
  parent,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  cover: MediaItem;
  parent?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <MediaImage item={cover} rounded={false} priority sizes="100vw" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/82 via-forest-900/74 to-forest-900/88" />
      </div>

      <Container className="relative z-10 pb-14 pt-40 sm:pb-20 sm:pt-52">
        <nav className="mb-6 flex flex-wrap items-center gap-2 font-ui text-xs text-ivory/70">
          <Link href="/" className="hover:text-ivory">Home</Link>
          <span aria-hidden>/</span>
          {parent ? (
            <>
              <Link href={parent.href} className="hover:text-ivory">{parent.label}</Link>
              <span aria-hidden>/</span>
            </>
          ) : null}
          <span className="text-ivory">{title}</span>
        </nav>

        <p className="eyebrow text-sage-200">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/85 sm:text-lg">
          {summary}
        </p>
      </Container>
    </section>
  );
}
