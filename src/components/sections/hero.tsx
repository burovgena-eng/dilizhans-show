"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Sparkles, ChevronDown, Star, Phone } from "lucide-react";
import { CONTACT, REAL_PHOTOS } from "@/lib/data/catalog";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[92vh] w-full overflow-hidden bg-onyx"
    >
      {/* Parallax background image (REAL photo from dilizhans-show.ru) */}
      <motion.div
        style={{ y: yBg, scale }}
        className="absolute inset-0 -z-10"
      >
        <img
          src={REAL_PHOTOS.hero}
          alt="Дилижанс Шоу — бутик карнавальных и вечерних костюмов"
          className="h-full w-full object-cover object-center img-luxe-strong"
        />
        {/* Dark emerald + onyx overlays for legibility & luxury mood */}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/85 to-onyx/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-transparent to-onyx/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(15,61,46,0.6)_0%,transparent_60%)]" />
        {/* Gold radial accent on right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(201,169,97,0.18)_0%,transparent_55%)]" />
      </motion.div>

      {/* Floating gold particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute block h-1 w-1 rounded-full bg-gold/70"
            style={{
              left: `${(i * 67) % 100}%`,
              top: `${(i * 37) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.9, 0.15],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay absolute inset-0" />

      {/* Vertical brand mark on right edge */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block">
        <span className="vertical-text text-[10px] uppercase tracking-[0.5em] text-ivory/30">
          Novosibirsk · Atelier · 2013
        </span>
      </div>

      {/* Content */}
      <motion.div
        style={{ y: yContent, opacity }}
        className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 py-24 text-ivory"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.4em] text-gold backdrop-blur-sm"
        >
          <Sparkles className="h-3 w-3" />
          Ателье карнавальных фантазий · с 2013
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
        >
          Карнавал
          <br />
          <span className="text-gold-gradient italic">без компромиссов</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg"
        >
          Эксклюзивная коллекция из{" "}
          <span className="text-gold">2000+</span> карнавальных, национальных и
          вечерних костюмов для детей и взрослых. Премиум-материалы, ручная
          вышивка, идеальная посадка.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href="#collections"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-7 py-3.5 text-sm font-semibold text-onyx shadow-[0_10px_40px_-10px_rgba(201,169,97,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform duration-300 hover:scale-[1.03]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ivory/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Смотреть коллекции
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
          <a
            href="#assistant"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/20 bg-ivory/5 px-7 py-3.5 text-sm font-medium text-ivory backdrop-blur-sm transition-colors hover:border-gold/50 hover:bg-gold/5"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            Подобрать образ с AI
          </a>
        </motion.div>

        {/* Mini rating + phone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-12 flex flex-col gap-4 text-ivory/75 sm:flex-row sm:items-center sm:gap-8"
        >
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
            <span className="text-xs">
              <span className="font-semibold text-ivory">4.9</span> · 850+ отзывов
            </span>
          </div>
          <span className="hidden h-4 w-px bg-ivory/20 sm:block" />
          <a
            href={`tel:${CONTACT.phone1Href}`}
            className="flex items-center gap-2 text-xs transition-colors hover:text-gold"
          >
            <Phone className="h-3.5 w-3.5 text-gold" />
            {CONTACT.phone1}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-ivory/50"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Листайте</span>
          <ChevronDown className="h-4 w-4 text-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
