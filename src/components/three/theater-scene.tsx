"use client";

import { useRef, useSyncExternalStore, useMemo, useState } from "react";
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
const SPOTLIGHT_HEIGHT = 16;
const SPOTLIGHT_RING_RADIUS = 8;

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

// Camera path — stage far away → approach at 20-25° → 4 costume close-ups
// For each costume: camera close (dist ~3), slightly above (10-15° below horizon),
// offset to the RIGHT so costume appears on LEFT of screen.
const CAMERA_PATH_POINTS: [number, number, number][] = [
  // Stage far away after curtain — high and distant (20-25° angle)
  [0, 20, 50],          // very far back, high
  [0, 16, 38],          // approaching
  [0, 12, 28],          // closer, stage visible at 20-25°
  [0, 10, 22],          // arrival at stage — spotlights ignite
  // Costume 1 (front, angle=0°) — close-up, 10-15° below horizon, camera right
  [3, 3.5, 6],          // approach from right
  [2.5, 2.5, 4.5],      // CLOSE-UP: costume left, camera right, looking slightly down
  // Costume 2 (right, angle=90°)
  [9, 3.5, 1],          // move to right side
  [8, 2.5, 0.5],        // close-up
  // Costume 3 (back, angle=180°)
  [4, 3.5, -6],         // move to back
  [3, 2.5, -7],          // close-up
  // Costume 4 (left, angle=270°)
  [-4, 3.5, -2],        // move to left
  [-5, 2.5, -1],         // close-up
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
function SpotlightCone({ position, targetPos, intensity }: {
  position: [number, number, number];
  targetPos: [number, number, number];
  intensity: number;
}) {
  const coneRef = useRef<THREE.Mesh>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const spotTargetRef = useRef<THREE.Object3D>(null);

  // Compute cone geometry from position to target
  const dir = useMemo(() => {
    const p = new THREE.Vector3(...position);
    const t = new THREE.Vector3(...targetPos);
    return new THREE.Vector3().subVectors(t, p);
  }, [position, targetPos]);

  const length = dir.length();
  const midPoint = useMemo(() => {
    const p = new THREE.Vector3(...position);
    const t = new THREE.Vector3(...targetPos);
    return new THREE.Vector3().addVectors(p, t).multiplyScalar(0.5);
  }, [position, targetPos]);

  // Cone orientation: point from position toward target
  const quaternion = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const d = dir.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(up, d);
  }, [dir]);

  useFrame(() => {
    if (spotRef.current) {
      spotRef.current.intensity = intensity * 25;
    }
  });

  return (
    <group>
      {/* Volumetric cone — transparent, additive blending */}
      <mesh
        ref={coneRef}
        position={midPoint.toArray()}
        quaternion={quaternion}
      >
        <coneGeometry args={[1.5, length, 32, 1, true]} />
        <meshBasicMaterial
          color="#FFE8B0"
          transparent
          opacity={intensity * 0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Actual SpotLight for scene illumination */}
      <spotLight
        ref={spotRef}
        position={position}
        angle={0.25}
        penumbra={0.15}
        intensity={0}
        color="#FFE8B0"
        distance={30}
        decay={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <primitive
        ref={spotTargetRef}
        object={new THREE.Object3D()}
        position={targetPos}
      />
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

  const [spotlightIntensity, setSpotlightIntensity] = useState(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
    const t = scrollRef.current;
    const intensity = THREE.MathUtils.smoothstep(t, igniteStart, igniteEnd);
    setSpotlightIntensity(intensity);
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

      {/* Costume placeholder — capsule + head */}
      <group ref={groupRef} position={[0, 1.5, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.35, 1.2, 8, 16]} />
          <meshStandardMaterial
            color="#C8961F"
            metalness={0.6}
            roughness={0.35}
            emissive="#3A2A10"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#E8C8A0" metalness={0.2} roughness={0.6} />
        </mesh>
      </group>

      {/* Volumetric spotlight cone + actual SpotLight */}
      <SpotlightCone
        position={spotPos}
        targetPos={[pos[0], STAGE_HEIGHT, pos[2]]}
        intensity={spotlightIntensity}
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
    if (t < 0.30) {
      // Approach phase — look at stage center
      targetPos = new THREE.Vector3(0, 0, 0);
    } else {
      // Costume phase — look at point to the RIGHT of the costume
      // (perpendicular to camera→costume direction) so the costume
      // appears on the LEFT side of the screen, leaving room for the
      // info text block on the right.
      const costumeT = (t - 0.30) / 0.70;
      const costumeIdx = Math.min(3, Math.floor(costumeT * 4));
      const angle = COSTUME_ANGLES[costumeIdx];
      const cPos = angleToPos(angle, COSTUME_RING_RADIUS, 1.2);
      // "Right" direction = perpendicular to costume angle (clockwise)
      const rightAngle = angle - Math.PI / 2;
      const offsetX = Math.cos(rightAngle) * 2.5;
      const offsetZ = Math.sin(rightAngle) * 2.5;
      targetPos = new THREE.Vector3(cPos[0] + offsetX, 1.2, cPos[2] + offsetZ);
    }

    lookTarget.current.lerp(targetPos, 0.06);
    camera.position.lerp(pos, 0.1);
    camera.lookAt(lookTarget.current);

    // FOV: wider during approach (20-25° angle), narrower for costume close-up
    const targetFov = t < 0.30 ? 45 : 30;
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
