"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE_LUXE = [0.16, 1, 0.3, 1] as const;

/* ============================================================================
 * SectionReveal — wraps an entire section, fades + lifts it into view on scroll.
 *  - useInView(once: true, margin: "-100px") triggers when section is near top
 *  - Initial: opacity 0, y 60
 *  - Animate: opacity 1, y 0
 *  - Transition: duration 1.0, ease [0.16, 1, 0.3, 1]
 *  - Renders a motion.div wrapper (NOT a section element) so the inner section
 *    can keep its own id="..." for anchor navigation without nested-section
 *    semantics issues. The wrapper simply applies the scroll-triggered reveal.
 * ========================================================================== */
export function SectionReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, ease: EASE_LUXE }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
