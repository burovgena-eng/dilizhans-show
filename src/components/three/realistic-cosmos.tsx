"use client";

import { useRef, useSyncExternalStore, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, SMAA, ToneMapping } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import * as THREE from "three";
import {
  planetVertexShader, planetFragmentShader,
  gasGiantVertexShader, gasGiantFragmentShader,
  starSurfaceVertexShader, starSurfaceFragmentShader,
  atmosphereVertexShader, atmosphereFragmentShader,
  ringVertexShader, ringFragmentShader,
  starFieldVertexShader, starFieldFragmentShader,
  nebulaVertexShader, nebulaFragmentShader,
} from "./planet-shaders";

/* ============================================================================
 * Realistic Cosmic Journey — Three.js / R3F
 *
 * Scroll-driven cinematic flight through deep space:
 *   0.00-0.10  Curtain opens to reveal cosmos (curtain handled in parent)
 *   0.10-0.40  Calm starfield, planet passes to the side
 *   0.40-0.70  Pass near gas giant with rings, nebula visible
 *   0.70-0.95  Approach final star — surface detail grows
 *   0.95-1.00  Star fills frame, fade to portal state
 *
 * Realistic elements:
 *   - 60k procedural star points (depth layers, soft twinkle, no flicker)
 *   - 3 earth-like planets with fbm continents/oceans/clouds/atmosphere
 *   - 1 gas giant with banded atmosphere + ring system
 *   - 1 final star with plasma surface + corona
 *   - 2 nebulae (gold + emerald)
 * Post: Bloom (mipmap, HUGE kernel), Vignette, SMAA, ACES tone mapping.
 * ============================================================================ */

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

// ---------------- Camera path ----------------
const CAMERA_POINTS: [number, number, number][] = [
  [0, 0, 280],         // Start: distant
  [8, 5, 200],         // Slow approach
  [-12, -3, 110],      // Drift left
  [22, 12, 30],        // Pass near planet 1
  [-25, -8, -50],      // S-curve
  [15, 4, -130],       // Pass near gas giant
  [5, 2, -200],        // Lock onto star
  [0, 0, -270],        // Approach star
];

// ---------------- Planet configs ----------------
interface PlanetConfig {
  pos: [number, number, number];
  radius: number;
  seed: number;
  colors: {
    ocean: string;
    shore: string;
    land: string;
    mountain: string;
    ice: string;
    atmosphere: string;
  };
  cloudOpacity: number;
  hasRing?: boolean;
}

const PLANETS: PlanetConfig[] = [
  // Earth-like (blue/green) — far left
  {
    pos: [-60, 18, 60], radius: 8, seed: 0.13,
    colors: {
      ocean: "#0B2A52", shore: "#1E5A8A", land: "#2E6B3F",
      mountain: "#6E5A3F", ice: "#E8F0F5", atmosphere: "#5A8AC8",
    },
    cloudOpacity: 0.6,
  },
  // Mars-like (warm orange) — middle-right, but reduce red intensity
  {
    pos: [85, -22, -20], radius: 6.5, seed: 0.42,
    colors: {
      ocean: "#7A4818", shore: "#B06028", land: "#D8782A",
      mountain: "#A05030", ice: "#F0E8D8", atmosphere: "#E8A878",
    },
    cloudOpacity: 0.18,
  },
  // Ice world (pale blue/white) — far
  {
    pos: [-100, -50, -180], radius: 5, seed: 0.71,
    colors: {
      ocean: "#2A4860", shore: "#5080A0", land: "#80A8C8",
      mountain: "#B0D0E0", ice: "#F0F8FF", atmosphere: "#A0C8E8",
    },
    cloudOpacity: 0.45,
  },
  // Gas giant with rings (gold/amber) — close to final approach
  {
    pos: [-40, 15, -130], radius: 14, seed: 0.55, hasRing: true,
    colors: {
      ocean: "#5A3A18", shore: "#8A5820", land: "#C8961F",
      mountain: "#E0B860", ice: "#F0E0A8", atmosphere: "#D4AF37",
    },
    cloudOpacity: 0.0, // gas giants don't use cloud layer
  },
];

const FINAL_STAR_POS: [number, number, number] = [0, 0, -340];

// Direction to "system light" (from final star outward)
const STAR_DIR = new THREE.Vector3(0, 0.3, 1).normalize();

// ---------------- Geometry: starfield ----------------
const STAR_COUNT = 60000;

function buildStarfieldGeometry() {
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const layers = new Float32Array(STAR_COUNT);
  const tints = new Float32Array(STAR_COUNT * 3);

  const tintsList = [
    new THREE.Color("#FFFFFF"),
    new THREE.Color("#FFF4E0"),
    new THREE.Color("#FFE6A8"),
    new THREE.Color("#FFC880"),
    new THREE.Color("#D4E8FF"),
    new THREE.Color("#A8C8FF"),
  ];

  for (let i = 0; i < STAR_COUNT; i++) {
    // Spread stars in a large volume (sphere distribution for natural look)
    const r = 200 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) - 200; // bias toward -Z (where we travel)

    sizes[i] = Math.random() * 2.2 + 0.4;
    phases[i] = Math.random() * Math.PI * 2;
    layers[i] = Math.random();

    const tint = tintsList[Math.floor(Math.random() * tintsList.length)];
    tints[i * 3] = tint.r;
    tints[i * 3 + 1] = tint.g;
    tints[i * 3 + 2] = tint.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aLayer", new THREE.BufferAttribute(layers, 1));
  geo.setAttribute("aColorTint", new THREE.BufferAttribute(tints, 3));
  return geo;
}

// ---------------- Components ----------------

function CameraController({ scrollRef, mouseRef }: {
  scrollRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const { camera } = useThree();
  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      CAMERA_POINTS.map((p) => new THREE.Vector3(...p)),
      false, "catmullrom", 0.5
    );
  }, []);

  const lookTarget = useRef(new THREE.Vector3(0, 0, -200));

  useFrame((state) => {
    const t = scrollRef.current;
    const time = state.clock.elapsedTime;
    // Subtle idle drift at the very start
    const idleT = t < 0.01 ? time * 0.005 : 0;
    const effectiveT = Math.max(0, Math.min(0.999, t + idleT));

    const pos = path.getPointAt(effectiveT);
    // Mouse parallax
    pos.x += mouseRef.current.x * 4;
    pos.y += mouseRef.current.y * 3;

    // Look toward final star with increasing bias
    const lookBias = THREE.MathUtils.smoothstep(effectiveT, 0.2, 0.95);
    const target = new THREE.Vector3(
      THREE.MathUtils.lerp(0, FINAL_STAR_POS[0], lookBias),
      THREE.MathUtils.lerp(0, FINAL_STAR_POS[1], lookBias),
      FINAL_STAR_POS[2]
    );
    lookTarget.current.lerp(target, 0.04);

    camera.position.lerp(pos, 0.12);
    camera.lookAt(lookTarget.current);

    // FOV: slight widening near end for "portal" approach feel
    const baseFov = 55;
    const endZoom = THREE.MathUtils.smoothstep(effectiveT, 0.85, 1.0) * -8;
    const targetFov = baseFov + endZoom;
    if (camera instanceof THREE.PerspectiveCamera) {
      // eslint-disable-next-line react-hooks/immutability
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function Starfield() {
  const geo = useMemo(() => buildStarfieldGeometry(), []);
  const { gl } = useThree();
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
  });

  useFrame((state) => {
     
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points geometry={geo}>
      <shaderMaterial
        // eslint-disable-next-line react-hooks/refs
        uniforms={uniformsRef.current}
        vertexShader={starFieldVertexShader}
        fragmentShader={starFieldFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Planet({ config }: { config: PlanetConfig }) {
  const isGasGiant = config.cloudOpacity === 0;
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uColorOcean: { value: new THREE.Color(config.colors.ocean) },
    uColorShore: { value: new THREE.Color(config.colors.shore) },
    uColorLand: { value: new THREE.Color(config.colors.land) },
    uColorMountain: { value: new THREE.Color(config.colors.mountain) },
    uColorIce: { value: new THREE.Color(config.colors.ice) },
    uAtmosphere: { value: new THREE.Color(config.colors.atmosphere) },
    uStarDir: { value: STAR_DIR.clone() },
    uCloudOpacity: { value: config.cloudOpacity },
    uSeed: { value: config.seed },
    // Gas giant uniforms (used only if isGasGiant)
    uColorA: { value: new THREE.Color("#8A5820") },
    uColorB: { value: new THREE.Color("#C8961F") },
    uColorC: { value: new THREE.Color("#E0B860") },
  });

  // Slow rotation
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04;
    }
     
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={config.pos}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.radius, 128, 128]} />
        <shaderMaterial
          // eslint-disable-next-line react-hooks/refs
          uniforms={uniformsRef.current}
          vertexShader={isGasGiant ? gasGiantVertexShader : planetVertexShader}
          fragmentShader={isGasGiant ? gasGiantFragmentShader : planetFragmentShader}
        />
      </mesh>

      {/* Atmosphere halo — back-side additive */}
      <mesh scale={1.15}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <shaderMaterial
          uniforms={{
            uColor: { value: new THREE.Color(config.colors.atmosphere) },
            uIntensity: { value: 1.4 },
            uStarDir: { value: STAR_DIR.clone() },
          }}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ring system for gas giant */}
      {config.hasRing && (
        <mesh rotation={[Math.PI * 0.42, 0, Math.PI * 0.05]}>
          <ringGeometry args={[config.radius * 1.4, config.radius * 2.6, 256, 1]} />
          <shaderMaterial
            uniforms={{
              uColorA: { value: new THREE.Color("#E0B860") },
              uColorB: { value: new THREE.Color("#8A5820") },
              uSeed: { value: config.seed * 2.1 },
            }}
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function FinalStar() {
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uCoreColor: { value: new THREE.Color("#FFD56B") },
    uHotColor: { value: new THREE.Color("#FFF4C8") },
    uRimColor: { value: new THREE.Color("#FFA840") },
    uSeed: { value: 0.31 },
  });

  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
     
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={FINAL_STAR_POS}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[24, 128, 128]} />
        <shaderMaterial
          // eslint-disable-next-line react-hooks/refs
          uniforms={uniformsRef.current}
          vertexShader={starSurfaceVertexShader}
          fragmentShader={starSurfaceFragmentShader}
          toneMapped={false}
        />
      </mesh>

      {/* Corona / outer atmosphere */}
      <mesh scale={1.5}>
        <sphereGeometry args={[24, 48, 48]} />
        <shaderMaterial
          uniforms={{
            uColor: { value: new THREE.Color("#FFE8A8") },
            uIntensity: { value: 1.8 },
            uStarDir: { value: STAR_DIR.clone() },
          }}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Nebula({ position, colors, opacity, scrollRef, fadeRange }:
  { position: [number, number, number]; colors: { a: string; b: string; c: string };
    opacity: number; scrollRef: React.MutableRefObject<number>;
    fadeRange: [number, number]; }) {
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(colors.a) },
    uColorB: { value: new THREE.Color(colors.b) },
    uColorC: { value: new THREE.Color(colors.c) },
    uOpacity: { value: 0 },
    uIntensity: { value: 1 },
  });

  useFrame((state) => {
     
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
    const t = scrollRef.current;
    const [start, end] = fadeRange;
    const visible = THREE.MathUtils.smoothstep(t, start, start + 0.15) *
                    (1 - THREE.MathUtils.smoothstep(t, end - 0.15, end));
     
    uniformsRef.current.uOpacity.value = visible * opacity;
     
    uniformsRef.current.uIntensity.value = 0.8 + visible * 0.6;
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[80, 48, 48]} />
      <shaderMaterial
        // eslint-disable-next-line react-hooks/refs
        uniforms={uniformsRef.current}
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function CosmicScene({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const mouseRef = useRef(new THREE.Vector3(0, 0, 0));
  const { gl } = useThree();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = -((e.clientY - rect.top) / rect.height - 0.5);
      mouseRef.current.set(nx, ny, 0);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [gl]);

  return (
    <>
      <CameraController scrollRef={scrollRef} mouseRef={mouseRef} />
      <Starfield />
      <Nebula
        position={[-30, 25, -60]}
        colors={{ a: "#C9A961", b: "#1A5A42", c: "#3D2410" }}
        opacity={2.2}
        scrollRef={scrollRef}
        fadeRange={[0.05, 0.92]}
      />
      <Nebula
        position={[80, -40, -150]}
        colors={{ a: "#9A6AAA", b: "#4A3A70", c: "#2A1040" }}
        opacity={1.8}
        scrollRef={scrollRef}
        fadeRange={[0.15, 0.95]}
      />
      <Nebula
        position={[-60, -20, -240]}
        colors={{ a: "#D4A04A", b: "#7A4818", c: "#3A1808" }}
        opacity={1.6}
        scrollRef={scrollRef}
        fadeRange={[0.30, 0.98]}
      />
      {PLANETS.map((p, i) => (
        <Planet key={i} config={p} />
      ))}
      <FinalStar />

      {/* Lighting — hemisphere + directional for ambient fill on any
          standard-material meshes (planet shaders do their own lighting) */}
      <ambientLight intensity={0.5} color="#FFF4D6" />
      <hemisphereLight args={["#FFE9A8", "#1A0F08", 0.6]} />
      <directionalLight position={[10, 8, 5]} intensity={0.8} color="#FFF1C8" />

      <EffectComposer multisampling={8}>
        <Bloom
          intensity={1.3}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.32}
          mipmapBlur
          kernelSize={KernelSize.HUGE}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.78} />
        <SMAA />
        <ToneMapping />
      </EffectComposer>
    </>
  );
}

// ---------------- Public component ----------------

export function RealisticCosmos({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 280], fov: 55, near: 0.1, far: 4000 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 2.5]}
    >
      <CosmicScene scrollRef={scrollRef} />
    </Canvas>
  );
}
