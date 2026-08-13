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
};

export default nextConfig;
