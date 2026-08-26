import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70svh] flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow text-terracotta">Lost in the forest</p>
      <h1 className="mt-4 text-5xl text-forest-800 sm:text-6xl">Page not found</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The trail you followed doesn&rsquo;t lead anywhere. Let&rsquo;s get you back to
        somewhere restful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Return home</Button>
        <Button href="/wellness-programs" variant="secondary">
          Explore programmes
        </Button>
      </div>
    </Container>
  );
}
