import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel uses the normal Next.js runtime. Set NEXT_OUTPUT=export only for
  // a deliberately static Hostinger build; the CMS should not depend on a
  // separately served `out/` directory in the Vercel deployment.
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  trailingSlash: true,
  experimental: {
    useTypeScriptCli: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Hostinger static exports do not run the /_next/image optimizer route.
    // Keep the optimized loader for Node deployments, but emit direct source
    // URLs for the static build so remote CMS images remain loadable.
    unoptimized: process.env.NEXT_OUTPUT === 'export',
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
