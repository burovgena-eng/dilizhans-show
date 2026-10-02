"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS, type Audience } from "@/lib/data/catalog";
import { SectionHeading } from "@/components/site/primitives";
import { TiltCard } from "@/components/site/motion-utils";

/** Short audience label for the small gold pill. */
const AUDIENCE_BADGE: Record<Audience, string> = {
  children: "Дети",
  adults: "Взрослые",
  all: "Универсально",
};

/** Shared luxury easing — slow-out cubic for refined reveals. */
const EASE = [0.16, 1, 0.3, 1] as const;

export function Collections() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="collections"
      className="relative bg-onyx bg-emerald-radial py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Коллекции"
          title="Жемчужины нашей коллекции"
          subtitle="Шесть ключевых направлений нашей коллекции из 2000+ костюмов."
        />

        {/* Cards grid — perspective wrapper for refined 3D depth */}
        <div
          ref={ref}
          className="perspective-1000 mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {COLLECTIONS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <TiltCard>
                <a
                  href="#catalog"
                  className="group relative block overflow-hidden rounded-lg border border-gold/15 bg-onyx-card shadow-luxe transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lift-card hover:shadow-luxe-hover"
                >
                  {/* Image container — portrait 4/5 */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <motion.img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      initial={{ clipPath: "inset(0 0 100% 0)" }}
                      animate={
                        inView ? { clipPath: "inset(0 0 0% 0)" } : {}
                      }
                      transition={{
                        duration: 1.2,
                        delay: i * 0.08,
                        ease: EASE,
                      }}
                      className="img-luxe h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                    {/* Dark gradient overlay from bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/50 to-transparent" />
                    {/* 1px gold inset border on hover (subtle ring) */}
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/0 transition-colors duration-500 group-hover:ring-gold/25" />
                    {/* Decorative gold corner accents — subtle 16px L-shapes on hover */}
                    <span
                      className="corner-accents pointer-events-none absolute inset-0"
                      aria-hidden="true"
                    />

                    {/* Audience pill — top-left */}
                    <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-gold/25 bg-onyx/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gold backdrop-blur-sm">
                      {AUDIENCE_BADGE[c.audience]}
                    </span>

                    {/* Count badge — top-right, just the number */}
                    <span className="absolute right-4 top-4 text-xs font-medium text-ivory/60">
                      {c.count}
                    </span>

                    {/* Bottom content — absolutely positioned */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="font-display text-2xl leading-tight text-ivory">
                        {c.title}
                      </h3>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-gold">
                        {c.subtitle}
                      </p>
                      {/* Description — collapses to 0 height, expands on hover */}
                      <p className="mt-2 max-h-0 overflow-hidden text-sm leading-relaxed text-ivory/65 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:max-h-24 group-hover:opacity-100">
                        {c.description}
                      </p>
                      {/* CTA — fades + lifts in on hover */}
                      <div className="mt-3 flex translate-y-2 items-center gap-2 text-gold opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="text-xs font-medium uppercase tracking-wider">
                          Открыть коллекцию
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Bottom centered CTA — refined btn-gold, no icon flash */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 flex justify-center"
        >
          <a
            href="#catalog"
            className="btn-gold px-7 py-3 text-sm"
          >
            Смотреть все 2000+ костюмов
          </a>
        </motion.div>
      </div>
    </section>
  );
}
