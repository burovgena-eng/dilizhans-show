"use client";

import { MotionValue, useTransform, motion } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";

/* ============================================================================
 * ImageCurtain — 2K-quality curtain with 60fps scrubbing.
 *
 * Uses 158 pre-extracted WebP frames (with chroma-key alpha pre-applied via
 * ffmpeg) instead of scrubbing a video element. Browsers cache the decoded
 * images, so changing `img.src` to a previously-fetched frame is instant
 * (<1ms) — no decode latency, no keyframe seeking, no SVG filter artifacts.
 *
 * Timeline (driven by scrollYProgress):
 *   0..0.15   → curtain opens (frame 0 → frame 157)
 *   0.15..0.20 → pause (curtain fully open)
 *   0.20..0.25 → 3D fly-through: translateZ 0 → 2200px + scale + blur
 *   0.25..0.30 → fade out (curtain exits frame, theater scene begins)
 *
 * Frames are preloaded on mount via new Image() — once cached by the
 * browser, scrubbing runs at 60fps with zero decode cost.
 * ============================================================================ */

const FRAME_COUNT = 158;
const FRAME_DIR = "/images/curtain-frames";
const FRAME_PATTERN = (n: number) => `${FRAME_DIR}/frame_${String(n).padStart(3, "0")}.webp`;

// Range of scroll progress over which the curtain opens.
const CURTAIN_OPEN_RANGE = 0.15;

export function ImageCurtain({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [allFramesLoaded, setAllFramesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  // Build list of all frame URLs once.
  const frameUrls = useMemo(
    () => Array.from({ length: FRAME_COUNT }, (_, i) => FRAME_PATTERN(i + 1)),
    []
  );

  // Preload all frames into the browser cache. This is the secret to
  // 60fps scrubbing — once an image is in cache, swapping src is instant.
  useEffect(() => {
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];
    frameUrls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded >= FRAME_COUNT) setAllFramesLoaded(true);
      };
      imgs.push(img);
    });
    return () => {
      // Allow GC of preloaded Image objects (browser keeps cache for src URLs)
      imgs.length = 0;
    };
  }, [frameUrls]);

  // "Fly-through" effect: after the curtain opens, the image zooms in and
  // moves forward via translateZ (3D) so it feels like the camera flies
  // through the curtain.
  const imgOpacity = useTransform(scrollYProgress, [0, 0.15, 0.20, 0.25, 0.30], [1, 1, 1, 0.7, 0]);
  const imgTranslateZ = useTransform(scrollYProgress, [0.15, 0.20, 0.25], [0, 0, 2200]);
  const imgScale = useTransform(scrollYProgress, [0.15, 0.20, 0.25], [1, 1, 1.4]);
  const imgBlurAmount = useTransform(scrollYProgress, [0.20, 0.22, 0.25], [0, 6, 12]);
  const imgFilter = useTransform(imgBlurAmount, (b) => `blur(${b}px)`);

  // Find the parent <section> for scroll-progress calculation.
  const sectionRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    sectionRef.current = document.getElementById("top");
  }, []);

  // Get scroll position from multiple sources (iframe safety).
  const getScrollY = (): number => {
    return Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0,
      document.scrollingElement?.scrollTop || 0,
    );
  };

  // RAF loop: compute target frame from scroll position and set img.src.
  // Because all frames are preloaded, src change is instant (no decode).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const img = imgRef.current;
      if (!img) return;
      const section = sectionRef.current || document.getElementById("top");
      if (!section) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, getScrollY() / total));
      // Map scroll progress to frame number.
      // 0..CURTAIN_OPEN_RANGE → frames 0..157
      // > CURTAIN_OPEN_RANGE → stays at frame 157 (curtain fully open)
      const frameT = Math.min(p / CURTAIN_OPEN_RANGE, 1);
      const frameIdx = Math.min(FRAME_COUNT - 1, Math.floor(frameT * FRAME_COUNT));
      const targetSrc = frameUrls[frameIdx];
      if (img.src.endsWith(targetSrc)) return; // already showing this frame
      img.src = targetSrc;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frameUrls]);

  return (
    <>
      {/* Loading progress badge (bottom-left, dev-only). Shows how many
          frames are cached. Once all 158 are loaded, scrubbing is instant. */}
      {!allFramesLoaded && (
        <div
          className="fixed bottom-2 left-2 z-[100] rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-emerald-400 pointer-events-none"
          aria-hidden
        >
          loading frames: {loadedCount}/{FRAME_COUNT}
        </div>
      )}

      {/* Image curtain with 3D fly-through effect. Parent has perspective
          so child translateZ creates real depth. */}
      <motion.div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{ perspective: 1000 }}
      >
        <motion.img
          ref={imgRef}
          src={frameUrls[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{
            opacity: imgOpacity,
            z: imgTranslateZ,
            scale: imgScale,
            filter: imgFilter,
            transformStyle: "preserve-3d",
          }}
        />
      </motion.div>
    </>
  );
}
