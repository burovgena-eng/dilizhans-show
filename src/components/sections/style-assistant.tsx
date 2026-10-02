"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Sparkles, Send, MapPin, Clock, Layers } from "lucide-react";
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
    icon: Layers,
    title: "2000+ образов",
    sub: "детские и взрослые",
  },
  {
    icon: Clock,
    title: "Ответ за 30 секунд",
    sub: "быстрый подбор под событие",
  },
  {
    icon: MapPin,
    title: "Державина, 13",
    sub: "Новосибирск · Вт–Сб 10–19",
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
  }, [messages, isTyping]);

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
      toast.error("Стилист недоступен", {
        description: msg,
      });
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
      className="relative overflow-hidden bg-emerald-deep py-20 text-ivory md:py-28"
    >
      {/* Decorative gold particle field (like hero) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
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

      {/* Subtle gold radial glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="grain-overlay absolute inset-0 opacity-50" aria-hidden="true" />

      <div
        ref={ref}
        className="relative mx-auto max-w-7xl px-6"
      >
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow className="text-gold">AI-стилист</Eyebrow>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl font-display text-4xl leading-[1.05] text-ivory md:text-5xl lg:text-6xl"
          >
            Найдите идеальный образ{" "}
            <span className="text-gold-gradient italic">за 30 секунд</span>
          </motion.h2>
          <p className="max-w-2xl text-base leading-relaxed text-ivory/70 md:text-lg">
            Персональный AI-стилист подберёт 2–3 варианта из 2000+ костюмов под
            ваше событие, повод и бюджет.
          </p>
          <div className="ornament-rule mt-2 w-full max-w-md">
            <span className="text-gold text-xs tracking-[0.4em]">★</span>
          </div>
        </div>

        {/* Layout: 2 cols (chat 60% / info 40%) on desktop */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          {/* === Chat window === */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lift-card relative flex flex-col overflow-hidden rounded-2xl border border-gold/25 bg-onyx/50 backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gold/15 bg-emerald-deep/60 px-5 py-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-emerald-deep shadow-[0_4px_18px_-4px_rgba(201,169,97,0.7)]">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-display text-lg leading-tight text-ivory">
                  Стилист · Дилижанс
                </span>
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-ivory/55">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-bright" />
                  </span>
                  online
                </span>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="scroll-luxe max-h-80 min-h-64 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-onyx/20 to-emerald-deep/30 px-4 py-5 md:px-5"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={
                      m.role === "user" ? "flex justify-end" : "flex justify-start"
                    }
                  >
                    {m.role === "assistant" ? (
                      <div className="flex max-w-[85%] items-start gap-2.5">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-emerald-deep text-gold">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <div className="rounded-2xl rounded-tl-sm border border-gold/40 bg-ivory px-4 py-2.5 text-sm leading-relaxed text-emerald-deep shadow-[0_4px_18px_-8px_rgba(15,61,46,0.4)]">
                          <p className="whitespace-pre-wrap font-display text-[0.95rem]">
                            {m.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-4 py-2.5 text-sm font-medium leading-relaxed text-emerald-deep shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)]">
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
                    className="flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-emerald-deep text-gold">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gold/30 bg-ivory/85 px-4 py-3">
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
            <div className="flex flex-wrap gap-2 border-t border-gold/10 bg-onyx/30 px-4 py-3">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isTyping}
                  onClick={() => send(q)}
                  className="rounded-full border border-gold/40 bg-ivory/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ivory transition-colors hover:border-gold hover:bg-gold/15 hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2 border-t border-gold/10 bg-emerald-deep/40 px-4 py-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isTyping}
                placeholder="Опишите ваше событие…"
                aria-label="Сообщение стилисту"
                className="border-gold/25 bg-onyx/40 text-ivory placeholder:text-ivory/40 focus-visible:border-gold focus-visible:ring-gold/30"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={isTyping || !input.trim()}
                aria-label="Отправить сообщение"
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-4 text-sm font-semibold text-emerald-deep shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)] transition-transform hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Отправить</span>
              </button>
            </div>
          </motion.div>

          {/* === Info panel === */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {INFO_CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.article
                  key={c.title}
                  initial={{ opacity: 0, x: 16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.25 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="lift-card group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-gold/25 bg-onyx/40 px-5 py-4 backdrop-blur-sm transition-colors hover:border-gold/55"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-emerald-deep text-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-xl leading-tight text-ivory">
                      {c.title}
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-ivory/55">
                      {c.sub}
                    </span>
                  </div>
                  {/* Decorative gold corner */}
                  <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </motion.article>
              );
            })}

            {/* Bottom CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="relative mt-2 overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-emerald to-emerald-deep p-6"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-3xl"
                aria-hidden="true"
              />
              <p className="relative font-display text-2xl leading-tight text-ivory">
                Не нашли свой образ?
              </p>
              <p className="relative mt-2 text-sm leading-relaxed text-ivory/70">
                Позвоните стилисту — подберём индивидуально из 2000+ костюмов.
              </p>
              <a
                href="#booking"
                className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-bright to-gold-deep px-5 py-2.5 text-sm font-semibold text-emerald-deep shadow-[0_8px_24px_-8px_rgba(201,169,97,0.6)] transition-transform hover:scale-[1.03]"
              >
                Забронировать примерку
              </a>
            </motion.div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
