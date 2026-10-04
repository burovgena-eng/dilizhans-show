"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { ImageCurtain } from "@/components/sections/image-curtain";

/* ============================================================================
 * Cinematic Hero — Bolshoi Theater Edition
 *
 * 400vh tall section. The first 100vh shows the hero overlay (title + CTAs)
 * with the velvet curtain closed behind the title. As the user scrolls:
 *   0.00-0.15  Curtain opens (158 pre-rendered WebP frames, 60fps scrubbing)
 *   0.15-0.20  Pause (curtain fully open)
 *   0.20-0.45  3D fly-through: camera flies past/through the curtain
 *   0.45-0.50  Video fades out — hands off to SubHero section
 *
 * Scroll progress is computed manually from window.scrollY (NOT from
 * useScroll with `target`) so that progress starts at the FIRST scroll
 * pixel. Using useScroll with target + offset ["start start", "end start"]
 * gives scrollYProgress=0 until the sticky header (which sits above Hero in
 * normal flow) has been scrolled past, making the curtain appear static.
 * ============================================================================ */

const EASE = [0.16, 1, 0.3, 1] as const;

export function CinematicHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Manual scroll progress MotionValue (starts at 0 at the very first scroll
  // pixel, regardless of sticky-header offset).
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const total = sectionHeight - vh;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, window.scrollY / total));
      scrollYProgress.set(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollYProgress]);

  // Hero overlay (title + CTA): full while curtain closed, fades as curtain opens
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.08, 0.15], [1, 1, 0]);
  const overlayY = useTransform(scrollYProgress, [0, 0.15], ["0%", "-25%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.92]);

  // Scroll hint fades out as curtain begins to open
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  // Portal glow removed — no SubHero to hand off to on the clean slate.
  // (The archive branch has portalGlow + portalWhite for the star-portal
  // transition into SubHero.)

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "400vh" }}
    >
      {/* === Sticky canvas — covers viewport for the whole journey === */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-onyx">
        {/* Ambient gradient overlays */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-onyx/30 via-transparent to-onyx/40" />

        {/* === Image curtain — 2K quality, 60fps scrubbing === */}
        <ImageCurtain scrollYProgress={scrollYProgress} />

        {/* === Hero overlay (title + CTA) — fades out early ===
            Uses CSS keyframes (not framer-motion) for the title reveal so
            that if framer-motion's RAF is throttled or doesn't initialize
            in the preview iframe, the title still shows on page load. */}
        <motion.div
          style={{ opacity: overlayOpacity, y: overlayY }}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center text-ivory">
            <div
              className="mb-6 text-[11px] uppercase tracking-[0.45em] text-gold/80 hero-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Ателье карнавальных фантазий · с 2013
            </div>

            <h1
              style={{ scale: titleScale }}
              className="font-display text-6xl leading-[0.92] tracking-tight md:text-8xl lg:text-[8rem]"
            >
              <span className="block overflow-hidden">
                <span className="block hero-fade-in-up" style={{ animationDelay: "0.25s" }}>
                  Карнавал
                </span>
              </span>
              <span className="block overflow-hidden">
                <span
                  className="block bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text italic text-transparent hero-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  без компромиссов
                </span>
              </span>
            </h1>

            <p
              className="mt-7 max-w-xl text-base leading-relaxed text-ivory/70 md:text-lg hero-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              Эксклюзивная коллекция из <span className="text-gold">2000+</span> карнавальных,
              национальных и вечерних костюмов для детей и взрослых. Премиум-материалы,
              ручная вышивка, идеальная посадка.
            </p>

            <div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center hero-fade-in-up"
              style={{ animationDelay: "0.8s" }}
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
            </div>
          </div>
        </motion.div>

        {/* === Scroll hint (top of journey) === */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-7 left-1/2 z-50 -translate-x-1/2"
        >
          <div
            className="hero-bounce flex flex-col items-center gap-2 text-ivory/40"
          >
            <span className="text-[10px] uppercase tracking-[0.35em]">Открыть занавес</span>
            <ChevronDown className="h-3.5 w-3.5 text-gold/60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

