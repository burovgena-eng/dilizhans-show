"use client";

import { motion, useTransform, MotionValue, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ============================================================================
 * VideoCurtain — uses the user-provided green-screen video of a red velvet
 * theater curtain opening. The green background is keyed out in the browser
 * using an SVG feColorMatrix filter, so the cosmos shows through the
 * transparent regions.
 *
 * The video plays in sync with scroll:
 *   - At scroll 0..0.08: video plays 0..100% (curtain closed → open)
 *   - At scroll 0.08..1: video stays at end frame (curtain fully open, off-screen)
 *
 * For smooth scroll sync, we use requestAnimationFrame to set video.currentTime.
 * ============================================================================ */

export function VideoCurtain({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const curtainX = useTransform(scrollYProgress, [0, 0.10], ["0%", "-110%"]);
  const curtainOpacity = useTransform(scrollYProgress, [0, 0.05, 0.10], [1, 1, 0]);

  // Sync video.currentTime to scroll progress (0..0.10 → 0..duration)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = videoRef.current;
      if (!v) return;
      const p = scrollYProgress.get();
      // Video plays during 0..0.10 of the journey, then stays at end
      const videoT = Math.min(p / 0.10, 1);
      const targetTime = videoT * v.duration;
      if (Math.abs(v.currentTime - targetTime) > 0.05) {
        try { v.currentTime = targetTime; } catch { /* seeking */ }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollYProgress]);

  return (
    <>
      {/* SVG chroma-key filter definition (hidden) */}
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <filter id="green-screen-key" colorInterpolationFilters="sRGB">
            {/* Drop green pixels (high G + low R + low B) → alpha 0 */}
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                -0.6 -1.4 -0.6 1 0
              "
            />
            {/* Slight blur to soften edges */}
            <feGaussianBlur stdDeviation="0.6" />
            {/* Re-threshold alpha */}
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.4" intercept="-0.05" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <motion.div
        ref={sectionRef}
        style={{ x: curtainX, opacity: curtainOpacity }}
        className="absolute inset-0 z-40 pointer-events-none"
      >
        <video
          ref={videoRef}
          src="/videos/curtain-green-screen.mp4"
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          style={{ filter: "url(#green-screen-key)" }}
        />
      </motion.div>
    </>
  );
}
