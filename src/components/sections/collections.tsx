"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { COLLECTIONS, type Audience } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";

const AUDIENCE_LABEL: Record<Audience, string> = {
  children: "Детские",
  adults: "Взрослые",
  all: "Универсальные",
};

const AUDIENCE_ICON: Record<Audience, string> = {
  children: "Дети",
  adults: "Взрослые",
  all: "Все",
};

/** Decorative gold corner accent (one of four). */
function CornerAccent({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute h-5 w-5 border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100";
  const map: Record<typeof position, string> = {
    tl: "left-3 top-3 border-l border-t",
    tr: "right-3 top-3 border-r border-t",
    bl: "left-3 bottom-3 border-b border-l",
    br: "right-3 bottom-3 border-b border-r",
  };
  return <span className={`${base} ${map[position]}`} aria-hidden="true" />;
}

export function Collections() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="collections" className="relative bg-ivory py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Коллекции"
          title={
            <>
              Жемчужины нашей <span className="text-gold-gradient italic">коллекции</span>
            </>
          }
          subtitle="Шесть тематических направлений из 2000+ авторских костюмов. Ручная вышивка, премиальные ткани, театральная фурнитура."
        />

        <GoldDivider className="mx-auto mt-8 w-full max-w-md" />

        {/* Cards grid */}
        <div
          ref={ref}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8"
        >
          {COLLECTIONS.map((c, i) => (
            <motion.a
              key={c.id}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group lift-card relative block overflow-hidden rounded-2xl border border-border bg-card"
            >
              {/* Image — aspect ratio 4/5 */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-onyx/85 via-onyx/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Audience tag — top left */}
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-onyx/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  {AUDIENCE_LABEL[c.audience]}
                </span>

                {/* Count badge — top right */}
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-emerald-deep">
                  {c.count} костюмов
                </span>

                {/* Decorative gold corner accents (appear on hover) */}
                <CornerAccent position="tl" />
                <CornerAccent position="tr" />
                <CornerAccent position="bl" />
                <CornerAccent position="br" />

                {/* Bottom content on image */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                    {AUDIENCE_ICON[c.audience]}
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl leading-tight text-ivory md:text-3xl">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs text-ivory/70">{c.subtitle}</p>

                  {/* Hover reveal line */}
                  <div className="mt-3 flex items-center gap-2 text-ivory/0 transition-all duration-500 group-hover:text-gold">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Открыть коллекцию
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-14 flex justify-center"
        >
          <a
            href="#categories"
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-8 py-4 text-sm font-semibold text-emerald-deep shadow-[0_12px_40px_-12px_rgba(201,169,97,0.6)] transition-transform duration-300 hover:scale-[1.03]"
          >
            Смотреть все 2000+ костюмов
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
