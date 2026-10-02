"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Sparkles, Zap, MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Eyebrow } from "@/components/site/primitives";
import { Input } from "@/components/ui/input";

type Role = "assistant" | "user";
type Msg = { role: Role; content: string };

const INITIAL_GREETING =
  "Здравствуйте! Я — ваш персональный стилист Дилижанс Шоу. Расскажите, для какого события ищете образ — и я предложу 2–3 варианта из нашей коллекции из 2000+ костюмов.";

const QUICK_REPLIES = [
  "Свадьба в стиле Гэтсби",
  "Детский новогодний",
  "Корпоратив 80 человек",
  "Хэллоуин",
];

const INFO_CARDS = [
  {
    icon: Sparkles,
    value: "2000+",
    label: "образов в коллекции",
  },
  {
    icon: Zap,
    value: "30 секунд",
    label: "среднее время ответа",
  },
  {
    icon: MapPin,
    value: "Державина 13",
    label: "адрес бутика",
  },
];

export function StyleAssistant() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: INITIAL_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages / typing.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, isTyping]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || isTyping) return;

    const newMessages: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = newMessages
        .filter((m, i) => !(i === 0 && m.role === "assistant"))
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/style-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Не удалось получить ответ стилиста.");
      }

      const data = await res.json();
      const reply: string = data?.reply ?? "";
      if (!reply) throw new Error("Пустой ответ стилиста.");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
      toast.error("Стилист недоступен", { description: msg });
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <section
      id="assistant"
      className="grain-overlay relative overflow-hidden bg-onyx-soft bg-gold-radial py-20 text-ivory md:py-28"
    >
      {/* Floating gold particle field */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute block h-1 w-1 rounded-full bg-gold/60"
            style={{
              left: `${(i * 67) % 100}%`,
              top: `${(i * 37) % 100}%`,
            }}
            animate={{
              y: [0, -28, 0],
              opacity: [0.15, 0.85, 0.15],
              scale: [1, 1.6, 1],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div
        ref={ref}
        className="relative z-10 mx-auto max-w-7xl px-6"
      >
        {/* Heading (left-aligned) */}
        <div className="flex flex-col items-start gap-4">
          <Eyebrow className="text-gold">AI-стилист</Eyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl font-display text-4xl leading-[1.05] text-ivory md:text-5xl"
          >
            Найдите идеальный образ за 30 секунд
          </motion.h2>
          <p className="max-w-2xl text-base leading-relaxed text-ivory/70 md:text-lg">
            Опишите событие — наш AI-стилист предложит 2–3 варианта из коллекции
            2000+ костюмов. Без воды, без звонков, без обязательств.
          </p>
        </div>

        {/* Layout: 2 cols (chat 60% / info 40%) on desktop */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          {/* === Chat window === */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lift-card relative flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-onyx-card"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gold/15 bg-emerald-deep/40 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-emerald to-emerald-deep text-gold">
                <Sparkles className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="flex flex-col">
                <span className="font-medium leading-tight text-ivory">
                  Стилист · Дилижанс
                </span>
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-ivory/55">
                  <motion.span
                    className="block h-2 w-2 rounded-full bg-gold"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  online
                </span>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="scroll-luxe flex max-h-80 min-h-64 flex-col gap-3 overflow-y-auto p-4"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(i * 0.04, 0.2),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={
                      m.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    {m.role === "assistant" ? (
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gold/15 bg-onyx-soft px-4 py-3">
                        <p className="whitespace-pre-wrap font-display text-sm leading-relaxed text-ivory">
                          {m.content}
                        </p>
                      </div>
                    ) : (
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-gold-bright to-gold px-4 py-3 text-sm font-medium leading-relaxed text-onyx shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)]">
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gold/15 bg-onyx-soft px-4 py-3">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="block h-1.5 w-1.5 rounded-full bg-gold"
                          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: d * 0.15,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick reply chips */}
            <div className="scroll-luxe flex gap-2 overflow-x-auto border-t border-gold/15 p-3 pb-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isTyping}
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold transition-colors hover:border-gold/60 hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex gap-2 border-t border-gold/15 p-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isTyping}
                placeholder="Сообщение стилисту..."
                aria-label="Сообщение стилисту"
                className="border-gold/20 bg-onyx-soft text-ivory placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-gold/30"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={isTyping || !input.trim()}
                aria-label="Отправить сообщение"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-gold-bright to-gold px-4 py-2 text-sm font-semibold text-onyx shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)] transition-transform hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">Отправить</span>
              </button>
            </div>
          </motion.div>

          {/* === Right info panel (hidden on mobile) === */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden flex-col gap-4 lg:flex"
          >
            {INFO_CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.article
                  key={c.value}
                  initial={{ opacity: 0, x: 16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.25 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="lift-card relative flex items-center gap-4 overflow-hidden rounded-lg border border-gold/15 bg-onyx-card p-5"
                >
                  {/* corner-accents — L brackets appear on lift-card:hover */}
                  <span className="corner-accents pointer-events-none absolute inset-0" />

                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-emerald-deep text-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-2xl leading-tight text-gold">
                      {c.value}
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-ivory/70">
                      {c.label}
                    </span>
                  </div>
                </motion.article>
              );
            })}

            {/* Bottom gold CTA card */}
            <motion.a
              href="#booking"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="lift-card group relative flex items-center justify-between overflow-hidden rounded-lg bg-gradient-to-br from-gold-bright via-gold to-gold-deep p-4 text-onyx"
            >
              <span className="font-display text-lg font-semibold leading-tight">
                Забронировать примерку
              </span>
              <ArrowRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </motion.a>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
