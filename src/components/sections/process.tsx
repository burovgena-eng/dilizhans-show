"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PROCESS_STEPS } from "@/lib/data/catalog";
import { Eyebrow } from "@/components/site/primitives";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      id="process"
      className="relative overflow-hidden bg-emerald-deep py-20 text-ivory md:py-28"
    >
      {/* Film grain texture */}
      <div className="grain-overlay absolute inset-0 opacity-60" aria-hidden="true" />
      {/* Soft radial gold glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Top ornamental divider */}
        <div className="ornament-rule mb-10 w-full max-w-2xl mx-auto">
          <span className="text-gold text-xs tracking-[0.4em]">✦</span>
        </div>

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
          className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 md:gap-6"
        >
          {PROCESS_STEPS.map((s, i) => {
            const isLast = i === PROCESS_STEPS.length - 1;
            return (
              <motion.article
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col"
              >
                {/* Large gold step number */}
                <span className="font-display text-6xl leading-none text-gold md:text-7xl lg:text-8xl">
                  <motion.span
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={
                      inView
                        ? { opacity: 1, filter: "blur(0px)" }
                        : {}
                    }
                    transition={{
                      duration: 0.7,
                      delay: i * 0.12 + 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="block"
                  >
                    {s.n}
                  </motion.span>
                </span>

                {/* Title */}
                <h3 className="mt-5 font-display text-2xl leading-tight text-ivory">
                  {s.title}
                </h3>

                {/* Text */}
                <p className="mt-2.5 text-sm leading-relaxed text-ivory/70">
                  {s.text}
                </p>

                {/* Decorative gold vertical line connector on the right */}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 top-2 hidden h-24 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent lg:block md:-right-4 md:h-32"
                  />
                ) : null}

                {/* Tiny gold dot under the number — appears on hover */}
                <span
                  className="mt-5 h-1 w-10 rounded-full bg-gold/30 transition-all duration-500 group-hover:w-16 group-hover:bg-gold"
                  aria-hidden="true"
                />
              </motion.article>
            );
          })}
        </div>

        {/* Bottom ornamental divider */}
        <div className="ornament-rule mt-14 w-full max-w-2xl mx-auto">
          <span className="text-gold text-xs tracking-[0.4em]">✦</span>
        </div>
      </div>
    </section>
  );
}
