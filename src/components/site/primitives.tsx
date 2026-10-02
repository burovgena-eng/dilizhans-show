"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

/** Decorative gold divider with center diamond */
export function GoldDivider({ className, children }: Props) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 md:w-24" />
      <span className="text-gold">
        {children ?? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 0L9 5L14 7L9 9L7 14L5 9L0 7L5 5L7 0Z"
              fill="currentColor"
            />
          </svg>
        )}
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 md:w-24" />
    </div>
  );
}

/** Eyebrow label above headings */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold",
        className
      )}
    >
      <span className="h-px w-6 bg-gold/60" />
      {children}
    </span>
  );
}

/** Section heading with display serif */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        center ? "items-center text-center" : "items-start",
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="font-display text-4xl leading-[1.05] text-emerald-deep md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
            center ? "mx-auto" : ""
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** Hook that returns scroll progress 0..1 for window */
export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

/** Hook that returns true when scrolled past threshold */
export function useScrolled(threshold = 40) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const onScroll = () => setS(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return s;
}
