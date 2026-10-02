"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${count} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < count ? "fill-gold text-gold" : "text-gold/30"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-onyx bg-emerald-radial py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Отзывы"
          title={
            <>
              Нам доверяют{" "}
              <span className="text-gold-gradient italic">события</span>
            </>
          }
          subtitle="Свыше 850 отзывов от клиентов, которые нашли свой идеальный образ у нас."
        />

        <GoldDivider className="mx-auto mt-8 w-full max-w-md" />

        {/* Reviews grid */}
        <div
          ref={ref}
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group lift-card relative flex flex-col overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-6 transition-colors duration-500 hover:border-gold/45"
            >
              {/* Decorative gold corner accents on hover */}
              <span className="corner-accents pointer-events-none absolute inset-0" />

              {/* Top row: 5 gold stars + decorative quote icon */}
              <div className="flex items-center justify-between">
                <Stars count={t.rating} />
                <Quote
                  className="h-8 w-8 text-gold/40 opacity-50 transition-colors duration-500 group-hover:text-gold/70"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </div>

              {/* Quote text */}
              <blockquote className="relative mt-4 flex gap-3">
                <span
                  className="font-display text-5xl leading-[0.6] text-gold-gradient select-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-display text-base italic leading-relaxed text-ivory">
                  {t.text}
                </p>
              </blockquote>

              {/* Divider */}
              <span className="my-4 h-px w-full bg-gradient-to-r from-gold/40 via-gold/15 to-transparent" />

              {/* Author row */}
              <div className="mt-auto flex items-center gap-3">
                {/* Avatar */}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-emerald to-emerald-deep font-display text-sm font-semibold tracking-wide text-gold">
                  {t.initials}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight text-ivory">
                    {t.name}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {t.role}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Overall rating summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-col items-center gap-4 text-center"
        >
          {/* Ornament rule with rating summary */}
          <div className="ornament-rule w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">★</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-display text-5xl text-gold-gradient">
              4.9
            </span>
            <Stars count={5} />
          </div>

          <p className="text-xs text-muted-foreground">
            850+ отзывов · на основе 50 000+ клиентов
          </p>
        </motion.div>
      </div>
    </section>
  );
}
