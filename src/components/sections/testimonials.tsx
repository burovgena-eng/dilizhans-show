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
    <section id="testimonials" className="relative bg-ivory py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
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
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group lift-card relative flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-card p-6 transition-colors duration-500 hover:border-gold/55 md:p-8"
            >
              {/* Decorative gold quotation mark — top right */}
              <Quote
                className="pointer-events-none absolute right-5 top-5 h-10 w-10 text-gold/15 transition-colors duration-500 group-hover:text-gold/35"
                strokeWidth={1}
                aria-hidden="true"
              />

              {/* 5 gold stars */}
              <Stars count={t.rating} />

              {/* Quote text */}
              <blockquote className="relative mt-5 flex gap-3">
                <span
                  className="font-display text-5xl leading-[0.6] text-gold/55 select-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-display text-lg italic leading-relaxed text-emerald-deep md:text-xl">
                  {t.text}
                </p>
              </blockquote>

              {/* Divider */}
              <span className="my-6 h-px w-full bg-gradient-to-r from-gold/40 via-gold/15 to-transparent" />

              {/* Author */}
              <div className="mt-auto flex items-center gap-4">
                {/* Avatar */}
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/55 bg-emerald-deep font-display text-base font-semibold tracking-wide text-gold">
                  {t.initials}
                </span>
                <div className="flex flex-col">
                  <span className="font-display text-base leading-tight text-emerald-deep">
                    {t.name}
                  </span>
                  <span className="mt-0.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t.role}
                  </span>
                </div>
              </div>

              {/* Subtle gold corner accent */}
              <span className="pointer-events-none absolute bottom-4 right-4 h-3 w-3 border-b border-r border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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
          <div className="ornament-rule w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">★</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-display text-4xl text-emerald-deep md:text-5xl">
              4,9
            </span>
            <span className="font-sans text-2xl text-muted-foreground">/ 5</span>
            <Stars count={5} />
          </div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            850+ отзывов на основе 50 000+ клиентов
          </p>
        </motion.div>
      </div>
    </section>
  );
}
