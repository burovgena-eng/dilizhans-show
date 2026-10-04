"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";

const SPRING_TILT = { stiffness: 100, damping: 25, mass: 0.5 };
const SPRING_MAGNETIC = { stiffness: 120, damping: 18, mass: 0.4 };
const EASE_LUXE = [0.16, 1, 0.3, 1] as const;

/* ============================================================================
 * TiltCard — 3D hover tilt that follows the cursor. Jitter-free version:
 *  - Rotation clamped to ±8° (intensity default 8)
 *  - 10% edge deadzone (cursor in outer 10% snaps to edge value, no spike)
 *  - Spring (stiffness 100, damping 25, mass 0.5) smooths both enter + leave
 *  - On mouseleave, rx/ry animate to 0 via the spring (no instant reset)
 *  - Removed the radial gold glow overlay (was adding to the "kasha" feel)
 *  - No-op on touch / coarse pointer devices (no mousemove)
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
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const rotateX = useSpring(rx, SPRING_TILT);
  const rotateY = useSpring(ry, SPRING_TILT);

  const handleMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!fine || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let px = (e.clientX - rect.left) / Math.max(rect.width, 1);
    let py = (e.clientY - rect.top) / Math.max(rect.height, 1);

    // 10% edge deadzone — clamp cursor position so it can't spike at the
    // very edge of the card. Outside [0.1, 0.9] snaps to 0.1 or 0.9.
    const dz = 0.1;
    px = Math.min(1 - dz, Math.max(dz, px));
    py = Math.min(1 - dz, Math.max(dz, py));

    // (0.5 - py) ∈ [-0.4, 0.4] → × 2 = [-0.8, 0.8] × intensity(8) = ±6.4°
    // (px - 0.5) ∈ [-0.4, 0.4] → × 2 = [-0.8, 0.8] × intensity(8) = ±6.4°
    // Always within ±8° clamp — no jitter spikes.
    rx.set((0.5 - py) * intensity * 2);
    ry.set((px - 0.5) * intensity * 2);
  };

  const handleLeave = () => {
    // Animate back to 0 via the spring (smooth, not instant).
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={fine ? handleMove : undefined}
        onMouseLeave={fine ? handleLeave : undefined}
        style={{
          rotateX: fine ? rotateX : 0,
          rotateY: fine ? rotateY : 0,
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ============================================================================
 * MagneticButton — element attracts toward the cursor on hover by a small
 * translateX/Y based on distance from the element's center. Smoother spring,
 * stronger pull (0.4 default). Disabled on touch devices via mediaQuery.
 * Polymorphic: can render <a>, <button>, or <div>.
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
  strength = 0.4,
  onClick,
  ...rest
}: MagneticButtonProps) {
  const innerRef = useRef<HTMLElement | null>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx: MotionValue<number> = useSpring(x, SPRING_MAGNETIC);
  const sy: MotionValue<number> = useSpring(y, SPRING_MAGNETIC);

  const handleMove: MouseEventHandler<HTMLElement> = (e) => {
    const el = innerRef.current;
    if (!el || !fine) return;
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
    style: fine ? { x: sx, y: sy } : undefined,
    onMouseMove: fine ? handleMove : undefined,
    onMouseLeave: fine ? handleLeave : undefined,
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
 * Reveal — generic scroll-triggered reveal wrapper. Fades + slides children
 * upward when they scroll into view. (clipPath was removed — it was clipping
 * hover children like dropdowns / lightboxes that escaped the card bounds.)
 * Initial: opacity 0, y {default 30}
 * Animate: opacity 1, y 0
 * Transition: duration 0.9, ease [0.16, 1, 0.3, 1], {delay}
 * ========================================================================== */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: EASE_LUXE, delay }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================================
 * Counter — animated number counter that counts up from 0 to target value
 * when scrolled into view. Uses framer-motion's imperative `animate()`.
 * Renders the value formatted with `toLocaleString('ru-RU')` + suffix.
 * Supports decimals (e.g. to={4.9}) — fixed to 1 decimal place.
 * ========================================================================== */
export function Counter({
  to,
  duration = 2,
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  const isDecimal = !Number.isInteger(to);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE_LUXE,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  const formatted = isDecimal
    ? display.toFixed(1).replace(".", ",")
    : Math.round(display).toLocaleString("ru-RU");

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
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
 * ScrollProgress — top-of-page gold progress bar. Fixed at top, width grows
 * from 0% to 100% as the user scrolls down. Using width % (instead of scaleX)
 * avoids the gradient distortion artifact that happens when the bar is very
 * narrow. Outer container is the empty track (bg-gold/8); inner bar has no
 * box-shadow. The whole bar also fades in between 2% and 4% scroll so it
 * doesn't flash at the very top of the page.
 * ========================================================================== */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    mass: 0.4,
  });

  // Clamp to [0, 1] — protects against any overshoot from the spring / iOS
  // rubber-band scroll.
  const clamped = useTransform(progress, (v) => Math.max(0, Math.min(1, v)));
  const widthPct = useTransform(clamped, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(clamped, [0, 0.02, 0.04, 1], [0, 0, 1, 1]);

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[100] h-0.5 w-full bg-gold/8"
    >
      <motion.div
        style={{ width: widthPct, opacity }}
        className="h-full bg-gradient-to-r from-gold-bright via-gold to-gold-deep"
      />
    </motion.div>
  );
}
