"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { GALLERY } from "@/lib/data/catalog";
import { SectionHeading, GoldDivider } from "@/components/site/primitives";

/** Social pill button with brand neutral styling (gold ring). */
function SocialPill({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-deep transition-colors duration-300 hover:bg-gold hover:text-emerald-deep"
    >
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}

export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="gallery" className="relative bg-ivory-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Портфолио"
          title={
            <>
              Образы наших{" "}
              <span className="text-gold-gradient italic">клиентов</span>
            </>
          }
          subtitle="Живая подборка снимков из нашего бутика и фотосессий клиентов. Новые образы появляются каждую неделю."
        />

        <GoldDivider className="mx-auto mt-8 w-full max-w-md" />

        {/* Masonry grid */}
        <div
          ref={ref}
          className="mt-12 columns-1 gap-5 sm:columns-2 md:gap-6 lg:columns-3 xl:columns-4 [&>*]:mb-5 md:[&>*]:mb-6"
        >
          {GALLERY.map((g, i) => (
            <motion.figure
              key={`${g.src}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: (i % 4) * 0.08 + Math.floor(i / 4) * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group lift-card relative block w-full overflow-hidden rounded-2xl border border-border bg-card break-inside-avoid"
            >
              {/* Image (natural aspect ratio via height: auto) */}
              <div className="relative overflow-hidden">
                <img
                  src={g.src}
                  alt={g.title}
                  loading="lazy"
                  className="block h-auto w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />

                {/* Dark emerald overlay slides up on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Title + tag slide up */}
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-1 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="inline-flex w-fit items-center rounded-full border border-gold/45 bg-onyx/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
                    {g.tag}
                  </span>
                  <span className="font-display text-lg leading-tight text-ivory md:text-xl">
                    {g.title}
                  </span>
                </figcaption>

                {/* Gold corner accent on hover */}
                <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </motion.figure>
          ))}
        </div>

        {/* Bottom CTA with social pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-col items-center gap-6"
        >
          <div className="ornament-rule w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">◆</span>
          </div>
          <p className="font-display text-xl text-emerald-deep md:text-2xl">
            Следите за новыми образами в наших соцсетях
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SocialPill label="ВКонтакте" />
            <SocialPill label="Telegram" />
            <SocialPill label="Instagram" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
