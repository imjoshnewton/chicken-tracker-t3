// @ts-check

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: "firebasestorage.googleapis.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "img.clerk.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Transpile specific packages for Edge runtime compatibility
  transpilePackages: ['scheduler', '@clerk/nextjs', '@clerk/clerk-react', '@clerk/shared', '@flocknerd/api', '@flocknerd/shared'],
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'react-icons'],
  },
  // External packages for server components (new config in Next 15)
  serverExternalPackages: ["@clerk/backend", "firebase-admin"],
};

export default config;
