import type { Metadata } from "next";
import { api } from "@/lib/api";
import { getCover, type MediaItem } from "@/lib/media";
import { PageHero } from "@/components/page/PageHero";
import { Container, Section } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from Centurion Wellness Eco Tourism — the campus, the forest, therapies and the farm.",
  alternates: { canonical: "/gallery" },
};

export const revalidate = 60;

interface GalleryImage {
  id: number;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

async function loadGallery(): Promise<GalleryImage[]> {
  try {
    const res = await api<{ data: GalleryImage[] }>("/gallery", { revalidate: 60 });
    return res.data ?? [];
  } catch {
    return [];
  }
}

function toItem(g: GalleryImage): MediaItem {
  return {
    id: `gallery-${g.id}`,
    category: "gallery",
    src: g.url,
    width: g.width ?? 1600,
    height: g.height ?? 1200,
    alt: g.alt ?? "Centurion Wellness Eco Tourism",
  };
}

export default async function GalleryPage() {
  const [cover, images] = await Promise.all([getCover("drone"), loadGallery()]);

  return (
    <>
      <PageHero
        eyebrow="Discover"
        title="Gallery"
        summary="The campus and its surroundings through the seasons — architecture, forest, therapies and the organic farm."
        cover={cover}
      />

      <Section>
        <Container>
          {images.length === 0 ? (
            <div className="rounded-card border border-border bg-surface-muted px-6 py-16 text-center">
              <p className="font-heading text-2xl text-forest-800">Photographs coming soon</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                We are putting together a gallery of the campus, the forest and the
                wellness centre. Please check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((g, i) => (
                <Reveal key={g.id} delay={(i % 8) * 0.04}>
                  <MediaImage
                    item={toItem(g)}
                    sizes="(max-width:640px) 50vw, 25vw"
                    className={i % 5 === 0 ? "aspect-square w-full" : "aspect-[3/4] w-full"}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
