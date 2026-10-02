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
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40 md:w-24" />
      <span className="text-gold/80">
        {children ?? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" fill="currentColor" />
          </svg>
        )}
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40 md:w-24" />
    </div>
  );
}

/** Eyebrow label above headings — clean, refined */
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
        "text-[10px] font-medium uppercase tracking-[0.45em] text-gold/80",
        className
      )}
    >
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
      <h2 className="font-display text-4xl leading-[1.05] text-ivory md:text-5xl lg:text-[3.5rem]">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base",
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
