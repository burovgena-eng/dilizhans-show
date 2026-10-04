"use client";

import { useRef, useSyncExternalStore, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/* ============================================================================
 * 3D Hero Particle System — Three.js / R3F
 *
 * 6,000 gold star particles in real 3D space (z-depth).
 * Uses HIGH-RESOLUTION STAR SPRITE TEXTURE (1024×1024 PNG).
 * Atmospheric perspective + cursor proximity illumination + Bloom.
 * ============================================================================ */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uMouseActive;

  attribute float aSize;
  attribute float aHue;
  attribute float aPhase;

  varying float vAlpha;
  varying float vHue;
  varying float vCursorProximity;
  varying float vDepth;

  void main() {
    vHue = aHue;

    float zFactor = (position.z + 400.0) / 800.0;
    float speed = mix(1.5, 0.2, zFactor);

    vec3 pos = position;
    pos.x += sin(position.y * 0.01 + uTime * speed + aPhase) * 15.0;
    pos.y += cos(position.x * 0.01 + uTime * speed + aPhase) * 15.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vDepth = -mvPosition.z;

    float dist = length(pos - uMouse);
    vCursorProximity = (1.0 - smoothstep(0.0, 250.0, dist)) * uMouseActive;

    float size = aSize * (1.0 + vCursorProximity * 3.0);
    gl_PointSize = max(0.5, size * (800.0 / vDepth));

    float depthAlpha = 1.0 - smoothstep(150.0, 650.0, vDepth);
    vAlpha = (0.2 + vCursorProximity * 0.8) * depthAlpha;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uStarTexture;

  varying float vAlpha;
  varying float vHue;
  varying float vCursorProximity;
  varying float vDepth;

  void main() {
    vec4 texColor = texture2D(uStarTexture, gl_PointCoord);
    if (texColor.r + texColor.g + texColor.b < 0.02) discard;

    float depthFactor = smoothstep(150.0, 650.0, vDepth);
    vec3 coolDeep = vec3(0.18, 0.14, 0.07);
    vec3 color = mix(texColor.rgb, coolDeep, depthFactor * 0.8);
    color *= mix(0.85, 1.15, vHue);
    color += vec3(0.2, 0.15, 0.08) * vCursorProximity;

    float texBrightness = max(texColor.r, max(texColor.g, texColor.b));
    float alpha = vAlpha * texBrightness * 1.5;
    gl_FragColor = vec4(color, alpha);
  }
`;

const PARTICLE_COUNT = 6000;
const FIELD_W = 600;
const FIELD_H = 400;
const FIELD_D = 400;

function ParticleField() {
  const { camera, gl } = useThree();

  const lastMouseEvent = useRef<MouseEvent | null>(null);
  const lastMoveTime = useRef(0);
  const mouseActive = useRef(0);
  const mouseTarget = useRef(new THREE.Vector3(0, 0, 0));

  const raycaster = useRef(new THREE.Raycaster()).current;
  const ndc = useRef(new THREE.Vector2()).current;
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;

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
    const hues = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD_W * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD_H * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD_D * 2;
      sizes[i] = Math.random() * 4.0 + 1.5;
      hues[i] = Math.random();
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aHue", new THREE.BufferAttribute(hues, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometryRef.current = geo;
  }

  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  if (materialRef.current === null) {
    materialRef.current = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uMouseActive: { value: 0 },
        uStarTexture: { value: textureRef.current },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  const geometry = geometryRef.current;
  const material = materialRef.current;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      lastMouseEvent.current = e;
      lastMoveTime.current = Date.now();
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime * 0.5;

    const recent = Date.now() - lastMoveTime.current < 500;
    const targetActive = recent ? 1 : 0;
    mouseActive.current += (targetActive - mouseActive.current) * 0.04;

    if (lastMouseEvent.current && recent) {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.set(
        ((lastMouseEvent.current.clientX - rect.left) / rect.width) * 2 - 1,
        -((lastMouseEvent.current.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(plane, mouseTarget.current);
    }

    material.uniforms.uMouse.value.lerp(mouseTarget.current, 0.15);
    material.uniforms.uMouseActive.value = mouseActive.current;

    const targetCamX = (mouseTarget.current.x / FIELD_W) * 40;
    const targetCamY = (mouseTarget.current.y / FIELD_H) * 25;
    // eslint-disable-next-line react-hooks/immutability
    camera.position.x += (targetCamX - camera.position.x) * 0.025;
    camera.position.y += (targetCamY - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);
  });

  return <points geometry={geometry} material={material} />;
}

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

export function HeroParticles3D() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!mounted) return null;
  return (
    <Canvas
      camera={{ position: [0, 0, 500], fov: 60 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 2]}
    >
      <ParticleField />
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.3} luminanceSmoothing={0.4} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
