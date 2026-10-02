"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { PhoneCall, Shirt, FileSignature, PackageCheck, type LucideIcon } from "lucide-react";
import { PROCESS_STEPS } from "@/lib/data/catalog";
import { Eyebrow, GoldDivider } from "@/components/site/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

// Icon map — keeps type safety with lucide
const STEP_ICONS: Record<string, LucideIcon> = {
  PhoneCall,
  Shirt,
  FileSignature,
  PackageCheck,
};

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  // Connecting timeline line — animates width when section enters view
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 80%", "end 20%"],
  });
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="process"
      className="relative overflow-hidden bg-onyx-soft bg-gold-radial text-ivory"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow>Как мы работаем</Eyebrow>
          <h2 className="max-w-3xl font-display text-4xl leading-[1.05] text-ivory md:text-5xl lg:text-6xl">
            Четыре шага к{" "}
            <span className="text-gold-gradient italic">образу</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Прозрачный и понятный путь от заявки до возврата костюма. Без
            скрытых платежей и стресса — только удовольствие от выбора.
          </p>
        </div>

        {/* === Horizontal connecting timeline === */}
        <div ref={lineRef} className="relative mt-16 mb-14">
          {/* Track */}
          <div className="relative mx-auto h-px w-full max-w-5xl bg-gold/15">
            {/* Animated gold progress line */}
            <motion.div
              style={{ width: lineWidth }}
              className="absolute left-0 top-0 h-px bg-gradient-to-r from-gold-bright via-gold to-gold-deep"
            />
            {/* Step dots on the line */}
            <div className="absolute inset-0 flex items-center justify-between">
              {PROCESS_STEPS.map((s, i) => (
                <motion.span
                  key={s.n}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.18, ease: EASE }}
                  className="relative z-10 flex h-3 w-3 rotate-45 bg-gold shadow-[0_0_14px_rgba(201,169,97,0.7)]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* === 4 step cards — equal-height grid with icon medallions === */}
        <div
          ref={ref}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch"
        >
          {PROCESS_STEPS.map((s, i) => {
            const Icon = STEP_ICONS[s.icon] ?? PhoneCall;
            return (
              <motion.article
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: i * 0.12,
                  ease: EASE,
                }}
                className="group lift-card relative flex h-full flex-col overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-6"
              >
                <span className="corner-accents pointer-events-none absolute inset-0" />

                {/* === Top: icon medallion + step number, side-by-side === */}
                <div className="flex items-start justify-between">
                  {/* Icon medallion */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                    animate={
                      inView
                        ? { opacity: 1, scale: 1, rotate: 0 }
                        : {}
                    }
                    transition={{
                      duration: 0.7,
                      delay: i * 0.12 + 0.2,
                      ease: EASE,
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/35 bg-gradient-to-br from-emerald-deep to-emerald-darkest text-gold shadow-[inset_0_1px_0_rgba(201,169,97,0.25),0_8px_20px_-8px_rgba(0,0,0,0.6)]"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </motion.span>

                  {/* Big step number — top right, gold gradient */}
                  <motion.span
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={
                      inView
                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                        : {}
                    }
                    transition={{
                      duration: 0.7,
                      delay: i * 0.12 + 0.15,
                      ease: EASE,
                    }}
                    className="block font-display text-5xl leading-none text-gold-gradient md:text-6xl"
                  >
                    {s.n}
                  </motion.span>
                </div>

                {/* Gold dot under top row */}
                <span
                  aria-hidden="true"
                  className="mt-5 h-1.5 w-1.5 rotate-45 bg-gold shadow-[0_0_12px_rgba(201,169,97,0.6)]"
                />

                {/* Title */}
                <h3 className="mt-4 font-display text-xl leading-tight text-ivory md:text-2xl">
                  {s.title}
                </h3>

                {/* Text — flex-1 to fill remaining space, push indicator to bottom */}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ivory/65">
                  {s.text}
                </p>

                {/* Step indicator — bottom */}
                <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold/70">
                  <span>Шаг {i + 1}</span>
                  <span className="text-ivory/30">/</span>
                  <span>{PROCESS_STEPS.length}</span>
                  {/* Progress dots — filled vs empty */}
                  <span className="ml-auto flex items-center gap-1">
                    {PROCESS_STEPS.map((_, j) => (
                      <span
                        key={j}
                        className={
                          j === i
                            ? "h-1 w-3 rounded-full bg-gold"
                            : "h-1 w-1.5 rounded-full bg-gold/20"
                        }
                      />
                    ))}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom ornament */}
        <GoldDivider className="mx-auto mt-16 w-full max-w-2xl">
          <span className="text-gold text-xs tracking-[0.4em]">✦</span>
        </GoldDivider>
      </div>
    </section>
  );
}
