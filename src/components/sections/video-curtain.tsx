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

  // Helper: get scroll position from multiple sources. In some preview
  // iframes, window.scrollY is always 0 — we fall back to other sources.
  const getScrollY = (): number => {
    return Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0,
      document.scrollingElement?.scrollTop || 0,
    );
  };

  // Helper: set video.currentTime from a 0..1 progress value.
  // Lower threshold (0.01) for smoother scrubbing — every scroll tick
  // nudges the video forward by a tiny amount instead of waiting for big jumps.
  const seekTo = (t01: number) => {
    const v = videoRef.current;
    if (!v || !v.duration || !isFinite(v.duration)) return;
    const targetTime = Math.min(Math.max(t01, 0), 1) * v.duration;
    if (Math.abs(v.currentTime - targetTime) > 0.01) {
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
    // Also try by id — CinematicHero section has id="top"
    if (!sectionRef.current) {
      sectionRef.current = document.getElementById("top") as HTMLElement | null;
    }
  }, []);

  // Primary sync: react to framer-motion scrollYProgress changes
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    seekTo(latest / VIDEO_PLAY_RANGE);
  });

  // Fallback sync: window scroll listener (in case framer-motion lags).
  // Also listens on `window.parent` in case the preview iframe itself is
  // not the scroll container (the parent window scrolls instead).
  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const v = videoRef.current;
      if (!section || !v) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      // Multi-source scrollY (preview iframe safety)
      const p = Math.max(0, Math.min(1, getScrollY() / total));
      seekTo(p / VIDEO_PLAY_RANGE);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    // Try parent window (preview iframe case)
    try {
      if (window.parent && window.parent !== window) {
        window.parent.addEventListener("scroll", onScroll, { passive: true });
      }
    } catch { /* cross-origin parent — skip */ }
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      try {
        if (window.parent && window.parent !== window) {
          window.parent.removeEventListener("scroll", onScroll);
        }
      } catch {}
    };
  }, []);

  // Backup RAF loop — guarantees currentTime updates every frame. Uses
  // window.scrollY directly so progress starts at the FIRST scroll pixel,
  // not after the sticky header has scrolled past. Resilient to any
  // framer-motion / React state issues — pure DOM measurement.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = videoRef.current;
      if (!v || !v.duration || !isFinite(v.duration)) return;
      // Find Hero section — use document.getElementById for reliability
      const section = sectionRef.current || document.getElementById("top");
      if (!section) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, getScrollY() / total));
      const targetTime = (p / VIDEO_PLAY_RANGE) * v.duration;
      if (Math.abs(v.currentTime - targetTime) > 0.01) {
        try { v.currentTime = Math.min(targetTime, v.duration); } catch {}
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // setInterval fallback — also drives video sync at 60Hz regardless of
  // React lifecycle. Belt-and-suspenders: even if RAF is throttled by the
  // browser (background tab), or HMR keeps reloading the component, this
  // interval keeps the curtain scrub-locked to scroll.
  useEffect(() => {
    const id = window.setInterval(() => {
      const v = videoRef.current;
      if (!v || !v.duration || !isFinite(v.duration)) return;
      const section = document.getElementById("top");
      if (!section) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, getScrollY() / total));
      const targetTime = (p / VIDEO_PLAY_RANGE) * v.duration;
      if (Math.abs(v.currentTime - targetTime) > 0.01) {
        try { v.currentTime = Math.min(targetTime, v.duration); } catch {}
      }
    }, 16); // ~60fps
    return () => window.clearInterval(id);
  }, []);

  // Visual debug badge — shows scrollY and videoTime in real-time.
  // Tiny, fixed bottom-left, only visible during dev. Helps diagnose
  // whether scroll events reach the component and whether video scrubbing
  // works in the preview iframe.
  const [debugInfo, setDebugInfo] = useState("");
  useEffect(() => {
    const id = window.setInterval(() => {
      const v = videoRef.current;
      const section = document.getElementById("top");
      const sy = getScrollY();
      const ct = v ? v.currentTime.toFixed(2) : "?";
      const sh = section ? section.offsetHeight : 0;
      const vh = window.innerHeight;
      const p = sh > vh ? Math.max(0, Math.min(1, sy / (sh - vh))) : 0;
      setDebugInfo(`scroll=${sy} t=${ct}/${v?.duration?.toFixed(1) ?? "?"} p=${(p * 100).toFixed(0)}%`);
    }, 100);
    return () => window.clearInterval(id);
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
            {/* Re-threshold: ensure opaque pixels stay opaque, transparent stay
                transparent, with smooth anti-aliased transition. No blur —
                keep maximum sharpness for the 2K video. */}
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0 0.02 0.5 1 1 1" />
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

      {/* Debug badge — visible bottom-left. When you scroll, the numbers
          should change. If they don't, scroll events aren't reaching this
          component (preview iframe sandbox issue). */}
      <div
        className="fixed bottom-2 left-2 z-[100] rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-emerald-400 pointer-events-none"
        aria-hidden
      >
        {debugInfo || "loading..."}
      </div>
    </>
  );
}
