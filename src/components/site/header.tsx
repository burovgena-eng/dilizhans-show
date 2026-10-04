"use client";

import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import { useScrolled } from "./primitives";
import { Logo3D } from "@/components/three/logo-3d";

export function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(40);

  return (
    <>
      {/* === Top announcement bar — minimal === */}
      <div className="relative z-50 hidden border-b border-gold/10 bg-onyx-soft/60 text-ivory/60 backdrop-blur-sm md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-6 text-[11px] tracking-wide">
          <span>
            {CONTACT.hours} · {CONTACT.closed} · {CONTACT.address}
          </span>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${CONTACT.phone1Href}`}
              className="flex items-center gap-1.5 transition-colors hover:text-gold"
            >
              <Phone className="h-3 w-3 text-gold" />
              {CONTACT.phone1}
            </a>
            <a
              href={`tel:${CONTACT.phone2Href}`}
              className="transition-colors hover:text-gold"
            >
              {CONTACT.phone2}
            </a>
          </div>
        </div>
      </div>

      {/* === Main header === */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "glass-onyx border-b border-gold/10 py-2.5 shadow-luxe"
            : "bg-gradient-to-b from-onyx/80 to-transparent py-4"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Logo — 3D relief of original stylized D + spotlight */}
          <a href="#top" className="group flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <Logo3D />
            </div>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-tight text-ivory">
                Дилижанс<span className="text-gold"> Шоу</span>
              </span>
              <span className="mt-0.5 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Boutique · Costumes · since 2013
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative rounded-md px-3 py-2 text-sm text-ivory/70 transition-colors hover:text-ivory"
              >
                {l.title}
                <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-gold to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
            <a
              href="#booking"
              className="btn-gold hidden px-5 py-2.5 text-sm sm:inline-flex"
            >
              Забронировать примерку
            </a>
            <button
              type="button"
              aria-label="Меню"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-ivory lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-500 lg:hidden",
            open ? "max-h-[600px]" : "max-h-0"
          )}
        >
          <nav className="mx-4 mt-2 flex flex-col gap-1 rounded-2xl border border-gold/10 bg-onyx-card p-3 shadow-luxe">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base text-ivory transition-colors hover:bg-gold/5"
              >
                {l.title}
              </a>
            ))}
            <a
              href="#booking"
              onClick={() => setOpen(false)}
              className="btn-gold mt-2 justify-center px-5 py-3 text-sm"
            >
              Забронировать примерку
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
