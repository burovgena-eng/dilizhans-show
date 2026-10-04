"use client";

import {
  Sparkles,
  Eye,
  Library,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { ADVANTAGES } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";
import { Reveal } from "@/components/site/motion-utils";

/**
 * Varied icon map — each advantage uses a distinct semantic icon
 * (no more 100× Sparkles repeats across the site).
 * Sparkles → cleaning, Eye → try-on, Library → 2000+ catalog, CalendarCheck → booking
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles, // cleaning included
  Eye, // try-on in boutique
  Library, // 2000+ costumes
  CalendarCheck, // phone booking
};

export function Advantages() {
  return (
    <section
      id="advantages"
      className="relative overflow-hidden bg-onyx bg-emerald-radial py-20 md:py-28"
    >
      {/* Soft emerald glow top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald/40 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Почему Дилижанс Шоу"
          title={
            <>
              Честные{" "}
              <span className="text-gold-gradient italic">преимущества</span>
            </>
          }
          subtitle="Без обещаний о доставке и подгоне по фигуре — только то, что у нас действительно есть."
        />

        <GoldDivider className="mx-auto mt-8 w-full max-w-md" />

        {/* Cards grid — each wrapped in <Reveal> with staggered delay */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map((a, i) => {
            const Icon = ICON_MAP[a.icon] ?? Sparkles;
            return (
              <Reveal key={a.icon} delay={i * 0.1} y={28}>
                <article className="group lift-card relative flex h-full flex-col items-start overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-6 transition-colors duration-500 hover:border-gold/45">
                  {/* Decorative gold corner accents on hover */}
                  <span className="corner-accents pointer-events-none absolute inset-0" />

                  {/* Icon medallion */}
                  <span
                    className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-emerald-deep to-emerald-darkest text-gold shadow-[inset_0_1px_0_rgba(201,169,97,0.3)] transition-colors duration-500 group-hover:text-gold-bright"
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                    {/* Subtle gold ring glow on hover */}
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        boxShadow:
                          "0 0 0 1px rgba(201,169,97,0.45), 0 0 24px -4px rgba(201,169,97,0.55)",
                      }}
                    />
                  </span>

                  <h3 className="mt-5 font-display text-xl leading-tight text-ivory">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {a.text}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
