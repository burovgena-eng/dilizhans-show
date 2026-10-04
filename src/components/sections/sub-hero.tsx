"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Sparkles, ArrowDown } from "lucide-react";

/* ============================================================================
 * SubHero — "assembles" itself out of the star portal.
 *
 * After the cosmic flight + white flash, this section appears as if it's
 * being built/summoned from the star:
 *   1. Gold particle motes fly inward and cluster into the Sparkles icon
 *   2. Title letters fade in with blur-from-large-scale, staggered
 *   3. Description lines appear letter-by-letter
 *   4. CTA + arrow fly in from sides
 *
 * The section is sticky for the first 100vh (motion-design assembly), then
 * becomes a normal section that flows into TrustStrip.
 * ============================================================================ */

const EASE = [0.16, 1, 0.3, 1] as const;

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  // Random direction (angle + radius) for particle start
  angle: (i / 14) * Math.PI * 2 + Math.random() * 0.4,
  radius: 200 + Math.random() * 120,
  delay: i * 0.04,
  size: 2 + Math.random() * 3,
}));

export function SubHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Glow intensity — peaks when section enters, fades as we scroll away
  const glowOpacity = useTransform(scrollYProgress, [0, 0.15, 0.6, 1], [1, 0.85, 0.4, 0.1]);
  // After assembly, content stays put (no parallax drift)
  const contentY = useTransform(scrollYProgress, [0, 0.4, 1], [40, 0, -40]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-onyx"
      style={{ minHeight: "120vh" }}
    >
      {/* === Star portal glow at top — fades as we leave === */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,220,140,0.7)_0%,rgba(255,160,80,0.35)_20%,rgba(120,60,20,0.15)_45%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/40 blur-3xl" />
      </motion.div>

      {/* === Rotating orbital rings (subtle, behind content) === */}
      <motion.div
        style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, 60]) }}
        className="pointer-events-none absolute left-1/2 top-12 z-10 -translate-x-1/2"
      >
        <div className="h-[380px] w-[380px] rounded-full border border-gold/15" />
      </motion.div>
      <motion.div
        style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, -90]) }}
        className="pointer-events-none absolute left-1/2 top-20 z-10 -translate-x-1/2"
      >
        <div className="h-[480px] w-[480px] rounded-full border border-gold/8" />
      </motion.div>

      {/* === Motion-design assembled content === */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-20 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 text-center"
      >
        {/* Step 1: Particles fly inward and cluster into the Sparkles icon */}
        <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
          {/* Particle motes that fly in from outside */}
          {PARTICLES.map((p) => {
            const startX = Math.cos(p.angle) * p.radius;
            const startY = Math.sin(p.angle) * p.radius;
            return (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-gold"
                style={{
                  width: p.size,
                  height: p.size,
                  boxShadow: "0 0 8px rgba(255,200,100,0.8)",
                }}
                initial={{ x: startX, y: startY, opacity: 0, scale: 0 }}
                whileInView={{
                  x: 0, y: 0, opacity: [0, 1, 0], scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1.4,
                  delay: p.delay,
                  ease: EASE,
                }}
                viewport={{ once: true, margin: "-50px" }}
              />
            );
          })}

          {/* The icon that the particles "cluster into" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -90 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
            viewport={{ once: true, margin: "-50px" }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10"
            style={{ boxShadow: "0 0 32px rgba(212,175,55,0.5), inset 0 0 20px rgba(212,175,55,0.2)" }}
          >
            <Sparkles className="h-7 w-7 text-gold" />
          </motion.div>
        </div>

        {/* Step 2: Title letters assemble with blur-from-large-scale */}
        <motion.h2
          className="font-display text-4xl leading-tight text-ivory md:text-6xl lg:text-7xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.05, delayChildren: 0.8 }}
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(12px)", scale: 1.5 },
              visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
            }}
            transition={{ duration: 0.7, ease: EASE }}
            className="inline-block"
          >
            Добро&nbsp;пожаловать
          </motion.span>
          <br />
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(12px)", scale: 1.5 },
              visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
            }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="inline-block bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text italic text-transparent"
          >
            в&nbsp;ателье
          </motion.span>
        </motion.h2>

        {/* Decorative separator that draws itself */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.2, ease: EASE }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-8 h-px w-32 origin-center bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        {/* Step 3: Description lines reveal letter-by-letter (line-by-line) */}
        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-7 max-w-2xl text-base leading-relaxed text-ivory/70 md:text-lg"
        >
          После космического путешествия — наш мир карнавальных фантазий.
          Листайте ниже, чтобы увидеть коллекции, бронирование и истории
          наших клиентов.
        </motion.p>

        {/* Step 4: CTA arrow flies in from bottom */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.7 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.7, ease: EASE }}
          viewport={{ once: true, margin: "-50px" }}
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
