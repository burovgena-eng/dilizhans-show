"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Clock, Phone, ArrowUpRight, Navigation } from "lucide-react";
import { Eyebrow } from "@/components/site/primitives";
import { CONTACT } from "@/lib/data/catalog";

const INFO_CARDS = [
  {
    icon: MapPin,
    title: "Адрес",
    lines: [CONTACT.address, "Новосибирск, Центральный район"],
  },
  {
    icon: Clock,
    title: "Часы работы",
    lines: [CONTACT.hours, CONTACT.closed],
  },
  {
    icon: Phone,
    title: "Телефоны",
    lines: [CONTACT.phone1, CONTACT.phone2],
  },
];

const SOCIALS = [
  {
    title: "ВКонтакте",
    href: CONTACT.vk,
    short: "VK",
  },
  {
    title: "Telegram",
    href: CONTACT.telegram,
    short: "TG",
  },
  {
    title: "WhatsApp",
    href: CONTACT.whatsapp,
    short: "WA",
  },
];

const MAPS_LINK =
  "https://yandex.ru/maps/?text=Новосибирск%20Державина%2013";

export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="contact" className="relative overflow-hidden bg-ivory py-20 md:py-28">
      {/* Decorative gold ornament at top */}
      <div className="ornament-rule mx-auto mb-10 w-full max-w-md">
        <span className="text-gold text-sm tracking-[0.4em]">✦</span>
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow>Контакты</Eyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl font-display text-4xl leading-[1.05] text-emerald-deep md:text-5xl lg:text-6xl"
          >
            Приходите в наш{" "}
            <span className="text-gold-gradient italic">бутик</span>
          </motion.h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {CONTACT.address}
          </p>
        </div>

        {/* 2-col layout: info cards left / map right */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 md:gap-8">
          {/* === Info cards === */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {INFO_CARDS.map((c, i) => {
              const Icon = c.icon;
              const isPhone = c.title === "Телефоны";
              return (
                <motion.article
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="lift-card group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-gold/30 bg-card p-5 transition-colors hover:border-gold/55 md:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-emerald-deep text-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {c.title}
                    </span>
                    {c.lines.map((l, j) => {
                      // Make phone lines clickable.
                      const href = isPhone
                        ? `tel:${
                            j === 0 ? CONTACT.phone1Href : CONTACT.phone2Href
                          }`
                        : undefined;
                      return href ? (
                        <a
                          key={j}
                          href={href}
                          className="font-display text-lg leading-tight text-emerald-deep underline-offset-4 transition-colors hover:text-gold"
                        >
                          {l}
                        </a>
                      ) : (
                        <span
                          key={j}
                          className="font-display text-lg leading-tight text-emerald-deep"
                        >
                          {l}
                        </span>
                      );
                    })}
                  </div>
                  {/* Decorative gold corner */}
                  <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </motion.article>
              );
            })}

            {/* Social pills */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Мы в соцсетях:
              </span>
              {SOCIALS.map((s) => (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-ivory-soft/60 px-3.5 py-1.5 text-xs font-medium text-emerald-deep transition-colors hover:border-gold hover:bg-gold/15 hover:text-gold"
                >
                  <span className="font-semibold tracking-wider text-gold group-hover:text-emerald-deep">
                    {s.short}
                  </span>
                  {s.title}
                  <ArrowUpRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* === Map / map placeholder === */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lift-card relative overflow-hidden rounded-2xl border border-gold/30 bg-emerald-deep shadow-[0_20px_60px_-30px_rgba(15,61,46,0.4)]"
          >
            <div className="relative h-[360px] md:h-[440px] lg:h-full lg:min-h-[440px]">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=82.927849%2C55.041293&z=16&pt=82.927849,55.041293,pm2rdm"
                title="Карта: Дилижанс Шоу, Державина 13, Новосибирск"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups"
                className="absolute inset-0 h-full w-full border-0"
              />
              {/* Soft gold gradient border accent */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/20" />

              {/* Floating address overlay card */}
              <div className="absolute inset-x-4 bottom-4">
                <div className="glass-ivory flex items-center gap-3 rounded-2xl px-5 py-4 shadow-[0_20px_60px_-25px_rgba(15,61,46,0.6)]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-emerald-deep shadow-[0_4px_18px_-4px_rgba(201,169,97,0.6)]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-base leading-tight text-emerald-deep">
                      {CONTACT.address}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {CONTACT.hours}
                    </span>
                  </div>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-deep transition-colors hover:bg-gold hover:text-emerald-deep"
                  >
                    <Navigation className="h-3 w-3" />
                    Яндекс.Карты
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
