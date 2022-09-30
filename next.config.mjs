import { env } from "./src/env/server.mjs";
import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default //{
defineNextConfig(
  withPWA({
    reactStrictMode: true,
    swcMinify: false,
    images: {
      domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
      formats: ["image/avif", "image/webp"],
    },
    pwa: {
      dest: "./public",
      register: true,
      skipWaiting: true,
      runtimeCaching,
      disable: process.env.NODE_ENV === "development",
    },
  })
);
