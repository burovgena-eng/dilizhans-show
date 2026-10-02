"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading } from "@/components/site/primitives";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { REAL_PHOTOS } from "@/lib/data/catalog";

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

  function reset() {
    setDone(null);
  }

  return (
    <section
      id="booking"
      className="relative overflow-hidden bg-onyx bg-emerald-radial py-20 text-ivory md:py-28"
    >
      <div ref={ref} className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Бронирование"
          title={
            <>
              Забронируйте{" "}
              <span className="text-gold-gradient italic">примерку</span>
            </>
          }
          subtitle="Оставьте заявку — стилист перезвонит в течение часа и подберёт 2–3 идеальных образа."
        />

        {/* 2-col layout: form 55% / image panel 45% */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] md:gap-8">
          {/* === Form card === */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lift-card corner-accents relative rounded-2xl border border-gold/20 bg-onyx-card p-6 md:p-8"
          >
            <div className="relative">
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                {/* Name + Phone */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bk-name" className="text-ivory">
                      Имя <span className="text-gold">*</span>
                    </Label>
                    <Input
                      id="bk-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Анна"
                      required
                      autoComplete="name"
                      className="border-gold/20 bg-onyx-soft text-ivory placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-gold/30"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bk-phone" className="text-ivory">
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
                      className="border-gold/20 bg-onyx-soft text-ivory placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-gold/30"
                    />
                  </div>
                </div>

                {/* Event type — radio pills */}
                <div className="flex flex-col gap-2">
                  <Label className="text-ivory">Тип события</Label>
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
                              ? "border-gold bg-gradient-to-br from-gold-bright via-gold to-gold-deep font-semibold text-onyx shadow-[0_4px_18px_-4px_rgba(201,169,97,0.6)]"
                              : "border-gold/30 text-ivory/70 hover:border-gold/60 hover:text-ivory")
                          }
                          aria-pressed={active}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date — plain date input for reliability, color-scheme dark */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bk-date" className="text-ivory">
                    Желаемая дата примерки
                  </Label>
                  <input
                    id="bk-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="[color-scheme:dark] flex h-10 w-full rounded-md border border-gold/20 bg-onyx-soft px-3 py-2 text-sm text-ivory placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Бутик работает Вт–Сб 10:00–19:00. Вс и Пн — выходной.
                  </p>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bk-notes" className="text-ivory">
                    Комментарий
                  </Label>
                  <Textarea
                    id="bk-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Например: для 80 человек, тема Гэтсби, нужен полный комплект с аксессуарами."
                    rows={3}
                    className="border-gold/20 bg-onyx-soft text-ivory placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-gold/30"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Отправляем…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                      Отправить заявку
                    </>
                  )}
                </button>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Нажимая «Отправить заявку», вы соглашаетесь, что стилист
                  перезвонит на указанный номер в рабочее время.
                </p>
              </form>

              {/* Success overlay */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-onyx-card/95 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center gap-4 px-8 text-center"
                    >
                      <motion.span
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.55,
                          delay: 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-onyx shadow-[0_8px_30px_-6px_rgba(201,169,97,0.7)]"
                      >
                        <Check className="h-8 w-8" strokeWidth={2.5} />
                      </motion.span>
                      <p className="font-display text-2xl leading-tight text-ivory">
                        Заявка принята!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ваш номер заявки:{" "}
                        <span className="font-semibold text-gold">{done.id}</span>
                      </p>
                      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Стилист перезвонит в течение часа и подберёт 2–3
                        идеальных образа.
                      </p>
                      <button
                        type="button"
                        onClick={reset}
                        className="mt-2 rounded-full border border-gold/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold hover:text-onyx"
                      >
                        Отправить ещё одну заявку
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* === Right image panel === */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lift-card group relative min-h-[420px] overflow-hidden rounded-2xl border border-gold/20 lg:h-auto"
          >
            {/* Real photo with strong luxury filter */}
            <img
              src={REAL_PHOTOS.bookingSide}
              alt="Примерка свадебного платья в бутике Дилижанс Шоу"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover img-luxe-strong"
            />

            {/* Dark emerald-to-onyx overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />

            {/* corner-accents — L brackets appear on lift-card:hover */}
            <span className="corner-accents pointer-events-none absolute inset-0" />

            {/* Floating glass-onyx card on top */}
            <div className="absolute inset-x-5 bottom-5">
              <div className="glass-onyx rounded-2xl px-5 py-4">
                <p className="flex items-center gap-2 font-display text-lg leading-tight text-gold">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                  Примерка бесплатно
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Пн–Вт выходной · Вт–Сб 10:00–19:00
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
