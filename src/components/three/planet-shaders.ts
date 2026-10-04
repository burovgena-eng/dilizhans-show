// Realistic planet shaders — surface + atmosphere + clouds.
// All GLSL — used by R3F <shaderMaterial>.

/* ============================================================================
 * PLANET SURFACE — fbm-based continents, oceans, mountains + cloud layer +
 * star lighting + atmosphere fresnel.
 * ============================================================================ */

export const planetVertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vLocalPos = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const planetFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorOcean;       // deep ocean
  uniform vec3 uColorShore;       // shallow water / coast
  uniform vec3 uColorLand;       // vegetation / land
  uniform vec3 uColorMountain;   // peaks / rock
  uniform vec3 uColorIce;        // polar caps
  uniform vec3 uAtmosphere;      // atmosphere tint
  uniform vec3 uStarDir;         // normalized direction to system star
  uniform float uCloudOpacity;
  uniform float uSeed;           // randomization per planet

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  // hash + value noise + fbm
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1 + uSeed);
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
    for (int i = 0; i < 6; i++) {
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = vLocalPos * 1.8 + vec3(uSeed * 13.0);

    // Continent shape
    float continents = fbm(p);
    // Surface detail
    float detail = fbm(p * 4.0 + vec3(uSeed * 7.0));
    float h = continents * 0.65 + detail * 0.35;

    // Latitude for ice caps
    float lat = abs(vLocalPos.y);
    float iceCap = smoothstep(0.78, 0.95, lat);

    vec3 col;
    if (h < 0.42) {
      col = mix(uColorOcean, uColorShore, smoothstep(0.32, 0.42, h));
    } else if (h < 0.58) {
      col = mix(uColorShore, uColorLand, smoothstep(0.42, 0.58, h));
    } else {
      col = mix(uColorLand, uColorMountain, smoothstep(0.58, 0.85, h));
    }
    // Ice caps override
    col = mix(col, uColorIce, iceCap);

    // Cloud layer — separate fbm scrolling
    vec3 cloudP = p * 1.4 + vec3(uTime * 0.015, uTime * 0.005, 0.0);
    float clouds = fbm(cloudP);
    clouds = smoothstep(0.48, 0.78, clouds);
    col = mix(col, vec3(0.95, 0.96, 0.98), clouds * uCloudOpacity);

    // Star lighting — simple lambert + ambient
    float light = max(dot(vNormal, uStarDir), 0.0);
    float ambient = 0.08;
    col *= (ambient + light * 1.05);

    // Specular on water (low height + facing star)
    float waterMask = 1.0 - smoothstep(0.40, 0.46, h);
    vec3 reflDir = reflect(-uStarDir, vNormal);
    float spec = pow(max(dot(reflDir, vViewDir), 0.0), 28.0) * waterMask * light;
    col += vec3(1.0, 0.95, 0.85) * spec * 0.4;

    // Atmosphere fresnel — only on lit side
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
    col += uAtmosphere * fres * (light * 0.7 + 0.15);

    // Night side — emit slight warm glow (city lights hint)
    float night = 1.0 - light;
    float cityGlow = smoothstep(0.55, 0.62, h) * smoothstep(0.4, 0.6, fbm(p * 8.0));
    col += vec3(1.0, 0.7, 0.3) * night * cityGlow * 0.06;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ============================================================================
 * GAS GIANT — banded atmosphere (Jupiter/Saturn-style) with swirling storms.
 * ============================================================================ */

export const gasGiantVertexShader = planetVertexShader;

export const gasGiantFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uAtmosphere;
  uniform vec3 uStarDir;
  uniform float uSeed;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1 + uSeed);
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
    // Latitude-based banding
    float lat = vLocalPos.y;
    float bandShift = fbm(vec3(lat * 3.5, uTime * 0.04 + uSeed, uSeed)) * 0.5;
    float bands = sin((lat + bandShift) * 14.0) * 0.5 + 0.5;

    // Storm swirl
    vec3 stormP = vLocalPos * 2.5 + vec3(uTime * 0.02, 0.0, uSeed);
    float storm = fbm(stormP);

    vec3 col = mix(uColorA, uColorB, bands);
    col = mix(col, uColorC, smoothstep(0.55, 0.75, storm));
    col = mix(col, uColorB, smoothstep(0.65, 0.85, bands) * 0.5);

    // Lighting
    float light = max(dot(vNormal, uStarDir), 0.0);
    float ambient = 0.06;
    col *= (ambient + light * 1.1);

    // Atmosphere
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.5);
    col += uAtmosphere * fres * (light * 0.6 + 0.2);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ============================================================================
 * STAR (SUN) — hot plasma surface with fbm + corona fresnel.
 * ============================================================================ */

export const starSurfaceVertexShader = planetVertexShader;

export const starSurfaceFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform vec3 uHotColor;
  uniform vec3 uRimColor;
  uniform float uSeed;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1 + uSeed);
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
    vec3 p = vLocalPos * 3.0 + vec3(uTime * 0.05, uTime * 0.03, uSeed);
    float plasma = fbm(p);
    float plasma2 = fbm(p * 2.0 + vec3(uTime * 0.08));
    float h = plasma * 0.7 + plasma2 * 0.3;

    vec3 col = mix(uCoreColor, uHotColor, smoothstep(0.4, 0.75, h));
    col += uHotColor * smoothstep(0.75, 0.9, h) * 0.6;

    // Fresnel corona
    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.0);
    col = mix(col, uRimColor, fres * 0.7);
    col += uRimColor * fres * 0.5;

    // Always full bright — emissive body
    col *= 1.4;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ============================================================================
 * ATMOSPHERE GLOW SHELL — large transparent sphere around a planet for the
 * halo effect. Rendered as back-side additive with fresnel falloff.
 * ============================================================================ */

export const atmosphereVertexShader = planetVertexShader;

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform vec3 uStarDir;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fres = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
    float light = max(dot(vNormal, uStarDir), 0.0);
    float lit = smoothstep(0.0, 0.4, light);
    vec3 col = uColor * (lit * 0.8 + 0.2);
    gl_FragColor = vec4(col, fres * uIntensity * (lit * 0.8 + 0.2));
  }
`;

/* ============================================================================
 * RING SYSTEM — Saturn-style rings using a flat annulus disk.
 * Uses polar coords for concentric banding.
 * ============================================================================ */

export const ringVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vWorldPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ringFragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    // Distance from ring center (in local space)
    float r = length(vWorldPos.xy);
    // Normalized 0..1 from inner to outer edge
    float t = clamp((r - 1.3) / (3.0 - 1.3), 0.0, 1.0);

    // Banding via stacked sin + noise
    float bands = 0.0;
    float amp = 0.5;
    float freq = 30.0;
    for (int i = 0; i < 4; i++) {
      bands += amp * sin(t * freq + uSeed * 6.28);
      freq *= 2.1;
      amp *= 0.5;
    }
    bands = bands * 0.5 + 0.5;

    // Gaps (Cassini-style)
    float gap1 = smoothstep(0.001, 0.01, abs(t - 0.45));
    float gap2 = smoothstep(0.001, 0.008, abs(t - 0.72));
    float alpha = bands * gap1 * gap2;

    // Edge fade
    alpha *= smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.95, 1.0, t));

    vec3 col = mix(uColorA, uColorB, bands);
    gl_FragColor = vec4(col, alpha * 0.85);
  }
`;

/* ============================================================================
 * REALISTIC STARFIELD — sharper, anti-aliased stars with depth-based
 * glow + soft twinkle (very subtle, no flicker).
 * ============================================================================ */

export const starFieldVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  attribute float aLayer;
  attribute vec3 aColorTint;
  varying float vAlpha;
  varying vec3 vTint;

  void main() {
    vTint = aColorTint;
    vec3 pos = position;

    // Very subtle drift, not fast (avoid flicker)
    pos.x += sin(uTime * 0.05 + aPhase) * 0.5;
    pos.y += cos(uTime * 0.04 + aPhase * 1.2) * 0.5;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;

    // Star size — sharper, smaller, with depth attenuation
    float sizeFactor = mix(1.6, 0.7, aLayer);
    gl_PointSize = max(1.0, aSize * uPixelRatio * (350.0 / depth) * sizeFactor);

    float depthFade = 1.0 - smoothstep(100.0, 800.0, depth);
    vAlpha = depthFade * (0.55 + 0.45 * aLayer);

    // Very subtle twinkle (low amplitude, low frequency — no flicker)
    float tw = 0.85 + 0.15 * sin(uTime * 0.6 + aPhase * 3.0);
    vAlpha *= tw;
  }
`;

export const starFieldFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vTint;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    // Soft round disc with glow halo
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 2.5);
    float halo = smoothstep(0.5, 0.15, d) * 0.4;
    float b = core + halo;
    if (b < 0.02) discard;

    vec3 col = mix(vec3(1.0), vTint, 0.4) * b;
    gl_FragColor = vec4(col, b * vAlpha);
  }
`;

/* ============================================================================
 * NEBULA — volumetric gas-cloud sphere with fbm noise (kept from before).
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
    for (int i = 0; i < 6; i++) {
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = vWorldPos * 0.018 + vec3(0.0, 0.0, uTime * 0.012);
    float n1 = fbm(p);
    float n2 = fbm(p * 2.5 + vec3(uTime * 0.008, 0.0, 0.0));
    float clouds = pow(n1 * 1.4, 1.6) * (0.6 + n2 * 0.5);

    float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);

    vec3 col = mix(uColorB, uColorA, clouds);
    col = mix(col, uColorC, fres * 0.6);
    col *= (0.4 + uIntensity * 0.9);

    float alpha = clouds * uOpacity * (0.3 + fres * 0.7);
    gl_FragColor = vec4(col, alpha);
  }
`;
