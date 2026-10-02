"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Shirt, ArrowRight } from "lucide-react";
import { CATEGORIES, type Audience } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";

const FILTER_VALUES: { value: string; label: string; match: (a: Audience) => boolean }[] = [
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
    <section id="categories" className="relative bg-ivory py-20 md:py-28">
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
                  "relative inline-flex items-center rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-300 " +
                  (isActive
                    ? "border-gold bg-emerald-deep text-gold shadow-[0_8px_24px_-8px_rgba(15,61,46,0.4)]"
                    : "border-border bg-card text-muted-foreground hover:border-gold/50 hover:text-emerald-deep")
                }
              >
                {f.label}
                {isActive ? (
                  <motion.span
                    layoutId="filter-dot"
                    className="ml-2 h-1.5 w-1.5 rounded-full bg-gold"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Grid of pill-cards */}
        <motion.div
          ref={ref}
          layout
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <motion.a
                key={c.id}
                href="#"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={
                  inView
                    ? { opacity: 1, y: 0 }
                    : {}
                }
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="group lift-card relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors duration-300 hover:border-gold/45 hover:bg-emerald/5"
              >
                {/* Icon medallion */}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald/8 text-gold transition-colors duration-300 group-hover:bg-emerald-deep group-hover:text-gold-bright">
                  <Shirt className="h-5 w-5" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-base leading-tight text-emerald-deep">
                    {c.title}
                  </span>
                  <span className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.count} образов
                  </span>
                </div>

                {/* Count badge */}
                <span className="ml-auto flex shrink-0 items-center rounded-full border border-gold/25 bg-ivory-soft px-2.5 py-1 text-[10px] font-bold text-gold-deep">
                  {c.count}
                </span>

                {/* Gold corner accent on hover */}
                <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Ornamental rule + note */}
        <div className="mt-14 flex flex-col items-center gap-5">
          <div className="ornament-rule w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">◆</span>
          </div>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-emerald-deep"
          >
            <span className="underline-gold font-semibold text-emerald-deep">
              Не нашли нужный образ? Подберём индивидуально
            </span>
            <ArrowRight className="h-4 w-4 text-gold transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
