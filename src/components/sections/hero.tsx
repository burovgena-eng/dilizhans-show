"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useSyncExternalStore } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { HeroParticles3D } from "@/components/three/hero-particles";

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yOrbs = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotX = useSpring(useTransform(mouseY, [0, 1], [2, -2]), { stiffness: 60, damping: 20 });
  const rotY = useSpring(useTransform(mouseX, [0, 1], [-2, 2]), { stiffness: 60, damping: 20 });

  function onMouseMove(e: React.MouseEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative min-h-[92vh] w-full overflow-hidden bg-onyx"
    >
      {/* === Layer 1: Gradient mesh background === */}
      <motion.div style={{ y: yBg }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_20%_30%,rgba(26,90,66,0.32)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_75%,rgba(201,169,97,0.18)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/60 via-transparent to-onyx" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/30 to-onyx/60" />
      </motion.div>

      {/* === Layer 2: Floating ambient orbs === */}
      <motion.div style={{ y: yOrbs }} className="pointer-events-none absolute inset-0">
        {[
          { left: "15%", top: "30%", size: 300, dur: 24, opacity: 0.05, color: "gold" },
          { left: "75%", top: "55%", size: 400, dur: 30, opacity: 0.04, color: "emerald" },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              left: orb.left, top: orb.top, width: orb.size, height: orb.size,
              opacity: orb.opacity,
              background: orb.color === "gold"
                ? "radial-gradient(circle, #C9A961 0%, transparent 70%)"
                : "radial-gradient(circle, #1A5A42 0%, transparent 70%)",
            }}
            animate={{ y: [0, -40, 0], x: [0, 25, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: orb.dur, repeat: Infinity, delay: i * 1.5, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* === Layer 3: 3D particle field — Three.js === */}
      <div className="pointer-events-none absolute inset-0">
        {mounted && <HeroParticles3D />}
      </div>

      {/* === Vertical brand mark === */}
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
        <span className="vertical-text text-[10px] uppercase tracking-[0.5em] text-ivory/25">
          Novosibirsk · Atelier · 2013
        </span>
      </div>

      {/* === Content — with subtle 3D tilt === */}
      <motion.div
        style={{ y: yContent, opacity, rotateX: rotX, rotateY: rotY, transformPerspective: 2000 }}
        className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 py-24 text-ivory"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 text-[11px] uppercase tracking-[0.45em] text-gold/80"
        >
          Ателье карнавальных фантазий · с 2013
        </motion.div>

        <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]">
          <span className="block overflow-hidden">
            <motion.span className="block" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: EASE, delay: 0.1 }}>
              Карнавал
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block text-gold-gradient italic" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: EASE, delay: 0.25 }}>
              без компромиссов
            </motion.span>
          </span>
        </h1>

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
          <a href="#catalog" className="btn-gold px-7 py-3.5">
            Смотреть каталог
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <a href="#booking" className="btn-outline px-7 py-3.5">
            Забронировать примерку
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div style={{ opacity }} className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-ivory/40"
        >
          <span className="text-[10px] uppercase tracking-[0.35em]">Листайте</span>
          <ChevronDown className="h-3.5 w-3.5 text-gold/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
