"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

/* ============================================================================
 * TheaterFloor — wooden stage floor that becomes visible AFTER the curtain
 * opens and disappears as the camera "flies forward" over it into space.
 *
 * Layer order (front → back):
 *   1. Hero overlay (title)        z-50
 *   2. VideoCurtain (curtain video) z-40
 *   3. TheaterFloor (wooden floor)  z-30  ← THIS
 *   4. RealisticCosmos (3D space)   z-10
 *
 * Floor timeline:
 *   scroll 0..0.15  → invisible (curtain closed, floor hidden by curtain)
 *   scroll 0.15..0.30 → fades in (curtain open, floor visible)
 *   scroll 0.30..0.60 → fades down/out (camera flies forward over the floor)
 *   scroll 0.60+    → invisible (we're in deep space)
 * ============================================================================ */

export function TheaterFloor({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Floor opacity: hidden while curtain closed, peaks at 0.25, gone by 0.55
  const opacity = useTransform(scrollYProgress, [0, 0.13, 0.25, 0.55], [0, 0, 1, 0]);
  // Floor Y position: starts at bottom, drifts down as camera flies forward
  const y = useTransform(scrollYProgress, [0.15, 0.60], ["0%", "80%"]);
  // Floor scale: subtle perspective zoom-out as we leave it behind
  const scale = useTransform(scrollYProgress, [0.15, 0.55], [1, 1.4]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[40vh]"
    >
      {/* === Wooden floor with planks === */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(60, 30, 14, 0) 0%,
              rgba(80, 45, 20, 0.6) 15%,
              rgba(110, 65, 30, 0.85) 35%,
              rgba(95, 55, 25, 0.95) 60%,
              rgba(70, 40, 18, 1) 100%
            )
          `,
        }}
      >
        {/* Plank seams — repeating vertical lines with subtle shading */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                to right,
                transparent 0,
                transparent 80px,
                rgba(0, 0, 0, 0.4) 80px,
                rgba(0, 0, 0, 0.4) 82px,
                transparent 82px,
                transparent 160px
              )
            `,
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
          }}
        />
        {/* Wood grain noise */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                to right,
                rgba(0,0,0,0.15) 0,
                rgba(0,0,0,0) 2px,
                rgba(255,200,150,0.05) 4px,
                rgba(0,0,0,0.10) 8px,
                rgba(0,0,0,0) 12px
              )
            `,
          }}
        />
        {/* Warm footlight glow from the front edge */}
        <div
          className="absolute inset-x-0 top-0 h-1/3"
          style={{
            background: "linear-gradient(to bottom, rgba(255,180,80,0.25) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* === Proscenium shadow at top of floor (where floor meets the stage opening) === */}
      <div
        className="absolute inset-x-0 top-0 h-12"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      />

      {/* === Subtle reflection sheen === */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(110deg, transparent 35%, rgba(255,220,150,0.10) 50%, transparent 65%)",
        }}
      />
    </motion.div>
  );
}
