"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { OFFERS } from "@/lib/data/catalog";
import { Eyebrow } from "@/components/site/primitives";
import { TiltCard } from "@/components/site/motion-utils";

/** Shared luxury easing — slow-out cubic for refined reveals. */
const EASE = [0.16, 1, 0.3, 1] as const;

/** Format integer as RU price with thin space. */
function formatPrice(value: number): string {
  return value.toLocaleString("ru-RU");
}

export function Offers() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="offers"
      className="relative overflow-hidden bg-onyx-soft bg-gold-radial py-20 text-ivory md:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading — custom for ivory color overrides on dark */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow>Спецпредложения</Eyebrow>
          <h2 className="max-w-3xl font-display text-4xl leading-[1.05] text-ivory md:text-5xl">
            Вечеринки под ключ
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Готовые тематические решения для корпоративов, свадеб и частных
            праздников. Подберём образы для всей команды — от украшений до обуви.
          </p>
        </div>

        {/* Cards grid — perspective wrapper for refined 3D depth */}
        <div
          ref={ref}
          className="perspective-1000 mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {OFFERS.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <TiltCard>
                <article
                  className="group relative block overflow-hidden rounded-lg border border-gold/15 bg-onyx-card shadow-luxe transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lift-card hover:shadow-luxe-hover"
                >
                  {/* Image — portrait 3/4 */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <motion.img
                      src={o.image}
                      alt={o.title}
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
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
                    {/* 1px gold inset border on hover */}
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/0 transition-colors duration-500 group-hover:ring-gold/25" />
                    {/* Decorative gold corner accents — subtle 16px L-shapes on hover */}
                    <span
                      className="corner-accents pointer-events-none absolute inset-0"
                      aria-hidden="true"
                    />

                    {/* Badge — top-left, refined glass-gold pill */}
                    <span className="glass-gold absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-gold">
                      {o.badge}
                    </span>

                    {/* Tag — top-right, muted */}
                    <span className="absolute right-4 top-4 text-[10px] font-medium uppercase tracking-wider text-ivory/50">
                      {o.tag}
                    </span>
                  </div>

                  {/* Bottom content — overlaid on image bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-2xl leading-tight text-ivory">
                      {o.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ivory/60">
                      {o.excerpt}
                    </p>

                    {/* Price + CTA */}
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-gold/15 pt-3">
                      <span className="font-display text-base text-gold">
                        от {formatPrice(o.priceFrom)} ₽
                        <span className="ml-1 text-xs font-normal text-ivory/55">
                          /день
                        </span>
                      </span>
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-ivory/70 transition-colors group-hover:text-gold"
                      >
                        Подробнее
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
