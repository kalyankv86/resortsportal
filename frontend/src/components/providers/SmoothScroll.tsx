"use client";

import { ReactLenis } from "lenis/react";
import type { PropsWithChildren } from "react";

/**
 * Lenis smooth scroll. Respects prefers-reduced-motion (Lenis auto-disables
 * wheel smoothing when the OS setting is on via the `prevent` + duration tuning
 * below is kept gentle for a luxury feel).
 */
export function SmoothScroll({ children }: PropsWithChildren) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
