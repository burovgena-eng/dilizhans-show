"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS, type Audience, type Collection } from "@/lib/data/catalog";
import { SectionHeading } from "@/components/site/primitives";
import { TiltCard } from "@/components/site/motion-utils";

/* ============================================================
 *  Constants
 * ============================================================ */

/** Short audience label for the small gold pill. */
const AUDIENCE_BADGE: Record<Audience, string> = {
  children: "Дети",
  adults: "Взрослые",
  all: "Универсально",
};

/** Shared luxury easing — slow-out cubic for refined reveals. */
const EASE = [0.16, 1, 0.3, 1] as const;

/** Coverflow card geometry — 360×480 portrait. Centered via negative margins
 *  (half of width = -180px, half of height = -240px). */
const CARD_W = 360;
const CARD_H = 480;

/** Total number of cards in the coverflow = 6 COLLECTIONS + 1 CTA tail card. */
const TOTAL_CARDS = COLLECTIONS.length + 1;

/* ============================================================================
 *  CoverflowBackground — Three.js / R3F
 *  200 gold star particles in 3D space, drifting slowly with star-particle.png
 *  sprite texture. Subtle ambient backdrop for the desktop coverflow section.
 * ========================================================================== */

const PARTICLE_COUNT = 200;
const FIELD_W = 600;
const FIELD_H = 380;
const FIELD_D = 240;

function CoverflowParticles() {
  const { camera } = useThree();
  const pointsRef = useRef<THREE.Points>(null);

  const textureRef = useRef<THREE.Texture | null>(null);
  if (textureRef.current === null) {
    const loader = new THREE.TextureLoader();
    textureRef.current = loader.load("/images/star-particle.png");
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
  }

  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  if (geometryRef.current === null) {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD_W * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD_H * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD_D * 2;
      sizes[i] = Math.random() * 3.0 + 1.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometryRef.current = geo;
  }

  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  if (materialRef.current === null) {
    materialRef.current = new THREE.PointsMaterial({
      color: 0xc9a961,
      size: 4,
      map: textureRef.current,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
  }

  const geometry = geometryRef.current;
  const material = materialRef.current;

  // Slow ambient rotation of the points + subtle camera parallax from mouse.
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.02;
    }
    material.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 0.6) * 0.15;

    // Camera parallax — small offset toward the mouse position.
    const mx = (state.mouse.x - mouseTarget.current.x) * 0.04;
    const my = (state.mouse.y - mouseTarget.current.y) * 0.04;
    mouseTarget.current.x += mx;
    mouseTarget.current.y += my;
    // eslint-disable-next-line react-hooks/immutability
    camera.position.x += (mouseTarget.current.x * 30 - camera.position.x) * 0.04;
    camera.position.y += (mouseTarget.current.y * 20 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function subscribe() {
  return () => {};
}
function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

function CoverflowBackground() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!mounted) return null;
  return (
    <Canvas
      camera={{ position: [0, 0, 350], fov: 60 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      dpr={[1, 2]}
    >
      <CoverflowParticles />
    </Canvas>
  );
}

/* ============================================================================
 *  CollectionCard — the inner card content. Same design on mobile + desktop,
 *  only the outer width differs. Uses TiltCard for 3D cursor-follow tilt.
 * ========================================================================== */
function CollectionCard({ c }: { c: Collection }) {
  return (
    <TiltCard>
      <a
        href="#catalog"
        className="group relative block h-full overflow-hidden rounded-lg border border-gold/15 bg-onyx-card shadow-luxe transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lift-card hover:shadow-luxe-hover"
      >
        {/* Image container — portrait 4/5 */}
        <div className="relative aspect-[4/5] h-full overflow-hidden">
          <img
            src={c.image}
            alt={c.title}
            loading="lazy"
            className="img-luxe h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          {/* Dark gradient overlay from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/50 to-transparent" />
          {/* 1px gold inset border on hover (subtle ring) */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/0 transition-colors duration-500 group-hover:ring-gold/25" />
          {/* Decorative gold corner accents — subtle 16px L-shapes on hover */}
          <span
            className="corner-accents pointer-events-none absolute inset-0"
            aria-hidden="true"
          />

          {/* Audience pill — top-left */}
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-gold/25 bg-onyx/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gold backdrop-blur-sm">
            {AUDIENCE_BADGE[c.audience]}
          </span>

          {/* Count badge — top-right, just the number */}
          <span className="absolute right-4 top-4 text-xs font-medium text-ivory/60">
            {c.count}
          </span>

          {/* Bottom content — absolutely positioned */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="font-display text-2xl leading-tight text-ivory">
              {c.title}
            </h3>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-gold">
              {c.subtitle}
            </p>
            {/* Description — collapses to 0 height, expands on hover */}
            <p className="mt-2 max-h-0 overflow-hidden text-sm leading-relaxed text-ivory/65 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:max-h-24 group-hover:opacity-100">
              {c.description}
            </p>
            {/* CTA — fades + lifts in on hover */}
            <div className="mt-3 flex translate-y-2 items-center gap-2 text-gold opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
              <span className="text-xs font-medium uppercase tracking-wider">
                Открыть коллекцию
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </a>
    </TiltCard>
  );
}

/* ============================================================================
 *  CoverflowCard — a single card in the desktop 3D coverflow. Position is
 *  absolute-centered, then offset/scale/rotateY/opacity/zIndex are derived
 *  from `currentIndex` (a MotionValue driven by scroll progress) so each
 *  card fans out left/right of the centered card with real perspective depth.
 * ========================================================================== */
type CoverflowCardProps = {
  index: number;
  currentIndex: MotionValue<number>;
  children: React.ReactNode;
};

function CoverflowCard({ index, currentIndex, children }: CoverflowCardProps) {
  /* offset = i - currentIndex → positive when the card is to the right of
   * the centered card, negative when to the left. */
  const offset = useTransform(currentIndex, (v) => index - v);

  /* rotateY — negative for right cards (left side comes forward),
   * positive for left cards (right side comes forward). Clamped to ±70° so
   * far cards don't flip past 90° and become invisible / mirrored. */
  const rotateY = useTransform(offset, (o) =>
    Math.max(-70, Math.min(70, o * -35))
  );
  /* x — 320px per offset slot (card spacing) */
  const x = useTransform(offset, (o) => o * 320);
  /* z — push back from center by 120px per |offset| (depth sorting) */
  const z = useTransform(offset, (o) => -Math.abs(o) * 120);
  /* scale — shrink far cards by 18% per |offset| */
  const scale = useTransform(offset, (o) => Math.max(0.4, 1 - Math.abs(o) * 0.18));
  /* opacity — fade far cards out by 33% per |offset| */
  const opacity = useTransform(offset, (o) => Math.max(0, 1 - Math.abs(o) * 0.33));
  /* zIndex — closer to center = higher stacking order */
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10)
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: `${-CARD_W / 2}px`,
        marginTop: `${-CARD_H / 2}px`,
        width: `${CARD_W}px`,
        height: `${CARD_H}px`,
        rotateY,
        x,
        z,
        scale,
        opacity,
        zIndex,
        transformStyle: "preserve-3d",
        // CSS reflection — subtle metallic gold sheen on the card surface.
        boxShadow:
          "0 0 0 1px rgba(201, 169, 97, 0.45), 0 24px 50px -20px rgba(0, 0, 0, 0.9)",
      }}
    >
      {/* Metallic gold border ring on top of the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(230,199,117,0.55) 0%, rgba(201,169,97,0.05) 30%, rgba(201,169,97,0.05) 70%, rgba(230,199,117,0.55) 100%)",
          mixBlendMode: "screen",
          opacity: 0.7,
        }}
      />
      <div className="relative h-full w-full">{children}</div>
    </motion.div>
  );
}

/* ============================================================================
 *  Collections — main section component. Mobile renders the vertical 2-col
 *  grid; desktop renders the 3D coverflow (sticky-pinned, scroll-driven).
 * ========================================================================== */
export function Collections() {
  // Mobile vertical grid inView
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileInView = useInView(mobileRef, { once: true, margin: "-80px" });

  // Desktop scroll progress → currentIndex (0..6)
  const desktopRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ["start start", "end end"],
  });
  const currentIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, TOTAL_CARDS - 1]
  );

  return (
    <section
      id="collections"
      className="relative bg-onyx bg-emerald-radial"
    >
      {/* === MOBILE / TABLET (< lg) — vertical grid === */}
      <div className="py-20 md:py-28 lg:hidden">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            center
            eyebrow="Коллекции"
            title="Жемчужины нашей коллекции"
            subtitle="Шесть ключевых направлений нашей коллекции из 2000+ костюмов."
          />

          <div
            ref={mobileRef}
            className="perspective-1000 mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            {COLLECTIONS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 30 }}
                animate={mobileInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <CollectionCard c={c} />
              </motion.div>
            ))}
          </div>

          {/* Bottom centered CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={mobileInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-14 flex justify-center"
          >
            <a href="#catalog" className="btn-gold px-7 py-3 text-sm">
              Смотреть все 2000+ костюмов
            </a>
          </motion.div>
        </div>
      </div>

      {/* === DESKTOP (≥ lg) — 3D Coverflow === */}
      {/* Wrapper sets the scroll distance — 400vh gives ~300vh of coverflow
          rotation travel while the inner div is sticky at h-screen. */}
      <div ref={desktopRef} className="hidden lg:block lg:h-[400vh]">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          {/* Three.js ambient particle background */}
          <CoverflowBackground />

          {/* Heading */}
          <div className="relative z-10 mx-auto mb-8 w-full max-w-7xl px-6">
            <SectionHeading
              center
              eyebrow="Коллекции"
              title="Жемчужины нашей коллекции"
              subtitle="Шесть ключевых направлений нашей коллекции из 2000+ костюмов."
            />
          </div>

          {/* Perspective container — preserve-3d so child rotateY produces real
              3D rotation rather than 2D skew. */}
          <div
            className="relative z-10 mx-auto w-full max-w-7xl"
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
          >
            {/* Inner anchor — fixed height to position absolute cards */}
            <div className="relative h-[480px]">
              {COLLECTIONS.map((c, i) => (
                <CoverflowCard
                  key={c.id}
                  index={i}
                  currentIndex={currentIndex}
                >
                  <CollectionCard c={c} />
                </CoverflowCard>
              ))}
              {/* CTA tail card — index 6 */}
              <CoverflowCard
                index={COLLECTIONS.length}
                currentIndex={currentIndex}
              >
                <a
                  href="#catalog"
                  className="group flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border border-gold/30 bg-onyx-card p-8 text-center shadow-luxe transition-colors duration-500 hover:border-gold/55"
                >
                  <span className="text-gold-gradient font-display text-5xl leading-tight">
                    2000+
                  </span>
                  <span className="text-sm text-ivory/70">
                    костюмов в коллекции
                  </span>
                  <span className="btn-gold mt-2 px-6 py-3 text-sm">
                    Смотреть каталог
                  </span>
                  <ArrowRight className="mt-2 h-4 w-4 text-gold/60 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </CoverflowCard>
            </div>
          </div>

          {/* Progress dots — one per card */}
          <div className="relative z-10 mx-auto mt-8 flex items-center gap-2">
            {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
              <ProgressDot
                key={i}
                index={i}
                activeIndex={currentIndex}
              />
            ))}
          </div>

          {/* Swipe / scroll hint */}
          <div className="relative z-10 mx-auto mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-ivory/40">
            <span>Прокрутите вниз</span>
            <ArrowRight className="h-3 w-3 rotate-90 text-gold/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  ProgressDot — single dot in the coverflow progress indicator. Fills with
 *  gold when its index matches the active card.
 * ========================================================================== */
function ProgressDot({
  index,
  activeIndex,
}: {
  index: number;
  activeIndex: MotionValue<number>;
}) {
  // Dot is "active" when activeIndex is within [index - 0.5, index + 0.5].
  const opacity = useTransform(
    activeIndex,
    [index - 0.5, index, index + 0.5],
    [0.25, 1, 0.25]
  );
  const scale = useTransform(
    activeIndex,
    [index - 0.5, index, index + 0.5],
    [1, 1.4, 1]
  );
  return (
    <motion.span
      aria-hidden
      style={{ opacity, scale }}
      className="h-1.5 w-6 rounded-full bg-gold"
    />
  );
}
