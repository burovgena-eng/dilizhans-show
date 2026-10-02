"use client";

import { useState } from "react";
import { Menu, X, Phone, Clock, Sparkles } from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import { useScrolled } from "./primitives";

export function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(40);

  return (
    <>
      {/* === Top announcement bar === */}
      <div className="relative z-50 hidden bg-emerald-deep text-ivory/80 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-[11px] tracking-wide">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-gold" />
              {CONTACT.hours} · {CONTACT.closed}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-gold" />
              Бесплатная примерка и подгон по фигуре
            </span>
          </div>
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
            ? "glass-ivory border-b border-gold/20 py-2 shadow-[0_10px_40px_-20px_rgba(15,61,46,0.25)]"
            : "bg-transparent py-4"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <a href="#top" className="group flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-emerald to-emerald-deep text-gold shadow-inner">
              <span className="font-display text-xl leading-none">Д</span>
              <span className="absolute inset-0 rounded-full bg-gold/0 transition-colors duration-500 group-hover:bg-gold/10" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-tight text-emerald-deep">
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
                className="relative rounded-md px-3 py-2 text-sm text-emerald-deep/80 transition-colors hover:text-emerald-deep"
              >
                {l.title}
                <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-gold to-transparent transition-transform duration-300 hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
            <a
              href="#assistant"
              className="hidden items-center gap-2 rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-5 py-2.5 text-sm font-semibold text-emerald-deep shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)] transition-transform duration-300 hover:scale-[1.03] sm:flex"
            >
              <Sparkles className="h-4 w-4" />
              Подобрать образ
            </a>
            <button
              type="button"
              aria-label="Меню"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-emerald-deep lg:hidden"
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
          <nav className="mx-4 mt-2 flex flex-col gap-1 rounded-2xl border border-gold/20 bg-ivory p-3 shadow-xl">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base text-emerald-deep transition-colors hover:bg-emerald/5"
              >
                {l.title}
              </a>
            ))}
            <a
              href="#assistant"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-5 py-3 text-sm font-semibold text-emerald-deep"
            >
              <Sparkles className="h-4 w-4" />
              Подобрать образ с AI-стилистом
            </a>
            <a
              href={`tel:${CONTACT.phone1Href}`}
              className="flex items-center justify-center gap-2 px-5 py-3 text-sm text-emerald-deep"
            >
              <Phone className="h-4 w-4 text-gold" />
              {CONTACT.phone1}
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
