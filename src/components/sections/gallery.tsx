"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { GALLERY, CONTACT, type Audience } from "@/lib/data/catalog";
import { SectionHeading } from "@/components/site/primitives";

/** Map audience codes to Russian labels for the lightbox badge. */
const AUDIENCE_LABEL: Record<Audience, string> = {
  adults: "Для взрослых",
  children: "Для детей",
  all: "Универсально",
};

/** Social pills data — wired to real CONTACT links. */
const SOCIALS = [
  { label: "ВКонтакте", href: CONTACT.vk },
  { label: "Telegram", href: CONTACT.telegram },
  { label: "WhatsApp", href: CONTACT.whatsapp },
];

export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  // -1 = closed; 0..GALLERY.length-1 = open at that index
  const [activeIndex, setActiveIndex] = useState(-1);
  const isOpen = activeIndex >= 0;

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  // Cycle forward with wrap-around (11 → 0)
  const goNext = useCallback(() => {
    setActiveIndex((i) => (i < 0 ? 0 : (i + 1) % GALLERY.length));
  }, []);

  // Cycle backward with wrap-around (0 → 11)
  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i <= 0 ? GALLERY.length - 1 : i - 1));
  }, []);

  // Keyboard: Escape closes, ArrowLeft prev, ArrowRight next (only while open)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeLightbox, goNext, goPrev]);

  // Body scroll lock while modal is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original || "";
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const active = isOpen ? GALLERY[activeIndex] : null;

  return (
    <section
      id="gallery"
      className="relative bg-onyx bg-emerald-radial py-20 md:py-28"
    >
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
          subtitle="Реальные фотографии из нашей коллекции — каждая из 2000+ доступна к аренде."
        />

        {/* Masonry grid */}
        <div
          ref={ref}
          className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
        >
          {GALLERY.map((item, i) => (
            <motion.button
              key={`${item.src}-${i}`}
              type="button"
              onClick={() => openLightbox(i)}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: (i % 4) * 0.08 + Math.floor(i / 4) * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              aria-label={`Открыть образ: ${item.title}`}
              className="group lift-card corner-accents relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border border-gold/15 bg-onyx-card text-left"
            >
              <div className="relative">
                {/* Image (natural aspect ratio) */}
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="img-luxe h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />

                {/* Dark emerald overlay slides up on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Hover content: tag pill + title */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="glass-gold inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
                    {item.tag}
                  </span>
                  <span className="font-display text-lg leading-tight text-ivory">
                    {item.title}
                  </span>
                </div>

                {/* Zoom icon top-right on hover */}
                <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-onyx/60 text-gold opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* === Social CTA === */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-col items-center gap-6"
        >
          <div className="ornament-rule w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">◆</span>
          </div>
          <p className="font-display text-xl text-ivory md:text-2xl">
            Следите за новыми образами в наших соцсетях
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-5 py-2 text-sm text-ivory transition hover:border-gold hover:bg-gold/5"
              >
                {s.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* === Lightbox modal viewer === */}
      <AnimatePresence mode="wait">
        {isOpen && active ? (
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-onyx/95 p-4 backdrop-blur-md md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl border border-gold/30 bg-onyx-card md:flex-row md:overflow-hidden"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Закрыть"
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-onyx-soft/80 text-ivory transition hover:border-gold hover:text-gold"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Prev arrow */}
              <button
                type="button"
                onClick={goPrev}
                aria-label="Предыдущий образ"
                className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 bg-onyx-soft/70 text-ivory transition hover:border-gold hover:text-gold md:left-3"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Next arrow */}
              <button
                type="button"
                onClick={goNext}
                aria-label="Следующий образ"
                className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 bg-onyx-soft/70 text-ivory transition hover:border-gold hover:text-gold md:right-3"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Left: large image */}
              <div className="flex flex-1 items-center justify-center bg-onyx p-4 md:p-6">
                <img
                  src={active.src}
                  alt={active.title}
                  className="img-luxe max-h-[55vh] w-auto max-w-full object-contain md:max-h-[80vh]"
                />
              </div>

              {/* Right: details panel */}
              <aside className="flex w-full flex-col gap-4 border-t border-gold/15 bg-onyx-card p-6 md:w-80 md:border-l md:border-t-0">
                <span className="glass-gold inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
                  {active.tag}
                </span>
                <h3 className="font-display text-3xl leading-tight text-ivory">
                  {active.title}
                </h3>
                <p className="text-sm leading-relaxed text-ivory/70">
                  {active.description}
                </p>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald/40 bg-emerald-deep/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-ivory">
                  {AUDIENCE_LABEL[active.audience]}
                </span>

                <div className="divider-gold-fade my-1" />

                <a
                  href="#booking"
                  onClick={closeLightbox}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-bright to-gold px-5 py-3 text-sm font-semibold uppercase tracking-wider text-onyx transition hover:from-gold hover:to-gold-deep"
                >
                  Забронировать этот образ
                  <ArrowRight className="h-4 w-4" />
                </a>

                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Все костюмы можно примерить в бутике на Державина 13
                </p>
              </aside>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
