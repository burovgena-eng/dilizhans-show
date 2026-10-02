"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Shirt, ArrowRight } from "lucide-react";
import { CATEGORIES, type Audience } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";

const FILTER_VALUES: {
  value: string;
  label: string;
  match: (a: Audience) => boolean;
}[] = [
  { value: "all", label: "Все", match: () => true },
  { value: "children", label: "Детские", match: (a) => a === "children" },
  { value: "adults", label: "Взрослые", match: (a) => a === "adults" },
  { value: "universal", label: "Универсальные", match: (a) => a === "all" },
];

export function Categories() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    const f = FILTER_VALUES.find((x) => x.value === active);
    if (!f) return CATEGORIES;
    return CATEGORIES.filter((c) => f.match(c.audience));
  }, [active]);

  return (
    <section
      id="categories"
      className="relative bg-onyx bg-emerald-radial py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Каталог"
          title={
            <>
              Найдите свой <span className="text-gold-gradient italic">образ</span>
            </>
          }
          subtitle="Более 18 тематических направлений и 2000+ костюмов для любого возраста и события."
        />

        <GoldDivider className="mx-auto mt-8 w-full max-w-md" />

        {/* Filter chips */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {FILTER_VALUES.map((f) => {
            const isActive = active === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setActive(f.value)}
                className={
                  "inline-flex items-center rounded-full px-5 py-2 text-sm transition-colors duration-300 " +
                  (isActive
                    ? "bg-gradient-to-br from-gold-bright via-gold to-gold-deep font-semibold text-onyx shadow-[0_8px_24px_-8px_rgba(201,169,97,0.5)]"
                    : "border border-gold/30 text-ivory/70 hover:border-gold/60 hover:text-ivory")
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid of pill-cards */}
        <motion.div
          ref={ref}
          layout
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <motion.a
                key={c.id}
                href="#contact"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="group lift-card relative flex items-center gap-3 overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-4"
              >
                {/* Icon medallion */}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold transition-colors duration-300 group-hover:text-gold-bright">
                  <Shirt className="h-4 w-4" strokeWidth={1.5} />
                </span>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-base leading-tight text-ivory">
                    {c.title}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {c.count} образов
                  </span>
                </div>

                {/* Decorative gold corner accents on hover */}
                <span
                  className="corner-accents pointer-events-none absolute inset-0"
                  aria-hidden="true"
                />
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Ornamental rule + note */}
        <div className="mt-14 flex flex-col items-center gap-5">
          <div className="ornament-rule w-full max-w-md">
            <span className="text-xs tracking-[0.4em] text-gold">◆</span>
          </div>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-gold-bright hover:underline"
          >
            <span className="font-medium">
              Не нашли нужный образ? Подберём индивидуально
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
