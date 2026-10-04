"use client";

import { motion, MotionValue, useMotionValueEvent, useTransform } from "framer-motion";
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

// Hardcoded duration fallback — used if video.metadata doesn't load
// (which happens in some preview iframes where Range requests are
// blocked). Known from the source file:
// ffprobe duration=6.583333
const FALLBACK_DURATION = 6.583333;

// Some browsers (Chrome, Edge) support VideoElement.fastSeek — non-blocking
// seek that lets the browser pick the nearest keyframe for smoother scrub.
interface VideoElementWithFastSeek extends HTMLVideoElement {
  fastSeek?: (time: number) => void;
}

export function VideoCurtain({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  // Timeline:
  //   scroll 0..0.15   → curtain opens (video.currentTime 0 → duration)
  //   scroll 0.15..0.20 → pause (curtain fully open, nothing happens)
  //   scroll 0.20..0.45 → 3D fly-through: translateZ 0 → 2200px
  //                        (camera "flies past/through" the curtain)
  //                        + scale 1 → 1.4 + motion blur 0 → 14px
  //   scroll 0.45..0.50 → video fades out (now past the curtain)
  //
  // The 3D effect uses translateZ with perspective on the parent — this
  // gives a real "camera flying forward" feel, not just 2D zoom.
  const videoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.20, 0.45, 0.50], [1, 1, 1, 1, 0]);
  const videoTranslateZ = useTransform(scrollYProgress, [0.15, 0.20, 0.45], [0, 0, 2200]);
  const videoScale = useTransform(scrollYProgress, [0.15, 0.20, 0.45], [1, 1, 1.4]);
  const videoBlurAmount = useTransform(scrollYProgress, [0.20, 0.30, 0.45], [0, 6, 14]);
  const videoFilter = useTransform(videoBlurAmount, (b) => `blur(${b}px)`);

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

  // Helper: get effective duration. If the video metadata hasn't loaded
  // (duration=Infinity or NaN — happens in some preview iframes where
  // Range requests are blocked), use the hardcoded fallback so the curtain
  // still scrubs.
  const getDuration = (): number => {
    const v = videoRef.current;
    if (!v) return FALLBACK_DURATION;
    const d = v.duration;
    if (!d || !isFinite(d) || d <= 0) return FALLBACK_DURATION;
    return d;
  };

  // Helper: set video.currentTime from a 0..1 progress value.
  // Uses fastSeek if available (non-blocking, smoother) or currentTime as
  // fallback. Skips the seek if the video is already seeking — prevents
  // queue buildup that causes 200ms+ latency per seek.
  const seekTo = (t01: number) => {
    const v = videoRef.current;
    if (!v || v.seeking) return; // wait for current seek to finish
    const duration = getDuration();
    const targetTime = Math.min(Math.max(t01, 0), 1) * duration;
    if (Math.abs(v.currentTime - targetTime) > 0.01) {
      // fastSeek is non-blocking and lets the browser pick the nearest
      // keyframe — much smoother than currentTime for scrubbing.
      if (typeof (v as VideoElementWithFastSeek).fastSeek === "function") {
        try { (v as VideoElementWithFastSeek).fastSeek(targetTime); return; } catch {}
      }
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

    // loadedmetadata fires earlier than loadeddata/canplay — gives us
    // duration sooner so we can start scrubbing even before all frames load.
    if (v.readyState >= 1) {
      onLoaded();
    } else {
      v.addEventListener("loadedmetadata", onLoaded, { once: true });
      v.addEventListener("loadeddata", onLoaded, { once: true });
      v.addEventListener("canplay", onLoaded, { once: true });
    }
    // DO NOT call v.load() repeatedly — it resets the video element and
    // forces re-download, causing huge scrubbing latency (200ms+ per seek).
    // The browser loads the video automatically thanks to preload="auto".

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
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

  // Single RAF loop for sync — drives video.currentTime from window.scrollY
  // every frame. Uses window.scrollY directly so progress starts at the
  // FIRST scroll pixel, not after the sticky header has scrolled past.
  // Resilient to any framer-motion / React state issues — pure DOM measurement.
  // The `v.seeking` check inside seekTo prevents queue buildup (which was
  // causing 200ms+ latency per seek).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = videoRef.current;
      if (!v || v.seeking) return; // wait for current seek to finish
      const section = sectionRef.current || document.getElementById("top");
      if (!section) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, getScrollY() / total));
      seekTo(p / VIDEO_PLAY_RANGE);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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

      {/* Video "fly-through" effect:
          - Parent div: perspective 1000px (creates 3D space)
          - motion.div: translateZ 0 → 2200px (camera flies forward)
          - scale + blur for motion-blur feel
          Timeline:
            0..0.15  → curtain opens
            0.15..0.20 → pause (curtain fully open)
            0.20..0.45 → 3D fly-through
            0.45..0.50 → fade out */}
      <motion.div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: videoOpacity,
            z: videoTranslateZ,
            scale: videoScale,
            filter: videoFilter,
            transformStyle: "preserve-3d",
          }}
        >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          className={`h-full w-full object-cover ${ready ? "" : "opacity-0"}`}
          style={{ filter: "url(#green-screen-key)" }}
        >
          <source src="/videos/curtain-green-screen.webm" type="video/webm" />
          <source src="/videos/curtain-green-screen.mp4" type="video/mp4" />
        </video>
        </motion.div>
      </motion.div>

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
