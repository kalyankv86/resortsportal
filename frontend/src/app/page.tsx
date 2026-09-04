import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { BentoShowcase } from "@/components/home/BentoShowcase";
import { ReviewsStrip } from "@/components/home/ReviewsStrip";
import { HomeCta } from "@/components/home/HomeCta";
import { getCover } from "@/lib/media";

export default async function HomePage() {
  // Same hero image as the Wellness Stay page (getCover("rooms")).
  const heroCover = await getCover("rooms");

  return (
    <>
      <Hero cover={heroCover} />
      <StatsBar />
      <BentoShowcase />
      <ReviewsStrip />
      <HomeCta />
    </>
  );
}
