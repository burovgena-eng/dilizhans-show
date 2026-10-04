"use client";

import { useRef, useSyncExternalStore, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, SMAA, ToneMapping } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import * as THREE from "three";

/* ============================================================================
 * TheaterScene3D — circular theater stage with 4 spotlights and 4 costume
 * pedestals. Camera flies in (40-45° angle), spotlights ignite one-by-one,
 * then camera approaches each costume (costume left, info block right).
 *
 * All costume models are placeholders (capsule + pedestal) ready to be
 * swapped with GLTF models later.
 *
 * Scroll-driven timeline (passed via scrollRef 0..1):
 *   0.00-0.10  Camera approaches the stage from above (angle ~42°)
 *   0.10-0.25  4 spotlights ignite sequentially (warm gold)
 *   0.25-0.45  Camera approaches costume #1 (costume left, info right)
 *   0.45-0.65  Camera moves to costume #2
 *   0.65-0.85  Camera moves to costume #3
 *   0.85-1.00  Camera moves to costume #4
 * ============================================================================ */

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

// ---------------- Constants ----------------
const STAGE_RADIUS = 10;
const STAGE_HEIGHT = 0.4;
const COSTUME_COUNT = 4;
const COSTUME_RING_RADIUS = 7;
const SPOTLIGHT_HEIGHT = 14;
const SPOTLIGHT_RING_RADIUS = 9;

const COSTUME_ANGLES = [
  0,                    // front (0°)
  Math.PI / 2,          // right (90°)
  Math.PI,              // back (180°)
  -Math.PI / 2,         // left (270°)
];

function angleToPos(angle: number, radius: number, y: number = 0): [number, number, number] {
  return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
}

// Camera path: approach → spotlight ignition → 4 costume views
// For each costume view, camera is offset to the right so costume appears left
const CAMERA_PATH_POINTS: [number, number, number][] = [
  [0, 18, 22],         // high, far back — approach angle ~42°
  [0, 14, 16],         // descend
  [0, 11, 12],         // approach stage edge
  [0, 10, 10],         // overview — spotlights ignite
  [6, 4, 8],           // → costume 1 (front): camera right-front
  [5, 3, 7],           // costume 1 final: left screen, info right
  [10, 4, 2],          // → costume 2 (right)
  [9, 3, 1],           // costume 2 final
  [4, 4, -6],          // → costume 3 (back)
  [3, 3, -7],          // costume 3 final
  [-4, 4, -2],         // → costume 4 (left)
  [-5, 3, -1],          // costume 4 final
];

// ---------------- Components ----------------

function StagePlatform() {
  return (
    <group>
      {/* Main stage disc */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[STAGE_RADIUS, STAGE_RADIUS, STAGE_HEIGHT, 96]} />
        <meshStandardMaterial color="#3A2418" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Gold trim ring */}
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
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function CostumePlaceholder({ index, scrollRef }: {
  index: number;
  scrollRef: React.MutableRefObject<number>;
}) {
  const angle = COSTUME_ANGLES[index];
  const pos = angleToPos(angle, COSTUME_RING_RADIUS, STAGE_HEIGHT / 2);
  const groupRef = useRef<THREE.Group>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const spotTargetRef = useRef<THREE.Object3D>(null);

  const igniteStart = 0.10 + index * 0.04;
  const igniteEnd = igniteStart + 0.05;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
    if (spotRef.current) {
      const t = scrollRef.current;
      const intensity = THREE.MathUtils.smoothstep(t, igniteStart, igniteEnd);
      spotRef.current.intensity = intensity * 8;
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
      {/* Pedestal gold trim */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.04, 12, 48]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Costume placeholder — capsule body + sphere head */}
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

      {/* Spotlight from above, angled toward this costume */}
      <spotLight
        ref={spotRef}
        position={spotPos}
        angle={0.4}
        penumbra={0.3}
        intensity={0}
        color="#FFE8B0"
        distance={25}
        decay={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <primitive
        ref={spotTargetRef}
        object={new THREE.Object3D()}
        position={[pos[0], STAGE_HEIGHT, pos[2]]}
      />
    </group>
  );
}

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

    let targetPos: THREE.Vector3;
    if (t < 0.25) {
      targetPos = new THREE.Vector3(0, 0, 0);
    } else {
      const costumeT = (t - 0.25) / 0.75;
      const costumeIdx = Math.min(3, Math.floor(costumeT * 4));
      const angle = COSTUME_ANGLES[costumeIdx];
      const cPos = angleToPos(angle, COSTUME_RING_RADIUS, 1);
      targetPos = new THREE.Vector3(cPos[0], 1, cPos[2]);
    }

    lookTarget.current.lerp(targetPos, 0.05);
    camera.position.lerp(pos, 0.12);
    camera.lookAt(lookTarget.current);

    const targetFov = t < 0.25 ? 50 : 35;
    if (camera instanceof THREE.PerspectiveCamera) {
      // eslint-disable-next-line react-hooks/immutability
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function AmbientLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#3A2A18" />
      <hemisphereLight args={["#5A3A20", "#1A0F08", 0.2]} />
    </>
  );
}

function StageBackdrop() {
  return (
    <mesh position={[0, 8, -15]}>
      <planeGeometry args={[60, 25]} />
      <meshStandardMaterial
        color="#0A0604"
        metalness={0.3}
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

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
          intensity={1.0}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.3}
          mipmapBlur
          kernelSize={KernelSize.LARGE}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
        <SMAA />
        <ToneMapping />
      </EffectComposer>
    </>
  );
}

export function TheaterScene3D({ scrollRef }: {
  scrollRef: React.MutableRefObject<number>;
}) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 18, 22], fov: 50, near: 0.1, far: 200 }}
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
