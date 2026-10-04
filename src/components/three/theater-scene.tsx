"use client";

import { useRef, useSyncExternalStore, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, SMAA, ToneMapping } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import * as THREE from "three";

/* ============================================================================
 * TheaterScene3D — circular theater stage with 4 stage spotlights (volumetric
 * cones) and 4 costume pedestals.
 *
 * Camera path:
 *   - Stage seen from afar after curtain opens
 *   - Camera approaches stage at 20-25° angle
 *   - 4 spotlights ignite sequentially (bright warm gold, narrow cone)
 *   - Camera approaches each costume: CLOSE-UP, 10-15° below horizon,
 *     costume on LEFT of screen, info block on RIGHT
 *
 * Costume models are placeholders (capsule + pedestal) — swap with GLTF later.
 * ============================================================================ */

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

// ---------------- Constants ----------------
const STAGE_RADIUS = 10;
const STAGE_HEIGHT = 0.4;
const COSTUME_COUNT = 4;
const COSTUME_RING_RADIUS = 7;
const SPOTLIGHT_HEIGHT = 18;
const SPOTLIGHT_RING_RADIUS = 6; // closer to costume, directly above

// 4 costumes around the circular stage
const COSTUME_ANGLES = [
  0,                    // front
  Math.PI / 2,          // right
  Math.PI,              // back
  -Math.PI / 2,         // left
];

function angleToPos(angle: number, radius: number, y: number = 0): [number, number, number] {
  return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
}

// Camera path — stage far → approach at 20-25° → 4 costume close-ups
// For each costume: camera FARTHER back (costume fits fully in screen),
// 10-15° below horizon, offset right so costume appears on LEFT.
// More keyframes per costume = longer dwell time.
const CAMERA_PATH_POINTS: [number, number, number][] = [
  // Stage far away after curtain — high and distant (20-25° angle)
  [0, 22, 55],          // very far
  [0, 18, 42],          // approaching
  [0, 14, 32],          // closer
  [0, 11, 24],          // arrival — spotlights ignite
  // Costume 1 (front, angle=0°) — profile view, full body in screen
  // Camera farther back (dist ~7) so full costume fits
  [5, 4, 9],            // approach
  [4.5, 3.5, 8],        // settle — costume on left, profile
  [4.5, 3.5, 8],        // dwell (duplicate = longer pause)
  [4.5, 3.5, 8],        // dwell
  // Costume 2 (right, angle=90°)
  [9, 4, 3],            // move
  [8.5, 3.5, 2],        // settle
  [8.5, 3.5, 2],        // dwell
  [8.5, 3.5, 2],        // dwell
  // Costume 3 (back, angle=180°)
  [4, 4, -5],            // move
  [3.5, 3.5, -6],        // settle
  [3.5, 3.5, -6],        // dwell
  [3.5, 3.5, -6],        // dwell
  // Costume 4 (left, angle=270°)
  [-3, 4, -1],          // move
  [-3.5, 3.5, 0],       // settle
  [-3.5, 3.5, 0],       // dwell
  [-3.5, 3.5, 0],        // dwell
];

// ---------------- Stage ----------------

function StagePlatform() {
  return (
    <group>
      {/* Main stage disc */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[STAGE_RADIUS, STAGE_RADIUS, STAGE_HEIGHT, 96]} />
        <meshStandardMaterial color="#3A2418" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Gold trim ring on top edge */}
      <mesh position={[0, STAGE_HEIGHT / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[STAGE_RADIUS, 0.08, 16, 96]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.85}
          roughness={0.25}
          emissive="#5A4520"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Decorative concentric rings */}
      {[3, 5, 7].map((r, i) => (
        <mesh
          key={i}
          position={[0, STAGE_HEIGHT / 2 + 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[r - 0.05, r, 64]} />
          <meshStandardMaterial
            color="#5A3A20"
            metalness={0.3}
            roughness={0.6}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------- Volumetric spotlight cone ----------------
// A transparent cone that simulates the visible beam of a stage spotlight.
function SpotlightCone({ position, targetPos, intensityRef }: {
  position: [number, number, number];
  targetPos: [number, number, number];
  intensityRef: React.MutableRefObject<number>;
}) {
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    const intensity = intensityRef.current;
    if (spotRef.current && targetRef.current) {
      spotRef.current.intensity = intensity * 30;
      spotRef.current.target = targetRef.current;
      targetRef.current.updateMatrixWorld();
    }
  });

  return (
    <group>
      <spotLight
        ref={spotRef}
        position={position}
        angle={0.3}
        penumbra={0.2}
        intensity={0}
        color="#FFE8B0"
        distance={30}
        decay={0.5}
      />
      <object3D ref={targetRef} position={targetPos} />
    </group>
  );
}

// ---------------- Costume placeholder ----------------

function CostumePlaceholder({ index, scrollRef }: {
  index: number;
  scrollRef: React.MutableRefObject<number>;
}) {
  const angle = COSTUME_ANGLES[index];
  const pos = angleToPos(angle, COSTUME_RING_RADIUS, STAGE_HEIGHT / 2);
  const groupRef = useRef<THREE.Group>(null);

  // Spotlight ignition: 0.30 + index * 0.03 → 0.04 duration
  const igniteStart = 0.30 + index * 0.03;
  const igniteEnd = igniteStart + 0.04;

  // Use ref for intensity (NOT useState) — useState in useFrame causes
  // 60fps re-renders which breaks R3F rendering
  const intensityRef = useRef(0);

  useFrame(() => {
    // Profile view: fixed rotation (no spinning)
    if (groupRef.current) {
      groupRef.current.rotation.y = angle + Math.PI / 2;
    }
    const t = scrollRef.current;
    intensityRef.current = THREE.MathUtils.smoothstep(t, igniteStart, igniteEnd);
  });

  const spotPos = angleToPos(angle, SPOTLIGHT_RING_RADIUS, SPOTLIGHT_HEIGHT);

  return (
    <group position={pos}>
      {/* Pedestal */}
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 1.0, 0.6, 32]} />
        <meshStandardMaterial color="#2A1810" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.04, 12, 48]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Costume placeholder — BIG bright box for visibility testing */}
      <mesh ref={groupRef} position={[0, 3.0, 0]} castShadow>
        <boxGeometry args={[1.5, 4.0, 0.8]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.5}
          roughness={0.3}
          emissive="#FFD700"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Volumetric spotlight cone + actual SpotLight */}
      <SpotlightCone
        position={spotPos}
        targetPos={[pos[0], STAGE_HEIGHT + 0.5, pos[2]]}
        intensityRef={intensityRef}
      />
    </group>
  );
}

// ---------------- Camera controller ----------------

function CameraController({ scrollRef }: {
  scrollRef: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      CAMERA_PATH_POINTS.map((p) => new THREE.Vector3(...p)),
      false, "catmullrom", 0.5
    );
  }, []);

  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const t = scrollRef.current;
    const effectiveT = Math.max(0, Math.min(0.999, t));
    const pos = path.getPointAt(effectiveT);

    // Look target based on phase
    let targetPos: THREE.Vector3;
    if (t < 0.28) {
      // Approach phase — look at stage center
      targetPos = new THREE.Vector3(0, 0, 0);
    } else {
      // Costume phase — 4 costumes, each gets ~18% of scroll
      // Costume 1: 0.28-0.46, Costume 2: 0.46-0.64, etc.
      const costumeT = (t - 0.28) / 0.72;
      const costumeIdx = Math.min(3, Math.floor(costumeT * 4));
      const angle = COSTUME_ANGLES[costumeIdx];
      const cPos = angleToPos(angle, COSTUME_RING_RADIUS, 1.2);
      // "Right" direction = perpendicular to costume angle (clockwise)
      const rightAngle = angle - Math.PI / 2;
      const offsetX = Math.cos(rightAngle) * 3.0;
      const offsetZ = Math.sin(rightAngle) * 3.0;
      targetPos = new THREE.Vector3(cPos[0] + offsetX, 1.2, cPos[2] + offsetZ);
    }

    lookTarget.current.lerp(targetPos, 0.05);
    camera.position.lerp(pos, 0.08);
    camera.lookAt(lookTarget.current);

    // FOV: wider during approach, 40° for costume (fits full body in screen)
    const targetFov = t < 0.28 ? 45 : 40;
    if (camera instanceof THREE.PerspectiveCamera) {
      // eslint-disable-next-line react-hooks/immutability
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// ---------------- Lighting ----------------

function AmbientLighting() {
  return (
    <>
      <ambientLight intensity={0.08} color="#2A1A10" />
      <hemisphereLight args={["#3A2A18", "#0A0604", 0.15]} />
    </>
  );
}

function StageBackdrop() {
  return (
    <mesh position={[0, 8, -20]}>
      <planeGeometry args={[80, 30]} />
      <meshStandardMaterial
        color="#080404"
        metalness={0.3}
        roughness={0.95}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------- Scene ----------------

function TheaterScene({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  return (
    <>
      <CameraController scrollRef={scrollRef} />
      <AmbientLighting />
      <StageBackdrop />
      <StagePlatform />
      {Array.from({ length: COSTUME_COUNT }).map((_, i) => (
        <CostumePlaceholder key={i} index={i} scrollRef={scrollRef} />
      ))}

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.25}
          mipmapBlur
          kernelSize={KernelSize.HUGE}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.9} />
        <SMAA />
        <ToneMapping />
      </EffectComposer>
    </>
  );
}

// ---------------- Public component ----------------

export function TheaterScene3D({ scrollRef }: {
  scrollRef: React.MutableRefObject<number>;
}) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 20, 50], fov: 45, near: 0.1, far: 300 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 2]}
      shadows
    >
      <TheaterScene scrollRef={scrollRef} />
    </Canvas>
  );
}
