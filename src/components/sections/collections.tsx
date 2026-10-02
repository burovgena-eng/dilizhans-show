"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS, type Audience, type Collection } from "@/lib/data/catalog";
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

/** ============================================================================
 * CollectionCard — the inner card content. Same design on mobile + desktop,
 * only the outer width differs. Uses TiltCard for 3D cursor-follow tilt.
 * ========================================================================== */
function CollectionCard({ c }: { c: Collection }) {
  return (
    <TiltCard>
      <a
        href="#catalog"
        className="group relative block h-full overflow-hidden rounded-lg border border-gold/15 bg-onyx-card shadow-luxe transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lift-card hover:shadow-luxe-hover"
      >
        {/* Image container — portrait 4/5 */}
        <div className="relative aspect-[4/5] h-full overflow-hidden">
          <img
            src={c.image}
            alt={c.title}
            loading="lazy"
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
  );
}

export function Collections() {
  // Mobile vertical grid inView
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileInView = useInView(mobileRef, { once: true, margin: "-80px" });

  // Desktop horizontal scroll progress
  const desktopRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ["start start", "end end"],
  });
  // Translate the horizontal track from 0% to -66% as the user scrolls through
  // the pinned section. -66% is enough to slide all 6 cards past the viewport.
  const xTransform: MotionValue<string> = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "-66%"]
  );
  // Progress dots — highlight the active card index based on scroll progress.
  const activeIndex = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <section
      id="collections"
      className="relative bg-onyx bg-emerald-radial"
    >
      {/* === MOBILE / TABLET (< lg) — vertical grid === */}
      <div className="py-20 md:py-28 lg:hidden">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            center
            eyebrow="Коллекции"
            title="Жемчужины нашей коллекции"
            subtitle="Шесть ключевых направлений нашей коллекции из 2000+ костюмов."
          />

          <div
            ref={mobileRef}
            className="perspective-1000 mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            {COLLECTIONS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 30 }}
                animate={mobileInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <CollectionCard c={c} />
              </motion.div>
            ))}
          </div>

          {/* Bottom centered CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={mobileInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-14 flex justify-center"
          >
            <a href="#catalog" className="btn-gold px-7 py-3 text-sm">
              Смотреть все 2000+ костюмов
            </a>
          </motion.div>
        </div>
      </div>

      {/* === DESKTOP (≥ lg) — pinned horizontal scroll === */}
      {/* Wrapper sets the scroll distance — 350vh gives ~250vh of horizontal
          travel while the inner div is sticky at h-screen. */}
      <div ref={desktopRef} className="hidden lg:block lg:h-[350vh]">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          {/* Heading */}
          <div className="mx-auto mb-8 w-full max-w-7xl px-6">
            <SectionHeading
              center
              eyebrow="Коллекции"
              title="Жемчужины нашей коллекции"
              subtitle="Шесть ключевых направлений нашей коллекции из 2000+ костюмов."
            />
          </div>

          {/* Horizontal track — translateX via scroll progress */}
          <motion.div
            style={{ x: xTransform }}
            className="flex items-center gap-6 pl-[6vw] pr-[6vw] will-change-transform"
          >
            {COLLECTIONS.map((c) => (
              <div
                key={c.id}
                className="w-[40vw] shrink-0 perspective-1000"
                style={{ transformStyle: "preserve-3d" }}
              >
                <CollectionCard c={c} />
              </div>
            ))}
            {/* Tail card — CTA */}
            <div className="flex w-[40vw] shrink-0 items-center">
              <a
                href="#catalog"
                className="group flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-gold/15 bg-onyx-card p-8 text-center shadow-luxe transition-colors duration-500 hover:border-gold/45"
              >
                <span className="font-display text-3xl leading-tight text-gold-gradient">
                  2000+
                </span>
                <span className="text-sm text-ivory/70">
                  костюмов в коллекции
                </span>
                <span className="btn-gold mt-2 px-6 py-3 text-sm">
                  Смотреть каталог
                </span>
              </a>
            </div>
          </motion.div>

          {/* Progress dots */}
          <div className="mx-auto mt-8 flex items-center gap-2">
            {COLLECTIONS.map((c, i) => (
              <ProgressDot
                key={c.id}
                index={i}
                activeIndex={activeIndex}
              />
            ))}
          </div>

          {/* Swipe / scroll hint */}
          <div className="mx-auto mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-ivory/40">
            <span>Прокрутите вниз</span>
            <ArrowRight className="h-3 w-3 rotate-90 text-gold/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * ProgressDot — single dot in the horizontal-scroll progress indicator.
 * Fills with gold when its index matches the active card.
 * ========================================================================== */
function ProgressDot({
  index,
  activeIndex,
}: {
  index: number;
  activeIndex: MotionValue<number>;
}) {
  // Use a derived transform to interpolate between active states.
  // Dot is "active" when activeIndex is within [index - 0.5, index + 0.5].
  const opacity = useTransform(
    activeIndex,
    [index - 0.5, index, index + 0.5],
    [0.25, 1, 0.25]
  );
  const scale = useTransform(
    activeIndex,
    [index - 0.5, index, index + 0.5],
    [1, 1.4, 1]
  );
  return (
    <motion.span
      aria-hidden
      style={{ opacity, scale }}
      className="h-1.5 w-6 rounded-full bg-gold"
    />
  );
}
