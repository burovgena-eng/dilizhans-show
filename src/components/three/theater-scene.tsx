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

// Camera path — explicit phases: approach → 4 costumes with dwell
// For each costume: camera offset RIGHT (costume appears LEFT in frame).
// lookTarget = costume position (NOT offset) so costume is on left side.
//
// Phase boundaries (theater scene scroll 0..1):
//   0.00-0.28  Approach (4 points, smooth)
//   0.28-0.42  Costume 1 (dwell at fixed position)
//   0.42-0.56  Costume 2
//   0.56-0.70  Costume 3
//   0.70-1.00  Costume 4 (longer final dwell)

const APPROACH_END = 0.28;
const COSTUME_PHASES = [
  { start: 0.28, end: 0.42 },  // costume 0
  { start: 0.42, end: 0.56 },  // costume 1
  { start: 0.56, end: 0.70 },  // costume 2
  { start: 0.70, end: 1.00 },  // costume 3
];

// Camera positions for each costume — offset to the RIGHT of costume
// so costume appears on LEFT of screen. LookTarget = costume itself.
const COSTUME_CAMERA_POSITIONS: [number, number, number][] = [
  // Costume 0 (front, angle=0°, pos=[7, 0.2, 0])
  // Camera right-front, slightly above (10-15° below horizon)
  [10, 3, 7],
  // Costume 1 (right, angle=90°, pos=[0, 0.2, 7])
  // Camera right side
  [7, 3, 10],
  // Costume 2 (back, angle=180°, pos=[-7, 0.2, 0])
  // Camera right-back
  [-4, 3, 7],
  // Costume 3 (left, angle=270°, pos=[0, 0.2, -7])
  // Camera right-left
  [4, 3, -4],
];

// Approach camera positions (4 points)
const APPROACH_POSITIONS: [number, number, number][] = [
  [0, 22, 55],   // very far
  [0, 16, 38],   // approaching
  [0, 12, 28],   // closer
  [0, 9, 20],    // arrival (spotlights ignite here)
];

function lerpVec3(a: [number, number, number], b: [number, number, number], t: number): THREE.Vector3 {
  return new THREE.Vector3(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  );
}

function smoothstep01(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

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
    if (groupRef.current) {
      groupRef.current.rotation.y = angle + Math.PI / 2;
    }
    const t = scrollRef.current;

    if (t < igniteEnd) {
      // Ignition phase — spotlight fades in
      intensityRef.current = THREE.MathUtils.smoothstep(t, igniteStart, igniteEnd);
    } else {
      // After ignition — current costume full, others dimmed
      const costumeT = (t - APPROACH_END) / (1 - APPROACH_END);
      const currentIdx = Math.min(3, Math.floor(costumeT * 4));
      if (index === currentIdx) {
        // Current costume — full bright spotlight
        intensityRef.current = 1.0;
      } else {
        // Not current — dimmed to 20%
        intensityRef.current = 0.2;
      }
    }
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

      {/* Costume placeholder — bright red box, guaranteed visible */}
      <mesh ref={groupRef} position={[0, 3.0, 0]} castShadow>
        <boxGeometry args={[2.0, 4.0, 1.0]} />
        <meshStandardMaterial
          color="#FF3030"
          emissive="#FF0000"
          emissiveIntensity={2.0}
        />
      </mesh>
      {/* Point light on costume — guarantees visibility */}
      <pointLight position={[0, 3.0, 1.5]} intensity={5} distance={8} color="#FFFFFF" />

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
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const t = scrollRef.current;
    let targetPos: THREE.Vector3;
    let lookPos: THREE.Vector3;

    if (t < APPROACH_END) {
      // Approach phase — interpolate through approach points, look at stage center
      const approachT = t / APPROACH_END;
      const segCount = APPROACH_POSITIONS.length - 1;
      const segIdx = Math.min(segCount - 1, Math.floor(approachT * segCount));
      const segT = (approachT * segCount) - segIdx;
      const a = APPROACH_POSITIONS[segIdx];
      const b = APPROACH_POSITIONS[segIdx + 1];
      targetPos = lerpVec3(a, b, smoothstep01(segT));
      lookPos = new THREE.Vector3(0, 0, 0);
    } else {
      // Costume phase — find which costume we're viewing
      const costumeT = (t - APPROACH_END) / (1 - APPROACH_END);
      const costumeIdx = Math.min(3, Math.floor(costumeT * 4));
      const phase = COSTUME_PHASES[costumeIdx];

      // Within this phase: 0-0.15 transition in, 0.15-0.85 dwell, 0.85-1.0 transition out
      const withinPhase = (t - phase.start) / (phase.end - phase.start);
      const camPos = COSTUME_CAMERA_POSITIONS[costumeIdx];

      if (withinPhase < 0.15) {
        // Transition from previous position
        const transT = smoothstep01(withinPhase / 0.15);
        const prevIdx = Math.max(0, costumeIdx - 1);
        const prevCam = costumeIdx === 0 ? APPROACH_POSITIONS[3] : COSTUME_CAMERA_POSITIONS[prevIdx];
        targetPos = lerpVec3(prevCam, camPos, transT);
      } else if (withinPhase > 0.85 && costumeIdx < 3) {
        // Transition to next
        const transT = smoothstep01((withinPhase - 0.85) / 0.15);
        const nextCam = COSTUME_CAMERA_POSITIONS[costumeIdx + 1];
        targetPos = lerpVec3(camPos, nextCam, transT);
      } else {
        // Dwell — camera stays at costume position
        targetPos = new THREE.Vector3(...camPos);
      }

      // LookTarget = costume position (camera looks AT costume)
      const angle = COSTUME_ANGLES[costumeIdx];
      const cPos = angleToPos(angle, COSTUME_RING_RADIUS, 1.5);
      lookPos = new THREE.Vector3(cPos[0], 1.5, cPos[2]);
    }

    lookTarget.current.lerp(lookPos, 0.06);
    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(lookTarget.current);

    // Use setViewOffset to shift projection — during costume view,
    // shift right by 25% so costume appears on LEFT of screen,
    // leaving ~50% on the right for info text blocks.
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = t < APPROACH_END ? 45 : 40;
      // eslint-disable-next-line react-hooks/immutability
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();

      // Shift view horizontally during costume phase
      if (t >= APPROACH_END) {
        camera.setViewOffset(1, 1, 0.25, 0, 1, 1); // 25% right shift
      } else {
        camera.clearViewOffset();
      }
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
