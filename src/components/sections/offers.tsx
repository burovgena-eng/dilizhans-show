"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { OFFERS } from "@/lib/data/catalog";
import { Eyebrow } from "@/components/site/primitives";

function formatPrice(value: number): string {
  return value.toLocaleString("ru-RU");
}

export function Offers() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="offers" className="relative overflow-hidden bg-emerald-deep py-20 text-ivory md:py-28">
      {/* Subtle texture / grain */}
      <div className="grain-overlay absolute inset-0 opacity-60" aria-hidden="true" />
      {/* Radial gold glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading — custom for ivory color overrides */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow className="text-gold">Спецпредложения</Eyebrow>
          <h2 className="max-w-3xl font-display text-4xl leading-[1.05] text-ivory md:text-5xl lg:text-6xl">
            Вечеринки <span className="text-gold-gradient italic">под ключ</span>
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-ivory/70 md:text-lg">
            Готовые тематические решения для корпоративов, свадеб и частных праздников.
            Подберём образы для всей команды — от украшений до обуви.
          </p>
          {/* Ornamental rule */}
          <div className="ornament-rule mt-2 w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">★</span>
          </div>
        </div>

        {/* Cards grid */}
        <div
          ref={ref}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8"
        >
          {OFFERS.map((o, i) => (
            <motion.article
              key={o.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="group lift-card relative flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-onyx/40 backdrop-blur-sm transition-colors duration-500 hover:border-gold/45"
            >
              {/* Image — portrait 3/4 */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={o.image}
                  alt={o.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-onyx/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Badge — top left, gold pill */}
                <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-deep shadow-[0_4px_18px_-4px_rgba(201,169,97,0.7)]">
                  {o.badge}
                </span>

                {/* Tag — top right */}
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full border border-gold/40 bg-onyx/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
                  {o.tag}
                </span>
              </div>

              {/* Bottom content */}
              <div className="relative -mt-16 p-5 pt-0">
                {/* Pull content up over image */}
                <div className="relative z-10">
                  <h3 className="font-display text-2xl leading-tight text-ivory md:text-[1.65rem]">
                    {o.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/70">
                    {o.excerpt}
                  </p>

                  {/* Price + CTA */}
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-gold/15 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/50">
                        Аренда
                      </span>
                      <span className="font-display text-2xl text-gold md:text-3xl">
                        от {formatPrice(o.priceFrom)} ₽
                        <span className="ml-1 text-xs font-sans text-ivory/60">/день</span>
                      </span>
                    </div>
                    <a
                      href="#"
                      className="group/cta inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-emerald-deep"
                    >
                      Подробнее
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
