import { Container, Section } from "@/components/ui/primitives";
import { StatRow } from "@/components/ui/Stat";
import { stats } from "@/content/home";

export function StatsBar() {
  return (
    <Section className="py-16 sm:py-20">
      <Container>
        <div className="rounded-card border border-border bg-surface px-6 py-12 shadow-soft sm:px-12">
          <StatRow items={stats} />
        </div>
      </Container>
    </Section>
  );
}
