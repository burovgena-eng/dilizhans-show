"use client";

import { useRef, useState, useSyncExternalStore, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, GodRays, Vignette, ChromaticAberration, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";
import {
  nebulaVertexShader, nebulaFragmentShader,
  starfieldVertexShader, starfieldFragmentShader,
  lineStreakVertexShader, lineStreakFragmentShader,
  starVertexShader, starFragmentShader,
  CAMERA_POINTS, AMBIENT_STARS, FINAL_STAR,
} from "./cosmic-shaders";

/* ============================================================================
 * Cinematic Cosmic Journey — Three.js / R3F
 *
 * Camera flies through deep space on scroll:
 *   0.00-0.20  Wide starfield, calm
 *   0.20-0.45  Camera begins forward motion, stars streak past
 *   0.45-0.70  Enter nebula (volumetric gas cloud)
 *   0.70-0.90  Exit nebula, accelerate — hyperspace streaks
 *   0.90-1.00  Approach final star — bloom grows, then fade-to-white
 *
 * 50,000 instanced stars in 3 depth layers + 800 streaks + nebula + 6 ambient
 * star orbs + 1 final star with god rays. Postprocessing: Bloom + GodRays +
 * ChromaticAberration + Vignette + ACES tone mapping.
 * ============================================================================ */

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

// ---------------- Geometry builders ----------------
const STAR_COUNT = 50000;
const STREAK_COUNT = 2500;

function buildStarfieldGeometry() {
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const layers = new Float32Array(STAR_COUNT);
  const tints = new Float32Array(STAR_COUNT * 3);

  const goldTint = new THREE.Color("#FFE6A8");
  const warmTint = new THREE.Color("#FFD8A0");
  const coolTint = new THREE.Color("#D4AF37");
  const emeraldTint = new THREE.Color("#3E8E6A");
  const whiteTint = new THREE.Color("#FFFFFF");

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
    sizes[i] = Math.random() * 3 + 0.5;
    phases[i] = Math.random() * Math.PI * 2;
    layers[i] = Math.random();

    const r = Math.random();
    let tint: THREE.Color;
    if (r < 0.45) tint = whiteTint;
    else if (r < 0.75) tint = goldTint;
    else if (r < 0.9) tint = warmTint;
    else if (r < 0.97) tint = coolTint;
    else tint = emeraldTint;
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

function buildStreakGeometry() {
  // Each streak = 2 vertices forming a line segment along Z-axis.
  // We use line segments (gl.LINES) so the streaks really look like streaks.
  const STREAKS = 1500;
  const positions = new Float32Array(STREAKS * 2 * 3);
  const phases = new Float32Array(STREAKS * 2);
  const layers = new Float32Array(STREAKS * 2);
  const tints = new Float32Array(STREAKS * 2 * 3);

  const gold = new THREE.Color("#FFE6A8");
  const warm = new THREE.Color("#FFD8A0");
  const white = new THREE.Color("#FFFFFF");

  for (let i = 0; i < STREAKS; i++) {
    const x = (Math.random() - 0.5) * 350;
    const y = (Math.random() - 0.5) * 220;
    const z = (Math.random() - 0.5) * 600;
    const layer = Math.random();
    const stretch = 6 + Math.random() * 14;  // length of each streak (in z units)
    const phase = Math.random() * Math.PI * 2;

    const r = Math.random();
    let tint: THREE.Color;
    if (r < 0.5) tint = white;
    else if (r < 0.85) tint = gold;
    else tint = warm;

    // Head vertex (closer to camera, larger z)
    positions[i*6]     = x;
    positions[i*6 + 1] = y;
    positions[i*6 + 2] = z + stretch;
    // Tail vertex (further from camera, smaller z)
    positions[i*6 + 3] = x;
    positions[i*6 + 4] = y;
    positions[i*6 + 5] = z;

    phases[i*2] = phase;
    phases[i*2 + 1] = phase;
    layers[i*2] = layer;
    layers[i*2 + 1] = layer;

    // Tint per vertex
    for (let v = 0; v < 2; v++) {
      tints[(i*2 + v) * 3] = tint.r;
      tints[(i*2 + v) * 3 + 1] = tint.g;
      tints[(i*2 + v) * 3 + 2] = tint.b;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aLayer", new THREE.BufferAttribute(layers, 1));
  geo.setAttribute("aColorTint", new THREE.BufferAttribute(tints, 3));
  return geo;
}

// ---------------- Scene Components ----------------

function CameraController({ scrollRef, mouseRef }:
  { scrollRef: React.MutableRefObject<number>; mouseRef: React.MutableRefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      CAMERA_POINTS.map((p) => new THREE.Vector3(...p)),
      false, "catmullrom", 0.5
    );
  }, []);

  const lookTarget = useRef(new THREE.Vector3(0, 0, -100));

  useFrame((state) => {
    const t = scrollRef.current;
    const time = state.clock.elapsedTime;

    // Subtle idle motion when at start
    const idleT = t < 0.005 ? time * 0.015 : 0;
    const effectiveT = Math.max(0, Math.min(0.999, t + idleT));

    const pos = path.getPointAt(effectiveT);

    // Mouse parallax — gentle
    pos.x += mouseRef.current.x * 6;
    pos.y += mouseRef.current.y * 4;

    // Look toward final star with increasing bias
    const lookT = THREE.MathUtils.smoothstep(effectiveT, 0.0, 1.0);
    const targetPoint = new THREE.Vector3(
      THREE.MathUtils.lerp(pos.x * 0.3, FINAL_STAR.pos[0], lookT),
      THREE.MathUtils.lerp(pos.y * 0.3, FINAL_STAR.pos[1], lookT),
      FINAL_STAR.pos[2]
    );
    lookTarget.current.lerp(targetPoint, 0.06);

    camera.position.lerp(pos, 0.18);
    camera.lookAt(lookTarget.current);

    // FOV widens during hyperspace, narrows at end
    const baseFov = 60;
    const hyperspaceBoost = THREE.MathUtils.smoothstep(effectiveT, 0.65, 0.85) *
                            (1 - THREE.MathUtils.smoothstep(effectiveT, 0.85, 1.0));
    const finalFocus = THREE.MathUtils.smoothstep(effectiveT, 0.85, 1.0) * -20;
    const targetFov = baseFov + hyperspaceBoost * 25 + finalFocus;
    if (camera instanceof THREE.PerspectiveCamera) {
      // eslint-disable-next-line react-hooks/immutability
      camera.fov += (targetFov - camera.fov) * 0.08;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function Starfield({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const geo = useMemo(() => buildStarfieldGeometry(), []);
  const { gl } = useThree();

  const uniformsRef = useRef({
    uTime: { value: 0 },
    uCameraZ: { value: 250 },
    uSpeed: { value: 0 },
    uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
  });

  useFrame((state) => {
     
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
     
    uniformsRef.current.uSpeed.value = speedRef.current;
     
    uniformsRef.current.uCameraZ.value = state.camera.position.z;
  });

  return (
    <points geometry={geo}>
      <shaderMaterial
        // eslint-disable-next-line react-hooks/refs
        uniforms={uniformsRef.current}
        vertexShader={starfieldVertexShader}
        fragmentShader={starfieldFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Streaks({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const geo = useMemo(() => buildStreakGeometry(), []);
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uSpeed: { value: 0 },
  });

  useFrame((state) => {
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
    uniformsRef.current.uSpeed.value = speedRef.current;
  });

  return (
    <lineSegments geometry={geo}>
      <shaderMaterial
        // eslint-disable-next-line react-hooks/refs
        uniforms={uniformsRef.current}
        vertexShader={lineStreakVertexShader}
        fragmentShader={lineStreakFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

function Nebula({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color("#C9A961") }, // gold
    uColorB: { value: new THREE.Color("#1A5A42") }, // emerald
    uColorC: { value: new THREE.Color("#3D2410") }, // deep brown-purple
    uOpacity: { value: 0 },
    uIntensity: { value: 1 },
  });

  useFrame((state) => {
     
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
    const t = scrollRef.current;
    // Nebula visible during middle of journey
    const visible = THREE.MathUtils.smoothstep(t, 0.30, 0.55) *
                    (1 - THREE.MathUtils.smoothstep(t, 0.78, 0.95));
     
    uniformsRef.current.uOpacity.value = visible * 1.2;
     
    uniformsRef.current.uIntensity.value = 0.8 + visible * 0.6;
  });

  return (
    <mesh position={[10, 10, -60]}>
      <sphereGeometry args={[140, 64, 64]} />
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

function AmbientStars() {
  return (
    <>
      {AMBIENT_STARS.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.size, 24, 24]} />
          <meshBasicMaterial color={s.color} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function FinalStar({ starRefSetter }: { starRefSetter: (m: THREE.Mesh | null) => void }) {
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uCoreColor: { value: new THREE.Color(FINAL_STAR.color) },
    uRimColor: { value: new THREE.Color("#FFE8B0") },
    uGlow: { value: 1.2 },
  });

  useFrame((state) => {
     
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      ref={(m) => starRefSetter(m)}
      position={FINAL_STAR.pos}
    >
      <sphereGeometry args={[14, 96, 96]} />
      <shaderMaterial
        // eslint-disable-next-line react-hooks/refs
        uniforms={uniformsRef.current}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
      />
    </mesh>
  );
}

function CosmicScene({ scrollRef }:
  { scrollRef: React.MutableRefObject<number> }) {
  const starRef = useRef<THREE.Mesh | null>(null);
  const [starMesh, setStarMesh] = useState<THREE.Mesh | null>(null);
  const mouseRef = useRef(new THREE.Vector3(0, 0, 0));
  const { gl } = useThree();

  // Mouse parallax (subtle)
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

  const speedRef = useRef(0);

  useFrame(() => {
    const t = scrollRef.current;
    // Hyperspace speed curve — stronger, peaks earlier
    let target = 0;
    if (t < 0.15) target = 0.02;
    else if (t < 0.40) target = 0.05 + (t - 0.15) * 1.2;       // accelerating
    else if (t < 0.65) target = 0.35 + (t - 0.40) * 2.4;       // mid-fast
    else if (t < 0.88) target = 0.95 + (t - 0.65) * 2.0;       // peak warp
    else target = Math.max(0, 1.4 - (t - 0.88) * 12);          // hard brake
    speedRef.current += (target - speedRef.current) * 0.12;
  });

  const handleStarRef = (m: THREE.Mesh | null) => {
    starRef.current = m;
    setStarMesh(m);
  };

  return (
    <>
      <CameraController scrollRef={scrollRef} mouseRef={mouseRef} />
      <Starfield speedRef={speedRef} />
      <Streaks speedRef={speedRef} />
      <Nebula scrollRef={scrollRef} />
      <AmbientStars />
      <FinalStar starRefSetter={handleStarRef} />
      <ambientLight intensity={0.4} />

      <EffectComposer multisampling={4} autoClear={false}>
        <Bloom
          intensity={1.6}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.3}
          mipmapBlur
          kernelSize={KernelSize.HUGE}
        />
        {starMesh && (
          <GodRays
            sun={starMesh}
            blendFunction={BlendFunction.SCREEN}
            samples={60}
            density={0.92}
            decay={0.94}
            weight={0.35}
            exposure={0.4}
            clampMax={1.0}
          />
        )}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0006, 0.0012]}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
        <ToneMapping />
      </EffectComposer>
    </>
  );
}

// ---------------- Public component ----------------
// Parent passes a `scrollRef` (a ref to a number 0..1) that gets updated each frame.
// CosmicHero (parent) will write to scrollRef.current on scroll.

export function CosmicJourney({ scrollRef }:
  { scrollRef: React.MutableRefObject<number> }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 250], fov: 60, near: 0.1, far: 2000 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 2]}
    >
      <CosmicScene scrollRef={scrollRef} />
    </Canvas>
  );
}
