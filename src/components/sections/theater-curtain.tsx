"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { useRef, useEffect } from "react";

/* ============================================================================
 * TheaterCurtain — velvet theater curtains (Bolshoi-style).
 *
 * Two halves (left + right) that sway gently via SVG displacement filter,
 * then part open on scroll. Each half is a vertical bar with pleated
 * gradient + gold trim, rendered with CSS for max performance.
 * ============================================================================ */

export function TheaterCurtain({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Curtain open: 0..0.08 → translateX 0 → ±50% (fully open at 0.08)
  const leftX = useTransform(scrollYProgress, [0, 0.06, 0.08], ["0%", "-101%", "-101%"]);
  const rightX = useTransform(scrollYProgress, [0, 0.06, 0.08], ["0%", "101%", "101%"]);

  // Velvet swaying motion (always active)
  const swayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.016;
      if (swayRef.current) {
        const sway = Math.sin(t * 0.6) * 1.5;
        const sway2 = Math.sin(t * 0.4 + 1.3) * 0.8;
        swayRef.current.style.transform = `skewX(${sway * 0.3}deg) translateY(${sway2}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={swayRef}
      className="absolute inset-0 z-30 pointer-events-none"
      style={{ willChange: "transform" }}
    >
      {/* LEFT half */}
      <motion.div
        style={{ x: leftX }}
        className="absolute inset-y-0 left-0 w-1/2"
        aria-hidden
      >
        <CurtainSide side="left" />
      </motion.div>

      {/* RIGHT half */}
      <motion.div
        style={{ x: rightX }}
        className="absolute inset-y-0 right-0 w-1/2"
        aria-hidden
      >
        <CurtainSide side="right" />
      </motion.div>

      {/* Top valance (pelmet) — gold-trimmed, sways too */}
      <motion.div
        style={{
          y: useTransform(scrollYProgress, [0, 0.08], ["0%", "-100%"]),
          opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]),
        }}
        className="absolute top-0 left-0 right-0 h-[14%] z-40"
        aria-hidden
      >
        <Valance />
      </motion.div>

      {/* Bottom hem */}
      <motion.div
        style={{
          y: useTransform(scrollYProgress, [0, 0.08], ["0%", "100%"]),
          opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]),
        }}
        className="absolute bottom-0 left-0 right-0 h-[8%] z-40"
        aria-hidden
      >
        <BottomHem />
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * CurtainSide — one half of the velvet curtain.
 * Multiple pleats via repeating linear-gradient with subtle shadow.
 * ---------------------------------------------------------------------------- */
function CurtainSide({ side }: { side: "left" | "right" }) {
  // Pleat pattern — vertical stripes with light/dark alternating
  const pleatGradient = `
    repeating-linear-gradient(
      ${side === "left" ? "to right" : "to right"},
      ${pleatStops(side)}
    )
  `;

  return (
    <div
      className="relative h-full w-full"
      style={{
        background: pleatGradient,
        boxShadow:
          side === "left"
            ? "inset -20px 0 60px rgba(0,0,0,0.7), inset 0 0 100px rgba(0,0,0,0.4)"
            : "inset 20px 0 60px rgba(0,0,0,0.7), inset 0 0 100px rgba(0,0,0,0.4)",
      }}
    >
      {/* Velvet sheen overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: side === "left"
            ? "linear-gradient(to right, transparent 0%, rgba(255,200,150,0.08) 50%, rgba(255,220,170,0.18) 90%, rgba(255,235,200,0.28) 100%)"
            : "linear-gradient(to left, transparent 0%, rgba(255,200,150,0.08) 50%, rgba(255,220,170,0.18) 90%, rgba(255,235,200,0.28) 100%)",
        }}
      />

      {/* Gold tassel cord at the leading edge */}
      <div
        className={`absolute top-0 bottom-0 ${side === "left" ? "right-0" : "left-0"} w-1.5`}
        style={{
          background: "linear-gradient(to bottom, #FFE8B0 0%, #D4AF37 30%, #8A6020 50%, #D4AF37 70%, #FFE8B0 100%)",
          boxShadow: "0 0 8px rgba(212,175,55,0.6), 0 0 16px rgba(212,175,55,0.3)",
        }}
      >
        {/* Tassels hanging */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-10"
            style={{
              top: `${(i + 0.5) * (100 / 12)}%`,
              left: "-3px",
              background: "radial-gradient(ellipse at top, #FFE8B0 0%, #D4AF37 40%, #8A6020 80%, transparent 100%)",
              borderRadius: "0 0 50% 50%",
              filter: "blur(0.4px)",
            }}
          />
        ))}
      </div>

      {/* Heavy bottom shadow for weight */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/4 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
        }}
      />
    </div>
  );
}

function pleatStops(side: "left" | "right"): string {
  // Alternating dark/light bars for pleated velvet look
  // Each pleat is ~5% width
  const colors = [
    "#3A0810", // deep shadow
    "#7A1020", // dark velvet
    "#A01828", // mid velvet
    "#C82038", // highlight
    "#A01828", // mid velvet
    "#7A1020", // dark velvet
  ];
  const pleatWidth = 100 / 20; // 20 pleats
  const stops: string[] = [];
  for (let i = 0; i < 20; i++) {
    const start = i * pleatWidth;
    colors.forEach((c, j) => {
      const pos = start + (pleatWidth * j) / (colors.length - 1);
      stops.push(`${c} ${pos.toFixed(2)}%`);
    });
  }
  // Close last
  stops.push(`${colors[colors.length - 1]} 100%`);
  return stops.join(", ");
}

function Valance() {
  // Decorative scalloped top valance with gold fringe
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #5A0810 0%, #7A1020 40%, #5A0810 100%)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.6)",
          // Scalloped bottom edge via mask
          WebkitMaskImage: "radial-gradient(circle at 50% 100%, transparent 0px, black 24px), linear-gradient(black, black)",
          maskImage: "radial-gradient(circle at 50% 100%, transparent 0px, black 24px), linear-gradient(black, black)",
        }}
      />
      {/* Gold trim line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: "linear-gradient(to right, #8A6020, #FFE8B0, #D4AF37, #FFE8B0, #8A6020)",
          boxShadow: "0 0 12px rgba(212,175,55,0.5)",
        }}
      />
      {/* Gold fringe tassels */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0 w-2 h-8"
          style={{
            left: `${(i + 0.5) * (100 / 14)}%`,
            background: "linear-gradient(to bottom, #FFE8B0, #D4AF37 40%, #8A6020 100%)",
            borderRadius: "0 0 50% 50%",
          }}
        />
      ))}
    </div>
  );
}

function BottomHem() {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #5A0810 30%, #3A0810 100%)",
        }}
      />
      {/* Gold trim */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: "linear-gradient(to right, #8A6020, #FFE8B0, #D4AF37, #FFE8B0, #8A6020)",
          boxShadow: "0 0 12px rgba(212,175,55,0.5)",
        }}
      />
    </div>
  );
}
