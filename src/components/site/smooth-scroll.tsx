"use client";

import { ReactLenis } from "lenis/react";
import { type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.4,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        // easeInOutQuad for premium feel
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // disable on reduced-motion preference
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
