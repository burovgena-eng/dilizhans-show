"use client";

import { MotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ============================================================================
 * VideoCurtain — uses the user-provided green-screen video of a red velvet
 * theater curtain opening. The green background is keyed out in the browser
 * using an SVG filter chain, so the cosmos shows through.
 *
 * Behavior:
 *   - Video stays in place (no transform on the wrapper).
 *   - video.currentTime is driven by scroll progress:
 *       scroll 0   → currentTime 0 (curtain closed)
 *       scroll 0.1 → currentTime duration (curtain fully open)
 *       scroll > 0.1 → stays at duration (curtain stays open)
 *   - Scrolling back up plays the video backward (curtain re-closes).
 *
 * Chroma key matrix: alpha = 2*R - 2*G + 2*B + A
 *   - Pure green (R=0, G=255, B=0):    alpha = 2*0 - 2*255 + 2*0 + 1 = -509  → 0 (transparent) ✓
 *   - Red velvet (R=200, G=20, B=20):  alpha = 2*200 - 2*20 + 2*20 + 1 = 401 → 1 (opaque) ✓
 *   - White (R=255, G=255, B=255):     alpha = 2*255 - 2*255 + 2*255 + 1 = 511 → 1 (opaque) ✓
 *   - Yellow (R=255, G=255, B=0):      alpha = 2*255 - 2*255 + 2*0 + 1 = 1 → 1 (opaque) ✓
 * ============================================================================ */

export function VideoCurtain({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // Pause video initially + seek to 0 so first render shows closed curtain
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => {
      try { v.currentTime = 0; } catch {}
      v.pause();
      setReady(true);
    };

    if (v.readyState >= 2) {
      onLoaded();
    } else {
      v.addEventListener("loadeddata", onLoaded, { once: true });
      v.addEventListener("canplay", onLoaded, { once: true });
    }
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
      // Video plays during 0..0.15 of the journey, then stays at end.
      // Scrolling back plays it in reverse — curtain re-closes.
      const videoT = Math.min(Math.max(p / 0.15, 0), 1);
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
          <filter id="green-screen-key" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
            {/* Compute alpha: alpha = 2*R - 2*G + 2*B + 1*A
                 Green → alpha very negative (transparent)
                 Red   → alpha positive (opaque) */}
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                2 -2 2 1 0
              "
            />
            {/* Soften alpha edges */}
            <feGaussianBlur in="alpha" stdDeviation="0.5" />
            {/* Re-threshold: ensure opaque pixels stay opaque, transparent stay
                transparent, with smooth anti-aliased transition */}
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0 0.05 0.5 1 1 1" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Video stays in place — its currentTime drives the curtain open/close.
          No translateX, no opacity transform. */}
      <div className={`absolute inset-0 z-40 pointer-events-none ${ready ? "" : "opacity-0"}`}>
        <video
          ref={videoRef}
          src="/videos/curtain-green-screen.mp4"
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          className="h-full w-full object-cover"
          style={{ filter: "url(#green-screen-key)" }}
        />
      </div>
    </>
  );
}
