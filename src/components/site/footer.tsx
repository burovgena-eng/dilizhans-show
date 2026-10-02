"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  MessageCircle,
  Send,
  Mail,
  Share2,
  Star,
} from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/lib/data/catalog";
import { toast } from "sonner";

const SOCIAL_ICONS = [
  {
    title: "WhatsApp",
    href: CONTACT.whatsapp,
    Icon: MessageCircle,
  },
  {
    title: "Telegram",
    href: CONTACT.telegram,
    Icon: Send,
  },
  {
    title: "ВКонтакте",
    href: CONTACT.vk,
    Icon: Share2,
  },
  {
    title: "E-mail",
    href: "mailto:info@dilizhans-show.ru",
    Icon: Mail,
  },
] as const;

const FOOTER_EYEBROW_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.3em] text-gold";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Subtle vertical parallax on the brand column as the footer scrolls by.
  const yBrand = useTransform(scrollYProgress, [0, 1], [40, -40]);

  function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast.error("Введите корректный e-mail", {
        description: "Например: you@example.com",
      });
      return;
    }
    toast.success("Спасибо за подписку!", {
      description: "Мы будем присылать новости о новых коллекциях и акциях.",
    });
    setEmail("");
  }

  return (
    <motion.footer
      ref={ref}
      className="mt-auto bg-onyx text-ivory"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top decorative gold gradient border — animates width 0 → 100% on view */}
      <motion.div
        className="divider-gold-fade w-full"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ transformOrigin: "left" }}
      />

      {/* Soft grain overlay */}
      <div
        className="grain-overlay pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* === Column 1 — Brand (with subtle scroll parallax) === */}
          <motion.div style={{ y: yBrand }} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-emerald to-emerald-deep text-gold shadow-inner">
                <span className="font-display text-2xl leading-none">Д</span>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-xl text-ivory">
                  Дилижанс<span className="text-gold"> Шоу</span>
                </span>
                <span className="mt-1 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                  Boutique · Costumes · since 2013
                </span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Бутик карнавальных фантазий · с 2013
            </p>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-gold/30 bg-emerald-deep/30 px-3.5 py-1.5">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                ))}
              </span>
              <span className="text-xs text-ivory/75">
                <span className="font-semibold text-gold-bright">4.9</span> ·
                850+ отзывов
              </span>
            </div>
          </motion.div>

          {/* === Column 2 — Навигация === */}
          <nav className="flex flex-col gap-4">
            <h3 className={FOOTER_EYEBROW_CLASS}>Навигация</h3>
            <ul className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block py-1 text-sm text-ivory/70 transition-colors hover:text-gold"
                  >
                    {l.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#booking"
                  className="block py-1 text-sm text-ivory/70 transition-colors hover:text-gold"
                >
                  Бронирование
                </a>
              </li>
            </ul>
          </nav>

          {/* === Column 3 — Контакты === */}
          <div className="flex flex-col gap-4">
            <h3 className={FOOTER_EYEBROW_CLASS}>Контакты</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-sm text-ivory/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex flex-col gap-1">
                <a
                  href={`tel:${CONTACT.phone1Href}`}
                  className="text-sm text-ivory transition-colors hover:text-gold"
                >
                  {CONTACT.phone1}
                </a>
                <a
                  href={`tel:${CONTACT.phone2Href}`}
                  className="text-sm text-ivory transition-colors hover:text-gold"
                >
                  {CONTACT.phone2}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-ivory/75">
                <Clock className="h-4 w-4 shrink-0 text-gold" />
                <span>
                  {CONTACT.hours}
                  <span className="ml-2 text-xs text-gold">{CONTACT.closed}</span>
                </span>
              </li>
            </ul>
          </div>

          {/* === Column 4 — Рассылка + соцсети === */}
          <div className="flex flex-col gap-4">
            <h3 className={FOOTER_EYEBROW_CLASS}>Рассылка</h3>
            <p className="text-xs text-muted-foreground">
              Новые поступления и закрытые распродажи
            </p>
            <form onSubmit={onSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="E-mail для подписки"
                className="w-full rounded-full border border-gold/20 bg-onyx-soft px-4 py-2 text-sm text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
              <button
                type="submit"
                aria-label="Подписаться"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-emerald-deep shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)] transition-transform hover:scale-105"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_ICONS.map(({ title, href, Icon }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={title}
                  title={title}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:border-gold hover:bg-gold/5 hover:text-gold-bright"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gold/10 pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2013–{currentYear} Дилижанс Шоу. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <a
              href="#"
              className="transition-colors hover:text-gold"
            >
              Политика конфиденциальности
            </a>
            <span aria-hidden className="text-gold/60">·</span>
            <a
              href="#"
              className="transition-colors hover:text-gold"
            >
              Договор проката
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
