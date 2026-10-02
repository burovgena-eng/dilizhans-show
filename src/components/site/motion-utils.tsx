"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  type MotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from "react";

const SPRING_TILT = { stiffness: 150, damping: 20 };
const SPRING_MAGNETIC = { stiffness: 200, damping: 15 };
const EASE_LUXE = [0.16, 1, 0.3, 1] as const;

/* ============================================================================
 * TiltCard — 3D hover tilt that follows the cursor, with a gold glow trail.
 * Wrapper provides perspective; inner motion.div rotates on X/Y axes via
 * useSpring (smooth lag). A radial gold gradient overlays the card, moving
 * with the cursor for a subtle highlight.
 * ========================================================================== */
export function TiltCard({
  children,
  className,
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const rotateX = useSpring(rx, SPRING_TILT);
  const rotateY = useSpring(ry, SPRING_TILT);
  const glowX = useSpring(gx, SPRING_TILT);
  const glowY = useSpring(gy, SPRING_TILT);

  const glow = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(201,169,97,0.18) 0%, transparent 55%)`;

  const handleMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const py = (e.clientY - rect.top) / Math.max(rect.height, 1);
    rx.set((0.5 - py) * intensity * 2);
    ry.set((px - 0.5) * intensity * 2);
    gx.set(Math.max(0, Math.min(100, px * 100)));
    gy.set(Math.max(0, Math.min(100, py * 100)));
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  };

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: glow }}
          className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light"
        />
      </motion.div>
    </div>
  );
}

/* ============================================================================
 * MagneticButton — element attracts toward the cursor on hover by a small
 * translateX/Y based on distance from the element's center. Polymorphic:
 * can render <a>, <button>, or <div>. Reset to 0 on mouse leave.
 * ========================================================================== */
type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  as?: "button" | "a" | "div";
  href?: string;
  strength?: number;
  onClick?: MouseEventHandler<HTMLElement>;
  "aria-label"?: string;
  target?: string;
  rel?: string;
};

export function MagneticButton({
  children,
  className,
  as = "button",
  href,
  strength = 0.3,
  onClick,
  ...rest
}: MagneticButtonProps) {
  const innerRef = useRef<HTMLElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx: MotionValue<number> = useSpring(x, SPRING_MAGNETIC);
  const sy: MotionValue<number> = useSpring(y, SPRING_MAGNETIC);

  const handleMove: MouseEventHandler<HTMLElement> = (e) => {
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const common = {
    className,
    style: { x: sx, y: sy },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onClick,
  } as const;

  if (as === "a" || (href && as !== "div")) {
    return (
      <motion.a
        ref={(node: HTMLAnchorElement | null) => {
          innerRef.current = node;
        }}
        href={href}
        {...common}
        {...rest}
      >
        {children}
      </motion.a>
    );
  }
  if (as === "div") {
    return (
      <motion.div
        ref={(node: HTMLDivElement | null) => {
          innerRef.current = node;
        }}
        {...common}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.button
      ref={(node: HTMLButtonElement | null) => {
        innerRef.current = node;
      }}
      type="button"
      {...common}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ============================================================================
 * RevealText — scroll-triggered text reveal with clip-path.
 * Wraps inline text in a span with overflow-hidden; animates clip-path from
 * inset(0 100% 0 0) [text hidden from right] to inset(0 0 0 0) [revealed]
 * when the element enters the viewport (once: true, margin: -50px).
 * ========================================================================== */
export function RevealText({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
    >
      <motion.span
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
        transition={{ duration: 0.9, ease: EASE_LUXE, delay }}
        style={{ display: "inline-block" }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ============================================================================
 * Confetti — gold confetti burst. When `trigger` flips true, 30 gold squares
 * explode outward from the center in random directions, fading out after 1.5s.
 * Pieces are positioned absolute center, animated via x/y/rotate/scale, and
 * removed from the tree via AnimatePresence after the burst.
 * ========================================================================== */
type ConfettiPiece = {
  id: number;
  x: number;
  y: number;
  rot: number;
  dur: number;
  size: number;
  delay: number;
};

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!trigger) {
      return;
    }
    const N = 30;
    const fresh = Array.from({ length: N }).map((_, i) => {
      const angle = (i / N) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 100 + Math.random() * 200;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 60,
        rot: Math.random() * 720 - 360,
        dur: 1.2 + Math.random() * 0.4,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.1,
      } satisfies ConfettiPiece;
    });
    // Defer setState to a frame so it isn't called synchronously inside the
    // effect body (react-hooks/set-state-in-effect).
    const raf = requestAnimationFrame(() => setPieces(fresh));
    const t = setTimeout(() => setPieces([]), 1700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      setPieces([]);
    };
  }, [trigger]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center"
      aria-hidden
    >
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: 0,
              rotate: p.rot,
              scale: 0.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.dur, ease: "easeOut", delay: p.delay }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              background:
                "linear-gradient(135deg, #E6C775 0%, #C9A961 50%, #8A6F2F 100%)",
              borderRadius: 1,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================================
 * ScrollProgress — top-of-page gold progress bar. Fixed at top, scaled on X
 * axis by the page's scroll progress. Spring-smoothed for a luxe feel.
 * ========================================================================== */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    mass: 0.4,
  });

  const barStyle: CSSProperties = {
    transformOrigin: "0%",
  };

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, ...barStyle }}
      className="fixed left-0 top-0 z-[100] h-0.5 w-full bg-gradient-to-r from-gold-bright via-gold to-gold-deep shadow-[0_2px_12px_rgba(201,169,97,0.45)]"
    />
  );
}
