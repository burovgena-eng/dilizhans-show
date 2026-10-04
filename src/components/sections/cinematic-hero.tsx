"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { RealisticCosmos } from "@/components/three/realistic-cosmos";
import { TheaterCurtain } from "@/components/sections/theater-curtain";

/* ============================================================================
 * Cinematic Hero — Bolshoi Theater Edition
 *
 * 220vh tall section. The first 100vh shows the hero overlay (title + CTAs)
 * with the velvet curtain closed behind the title. As the user scrolls:
 *   0.00-0.10  Curtain opens, revealing the cosmic space behind it
 *   0.10-0.85  Camera flies through space (past 3 planets + gas giant + nebulae)
 *   0.85-1.00  Approaches the final star; the star "swallows" the screen as a
 *              portal into the rest of the site
 *
 * No HUD / phase labels (per user request). No streaks, no god rays.
 * ============================================================================ */

const EASE = [0.16, 1, 0.3, 1] as const;

export function CinematicHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  // Hero overlay (title + CTA): full at start, fades out by 5% scroll
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.04, 0.08], [1, 1, 0]);
  const overlayY = useTransform(scrollYProgress, [0, 0.08], ["0%", "-25%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.08], [1, 0.92]);

  // Scroll hint fades out instantly
  const hintOpacity = useTransform(scrollYProgress, [0, 0.025], [1, 0]);

  // Final "portal" flash — gradual warm gold at first, then white as we
  // crash through the star surface (scroll 0.85..1.0)
  const portalGlow = useTransform(scrollYProgress, [0.75, 0.95], [0, 0.7]);
  const portalWhite = useTransform(scrollYProgress, [0.90, 1.0], [0, 1]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "500vh" }}
    >
      {/* === Sticky canvas — covers viewport for the whole journey === */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-onyx">
        {/* Realistic 3D cosmos */}
        <div className="absolute inset-0">
          <RealisticCosmos scrollRef={scrollRef} />
        </div>

        {/* Ambient gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-onyx/40 via-transparent to-onyx/50" />

        {/* === Theater curtain — opens on scroll 0..0.12 === */}
        <TheaterCurtain scrollYProgress={scrollYProgress} />

        {/* === Hero overlay (title + CTA) — fades out early === */}
        <motion.div
          style={{ opacity: overlayOpacity, y: overlayY }}
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center text-ivory">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-6 text-[11px] uppercase tracking-[0.45em] text-gold/80"
            >
              Ателье карнавальных фантазий · с 2013
            </motion.div>

            <motion.h1
              style={{ scale: titleScale }}
              className="font-display text-6xl leading-[0.92] tracking-tight md:text-8xl lg:text-[8rem]"
            >
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
                >
                  Карнавал
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text italic text-transparent"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
                >
                  без компромиссов
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-7 max-w-xl text-base leading-relaxed text-ivory/70 md:text-lg"
            >
              Эксклюзивная коллекция из <span className="text-gold">2000+</span> карнавальных,
              национальных и вечерних костюмов для детей и взрослых. Премиум-материалы,
              ручная вышивка, идеальная посадка.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <a
                href="#catalog"
                className="btn-gold pointer-events-auto px-7 py-3.5"
              >
                Смотреть каталог
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#booking"
                className="btn-outline pointer-events-auto px-7 py-3.5"
              >
                Забронировать примерку
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* === Scroll hint (top of journey) === */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-7 left-1/2 z-40 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-ivory/40"
          >
            <span className="text-[10px] uppercase tracking-[0.35em]">Открыть занавес</span>
            <ChevronDown className="h-3.5 w-3.5 text-gold/60" />
          </motion.div>
        </motion.div>

        {/* === Portal glow — warm gold halo as we approach the star === */}
        <motion.div
          style={{ opacity: portalGlow }}
          className="pointer-events-none absolute inset-0 z-50"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,200,100,0.45)_0%,rgba(255,150,80,0.2)_30%,transparent_60%)]" />
        </motion.div>

        {/* === Final white flash — portal into the rest of the site === */}
        <motion.div
          style={{ opacity: portalWhite }}
          className="pointer-events-none absolute inset-0 z-[60] bg-white"
        />

        {/* Vignette for cinematic finish */}
        <div className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
      </div>
    </section>
  );
}
