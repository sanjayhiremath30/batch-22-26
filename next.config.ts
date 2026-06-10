// src/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev origins (your local network IP) for HMR and SSE during development
  allowedDevOrigins: ["192.168.0.109"],
  // Add any other Next.js config options here
};

export default nextConfig;
