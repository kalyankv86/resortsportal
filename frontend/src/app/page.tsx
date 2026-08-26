import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { BentoShowcase } from "@/components/home/BentoShowcase";
import { ExperiencesStrip } from "@/components/home/ExperiencesStrip";
import { ReviewsStrip } from "@/components/home/ReviewsStrip";
import { HomeCta } from "@/components/home/HomeCta";
import { getCover } from "@/lib/media";

export default async function HomePage() {
  const heroCover = await getCover("hero");

  return (
    <>
      <Hero cover={heroCover} />
      <StatsBar />
      <BentoShowcase />
      <ExperiencesStrip />
      <ReviewsStrip />
      <HomeCta />
    </>
  );
}
