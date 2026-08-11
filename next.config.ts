import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger's GitHub deployment runs the Next.js server. Keep one runtime
  // output so every deployment includes the exact server/chunk manifest pair.
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    useTypeScriptCli: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'assetpraba.prvtech.site' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Hostinger's CDN previously kept ISR HTML stale for almost a year while
  // the deployment had already replaced its hashed chunks. Keep document
  // Keep documents revalidating; hashed assets remain cacheable by Next.
  async headers() {
    return [{
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      headers: [
        { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
      ],
    }];
  },
};

export default nextConfig;
