// Cosmic shaders for cinematic starfield, nebula, and star-glow.
// All GLSL — used by R3F <shaderMaterial>.

/* ============================================================================
 * 1. NEBULA — large volumetric gas-cloud sphere with fbm noise.
 *    Gold + emerald + deep-purple palette to match the boutique theme.
 * ============================================================================ */

export const nebulaVertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    vWorldPos = position;
    gl_Position = projectionMatrix * mv;
  }
`;

export const nebulaFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  uniform float uIntensity;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  // hash + value noise + fbm
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = vWorldPos * 0.02 + vec3(0.0, 0.0, uTime * 0.015);
    float n1 = fbm(p);
    float n2 = fbm(p * 2.5 + vec3(uTime * 0.01, 0.0, 0.0));
    float clouds = pow(n1 * 1.4, 1.5) * (0.6 + n2 * 0.5);

    // Fresnel: stronger at edges
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);

    // Color mixing — gold at center, emerald at mid, deep-purple at edges
    vec3 col = mix(uColorB, uColorA, clouds);
    col = mix(col, uColorC, fres * 0.6);
    col *= (0.4 + uIntensity * 0.8);

    float alpha = clouds * uOpacity * (0.3 + fres * 0.7);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ============================================================================
 * 2. STARFIELD — 50k instanced points with 3-layer depth + parallax.
 *    Uses additive blending + procedural star sprite (no texture needed).
 * ============================================================================ */

export const starfieldVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uCameraZ;
  uniform float uSpeed;         // global speed multiplier (for hyperspace)
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aPhase;
  attribute float aLayer;      // 0..1 (0 = far, 1 = near)
  attribute vec3 aColorTint;

  varying float vAlpha;
  varying vec3 vTint;
  varying float vSize;

  void main() {
    vTint = aColorTint;

    // Slight per-particle wobble
    vec3 pos = position;
    pos.x += sin(uTime * 0.3 + aPhase) * 2.0;
    pos.y += cos(uTime * 0.25 + aPhase * 1.3) * 2.0;

    // Parallax: deeper stars move slower (smaller z displacement per unit time)
    float layerSpeed = mix(0.3, 1.5, aLayer);
    pos.z += uTime * 8.0 * layerSpeed * uSpeed;

    // Wrap Z so we get infinite stars
    float range = 600.0;
    pos.z = mod(pos.z + 300.0, range) - 300.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float depth = -mv.z;
    vSize = aSize * (1.0 + (1.0 - layerSpeed) * 0.4);

    gl_PointSize = max(1.0, vSize * uPixelRatio * (300.0 / depth));

    float depthFade = 1.0 - smoothstep(50.0, 600.0, depth);
    vAlpha = depthFade * (0.45 + 0.55 * aLayer);

    // Twinkle
    vAlpha *= 0.65 + 0.35 * sin(uTime * 1.5 + aPhase * 5.0);
  }
`;

export const starfieldFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vTint;
  varying float vSize;

  void main() {
    // Procedural star sprite: soft core + cross flare
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    // Soft round
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 2.0);

    // Cross flare (longer in x and y)
    float crossX = smoothstep(0.05, 0.0, abs(uv.y)) * smoothstep(0.5, 0.0, abs(uv.x));
    float crossY = smoothstep(0.05, 0.0, abs(uv.x)) * smoothstep(0.5, 0.0, abs(uv.y));
    float flare = (crossX + crossY) * 0.4;

    float b = core + flare;
    if (b < 0.02) discard;

    vec3 col = mix(vec3(1.0), vTint, 0.5) * b;
    gl_FragColor = vec4(col, b * vAlpha);
  }
`;

/* ============================================================================
 * 3b. STREAKS — true line-segment streaks during hyperspace.
 *     Each streak = 2 vertices (head + tail along camera-Z).
 *     Additive blending, length grows with speed.
 * ============================================================================ */

export const lineStreakVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  attribute float aPhase;
  attribute float aLayer;       // 0..1 (depth layer)
  attribute vec3 aColorTint;
  varying float vAlpha;
  varying vec3 vTint;
  void main() {
    vTint = aColorTint;
    // position.z already encodes tail offset (head=0, tail=+stretch)
    vec3 pos = position;
    // Wobble the head
    pos.x += sin(uTime * 0.3 + aPhase) * 1.5;
    pos.y += cos(uTime * 0.25 + aPhase * 1.3) * 1.5;

    // Forward motion: travel through z based on layer + speed
    float layerSpeed = mix(0.4, 1.6, aLayer);
    float zShift = uTime * 12.0 * layerSpeed * (0.4 + uSpeed * 2.5);
    pos.z += zShift;
    // Wrap Z
    pos.z = mod(pos.z + 300.0, 600.0) - 300.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float depth = -mv.z;
    float depthFade = 1.0 - smoothstep(50.0, 500.0, depth);
    vAlpha = depthFade * (0.3 + 0.7 * aLayer) * (0.3 + uSpeed * 1.5);
  }
`;

export const lineStreakFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vTint;
  void main() {
    gl_FragColor = vec4(vTint, vAlpha);
  }
`;

/* ============================================================================
 * 4. FINAL STAR — destination star with fresnel + corona.
 *    Big sphere with fresnel rim light + bright inner core.
 * ============================================================================ */

export const starVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    vWorldPos = position;
    gl_Position = projectionMatrix * mv;
  }
`;

export const starFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform vec3 uRimColor;
  uniform float uGlow;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  // simple noise for surface variation
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Fresnel
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);

    // Surface texture: animated fbm
    float n = fbm(vWorldPos * 1.2 + vec3(uTime * 0.2, uTime * 0.15, 0.0));
    n = pow(n, 1.8);

    // Center-facing glow (backlit)
    float facing = max(dot(vNormal, vViewDir), 0.0);

    vec3 col = mix(uCoreColor * 0.6, uCoreColor, n);
    col = mix(col, uRimColor, fres);
    col += uRimColor * fres * uGlow;

    // Solar flare-like brightening
    float hotspot = pow(facing, 2.0) * (0.6 + n * 0.4);
    col += uCoreColor * hotspot * 0.5;

    float alpha = 1.0;
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ============================================================================
 * 5. CAMERA PATH — CatmullRomCurve3 control points.
 *    Journey from wide starfield → nebula → accelerate → final star.
 * ============================================================================ */

export const CAMERA_POINTS: [number, number, number][] = [
  [0, 0, 250],        // Start: distant, looking at starfield
  [5, 8, 180],        // Drift right, slow approach
  [-15, -5, 80],      // S-curve left
  [25, 15, -20],      // Through nebula (offset path)
  [-30, -10, -120],   // Out of nebula
  [10, 5, -240],      // Lock onto final star
  [0, 0, -290],       // Approach star
];

/* ============================================================================
 * 6. STAR POSITIONS — small glowing orbs scattered in space.
 * ============================================================================ */

export const AMBIENT_STARS: { pos: [number, number, number]; size: number; color: string }[] = [
  { pos: [-60, 35, -50], size: 4, color: "#FFE6A8" },
  { pos: [80, -20, -100], size: 6, color: "#E8C560" },
  { pos: [-100, -40, -150], size: 5, color: "#C8961F" },
  { pos: [40, 60, -200], size: 7, color: "#FFE6A8" },
  { pos: [-50, -70, -260], size: 5, color: "#D4AF37" },
  { pos: [120, 25, -180], size: 4, color: "#1A5A42" },
];

export const FINAL_STAR = { pos: [0, 0, -320] as [number, number, number], color: "#FFD56B" };
