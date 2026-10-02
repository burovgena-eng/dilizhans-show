"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Clock, Phone, ArrowUpRight, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/site/primitives";
import { CONTACT } from "@/lib/data/catalog";

const MAPS_LINK = "https://yandex.ru/maps/?text=Новосибирск%20Державина%2013";

const INFO_CARDS = [
  {
    icon: MapPin,
    title: "Адрес бутика",
    value: CONTACT.address,
    sub: null as string | null,
    isPhone: false,
  },
  {
    icon: Clock,
    title: "Часы работы",
    value: CONTACT.hours,
    sub: CONTACT.closed,
    isPhone: false,
  },
  {
    icon: Phone,
    title: "Телефоны",
    value: null as string | null,
    sub: null as string | null,
    isPhone: true,
  },
] as const;

const SOCIALS = [
  { title: "ВКонтакте", short: "VK", href: CONTACT.vk },
  { title: "Telegram", short: "TG", href: CONTACT.telegram },
  { title: "WhatsApp", short: "WA", href: CONTACT.whatsapp },
];

export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-onyx bg-emerald-radial py-20 md:py-28"
    >
      {/* Soft grain overlay */}
      <div
        className="grain-overlay pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Контакты"
          title={
            <>
              Приходите в наш{" "}
              <span className="text-gold-gradient italic">бутик</span>
            </>
          }
          subtitle="Ул. Державина 13, Новосибирск"
        />

        {/* 2-col layout: info cards left (45%) / map right (55%) */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-[45fr_55fr]">
          {/* === Left: info cards + socials === */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {INFO_CARDS.map((c, i) => {
              const Icon = c.icon;
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
                  className="lift-card group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-gold/20 bg-onyx-card p-5"
                >
                  {/* Icon medallion */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>

                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-lg leading-tight text-ivory">
                      {c.title}
                    </h3>
                    {c.isPhone ? (
                      <div className="flex flex-col gap-0.5">
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
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed text-ivory/75">
                          {c.value}
                        </p>
                        {c.sub ? (
                          <p className="text-xs text-gold">{c.sub}</p>
                        ) : null}
                      </>
                    )}
                  </div>

                  {/* Corner accents */}
                  <span className="corner-accents pointer-events-none absolute inset-0" />
                </motion.article>
              );
            })}

            {/* Social pills */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm text-ivory transition-colors hover:border-gold hover:bg-gold/5 hover:text-gold-bright"
                >
                  <span className="font-semibold tracking-wider text-gold">
                    {s.short}
                  </span>
                  <span>{s.title}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* === Right: map === */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lift-card group relative h-full min-h-[400px] overflow-hidden rounded-2xl border border-gold/20 bg-onyx-card"
          >
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=82.927849%2C55.041293&z=16&pt=82.927849,55.041293,pm2rdm"
              title="Карта: Дилижанс Шоу, Державина 13, Новосибирск"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              className="absolute inset-0 h-full w-full border-0"
            />

            {/* Subtle gold ring overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/15" />

            {/* Floating glass-onyx address card */}
            <div className="absolute inset-x-4 bottom-4">
              <div className="glass-onyx flex items-center gap-3 rounded-xl px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold">
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-display text-base leading-tight text-ivory">
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
                  className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold-bright"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Открыть на Яндекс.Картах</span>
                  <span className="sm:hidden">Картах</span>
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>

            {/* Corner accents on hover */}
            <span className="corner-accents pointer-events-none absolute inset-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
