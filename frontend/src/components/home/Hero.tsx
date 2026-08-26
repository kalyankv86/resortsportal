"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { MediaItem } from "@/lib/media";
import { MediaImage } from "@/components/ui/MediaImage";
import { Button } from "@/components/ui/Button";
import { BookingWidget } from "@/components/layout/BookingWidget";
import { heroContent } from "@/content/home";

/**
 * Fullscreen cinematic hero. Uses the hero MediaItem as the backdrop (a looping
 * video source is dropped in here once the CUTM album provides one). Parallax on
 * the backdrop, floating leaf drift, staggered headline.
 */
export function Hero({ cover }: { cover: MediaItem }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden">
      <motion.div
        style={reduce ? undefined : { y, scale }}
        className="absolute inset-0"
      >
        <MediaImage
          item={cover}
          priority
          rounded={false}
          sizes="100vw"
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/40 via-forest-900/15 to-forest-900/78" />
      </motion.div>

      {/* floating leaves */}
      {!reduce &&
        [0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="animate-leaf pointer-events-none absolute text-sage-200/50"
            style={{
              left: `${12 + i * 22}%`,
              top: `${18 + (i % 2) * 40}%`,
              animationDelay: `${i * 2.4}s`,
            }}
            aria-hidden
          >
            <svg width="34" height="34" viewBox="0 0 32 32" fill="currentColor">
              <path d="M26 4C12 4 5 12 5 24c0 1.5.2 2.9.6 4.2C10 18 17 12 27 10c-3 6-9 11-19 13 2 1.9 5 3 8 3 8 0 13-6 13-15 0-4-1-7-3-10Z" />
            </svg>
          </span>
        ))}

      <motion.div
        style={reduce ? undefined : { opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1200px] flex-col justify-end px-5 pb-10 pt-32 sm:px-8 sm:pb-16"
      >
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-ui text-xs font-semibold uppercase tracking-[0.24em] text-ivory/80"
          >
            {heroContent.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-5xl leading-[1.02] text-ivory sm:text-6xl md:text-7xl lg:text-[5.25rem]"
          >
            {heroContent.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex flex-wrap gap-x-3 font-heading text-xl text-ivory/85 sm:text-2xl"
          >
            {heroContent.subtitle.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button href={heroContent.primaryCta.href} size="lg">
              {heroContent.primaryCta.label}
            </Button>
            <Button
              href={heroContent.secondaryCta.href}
              variant="glass"
              size="lg"
            >
              {heroContent.secondaryCta.label}
            </Button>
            <Button
              href={heroContent.tertiaryCta.href}
              variant="glass"
              size="lg"
            >
              {heroContent.tertiaryCta.label}
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <BookingWidget />
        </motion.div>
      </motion.div>
    </section>
  );
}
