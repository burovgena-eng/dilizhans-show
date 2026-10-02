"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import { REAL_PHOTOS } from "@/lib/data/catalog";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax for layered depth — different layers move at different rates
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const bgFilter = useTransform(
    scrollYProgress,
    [0, 1],
    ["brightness(0.78) contrast(1.12) saturate(0.88)", "brightness(0.5) contrast(1.15) saturate(0.85)"]
  );

  // Mouse-based subtle 3D tilt on the entire hero content
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), { stiffness: 80, damping: 20 });
  const rotY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), { stiffness: 80, damping: 20 });

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
      {/* === Layered parallax background — real depth === */}
      <motion.div style={{ y: yBg, scale }} className="absolute inset-0">
        <motion.img
          src={REAL_PHOTOS.hero}
          alt="Дилижанс Шоу — бутик карнавальных и вечерних костюмов"
          className="h-full w-full object-cover object-center"
          style={{ filter: bgFilter }}
        />
        {/* Dark emerald + onyx overlays — gradient layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/80 to-onyx/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-transparent to-onyx/50" />
        {/* Subtle radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(15,61,46,0.4)_0%,transparent_55%)]" />
      </motion.div>

      {/* === Middle parallax layer — subtle gold ambient glow === */}
      <motion.div
        style={{ y: yMid }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute right-[8%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute left-[10%] bottom-[15%] h-[25vh] w-[25vh] rounded-full bg-emerald/12 blur-3xl" />
      </motion.div>

      {/* === Sparse, elegant gold particles (only 6) === */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { left: "12%", top: "22%", d: 6, s: 1.2 },
          { left: "78%", top: "18%", d: 7.5, s: 1 },
          { left: "68%", top: "68%", d: 5.5, s: 1.4 },
          { left: "22%", top: "78%", d: 8, s: 0.9 },
          { left: "45%", top: "35%", d: 9, s: 0.8 },
          { left: "88%", top: "55%", d: 6.5, s: 1.1 },
        ].map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gold/40"
            style={{ left: p.left, top: p.top, width: p.s, height: p.s }}
            animate={{
              y: [0, -28, 0],
              opacity: [0.15, 0.7, 0.15],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.d,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* === Content — with subtle 3D tilt for depth === */}
      <motion.div
        style={{ y: yContent, opacity, rotateX: rotX, rotateY: rotY, transformPerspective: 2000 }}
        className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 py-24 text-ivory"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 inline-flex w-fit items-center gap-2 text-[11px] uppercase tracking-[0.45em] text-gold/80"
        >
          <span className="h-px w-8 bg-gold/40" />
          Ателье карнавальных фантазий · с 2013
        </motion.div>

        {/* Headline — split text reveal with mask, no italic for impact */}
        <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.1 }}
            >
              Карнавал
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-gold-gradient italic"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.25 }}
            >
              без компромиссов
            </motion.span>
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-7 max-w-xl text-base leading-relaxed text-ivory/70 md:text-lg"
        >
          Эксклюзивная коллекция из <span className="text-gold">2000+</span>{" "}
          карнавальных, национальных и вечерних костюмов для детей и взрослых.
          Премиум-материалы, ручная вышивка, идеальная посадка.
        </motion.p>

        {/* CTAs — refined buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a href="#collections" className="btn-gold px-7 py-3.5 text-sm">
            Смотреть коллекции
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href="#assistant" className="btn-outline px-7 py-3.5 text-sm">
            <Sparkles className="h-4 w-4 text-gold" />
            Подобрать образ с AI
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint — subtle */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
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
