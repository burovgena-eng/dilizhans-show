"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PROCESS_STEPS } from "@/lib/data/catalog";
import {
  Eyebrow,
  GoldDivider,
} from "@/components/site/primitives";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      id="process"
      className="grain-overlay relative overflow-hidden bg-onyx-soft bg-gold-radial py-20 text-ivory md:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Top ornamental divider */}
        <GoldDivider className="mx-auto mb-10 w-full max-w-2xl">
          <span className="text-gold text-xs tracking-[0.4em]">✦</span>
        </GoldDivider>

        {/* Heading */}
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

        {/* Step cards grid */}
        <div
          ref={ref}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PROCESS_STEPS.map((s, i) => {
            const isLast = i === PROCESS_STEPS.length - 1;
            return (
              <motion.article
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.65,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group lift-card relative flex flex-col overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-6 transition-colors duration-500 hover:border-gold/45"
              >
                {/* Decorative gold corner accents on hover */}
                <span className="corner-accents pointer-events-none absolute inset-0" />

                {/* Big step number */}
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
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="block font-display text-6xl leading-none text-gold-gradient"
                >
                  {s.n}
                </motion.span>

                {/* Small gold dot / sparkle under number */}
                <span
                  aria-hidden="true"
                  className="mt-3 h-1.5 w-1.5 rotate-45 bg-gold shadow-[0_0_12px_rgba(201,169,97,0.6)]"
                />

                {/* Title */}
                <h3 className="mt-4 font-display text-xl leading-tight text-ivory">
                  {s.title}
                </h3>

                {/* Text */}
                <p className="mt-2 text-sm leading-relaxed text-ivory/65">
                  {s.text}
                </p>

                {/* Vertical gold line connector on the right (hidden on last + mobile) */}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-gold/40 to-transparent lg:block"
                  />
                ) : null}
              </motion.article>
            );
          })}
        </div>

        {/* Bottom ornamental divider */}
        <GoldDivider className="mx-auto mt-14 w-full max-w-2xl">
          <span className="text-gold text-xs tracking-[0.4em]">✦</span>
        </GoldDivider>
      </div>
    </section>
  );
}
