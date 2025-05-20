declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  
  interface PWAOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: any[];
    buildExcludes?: Array<string | RegExp>;
    scope?: string;
    sw?: string;
  }
  
  export default function withPWA(options?: PWAOptions): (nextConfig?: NextConfig) => NextConfig;
}

declare module 'next-pwa/cache' {
  const runtimeCaching: any[];
  export default runtimeCaching;
}