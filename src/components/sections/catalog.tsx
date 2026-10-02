"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { SectionHeading } from "@/components/site/primitives";
import { Input } from "@/components/ui/input";
import photosManifest from "@/lib/data/photos-manifest.json";

/* ============================================================
 *  Types — manifest shape (TypeScript-safe cast)
 * ============================================================ */
type ManifestItem = {
  src: string;
  title: string;
  alt: string;
  sourceUrl: string;
  category: string;
  slug: string;
};

type ManifestCategory = {
  slug: string;
  label: string;
  items: ManifestItem[];
};

type Manifest = Record<string, ManifestCategory>;

const MANIFEST = photosManifest as unknown as Manifest;

/* Flatten categories preserving declared order */
const CATEGORIES: ManifestCategory[] = Object.values(MANIFEST);

/** All 477 photos concatenated in category order — used for search & "all" view. */
const ALL_ITEMS: ManifestItem[] = CATEGORIES.flatMap((c) => c.items);

const TOTAL_COUNT = ALL_ITEMS.length;

/** Page size for "load more" pagination. */
const PAGE_SIZE = 24;

/* ============================================================
 *  Catalog section component
 * ============================================================ */
export function Catalog() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  /* selectedCategory holds the category LABEL ("Новогодние" etc.) or "all" */
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]?.label ?? "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isSearching = searchQuery.trim().length > 0;

  /* Compute the filtered list depending on search/category. */
  const items = useMemo<ManifestItem[]>(() => {
    if (isSearching) {
      const q = searchQuery.trim().toLowerCase();
      return ALL_ITEMS.filter((it) =>
        it.title.toLowerCase().includes(q)
      );
    }
    if (selectedCategory === "all") return ALL_ITEMS;
    const cat = CATEGORIES.find((c) => c.label === selectedCategory);
    return cat ? cat.items : [];
  }, [isSearching, searchQuery, selectedCategory]);

  /* Reset pagination inline whenever the user picks a new filter. */
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleSelectCategory = useCallback((label: string) => {
    setSearchQuery("");
    setSelectedCategory(label);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  /* === Lightbox handlers === */
  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? 0 : items.length === 0 ? null : (i + 1) % items.length
    );
  }, [items.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? 0 : items.length === 0 ? null : (i - 1 + items.length) % items.length
    );
  }, [items.length]);

  /* Keyboard: Escape / ArrowLeft / ArrowRight while lightbox open. */
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, closeLightbox, goNext, goPrev]);

  /* Body scroll lock while modal open. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original || "";
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [activeIndex]);

  const active = activeIndex !== null ? items[activeIndex] : null;

  /* Header label for current view */
  const currentLabel = isSearching
    ? `Результаты поиска: ${items.length} образов`
    : selectedCategory === "all"
      ? `Все категории · ${items.length} образов`
      : `${selectedCategory} · ${items.length} образов`;

  return (
    <section
      id="catalog"
      ref={ref}
      className="relative overflow-hidden bg-onyx bg-emerald-radial py-20 text-ivory md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <SectionHeading
          center
          eyebrow="Каталог"
          title={
            <>
              Все образы нашей{" "}
              <span className="text-gold-gradient italic">коллекции</span>
            </>
          }
          subtitle={`${TOTAL_COUNT} реальных фотографий в ${CATEGORIES.length} категориях. Выберите категорию слева или воспользуйтесь поиском.`}
        />

        {/* ============================================================
         *  Mobile search + chips row (lg:hidden)
         * ============================================================ */}
        <div className="mt-10 flex flex-col gap-3 lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск по названию…"
              className="h-10 rounded-full border-gold/20 bg-onyx-soft pl-9 text-ivory placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-gold/30"
            />
          </div>
          <div className="scroll-luxe -mx-6 flex gap-2 overflow-x-auto px-6 pb-2">
            <CategoryChip
              label="Все"
              count={TOTAL_COUNT}
              active={!isSearching && selectedCategory === "all"}
              onClick={() => handleSelectCategory("all")}
            />
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c.label}
                label={c.label}
                count={c.items.length}
                active={!isSearching && selectedCategory === c.label}
                onClick={() => handleSelectCategory(c.label)}
              />
            ))}
          </div>
        </div>

        {/* ============================================================
         *  Desktop 2-column layout: sticky sidebar + grid
         * ============================================================ */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* === Sidebar (desktop only) === */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Поиск по названию…"
                  className="h-10 rounded-full border-gold/20 bg-onyx-soft pl-9 text-ivory placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-gold/30"
                />
                {isSearching && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSearchChange({
                        target: { value: "" },
                      } as unknown as ChangeEvent<HTMLInputElement>)
                    }
                    aria-label="Очистить поиск"
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-gold/10 hover:text-gold"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category list */}
              <div className="scroll-luxe max-h-[60vh] overflow-y-auto pr-1">
                <CategoryButton
                  label="Все категории"
                  count={TOTAL_COUNT}
                  active={!isSearching && selectedCategory === "all"}
                  onClick={() => handleSelectCategory("all")}
                />
                {CATEGORIES.map((c) => (
                  <CategoryButton
                    key={c.label}
                    label={c.label}
                    count={c.items.length}
                    active={!isSearching && selectedCategory === c.label}
                    data-slug={c.slug}
                    onClick={() => handleSelectCategory(c.label)}
                  />
                ))}
              </div>

              {/* Hint under sidebar */}
              <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
                477 реальных фотографий костюмов из бутика «Дилижанс Шоу».
                Кликните на образ, чтобы рассмотреть в деталях.
              </p>
            </div>
          </aside>

          {/* === Grid (right side) === */}
          <div className="min-w-0">
            {/* Breadcrumb-like header */}
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-2xl text-ivory md:text-3xl">
                {isSearching ? (
                  <>
                    Найдено{" "}
                    <span className="text-gold-gradient">
                      {items.length}
                    </span>{" "}
                    образов по запросу «{searchQuery.trim()}»
                  </>
                ) : (
                  currentLabel
                )}
              </h3>
              <span className="text-xs text-muted-foreground">
                {isSearching
                  ? `Показано ${visibleItems.length} из ${items.length}`
                  : `Показано ${visibleItems.length} из ${items.length} образов`}
              </span>
            </div>

            {/* Empty state */}
            {items.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-gold/15 bg-onyx-card p-8 text-center">
                <Search className="h-8 w-8 text-gold/50" />
                <p className="font-display text-xl text-ivory">
                  Образы не найдены
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Попробуйте изменить запрос или выбрать другую категорию из
                  списка слева.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(CATEGORIES[0]?.label ?? "all");
                  }}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold transition hover:bg-gold hover:text-onyx"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleItems.map((item, i) => (
                    <motion.button
                      key={`${item.src}-${i}`}
                      type="button"
                      onClick={() => openLightbox(i)}
                      initial={{ opacity: 0, y: 24 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(i * 0.03, 0.4),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      aria-label={`Открыть образ: ${item.title}`}
                      className="group lift-card corner-accents relative aspect-[3/4] overflow-hidden rounded-lg border border-gold/15 bg-onyx-card text-left"
                    >
                      {/* Image */}
                      <img
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                        className="img-luxe h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                      />

                      {/* Bottom dark gradient overlay (always visible, stronger on hover) */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Top-right zoom pill on hover */}
                      <span className="glass-gold pointer-events-none absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </span>

                      {/* Bottom content */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
                        {selectedCategory === "all" && !isSearching && (
                          <span className="text-[10px] font-medium uppercase tracking-wider text-gold/80">
                            {item.category}
                          </span>
                        )}
                        <span className="line-clamp-2 font-display text-sm leading-snug text-ivory">
                          {item.title}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((c) => c + PAGE_SIZE)
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-bright to-gold px-6 py-3 text-sm font-semibold uppercase tracking-wider text-onyx transition hover:from-gold hover:to-gold-deep"
                    >
                      Показать ещё
                      <span className="text-xs font-normal normal-case tracking-normal text-onyx/70">
                        (+{Math.min(PAGE_SIZE, items.length - visibleCount)})
                      </span>
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Показано {visibleItems.length} из {items.length} образов
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
       *  Lightbox modal
       * ============================================================ */}
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="catalog-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-onyx/95 p-4 backdrop-blur-md md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl border border-gold/30 bg-onyx-card md:flex-row md:overflow-hidden"
            >
              {/* Close */}
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Закрыть"
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-onyx-soft/80 text-ivory transition hover:border-gold hover:text-gold"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Prev */}
              <button
                type="button"
                onClick={goPrev}
                aria-label="Предыдущий образ"
                className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 bg-onyx-soft/70 text-ivory transition hover:border-gold hover:text-gold md:left-3"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Next */}
              <button
                type="button"
                onClick={goNext}
                aria-label="Следующий образ"
                className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 bg-onyx-soft/70 text-ivory transition hover:border-gold hover:text-gold md:right-3"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Image side */}
              <div className="flex flex-1 items-center justify-center bg-onyx p-4 md:p-6">
                <img
                  src={active.src}
                  alt={active.title}
                  className="img-luxe max-h-[55vh] w-auto max-w-full object-contain md:max-h-[80vh]"
                />
              </div>

              {/* Details panel */}
              <aside className="flex w-full flex-col gap-4 border-t border-gold/15 bg-onyx-card p-6 md:w-80 md:border-l md:border-t-0">
                <span className="glass-gold inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
                  {active.category}
                </span>
                <h3 className="font-display text-2xl leading-tight text-ivory">
                  {active.title}
                </h3>

                <div className="divider-gold-fade" />

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Из коллекции «Дилижанс Шоу» — бутика карнавальных костюмов в
                  Новосибирске с 2013 года.
                </p>

                <a
                  href={active.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-gold/80 transition hover:text-gold-bright"
                >
                  Просмотр на оригинале
                  <ExternalLink className="h-3 w-3" />
                </a>

                <div className="mt-2 flex-1" />

                <a
                  href="#booking"
                  onClick={closeLightbox}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-bright to-gold px-5 py-3 text-sm font-semibold uppercase tracking-wider text-onyx transition hover:from-gold hover:to-gold-deep"
                >
                  Забронировать этот образ
                  <ArrowRight className="h-4 w-4" />
                </a>

                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Все костюмы можно примерить в бутике на Державина 13. Стилист
                  перезвонит в течение часа.
                </p>
              </aside>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

/* ============================================================
 *  Sidebar category button (desktop)
 * ============================================================ */
function CategoryButton({
  label,
  count,
  active,
  onClick,
  "data-slug": slug,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  "data-slug"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-slug={slug}
      className={
        "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition " +
        (active
          ? "border-gold/40 bg-gold/10 text-gold"
          : "border-transparent text-ivory/70 hover:bg-onyx-card hover:text-ivory")
      }
    >
      <span className="truncate">{label}</span>
      <span
        className={
          "ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " +
          (active
            ? "bg-gold/20 text-gold-bright"
            : "bg-onyx-soft text-muted-foreground")
        }
      >
        {count}
      </span>
    </button>
  );
}

/* ============================================================
 *  Mobile category chip
 * ============================================================ */
function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition " +
        (active
          ? "border-gold bg-gold/10 text-gold"
          : "border-gold/25 text-ivory/70 hover:border-gold/50 hover:text-ivory")
      }
    >
      <span>{label}</span>
      <span
        className={
          "rounded-full px-1.5 py-0.5 text-[10px] " +
          (active
            ? "bg-gold/20 text-gold-bright"
            : "bg-onyx-soft text-muted-foreground")
        }
      >
        {count}
      </span>
    </button>
  );
}
