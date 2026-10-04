"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
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

/** Marquee strip — 8 costume category names that scroll continuously. */
const TICKER_ITEMS = [
  "Новогодние",
  "Ретро · Гэтсби",
  "Исторические",
  "Народы мира",
  "Бальные платья",
  "Хэллоуин",
  "Стимпанк",
  "Хогвартс",
];

/** Staggered column fade-in variants — each column delayed by i * 0.12s. */
const columnVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

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

      {/* === Ticker marquee — motion.dev pattern, 2 copies for seamless loop === */}
      <div className="relative overflow-hidden border-b border-gold/10 py-4">
        <div className="flex w-max animate-marquee items-center gap-12">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((label, i) => (
            <span
              key={i}
              className="flex items-center gap-3 font-display text-sm italic text-ivory/40"
            >
              {label}
              <span className="h-1 w-1 rotate-45 bg-gold/50" />
            </span>
          ))}
        </div>
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-onyx to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-onyx to-transparent" />
      </div>

      {/* Soft grain overlay */}
      <div
        className="grain-overlay pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* === Column 1 — Brand (with subtle scroll parallax) === */}
          <motion.div
            custom={0}
            variants={columnVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            style={{ y: yBrand }}
            className="flex flex-col gap-4"
          >
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
          <motion.nav
            custom={1}
            variants={columnVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col gap-4"
          >
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
            </ul>
          </motion.nav>

          {/* === Column 3 — Контакты === */}
          <motion.div
            custom={2}
            variants={columnVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col gap-4"
          >
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
          </motion.div>

          {/* === Column 4 — Рассылка + соцсети === */}
          <motion.div
            custom={3}
            variants={columnVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col gap-4"
          >
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
              {/* Small outline round button — not the large gradient gold button */}
              <button
                type="submit"
                aria-label="Подписаться"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:border-gold hover:bg-gold/5 hover:text-gold-bright"
              >
                <ArrowRight className="h-3.5 w-3.5" />
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
          </motion.div>
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
