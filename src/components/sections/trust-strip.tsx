"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { STATS } from "@/lib/data/catalog";

export function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative border-y border-gold/15 bg-onyx-soft text-ivory"
    >
      {/* Top gold divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <span className="font-display text-4xl text-gold md:text-5xl lg:text-6xl">
                {s.value}
              </span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-ivory">
                {s.label}
              </span>
              <span className="mt-1 text-[11px] text-muted-foreground">{s.sub}</span>
              {i < STATS.length - 1 ? (
                <span className="absolute right-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-gold/15 md:block" />
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
