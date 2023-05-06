import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

const pwa = withPWA({
  dest: "./public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
  disable: process.env.NODE_ENV === "development",
});
// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    appDir: true,
    // serverComponentsExternalPackages: ["prisma"],
  },
};

export default pwa(config);
