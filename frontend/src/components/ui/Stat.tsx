"use client";

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

function Counter({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function StatRow({ items }: { items: StatItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.08 }}
          className="flex flex-col gap-1"
        >
          <dd className="font-heading text-4xl text-forest-700 sm:text-5xl">
            <Counter value={s.value} suffix={s.suffix} />
          </dd>
          <dt className="font-ui text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {s.label}
          </dt>
        </motion.div>
      ))}
    </dl>
  );
}
