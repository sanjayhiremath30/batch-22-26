// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent bundling of Node.js built‑ins that MongoDB tries to require on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        // optionally other built‑ins
      };
    }
    return config;
  },
  // Ensure environment variables are exposed to the client (NEXT_PUBLIC_…) only
  env: {
    NEXT_PUBLIC_SECRET_KEY: process.env.SECRET_KEY,
    DB_NAME: process.env.DB_NAME,
    MONGODB_URI: process.env.MONGODB_URI,
  },
  turbopack: {},
  devIndicators: false,
};
export default nextConfig;
