"use client";

import { useRef, useSyncExternalStore, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ============================================================================
 * 3D Logo — original stylized "D" as bas-relief with spotlight
 *
 * Uses displacementMap + normalMap + alphaMap (all from original PNG).
 * SpotLight from front-top, follows cursor MIRRORED, angle clamped.
 * Proximity-based brightness: closer cursor → brighter spotlight.
 * ============================================================================ */

function Logo3DMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const spotTargetRef = useRef<THREE.Object3D>(null);
  const { camera, gl } = useThree();

  const lastMouse = useRef({ x: 0, y: 0, time: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  const [textures] = useState(() => {
    const loader = new THREE.TextureLoader();
    const heightMap = loader.load("/images/logo-heightmap-hires.png");
    const normalMap = loader.load("/images/logo-normalmap.png");
    const alphaMap = loader.load("/images/logo-alphamap.png");
    const roughMap = loader.load("/images/logo-roughmap.png");
    [heightMap, normalMap, alphaMap, roughMap].forEach(t => {
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
    });
    return { heightMap, normalMap, alphaMap, roughMap };
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      lastMouse.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.35) * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
    }

    const rect = gl.domElement.getBoundingClientRect();
    const ndcX = (lastMouse.current.x - rect.left) / rect.width * 2 - 1;
    const ndcY = -((lastMouse.current.y - rect.top) / rect.height) * 2 + 1;

    smoothMouse.current.x += (ndcX - smoothMouse.current.x) * 0.08;
    smoothMouse.current.y += (ndcY - smoothMouse.current.y) * 0.08;

    const maxOffset = 1.5;
    let targetX = -smoothMouse.current.x * 1.0;
    let targetY = smoothMouse.current.y * 0.6;
    targetX = Math.max(-maxOffset, Math.min(maxOffset, targetX));
    targetY = Math.max(-maxOffset * 0.5, Math.min(maxOffset * 0.5, targetY));

    const cursorDist = Math.sqrt(smoothMouse.current.x ** 2 + smoothMouse.current.y ** 2);
    const proximity = Math.max(0, 1.0 - cursorDist);
    // Higher base intensity + larger boost range — logo stays clearly visible even without cursor
    const MIN_INTENSITY = 24;
    const MAX_INTENSITY = 60;
    const spotIntensity = MIN_INTENSITY + proximity * (MAX_INTENSITY - MIN_INTENSITY);

    if (spotRef.current) {
      spotRef.current.position.set(targetX * 0.6, 2.8, 3.2);
      spotRef.current.intensity = spotIntensity;
    }
    if (spotTargetRef.current) {
      spotTargetRef.current.position.set(targetX, targetY, 0);
      spotTargetRef.current.updateMatrixWorld();
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 3, 200, 200]} />
        <meshStandardMaterial
          color="#FFD56B"
          metalness={0.55}
          roughness={0.32}
          roughnessMap={textures.roughMap}
          normalMap={textures.normalMap}
          normalScale={new THREE.Vector2(3.0, 3.0)}
          displacementMap={textures.heightMap}
          displacementScale={0.45}
          alphaMap={textures.alphaMap}
          transparent
          side={THREE.DoubleSide}
          emissive={"#C8961F"}
          emissiveIntensity={0.55}
        />
      </mesh>

      {/* Key spotlight — warm, follows cursor */}
      <spotLight
        ref={spotRef}
        position={[0, 2.8, 3.2]}
        angle={0.5}
        penumbra={0.4}
        intensity={30}
        color="#FFF1C8"
        distance={14}
        decay={0.8}
      />
      <primitive ref={spotTargetRef} object={new THREE.Object3D()} position={[0, 0, 0]} />
      <primitive
        object={(() => { const o = new THREE.Object3D(); o.position.set(0,0,0); return o; })()}
        ref={(obj: THREE.Object3D | null) => { if (obj && spotRef.current) spotRef.current.target = obj; }}
      />

      {/* Fill lights — guarantee logo is always well-lit, even before cursor moves */}
      <ambientLight intensity={0.7} color="#FFF4D6" />
      <hemisphereLight args={["#FFE9A8", "#3A2A14", 0.6]} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} color="#FFE8B0" />
    </>
  );
}

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

export function Logo3D() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!mounted) return null;
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: 56, height: 56, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
      dpr={[1, 2]}
    >
      <Logo3DMesh />
    </Canvas>
  );
}
