"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { CosmicJourney } from "@/components/three/cosmic-journey";

/* ============================================================================
 * Cinematic Hero — Cosmic Journey Edition
 *
 * 250vh tall section. The first 100vh shows the hero overlay (title + CTAs).
 * As the user scrolls, framer-motion's useScroll drives the 3D camera flight
 * from a wide starfield through a nebula to a final glowing star.
 * The overlay fades out by 15% scroll, then the cosmic journey takes over
 * the whole screen until ~95%, where the final star "swallows" the screen
 * and the next section (TrustStrip / Collections) is revealed.
 *
 * The 3D Canvas is sticky (position: fixed) so it covers the viewport for the
 * whole scroll duration; the section is just a tall scroll-trigger spacer.
 * ============================================================================ */

const EASE = [0.16, 1, 0.3, 1] as const;

export function CinematicHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Sync scroll progress to ref for the 3D scene (read every frame in useFrame)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  // Hero overlay opacity: full at 0, fade out by 0.12
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const overlayY = useTransform(scrollYProgress, [0, 0.10], ["0%", "-30%"]);

  // Title scale — slight zoom as we begin the journey
  const titleScale = useTransform(scrollYProgress, [0, 0.10], [1, 0.92]);

  // White flash at the end (88-100% scroll) — "swallow" effect as we crash into the star
  const flashOpacity = useTransform(scrollYProgress, [0.82, 0.95, 1.0], [0, 0.9, 1]);

  // Scroll hint fades out instantly
  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Lock body scroll-snap off during this section (no scroll-snap influence)
  useEffect(() => {
    // No-op; smooth scroll is handled by SmoothScroll provider
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "250vh" }}
    >
      {/* === Sticky 3D canvas — covers viewport during the whole journey === */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-onyx">
        {/* 3D scene */}
        <div className="absolute inset-0">
          <CosmicJourney scrollRef={scrollRef} />
        </div>

        {/* Gradient overlays for cinematic mood */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-onyx/40 via-transparent to-onyx/60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-onyx/30 via-transparent to-onyx/30" />

        {/* === Hero overlay (title + CTA) — fades out early === */}
        <motion.div
          style={{ opacity: overlayOpacity, y: overlayY }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
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

        {/* === Journey progress hint — middle of journey === */}
        <JourneyProgressUI scrollYProgress={scrollYProgress} />

        {/* === Scroll hint (top) === */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-ivory/40"
          >
            <span className="text-[10px] uppercase tracking-[0.35em]">Листайте в космос</span>
            <ChevronDown className="h-3.5 w-3.5 text-gold/60" />
          </motion.div>
        </motion.div>

        {/* === Final white flash — swallows screen === */}
        <motion.div
          style={{ opacity: flashOpacity }}
          className="pointer-events-none absolute inset-0 z-30 bg-white"
        />

        {/* === Vignette/grain for cinematic finish === */}
        <div className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Journey Progress UI — small cinematic HUD showing current "phase" of flight.
 * ---------------------------------------------------------------------------- */
function JourneyProgressUI({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  // Phase labels by scroll progress
  const phases = [
    { at: 0.00, label: "Старт" },
    { at: 0.20, label: "Разгон" },
    { at: 0.45, label: "Туманность" },
    { at: 0.75, label: "Гиперпрыжок" },
    { at: 0.92, label: "Звезда" },
  ];

  const progressBar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      style={{
        opacity: useTransform(scrollYProgress, [0.05, 0.15, 0.88, 0.95], [0, 1, 1, 0]),
      }}
      className="pointer-events-none absolute bottom-10 left-1/2 z-20 w-[min(90vw,560px)] -translate-x-1/2"
    >
      <div className="flex justify-between text-[9px] uppercase tracking-[0.3em] text-gold/60 mb-2">
        {phases.map((p, i) => (
          <PhaseLabel key={i} scrollYProgress={scrollYProgress} at={p.at} label={p.label} />
        ))}
      </div>
      <div className="relative h-px w-full bg-ivory/10">
        <motion.div
          style={{ width: progressBar }}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold via-amber-200 to-gold"
        />
      </div>
    </motion.div>
  );
}

function PhaseLabel({ scrollYProgress, at, label }:
  { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"]; at: number; label: string }) {
  const isActive = useTransform(scrollYProgress, [at - 0.06, at, at + 0.06], [0.4, 1, 0.4]);
  return <motion.span style={{ opacity: isActive }} className="text-ivory/60">{label}</motion.span>;
}
