import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

// Next.js 15 compatible runtime config

// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  images: {
    remotePatterns: [
      { hostname: "firebasestorage.googleapis.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "img.clerk.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Transpile specific packages for Edge runtime compatibility
  transpilePackages: ['scheduler', '@clerk/nextjs', '@clerk/clerk-react', '@clerk/shared'],
  experimental: {
    // Improved scheduler for edge runtime
    optimizePackageImports: ['@clerk/nextjs', 'react-icons'],
  },
  // External packages for server components (new config in Next 15)
  serverExternalPackages: ["@clerk/backend", "firebase-admin"],
};

// Apply PWA config
const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
  disable: process.env.NODE_ENV === "development",
})(config);

export default nextConfig;
