"use client";

import { MotionValue, useMotionValueEvent } from "framer-motion";
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
 *       scroll 0.15 → currentTime duration (curtain fully open)
 *       scroll > 0.15 → stays at duration (curtain stays open)
 *   - Scrolling back up plays the video backward (curtain re-closes).
 *
 * Chroma key matrix: alpha = 2*R - 2*G + 2*B + A (key out pure green)
 * ============================================================================ */

// Range of scroll progress over which the video plays from closed → open.
const VIDEO_PLAY_RANGE = 0.15;

export function VideoCurtain({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  // Helper: set video.currentTime from a 0..1 progress value.
  const seekTo = (t01: number) => {
    const v = videoRef.current;
    if (!v || !v.duration || !isFinite(v.duration)) return;
    const targetTime = Math.min(Math.max(t01, 0), 1) * v.duration;
    if (Math.abs(v.currentTime - targetTime) > 0.03) {
      try { v.currentTime = targetTime; } catch { /* seeking */ }
    }
  };

  // Pause video initially + seek to 0 so first render shows closed curtain
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => {
      try { v.currentTime = 0; } catch {}
      v.pause();
      setReady(true);
      // Initialize: curtain closed at start
      seekTo(0);
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

  // Find the parent <section> so we can compute progress manually as a
  // fallback (in case framer-motion's scrollYProgress is delayed).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Walk up the DOM to find the nearest <section>
    let el: HTMLElement | null = v.parentElement;
    while (el && el.tagName !== "SECTION") {
      el = el.parentElement;
    }
    sectionRef.current = el as HTMLElement | null;
  }, []);

  // Primary sync: react to framer-motion scrollYProgress changes
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    seekTo(latest / VIDEO_PLAY_RANGE);
  });

  // Fallback sync: window scroll listener (in case framer-motion lags)
  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const v = videoRef.current;
      if (!section || !v) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      // Use window.scrollY directly so progress starts from the very first
      // scroll pixel (not after the sticky header has been scrolled past).
      const p = Math.max(0, Math.min(1, window.scrollY / total));
      seekTo(p / VIDEO_PLAY_RANGE);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Backup RAF loop — guarantees currentTime updates every frame, even if
  // motion value events are throttled or batched. Uses window.scrollY
  // directly (not rect.top) so progress starts at the FIRST scroll pixel,
  // not after the sticky header has scrolled past.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const section = sectionRef.current;
      const v = videoRef.current;
      if (!section || !v || !v.duration || !isFinite(v.duration)) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      // window.scrollY starts at 0 when page is at top, regardless of
      // sticky-header offset. This makes the curtain open from the very
      // first scroll wheel tick.
      const p = Math.max(0, Math.min(1, window.scrollY / total));
      const targetTime = (p / VIDEO_PLAY_RANGE) * v.duration;
      if (Math.abs(v.currentTime - targetTime) > 0.03) {
        try { v.currentTime = Math.min(targetTime, v.duration); } catch {}
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

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
