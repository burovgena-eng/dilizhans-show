"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2, Loader2, Sparkles, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { Eyebrow } from "@/components/site/primitives";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CONTACT } from "@/lib/data/catalog";

const EVENT_TYPES = [
  "Свадьба",
  "Корпоратив",
  "Детский праздник",
  "Фотосессия",
  "Другое",
];

export function Booking() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim() || !phone.trim()) {
      toast.error("Заполните обязательные поля", {
        description: "Имя и телефон обязательны для оформления заявки.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          eventType,
          date,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Не удалось отправить заявку.");
      }

      const data = await res.json();
      setDone({ id: data.bookingId });
      toast.success("Заявка отправлена!", {
        description:
          "Стилист перезвонит в течение часа и подберёт 2–3 идеальных образа.",
      });
      setName("");
      setPhone("");
      setEventType(EVENT_TYPES[0]);
      setDate("");
      setNotes("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
      toast.error("Ошибка отправки", { description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="booking"
      className="relative overflow-hidden bg-ivory-soft py-20 md:py-28"
    >
      {/* Decorative gold corner accents on the section */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/10 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald/10 blur-[100px]"
        aria-hidden="true"
      />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow>Бронирование</Eyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl font-display text-4xl leading-[1.05] text-emerald-deep md:text-5xl lg:text-6xl"
          >
            Забронируйте{" "}
            <span className="text-gold-gradient italic">примерку</span>
          </motion.h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Оставьте заявку — стилист перезвонит в течение часа и подберёт 2–3
            идеальных образа.
          </p>
          <div className="ornament-rule mt-2 w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">◆</span>
          </div>
        </div>

        {/* 2-col layout: form 55% / image side panel 45% */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] md:gap-8">
          {/* === Form card with gold corner accents === */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lift-card relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 shadow-[0_20px_60px_-25px_rgba(15,61,46,0.3)] md:p-8"
          >
            {/* Gold corner accents */}
            <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-gold" />
            <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t border-gold" />
            <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l border-gold" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-gold" />

            <AnimateSuccess done={done} onReset={() => setDone(null)}>
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bk-name" className="text-emerald-deep">
                      Имя <span className="text-gold">*</span>
                    </Label>
                    <Input
                      id="bk-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Анна"
                      required
                      autoComplete="name"
                      className="border-gold/25 bg-ivory-soft/50 text-emerald-deep placeholder:text-muted-foreground/60 focus-visible:border-gold focus-visible:ring-gold/30"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bk-phone" className="text-emerald-deep">
                      Телефон <span className="text-gold">*</span>
                    </Label>
                    <Input
                      id="bk-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (960) 795 93 69"
                      required
                      autoComplete="tel"
                      className="border-gold/25 bg-ivory-soft/50 text-emerald-deep placeholder:text-muted-foreground/60 focus-visible:border-gold focus-visible:ring-gold/30"
                    />
                  </div>
                </div>

                {/* Event type — radio pills */}
                <div className="flex flex-col gap-2">
                  <Label className="text-emerald-deep">Тип события</Label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_TYPES.map((t) => {
                      const active = eventType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEventType(t)}
                          className={
                            "rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors " +
                            (active
                              ? "border-gold bg-gradient-to-br from-gold-bright to-gold-deep text-emerald-deep shadow-[0_4px_18px_-4px_rgba(201,169,97,0.6)]"
                              : "border-gold/30 bg-ivory-soft/40 text-emerald-deep/70 hover:border-gold/60 hover:text-emerald-deep")
                          }
                          aria-pressed={active}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date — plain date input for reliability */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bk-date" className="text-emerald-deep">
                    Желаемая дата примерки
                  </Label>
                  <Input
                    id="bk-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-gold/25 bg-ivory-soft/50 text-emerald-deep placeholder:text-muted-foreground/60 focus-visible:border-gold focus-visible:ring-gold/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Бутик работает Вт–Сб 10:00–19:00. Вс и Пн — выходной.
                  </p>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bk-notes" className="text-emerald-deep">
                    Комментарий
                  </Label>
                  <Textarea
                    id="bk-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Например: для 80 человек, тема Гэтсби, нужен полный комплект с аксессуарами."
                    rows={4}
                    className="border-gold/25 bg-ivory-soft/50 text-emerald-deep placeholder:text-muted-foreground/60 focus-visible:border-gold focus-visible:ring-gold/30"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-6 py-3.5 text-sm font-semibold text-emerald-deep shadow-[0_10px_40px_-10px_rgba(201,169,97,0.7)] transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Отправляем…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Отправить заявку
                    </>
                  )}
                </button>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Нажимая «Отправить заявку», вы соглашаетесь, что стилист
                  перезвонит на указанный номер в рабочее время.
                </p>
              </form>
            </AnimateSuccess>
          </motion.div>

          {/* === Decorative image side panel === */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl border border-gold/25"
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/12] lg:aspect-auto lg:h-full min-h-[420px]">
              <img
                src="/images/offers/offer-gatsby.jpg"
                alt="Примерка костюма в бутике Дилижанс Шоу"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Dark emerald overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/95 via-emerald-deep/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-onyx/40 via-transparent to-transparent" />

              {/* Glass-ivory card on top */}
              <div className="absolute inset-x-5 bottom-5">
                <div className="glass-ivory rounded-2xl px-5 py-4 shadow-[0_20px_60px_-25px_rgba(15,61,46,0.6)]">
                  <p className="flex items-center gap-2 font-display text-lg leading-tight text-emerald-deep">
                    <Clock className="h-4 w-4 text-gold" />
                    {CONTACT.hours}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {CONTACT.closed}
                  </p>
                  <div className="my-3 h-px w-full bg-gradient-to-r from-gold/40 via-gold/15 to-transparent" />
                  <p className="flex items-center gap-2 text-sm text-emerald-deep">
                    <MapPin className="h-4 w-4 text-gold" />
                    {CONTACT.address}
                  </p>
                </div>
              </div>

              {/* Top overlay pill */}
              <div className="absolute left-5 top-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-onyx/60 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Примерка бесплатно
                </span>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function AnimateSuccess({
  done,
  onReset,
  children,
}: {
  done: { id: string } | null;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4 px-8 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, 0] }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-emerald-deep shadow-[0_8px_30px_-6px_rgba(201,169,97,0.7)]"
            >
              <CheckCircle2 className="h-9 w-9" />
            </motion.span>
            <p className="font-display text-2xl leading-tight text-emerald-deep">
              Заявка принята!
            </p>
            <p className="text-sm text-muted-foreground">
              Ваш номер заявки:{" "}
              <span className="font-semibold text-gold">{done.id}</span>
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Стилист перезвонит в течение часа и подберёт 2–3 идеальных образа.
            </p>
            <button
              type="button"
              onClick={onReset}
              className="mt-2 rounded-full border border-gold/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-deep transition-colors hover:bg-gold hover:text-emerald-deep"
            >
              Отправить ещё одну заявку
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
