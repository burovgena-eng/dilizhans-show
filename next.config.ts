import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow preview/chat origins to load Next.js dev assets (JS chunks,
  // CSS, HMR). Without this, the preview iframe can't load _next/static/*
  // resources and the page renders as static HTML with no JS — which
  // means scroll-driven animations (video curtain, 3D cosmos) don't run.
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.z.ai",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
