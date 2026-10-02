"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { PROCESS_STEPS } from "@/lib/data/catalog";
import {
  Eyebrow,
  GoldDivider,
} from "@/components/site/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;
const N = PROCESS_STEPS.length; // 4 steps

/* ============================================================================
 * StepCard — single sticky-stacked step card for the desktop layout.
 * Animates opacity / y / scale based on the section's scrollYProgress so
 * cards enter from below, hold while active, and recede as the next covers.
 * ========================================================================== */
function StepCard({
  step,
  i,
  scrollYProgress,
}: {
  step: (typeof PROCESS_STEPS)[number];
  i: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Per-step scroll ranges (i is 0-indexed, N=4):
  //   enterStart = (i-1)/N — when this card begins entering from below
  //   activeStart = i/N — card is fully visible
  //   activeEnd = (i+1)/N — card starts receding
  //   exitEnd = (i+2)/N — card is fully receded
  const enterStart = (i - 1) / N;
  const activeStart = i / N;
  const activeEnd = (i + 1) / N;
  const exitEnd = (i + 2) / N;

  // First card: starts active (no enter). Last card: ends active (no exit).
  const inputRange =
    i === 0
      ? [activeStart, activeEnd, exitEnd]
      : i === N - 1
      ? [enterStart, activeStart, activeEnd]
      : [enterStart, activeStart, activeEnd, exitEnd];

  const opacityRange =
    i === 0
      ? [1, 1, 0.35]
      : i === N - 1
      ? [0, 1, 1]
      : [0, 1, 1, 0.35];

  const yRange =
    i === 0
      ? [0, 0, -60]
      : i === N - 1
      ? [80, 0, 0]
      : [80, 0, 0, -60];

  const scaleRange =
    i === 0
      ? [1, 1, 0.92]
      : i === N - 1
      ? [0.94, 1, 1]
      : [0.94, 1, 1, 0.92];

  const opacity = useTransform(scrollYProgress, inputRange, opacityRange);
  const y = useTransform(scrollYProgress, inputRange, yRange);
  const scale = useTransform(scrollYProgress, inputRange, scaleRange);

  return (
    <motion.article
      style={{ opacity, y, scale, willChange: "transform, opacity" }}
      className="absolute left-1/2 top-1/2 w-[calc(100%-3rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2"
    >
      <div className="lift-card corner-accents relative flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-onyx-card p-8 md:p-12 shadow-luxe">
        {/* Big step number */}
        <span className="block font-display text-7xl leading-none text-gold-gradient md:text-8xl">
          {step.n}
        </span>

        {/* Small gold dot under number */}
        <span
          aria-hidden="true"
          className="mt-4 h-1.5 w-1.5 rotate-45 bg-gold shadow-[0_0_12px_rgba(201,169,97,0.6)]"
        />

        {/* Title */}
        <h3 className="mt-5 font-display text-3xl leading-tight text-ivory md:text-4xl">
          {step.title}
        </h3>

        {/* Text */}
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ivory/70 md:text-lg">
          {step.text}
        </p>

        {/* Step indicator */}
        <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gold/70">
          <span>Шаг {i + 1}</span>
          <span className="text-ivory/30">из</span>
          <span>{N}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function Process() {
  // Mobile vertical grid inView
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileInView = useInView(mobileRef, { once: true, margin: "-120px" });

  // Desktop sticky stacked cards
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Progress bar at the bottom of the sticky — fills as you scroll
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="process"
      className="relative overflow-hidden bg-onyx-soft bg-gold-radial text-ivory"
    >
      {/* === MOBILE / TABLET — simple vertical stack === */}
      <div className="py-20 md:py-28 lg:hidden">
        <div className="relative mx-auto max-w-7xl px-6">
          <GoldDivider className="mx-auto mb-10 w-full max-w-2xl">
            <span className="text-gold text-xs tracking-[0.4em]">✦</span>
          </GoldDivider>

          <div className="flex flex-col items-center gap-4 text-center">
            <Eyebrow className="text-gold">Как мы работаем</Eyebrow>
            <h2 className="max-w-3xl font-display text-4xl leading-[1.05] text-ivory md:text-5xl lg:text-6xl">
              Четыре шага к{" "}
              <span className="text-gold-gradient italic">образу</span>
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-ivory/70 md:text-lg">
              Прозрачный и понятный путь от заявки до возврата костюма.
              Никаких скрытых платежей и стресса — только удовольствие от выбора.
            </p>
          </div>

          <div
            ref={mobileRef}
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {PROCESS_STEPS.map((s, i) => (
              <motion.article
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                animate={mobileInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.65,
                  delay: i * 0.12,
                  ease: EASE,
                }}
                className="group lift-card relative flex flex-col overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-6 transition-colors duration-500 hover:border-gold/45"
              >
                <span className="corner-accents pointer-events-none absolute inset-0" />
                <motion.span
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={
                    mobileInView
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : {}
                  }
                  transition={{
                    duration: 0.7,
                    delay: i * 0.12 + 0.15,
                    ease: EASE,
                  }}
                  className="block font-display text-6xl leading-none text-gold-gradient"
                >
                  {s.n}
                </motion.span>
                <span
                  aria-hidden="true"
                  className="mt-3 h-1.5 w-1.5 rotate-45 bg-gold shadow-[0_0_12px_rgba(201,169,97,0.6)]"
                />
                <h3 className="mt-4 font-display text-xl leading-tight text-ivory">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/65">
                  {s.text}
                </p>
              </motion.article>
            ))}
          </div>

          <GoldDivider className="mx-auto mt-14 w-full max-w-2xl">
            <span className="text-gold text-xs tracking-[0.4em]">✦</span>
          </GoldDivider>
        </div>
      </div>

      {/* === DESKTOP — sticky stacked cards (motion.dev "Card stack" pattern) === */}
      <div
        ref={containerRef}
        className="hidden lg:block lg:h-[400vh] relative"
      >
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
          <div className="relative mx-auto w-full max-w-5xl px-6">
            {/* Heading */}
            <div className="absolute left-1/2 top-6 -translate-x-1/2 text-center">
              <Eyebrow className="text-gold">Как мы работаем</Eyebrow>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] text-ivory lg:text-5xl">
                Четыре шага к{" "}
                <span className="text-gold-gradient italic">образу</span>
              </h2>
            </div>

            {/* Stacked step cards — absolutely positioned, overlap & swap */}
            <div className="relative h-[440px] w-full">
              {PROCESS_STEPS.map((s, i) => (
                <StepCard
                  key={s.n}
                  step={s}
                  i={i}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>

            {/* Bottom progress bar */}
            <div className="absolute bottom-6 left-1/2 flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2">
              <div className="h-px w-full bg-gold/15">
                <motion.div
                  style={{ scaleX: progressScale, transformOrigin: "0%" }}
                  className="h-px w-full bg-gradient-to-r from-gold-bright via-gold to-gold-deep"
                />
              </div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-gold/70">
                Прокрутите, чтобы пройти все шаги
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
