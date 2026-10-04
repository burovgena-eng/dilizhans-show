"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ============================================================================
 * VideoCurtain — uses the user-provided green-screen video of a red velvet
 * theater curtain opening. The green background is keyed out in the browser
 * using an SVG feColorMatrix filter, so the cosmos shows through.
 *
 * Sync:
 *   - At scroll 0..0.10: video plays 0..100% (curtain closed → open)
 *   - The video element loads at once, paused at frame 0 so the first
 *     scrollable frame shows the closed curtain
 *   - We set currentTime imperatively each frame to drive the playback
 *     from scroll position (video is never auto-playing)
 * ============================================================================ */

export function VideoCurtain({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const curtainX = useTransform(scrollYProgress, [0, 0.12], ["0%", "-115%"]);
  const curtainOpacity = useTransform(scrollYProgress, [0, 0.05, 0.12], [1, 1, 0]);

  // Pause video initially + seek to 0 (so first render shows closed curtain)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => {
      try {
        v.currentTime = 0;
      } catch {}
      v.pause();
      setReady(true);
    };

    if (v.readyState >= 2) {
      onLoaded();
    } else {
      v.addEventListener("loadeddata", onLoaded, { once: true });
      v.addEventListener("canplay", onLoaded, { once: true });
    }
    // Try to load first frame
    try { v.load(); } catch {}

    return () => {
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("canplay", onLoaded);
    };
  }, []);

  // Drive video.currentTime from scroll progress
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = videoRef.current;
      if (!v || !v.duration || !isFinite(v.duration)) return;
      const p = scrollYProgress.get();
      // Video plays during 0..0.10 of the journey, then stays at end
      const videoT = Math.min(Math.max(p / 0.10, 0), 1);
      const targetTime = videoT * v.duration;
      if (Math.abs(v.currentTime - targetTime) > 0.03) {
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
                -0.7 -1.6 -0.7 1 0
              "
            />
            <feGaussianBlur stdDeviation="0.7" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.5" intercept="-0.05" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <motion.div
        style={{ x: curtainX, opacity: curtainOpacity }}
        className={`absolute inset-0 z-40 pointer-events-none ${ready ? "" : "opacity-0"}`}
      >
        <video
          ref={videoRef}
          src="/videos/curtain-green-screen.mp4"
          muted
          playsInline
          preload="auto"
          // Important: don't auto-play; we drive currentTime from scroll
          autoPlay={false}
          className="h-full w-full object-cover"
          style={{ filter: "url(#green-screen-key)" }}
        />
      </motion.div>
    </>
  );
}
