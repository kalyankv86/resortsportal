import { Container, Section } from "@/components/ui/primitives";
import { MediaImage } from "@/components/ui/MediaImage";
import { Button } from "@/components/ui/Button";
import { getCover } from "@/lib/media";

export async function HomeCta() {
  const cover = await getCover("drone");

  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-card p-10 text-ivory shadow-lift sm:p-16">
          <MediaImage
            item={cover}
            rounded={false}
            sizes="100vw"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-forest-900/72" />
          <div className="relative z-10 max-w-2xl">
            <p className="eyebrow text-sage-200">Begin your retreat</p>
            <h2 className="mt-3 text-4xl leading-tight text-ivory sm:text-5xl">
              Your body already knows the way home.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/80 sm:text-lg">
              Speak with a wellness advisor, or reserve your dates now and
              complete the medical questionnaire online before you arrive.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/book-now" size="lg">
                Book Wellness Stay
              </Button>
              <Button href="/contact" variant="glass" size="lg">
                Talk to an Advisor
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
