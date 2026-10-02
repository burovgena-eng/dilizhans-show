"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS, type Audience } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";

/** Plural uppercase audience label for the gold pill badge. */
const AUDIENCE_BADGE: Record<Audience, string> = {
  children: "ДЕТСКИЕ",
  adults: "ВЗРОСЛЫЕ",
  all: "УНИВЕРСАЛЬНЫЕ",
};

export function Collections() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

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
          title={
            <>
              Жемчужины нашей{" "}
              <span className="text-gold-gradient italic">коллекции</span>
            </>
          }
          subtitle="Шесть тематических направлений из 2000+ авторских костюмов. Ручная вышивка, премиальные ткани, театральная фурнитура."
        />

        <GoldDivider className="mx-auto mt-8 w-full max-w-md" />

        {/* Cards grid */}
        <div
          ref={ref}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {COLLECTIONS.map((c, i) => (
            <motion.a
              key={c.id}
              href="#categories"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group lift-card relative block overflow-hidden rounded-lg border border-gold/20 bg-onyx-card"
            >
              {/* Image — aspect ratio 4/5 */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="img-luxe h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
                {/* Dark gradient overlay from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/60 to-transparent" />
                {/* Subtle emerald sheen on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Audience badge — top-left, gold gradient pill */}
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-gold-bright to-gold-deep px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-onyx shadow-[0_4px_18px_-4px_rgba(201,169,97,0.6)]">
                  <span className="h-1 w-1 rounded-full bg-onyx/60" />
                  {AUDIENCE_BADGE[c.audience]}
                </span>

                {/* Count badge — top-right, muted style */}
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full border border-gold/30 bg-onyx/70 px-3 py-1 text-[11px] font-medium text-ivory/85 backdrop-blur-sm">
                  {c.count} костюмов
                </span>

                {/* Decorative gold corner accents (CSS utility — reveals on group hover) */}
                <span
                  className="corner-accents pointer-events-none absolute inset-0"
                  aria-hidden="true"
                />

                {/* Bottom content — absolutely positioned */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-2xl leading-tight text-ivory">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
                    {c.subtitle}
                  </p>
                  {/* Description — collapses to 0 height, expands on hover */}
                  <p className="mt-2 max-h-0 overflow-hidden text-sm leading-relaxed text-ivory/70 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:max-h-32">
                    {c.description}
                  </p>
                  {/* "Открыть коллекцию →" link — fades + lifts in on hover */}
                  <div className="mt-3 flex translate-y-2 items-center gap-2 text-gold opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Открыть коллекцию
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom centered CTA pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-14 flex justify-center"
        >
          <a
            href="#categories"
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-8 py-4 text-sm font-semibold text-onyx shadow-[0_12px_40px_-12px_rgba(201,169,97,0.6)] transition-transform duration-300 hover:scale-[1.03]"
          >
            Смотреть все 2000+ костюмов
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
