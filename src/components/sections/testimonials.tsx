"use client";

import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";
import { Reveal } from "@/components/site/motion-utils";

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

/* ============================================================================
 * MarqueeItem — small horizontal card with avatar initials + name + 5 stars +
 * role. Used in the infinite marquee below the testimonials grid. The list is
 * duplicated so the loop is seamless.
 * ========================================================================== */
function MarqueeItem({
  initials,
  name,
  role,
}: {
  initials: string;
  name: string;
  role: string;
}) {
  return (
    <div className="flex w-[320px] shrink-0 items-center gap-3 rounded-full border border-gold/15 bg-onyx-card px-4 py-2.5 shadow-luxe">
      {/* Avatar */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-emerald to-emerald-deep font-display text-xs font-semibold text-gold">
        {initials}
      </span>
      {/* Name + role */}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold text-ivory">{name}</span>
        <span className="truncate text-[11px] text-muted-foreground">{role}</span>
      </div>
      {/* Stars */}
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3 w-3 fill-gold text-gold"
            strokeWidth={1.5}
          />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  // Duplicate the testimonial list so the marquee loop is seamless
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS];

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

        {/* Reviews grid — each wrapped in <Reveal> with staggered delay */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1} y={30}>
              <article className="group lift-card relative flex h-full flex-col overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-6 transition-colors duration-500 hover:border-gold/45">
                {/* Decorative gold corner accents on hover */}
                <span className="corner-accents pointer-events-none absolute inset-0" />

                {/* Top row: 5 gold stars (no decorative Quote icon) */}
                <div className="flex items-center justify-between">
                  <Stars count={t.rating} />
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
              </article>
            </Reveal>
          ))}
        </div>

        {/* Overall rating summary */}
        <div className="mt-14 flex flex-col items-center gap-4 text-center">
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
        </div>
      </div>

      {/* === Marquee ticker — infinite horizontal scroll, pauses on hover === */}
      <div className="group relative mt-16 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-4 pr-4 group-hover:[animation-play-state:paused]">
          {marqueeItems.map((t, i) => (
            <MarqueeItem
              key={`${t.id}-${i}`}
              initials={t.initials}
              name={t.name}
              role={t.role}
            />
          ))}
        </div>

        {/* Edge fade — soft gradient masks the seam where marquee loops */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-onyx via-transparent to-onyx"
        />
      </div>
    </section>
  );
}
