"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import { Sparkles, ArrowDown } from "lucide-react";

/* ============================================================================
 * SubHero — emerges from the final star portal.
 *
 * Sits immediately after CinematicHero. Has a radial gold glow at the top
 * that fades in as we enter this section, suggesting the star is the source
 * of light. Content rises into view with a parallax reveal.
 *
 * The user experience: after the cosmic flight + white flash, they "land"
 * here — a brief welcome section that bridges the cosmic intro to the
 * rest of the site (TrustStrip, Collections, etc.).
 * ============================================================================ */

const EASE = [0.16, 1, 0.3, 1] as const;

export function SubHero({ heroScrollProgress: _heroScrollProgress }: { heroScrollProgress?: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Gold glow intensity — peaks when this section enters viewport, fades as we scroll
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.6, 0.3, 0.1]);
  // Content rises from bottom
  const contentY = useTransform(scrollYProgress, [0, 0.5], [80, -20]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3, 0.9, 1], [0, 1, 1, 0.7]);

  // Parallax ring rotation
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-onyx"
      style={{ minHeight: "100vh" }}
    >
      {/* === Star portal glow — fades as we leave === */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,220,140,0.6)_0%,rgba(255,160,80,0.3)_25%,rgba(120,60,20,0.15)_45%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/30 blur-3xl" />
      </motion.div>

      {/* === Rotating decorative ring (suggests orbital motion) === */}
      <motion.div
        style={{ rotate: ringRotate }}
        className="pointer-events-none absolute left-1/2 top-16 z-10 -translate-x-1/2"
      >
        <div className="h-[420px] w-[420px] rounded-full border border-gold/15" />
      </motion.div>
      <motion.div
        style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, -120]) }}
        className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2"
      >
        <div className="h-[520px] w-[520px] rounded-full border border-gold/8" />
      </motion.div>

      {/* === Content === */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/5"
        >
          <Sparkles className="h-7 w-7 text-gold" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-display text-4xl leading-tight text-ivory md:text-6xl"
        >
          Добро пожаловать <br />
          <span className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text italic text-transparent">
            в ателье
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/70 md:text-lg"
        >
          После космического путешествия — наш мир карнавальных фантазий.
          Листайте ниже, чтобы увидеть коллекции, бронирование и истории
          наших клиентов.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-ivory/50"
          >
            <span className="text-[10px] uppercase tracking-[0.4em]">Дальше</span>
            <ArrowDown className="h-4 w-4 text-gold" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* === Bottom fade-into-site === */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 z-10 bg-gradient-to-b from-transparent to-onyx" />
    </section>
  );
}
