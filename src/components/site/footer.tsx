"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Sparkles,
  Send,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { NAV_LINKS, CONTACT } from "@/lib/data/catalog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const SOCIALS = [
  { title: "ВКонтакте", short: "VK", href: CONTACT.vk },
  { title: "Telegram", short: "TG", href: CONTACT.telegram },
  { title: "WhatsApp", short: "WA", href: CONTACT.whatsapp },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

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
    <footer className="mt-auto bg-onyx text-ivory">
      {/* Decorative gold top border with gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* Soft grain overlay */}
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* === Brand column === */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-emerald to-emerald-deep text-gold shadow-inner">
                <span className="font-display text-xl leading-none">Д</span>
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl tracking-tight text-ivory">
                  Дилижанс<span className="text-gold"> Шоу</span>
                </span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.35em] text-ivory/45">
                  Boutique · Costumes · since 2013
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ivory/65">
              Бутик карнавальных фантазий · с 2013 года
            </p>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-gold/30 bg-emerald-deep/40 px-3.5 py-1.5">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                ))}
              </span>
              <span className="text-xs text-ivory/75">
                <span className="font-semibold text-gold-bright">4.9</span> на
                основе 850+ отзывов
              </span>
            </div>
          </div>

          {/* === Navigation === */}
          <nav className="flex flex-col gap-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Навигация
            </h3>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-ivory/70 transition-colors hover:text-gold"
                  >
                    {l.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#booking"
                  className="text-sm text-ivory/70 transition-colors hover:text-gold"
                >
                  Бронирование
                </a>
              </li>
            </ul>
          </nav>

          {/* === Contacts === */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Контакты
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-ivory/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  {CONTACT.hours}
                  <br />
                  <span className="text-ivory/45">{CONTACT.closed}</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="flex flex-col gap-1">
                  <a
                    href={`tel:${CONTACT.phone1Href}`}
                    className="transition-colors hover:text-gold"
                  >
                    {CONTACT.phone1}
                  </a>
                  <a
                    href={`tel:${CONTACT.phone2Href}`}
                    className="transition-colors hover:text-gold"
                  >
                    {CONTACT.phone2}
                  </a>
                </span>
              </li>
            </ul>
          </div>

          {/* === Socials + subscribe === */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Соцсети и подписка
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-emerald-deep/40 px-3.5 py-1.5 text-xs font-medium text-ivory transition-colors hover:border-gold hover:bg-gold/15 hover:text-gold-bright"
                >
                  <span className="font-semibold tracking-wider text-gold group-hover:text-emerald-deep">
                    {s.short}
                  </span>
                  {s.title}
                  <ArrowUpRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-ivory/65">
                Подпишитесь на новости о новых коллекциях:
              </p>
              <form onSubmit={onSubscribe} className="flex items-center gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="E-mail для подписки"
                  className="border-gold/25 bg-emerald-deep/40 text-ivory placeholder:text-ivory/40 focus-visible:border-gold focus-visible:ring-gold/30"
                />
                <button
                  type="submit"
                  aria-label="Подписаться"
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-4 text-sm font-semibold text-emerald-deep shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)] transition-transform hover:scale-[1.03]"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">OK</span>
                </button>
              </form>
            </div>

            {/* Mini AI badge */}
            <a
              href="#assistant"
              className="inline-flex items-center gap-2 self-start rounded-full border border-gold/30 bg-onyx-soft/40 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:border-gold hover:bg-gold/10"
            >
              <Sparkles className="h-3 w-3" />
              Подобрать образ с AI
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-ivory/10 pt-6 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-xs text-ivory/50">
            © 2013–{currentYear} Дилижанс Шоу. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a
              href="#"
              className="text-ivory/50 transition-colors hover:text-gold"
            >
              Политика конфиденциальности
            </a>
            <span className="hidden h-3 w-px bg-ivory/15 sm:inline-block" />
            <a
              href="#"
              className="text-ivory/50 transition-colors hover:text-gold"
            >
              Договор проката
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
