"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Crown, Sparkles, Ruler, Truck, type LucideIcon } from "lucide-react";
import { ADVANTAGES } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";

/** Dynamic icon map keyed by the string name in the data file. */
const ICON_MAP: Record<string, LucideIcon> = {
  Crown,
  Sparkles,
  Ruler,
  Truck,
};

export function Advantages() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="advantages" className="relative bg-ivory-soft py-20 md:py-28">
      {/* Decorative gold ornament at section top */}
      <div className="mx-auto mb-2 flex max-w-7xl justify-center px-6">
        <div className="ornament-rule w-full max-w-md">
          <span className="text-gold text-xs tracking-[0.4em]">◆</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Почему Дилижанс Шоу"
          title={
            <>
              Сервис европейского{" "}
              <span className="text-gold-gradient italic">бутика</span>
            </>
          }
          subtitle="Мы не сдаём костюмы в аренду — мы создаём образы."
        />

        <GoldDivider className="mx-auto mt-8 w-full max-w-md" />

        {/* Cards grid */}
        <div
          ref={ref}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8"
        >
          {ADVANTAGES.map((a, i) => {
            const Icon = ICON_MAP[a.icon] ?? Crown;
            return (
              <motion.article
                key={a.icon}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group lift-card relative flex flex-col items-start overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors duration-500 hover:border-gold/45"
              >
                {/* Icon medallion */}
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/45 bg-emerald-deep text-gold shadow-[inset_0_0_0_3px_rgba(250,246,238,0.05)] transition-colors duration-500 group-hover:text-gold-bright">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                  {/* Subtle gold ring glow on hover */}
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      boxShadow:
                        "0 0 0 1px rgba(201,169,97,0.45), 0 0 24px -4px rgba(201,169,97,0.55)",
                    }}
                    aria-hidden="true"
                  />
                </span>

                <h3 className="mt-6 font-display text-2xl leading-tight text-emerald-deep">
                  {a.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {a.text}
                </p>

                {/* Decorative gold corner accent on hover */}
                <span className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="pointer-events-none absolute bottom-4 left-4 h-3 w-3 border-b border-l border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
