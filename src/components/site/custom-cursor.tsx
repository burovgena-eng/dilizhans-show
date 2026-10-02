"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/* ============================================================================
 * CustomCursor — luxury gold dot that follows the cursor with spring lag.
 * On touch devices the component renders nothing (we keep the native cursor).
 * On hover over interactive elements (a, button, [data-cursor="hover"], input,
 * textarea, [role="button"]) the dot scales up and becomes a hollow ring.
 * Rendered via portal to document.body so it floats above all content.
 * The native browser cursor remains visible — this is an enhancement, not a
 * replacement.
 * ========================================================================== */
export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Disable on touch / coarse-pointer devices (mobile, tablet).
    if (window.matchMedia("(pointer: coarse)").matches) return;
    // Defer setState to a microtask so it isn't called synchronously inside
    // the effect body (react-hooks/set-state-in-effect).
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      setEnabled(true);
    });

    const HOVER_SELECTOR =
      "a, button, [data-cursor='hover'], input, textarea, [role='button'], label[for], select, summary";

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      if (t && t.closest(HOVER_SELECTOR)) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };

    const onLeave = () => {
      x.set(-100);
      y.set(-100);
      setHovering(false);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  if (!mounted || !enabled) return null;

  return createPortal(
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
    >
      <motion.div
        animate={{
          width: hovering ? 34 : 8,
          height: hovering ? 34 : 8,
          backgroundColor: hovering
            ? "rgba(201,169,97,0)"
            : "rgba(201,169,97,0.85)",
          borderWidth: hovering ? 1.5 : 0,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        style={{
          borderRadius: 9999,
          borderColor: "rgba(201,169,97,0.9)",
          borderStyle: "solid",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </motion.div>,
    document.body,
  );
}
