# Дилижанс Шоу — ПЕРЕДАЧА ПРОЕКТА

> **Этот документ — для следующего AI-агента.** Прочитай целиком перед началом.

## 📋 Краткая справка

**Что:** Редизайн dilizhans-show.ru (бутик аренды костюмов в Новосибирске, 2000+ костюмов) на Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + Three.js.

**GitHub:** https://github.com/burovgena-eng/dilizhans-show

**Запуск:**
```bash
git clone https://github.com/burovgena-eng/dilizhans-show.git
cd dilizhans-show
bun install
bun run dev    # http://localhost:3000
bun run lint   # проверка кода
```

## 🎨 Дизайн-система

- **Тема:** DARK (onyx #060807 + emerald #1A5A42 + gold #C9A961 + ivory #F5EFE0)
- **Шрифты:** Cormorant Garamond (display) + Manrope (body) — оба с Cyrillic
- **Кнопки:** `.btn-gold` (solid onyx + gold border/text) + `.btn-outline` (glass + gold border)
- **Тени:** `.shadow-luxe` / `.shadow-luxe-hover` / `.shadow-gold` (многослойные cinematic)
- **Утилиты:** `lift-card`, `corner-accents`, `glass-onyx`, `glass-gold`, `grain-overlay`, `img-luxe-strong`, `scroll-luxe`
- **Lenis** smooth scroll (lerp 0.08, duration 1.4)
- **CustomCursor** (золотой кружок + ring на interactive)
- **ScrollProgress** (золотая полоса, width%, opacity fade-in 2%)

## 🗂 Структура

```
src/
├── app/
│   ├── layout.tsx        ← шрифты, <html className="dark">, SmoothScroll wrapper
│   ├── page.tsx          ← порядок секций (NO SectionReveal on Collections — breaks sticky)
│   ├── globals.css       ← все CSS tokens + utility classes
│   └── api/bookings/     ← POST → generates DS-XXXXXX bookingId
├── components/
│   ├── three/            ← Three.js 3D
│   │   ├── hero-particles.tsx   ← 6000 gold stars, GLSL, bloom, cursor illumination
│   │   └── logo-3d.tsx          ← bas-relief D + spotlight (mirrored cursor follow)
│   ├── site/             ← глобальные
│   │   ├── header.tsx    ← Logo3D, btn-gold CTA "Забронировать примерку"
│   │   ├── footer.tsx    ← mt-auto sticky, 4 cols + ticker marquee
│   │   ├── primitives.tsx ← Eyebrow, SectionHeading, GoldDivider
│   │   ├── motion-utils.tsx ← TiltCard, MagneticButton, Reveal, Counter, ScrollProgress
│   │   ├── section-reveal.tsx ← opacity+y (NO clipPath — clips hover children)
│   │   ├── custom-cursor.tsx  ← gold dot + ring
│   │   └── smooth-scroll.tsx  ← Lenis provider
│   └── sections/         ← 10 секций
│       ├── hero.tsx       ← gradient mesh + floating orbs + Three.js particles + split-text
│       ├── trust-strip.tsx ← 4 Counter stats
│       ├── collections.tsx ← 3D Coverflow (CSS 3D + framer-motion + Three.js bg) + mobile grid
│       ├── offers.tsx     ← 3 TiltCard cards
│       ├── catalog.tsx   ← 477 photos, sidebar search, lightbox (Portal!), sequential reveal
│       ├── advantages.tsx ← 4 honest (cleaning, try-before-rent, 2000+, phone booking)
│       ├── process.tsx   ← 4 steps + icons + connecting timeline
│       ├── booking.tsx   ← form (NO "Тип события" field), POST /api/bookings
│       ├── testimonials.tsx ← 4 cards + marquee
│       └── contact.tsx   ← 3 info cards + Yandex map + social pills
├── lib/
│   ├── data/catalog.ts   ← COLLECTIONS, OFFERS, CATEGORIES, TESTIMONIALS, PROCESS_STEPS, NAV_LINKS, CONTACT
│   ├── data/photos-manifest.json ← 477 фото (src, title, category, slug)
│   └── utils.ts
public/images/
├── star-particle.png     ← 1024×1024 star sprite texture (AI-generated)
├── logo-clean.png        ← original D (PIL cleaned, gold recolor)
├── logo-normalmap.png    ← 512×512 normal map (Sobel from alpha)
├── logo-heightmap-hires.png ← 512×512 displacement map
├── logo-alphamap.png     ← 512×512 alpha silhouette
├── logo-roughmap.png     ← 512×512 roughness variation
└── real/                 ← 495 файлов (477 upscaled 2x + textures)
```

## ⚠️ Важно

1. **Collections** — НЕ оборачивай в `<SectionReveal>` (willChange:transform ломает sticky)
2. **Catalog lightbox** — использует `createPortal` (ancestor willChange:transform ломал position:fixed)
3. **Reveal** — БЕЗ clipPath (clipPath clips hover children → cards обрезались сверху)
4. **ScrollProgress** — width% не scaleX (scaleX distort градиента → вертикальный артефакт)
5. **AI ассистент** — полностью удалён (user requested)
6. **Gallery секция** — удалена (user requested)
7. **"Тип события"** в booking форме — удалено (user requested)
8. **Часы работы:** "Без выходных · 10:00–19:00"
9. **Advantages:** БЕЗ доставки и подгона по фигуре (user said they don't have these)
10. **Three.js SSR:** используй `useSyncExternalStore` mount gate (НЕ next/dynamic с ssr:false — не работает в Turbopack)
11. **Логотип:** используй 3D Logo3D (bas-relief D с spotlight), НЕ PNG img

## 🛠 Технологии

- Next.js 16.1.3 (Turbopack) + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- three@0.186.1 + @react-three/fiber@9.8.1 + @react-three/drei@10.7.9 + @react-three/postprocessing@3.1.3
- framer-motion 12.23 + lenis 1.3.26 + lucide-react + sonner
- Prisma 6.11 + z-ai-web-dev-sdk 0.0.18 (backend only!)

## 📝 История (37 task records в worklog.md)

v1: initial → v2: dark theme + real photos → v3: catalog 477 photos → v4: clean logo + btn-gold → v5: Lenis + Cormorant + removed AI assistant → v6: Process fix + Gallery removed → v7: 6 bug fixes → v8: hero motion + fonts + buttons → v9-v13: cursor particle iterations → v14: catalog sequential reveal → v15-18: Three.js 3D particles + cursor → v19: photo upscale → v20: bug fixes → v21: Three.js 3D hero + ambient (removed) + coverflow + 3D logo → FINAL: recovery + GitHub push
